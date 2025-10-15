from fastapi import APIRouter, HTTPException, status, Depends
from database import get_supabase_admin
from supabase import Client
from models.user import (
    StudentRegistration,
    EducatorRegistration,
    CompanyRegistration,
    UserLogin,
    Token,
    TokenData,
    UserResponse
)
from utils.security import (
    get_password_hash,
    verify_password,
    create_access_token,
    get_current_active_user
)
from datetime import timedelta
from config import settings

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register/student", response_model=dict, status_code=status.HTTP_201_CREATED)
async def register_student(
    student_data: StudentRegistration,
    db: Client = Depends(get_supabase_admin)
):
    """Register a new student user"""
    try:
        # Check if user already exists
        existing_user = db.table("users").select("email").eq("email", student_data.email).execute()
        if existing_user.data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Hash the password
        hashed_password = get_password_hash(student_data.password)
        
        # Create user
        user_response = db.table("users").insert({
            "email": student_data.email,
            "password_hash": hashed_password,
            "user_role": "Student",
            "account_status": "Pending_Verification",
            "profile_completion_percentage": 25
        }).execute()
        
        if not user_response.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create user"
            )
        
        user = user_response.data[0]
        
        # Create student profile
        profile_response = db.table("student_profiles").insert({
            "student_id": user["user_id"],
            "first_name": student_data.first_name,
            "last_name": student_data.last_name
        }).execute()
        
        if not profile_response.data:
            # Rollback user creation
            db.table("users").delete().eq("user_id", user["user_id"]).execute()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create student profile"
            )
        
        # Create access token
        access_token = create_access_token(
            data={
                "sub": str(user["user_id"]),
                "email": user["email"],
                "role": user["user_role"]
            }
        )
        
        return {
            "message": "Student registered successfully",
            "user_id": user["user_id"],
            "email": user["email"],
            "access_token": access_token,
            "token_type": "bearer"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Registration failed: {str(e)}"
        )


@router.post("/register/educator", response_model=dict, status_code=status.HTTP_201_CREATED)
async def register_educator(
    educator_data: EducatorRegistration,
    db: Client = Depends(get_supabase_admin)
):
    """Register a new educator user"""
    try:
        # Check if user already exists
        existing_user = db.table("users").select("email").eq("email", educator_data.email).execute()
        if existing_user.data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Hash the password
        hashed_password = get_password_hash(educator_data.password)
        
        # Create user
        user_response = db.table("users").insert({
            "email": educator_data.email,
            "password_hash": hashed_password,
            "user_role": "Educator",
            "account_status": "Pending_Verification",
            "profile_completion_percentage": 25
        }).execute()
        
        if not user_response.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create user"
            )
        
        user = user_response.data[0]
        
        # Create educator profile
        profile_response = db.table("educator_profiles").insert({
            "educator_id": user["user_id"],
            "first_name": educator_data.first_name,
            "last_name": educator_data.last_name,
            "verification_status": "Pending"
        }).execute()
        
        if not profile_response.data:
            # Rollback user creation
            db.table("users").delete().eq("user_id", user["user_id"]).execute()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create educator profile"
            )
        
        # Create access token
        access_token = create_access_token(
            data={
                "sub": str(user["user_id"]),
                "email": user["email"],
                "role": user["user_role"]
            }
        )
        
        return {
            "message": "Educator registered successfully",
            "user_id": user["user_id"],
            "email": user["email"],
            "access_token": access_token,
            "token_type": "bearer"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Registration failed: {str(e)}"
        )


@router.post("/register/company", response_model=dict, status_code=status.HTTP_201_CREATED)
async def register_company(
    company_data: CompanyRegistration,
    db: Client = Depends(get_supabase_admin)
):
    """Register a new company user"""
    try:
        # Check if user already exists
        existing_user = db.table("users").select("email").eq("email", company_data.email).execute()
        if existing_user.data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Hash the password
        hashed_password = get_password_hash(company_data.password)
        
        # Create user
        user_response = db.table("users").insert({
            "email": company_data.email,
            "password_hash": hashed_password,
            "user_role": "Company",
            "account_status": "Pending_Verification",
            "profile_completion_percentage": 25
        }).execute()
        
        if not user_response.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create user"
            )
        
        user = user_response.data[0]
        
        # Create company profile
        profile_response = db.table("company_profiles").insert({
            "company_id": user["user_id"],
            "company_name": company_data.company_name,
            "recruiter_contact_name": company_data.recruiter_contact_name,
            "verification_status": "Pending"
        }).execute()
        
        if not profile_response.data:
            # Rollback user creation
            db.table("users").delete().eq("user_id", user["user_id"]).execute()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create company profile"
            )
        
        # Create access token
        access_token = create_access_token(
            data={
                "sub": str(user["user_id"]),
                "email": user["email"],
                "role": user["user_role"]
            }
        )
        
        return {
            "message": "Company registered successfully",
            "user_id": user["user_id"],
            "email": user["email"],
            "access_token": access_token,
            "token_type": "bearer"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Registration failed: {str(e)}"
        )


@router.post("/login", response_model=Token)
async def login(
    credentials: UserLogin,
    db: Client = Depends(get_supabase_admin)
):
    """Login endpoint for all user types"""
    try:
        # Get user by email
        user_response = db.table("users").select("*").eq("email", credentials.email).execute()
        
        if not user_response.data:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        user = user_response.data[0]
        
        # Verify password
        if not verify_password(credentials.password, user["password_hash"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Update last login
        db.table("users").update({
            "last_login_at": "now()"
        }).eq("user_id", user["user_id"]).execute()
        
        # Create access token
        access_token = create_access_token(
            data={
                "sub": str(user["user_id"]),
                "email": user["email"],
                "role": user["user_role"]
            }
        )
        
        return Token(access_token=access_token, token_type="bearer")
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Login failed: {str(e)}"
        )


@router.get("/me", response_model=dict)
async def get_current_user_info(
    current_user: TokenData = Depends(get_current_active_user),
    db: Client = Depends(get_supabase_admin)
):
    """Get current user information"""
    try:
        # Get user details
        user_response = db.table("users").select("*").eq("user_id", str(current_user.user_id)).execute()
        
        if not user_response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        user = user_response.data[0]
        
        # Get profile based on user role
        profile = None
        if user["user_role"] == "Student":
            profile_response = db.table("student_profiles").select("*").eq("student_id", user["user_id"]).execute()
            if profile_response.data:
                profile = profile_response.data[0]
                
        elif user["user_role"] == "Educator":
            profile_response = db.table("educator_profiles").select("*").eq("educator_id", user["user_id"]).execute()
            if profile_response.data:
                profile = profile_response.data[0]
                
        elif user["user_role"] == "Company":
            profile_response = db.table("company_profiles").select("*").eq("company_id", user["user_id"]).execute()
            if profile_response.data:
                profile = profile_response.data[0]
        
        return {
            "user": {
                "user_id": user["user_id"],
                "email": user["email"],
                "user_role": user["user_role"],
                "account_status": user["account_status"],
                "profile_completion_percentage": user["profile_completion_percentage"],
                "created_at": user["created_at"]
            },
            "profile": profile
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch user info: {str(e)}"
        )
