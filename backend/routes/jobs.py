from fastapi import APIRouter, HTTPException, status, Depends
from database import get_supabase_admin
from supabase import Client
from models.user import TokenData
from utils.security import get_current_active_user
from typing import Dict, Any, List
import json
import os

router = APIRouter(prefix="/jobs", tags=["Jobs"])

# Path to jobs.json file
JOBS_FILE_PATH = os.path.join(os.path.dirname(__file__), "..", "jobs", "jobs.json")


def load_jobs():
    """Load jobs from jobs.json file"""
    try:
        with open(JOBS_FILE_PATH, 'r', encoding='utf-8') as f:
            jobs = json.load(f)
        return jobs
    except FileNotFoundError:
        print(f"Jobs file not found at: {JOBS_FILE_PATH}")
        return []
    except json.JSONDecodeError as e:
        print(f"Error decoding jobs JSON: {e}")
        return []


def calculate_match_score(user_skills: List[str], job_required_skills: List[str], job_preferred_skills: List[str]) -> tuple:
    """
    Calculate how well user skills match job requirements
    Returns: (match_score, matched_skills_list)
    
    Algorithm:
    - Required skills are weighted at 70%
    - Preferred skills are weighted at 30%
    """
    user_skills_lower = [skill.lower().strip() for skill in user_skills]
    
    # Check required skills match
    required_matches = 0
    required_total = len(job_required_skills)
    matched_skills = []
    
    for req_skill in job_required_skills:
        req_skill_lower = req_skill.lower().strip()
        # Check for exact match or partial match
        if any(req_skill_lower in user_skill or user_skill in req_skill_lower 
               for user_skill in user_skills_lower):
            required_matches += 1
            matched_skills.append(req_skill)
    
    # Check preferred skills match
    preferred_matches = 0
    preferred_total = len(job_preferred_skills) if job_preferred_skills else 0
    
    for pref_skill in job_preferred_skills:
        pref_skill_lower = pref_skill.lower().strip()
        if any(pref_skill_lower in user_skill or user_skill in pref_skill_lower 
               for user_skill in user_skills_lower):
            preferred_matches += 1
            matched_skills.append(pref_skill)
    
    # Calculate weighted score
    required_score = (required_matches / required_total * 70) if required_total > 0 else 0
    preferred_score = (preferred_matches / preferred_total * 30) if preferred_total > 0 else 0
    
    total_score = required_score + preferred_score
    
    return round(total_score, 2), matched_skills


@router.get("/all", response_model=List[Dict[str, Any]])
async def get_all_jobs():
    """
    Get all available jobs from jobs.json
    """
    try:
        jobs = load_jobs()
        return jobs
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to load jobs: {str(e)}"
        )


@router.get("/recommended", response_model=Dict[str, Any])
async def get_recommended_jobs(
    current_user: TokenData = Depends(get_current_active_user),
    db: Client = Depends(get_supabase_admin)
):
    """
    Get job recommendations based on user's skills
    Only students can access this endpoint
    """
    try:
        # Check if user is a student
        if current_user.user_role != "Student":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only students can access job recommendations"
            )
        
        # Get user's skills from database
        user_skills_response = db.table("user_skills").select(
            "skill_id, proficiency_level, verification_status, skills_master(skill_name)"
        ).eq("user_id", str(current_user.user_id)).execute()
        
        if not user_skills_response.data:
            return {
                "message": "No skills found. Please add skills to your profile to get job recommendations.",
                "user_skills": [],
                "recommended_jobs": []
            }
        
        # Extract skill names
        user_skills = []
        for skill_data in user_skills_response.data:
            if skill_data.get("skills_master") and skill_data["skills_master"].get("skill_name"):
                user_skills.append(skill_data["skills_master"]["skill_name"])
        
        if not user_skills:
            return {
                "message": "No skills found. Please add skills to your profile.",
                "user_skills": [],
                "recommended_jobs": []
            }
        
        # Load all jobs
        all_jobs = load_jobs()
        
        if not all_jobs:
            return {
                "message": "No jobs available at the moment.",
                "user_skills": user_skills,
                "recommended_jobs": []
            }
        
        # Calculate match scores for each job
        job_matches = []
        
        for job in all_jobs:
            # Get job requirements
            requirements = job.get("requirements", {})
            required_skills = requirements.get("required_skills", [])
            preferred_skills = requirements.get("preferred_skills", [])
            
            # Calculate match score
            match_score, matched_skills = calculate_match_score(
                user_skills, 
                required_skills, 
                preferred_skills
            )
            
            # Only include jobs with at least some match
            if match_score > 0:
                job_with_match = job.copy()
                job_with_match["match_score"] = match_score
                job_with_match["matched_skills"] = matched_skills
                job_matches.append(job_with_match)
        
        # Sort by match score (descending)
        job_matches.sort(key=lambda x: x["match_score"], reverse=True)
        
        # Limit to top 20 recommendations
        top_recommendations = job_matches[:20]
        
        return {
            "message": f"Found {len(top_recommendations)} job recommendations matching your skills" if top_recommendations else "No matching jobs found. Try adding more skills to your profile.",
            "user_skills": user_skills,
            "recommended_jobs": top_recommendations,
            "total_jobs_available": len(all_jobs),
            "total_matches": len(job_matches)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error getting job recommendations: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get job recommendations: {str(e)}"
        )


@router.get("/{job_id}", response_model=Dict[str, Any])
async def get_job_by_id(
    job_id: str,
    current_user: TokenData = Depends(get_current_active_user)
):
    """
    Get a specific job by ID
    """
    try:
        jobs = load_jobs()
        
        for job in jobs:
            if job.get("id") == job_id:
                return job
        
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Job with ID '{job_id}' not found"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch job: {str(e)}"
        )
