from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional, List, Dict, Any
from datetime import date
from uuid import UUID


# Address Schema
class AddressSchema(BaseModel):
    street: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    zipcode: Optional[str] = None


# Personal Info from Resume
class PersonalInfoExtracted(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone_number: Optional[str] = None
    date_of_birth: Optional[str] = None  # Will be converted to date
    gender: Optional[str] = None
    address: Optional[AddressSchema] = None
    linkedin_profile: Optional[str] = None
    github_profile: Optional[str] = None
    portfolio_url: Optional[str] = None


# Education History Item
class EducationHistoryItem(BaseModel):
    institution_name: str
    degree_qualification: str
    field_of_study: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    currently_enrolled: bool = False
    gpa_percentage: Optional[str] = None
    achievements: Optional[str] = None
    location: Optional[str] = None


# Work Experience Item
class WorkExperienceItem(BaseModel):
    company_name: str
    job_title: str
    employment_type: Optional[str] = "Internship"
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    currently_working: bool = False
    location: Optional[str] = None
    description: Optional[str] = None
    key_achievements: Optional[str] = None


# Skill Item
class SkillItem(BaseModel):
    skill_name: str
    proficiency_level: Optional[str] = "Intermediate"
    years_of_experience: Optional[float] = None


# Certification Item
class CertificationItem(BaseModel):
    certification_name: str
    issuing_organization: Optional[str] = None
    issue_date: Optional[str] = None
    expiry_date: Optional[str] = None


# Project Item
class ProjectItem(BaseModel):
    project_name: str
    description: Optional[str] = None
    technologies_used: Optional[List[str]] = []
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    project_url: Optional[str] = None


# Complete Extracted Resume Data
class ExtractedResumeData(BaseModel):
    personal_info: Optional[PersonalInfoExtracted] = None
    bio: Optional[str] = None
    current_education_level: Optional[str] = None
    career_goals: Optional[str] = None
    preferred_industries: Optional[List[str]] = []
    education_history: Optional[List[EducationHistoryItem]] = []
    work_experience: Optional[List[WorkExperienceItem]] = []
    skills: Optional[List[SkillItem]] = []
    certifications: Optional[List[CertificationItem]] = []
    projects: Optional[List[ProjectItem]] = []


# Student Profile Update Request
class StudentProfileUpdate(BaseModel):
    # Basic Info
    first_name: Optional[str] = Field(None, min_length=1, max_length=100)
    last_name: Optional[str] = Field(None, min_length=1, max_length=100)
    date_of_birth: Optional[str] = None
    gender: Optional[str] = Field(None, max_length=50)
    phone_number: Optional[str] = Field(None, max_length=20)
    address: Optional[Dict[str, Any]] = None
    bio: Optional[str] = None
    
    # Education & Career
    current_education_level: Optional[str] = None
    career_goals: Optional[str] = None
    preferred_industries: Optional[List[str]] = None
    
    # Links
    linkedin_profile: Optional[str] = Field(None, max_length=255)
    github_profile: Optional[str] = Field(None, max_length=255)
    portfolio_url: Optional[str] = Field(None, max_length=255)
    resume_url: Optional[str] = Field(None, max_length=500)
    profile_picture_url: Optional[str] = Field(None, max_length=500)


# Response after resume parsing
class ResumeParseResponse(BaseModel):
    success: bool
    message: str
    extracted_data: Optional[ExtractedResumeData] = None
    missing_fields: Optional[List[str]] = []


# Student Profile Complete Response
class StudentProfileCompleteResponse(BaseModel):
    student_id: UUID
    first_name: str
    last_name: str
    email: Optional[str] = None
    date_of_birth: Optional[date] = None
    gender: Optional[str] = None
    phone_number: Optional[str] = None
    address: Optional[Dict[str, Any]] = None
    bio: Optional[str] = None
    profile_picture_url: Optional[str] = None
    current_education_level: Optional[str] = None
    career_goals: Optional[str] = None
    preferred_industries: Optional[List[str]] = None
    resume_url: Optional[str] = None
    linkedin_profile: Optional[str] = None
    github_profile: Optional[str] = None
    portfolio_url: Optional[str] = None
    profile_completion_percentage: int
    education_history: Optional[List[EducationHistoryItem]] = []
    work_experience: Optional[List[WorkExperienceItem]] = []
