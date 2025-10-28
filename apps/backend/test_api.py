"""
Test script for Weather API
Run this to test the Open-Meteo integration
"""
import requests
import json

BASE_URL = "http://127.0.0.1:8000/api/weather"


def test_search_location():
    """Test location search"""
    print("\n=== Testing Location Search ===")
    response = requests.get(f"{BASE_URL}/search", params={"q": "London"})
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")


def test_current_weather():
    """Test current weather"""
    print("\n=== Testing Current Weather ===")
    # London coordinates
    response = requests.get(f"{BASE_URL}/current", params={"lat": 51.5074, "lon": -0.1278})
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")


def test_forecast():
    """Test daily forecast"""
    print("\n=== Testing Daily Forecast ===")
    response = requests.get(f"{BASE_URL}/forecast", params={"lat": 51.5074, "lon": -0.1278, "days": 5})
    print(f"Status: {response.status_code}")
    data = response.json()
    if 'forecast' in data:
        print(f"Got {len(data['forecast'])} days of forecast")
        print(f"First day: {json.dumps(data['forecast'][0], indent=2)}")


def test_hourly_forecast():
    """Test hourly forecast"""
    print("\n=== Testing Hourly Forecast ===")
    response = requests.get(f"{BASE_URL}/hourly", params={"lat": 51.5074, "lon": -0.1278, "hours": 12})
    print(f"Status: {response.status_code}")
    data = response.json()
    if 'hourly' in data:
        print(f"Got {len(data['hourly'])} hours of forecast")
        print(f"First hour: {json.dumps(data['hourly'][0], indent=2)}")


def test_complete_weather():
    """Test complete weather data"""
    print("\n=== Testing Complete Weather ===")
    response = requests.get(f"{BASE_URL}/complete", params={"q": "New York", "days": 3})
    print(f"Status: {response.status_code}")
    data = response.json()
    if 'location' in data:
        print(f"Location: {data['location']['name']}, {data['location']['country']}")
        print(f"Current temp: {data['current']['temperature']}°C")
        print(f"Forecast days: {len(data['forecast'])}")


if __name__ == "__main__":
    print("Weather API Test Script")
    print("Make sure the Django server is running on http://127.0.0.1:8000")
    
    try:
        test_search_location()
        test_current_weather()
        test_forecast()
        test_hourly_forecast()
        test_complete_weather()
        
        print("\n=== All Tests Complete ===")
        
    except requests.exceptions.ConnectionError:
        print("\nERROR: Could not connect to server. Make sure it's running!")
    except Exception as e:
        print(f"\nERROR: {e}")
