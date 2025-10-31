import requests
import json

# Test signup
print("Testing signup...")
response = requests.post("http://127.0.0.1:8000/api/weather/auth/signup", json={
    "username": "newuser123",
    "email": "newuser@example.com",
    "password": "testpass123"
})

print(f"Status: {response.status_code}")
try:
    print(f"Response: {json.dumps(response.json(), indent=2)}")
except:
    print(f"Response text: {response.text}")

if response.status_code == 201:
    data = response.json()
    token = data.get("token")
    print(f"\n✓ Signup successful! Token: {token[:20]}...")
    
    # Test get current user
    print("\nTesting get current user...")
    me_response = requests.get(
        "http://127.0.0.1:8000/api/weather/auth/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    print(f"Status: {me_response.status_code}")
    print(f"Response: {json.dumps(me_response.json(), indent=2)}")
    
    # Test protected endpoint
    print("\nTesting protected endpoint (weather requests)...")
    wr_response = requests.get(
        "http://127.0.0.1:8000/api/weather/weather-requests",
        headers={"Authorization": f"Bearer {token}"}
    )
    print(f"Status: {wr_response.status_code}")
    print(f"Response: {json.dumps(wr_response.json(), indent=2)}")
else:
    print(f"\n✗ Signup failed!")
