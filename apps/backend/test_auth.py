import requests
import json

BASE_URL = "http://127.0.0.1:8000/api"

def test_signup():
    print("\n=== Testing Signup ===")
    response = requests.post(f"{BASE_URL}/weather/auth/signup", json={
        "username": "testuser",
        "email": "test@example.com",
        "password": "testpass123"
    })
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    return response.json()

def test_login(username, password):
    print("\n=== Testing Login ===")
    response = requests.post(f"{BASE_URL}/weather/auth/login", json={
        "username": username,
        "password": password
    })
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    return response.json()

def test_me(token):
    print("\n=== Testing Get Current User ===")
    response = requests.get(
        f"{BASE_URL}/weather/auth/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")

def test_protected_endpoint(token):
    print("\n=== Testing Protected Endpoint (Get Weather Requests) ===")
    response = requests.get(
        f"{BASE_URL}/weather/weather-requests",
        headers={"Authorization": f"Bearer {token}"}
    )
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")

if __name__ == "__main__":
    # Test signup
    signup_response = test_signup()
    
    if signup_response.get("token"):
        token = signup_response["token"]
        
        # Test the other endpoints with the token
        test_me(token)
        test_protected_endpoint(token)
        
        # Test login
        login_response = test_login("testuser", "testpass123")
        
        print("\n=== All Tests Complete ===")
    else:
        print("\nSignup failed, trying to login with existing user...")
        login_response = test_login("testuser", "testpass123")
        
        if login_response.get("token"):
            token = login_response["token"]
            test_me(token)
            test_protected_endpoint(token)
