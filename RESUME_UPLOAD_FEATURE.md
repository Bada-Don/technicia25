# Resume Upload & Profile Completion Feature

## Overview

This feature allows students to automatically populate their profile by uploading a resume. The system extracts text from uploaded documents (PDF, DOCX, TXT) and uses AI (Google Gemini) to parse the content into structured data matching the database schema.

## Features

- **Resume Upload**: Drag-and-drop or click-to-upload interface
- **AI-Powered Extraction**: Automatically extracts and structures data from resumes
- **Manual Entry Fallback**: If no resume is uploaded or AI parsing fails, users can enter details manually
- **Profile Completion Tracking**: Calculates and displays profile completion percentage
- **Multi-Step Form**: User-friendly 3-step form for reviewing and completing profile information
- **Automatic Redirect**: Students with incomplete profiles are automatically redirected to onboarding

## Architecture

### Backend Components

1. **`backend/utils/resume_extractor.py`**
   - Handles file uploads and text extraction
   - Integrates with Google Gemini AI for structured data parsing
   - Supports PDF, DOCX, and TXT formats

2. **`backend/models/student.py`**
   - Pydantic schemas for resume data structures
   - Validation models for profile updates
   - Response models for API endpoints

3. **`backend/routes/student.py`**
   - `POST /student/upload-resume`: Upload and parse resume
   - `PUT /student/profile`: Update student profile
   - `POST /student/profile/education`: Add education history
   - `POST /student/profile/experience`: Add work experience
   - `GET /student/profile/complete`: Get complete profile with all data

### Frontend Components

1. **`frontend/src/components/student/ResumeUpload.jsx`**
   - File upload interface with drag-and-drop
   - File validation and upload progress
   - Error handling and user feedback

2. **`frontend/src/components/student/ProfileCompletion.jsx`**
   - 3-step form for profile completion
   - Pre-filled with extracted data
   - Manual entry for missing fields
   - Progress indicator

3. **`frontend/src/pages/StudentOnboarding.jsx`**
   - Orchestrates the upload and completion workflow
   - State management between components

4. **`frontend/src/pages/Dashboard.jsx`**
   - Checks profile completion percentage
   - Redirects to onboarding if profile < 50% complete

## Setup Instructions

### Prerequisites

1. **Python Dependencies**
   ```bash
   cd backend
   pip install python-docx PyPDF2 filetype google-generativeai
   ```

2. **Environment Variables**
   Add to `backend/.env`:
   ```env
   GOOGLE_API_KEY=your_gemini_api_key_here
   ```

3. **Get Google Gemini API Key**
   - Visit https://makersuite.google.com/app/apikey
   - Create a new API key
   - Add it to your `.env` file

### Installation

1. **Backend Setup**
   ```bash
   cd backend
   # Install dependencies (if not already done)
   pip install -r requirements.txt
   
   # Run the server
   python main.py
   ```

2. **Frontend Setup**
   ```bash
   cd frontend
   # Install dependencies (if not already done)
   npm install
   
   # Run the development server
   npm run dev
   ```

## Usage Flow

### For New Students

1. **Registration**
   - Student registers via `/auth` or existing registration flow
   - Account is created with `profile_completion_percentage` = 25%

2. **First Login**
   - After successful login, user is redirected to `/dashboard`
   - Dashboard checks `profile_completion_percentage`
   - If < 50%, automatically redirects to `/student/onboarding`

3. **Resume Upload (Optional)**
   - Student can upload resume (PDF, DOCX, or TXT)
   - System extracts text and parses using AI
   - Extracted data is displayed for review
   - OR student can click "Enter Details Manually"

4. **Profile Completion**
   - 3-step form with pre-filled data (if resume was uploaded)
   - Step 1: Personal Information
   - Step 2: Education & Career
   - Step 3: Links & Contact
   - Students can edit any field before submission

5. **Submission**
   - Profile data is saved to database
   - Education history and work experience are added
   - Profile completion percentage is calculated
   - Student is redirected to dashboard

### For Existing Students

- Students with `profile_completion_percentage` >= 50% can access the dashboard directly
- They can update their profile from the dashboard

## API Endpoints

### Upload Resume
```http
POST /student/upload-resume
Content-Type: multipart/form-data
Authorization: Bearer {token}

Body:
- file: Resume file (PDF, DOCX, or TXT)

Response:
{
  "success": true,
  "message": "Resume parsed successfully",
  "extracted_data": {
    "personal_info": {...},
    "education_history": [...],
    "work_experience": [...],
    ...
  },
  "missing_fields": ["field1", "field2"]
}
```

### Update Profile
```http
PUT /student/profile
Content-Type: application/json
Authorization: Bearer {token}

Body:
{
  "first_name": "John",
  "last_name": "Doe",
  "phone_number": "+1234567890",
  "bio": "...",
  ...
}

Response:
{
  "message": "Profile updated successfully",
  "profile": {...},
  "profile_completion_percentage": 75
}
```

### Add Education History
```http
POST /student/profile/education
Content-Type: application/json
Authorization: Bearer {token}

Body: [
  {
    "institution_name": "University",
    "degree_qualification": "Bachelor's",
    "field_of_study": "Computer Science",
    ...
  }
]
```

### Add Work Experience
```http
POST /student/profile/experience
Content-Type: application/json
Authorization: Bearer {token}

Body: [
  {
    "company_name": "Company Inc.",
    "job_title": "Software Engineer",
    "employment_type": "Full_Time",
    ...
  }
]
```

### Get Complete Profile
```http
GET /student/profile/complete
Authorization: Bearer {token}

Response:
{
  "profile": {...},
  "education_history": [...],
  "work_experience": [...],
  "profile_completion_percentage": 75
}
```

## Profile Completion Calculation

Profile completion is calculated based on 15 fields:

**Required Fields (9):**
- first_name
- last_name
- phone_number
- date_of_birth
- gender
- bio
- current_education_level
- career_goals
- address

**Optional but Important (6):**
- resume_url
- linkedin_profile
- github_profile
- portfolio_url
- profile_picture_url
- preferred_industries

Each filled field contributes ~6.67% to the total completion percentage.

## Error Handling

1. **File Upload Errors**
   - Invalid file type: "Please upload a PDF, DOCX, or TXT file"
   - File too large: "File size must be less than 10MB"
   - Empty file: "Could not extract meaningful text from the resume"

2. **AI Parsing Errors**
   - If Gemini API fails, users are prompted to enter details manually
   - Graceful fallback to manual entry mode

3. **Database Errors**
   - Validation errors are displayed to users
   - Failed submissions can be retried

## Customization

### Adjust AI Prompt

Edit `backend/utils/resume_extractor.py`, line 145 to customize the AI extraction prompt.

### Change Profile Completion Threshold

Edit `frontend/src/pages/Dashboard.jsx`, line 75 to change the redirection threshold (currently 50%).

### Modify Form Steps

Edit `frontend/src/components/student/ProfileCompletion.jsx` to add/remove form steps or fields.

## Troubleshooting

### "GOOGLE_API_KEY not found"
- Ensure `.env` file exists in `backend/` directory
- Verify the API key is correctly set
- Restart the backend server after adding the key

### Resume parsing returns empty data
- Check if the resume file has readable text (scanned PDFs may not work)
- Verify Gemini API quota and limits
- Check backend logs for detailed error messages

### Profile completion percentage not updating
- Ensure the profile update endpoint is being called
- Check database connection
- Verify the calculation logic includes all fields

## Future Enhancements

- [ ] Support for more file formats (RTF, HTML)
- [ ] Resume storage in cloud (Supabase Storage)
- [ ] Skills extraction and matching with skills database
- [ ] Automatic profile picture extraction from resume
- [ ] Multi-language resume support
- [ ] Resume quality scoring and suggestions
- [ ] Export profile as PDF resume

## Support

For issues or questions, please contact the development team or create an issue in the project repository.
