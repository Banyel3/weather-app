"""
Weather Service
Handles all weather data fetching logic from Open-Meteo API
"""
import requests
from typing import Dict, Any, Optional, List
from datetime import datetime


class WeatherService:
    """Service class for interacting with Open-Meteo API"""
    
    BASE_URL = "https://api.open-meteo.com/v1"
    GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search"
    
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
