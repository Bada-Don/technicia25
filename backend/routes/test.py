from fastapi import APIRouter, HTTPException, status, Depends
from database import get_supabase_admin
from supabase import Client
from models.user import TokenData
from models.test import (
    TestSessionCreate, TestSession, AnswerSubmit, AnswerResponse,
    TestSubmit, TestResult, QuestionResponse, QuestionType
)
from utils.security import get_current_active_user
from typing import Dict, Any, List
from datetime import datetime, timedelta, timezone
from uuid import UUID
import random

router = APIRouter(prefix="/test", tags=["Test"])

# Test Configuration
TOTAL_QUESTIONS_PER_TEST = 30
TEST_DURATION_MINUTES = 45
PASSING_PERCENTAGE = 70


@router.post("/sessions/create", response_model=Dict[str, Any])
async def create_test_session(
    session_data: TestSessionCreate,
    current_user: TokenData = Depends(get_current_active_user),
    db: Client = Depends(get_supabase_admin)
):
    """
    Create a new test session for a skill
    """
    try:
        if current_user.user_role != "Student":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only students can take tests"
            )
        
        # Check if user has claimed this skill
        skill_check = db.table("user_skills").select("*").eq(
            "user_id", str(current_user.user_id)
        ).eq("skill_id", str(session_data.skill_id)).execute()
        
        if not skill_check.data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You must claim this skill before taking the test"
            )
        
        # Check if user has profile picture for proctored tests
        if session_data.is_proctored:
            profile_check = db.table("student_profiles").select("profile_picture_url").eq(
                "student_id", str(current_user.user_id)
            ).execute()
            
            if not profile_check.data or not profile_check.data[0].get("profile_picture_url"):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Profile picture required for proctored tests. Please upload your photo first."
                )
        
        # Check existing attempts
        attempts_check = db.table("test_sessions").select("session_id", count="exact").eq(
            "user_id", str(current_user.user_id)
        ).eq("skill_id", str(session_data.skill_id)).execute()
        
        attempts_count = attempts_check.count if attempts_check.count else 0
        
        if attempts_count >= 3:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Maximum 3 attempts allowed per skill"
            )
        
        # Fetch questions for this skill
        questions_response = db.table("test_questions").select("*").eq(
            "skill_id", str(session_data.skill_id)
        ).execute()
        
        if not questions_response.data or len(questions_response.data) < TOTAL_QUESTIONS_PER_TEST:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Not enough questions available for this skill (need {TOTAL_QUESTIONS_PER_TEST})"
            )
        
        # Randomly select questions
        selected_questions = random.sample(questions_response.data, TOTAL_QUESTIONS_PER_TEST)
        total_score = sum(q.get("points", 1) for q in selected_questions)
        
        # Create test session
        session_data_dict = {
            "user_id": str(current_user.user_id),
            "skill_id": str(session_data.skill_id),
            "is_proctored": session_data.is_proctored,
            "status": "NotStarted",
            "total_questions": TOTAL_QUESTIONS_PER_TEST,
            "total_score": total_score,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        session_response = db.table("test_sessions").insert(session_data_dict).execute()
        
        if not session_response.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create test session"
            )
        
        session_id = session_response.data[0]["session_id"]
        
        # Store selected questions for this session
        question_mappings = []
        for idx, question in enumerate(selected_questions):
            question_mappings.append({
                "session_id": session_id,
                "question_id": question["question_id"],
                "question_order": idx + 1
            })
        
        db.table("session_questions").insert(question_mappings).execute()
        
        return {
            "message": "Test session created successfully",
            "session_id": session_id,
            "total_questions": TOTAL_QUESTIONS_PER_TEST,
            "duration_minutes": TEST_DURATION_MINUTES,
            "total_score": total_score,
            "attempt_number": attempts_count + 1
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error creating test session: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create test session: {str(e)}"
        )


@router.post("/sessions/{session_id}/start", response_model=Dict[str, Any])
async def start_test_session(
    session_id: UUID,
    current_user: TokenData = Depends(get_current_active_user),
    db: Client = Depends(get_supabase_admin)
):
    """
    Start a test session
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
        
        if session["status"] != "NotStarted":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Test session already started or completed"
            )
        
        # Update session status
        update_data = {
            "status": "InProgress",
            "started_at": datetime.now(timezone.utc).isoformat()
        }
        
        db.table("test_sessions").update(update_data).eq(
            "session_id", str(session_id)
        ).execute()
        
        return {
            "message": "Test session started",
            "session_id": str(session_id),
            "started_at": update_data["started_at"],
            "duration_minutes": TEST_DURATION_MINUTES
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to start test session: {str(e)}"
        )


@router.get("/sessions/{session_id}/questions", response_model=List[QuestionResponse])
async def get_session_questions(
    session_id: UUID,
    current_user: TokenData = Depends(get_current_active_user),
    db: Client = Depends(get_supabase_admin)
):
    """
    Get all questions for a test session (without correct answers)
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
        
        # Get questions for this session
        session_questions = db.table("session_questions").select(
            "question_id, question_order, test_questions(*)"
        ).eq("session_id", str(session_id)).order("question_order").execute()
        
        if not session_questions.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No questions found for this session"
            )
        
        # Format questions (exclude correct_answer)
        formatted_questions = []
        for item in session_questions.data:
            question = item["test_questions"]
            formatted_question = {
                "question_id": question["question_id"],
                "skill_id": question["skill_id"],
                "question_type": question["question_type"],
                "difficulty_level": question["difficulty_level"],
                "question_text": question["question_text"],
                "options": question.get("options"),
                "points": question.get("points", 1),
                "time_limit_seconds": question.get("time_limit_seconds"),
                "question_order": item["question_order"]
            }
            formatted_questions.append(formatted_question)
        
        return formatted_questions
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch questions: {str(e)}"
        )


@router.post("/sessions/{session_id}/answers", response_model=AnswerResponse)
async def submit_answer(
    session_id: UUID,
    answer_data: AnswerSubmit,
    current_user: TokenData = Depends(get_current_active_user),
    db: Client = Depends(get_supabase_admin)
):
    """
    Submit an answer for a question
    """
    try:
        # Verify session
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
        
        # Check if answer already exists
        existing_answer = db.table("test_answers").select("answer_id").eq(
            "session_id", str(session_id)
        ).eq("question_id", str(answer_data.question_id)).execute()
        
        # Get question details
        question_response = db.table("test_questions").select("*").eq(
            "question_id", str(answer_data.question_id)
        ).execute()
        
        if not question_response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Question not found"
            )
        
        question = question_response.data[0]
        
        # Check if answer is correct
        is_correct = False
        if question["question_type"] == "MCQ":
            is_correct = answer_data.answer.strip() == question["correct_answer"].strip()
        # For coding and short answer, manual grading would be needed
        # For now, we'll mark them as needing review
        
        points_earned = question.get("points", 1) if is_correct else 0
        
        # Prepare answer data
        answer_dict = {
            "session_id": str(session_id),
            "question_id": str(answer_data.question_id),
            "user_id": str(current_user.user_id),
            "answer": answer_data.answer,
            "is_correct": is_correct if question["question_type"] == "MCQ" else None,
            "points_earned": points_earned,
            "time_taken_seconds": answer_data.time_taken_seconds,
            "submitted_at": datetime.now(timezone.utc).isoformat()
        }
        
        # Insert or update answer
        if existing_answer.data:
            response = db.table("test_answers").update(answer_dict).eq(
                "answer_id", existing_answer.data[0]["answer_id"]
            ).execute()
            answer_id = existing_answer.data[0]["answer_id"]
        else:
            response = db.table("test_answers").insert(answer_dict).execute()
            answer_id = response.data[0]["answer_id"] if response.data else None
        
        return {
            "answer_id": answer_id,
            "question_id": str(answer_data.question_id),
            "is_correct": is_correct if question["question_type"] == "MCQ" else None,
            "points_earned": points_earned
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error submitting answer: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to submit answer: {str(e)}"
        )


@router.post("/sessions/{session_id}/submit", response_model=TestResult)
async def submit_test(
    session_id: UUID,
    submit_data: TestSubmit,
    current_user: TokenData = Depends(get_current_active_user),
    db: Client = Depends(get_supabase_admin)
):
    """
    Submit test and calculate results
    """
    try:
        # Verify session
        session_response = db.table("test_sessions").select("*").eq(
            "session_id", str(session_id)
        ).eq("user_id", str(current_user.user_id)).execute()
        
        if not session_response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Test session not found"
            )
        
        session = session_response.data[0]
        
        if session["status"] == "Completed":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Test already submitted"
            )
        
        # Get all answers
        answers_response = db.table("test_answers").select("*").eq(
            "session_id", str(session_id)
        ).execute()
        
        answers = answers_response.data or []
        
        # Calculate results
        total_score = session["total_score"]
        obtained_score = sum(answer.get("points_earned", 0) for answer in answers)
        correct_answers = sum(1 for answer in answers if answer.get("is_correct") == True)
        percentage = (obtained_score / total_score * 100) if total_score > 0 else 0
        
        # Determine verification status
        verification_status = "Verified" if percentage >= PASSING_PERCENTAGE else "Failed"
        
        # Calculate duration
        started_at = datetime.fromisoformat(session["started_at"].replace('Z', '+00:00'))
        completed_at = datetime.now(timezone.utc)
        duration = completed_at - started_at
        duration_minutes = int(duration.total_seconds() / 60)
        
        # Count proctoring violations
        violations_response = db.table("proctoring_violations").select(
            "violation_id", count="exact"
        ).eq("session_id", str(session_id)).execute()
        
        violation_count = violations_response.count if violations_response.count else 0
        
        # If too many violations, mark as failed
        if session["is_proctored"] and violation_count > 5:
            verification_status = "Failed"
        
        # Update session
        update_data = {
            "status": "Completed",
            "completed_at": completed_at.isoformat(),
            "obtained_score": obtained_score,
            "percentage": percentage,
            "verification_status": verification_status
        }
        
        db.table("test_sessions").update(update_data).eq(
            "session_id", str(session_id)
        ).execute()
        
        # Update user skill verification status
        if verification_status == "Verified":
            db.table("user_skills").update({
                "verification_status": "Verified"
            }).eq("user_id", str(current_user.user_id)).eq(
                "skill_id", session["skill_id"]
            ).execute()
        
        # Get skill name
        skill_response = db.table("skills_master").select("skill_name").eq(
            "skill_id", session["skill_id"]
        ).execute()
        
        skill_name = skill_response.data[0]["skill_name"] if skill_response.data else "Unknown"
        
        return {
            "session_id": str(session_id),
            "user_id": str(current_user.user_id),
            "skill_id": session["skill_id"],
            "skill_name": skill_name,
            "total_questions": session["total_questions"],
            "correct_answers": correct_answers,
            "obtained_score": obtained_score,
            "total_score": total_score,
            "percentage": round(percentage, 2),
            "status": "Completed",
            "verification_status": verification_status,
            "started_at": started_at,
            "completed_at": completed_at,
            "duration_minutes": duration_minutes,
            "proctoring_violations": violation_count
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error submitting test: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to submit test: {str(e)}"
        )


@router.get("/sessions/{session_id}/result", response_model=TestResult)
async def get_test_result(
    session_id: UUID,
    current_user: TokenData = Depends(get_current_active_user),
    db: Client = Depends(get_supabase_admin)
):
    """
    Get test results for a completed session
    """
    try:
        # Verify session
        session_response = db.table("test_sessions").select("*").eq(
            "session_id", str(session_id)
        ).eq("user_id", str(current_user.user_id)).execute()
        
        if not session_response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Test session not found"
            )
        
        session = session_response.data[0]
        
        if session["status"] != "Completed":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Test not yet completed"
            )
        
        # Get answer stats
        answers_response = db.table("test_answers").select("*").eq(
            "session_id", str(session_id)
        ).execute()
        
        answers = answers_response.data or []
        correct_answers = sum(1 for answer in answers if answer.get("is_correct") == True)
        
        # Get violations
        violations_response = db.table("proctoring_violations").select(
            "violation_id", count="exact"
        ).eq("session_id", str(session_id)).execute()
        
        violation_count = violations_response.count if violations_response.count else 0
        
        # Get skill name
        skill_response = db.table("skills_master").select("skill_name").eq(
            "skill_id", session["skill_id"]
        ).execute()
        
        skill_name = skill_response.data[0]["skill_name"] if skill_response.data else "Unknown"
        
        # Calculate duration
        started_at = datetime.fromisoformat(session["started_at"].replace('Z', '+00:00'))
        completed_at = datetime.fromisoformat(session["completed_at"].replace('Z', '+00:00'))
        duration = completed_at - started_at
        duration_minutes = int(duration.total_seconds() / 60)
        
        return {
            "session_id": str(session_id),
            "user_id": str(current_user.user_id),
            "skill_id": session["skill_id"],
            "skill_name": skill_name,
            "total_questions": session["total_questions"],
            "correct_answers": correct_answers,
            "obtained_score": session["obtained_score"],
            "total_score": session["total_score"],
            "percentage": session["percentage"],
            "status": session["status"],
            "verification_status": session["verification_status"],
            "started_at": started_at,
            "completed_at": completed_at,
            "duration_minutes": duration_minutes,
            "proctoring_violations": violation_count
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch test result: {str(e)}"
        )


@router.get("/history", response_model=List[TestResult])
async def get_test_history(
    current_user: TokenData = Depends(get_current_active_user),
    db: Client = Depends(get_supabase_admin)
):
    """
    Get user's test history
    """
    try:
        sessions_response = db.table("test_sessions").select("*").eq(
            "user_id", str(current_user.user_id)
        ).order("created_at", desc=True).execute()
        
        if not sessions_response.data:
            return []
        
        results = []
        for session in sessions_response.data:
            if session["status"] != "Completed":
                continue
            
            # Get skill name
            skill_response = db.table("skills_master").select("skill_name").eq(
                "skill_id", session["skill_id"]
            ).execute()
            
            skill_name = skill_response.data[0]["skill_name"] if skill_response.data else "Unknown"
            
            # Get correct answers count
            answers_response = db.table("test_answers").select("is_correct").eq(
                "session_id", session["session_id"]
            ).execute()
            
            correct_answers = sum(1 for a in (answers_response.data or []) if a.get("is_correct") == True)
            
            # Get violations
            violations_response = db.table("proctoring_violations").select(
                "violation_id", count="exact"
            ).eq("session_id", session["session_id"]).execute()
            
            violation_count = violations_response.count if violations_response.count else 0
            
            started_at = datetime.fromisoformat(session["started_at"].replace('Z', '+00:00'))
            completed_at = datetime.fromisoformat(session.get("completed_at", session["started_at"]).replace('Z', '+00:00'))
            duration = completed_at - started_at
            duration_minutes = int(duration.total_seconds() / 60)
            
            results.append({
                "session_id": session["session_id"],
                "user_id": str(current_user.user_id),
                "skill_id": session["skill_id"],
                "skill_name": skill_name,
                "total_questions": session["total_questions"],
                "correct_answers": correct_answers,
                "obtained_score": session.get("obtained_score", 0),
                "total_score": session["total_score"],
                "percentage": session.get("percentage", 0),
                "status": session["status"],
                "verification_status": session.get("verification_status", "Unverified"),
                "started_at": started_at,
                "completed_at": completed_at if session.get("completed_at") else None,
                "duration_minutes": duration_minutes,
                "proctoring_violations": violation_count
            })
        
        return results
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch test history: {str(e)}"
        )
