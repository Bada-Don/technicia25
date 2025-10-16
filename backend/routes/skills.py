from fastapi import APIRouter, HTTPException, status, Depends
from database import get_supabase_admin
from supabase import Client
from models.user import TokenData
from utils.security import get_current_active_user
from typing import List, Dict, Any
from pydantic import BaseModel, Field
from uuid import UUID

router = APIRouter(prefix="/skills", tags=["Skills"])

# Pydantic Models
class SkillCreate(BaseModel):
    skill_id: UUID
    proficiency_level: str = Field(..., pattern="^(Beginner|Intermediate|Advanced|Expert)$")
    years_of_experience: float | None = Field(None, ge=0, le=50)

class SkillResponse(BaseModel):
    user_skill_id: UUID
    skill_id: UUID
    skill_name: str
    proficiency_level: str
    verification_status: str
    years_of_experience: float | None
    claimed_at: str


@router.get("/list", response_model=List[Dict[str, Any]])
async def get_all_skills(db: Client = Depends(get_supabase_admin)):
    """
    Get all available skills from skills_master table
    """
    try:
        response = db.table("skills_master").select("*").order("skill_name").execute()
        return response.data or []
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch skills: {str(e)}"
        )


@router.get("/student/skills", response_model=List[Dict[str, Any]])
async def get_user_skills(
    current_user: TokenData = Depends(get_current_active_user),
    db: Client = Depends(get_supabase_admin)
):
    """
    Get all skills claimed by the current user with skill details
    """
    try:
        user_id = str(current_user.user_id)
        
        # Join user_skills with skills_master to get skill names
        response = db.table("user_skills").select(
            "user_skill_id, skill_id, proficiency_level, verification_status, "
            "years_of_experience, claimed_at, skills_master(skill_name, skill_category)"
        ).eq("user_id", user_id).execute()
        
        # Flatten the response to include skill_name at top level
        skills = []
        for item in response.data or []:
            skill_data = {
                "user_skill_id": item["user_skill_id"],
                "skill_id": item["skill_id"],
                "proficiency_level": item["proficiency_level"],
                "verification_status": item["verification_status"],
                "years_of_experience": item["years_of_experience"],
                "claimed_at": item["claimed_at"],
                "skill_name": item["skills_master"]["skill_name"] if item.get("skills_master") else None,
            }
            skills.append(skill_data)
        
        return skills
        
    except Exception as e:
        print(f"Error fetching user skills: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch user skills: {str(e)}"
        )


@router.post("/student/skills", response_model=dict)
async def save_user_skills(
    skills: List[SkillCreate],
    current_user: TokenData = Depends(get_current_active_user),
    db: Client = Depends(get_supabase_admin)
):
    """
    Save/update user skills. Uses upsert to handle both create and update.
    """
    try:
        if current_user.user_role != "Student":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only students can manage skills"
            )
        
        user_id = str(current_user.user_id)
        
        if not skills or len(skills) == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="At least one skill must be provided"
            )
        
        # Prepare skills for insertion/update
        skills_to_save = []
        for skill in skills:
            skill_data = {
                "user_id": user_id,
                "skill_id": str(skill.skill_id),
                "proficiency_level": skill.proficiency_level,
                "years_of_experience": skill.years_of_experience,
                "verification_status": "Unverified"  # Default status
            }
            skills_to_save.append(skill_data)
        
        # Use upsert to handle both insert and update
        # on_conflict specifies the unique constraint columns
        response = db.table("user_skills").upsert(
            skills_to_save,
            on_conflict="user_id,skill_id"
        ).execute()
        
        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to save skills"
            )
        
        return {
            "message": f"Successfully saved {len(response.data)} skill(s)",
            "skills": response.data
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error saving skills: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save skills: {str(e)}"
        )


@router.delete("/student/skills/{user_skill_id}", response_model=dict)
async def delete_user_skill(
    user_skill_id: UUID,
    current_user: TokenData = Depends(get_current_active_user),
    db: Client = Depends(get_supabase_admin)
):
    """
    Delete a specific user skill
    """
    try:
        if current_user.user_role != "Student":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only students can manage skills"
            )
        
        user_id = str(current_user.user_id)
        
        # First verify the skill belongs to the user
        check_response = db.table("user_skills").select("user_id").eq(
            "user_skill_id", str(user_skill_id)
        ).execute()
        
        if not check_response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Skill not found"
            )
        
        if check_response.data[0]["user_id"] != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only delete your own skills"
            )
        
        # Delete the skill
        response = db.table("user_skills").delete().eq(
            "user_skill_id", str(user_skill_id)
        ).execute()
        
        return {
            "message": "Skill deleted successfully",
            "user_skill_id": str(user_skill_id)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error deleting skill: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete skill: {str(e)}"
        )
