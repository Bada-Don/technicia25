# Quick Start Guide

## ✅ What Has Been Connected

### Frontend → Backend Integration Complete!

All authentication pages are now connected to your FastAPI backend:

1. ✅ **Student Login** (`/login`) → `/auth/login`
2. ✅ **Student Signup** (`/signup-students`, `/talent`) → `/auth/register/student`
3. ✅ **Teacher Login** (`/login-teachers`) → `/auth/login`
4. ✅ **Teacher Signup** (`/signup-teachers`) → `/auth/register/educator`
5. ✅ **Company Login** (`/company/login`) → `/auth/login`
6. ✅ **Company Signup** (`/signup`) → `/auth/register/company`

### New Features Added

1. **API Service** (`frontend/src/services/api.js`)

   - Centralized axios instance
   - Automatic JWT token inclusion
   - Error handling

2. **Authentication Context** (`frontend/src/context/AuthContext.jsx`)

   - Global auth state management
   - Login/Register/Logout functions
   - User data persistence

3. **Protected Routes** (`frontend/src/components/ProtectedRoute.jsx`)

   - Automatic redirect to login if not authenticated
   - Protection for profile, jobs, application pages

4. **Complete Signup Pages**
   - Student signup page created
   - Teacher signup page created
   - Company signup form updated

## 🚀 How to Run

### 1. Start Backend (Terminal 1)

```bash
cd backend
uvicorn main:app --reload
```

Backend will run on: `http://localhost:8000`

### 2. Start Frontend (Terminal 2)

```bash
cd frontend
npm run dev
```

Frontend will run on: `http://localhost:5173`

## 🧪 Test the Connection

### Quick Test Flow:

1. Open `http://localhost:5173`
2. Click on Student Signup (or go to `/signup-students`)
3. Fill in: First Name, Last Name, Email, Password
4. Click "Sign Up" → Should redirect to `/profile`
5. Try to access `/profile` directly after logout → Should redirect to `/login`

## 📋 All Available Routes

### Public Routes (No Auth Required)

- `/` - Home page
- `/login` - Student login
- `/login-teachers` - Teacher login
- `/company/login` - Company login
- `/signup-students` - Student signup
- `/signup-teachers` - Teacher signup
- `/signup` - Company signup
- `/talent` - Talent form (Student signup alternative)
- `/leaderboard` - Leaderboard

### Protected Routes (Auth Required)

- `/profile` - User profile
- `/company/profile` - Company profile
- `/jobs` - Job listings
- `/application` - Application status
- `/test` - Test page

## ❓ Questions or Issues?

### Backend not starting?

- Check if port 8000 is available
- Verify `.env` file exists in backend folder
- Check Supabase credentials

### Frontend not connecting?

- Verify backend is running on port 8000
- Check browser console for errors
- Clear localStorage if having auth issues

### Token issues?

- Open browser DevTools → Application → Local Storage
- Check for `access_token` and `user` keys
- Clear them to logout

## 📝 Next Steps (Optional Improvements)

1. **Add Logout Button** - Implement logout in Header component
2. **Better Error Messages** - Add toast notifications
3. **Form Validation** - Add client-side validation
4. **Loading Indicators** - Improve loading states
5. **Password Reset** - Add forgot password flow

## 📚 For More Details

See `AUTHENTICATION_SETUP.md` for comprehensive documentation.
