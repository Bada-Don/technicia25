import requests
import json

BASE_URL = "http://localhost:8000"

def print_response(title, response):
    """Pretty print response"""
    print(f"\n{'='*60}")
    print(f"🔍 {title}")
    print(f"{'='*60}")
    print(f"Status Code: {response.status_code}")
    try:
        print(f"Response:\n{json.dumps(response.json(), indent=2)}")
    except:
        print(f"Response: {response.text}")
    print(f"{'='*60}\n")


def test_register_student():
    """Test student registration"""
    response = requests.post(
        f"{BASE_URL}/auth/register/student",
        json={
            "email": "teststudent@example.com",
            "password": "securepass123",
            "first_name": "Test",
            "last_name": "Student"
        }
    )
    print_response("Register Student", response)
    return response.json() if response.status_code == 201 else None


def test_register_educator():
    """Test educator registration"""
    response = requests.post(
        f"{BASE_URL}/auth/register/educator",
        json={
            "email": "testeducator@example.com",
            "password": "securepass123",
            "first_name": "Test",
            "last_name": "Educator"
        }
    )
    print_response("Register Educator", response)
    return response.json() if response.status_code == 201 else None


def test_register_company():
    """Test company registration"""
    response = requests.post(
        f"{BASE_URL}/auth/register/company",
        json={
            "email": "testcompany@example.com",
            "password": "securepass123",
            "company_name": "Test Tech Corp",
            "recruiter_contact_name": "HR Manager"
        }
    )
    print_response("Register Company", response)
    return response.json() if response.status_code == 201 else None


def test_login(email, password):
    """Test login"""
    response = requests.post(
        f"{BASE_URL}/auth/login",
        json={
            "email": email,
            "password": password
        }
    )
    print_response(f"Login - {email}", response)
    return response.json().get("access_token") if response.status_code == 200 else None


def test_get_me(token):
    """Test get current user info"""
    response = requests.get(
        f"{BASE_URL}/auth/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    print_response("Get Current User Info", response)
    return response.json() if response.status_code == 200 else None


def test_duplicate_registration():
    """Test duplicate email registration (should fail)"""
    response = requests.post(
        f"{BASE_URL}/auth/register/student",
        json={
            "email": "teststudent@example.com",
            "password": "securepass123",
            "first_name": "Duplicate",
            "last_name": "User"
        }
    )
    print_response("Duplicate Registration (Should Fail)", response)


def test_invalid_login():
    """Test login with wrong password (should fail)"""
    response = requests.post(
        f"{BASE_URL}/auth/login",
        json={
            "email": "teststudent@example.com",
            "password": "wrongpassword"
        }
    )
    print_response("Invalid Login (Should Fail)", response)


def test_invalid_token():
    """Test accessing protected route with invalid token (should fail)"""
    response = requests.get(
        f"{BASE_URL}/auth/me",
        headers={"Authorization": "Bearer invalid_token_here"}
    )
    print_response("Invalid Token (Should Fail)", response)


def main():
    print("🚀 Starting Authentication Tests")
    print("Make sure the backend server is running on http://localhost:8000\n")
    
    try:
        # Test health check
        health = requests.get(f"{BASE_URL}/health")
        print_response("Health Check", health)
        
        # Test 1: Register Student
        print("\n📝 TEST 1: Register Student")
        student_data = test_register_student()
        
        # Test 2: Register Educator
        print("\n📝 TEST 2: Register Educator")
        educator_data = test_register_educator()
        
        # Test 3: Register Company
        print("\n📝 TEST 3: Register Company")
        company_data = test_register_company()
        
        # Test 4: Login Student
        print("\n📝 TEST 4: Login Student")
        student_token = test_login("teststudent@example.com", "securepass123")
        
        # Test 5: Login Educator
        print("\n📝 TEST 5: Login Educator")
        educator_token = test_login("testeducator@example.com", "securepass123")
        
        # Test 6: Login Company
        print("\n📝 TEST 6: Login Company")
        company_token = test_login("testcompany@example.com", "securepass123")
        
        # Test 7: Get Current User Info (Student)
        if student_token:
            print("\n📝 TEST 7: Get Student Info")
            test_get_me(student_token)
        
        # Test 8: Get Current User Info (Educator)
        if educator_token:
            print("\n📝 TEST 8: Get Educator Info")
            test_get_me(educator_token)
        
        # Test 9: Get Current User Info (Company)
        if company_token:
            print("\n📝 TEST 9: Get Company Info")
            test_get_me(company_token)
        
        # Test 10: Duplicate Registration
        print("\n📝 TEST 10: Duplicate Registration")
        test_duplicate_registration()
        
        # Test 11: Invalid Login
        print("\n📝 TEST 11: Invalid Login")
        test_invalid_login()
        
        # Test 12: Invalid Token
        print("\n📝 TEST 12: Invalid Token")
        test_invalid_token()
        
        print("\n✅ All tests completed!")
        
    except requests.exceptions.ConnectionError:
        print("❌ Error: Cannot connect to the backend server.")
        print("Make sure the server is running: python main.py")
    except Exception as e:
        print(f"❌ Error: {str(e)}")


if __name__ == "__main__":
    main()
