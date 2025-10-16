from fastapi import APIRouter, HTTPException, status, Depends, UploadFile, File
from database import get_supabase_admin
from supabase import Client
from models.student import (
    ExtractedResumeData,
    ResumeParseResponse,
    StudentProfileUpdate,
    StudentProfileCompleteResponse,
    EducationHistoryItem,
    WorkExperienceItem
)
from models.user import TokenData
from utils.security import get_current_active_user
from utils.resume_extractor import resume_extractor
from typing import List, Dict, Any
import json
from uuid import UUID

router = APIRouter(prefix="/student", tags=["Student"])


@router.post("/upload-resume", response_model=ResumeParseResponse)
async def upload_and_parse_resume(
    file: UploadFile = File(...),
    current_user: TokenData = Depends(get_current_active_user),
    db: Client = Depends(get_supabase_admin)
):
    """
    Upload resume file, extract text, and parse using AI
    Returns structured data for user review
    """
    try:
        # Verify user is a student
        if current_user.user_role != "Student":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only students can upload resumes"
            )
        
        # Validate file type
        allowed_extensions = ['pdf', 'docx', 'txt']
        file_extension = file.filename.split('.')[-1].lower()
        if file_extension not in allowed_extensions:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid file type. Allowed types: {', '.join(allowed_extensions)}"
            )
        
        # Extract text from uploaded file
        extracted_text = await resume_extractor.extract_text_from_file(file)
        
        if not extracted_text or len(extracted_text.strip()) < 50:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Could not extract meaningful text from the resume. Please try a different file."
            )
        
        # Parse text using AI
        try:
            parsed_data = await resume_extractor.parse_resume_to_json(extracted_text)
            extracted_data = ExtractedResumeData(**parsed_data)
        except Exception as e:
            # If AI parsing fails, return empty structure for manual entry
            return ResumeParseResponse(
                success=False,
                message="AI parsing failed. Please enter your details manually.",
                extracted_data=None,
                missing_fields=["all"]
            )
        
        # Identify missing required fields
        missing_fields = []
        if not extracted_data.personal_info or not extracted_data.personal_info.first_name:
            missing_fields.append("first_name")
        if not extracted_data.personal_info or not extracted_data.personal_info.last_name:
            missing_fields.append("last_name")
        
        return ResumeParseResponse(
            success=True,
            message="Resume parsed successfully. Please review and fill in any missing details.",
            extracted_data=extracted_data,
            missing_fields=missing_fields
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process resume: {str(e)}"
        )


@router.put("/profile", response_model=dict)
async def update_student_profile(
    profile_data: StudentProfileUpdate,
    current_user: TokenData = Depends(get_current_active_user),
    db: Client = Depends(get_supabase_admin)
):
    """
    Update student profile with data from resume or manual entry
    """
    try:
        # Verify user is a student
        if current_user.user_role != "Student":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only students can update student profiles"
            )
        
        student_id = str(current_user.user_id)
        
        # Prepare update data (exclude None values)
        update_dict = profile_data.model_dump(exclude_none=True)
        
        if not update_dict:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No data provided for update"
            )
        
        # Update student profile
        profile_response = db.table("student_profiles").update(
            update_dict
        ).eq("student_id", student_id).execute()
        
        if not profile_response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Student profile not found"
            )
        
        # Calculate profile completion percentage
        profile = profile_response.data[0]
        completion_percentage = calculate_profile_completion(profile)
        
        # Update user's profile completion percentage
        db.table("users").update({
            "profile_completion_percentage": completion_percentage
        }).eq("user_id", student_id).execute()
        
        return {
            "message": "Profile updated successfully",
            "profile": profile,
            "profile_completion_percentage": completion_percentage
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update profile: {str(e)}"
        )


@router.post("/profile/education", response_model=dict)
async def add_education_history(
    education_items: List[EducationHistoryItem],
    current_user: TokenData = Depends(get_current_active_user),
    db: Client = Depends(get_supabase_admin)
):
    """
    Add education history entries for student
    """
    try:
        if current_user.user_role != "Student":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only students can add education history"
            )
        
        student_id = str(current_user.user_id)
        
        # Prepare education records for insertion
        education_records = []
        for item in education_items:
            record = item.model_dump()
            record["student_id"] = student_id
            
            # If currently enrolled, set end_date to NULL regardless of what was provided
            # This handles cases where future graduation dates are provided
            if record.get("currently_enrolled") is True:
                record["end_date"] = None
            
            education_records.append(record)
        
        # Insert education history
        response = db.table("education_history").insert(education_records).execute()
        
        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to add education history"
            )
        
        return {
            "message": f"Added {len(response.data)} education entries",
            "education_history": response.data
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to add education history: {str(e)}"
        )


@router.post("/profile/experience", response_model=dict)
async def add_work_experience(
    experience_items: List[WorkExperienceItem],
    current_user: TokenData = Depends(get_current_active_user),
    db: Client = Depends(get_supabase_admin)
):
    """
    Add work experience entries for student
    """
    try:
        if current_user.user_role != "Student":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only students can add work experience"
            )
        
        user_id = str(current_user.user_id)
        
        # Prepare experience records for insertion
        experience_records = []
        for item in experience_items:
            record = item.model_dump()
            record["user_id"] = user_id
            experience_records.append(record)
        
        # Insert work experience
        response = db.table("work_experience").insert(experience_records).execute()
        
        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to add work experience"
            )
        
        return {
            "message": f"Added {len(response.data)} experience entries",
            "work_experience": response.data
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to add work experience: {str(e)}"
        )


@router.get("/profile/complete", response_model=dict)
async def get_complete_profile(
    current_user: TokenData = Depends(get_current_active_user),
    db: Client = Depends(get_supabase_admin)
):
    """
    Get complete student profile including education and work experience
    """
    try:
        if current_user.user_role != "Student":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only students can access student profiles"
            )
        
        student_id = str(current_user.user_id)
        
        # Get student profile
        profile_response = db.table("student_profiles").select("*").eq(
            "student_id", student_id
        ).execute()
        
        if not profile_response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Student profile not found"
            )
        
        profile = profile_response.data[0]
        
        # Get education history
        education_response = db.table("education_history").select("*").eq(
            "student_id", student_id
        ).execute()
        
        # Get work experience
        experience_response = db.table("work_experience").select("*").eq(
            "user_id", student_id
        ).execute()
        
        # Get user info for completion percentage
        user_response = db.table("users").select("profile_completion_percentage").eq(
            "user_id", student_id
        ).execute()
        
        completion_percentage = user_response.data[0]["profile_completion_percentage"] if user_response.data else 0
        
        return {
            "profile": profile,
            "education_history": education_response.data or [],
            "work_experience": experience_response.data or [],
            "profile_completion_percentage": completion_percentage
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch profile: {str(e)}"
        )


def calculate_profile_completion(profile: Dict[str, Any]) -> int:
    """
    Calculate profile completion percentage based on filled fields
    """
    total_fields = 15
    filled_fields = 0
    
    # Required fields (weight: 1 each)
    if profile.get("first_name"):
        filled_fields += 1
    if profile.get("last_name"):
        filled_fields += 1
    if profile.get("phone_number"):
        filled_fields += 1
    if profile.get("date_of_birth"):
        filled_fields += 1
    if profile.get("gender"):
        filled_fields += 1
    if profile.get("bio"):
        filled_fields += 1
    if profile.get("current_education_level"):
        filled_fields += 1
    if profile.get("career_goals"):
        filled_fields += 1
    if profile.get("address"):
        filled_fields += 1
    
    # Optional but important fields
    if profile.get("resume_url"):
        filled_fields += 1
    if profile.get("linkedin_profile"):
        filled_fields += 1
    if profile.get("github_profile"):
        filled_fields += 1
    if profile.get("portfolio_url"):
        filled_fields += 1
    if profile.get("profile_picture_url"):
        filled_fields += 1
    if profile.get("preferred_industries"):
        filled_fields += 1
    
    percentage = int((filled_fields / total_fields) * 100)
    return min(percentage, 100)
