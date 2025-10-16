import os
import tempfile
import filetype
import docx
import PyPDF2
import google.generativeai as genai
import json
from fastapi import UploadFile, HTTPException
from config import settings
from typing import Optional, Dict, Any


class ResumeExtractor:
    """Utility class for extracting structured data from resume files"""
    
    def __init__(self):
        """Initialize Gemini API"""
        try:
            # Get API key from settings
            api_key = settings.google_api_key
            if not api_key:
                raise ValueError("GOOGLE_API_KEY not found in environment variables")
            
            genai.configure(api_key=api_key)
            self.gemini_model = genai.GenerativeModel('gemini-2.0-flash-exp')
        except Exception as e:
            print(f"Warning: Gemini API initialization failed: {e}")
            self.gemini_model = None
    
    async def extract_text_from_file(self, file: UploadFile) -> str:
        """
        Extract text content from uploaded file (PDF, DOCX, or TXT)
        
        Args:
            file: FastAPI UploadFile object
            
        Returns:
            Extracted text as string
        """
        extracted_text = ""
        
        # Save uploaded file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix=f"_{file.filename}") as temp_file:
            temp_path = temp_file.name
            content = await file.read()
            temp_file.write(content)
        
        try:
            # Detect file type
            kind = filetype.guess(temp_path)
            
            if kind is None:
                # Try to determine from filename extension
                file_extension = file.filename.split('.')[-1].lower()
            else:
                file_extension = kind.extension
            
            # Extract text based on file type
            if file_extension == 'pdf':
                extracted_text = self._extract_from_pdf(temp_path)
            elif file_extension == 'docx':
                extracted_text = self._extract_from_docx(temp_path)
            elif file_extension == 'txt':
                extracted_text = self._extract_from_txt(temp_path)
            else:
                raise HTTPException(
                    status_code=400,
                    detail=f"Unsupported file type: {file_extension}. Please upload PDF, DOCX, or TXT files."
                )
            
            return extracted_text
            
        finally:
            # Clean up temporary file
            if os.path.exists(temp_path):
                os.remove(temp_path)
    
    def _extract_from_pdf(self, file_path: str) -> str:
        """Extract text from PDF file"""
        extracted_text = ""
        try:
            with open(file_path, 'rb') as file:
                reader = PyPDF2.PdfReader(file)
                for page_num in range(len(reader.pages)):
                    extracted_text += reader.pages[page_num].extract_text() + '\n'
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error extracting text from PDF: {str(e)}"
            )
        return extracted_text
    
    def _extract_from_docx(self, file_path: str) -> str:
        """Extract text from DOCX file"""
        extracted_text = ""
        try:
            doc = docx.Document(file_path)
            for paragraph in doc.paragraphs:
                extracted_text += paragraph.text + '\n'
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error extracting text from DOCX: {str(e)}"
            )
        return extracted_text
    
    def _extract_from_txt(self, file_path: str) -> str:
        """Extract text from TXT file"""
        try:
            with open(file_path, 'r', encoding='utf-8') as file:
                extracted_text = file.read()
        except UnicodeDecodeError:
            # Try with different encoding
            try:
                with open(file_path, 'r', encoding='latin-1') as file:
                    extracted_text = file.read()
            except Exception as e:
                raise HTTPException(
                    status_code=500,
                    detail=f"Error extracting text from TXT: {str(e)}"
                )
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error extracting text from TXT: {str(e)}"
            )
        return extracted_text
    
    async def parse_resume_to_json(self, text: str) -> Dict[str, Any]:
        """
        Use Gemini AI to parse resume text into structured JSON
        
        Args:
            text: Extracted resume text
            
        Returns:
            Dictionary containing structured resume data
        """
        if not self.gemini_model:
            raise HTTPException(
                status_code=500,
                detail="AI parsing service is not available. Please enter details manually."
            )
        
        prompt = f"""
        Extract key information from the following resume text and provide it as a structured JSON object.
        The JSON should include fields for:
        
        - personal_info: object containing:
          - first_name: string
          - last_name: string
          - email: string (if available)
          - phone_number: string (if available)
          - date_of_birth: string in YYYY-MM-DD format (if available)
          - gender: string (if available)
          - address: object with street, city, state, country, zipcode (if available)
          - linkedin_profile: string URL (if available)
          - github_profile: string URL (if available)
          - portfolio_url: string URL (if available)
        
        - bio: string - professional summary or objective
        
        - current_education_level: string - one of: "High_School", "Undergraduate", "Graduate", "PhD"
        
        - career_goals: string - career aspirations or goals
        
        - preferred_industries: array of strings - industries of interest
        
        - education_history: array of objects, each containing:
          - institution_name: string
          - degree_qualification: string
          - field_of_study: string
          - start_date: string in YYYY-MM-DD format
          - end_date: string in YYYY-MM-DD format (null if currently enrolled)
          - currently_enrolled: boolean
          - gpa_percentage: string
          - achievements: string
          - location: string
        
        - work_experience: array of objects, each containing:
          - company_name: string
          - job_title: string
          - employment_type: string - one of: "Full_Time", "Part_Time", "Internship", "Freelance", "Contract"
          - start_date: string in YYYY-MM-DD format
          - end_date: string in YYYY-MM-DD format (null if currently working)
          - currently_working: boolean
          - location: string
          - description: string
          - key_achievements: string
        
        - skills: array of objects, each containing:
          - skill_name: string
          - proficiency_level: string - one of: "Beginner", "Intermediate", "Advanced", "Expert"
          - years_of_experience: number (can be decimal)
        
        - certifications: array of objects, each containing:
          - certification_name: string
          - issuing_organization: string
          - issue_date: string in YYYY-MM-DD format
          - expiry_date: string in YYYY-MM-DD format (null if no expiry)
        
        - projects: array of objects, each containing:
          - project_name: string
          - description: string
          - technologies_used: array of strings
          - start_date: string in YYYY-MM-DD format (if available)
          - end_date: string in YYYY-MM-DD format (if available)
          - project_url: string URL (if available)
        
        IMPORTANT: 
        - Return ONLY valid JSON, no markdown formatting or extra text
        - If a field is not found in the resume, use null for single values or empty array [] for lists
        - For dates, use YYYY-MM-DD format or YYYY-MM if day is not available
        - Be accurate and extract exact information from the resume
        - Do not make up or infer information that is not present
        
        Resume text:
        {text}
        """
        
        try:
            response = self.gemini_model.generate_content(prompt)
            response_text = response.text.strip()
            
            # Remove markdown code blocks if present
            if response_text.startswith('```json'):
                response_text = response_text[7:]  # Remove ```json
            elif response_text.startswith('```'):
                response_text = response_text[3:]  # Remove ```
            
            if response_text.endswith('```'):
                response_text = response_text[:-3]  # Remove trailing ```
            
            response_text = response_text.strip()
            
            # Parse JSON
            structured_data = json.loads(response_text)
            return structured_data
            
        except json.JSONDecodeError as e:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to parse AI response as JSON: {str(e)}"
            )
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error during AI parsing: {str(e)}"
            )


# Singleton instance
resume_extractor = ResumeExtractor()
