from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from uuid import UUID
from datetime import datetime
from enum import Enum


class QuestionType(str, Enum):
    MCQ = "MCQ"
    CODING = "Coding"
    SHORT_ANSWER = "ShortAnswer"


class DifficultyLevel(str, Enum):
    EASY = "Easy"
    MEDIUM = "Medium"
    HARD = "Hard"


class TestStatus(str, Enum):
    NOT_STARTED = "NotStarted"
    IN_PROGRESS = "InProgress"
    COMPLETED = "Completed"
    ABANDONED = "Abandoned"


class VerificationStatus(str, Enum):
    UNVERIFIED = "Unverified"
    VERIFIED = "Verified"
    FAILED = "Failed"


# Question Models
class QuestionOption(BaseModel):
    option_id: str
    option_text: str


class Question(BaseModel):
    question_id: UUID
    skill_id: UUID
    question_type: QuestionType
    difficulty_level: DifficultyLevel
    question_text: str
    options: Optional[List[QuestionOption]] = None  # For MCQ
    correct_answer: Optional[str] = None  # Will be filtered out in API responses
    points: int = 1
    time_limit_seconds: Optional[int] = None


class QuestionResponse(BaseModel):
    question_id: UUID
    skill_id: UUID
    question_type: QuestionType
    difficulty_level: DifficultyLevel
    question_text: str
    options: Optional[List[QuestionOption]] = None
    points: int = 1
    time_limit_seconds: Optional[int] = None


# Test Session Models
class TestSessionCreate(BaseModel):
    skill_id: UUID
    is_proctored: bool = True


class TestSession(BaseModel):
    session_id: UUID
    user_id: UUID
    skill_id: UUID
    is_proctored: bool
    status: TestStatus
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    total_questions: int
    total_score: int
    obtained_score: Optional[int] = None
    percentage: Optional[float] = None
    verification_status: VerificationStatus = VerificationStatus.UNVERIFIED


# Answer Submission Models
class AnswerSubmit(BaseModel):
    question_id: UUID
    answer: str  # For MCQ: option_id, For coding: code, For short answer: text
    time_taken_seconds: int


class AnswerResponse(BaseModel):
    answer_id: UUID
    question_id: UUID
    is_correct: Optional[bool] = None
    points_earned: int


# Proctoring Models
class FaceCaptureSubmit(BaseModel):
    image_base64: str  # Base64 encoded image from webcam


class ViolationLog(BaseModel):
    violation_type: str  # "TabSwitch", "MultipleFaces", "NoFace", "FaceNotMatched"
    severity: str  # "Low", "Medium", "High"
    details: Optional[Dict[str, Any]] = None


class TabSwitchLog(BaseModel):
    switched_at: datetime = Field(default_factory=datetime.utcnow)


# Test Results Models
class TestResult(BaseModel):
    session_id: UUID
    user_id: UUID
    skill_id: UUID
    skill_name: str
    total_questions: int
    correct_answers: int
    obtained_score: int
    total_score: int
    percentage: float
    status: TestStatus
    verification_status: VerificationStatus
    started_at: datetime
    completed_at: Optional[datetime]
    duration_minutes: Optional[int]
    proctoring_violations: int = 0


class TestSubmit(BaseModel):
    force_submit: bool = False  # For timeout or manual submission
