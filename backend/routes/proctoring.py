from fastapi import APIRouter, HTTPException, status, Depends
from database import get_supabase_admin
from supabase import Client
from models.user import TokenData
from models.test import FaceCaptureSubmit, ViolationLog, TabSwitchLog
from utils.security import get_current_active_user
from utils.face_verification import FaceVerification
from typing import Dict, Any, List
from datetime import datetime
from uuid import UUID
import requests

router = APIRouter(prefix="/proctoring", tags=["Proctoring"])


@router.post("/sessions/{session_id}/verify-face", response_model=Dict[str, Any])
async def verify_face_during_test(
    session_id: UUID,
    face_data: FaceCaptureSubmit,
    current_user: TokenData = Depends(get_current_active_user),
    db: Client = Depends(get_supabase_admin)
):
    """
    Verify user's face during test by comparing with profile picture
    """
    try:
        # Verify session belongs to user
        session_response = db.table("test_sessions").select("*").eq(
            "session_id", str(session_id)
        ).eq("user_id", str(current_user.user_id)).execute()
        
        if not session_response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Test session not found"
            )
        
        session = session_response.data[0]
        
        if session["status"] != "InProgress":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Test session is not in progress"
            )
        
        # Get user's profile picture
        if current_user.user_role == "Student":
            table_name = "student_profiles"
            id_column = "student_id"
        else:
            table_name = "company_profiles"
            id_column = "company_id"
        
        profile_response = db.table(table_name).select("profile_picture_url").eq(
            id_column, str(current_user.user_id)
        ).execute()
        
        if not profile_response.data or not profile_response.data[0].get("profile_picture_url"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No profile picture found. Please upload a profile picture first."
            )
        
        profile_picture_url = profile_response.data[0]["profile_picture_url"]
        
        # Download profile picture
        try:
            response = requests.get(profile_picture_url, timeout=10)
            response.raise_for_status()
            profile_image_bytes = response.content
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to fetch profile picture: {str(e)}"
            )
        
        # Verify face
        verification_result = FaceVerification.verify_face(
            profile_image_bytes,
            face_data.image_base64
        )
        
        # Log the verification attempt
        log_data = {
            "session_id": str(session_id),
            "user_id": str(current_user.user_id),
            "verified": verification_result["verified"],
            "confidence": verification_result["confidence"],
            "captured_at": datetime.utcnow().isoformat(),
            "error": verification_result.get("error")
        }
        
        db.table("face_verification_logs").insert(log_data).execute()
        
        # If verification failed, log violation
        if not verification_result["verified"]:
            violation_data = {
                "session_id": str(session_id),
                "user_id": str(current_user.user_id),
                "violation_type": "FaceNotMatched",
                "severity": "High",
                "details": {
                    "confidence": verification_result["confidence"],
                    "error": verification_result.get("error")
                },
                "occurred_at": datetime.utcnow().isoformat()
            }
            db.table("proctoring_violations").insert(violation_data).execute()
        
        return {
            "verified": verification_result["verified"],
            "confidence": verification_result["confidence"],
            "message": verification_result.get("details", {}).get("message", ""),
            "error": verification_result.get("error")
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error during face verification: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Face verification failed: {str(e)}"
        )


@router.post("/sessions/{session_id}/log-violation", response_model=Dict[str, Any])
async def log_proctoring_violation(
    session_id: UUID,
    violation: ViolationLog,
    current_user: TokenData = Depends(get_current_active_user),
    db: Client = Depends(get_supabase_admin)
):
    """
    Log proctoring violations (tab switch, multiple faces, etc.)
    """
    try:
        # Verify session belongs to user
        session_response = db.table("test_sessions").select("status").eq(
            "session_id", str(session_id)
        ).eq("user_id", str(current_user.user_id)).execute()
        
        if not session_response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Test session not found"
            )
        
        if session_response.data[0]["status"] != "InProgress":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Test session is not in progress"
            )
        
        # Log violation
        violation_data = {
            "session_id": str(session_id),
            "user_id": str(current_user.user_id),
            "violation_type": violation.violation_type,
            "severity": violation.severity,
            "details": violation.details or {},
            "occurred_at": datetime.utcnow().isoformat()
        }
        
        response = db.table("proctoring_violations").insert(violation_data).execute()
        
        # Get total violation count
        violations_response = db.table("proctoring_violations").select(
            "violation_id", count="exact"
        ).eq("session_id", str(session_id)).execute()
        
        violation_count = violations_response.count if violations_response.count else 0
        
        return {
            "message": "Violation logged successfully",
            "violation_id": response.data[0]["violation_id"] if response.data else None,
            "total_violations": violation_count
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error logging violation: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to log violation: {str(e)}"
        )


@router.post("/sessions/{session_id}/tab-switch", response_model=Dict[str, Any])
async def log_tab_switch(
    session_id: UUID,
    current_user: TokenData = Depends(get_current_active_user),
    db: Client = Depends(get_supabase_admin)
):
    """
    Log tab switch event
    """
    try:
        # Log as a violation
        violation = ViolationLog(
            violation_type="TabSwitch",
            severity="Medium",
            details={"timestamp": datetime.utcnow().isoformat()}
        )
        
        return await log_proctoring_violation(session_id, violation, current_user, db)
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to log tab switch: {str(e)}"
        )


@router.get("/sessions/{session_id}/violations", response_model=List[Dict[str, Any]])
async def get_session_violations(
    session_id: UUID,
    current_user: TokenData = Depends(get_current_active_user),
    db: Client = Depends(get_supabase_admin)
):
    """
    Get all violations for a test session
    """
    try:
        # Verify session belongs to user or user is admin
        session_response = db.table("test_sessions").select("user_id").eq(
            "session_id", str(session_id)
        ).execute()
        
        if not session_response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Test session not found"
            )
        
        # Allow access if session belongs to user
        if str(session_response.data[0]["user_id"]) != str(current_user.user_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
        
        # Fetch violations
        violations_response = db.table("proctoring_violations").select("*").eq(
            "session_id", str(session_id)
        ).order("occurred_at").execute()
        
        return violations_response.data or []
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch violations: {str(e)}"
        )


@router.get("/sessions/{session_id}/stats", response_model=Dict[str, Any])
async def get_proctoring_stats(
    session_id: UUID,
    current_user: TokenData = Depends(get_current_active_user),
    db: Client = Depends(get_supabase_admin)
):
    """
    Get proctoring statistics for a session
    """
    try:
        # Verify access
        session_response = db.table("test_sessions").select("user_id").eq(
            "session_id", str(session_id)
        ).execute()
        
        if not session_response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Test session not found"
            )
        
        if str(session_response.data[0]["user_id"]) != str(current_user.user_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
        
        # Get violation counts by type
        violations_response = db.table("proctoring_violations").select("*").eq(
            "session_id", str(session_id)
        ).execute()
        
        violations = violations_response.data or []
        
        stats = {
            "total_violations": len(violations),
            "by_type": {},
            "by_severity": {"Low": 0, "Medium": 0, "High": 0}
        }
        
        for violation in violations:
            v_type = violation["violation_type"]
            severity = violation["severity"]
            
            stats["by_type"][v_type] = stats["by_type"].get(v_type, 0) + 1
            stats["by_severity"][severity] = stats["by_severity"].get(severity, 0) + 1
        
        # Get face verification stats
        face_logs_response = db.table("face_verification_logs").select("*").eq(
            "session_id", str(session_id)
        ).execute()
        
        face_logs = face_logs_response.data or []
        
        stats["face_verifications"] = {
            "total_attempts": len(face_logs),
            "successful": sum(1 for log in face_logs if log.get("verified")),
            "failed": sum(1 for log in face_logs if not log.get("verified")),
            "average_confidence": (
                sum(log.get("confidence", 0) for log in face_logs) / len(face_logs)
                if face_logs else 0
            )
        }
        
        return stats
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch proctoring stats: {str(e)}"
        )
