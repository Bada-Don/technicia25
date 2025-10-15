# Technicia Platform Backend

AI-Powered Education & Career Readiness Platform Backend built with FastAPI and Supabase.

## 📋 Prerequisites

- Python 3.9+
- Supabase account and project
- PostgreSQL database (via Supabase)

## 🚀 Setup Instructions

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Setup Supabase Database

1. Create a new Supabase project at https://supabase.com
2. Run the SQL schema in `Schema.sql` in your Supabase SQL Editor
3. Get your project credentials:
   - Project URL
   - Anon/Public Key
   - Service Role Key (keep this secret!)

### 3. Configure Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Update the `.env` file with your credentials:

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_role_key

# Generate a secure secret key using:
# openssl rand -hex 32
SECRET_KEY=your_generated_secret_key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

APP_NAME=Technicia Platform
DEBUG=True
```

### 4. Run the Server

```bash
python main.py
```

Or using uvicorn directly:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at: http://localhost:8000

## 📚 API Documentation

Once the server is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 🔐 Authentication Endpoints

### Register Student
```http
POST /auth/register/student
Content-Type: application/json

{
  "email": "student@example.com",
  "password": "password123",
  "first_name": "John",
  "last_name": "Doe"
}
```

### Register Educator
```http
POST /auth/register/educator
Content-Type: application/json

{
  "email": "educator@example.com",
  "password": "password123",
  "first_name": "Jane",
  "last_name": "Smith"
}
```

### Register Company
```http
POST /auth/register/company
Content-Type: application/json

{
  "email": "company@example.com",
  "password": "password123",
  "company_name": "Tech Corp",
  "recruiter_contact_name": "HR Manager"
}
```

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "student@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

### Get Current User
```http
GET /auth/me
Authorization: Bearer <your_access_token>
```

## 🧪 Testing with cURL

### 1. Register a Student
```bash
curl -X POST http://localhost:8000/auth/register/student \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@test.com",
    "password": "password123",
    "first_name": "Test",
    "last_name": "Student"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@test.com",
    "password": "password123"
  }'
```

### 3. Get User Info (replace TOKEN with your actual token)
```bash
curl -X GET http://localhost:8000/auth/me \
  -H "Authorization: Bearer TOKEN"
```

## 🧪 Testing with Python Requests

Create a file `test_auth.py`:

```python
import requests
import json

BASE_URL = "http://localhost:8000"

# Test Student Registration
def test_register_student():
    response = requests.post(
        f"{BASE_URL}/auth/register/student",
        json={
            "email": "teststudent@example.com",
            "password": "securepass123",
            "first_name": "Test",
            "last_name": "Student"
        }
    )
    print("Register Student:", response.status_code)
    print(json.dumps(response.json(), indent=2))
    return response.json()

# Test Login
def test_login(email, password):
    response = requests.post(
        f"{BASE_URL}/auth/login",
        json={
            "email": email,
            "password": password
        }
    )
    print("Login:", response.status_code)
    data = response.json()
    print(json.dumps(data, indent=2))
    return data.get("access_token")

# Test Get Current User
def test_get_me(token):
    response = requests.get(
        f"{BASE_URL}/auth/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    print("Get Me:", response.status_code)
    print(json.dumps(response.json(), indent=2))

if __name__ == "__main__":
    # Register
    registration = test_register_student()
    
    # Login
    token = test_login("teststudent@example.com", "securepass123")
    
    # Get user info
    if token:
        test_get_me(token)
```

Run it:
```bash
python test_auth.py
```

## 📁 Project Structure

```
backend/
├── main.py                 # FastAPI application entry point
├── config.py              # Configuration settings
├── database.py            # Supabase client initialization
├── requirements.txt       # Python dependencies
├── .env.example          # Environment variables template
├── Schema.sql            # Database schema
├── models/
│   ├── __init__.py
│   └── user.py           # User data models
├── routes/
│   ├── __init__.py
│   └── auth.py           # Authentication endpoints
└── utils/
    ├── __init__.py
    └── security.py       # Security utilities (JWT, hashing)
```

## 🔒 Security Features

- ✅ Password hashing using bcrypt
- ✅ JWT token-based authentication
- ✅ Email validation
- ✅ Password strength requirements (min 8 characters)
- ✅ Role-based user types (Student, Educator, Company)
- ✅ Supabase Row Level Security (RLS) ready

## 🚧 Next Steps

1. ✅ Basic authentication system
2. 🔄 Profile management endpoints
3. 🔄 Skills and assessments
4. 🔄 Course management
5. 🔄 Job postings and applications
6. 🔄 Leaderboard system
7. 🔄 Analytics and insights

## 🐛 Troubleshooting

### Database Connection Issues
- Verify Supabase URL and keys in `.env`
- Check if database schema is properly created
- Ensure your IP is allowed in Supabase project settings

### Import Errors
- Make sure all dependencies are installed: `pip install -r requirements.txt`
- Check Python version: `python --version` (should be 3.9+)

### Authentication Errors
- Verify JWT secret key is set in `.env`
- Check token expiration time
- Ensure Bearer token format in Authorization header

## 📞 Support

For issues or questions, please create an issue in the repository.
