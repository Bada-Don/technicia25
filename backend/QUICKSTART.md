# 🚀 Quick Start Guide

Follow these steps to get your backend up and running in minutes!

## Step 1: Setup Supabase

### 1.1 Create Supabase Project
1. Go to https://supabase.com
2. Sign up or log in
3. Click "New Project"
4. Fill in project details:
   - Name: `technicia-platform`
   - Database Password: (save this!)
   - Region: Choose closest to you
5. Wait for project to be ready (~2 minutes)

### 1.2 Run the SQL Schema
1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy all content from `Schema.sql` file
4. Paste it into the SQL editor
5. Click **Run** (or press Ctrl+Enter)
6. Wait for completion (~30 seconds)

### 1.3 Get Your API Keys
1. Go to **Project Settings** (gear icon)
2. Click **API** in the left sidebar
3. Copy these values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public** key (starts with `eyJh...`)
   - **service_role** key (starts with `eyJh...`) - Keep this SECRET!

## Step 2: Setup Python Environment

### 2.1 Install Python (if needed)
```powershell
# Check if Python is installed
python --version

# Should show Python 3.9 or higher
# If not, download from: https://www.python.org/downloads/
```

### 2.2 Create Virtual Environment (Recommended)
```powershell
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate it
.\venv\Scripts\activate

# You should see (venv) in your prompt
```

### 2.3 Install Dependencies
```powershell
pip install -r requirements.txt
```

This will install:
- FastAPI (web framework)
- Supabase client
- JWT authentication
- Password hashing
- And more...

## Step 3: Configure Environment Variables

### 3.1 Create .env file
```powershell
# Copy the example file
copy .env.example .env
```

### 3.2 Generate Secret Key
```powershell
# Generate a secure random key
python -c "import secrets; print(secrets.token_hex(32))"

# Copy the output (looks like: a1b2c3d4e5f6...)
```

### 3.3 Edit .env file
Open `.env` in your text editor and fill in:

```env
# Paste your Supabase values here
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Paste the generated secret key
SECRET_KEY=a1b2c3d4e5f6...

# These can stay as default
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
APP_NAME=Technicia Platform
DEBUG=True
```

**Important:** Never commit the `.env` file to git!

## Step 4: Run the Backend

### 4.1 Start the Server
```powershell
python main.py
```

You should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete.
```

### 4.2 Test the Server
Open your browser and go to:
- http://localhost:8000 - Should show welcome message
- http://localhost:8000/docs - Interactive API documentation (Swagger UI)
- http://localhost:8000/health - Should return `{"status": "healthy"}`

## Step 5: Test Authentication

### Option A: Using the Test Script (Easiest)

```powershell
# Open a new terminal (keep the server running)
python test_auth.py
```

This will automatically test:
- ✅ Student registration
- ✅ Educator registration  
- ✅ Company registration
- ✅ Login for all user types
- ✅ Getting user info
- ✅ Error cases

### Option B: Using Swagger UI (Interactive)

1. Go to http://localhost:8000/docs
2. Click on **POST /auth/register/student**
3. Click "Try it out"
4. Edit the example:
   ```json
   {
     "email": "mystudent@example.com",
     "password": "password123",
     "first_name": "John",
     "last_name": "Doe"
   }
   ```
5. Click "Execute"
6. You should get a 201 response with an access token!

7. Test login:
   - Click on **POST /auth/login**
   - Click "Try it out"
   - Enter your email and password
   - Click "Execute"
   - Copy the `access_token` from response

8. Test protected endpoint:
   - Click on **GET /auth/me**
   - Click "Try it out"
   - Click the 🔓 lock icon
   - Paste your token
   - Click "Authorize" then "Close"
   - Click "Execute"
   - You should see your user info!

### Option C: Using cURL

```powershell
# Register a student
curl -X POST http://localhost:8000/auth/register/student `
  -H "Content-Type: application/json" `
  -d '{
    \"email\": \"test@example.com\",
    \"password\": \"password123\",
    \"first_name\": \"Test\",
    \"last_name\": \"User\"
  }'

# Login
curl -X POST http://localhost:8000/auth/login `
  -H "Content-Type: application/json" `
  -d '{
    \"email\": \"test@example.com\",
    \"password\": \"password123\"
  }'

# Get user info (replace TOKEN with actual token)
curl -X GET http://localhost:8000/auth/me `
  -H "Authorization: Bearer TOKEN"
```

## 🎉 Success!

Your backend is now running! You have:
- ✅ FastAPI server running on port 8000
- ✅ Supabase database connected
- ✅ Authentication system working
- ✅ JWT token generation
- ✅ Three user types (Student, Educator, Company)

## 📊 Verify in Supabase

1. Go to your Supabase dashboard
2. Click **Table Editor**
3. Select `users` table
4. You should see your registered users!
5. Check `student_profiles`, `educator_profiles`, or `company_profiles` too

## 🐛 Common Issues

### "Module not found" error
```powershell
# Make sure virtual environment is activated
.\venv\Scripts\activate

# Reinstall dependencies
pip install -r requirements.txt
```

### "Connection refused" to Supabase
- Check your SUPABASE_URL in `.env`
- Make sure you copied the full URL with `https://`
- Verify your project is active in Supabase dashboard

### "Invalid credentials" error
- Check SUPABASE_KEY and SUPABASE_SERVICE_KEY
- Make sure you copied the full keys (they're very long!)
- Don't include quotes in the .env file

### Port 8000 already in use
```powershell
# Use a different port
uvicorn main:app --reload --port 8001
```

## 🔄 Next Steps

Now that authentication is working, you can:

1. **Build Frontend Integration** - Connect your React app to these APIs
2. **Add Profile Management** - Allow users to update their profiles
3. **Implement Skills System** - Add skills and assessments
4. **Create Course Management** - Let educators create courses
5. **Build Job Board** - Enable companies to post jobs

## 💡 Development Tips

- Keep the server running with `--reload` flag for auto-restart
- Use Swagger UI (http://localhost:8000/docs) for API testing
- Check Supabase logs for database queries
- Use the test script for quick regression testing
- Keep your `.env` file secret and never commit it!

## 📚 Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Supabase Documentation](https://supabase.com/docs)
- [JWT.io](https://jwt.io/) - Debug JWT tokens
- [Pydantic Docs](https://docs.pydantic.dev/) - Data validation

## 🆘 Need Help?

If you encounter issues:
1. Check the console output for error messages
2. Verify all environment variables are set correctly
3. Make sure Supabase schema was executed successfully
4. Try the test script to isolate the issue
5. Check the README.md for more detailed documentation

Happy coding! 🚀
