"""
Weather API Controllers
Handles HTTP requests and responses for weather endpoints
"""
from ninja import Router, Schema
from typing import List, Optional
from .services import WeatherService

router = Router()


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


# API Endpoints
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
