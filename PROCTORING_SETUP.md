# Web Proctored Test System - Setup Guide

## 🎯 Overview
Complete web proctored skill verification test system with:
- ✅ Profile picture upload with face validation
- ✅ Real-time face matching using Python
- ✅ Live camera monitoring during tests
- ✅ Tab switch detection
- ✅ Violation tracking and reporting
- ✅ Automatic scoring and verification
- ✅ Supabase storage integration

---

## 📋 Prerequisites
- **Python 3.13** (or compatible)
- **Node.js 18+** and npm
- **Supabase Account** (free tier works)
- **Webcam** for proctored tests

---

## 🚀 Quick Start

### 1. Database Setup

#### Step 1.1: Run SQL Schema
1. Open your Supabase project dashboard
2. Go to **SQL Editor**
3. Copy the entire content of `backend/database_setup.sql`
4. Run the SQL script
5. Verify all tables are created successfully

#### Step 1.2: Create Storage Bucket
1. Go to **Storage** in Supabase dashboard
2. Click **"Create a new bucket"**
3. Bucket name: `Profile Picture Storage`
4. Settings:
   - **Public bucket**: Yes
   - **File size limit**: 5MB
   - **Allowed MIME types**: `image/jpeg`, `image/jpg`, `image/png`, `image/webp`

#### Step 1.3: Apply Storage Policies
In the bucket settings, add these policies:

**Policy 1: Users can upload their own pictures**
```sql
(bucket_id = 'Profile Picture Storage' AND auth.uid()::text = (storage.foldername(name))[1])
```

**Policy 2: Public read access**
```sql
bucket_id = 'Profile Picture Storage'
```

**Policy 3: Users can update their own pictures**
```sql
(bucket_id = 'Profile Picture Storage' AND auth.uid()::text = (storage.foldername(name))[1])
```

**Policy 4: Users can delete their own pictures**
```sql
(bucket_id = 'Profile Picture Storage' AND auth.uid()::text = (storage.foldername(name))[1])
```

---

### 2. Backend Setup

```bash
cd backend

# Create virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Important**: The face recognition library requires **CMake** and **dlib**. If installation fails:

**Windows:**
```bash
pip install cmake
pip install dlib-binary  # Pre-compiled binary
pip install face-recognition
```

**Mac:**
```bash
brew install cmake
pip install dlib
pip install face-recognition
```

**Linux:**
```bash
sudo apt-get install cmake
sudo apt-get install python3-dev
pip install dlib
pip install face-recognition
```

---

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will run on `http://localhost:5173`

---

## 📝 Usage Guide

### Step 1: Upload Profile Picture
1. Login to your account
2. Navigate to **Profile** → **Personal Info**
3. Click **"Upload Photo"**
4. Select a clear, well-lit photo with **only your face**
5. System will validate:
   - Exactly one face detected
   - Good image quality
   - Supported format (JPG, PNG, WEBP)
6. If validation passes, photo is uploaded to Supabase storage

### Step 2: Add Test Questions
Before users can take tests, you need to add questions to the database:

```sql
-- Example: Add Python MCQ question
INSERT INTO test_questions (
    skill_id, 
    question_type, 
    difficulty_level, 
    question_text, 
    options, 
    correct_answer, 
    points
)
VALUES (
    'YOUR_SKILL_ID_HERE',  -- Get from skills_master table
    'MCQ',
    'Easy',
    'What is the output of: print(type([]))?',
    '[
        {"option_id": "A", "option_text": "<class ''list''>"},
        {"option_id": "B", "option_text": "<class ''tuple''>"},
        {"option_id": "C", "option_text": "<class ''dict''>"},
        {"option_id": "D", "option_text": "<class ''set''>"}
    ]'::jsonb,
    'A',
    1
);
```

**Note**: You need at least **30 questions** per skill for a full test.

### Step 3: Take a Proctored Test
1. Go to **Profile** → **Technical Skills**
2. Click **"Take Test"** on any claimed skill
3. Review test instructions
4. Click **"Enable Camera"** when prompted
5. Allow camera access in browser
6. Click **"Start Test"**
7. Answer all 30 questions
8. Submit when complete
9. View detailed results

---

## 🔧 Configuration

### Backend Configuration (`backend/.env`)
```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_role_key
SECRET_KEY=your_jwt_secret
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### Frontend Configuration
API base URL is configured in `frontend/src/services/api.js`:
```javascript
const API_BASE_URL = 'http://localhost:8000';
```

---

## 🎮 System Features

### Proctoring Features
- **Live Face Verification**: Captures and verifies face every 30 seconds
- **Tab Switch Detection**: Logs when user switches tabs
- **Multiple Face Detection**: Flags if multiple faces detected
- **No Face Detection**: Flags if no face visible
- **Violation Tracking**: All violations logged with severity

### Test Features
- **45-minute time limit**
- **30 questions per test**
- **MCQ, Coding, and Short Answer support**
- **Question navigation**
- **Mark for review**
- **Auto-submit on timeout**
- **Detailed results with statistics**

### Verification Status
- **Passing Score**: 70%
- **Max Attempts**: 3 per skill
- **Verification**: Automatic upon passing
- **High Violations**: Can cause failure even with passing score

---

## 📊 Database Schema

### Key Tables
- `test_questions` - Question bank
- `test_sessions` - Test attempts
- `session_questions` - Questions for each session
- `test_answers` - User answers
- `proctoring_violations` - Violation logs
- `face_verification_logs` - Face match logs

### Relationships
```
test_sessions
  ├── session_questions → test_questions
  ├── test_answers
  ├── proctoring_violations
  └── face_verification_logs
```

---

## 🐛 Troubleshooting

### Face Recognition Installation Issues
**Problem**: `dlib` or `face_recognition` won't install

**Solution**:
1. Install Visual C++ Build Tools (Windows)
2. Use pre-compiled binaries: `pip install dlib-binary`
3. Or use alternative: `pip install deepface` (heavier but easier to install)

### Camera Permission Denied
**Problem**: Browser denies camera access

**Solution**:
1. Check browser permissions
2. Ensure HTTPS (or localhost)
3. Try different browser
4. Check system camera settings

### Face Not Detected
**Problem**: "No face detected in image"

**Solution**:
1. Use better lighting
2. Face camera directly
3. Remove glasses/hat
4. Use higher quality camera
5. Ensure only ONE face in frame

### Storage Upload Fails
**Problem**: Profile picture upload fails

**Solution**:
1. Verify bucket name exactly matches: `Profile Picture Storage`
2. Check storage policies are applied
3. Ensure bucket is public
4. Check file size (<5MB)
5. Verify image format (JPG/PNG/WEBP)

---

## 🔐 Security Considerations

### Face Matching Threshold
Default: `0.6` (can be adjusted in `utils/face_verification.py`)
- Lower = Stricter matching
- Higher = More lenient

### Violation Limits
- Maximum 5 violations before marking test as failed
- Configurable in `routes/test.py`

### Data Privacy
- Face images not stored permanently
- Only verification logs kept
- Profile pictures in secure storage
- RLS policies enforce user privacy

---

## 📈 Performance Optimization

### Face Verification
- Runs every 30 seconds (configurable)
- Uses lightweight `face_recognition` library
- Canvas-based frame capture (no server upload until verification)

### Database Queries
- Indexes on all foreign keys
- Optimized joins for question retrieval
- Cached session data

---

## 🎓 Adding New Skills/Questions

### 1. Add Skill to Database
```sql
INSERT INTO skills_master (skill_name, skill_category)
VALUES ('Python', 'Programming');
```

### 2. Add Questions (at least 30)
Use the SQL template in `database_setup.sql` section 10

### 3. Test the Flow
1. Student claims the skill
2. Student uploads profile picture
3. Student takes test
4. System verifies and updates status

---

## 📞 Support

For issues or questions:
1. Check logs in browser console
2. Check backend logs (`uvicorn` output)
3. Verify Supabase tables and policies
4. Test API endpoints individually

---

## ✅ Checklist

- [ ] Supabase project created
- [ ] SQL schema executed
- [ ] Storage bucket created with correct name
- [ ] Storage policies applied
- [ ] Backend dependencies installed
- [ ] Face recognition libraries working
- [ ] Backend server running
- [ ] Frontend dependencies installed
- [ ] Frontend server running
- [ ] Profile picture uploaded successfully
- [ ] Test questions added (minimum 30 per skill)
- [ ] Test taken successfully
- [ ] Results displayed correctly

---

## 🎉 Success!

Your web proctored test system is now fully operational!

**Next Steps:**
1. Add more test questions
2. Customize violation thresholds
3. Add more skills
4. Monitor test results
5. Analyze proctoring data

---

**Built with intelligence!** 🚀
