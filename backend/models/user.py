from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional, Literal
from datetime import datetime
from uuid import UUID


# Enums matching database schema
UserRole = Literal["Student", "Educator", "Company"]
AccountStatus = Literal["Active", "Suspended", "Pending_Verification"]
EducationLevel = Literal["High_School", "Undergraduate", "Graduate", "PhD"]
VerificationStatus = Literal["Verified", "Pending", "Rejected"]
CompanySize = Literal["1-10", "11-50", "51-200", "201-500", "500+"]


# Base User Schemas
class UserBase(BaseModel):
    email: EmailStr
    user_role: UserRole


class UserCreate(UserBase):
    password: str = Field(..., min_length=8, description="Password must be at least 8 characters")


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserInDB(UserBase):
    user_id: UUID
    password_hash: str
    account_status: AccountStatus
    profile_completion_percentage: int
    created_at: datetime
    updated_at: datetime
    last_login_at: Optional[datetime] = None


class UserResponse(UserBase):
    user_id: UUID
    account_status: AccountStatus
    profile_completion_percentage: int
    created_at: datetime


# Student Profile Schemas
class StudentProfileBase(BaseModel):
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    date_of_birth: Optional[str] = None
    gender: Optional[str] = None
    phone_number: Optional[str] = None
    bio: Optional[str] = None
    current_education_level: Optional[EducationLevel] = None
    career_goals: Optional[str] = None


class StudentProfileCreate(StudentProfileBase):
    pass


class StudentProfileResponse(StudentProfileBase):
    student_id: UUID
    profile_picture_url: Optional[str] = None
    resume_url: Optional[str] = None
    linkedin_profile: Optional[str] = None
    github_profile: Optional[str] = None
    portfolio_url: Optional[str] = None
    created_at: datetime
    updated_at: datetime


# Educator Profile Schemas
class EducatorProfileBase(BaseModel):
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    date_of_birth: Optional[str] = None
    phone_number: Optional[str] = None
    bio: Optional[str] = None
    years_of_experience: Optional[float] = Field(None, ge=0)


class EducatorProfileCreate(EducatorProfileBase):
    pass


class EducatorProfileResponse(EducatorProfileBase):
    educator_id: UUID
    profile_picture_url: Optional[str] = None
    linkedin_profile: Optional[str] = None
    verification_status: VerificationStatus
    approval_date: Optional[str] = None
    created_at: datetime
    updated_at: datetime


# Company Profile Schemas
class CompanyProfileBase(BaseModel):
    company_name: str = Field(..., min_length=1, max_length=255)
    industry: Optional[str] = None
    company_size: Optional[CompanySize] = None
    company_description: Optional[str] = None
    company_website: Optional[str] = None
    recruiter_contact_name: Optional[str] = None
    recruiter_contact_email: Optional[EmailStr] = None
    recruiter_contact_phone: Optional[str] = None


class CompanyProfileCreate(CompanyProfileBase):
    pass


class CompanyProfileResponse(CompanyProfileBase):
    company_id: UUID
    logo_url: Optional[str] = None
    verification_status: VerificationStatus
    created_at: datetime
    updated_at: datetime


# Registration Schemas (combined user + profile)
class StudentRegistration(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)


class EducatorRegistration(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)


class CompanyRegistration(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)
    company_name: str = Field(..., min_length=1, max_length=255)
    recruiter_contact_name: str = Field(..., min_length=1, max_length=100)


# Token Schemas
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    user_id: Optional[UUID] = None
    email: Optional[str] = None
    user_role: Optional[UserRole] = None
