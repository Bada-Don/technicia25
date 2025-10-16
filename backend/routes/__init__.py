from .auth import router as auth_router
from .student import router as student_router

__all__ = ["auth_router", "student_router"]
