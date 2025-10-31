"""
Weather Service
Handles all weather data fetching logic from Open-Meteo API
"""
import requests
from typing import Dict, Any, Optional, List
from datetime import datetime, date, timedelta
from django.core.exceptions import ValidationError


class WeatherService:
    """Service class for interacting with Open-Meteo API"""
    
    BASE_URL = "https://api.open-meteo.com/v1"
    GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search"
    HISTORICAL_URL = "https://archive-api.open-meteo.com/v1/archive"
    
    @staticmethod
    def validate_date_range(start_date: date, end_date: date) -> Dict[str, Any]:
        """
        Validate date range and return validation result
        
        Args:
            start_date: Start date
            end_date: End date
            
        Returns:
            Dictionary with 'valid' boolean and optional 'error' message
        """
        today = date.today()
        
        # Check if start_date is after end_date
        if start_date > end_date:
            return {
                "valid": False,
                "error": "Start date must be before or equal to end date"
            }
        
        # Check if date range is too long (max 1 year)
        days_diff = (end_date - start_date).days
        if days_diff > 365:
            return {
                "valid": False,
                "error": "Date range cannot exceed 365 days"
            }
        
        # Check if dates are too far in the future (max 16 days)
        if start_date > today + timedelta(days=16):
            return {
                "valid": False,
                "error": "Start date cannot be more than 16 days in the future"
            }
        
        # Historical data available from 1940-01-01
        historical_start = date(1940, 1, 1)
        if start_date < historical_start:
            return {
                "valid": False,
                "error": f"Start date cannot be before {historical_start}"
            }
        
        return {"valid": True}
    
    @staticmethod
    def validate_location(location_name: str) -> Dict[str, Any]:
        """
        Validate that a location exists using geocoding API
        Supports fuzzy matching
        
        Args:
            location_name: Location query string
            
        Returns:
            Dictionary with 'valid' boolean, optional 'error', and 'suggestions' for fuzzy match
        """
        if not location_name or len(location_name.strip()) < 2:
            return {
                "valid": False,
                "error": "Location name must be at least 2 characters"
            }
        
        results = WeatherService.geocode_location(location_name)
        
        if results is None or len(results) == 0:
            return {
                "valid": False,
                "error": f"No location found matching '{location_name}'",
                "suggestions": []
            }
        
        # Location is valid, return best match and alternatives
        return {
            "valid": True,
            "best_match": results[0],
            "suggestions": results[:5]  # Return up to 5 suggestions for fuzzy matching
        }
    
    @staticmethod
    def geocode_location(location: str) -> Optional[List[Dict[str, Any]]]:
        """
        Geocode a location name to get coordinates
        
        Args:
            location: City name or location string
            
        Returns:
            List of location results with coordinates
        """
        try:
            params = {
                "name": location,
                "count": 5,
                "language": "en",
                "format": "json"
            }
            
            response = requests.get(WeatherService.GEOCODING_URL, params=params, timeout=10)
            response.raise_for_status()
            data = response.json()
            
            if "results" in data:
                return [
                    {
                        "name": result.get("name"),
                        "country": result.get("country"),
                        "latitude": result.get("latitude"),
                        "longitude": result.get("longitude"),
                        "timezone": result.get("timezone"),
                        "admin1": result.get("admin1", ""),
                    }
                    for result in data["results"]
                ]
            return None
            
        except requests.exceptions.RequestException as e:
            print(f"Geocoding error: {e}")
            return None
    
    @staticmethod
    def get_current_weather(latitude: float, longitude: float) -> Optional[Dict[str, Any]]:
        """
        Get current weather for given coordinates
        
        Args:
            latitude: Latitude coordinate
            longitude: Longitude coordinate
            
        Returns:
            Current weather data
        """
        try:
            params = {
                "latitude": latitude,
                "longitude": longitude,
                "current": [
                    "temperature_2m",
                    "relative_humidity_2m",
                    "apparent_temperature",
                    "precipitation",
                    "rain",
                    "weather_code",
                    "cloud_cover",
                    "pressure_msl",
                    "surface_pressure",
                    "wind_speed_10m",
                    "wind_direction_10m",
                    "wind_gusts_10m"
                ],
                "timezone": "auto"
            }
            
            response = requests.get(f"{WeatherService.BASE_URL}/forecast", params=params, timeout=10)
            response.raise_for_status()
            data = response.json()
            
            if "current" in data:
                current = data["current"]
                return {
                    "temperature": current.get("temperature_2m"),
                    "feels_like": current.get("apparent_temperature"),
                    "humidity": current.get("relative_humidity_2m"),
                    "precipitation": current.get("precipitation"),
                    "rain": current.get("rain"),
                    "weather_code": current.get("weather_code"),
                    "cloud_cover": current.get("cloud_cover"),
                    "pressure": current.get("pressure_msl"),
                    "surface_pressure": current.get("surface_pressure"),
                    "wind_speed": current.get("wind_speed_10m"),
                    "wind_direction": current.get("wind_direction_10m"),
                    "wind_gusts": current.get("wind_gusts_10m"),
                    "time": current.get("time"),
                    "timezone": data.get("timezone"),
                }
            return None
            
        except requests.exceptions.RequestException as e:
            print(f"Current weather error: {e}")
            return None
    
    @staticmethod
    def get_forecast(
        latitude: float,
        longitude: float,
        days: int = 7
    ) -> Optional[Dict[str, Any]]:
        """
        Get weather forecast for given coordinates
        
        Args:
            latitude: Latitude coordinate
            longitude: Longitude coordinate
            days: Number of forecast days (1-16)
            
        Returns:
            Forecast data
        """
        try:
            params = {
                "latitude": latitude,
                "longitude": longitude,
                "daily": [
                    "weather_code",
                    "temperature_2m_max",
                    "temperature_2m_min",
                    "apparent_temperature_max",
                    "apparent_temperature_min",
                    "precipitation_sum",
                    "rain_sum",
                    "precipitation_probability_max",
                    "wind_speed_10m_max",
                    "wind_gusts_10m_max",
                    "wind_direction_10m_dominant",
                    "sunrise",
                    "sunset",
                    "uv_index_max"
                ],
                "timezone": "auto",
                "forecast_days": min(days, 16)
            }
            
            response = requests.get(f"{WeatherService.BASE_URL}/forecast", params=params, timeout=10)
            response.raise_for_status()
            data = response.json()
            
            if "daily" in data:
                daily = data["daily"]
                forecast_list = []
                
                for i in range(len(daily.get("time", []))):
                    forecast_list.append({
                        "date": daily["time"][i],
                        "weather_code": daily["weather_code"][i],
                        "temperature_max": daily["temperature_2m_max"][i],
                        "temperature_min": daily["temperature_2m_min"][i],
                        "feels_like_max": daily["apparent_temperature_max"][i],
                        "feels_like_min": daily["apparent_temperature_min"][i],
                        "precipitation": daily["precipitation_sum"][i],
                        "rain": daily["rain_sum"][i],
                        "precipitation_probability": daily["precipitation_probability_max"][i],
                        "wind_speed_max": daily["wind_speed_10m_max"][i],
                        "wind_gusts_max": daily["wind_gusts_10m_max"][i],
                        "wind_direction": daily["wind_direction_10m_dominant"][i],
                        "sunrise": daily["sunrise"][i],
                        "sunset": daily["sunset"][i],
                        "uv_index_max": daily["uv_index_max"][i],
                    })
                
                return {
                    "forecast": forecast_list,
                    "timezone": data.get("timezone"),
                }
            return None
            
        except requests.exceptions.RequestException as e:
            print(f"Forecast error: {e}")
            return None
    
    @staticmethod
    def get_hourly_forecast(
        latitude: float,
        longitude: float,
        hours: int = 24
    ) -> Optional[Dict[str, Any]]:
        """
        Get hourly weather forecast
        
        Args:
            latitude: Latitude coordinate
            longitude: Longitude coordinate
            hours: Number of hours (max 168 for 7 days)
            
        Returns:
            Hourly forecast data
        """
        try:
            # Calculate forecast days needed
            forecast_days = min((hours // 24) + 1, 7)
            
            params = {
                "latitude": latitude,
                "longitude": longitude,
                "hourly": [
                    "temperature_2m",
                    "relative_humidity_2m",
                    "apparent_temperature",
                    "precipitation_probability",
                    "precipitation",
                    "weather_code",
                    "wind_speed_10m",
                    "wind_direction_10m",
                ],
                "timezone": "auto",
                "forecast_days": forecast_days
            }
            
            response = requests.get(f"{WeatherService.BASE_URL}/forecast", params=params, timeout=10)
            response.raise_for_status()
            data = response.json()
            
            if "hourly" in data:
                hourly = data["hourly"]
                hourly_list = []
                
                # Limit to requested number of hours
                for i in range(min(len(hourly.get("time", [])), hours)):
                    hourly_list.append({
                        "time": hourly["time"][i],
                        "temperature": hourly["temperature_2m"][i],
                        "feels_like": hourly["apparent_temperature"][i],
                        "humidity": hourly["relative_humidity_2m"][i],
                        "precipitation_probability": hourly["precipitation_probability"][i],
                        "precipitation": hourly["precipitation"][i],
                        "weather_code": hourly["weather_code"][i],
                        "wind_speed": hourly["wind_speed_10m"][i],
                        "wind_direction": hourly["wind_direction_10m"][i],
                    })
                
                return {
                    "hourly": hourly_list,
                    "timezone": data.get("timezone"),
                }
            return None
            
        except requests.exceptions.RequestException as e:
            print(f"Hourly forecast error: {e}")
            return None
    
    @staticmethod
    def get_weather_description(weather_code: int) -> str:
        """
        Convert WMO weather code to description
        
        Args:
            weather_code: WMO weather code
            
        Returns:
            Weather description string
        """
        weather_codes = {
            0: "Clear sky",
            1: "Mainly clear",
            2: "Partly cloudy",
            3: "Overcast",
            45: "Foggy",
            48: "Depositing rime fog",
            51: "Light drizzle",
            53: "Moderate drizzle",
            55: "Dense drizzle",
            56: "Light freezing drizzle",
            57: "Dense freezing drizzle",
            61: "Slight rain",
            63: "Moderate rain",
            65: "Heavy rain",
            66: "Light freezing rain",
            67: "Heavy freezing rain",
            71: "Slight snow fall",
            73: "Moderate snow fall",
            75: "Heavy snow fall",
            77: "Snow grains",
            80: "Slight rain showers",
            81: "Moderate rain showers",
            82: "Violent rain showers",
            85: "Slight snow showers",
            86: "Heavy snow showers",
            95: "Thunderstorm",
            96: "Thunderstorm with slight hail",
            99: "Thunderstorm with heavy hail",
        }
        
        return weather_codes.get(weather_code, "Unknown")
    
    @staticmethod
    def get_weather_for_date_range(
        latitude: float,
        longitude: float,
        start_date: date,
        end_date: date
    ) -> Optional[Dict[str, Any]]:
        """
        Get weather data for a specific date range
        Automatically handles historical vs forecast data
        
        Args:
            latitude: Latitude coordinate
            longitude: Longitude coordinate
            start_date: Start date
            end_date: End date
            
        Returns:
            Weather data for the date range with daily temperatures
        """
        today = date.today()
        
        try:
            # Determine if we need historical, forecast, or both
            if end_date < today:
                # Pure historical data
                return WeatherService._get_historical_data(latitude, longitude, start_date, end_date)
            elif start_date > today:
                # Pure forecast data
                return WeatherService._get_forecast_data(latitude, longitude, start_date, end_date)
            else:
                # Mixed: historical + current + forecast
                historical_data = None
                forecast_data = None
                
                if start_date < today:
                    historical_data = WeatherService._get_historical_data(
                        latitude, longitude, start_date, today - timedelta(days=1)
                    )
                
                forecast_data = WeatherService._get_forecast_data(
                    latitude, longitude, today, end_date
                )
                
                # Merge the data
                return WeatherService._merge_weather_data(historical_data, forecast_data)
                
        except requests.exceptions.RequestException as e:
            print(f"Weather date range error: {e}")
            return None
    
    @staticmethod
    def _get_historical_data(
        latitude: float,
        longitude: float,
        start_date: date,
        end_date: date
    ) -> Optional[Dict[str, Any]]:
        """Get historical weather data from archive API"""
        try:
            params = {
                "latitude": latitude,
                "longitude": longitude,
                "start_date": start_date.isoformat(),
                "end_date": end_date.isoformat(),
                "daily": [
                    "temperature_2m_max",
                    "temperature_2m_min",
                    "temperature_2m_mean",
                    "apparent_temperature_max",
                    "apparent_temperature_min",
                    "precipitation_sum",
                    "rain_sum",
                    "weather_code",
                    "wind_speed_10m_max",
                    "wind_direction_10m_dominant",
                ],
                "timezone": "auto"
            }
            
            response = requests.get(WeatherService.HISTORICAL_URL, params=params, timeout=10)
            response.raise_for_status()
            data = response.json()
            
            if "daily" in data:
                daily = data["daily"]
                daily_list = []
                
                for i in range(len(daily.get("time", []))):
                    daily_list.append({
                        "date": daily["time"][i],
                        "temperature_max": daily["temperature_2m_max"][i],
                        "temperature_min": daily["temperature_2m_min"][i],
                        "temperature_mean": daily.get("temperature_2m_mean", [None] * len(daily["time"]))[i],
                        "feels_like_max": daily["apparent_temperature_max"][i],
                        "feels_like_min": daily["apparent_temperature_min"][i],
                        "precipitation": daily["precipitation_sum"][i],
                        "rain": daily["rain_sum"][i],
                        "weather_code": daily["weather_code"][i],
                        "weather_description": WeatherService.get_weather_description(daily["weather_code"][i]),
                        "wind_speed_max": daily["wind_speed_10m_max"][i],
                        "wind_direction": daily["wind_direction_10m_dominant"][i],
                    })
                
                return {
                    "daily": daily_list,
                    "timezone": data.get("timezone", "UTC"),
                }
            return None
            
        except requests.exceptions.RequestException as e:
            print(f"Historical data error: {e}")
            return None
    
    @staticmethod
    def _get_forecast_data(
        latitude: float,
        longitude: float,
        start_date: date,
        end_date: date
    ) -> Optional[Dict[str, Any]]:
        """Get forecast weather data"""
        try:
            days = (end_date - start_date).days + 1
            
            params = {
                "latitude": latitude,
                "longitude": longitude,
                "daily": [
                    "weather_code",
                    "temperature_2m_max",
                    "temperature_2m_min",
                    "apparent_temperature_max",
                    "apparent_temperature_min",
                    "precipitation_sum",
                    "rain_sum",
                    "wind_speed_10m_max",
                    "wind_direction_10m_dominant",
                ],
                "timezone": "auto",
                "forecast_days": min(days + 1, 16)  # API limit
            }
            
            response = requests.get(f"{WeatherService.BASE_URL}/forecast", params=params, timeout=10)
            response.raise_for_status()
            data = response.json()
            
            if "daily" in data:
                daily = data["daily"]
                daily_list = []
                
                # Filter to only include dates in our range
                for i in range(len(daily.get("time", []))):
                    current_date = datetime.fromisoformat(daily["time"][i]).date()
                    if start_date <= current_date <= end_date:
                        daily_list.append({
                            "date": daily["time"][i],
                            "temperature_max": daily["temperature_2m_max"][i],
                            "temperature_min": daily["temperature_2m_min"][i],
                            "temperature_mean": (daily["temperature_2m_max"][i] + daily["temperature_2m_min"][i]) / 2,
                            "feels_like_max": daily["apparent_temperature_max"][i],
                            "feels_like_min": daily["apparent_temperature_min"][i],
                            "precipitation": daily["precipitation_sum"][i],
                            "rain": daily["rain_sum"][i],
                            "weather_code": daily["weather_code"][i],
                            "weather_description": WeatherService.get_weather_description(daily["weather_code"][i]),
                            "wind_speed_max": daily["wind_speed_10m_max"][i],
                            "wind_direction": daily["wind_direction_10m_dominant"][i],
                        })
                
                return {
                    "daily": daily_list,
                    "timezone": data.get("timezone", "UTC"),
                }
            return None
            
        except requests.exceptions.RequestException as e:
            print(f"Forecast data error: {e}")
            return None
    
    @staticmethod
    def _merge_weather_data(
        historical: Optional[Dict[str, Any]],
        forecast: Optional[Dict[str, Any]]
    ) -> Optional[Dict[str, Any]]:
        """Merge historical and forecast data"""
        if historical is None and forecast is None:
            return None
        
        if historical is None:
            return forecast
        
        if forecast is None:
            return historical
        
        # Merge daily lists
        merged_daily = historical.get("daily", []) + forecast.get("daily", [])
        
        return {
            "daily": merged_daily,
            "timezone": forecast.get("timezone", historical.get("timezone", "UTC")),
        }
