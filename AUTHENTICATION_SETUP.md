# Authentication Setup Documentation

## Overview

The frontend and backend are now fully connected with a complete authentication system.

## Backend Configuration

### API Endpoints

The FastAPI backend runs on **port 8000** and provides the following authentication endpoints:

- `POST /auth/register/student` - Register a new student
- `POST /auth/register/educator` - Register a new educator/teacher
- `POST /auth/register/company` - Register a new company
- `POST /auth/login` - Login for all user types (returns JWT token)
- `GET /auth/me` - Get current authenticated user info

### Starting the Backend

```bash
cd backend
uvicorn main:app --reload
```

The backend will be available at `http://localhost:8000`

## Frontend Configuration

### API Service

- **Location**: `frontend/src/services/api.js`
- **Base URL**: `http://localhost:8000`
- Automatically includes JWT token in request headers
- Handles 401 errors by clearing tokens and redirecting to login

### Authentication Context

- **Location**: `frontend/src/context/AuthContext.jsx`
- Provides authentication state and functions across the app
- Functions available:
  - `login(email, password)` - Login user
  - `register(endpoint, userData)` - Register new user
  - `logout()` - Logout user
  - `user` - Current user data
  - `isAuthenticated` - Boolean authentication status

### Starting the Frontend

```bash
cd frontend
npm run dev
```

The frontend will be available at `http://localhost:5173`

## Authentication Pages

### Student Pages

1. **Signup**:

   - Routes: `/signup-students` or `/talent` (TalentForm)
   - Fields: First Name, Last Name, Email, Password
   - Endpoint: `/auth/register/student`

2. **Login**:
   - Route: `/login`
   - Redirects to `/profile` after success

### Teacher/Educator Pages

1. **Signup**:

   - Route: `/signup-teachers`
   - Fields: First Name, Last Name, Email, Password
   - Endpoint: `/auth/register/educator`

2. **Login**:
   - Route: `/login-teachers`
   - Redirects to `/profile` after success

### Company Pages

1. **Signup**:

   - Route: `/signup`
   - Fields: Company Name, Recruiter Contact Name, Email, Password
   - Endpoint: `/auth/register/company`

2. **Login**:
   - Route: `/company/login`
   - Redirects to `/company/profile` after success

## Protected Routes

The following routes require authentication:

- `/profile` - User profile page
- `/company/profile` - Company profile page
- `/jobs` - Job listings
- `/application` - Application status
- `/test` - Test page

If a user tries to access these without being logged in, they will be redirected to `/login`.

## Token Storage

- **Access Token**: Stored in `localStorage` as `access_token`
- **User Data**: Stored in `localStorage` as `user` (JSON string)
- Tokens are automatically included in all API requests via axios interceptors

## User Roles

The backend supports three user roles:

- `Student` - Students looking for jobs/courses
- `Educator` - Teachers/educators
- `Company` - Companies posting jobs

After login, users are redirected based on their role:

- Students/Educators → `/profile`
- Companies → `/company/profile`

## Testing the Integration

### 1. Start the Backend

```bash
cd backend
uvicorn main:app --reload
```

### 2. Start the Frontend

```bash
cd frontend
npm run dev
```

### 3. Test Student Registration

1. Navigate to `http://localhost:5173/signup-students`
2. Fill in the form (First Name, Last Name, Email, Password)
3. Click "Sign Up"
4. Should redirect to `/profile` on success

### 4. Test Student Login

1. Navigate to `http://localhost:5173/login`
2. Enter the email and password you registered with
3. Click "Continue"
4. Should redirect to `/profile` on success

### 5. Test Protected Routes

1. Logout (clear localStorage or implement logout button)
2. Try to access `http://localhost:5173/profile`
3. Should redirect to `/login`

## Common Issues

### Issue: CORS Error

**Solution**: Make sure the backend is running and CORS is configured to allow `http://localhost:5173`

### Issue: 404 on API calls

**Solution**: Verify the backend is running on port 8000 and the endpoints exist

### Issue: Token not being sent

**Solution**: Check that the token is stored in localStorage as `access_token`

### Issue: Authentication persists after page reload

**Solution**: This is expected behavior - tokens are stored in localStorage

## Next Steps

### Missing Features to Implement:

1. **Logout Functionality**: Add a logout button in the Header component
2. **User Profile Completion**: Add forms to complete user profiles with additional information
3. **Password Reset**: Implement forgot password functionality
4. **Email Verification**: Add email verification flow
5. **Social Login**: Integrate Google/LinkedIn OAuth (buttons are already in UI)
6. **Error Handling**: Improve error messages and validation
7. **Loading States**: Add better loading indicators

### Recommended Improvements:

1. Add form validation (email format, password strength)
2. Add success notifications/toasts
3. Implement refresh token mechanism
4. Add remember me functionality
5. Secure localStorage (consider more secure storage options for production)

## Environment Variables

Make sure you have a `.env` file in the backend with:

```
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
SUPABASE_SERVICE_KEY=your_supabase_service_key
SECRET_KEY=your_jwt_secret_key
```

## Questions or Issues?

If you encounter any issues or have questions about the authentication setup, check:

1. Backend logs for API errors
2. Browser console for frontend errors
3. Network tab to see API requests/responses
4. Backend database to verify user creation
