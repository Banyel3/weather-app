"""
Weather API Schemas
Data validation schemas for request/response handling
"""
from ninja import Schema
from typing import List, Optional
from datetime import date, datetime


# ============================================================================
# Location and Weather Schemas
# ============================================================================

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
