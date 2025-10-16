from fastapi import APIRouter, HTTPException, status, Depends, UploadFile, File
from database import get_supabase_admin
from supabase import Client
from models.user import TokenData
from utils.security import get_current_active_user
from utils.face_verification import FaceVerification
from typing import Dict, Any
import uuid
from datetime import datetime

router = APIRouter(prefix="/profile", tags=["Profile"])

# Allowed image types
ALLOWED_EXTENSIONS = {'image/jpeg', 'image/jpg', 'image/png', 'image/webp'}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

@router.post("/upload-picture", response_model=Dict[str, Any])
async def upload_profile_picture(
    file: UploadFile = File(...),
    current_user: TokenData = Depends(get_current_active_user),
    db: Client = Depends(get_supabase_admin)
):
    """
    Upload profile picture to Supabase storage with face validation
    """
    try:
        # Validate file type
        if file.content_type not in ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid file type. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}"
            )
        
        # Read file contents
        file_contents = await file.read()
        
        # Validate file size
        if len(file_contents) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File size exceeds maximum limit of {MAX_FILE_SIZE / (1024*1024)}MB"
            )
        
        # Validate that image contains exactly one face
        validation_result = FaceVerification.validate_profile_picture(file_contents)
        
        if not validation_result["valid"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=validation_result["error"]
            )
        
        # Generate unique filename
        file_extension = file.filename.split('.')[-1] if '.' in file.filename else 'jpg'
        unique_filename = f"{current_user.user_id}/{uuid.uuid4()}.{file_extension}"
        
        # Upload to Supabase storage bucket
        try:
            upload_response = db.storage.from_("Profile Picture Storage").upload(
                path=unique_filename,
                file=file_contents,
                file_options={"content-type": file.content_type}
            )
        except Exception as storage_error:
            # If file already exists, remove and re-upload
            try:
                db.storage.from_("Profile Picture Storage").remove([unique_filename])
                upload_response = db.storage.from_("Profile Picture Storage").upload(
                    path=unique_filename,
                    file=file_contents,
                    file_options={"content-type": file.content_type}
                )
            except Exception as e:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Failed to upload file to storage: {str(e)}"
                )
        
        # Get public URL
        public_url = db.storage.from_("Profile Picture Storage").get_public_url(unique_filename)
        
        # Update user profile with picture URL
        update_data = {
            "profile_picture_url": public_url,
            "updated_at": datetime.utcnow().isoformat()
        }
        
        # Update based on user role
        if current_user.user_role == "Student":
            table_name = "student_profiles"
            id_column = "student_id"  # student_profiles uses student_id
        elif current_user.user_role == "Company":
            table_name = "company_profiles"
            id_column = "company_id"  # company_profiles uses company_id
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid user role"
            )
        
        update_response = db.table(table_name).update(update_data).eq(
            id_column, str(current_user.user_id)
        ).execute()
        
        if not update_response.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update profile with picture URL"
            )
        
        return {
            "message": "Profile picture uploaded successfully",
            "profile_picture_url": public_url,
            "filename": unique_filename,
            "face_validation": {
                "valid": validation_result["valid"],
                "face_count": validation_result["face_count"]
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error uploading profile picture: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload profile picture: {str(e)}"
        )


@router.get("/picture")
async def get_profile_picture(
    current_user: TokenData = Depends(get_current_active_user),
    db: Client = Depends(get_supabase_admin)
):
    """
    Get user's profile picture URL
    """
    try:
        # Determine table based on user role
        if current_user.user_role == "Student":
            table_name = "student_profiles"
            id_column = "student_id"
        elif current_user.user_role == "Company":
            table_name = "company_profiles"
            id_column = "company_id"
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid user role"
            )
        
        # Fetch profile
        response = db.table(table_name).select("profile_picture_url").eq(
            id_column, str(current_user.user_id)
        ).execute()
        
        if not response.data or len(response.data) == 0:
            return {
                "profile_picture_url": None,
                "message": "No profile picture uploaded"
            }
        
        return {
            "profile_picture_url": response.data[0].get("profile_picture_url"),
            "user_id": str(current_user.user_id)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch profile picture: {str(e)}"
        )


@router.delete("/picture")
async def delete_profile_picture(
    current_user: TokenData = Depends(get_current_active_user),
    db: Client = Depends(get_supabase_admin)
):
    """
    Delete user's profile picture from storage and database
    """
    try:
        # Determine table based on user role
        if current_user.user_role == "Student":
            table_name = "student_profiles"
            id_column = "student_id"
        elif current_user.user_role == "Company":
            table_name = "company_profiles"
            id_column = "company_id"
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid user role"
            )
        
        # Get current picture URL
        response = db.table(table_name).select("profile_picture_url").eq(
            id_column, str(current_user.user_id)
        ).execute()
        
        if not response.data or not response.data[0].get("profile_picture_url"):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No profile picture found"
            )
        
        picture_url = response.data[0]["profile_picture_url"]
        
        # Extract filename from URL
        # URL format: https://[project].supabase.co/storage/v1/object/public/Profile Picture Storage/[filename]
        filename = picture_url.split("Profile Picture Storage/")[-1] if "Profile Picture Storage" in picture_url else None
        
        if filename:
            try:
                # Delete from storage
                db.storage.from_("Profile Picture Storage").remove([filename])
            except Exception as storage_error:
                print(f"Warning: Failed to delete file from storage: {str(storage_error)}")
                # Continue even if storage deletion fails
        
        # Update database to remove URL
        update_response = db.table(table_name).update({
            "profile_picture_url": None,
            "updated_at": datetime.utcnow().isoformat()
        }).eq("user_id", str(current_user.user_id)).execute()
        
        return {
            "message": "Profile picture deleted successfully",
            "user_id": str(current_user.user_id)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete profile picture: {str(e)}"
        )
