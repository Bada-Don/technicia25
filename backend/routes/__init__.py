from .auth import router as auth_router
from .student import router as student_router
from .skills import router as skills_router
from .profile import router as profile_router
from .proctoring import router as proctoring_router
from .test import router as test_router
from .leaderboard import router as leaderboard_router

__all__ = ["auth_router", "student_router", "skills_router", "profile_router", "proctoring_router", "test_router", "leaderboard_router"]
