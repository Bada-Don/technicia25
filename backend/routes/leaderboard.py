from fastapi import APIRouter, HTTPException, status, Depends, Query
from database import get_supabase_admin
from supabase import Client
from models.user import TokenData
from utils.security import get_current_active_user
from typing import Dict, Any, List, Optional
from uuid import UUID

router = APIRouter(prefix="/leaderboard", tags=["Leaderboard"])


@router.get("/technology/{technology_name}", response_model=List[Dict[str, Any]])
async def get_leaderboard_by_technology(
    technology_name: str,
    role: str = Query("Student", description="Filter by role: Student or Teacher"),
    db: Client = Depends(get_supabase_admin)
):
    """
    Get leaderboard for a specific technology, showing all students who attempted tests
    Students are ranked by their best score for that technology
    """
    try:
        # First, get the skill_id for the technology
        skill_response = db.table("skills_master").select("skill_id, skill_name").ilike(
            "skill_name", f"%{technology_name}%"
        ).execute()
        
        if not skill_response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Technology '{technology_name}' not found"
            )
        
        skill_id = skill_response.data[0]["skill_id"]
        skill_name = skill_response.data[0]["skill_name"]
        
        # Get all completed test sessions for this skill
        sessions_response = db.table("test_sessions").select(
            "session_id, user_id, obtained_score, percentage, completed_at, verification_status"
        ).eq("skill_id", skill_id).eq("status", "Completed").execute()
        
        if not sessions_response.data:
            return []
        
        # Group by user and get their best score
        user_best_scores = {}
        for session in sessions_response.data:
            user_id = session["user_id"]
            score = session.get("obtained_score", 0)
            percentage = session.get("percentage", 0)
            
            if user_id not in user_best_scores or percentage > user_best_scores[user_id]["percentage"]:
                user_best_scores[user_id] = {
                    "user_id": user_id,
                    "score": score,
                    "percentage": percentage,
                    "completed_at": session["completed_at"],
                    "verification_status": session.get("verification_status", "Unverified")
                }
        
        # Get user details for all users
        user_ids = list(user_best_scores.keys())
        if not user_ids:
            return []
        
        # Fetch user profiles with role filter
        users_response = db.table("users").select(
            "user_id, email, user_role"
        ).in_("user_id", user_ids).eq("user_role", role).execute()
        
        if not users_response.data:
            return []
        
        # Get student profiles for additional info
        student_ids = [u["user_id"] for u in users_response.data]
        profiles_response = db.table("student_profiles").select(
            "student_id, first_name, last_name, address, profile_picture_url"
        ).in_("student_id", student_ids).execute()
        
        profiles_dict = {p["student_id"]: p for p in (profiles_response.data or [])}
        
        # Combine data
        leaderboard_data = []
        for user in users_response.data:
            user_id = user["user_id"]
            best_score = user_best_scores[user_id]
            profile = profiles_dict.get(user_id, {})
            
            # Build full name from first_name and last_name
            full_name = ""
            if profile.get("first_name") and profile.get("last_name"):
                full_name = f"{profile['first_name']} {profile['last_name']}"
            elif profile.get("first_name"):
                full_name = profile["first_name"]
            else:
                full_name = user.get("email", "").split("@")[0]
            
            # Extract country from address JSONB
            country = "Unknown"
            if profile.get("address") and isinstance(profile["address"], dict):
                country = profile["address"].get("country", "Unknown")
            
            leaderboard_data.append({
                "user_id": user_id,
                "name": full_name,
                "email": user.get("email"),
                "role": user.get("user_role"),
                "country": country,
                "profile_picture_url": profile.get("profile_picture_url"),
                "technology": skill_name,
                "score": best_score["score"],
                "percentage": round(best_score["percentage"], 2),
                "verification_status": best_score["verification_status"],
                "completed_at": best_score["completed_at"]
            })
        
        # Sort by percentage (descending) and assign ranks
        leaderboard_data.sort(key=lambda x: x["percentage"], reverse=True)
        for idx, entry in enumerate(leaderboard_data, start=1):
            entry["rank"] = idx
        
        return leaderboard_data
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error fetching leaderboard: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch leaderboard: {str(e)}"
        )


@router.get("/all", response_model=List[Dict[str, Any]])
async def get_all_leaderboards(
    role: str = Query("Student", description="Filter by role: Student or Teacher"),
    limit: int = Query(100, description="Limit results per technology"),
    db: Client = Depends(get_supabase_admin)
):
    """
    Get leaderboard data for all technologies combined
    """
    try:
        # Get all skills
        skills_response = db.table("skills_master").select("skill_id, skill_name").execute()
        
        if not skills_response.data:
            return []
        
        all_leaderboard_data = []
        
        for skill in skills_response.data:
            skill_id = skill["skill_id"]
            skill_name = skill["skill_name"]
            
            # Get completed test sessions for this skill
            sessions_response = db.table("test_sessions").select(
                "session_id, user_id, obtained_score, percentage, completed_at, verification_status"
            ).eq("skill_id", skill_id).eq("status", "Completed").limit(limit).execute()
            
            if not sessions_response.data:
                continue
            
            # Group by user and get their best score
            user_best_scores = {}
            for session in sessions_response.data:
                user_id = session["user_id"]
                percentage = session.get("percentage", 0)
                
                if user_id not in user_best_scores or percentage > user_best_scores[user_id]["percentage"]:
                    user_best_scores[user_id] = {
                        "user_id": user_id,
                        "score": session.get("obtained_score", 0),
                        "percentage": percentage,
                        "completed_at": session["completed_at"],
                        "verification_status": session.get("verification_status", "Unverified")
                    }
            
            # Get user details
            user_ids = list(user_best_scores.keys())
            if not user_ids:
                continue
            
            users_response = db.table("users").select(
                "user_id, email, user_role"
            ).in_("user_id", user_ids).eq("user_role", role).execute()
            
            if not users_response.data:
                continue
            
            # Get student profiles
            student_ids = [u["user_id"] for u in users_response.data]
            profiles_response = db.table("student_profiles").select(
                "student_id, first_name, last_name, address, profile_picture_url"
            ).in_("student_id", student_ids).execute()
            
            profiles_dict = {p["student_id"]: p for p in (profiles_response.data or [])}
            
            # Combine data
            for user in users_response.data:
                user_id = user["user_id"]
                best_score = user_best_scores[user_id]
                profile = profiles_dict.get(user_id, {})
                
                # Build full name from first_name and last_name
                full_name = ""
                if profile.get("first_name") and profile.get("last_name"):
                    full_name = f"{profile['first_name']} {profile['last_name']}"
                elif profile.get("first_name"):
                    full_name = profile["first_name"]
                else:
                    full_name = user.get("email", "").split("@")[0]
                
                # Extract country from address JSONB
                country = "Unknown"
                if profile.get("address") and isinstance(profile["address"], dict):
                    country = profile["address"].get("country", "Unknown")
                
                all_leaderboard_data.append({
                    "user_id": user_id,
                    "name": full_name,
                    "email": user.get("email"),
                    "role": user.get("user_role"),
                    "country": country,
                    "profile_picture_url": profile.get("profile_picture_url"),
                    "technology": skill_name,
                    "score": best_score["score"],
                    "percentage": round(best_score["percentage"], 2),
                    "verification_status": best_score["verification_status"],
                    "completed_at": best_score["completed_at"]
                })
        
        # Sort by percentage (descending)
        all_leaderboard_data.sort(key=lambda x: x["percentage"], reverse=True)
        
        return all_leaderboard_data
        
    except Exception as e:
        print(f"Error fetching all leaderboards: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch leaderboards: {str(e)}"
        )


@router.get("/technologies", response_model=List[Dict[str, Any]])
async def get_available_technologies(
    db: Client = Depends(get_supabase_admin)
):
    """
    Get list of all available technologies/skills with test data
    """
    try:
        skills_response = db.table("skills_master").select("skill_id, skill_name, skill_category").execute()
        
        if not skills_response.data:
            return []
        
        technologies = []
        for skill in skills_response.data:
            # Count how many students have attempted this skill
            sessions_count = db.table("test_sessions").select(
                "session_id", count="exact"
            ).eq("skill_id", skill["skill_id"]).eq("status", "Completed").execute()
            
            count = sessions_count.count if sessions_count.count else 0
            
            technologies.append({
                "skill_id": skill["skill_id"],
                "skill_name": skill["skill_name"],
                "category": skill.get("skill_category", "Other"),
                "total_attempts": count
            })
        
        # Sort by total attempts (descending)
        technologies.sort(key=lambda x: x["total_attempts"], reverse=True)
        
        return technologies
        
    except Exception as e:
        print(f"Error fetching technologies: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch technologies: {str(e)}"
        )


@router.get("/user/{user_id}", response_model=Dict[str, Any])
async def get_user_leaderboard_position(
    user_id: UUID,
    technology_name: str = Query(..., description="Technology to check position for"),
    current_user: TokenData = Depends(get_current_active_user),
    db: Client = Depends(get_supabase_admin)
):
    """
    Get a specific user's position on the leaderboard for a technology
    """
    try:
        # Get the full leaderboard
        leaderboard = await get_leaderboard_by_technology(technology_name, "Student", db)
        
        # Find user's position
        user_position = None
        for entry in leaderboard:
            if entry["user_id"] == str(user_id):
                user_position = entry
                break
        
        if not user_position:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found on leaderboard"
            )
        
        return {
            "user_position": user_position,
            "total_participants": len(leaderboard),
            "top_10": leaderboard[:10]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch user position: {str(e)}"
        )
