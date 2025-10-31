"""
Weather API Controllers
Handles HTTP requests and responses for weather endpoints
"""
from ninja import Router, Schema
from ninja.security import HttpBearer
from typing import List, Optional
from datetime import date, datetime
from .services import WeatherService
from .models import WeatherRequest
from django.shortcuts import get_object_or_404
from django.core.exceptions import ValidationError
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.contrib.auth.hashers import make_password
import secrets

router = Router()

# Simple token storage (in production, use Django sessions or JWT)
user_tokens = {}


class AuthBearer(HttpBearer):
    def authenticate(self, request, token):
        if token in user_tokens:
            return user_tokens[token]
        return None


# Schemas for request/response validation
class LocationSchema(Schema):
    name: str
    country: str
    latitude: float
    longitude: float
    timezone: str
    admin1: Optional[str] = None


class CurrentWeatherSchema(Schema):
    temperature: float
    feels_like: float
    humidity: int
    precipitation: float
    rain: float
    weather_code: int
    weather_description: str
    cloud_cover: int
    pressure: float
    surface_pressure: float
    wind_speed: float
    wind_direction: int
    wind_gusts: float
    time: str
    timezone: str


class DailyForecastSchema(Schema):
    date: str
    weather_code: int
    weather_description: str
    temperature_max: float
    temperature_min: float
    feels_like_max: float
    feels_like_min: float
    precipitation: float
    rain: float
    precipitation_probability: int
    wind_speed_max: float
    wind_gusts_max: float
    wind_direction: int
    sunrise: str
    sunset: str
    uv_index_max: float


class ForecastResponseSchema(Schema):
    forecast: List[DailyForecastSchema]
    timezone: str


class HourlyForecastItemSchema(Schema):
    time: str
    temperature: float
    feels_like: float
    humidity: int
    precipitation_probability: int
    precipitation: float
    weather_code: int
    weather_description: str
    wind_speed: float
    wind_direction: int


class HourlyForecastResponseSchema(Schema):
    hourly: List[HourlyForecastItemSchema]
    timezone: str


class WeatherResponseSchema(Schema):
    location: LocationSchema
    current: CurrentWeatherSchema
    forecast: List[DailyForecastSchema]


class ErrorSchema(Schema):
    error: str
    message: str


# ============================================================================
# Authentication Schemas
# ============================================================================

class SignupSchema(Schema):
    username: str
    password: str
    first_name: str
    last_name: str


class LoginSchema(Schema):
    username: str
    password: str


class UserSchema(Schema):
    id: int
    username: str
    first_name: str
    last_name: str


class AuthResponseSchema(Schema):
    token: str
    user: UserSchema


# ============================================================================
# CRUD Schemas for Weather Requests
# ============================================================================

class WeatherDataItemSchema(Schema):
    """Schema for individual weather data point in a date range"""
    date: str
    temperature_max: float
    temperature_min: float
    temperature_mean: Optional[float] = None
    feels_like_max: float
    feels_like_min: float
    precipitation: float
    rain: float
    weather_code: int
    weather_description: str
    wind_speed_max: float
    wind_direction: int


class CreateWeatherRequestSchema(Schema):
    """Schema for creating a new weather request"""
    location_name: str
    start_date: date
    end_date: date
    notes: Optional[str] = None
    # Optional: if user wants to specify exact coordinates
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    country: Optional[str] = None
    timezone: Optional[str] = None


class UpdateWeatherRequestSchema(Schema):
    """Schema for updating an existing weather request"""
    location_name: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    notes: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    country: Optional[str] = None
    timezone: Optional[str] = None


class WeatherRequestResponseSchema(Schema):
    """Schema for weather request response"""
    id: int
    location_name: str
    country: str
    latitude: float
    longitude: float
    timezone: str
    start_date: date
    end_date: date
    weather_data: List[WeatherDataItemSchema]
    notes: str
    created_at: datetime
    updated_at: datetime


class WeatherRequestListItemSchema(Schema):
    """Schema for weather request list item (without full weather data)"""
    id: int
    location_name: str
    country: str
    start_date: date
    end_date: date
    notes: str
    created_at: datetime
    updated_at: datetime


class LocationValidationSchema(Schema):
    """Schema for location validation response"""
    valid: bool
    error: Optional[str] = None
    best_match: Optional[LocationSchema] = None
    suggestions: Optional[List[LocationSchema]] = None


class DateRangeValidationSchema(Schema):
    """Schema for date range validation response"""
    valid: bool
    error: Optional[str] = None


# ============================================================================
# Authentication Endpoints
# ============================================================================

@router.post("/auth/signup", response={201: AuthResponseSchema, 400: ErrorSchema})
def signup(request, payload: SignupSchema):
    """
    Sign up a new user
    
    Args:
        payload: User signup data
        
    Returns:
        Authentication token and user info
    """
    # Check if username already exists
    if User.objects.filter(username=payload.username).exists():
        return 400, {"error": "Username exists", "message": "This username is already taken"}
    
    # Validate username
    if len(payload.username) < 3:
        return 400, {"error": "Invalid username", "message": "Username must be at least 3 characters"}
    
    # Validate password
    if len(payload.password) < 6:
        return 400, {"error": "Invalid password", "message": "Password must be at least 6 characters"}
    
    # Validate names
    if not payload.first_name or not payload.last_name:
        return 400, {"error": "Invalid name", "message": "First name and last name are required"}
    
    # Create user
    try:
        user = User.objects.create(
            username=payload.username,
            password=make_password(payload.password),
            first_name=payload.first_name,
            last_name=payload.last_name
        )
        
        # Generate token
        token = secrets.token_urlsafe(32)
        user_tokens[token] = user
        
        return 201, {
            "token": token,
            "user": {
                "id": user.id,
                "username": user.username,
                "first_name": user.first_name,
                "last_name": user.last_name
            }
        }
    except Exception as e:
        return 400, {"error": "Signup failed", "message": str(e)}


@router.post("/auth/login", response={200: AuthResponseSchema, 401: ErrorSchema})
def login(request, payload: LoginSchema):
    """
    Log in a user
    
    Args:
        payload: Login credentials
        
    Returns:
        Authentication token and user info
    """
    user = authenticate(username=payload.username, password=payload.password)
    
    if user is None:
        return 401, {"error": "Invalid credentials", "message": "Invalid username or password"}
    
    # Generate token
    token = secrets.token_urlsafe(32)
    user_tokens[token] = user
    
    return 200, {
        "token": token,
        "user": {
            "id": user.id,
            "username": user.username,
            "first_name": user.first_name,
            "last_name": user.last_name
        }
    }


@router.post("/auth/logout", auth=AuthBearer())
def logout(request):
    """
    Log out a user (invalidate token)
    
    Returns:
        Success message
    """
    # Remove token from storage
    auth_header = request.headers.get('Authorization', '')
    if auth_header.startswith('Bearer '):
        token = auth_header[7:]
        if token in user_tokens:
            del user_tokens[token]
    
    return {"success": True, "message": "Logged out successfully"}


@router.get("/auth/me", auth=AuthBearer(), response={200: UserSchema, 401: ErrorSchema})
def get_current_user(request):
    """
    Get current authenticated user
    
    Returns:
        Current user info
    """
    return 200, {
        "id": request.auth.id,
        "username": request.auth.username,
        "first_name": request.auth.first_name,
        "last_name": request.auth.last_name
    }


# ============================================================================
# Original Weather API Endpoints (existing functionality)
# ============================================================================
@router.get("/search", response={200: List[LocationSchema], 404: ErrorSchema})
def search_location(request, q: str):
    """
    Search for a location by name
    
    Args:
        q: Location query string (city name)
        
    Returns:
        List of matching locations with coordinates
    """
    if not q or len(q) < 2:
        return 404, {"error": "Invalid query", "message": "Query must be at least 2 characters"}
    
    results = WeatherService.geocode_location(q)
    
    if results is None or len(results) == 0:
        return 404, {"error": "Not found", "message": f"No locations found for '{q}'"}
    
    return 200, results


@router.get("/current", response={200: CurrentWeatherSchema, 400: ErrorSchema, 404: ErrorSchema})
def get_current_weather(request, lat: float, lon: float):
    """
    Get current weather for coordinates
    
    Args:
        lat: Latitude
        lon: Longitude
        
    Returns:
        Current weather data
    """
    if not (-90 <= lat <= 90) or not (-180 <= lon <= 180):
        return 400, {"error": "Invalid coordinates", "message": "Latitude must be -90 to 90, longitude -180 to 180"}
    
    current = WeatherService.get_current_weather(lat, lon)
    
    if current is None:
        return 404, {"error": "Not found", "message": "Could not fetch weather data"}
    
    # Add weather description
    current["weather_description"] = WeatherService.get_weather_description(current["weather_code"])
    
    return 200, current


@router.get("/forecast", response={200: ForecastResponseSchema, 400: ErrorSchema, 404: ErrorSchema})
def get_forecast(request, lat: float, lon: float, days: int = 7):
    """
    Get daily weather forecast
    
    Args:
        lat: Latitude
        lon: Longitude
        days: Number of forecast days (1-16, default 7)
        
    Returns:
        Daily forecast data
    """
    if not (-90 <= lat <= 90) or not (-180 <= lon <= 180):
        return 400, {"error": "Invalid coordinates", "message": "Latitude must be -90 to 90, longitude -180 to 180"}
    
    if not (1 <= days <= 16):
        return 400, {"error": "Invalid days", "message": "Days must be between 1 and 16"}
    
    forecast = WeatherService.get_forecast(lat, lon, days)
    
    if forecast is None:
        return 404, {"error": "Not found", "message": "Could not fetch forecast data"}
    
    # Add weather descriptions
    for item in forecast["forecast"]:
        item["weather_description"] = WeatherService.get_weather_description(item["weather_code"])
    
    return 200, forecast


@router.get("/hourly", response={200: HourlyForecastResponseSchema, 400: ErrorSchema, 404: ErrorSchema})
def get_hourly_forecast(request, lat: float, lon: float, hours: int = 24):
    """
    Get hourly weather forecast
    
    Args:
        lat: Latitude
        lon: Longitude
        hours: Number of hours (1-168, default 24)
        
    Returns:
        Hourly forecast data
    """
    if not (-90 <= lat <= 90) or not (-180 <= lon <= 180):
        return 400, {"error": "Invalid coordinates", "message": "Latitude must be -90 to 90, longitude -180 to 180"}
    
    if not (1 <= hours <= 168):
        return 400, {"error": "Invalid hours", "message": "Hours must be between 1 and 168"}
    
    hourly = WeatherService.get_hourly_forecast(lat, lon, hours)
    
    if hourly is None:
        return 404, {"error": "Not found", "message": "Could not fetch hourly forecast data"}
    
    # Add weather descriptions
    for item in hourly["hourly"]:
        item["weather_description"] = WeatherService.get_weather_description(item["weather_code"])
    
    return 200, hourly


@router.get("/complete", response={200: WeatherResponseSchema, 400: ErrorSchema, 404: ErrorSchema})
def get_complete_weather(request, q: str, days: int = 7):
    """
    Get complete weather data (location + current + forecast) by location name
    
    Args:
        q: Location query string
        days: Number of forecast days (1-16, default 7)
        
    Returns:
        Complete weather data including location, current weather, and forecast
    """
    if not q or len(q) < 2:
        return 400, {"error": "Invalid query", "message": "Query must be at least 2 characters"}
    
    # Search for location
    locations = WeatherService.geocode_location(q)
    if not locations:
        return 404, {"error": "Not found", "message": f"No locations found for '{q}'"}
    
    # Use first result
    location = locations[0]
    lat = location["latitude"]
    lon = location["longitude"]
    
    # Get current weather
    current = WeatherService.get_current_weather(lat, lon)
    if current is None:
        return 404, {"error": "Not found", "message": "Could not fetch current weather"}
    
    # Get forecast
    forecast_data = WeatherService.get_forecast(lat, lon, days)
    if forecast_data is None:
        return 404, {"error": "Not found", "message": "Could not fetch forecast"}
    
    # Add weather descriptions
    current["weather_description"] = WeatherService.get_weather_description(current["weather_code"])
    for item in forecast_data["forecast"]:
        item["weather_description"] = WeatherService.get_weather_description(item["weather_code"])
    
    return 200, {
        "location": location,
        "current": current,
        "forecast": forecast_data["forecast"]
    }


# ============================================================================
# CRUD Endpoints for Weather Requests
# ============================================================================

# CRUD Endpoints for Weather Requests
# ============================================================================

@router.get("/validate-location", response={200: LocationValidationSchema, 400: ErrorSchema})
def validate_location(request, location_name: str):
    """
    Validate a location name and get fuzzy match suggestions
    
    Args:
        location_name: Location to validate
        
    Returns:
        Validation result with suggestions
    """
    validation = WeatherService.validate_location(location_name)
    
    if not validation["valid"]:
        # Still return the validation result with suggestions
        return 200, validation
    
    return 200, validation


@router.get("/validate-dates", response={200: DateRangeValidationSchema})
def validate_dates(request, start_date: date, end_date: date):
    """
    Validate a date range
    
    Args:
        start_date: Start date
        end_date: End date
        
    Returns:
        Validation result
    """
    validation = WeatherService.validate_date_range(start_date, end_date)
    return 200, validation


@router.post("/weather-requests", auth=AuthBearer(), response={201: WeatherRequestResponseSchema, 400: ErrorSchema, 401: ErrorSchema})
def create_weather_request(request, payload: CreateWeatherRequestSchema):
    """
    CREATE: Create a new weather request with date range
    Validates location and date range, fetches weather data, and stores in database
    Requires authentication - saves request for the logged-in user
    
    Args:
        payload: Weather request data
        
    Returns:
        Created weather request with weather data
    """
    # Get authenticated user
    user = request.auth
    
    # Validate date range
    date_validation = WeatherService.validate_date_range(payload.start_date, payload.end_date)
    if not date_validation["valid"]:
        return 400, {"error": "Invalid date range", "message": date_validation["error"]}
    
    # Validate and geocode location
    if payload.latitude is not None and payload.longitude is not None:
        # User provided coordinates
        latitude = payload.latitude
        longitude = payload.longitude
        country = payload.country or ""
        timezone = payload.timezone or "UTC"
        location_name = payload.location_name
    else:
        # Validate and geocode location
        location_validation = WeatherService.validate_location(payload.location_name)
        if not location_validation["valid"]:
            return 400, {
                "error": "Invalid location",
                "message": f"{location_validation['error']}. Did you mean one of these? {', '.join([s['name'] for s in location_validation.get('suggestions', [])])}"
            }
        
        best_match = location_validation["best_match"]
        latitude = best_match["latitude"]
        longitude = best_match["longitude"]
        location_name = best_match["name"]
        country = best_match["country"]
        timezone = best_match["timezone"]
    
    # Fetch weather data for date range
    weather_data = WeatherService.get_weather_for_date_range(
        latitude, longitude, payload.start_date, payload.end_date
    )
    
    if weather_data is None:
        return 400, {"error": "Weather data unavailable", "message": "Could not fetch weather data for this location and date range"}
    
    # Create database record for the authenticated user
    try:
        weather_request = WeatherRequest.objects.create(
            user=user,  # Associate with authenticated user
            location_name=location_name,
            country=country,
            latitude=latitude,
            longitude=longitude,
            timezone=weather_data.get("timezone", timezone),
            start_date=payload.start_date,
            end_date=payload.end_date,
            weather_data=weather_data,
            notes=payload.notes or ""
        )
        
        return 201, {
            "id": weather_request.id,
            "location_name": weather_request.location_name,
            "country": weather_request.country,
            "latitude": weather_request.latitude,
            "longitude": weather_request.longitude,
            "timezone": weather_request.timezone,
            "start_date": weather_request.start_date,
            "end_date": weather_request.end_date,
            "weather_data": weather_data.get("daily", []),
            "notes": weather_request.notes,
            "created_at": weather_request.created_at,
            "updated_at": weather_request.updated_at
        }
    except ValidationError as e:
        return 400, {"error": "Validation error", "message": str(e)}


@router.get("/weather-requests", auth=AuthBearer(), response={200: List[WeatherRequestListItemSchema], 401: ErrorSchema})
def list_weather_requests(request, location: Optional[str] = None, limit: int = 50, offset: int = 0):
    """
    READ: Get list of weather requests for the authenticated user (without full weather data)
    Requires authentication - only returns user's own requests
    
    Args:
        location: Optional filter by location name
        limit: Number of results to return
        offset: Offset for pagination
        
    Returns:
        List of user's weather requests
    """
    # Get authenticated user
    user = request.auth
    
    # Filter by user
    queryset = WeatherRequest.objects.filter(user=user)
    
    if location:
        queryset = queryset.filter(location_name__icontains=location)
    
    queryset = queryset[offset:offset + limit]
    
    return 200, [
        {
            "id": wr.id,
            "location_name": wr.location_name,
            "country": wr.country,
            "start_date": wr.start_date,
            "end_date": wr.end_date,
            "notes": wr.notes,
            "created_at": wr.created_at,
            "updated_at": wr.updated_at
        }
        for wr in queryset
    ]


@router.get("/weather-requests/{request_id}", auth=AuthBearer(), response={200: WeatherRequestResponseSchema, 404: ErrorSchema, 403: ErrorSchema, 401: ErrorSchema})
def get_weather_request(request, request_id: int):
    """
    READ: Get a specific weather request by ID with full weather data
    Requires authentication - only returns user's own request
    
    Args:
        request_id: ID of the weather request
        
    Returns:
        Weather request with full weather data
    """
    user = request.auth
    
    try:
        weather_request = WeatherRequest.objects.get(id=request_id, user=user)
        
        return 200, {
            "id": weather_request.id,
            "location_name": weather_request.location_name,
            "country": weather_request.country,
            "latitude": weather_request.latitude,
            "longitude": weather_request.longitude,
            "timezone": weather_request.timezone,
            "start_date": weather_request.start_date,
            "end_date": weather_request.end_date,
            "weather_data": weather_request.weather_data.get("daily", []),
            "notes": weather_request.notes,
            "created_at": weather_request.created_at,
            "updated_at": weather_request.updated_at
        }
    except WeatherRequest.DoesNotExist:
        return 404, {"error": "Not found", "message": f"Weather request with ID {request_id} not found"}


@router.put("/weather-requests/{request_id}", auth=AuthBearer(), response={200: WeatherRequestResponseSchema, 400: ErrorSchema, 404: ErrorSchema, 403: ErrorSchema, 401: ErrorSchema})
def update_weather_request(request, request_id: int, payload: UpdateWeatherRequestSchema):
    """
    UPDATE: Update an existing weather request
    Can update location, date range, and notes
    Requires authentication - only allows updating user's own requests
    If location or dates change, will re-fetch weather data
    
    Args:
        request_id: ID of the weather request to update
        payload: Updated data
        
    Returns:
        Updated weather request
    """
    user = request.auth
    
    try:
        weather_request = WeatherRequest.objects.get(id=request_id, user=user)
    except WeatherRequest.DoesNotExist:
        return 404, {"error": "Not found", "message": f"Weather request with ID {request_id} not found or you don't have permission to edit it"}
    
    # Track if we need to re-fetch weather data
    needs_refetch = False
    
    # Update fields if provided
    if payload.notes is not None:
        weather_request.notes = payload.notes
    
    # Handle date updates
    new_start_date = payload.start_date if payload.start_date is not None else weather_request.start_date
    new_end_date = payload.end_date if payload.end_date is not None else weather_request.end_date
    
    if payload.start_date is not None or payload.end_date is not None:
        # Validate new date range
        date_validation = WeatherService.validate_date_range(new_start_date, new_end_date)
        if not date_validation["valid"]:
            return 400, {"error": "Invalid date range", "message": date_validation["error"]}
        
        weather_request.start_date = new_start_date
        weather_request.end_date = new_end_date
        needs_refetch = True
    
    # Handle location updates
    if payload.location_name is not None:
        if payload.latitude is not None and payload.longitude is not None:
            # User provided exact coordinates
            weather_request.location_name = payload.location_name
            weather_request.latitude = payload.latitude
            weather_request.longitude = payload.longitude
            if payload.country is not None:
                weather_request.country = payload.country
            if payload.timezone is not None:
                weather_request.timezone = payload.timezone
            needs_refetch = True
        else:
            # Validate and geocode new location
            location_validation = WeatherService.validate_location(payload.location_name)
            if not location_validation["valid"]:
                return 400, {
                    "error": "Invalid location",
                    "message": f"{location_validation['error']}. Did you mean one of these? {', '.join([s['name'] for s in location_validation.get('suggestions', [])])}"
                }
            
            best_match = location_validation["best_match"]
            weather_request.location_name = best_match["name"]
            weather_request.latitude = best_match["latitude"]
            weather_request.longitude = best_match["longitude"]
            weather_request.country = best_match["country"]
            weather_request.timezone = best_match["timezone"]
            needs_refetch = True
    elif payload.latitude is not None or payload.longitude is not None:
        # Update coordinates only
        if payload.latitude is not None:
            weather_request.latitude = payload.latitude
        if payload.longitude is not None:
            weather_request.longitude = payload.longitude
        if payload.country is not None:
            weather_request.country = payload.country
        if payload.timezone is not None:
            weather_request.timezone = payload.timezone
        needs_refetch = True
    
    # Re-fetch weather data if needed
    if needs_refetch:
        weather_data = WeatherService.get_weather_for_date_range(
            weather_request.latitude,
            weather_request.longitude,
            weather_request.start_date,
            weather_request.end_date
        )
        
        if weather_data is None:
            return 400, {"error": "Weather data unavailable", "message": "Could not fetch weather data for updated location/dates"}
        
        weather_request.weather_data = weather_data
        weather_request.timezone = weather_data.get("timezone", weather_request.timezone)
    
    # Save changes
    try:
        weather_request.save()
        
        return 200, {
            "id": weather_request.id,
            "location_name": weather_request.location_name,
            "country": weather_request.country,
            "latitude": weather_request.latitude,
            "longitude": weather_request.longitude,
            "timezone": weather_request.timezone,
            "start_date": weather_request.start_date,
            "end_date": weather_request.end_date,
            "weather_data": weather_request.weather_data.get("daily", []),
            "notes": weather_request.notes,
            "created_at": weather_request.created_at,
            "updated_at": weather_request.updated_at
        }
    except ValidationError as e:
        return 400, {"error": "Validation error", "message": str(e)}


@router.delete("/weather-requests/{request_id}", auth=AuthBearer(), response={200: dict, 404: ErrorSchema, 403: ErrorSchema, 401: ErrorSchema})
def delete_weather_request(request, request_id: int):
    """
    DELETE: Delete a weather request by ID
    Requires authentication - only allows deleting user's own requests
    
    Args:
        request_id: ID of the weather request to delete
        
    Returns:
        Success message
    """
    user = request.auth
    
    try:
        weather_request = WeatherRequest.objects.get(id=request_id, user=user)
        location_name = weather_request.location_name
        weather_request.delete()
        
        return 200, {
            "success": True,
            "message": f"Weather request for '{location_name}' (ID: {request_id}) has been deleted"
        }
    except WeatherRequest.DoesNotExist:
        return 404, {"error": "Not found", "message": f"Weather request with ID {request_id} not found or you don't have permission to delete it"}

