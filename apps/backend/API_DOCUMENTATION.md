# Weather API Documentation

## Overview

The Weather API provides weather data using the Open-Meteo API. It follows a clean architecture with controllers (`api.py`) and services (`services.py`).

## Base URL

```
http://localhost:8000/api/weather
```

## API Documentation

Interactive API documentation is available at:

- **Swagger UI**: http://localhost:8000/api/docs
- **OpenAPI JSON**: http://localhost:8000/api/openapi.json

## Endpoints

### 1. Search Location

Search for locations by name to get coordinates.

**Endpoint:** `GET /weather/search`

**Parameters:**

- `q` (string, required): Location name (minimum 2 characters)

**Example Request:**

```bash
curl "http://localhost:8000/api/weather/search?q=London"
```

**Example Response:**

```json
[
  {
    "name": "London",
    "country": "United Kingdom",
    "latitude": 51.5074,
    "longitude": -0.1278,
    "timezone": "Europe/London",
    "admin1": "England"
  }
]
```

---

### 2. Get Current Weather

Get current weather conditions for specific coordinates.

**Endpoint:** `GET /weather/current`

**Parameters:**

- `lat` (float, required): Latitude (-90 to 90)
- `lon` (float, required): Longitude (-180 to 180)

**Example Request:**

```bash
curl "http://localhost:8000/api/weather/current?lat=51.5074&lon=-0.1278"
```

**Example Response:**

```json
{
  "temperature": 15.2,
  "feels_like": 14.1,
  "humidity": 72,
  "precipitation": 0.0,
  "rain": 0.0,
  "weather_code": 2,
  "weather_description": "Partly cloudy",
  "cloud_cover": 45,
  "pressure": 1013.2,
  "surface_pressure": 1009.8,
  "wind_speed": 12.5,
  "wind_direction": 245,
  "wind_gusts": 18.3,
  "time": "2025-10-28T15:00",
  "timezone": "Europe/London"
}
```

---

### 3. Get Daily Forecast

Get daily weather forecast for up to 16 days.

**Endpoint:** `GET /weather/forecast`

**Parameters:**

- `lat` (float, required): Latitude (-90 to 90)
- `lon` (float, required): Longitude (-180 to 180)
- `days` (int, optional): Number of forecast days (1-16, default: 7)

**Example Request:**

```bash
curl "http://localhost:8000/api/weather/forecast?lat=51.5074&lon=-0.1278&days=5"
```

**Example Response:**

```json
{
  "forecast": [
    {
      "date": "2025-10-28",
      "weather_code": 61,
      "weather_description": "Slight rain",
      "temperature_max": 18.5,
      "temperature_min": 12.3,
      "feels_like_max": 17.8,
      "feels_like_min": 11.5,
      "precipitation": 5.2,
      "rain": 5.2,
      "precipitation_probability": 75,
      "wind_speed_max": 22.1,
      "wind_gusts_max": 35.6,
      "wind_direction": 230,
      "sunrise": "2025-10-28T07:42",
      "sunset": "2025-10-28T17:28",
      "uv_index_max": 2.5
    }
  ],
  "timezone": "Europe/London"
}
```

---

### 4. Get Hourly Forecast

Get hourly weather forecast for up to 7 days (168 hours).

**Endpoint:** `GET /weather/hourly`

**Parameters:**

- `lat` (float, required): Latitude (-90 to 90)
- `lon` (float, required): Longitude (-180 to 180)
- `hours` (int, optional): Number of hours (1-168, default: 24)

**Example Request:**

```bash
curl "http://localhost:8000/api/weather/hourly?lat=51.5074&lon=-0.1278&hours=12"
```

**Example Response:**

```json
{
  "hourly": [
    {
      "time": "2025-10-28T15:00",
      "temperature": 15.2,
      "feels_like": 14.1,
      "humidity": 72,
      "precipitation_probability": 45,
      "precipitation": 0.1,
      "weather_code": 2,
      "weather_description": "Partly cloudy",
      "wind_speed": 12.5,
      "wind_direction": 245
    }
  ],
  "timezone": "Europe/London"
}
```

---

### 5. Get Complete Weather Data

Get complete weather data (location + current + forecast) by searching for a location name.

**Endpoint:** `GET /weather/complete`

**Parameters:**

- `q` (string, required): Location name (minimum 2 characters)
- `days` (int, optional): Number of forecast days (1-16, default: 7)

**Example Request:**

```bash
curl "http://localhost:8000/api/weather/complete?q=Paris&days=3"
```

**Example Response:**

```json
{
  "location": {
    "name": "Paris",
    "country": "France",
    "latitude": 48.8566,
    "longitude": 2.3522,
    "timezone": "Europe/Paris",
    "admin1": "Île-de-France"
  },
  "current": {
    "temperature": 16.8,
    "feels_like": 15.9,
    "humidity": 68,
    "weather_description": "Partly cloudy",
    ...
  },
  "forecast": [
    {
      "date": "2025-10-28",
      "weather_description": "Slight rain",
      ...
    }
  ]
}
```

---

## Weather Codes

The API uses WMO Weather Codes:

| Code   | Description                           |
| ------ | ------------------------------------- |
| 0      | Clear sky                             |
| 1-3    | Mainly clear, partly cloudy, overcast |
| 45, 48 | Fog                                   |
| 51-57  | Drizzle                               |
| 61-67  | Rain                                  |
| 71-77  | Snow                                  |
| 80-82  | Rain showers                          |
| 85-86  | Snow showers                          |
| 95-99  | Thunderstorm                          |

---

## Error Responses

All endpoints return consistent error responses:

```json
{
  "error": "Error type",
  "message": "Detailed error message"
}
```

**Common HTTP Status Codes:**

- `200`: Success
- `400`: Bad Request (invalid parameters)
- `404`: Not Found (no data available)
- `500`: Server Error

---

## Architecture

### Controller Layer (`api.py`)

- Handles HTTP requests and responses
- Validates input parameters
- Returns appropriate status codes
- Uses Ninja schemas for request/response validation

### Service Layer (`services.py`)

- Contains business logic
- Interacts with Open-Meteo API
- Handles data transformation
- Implements error handling

---

## Testing

Run the test script:

```bash
cd apps/backend
python test_api.py
```

Or test individual endpoints with curl:

```bash
# Search for a location
curl "http://localhost:8000/api/weather/search?q=Tokyo"

# Get current weather
curl "http://localhost:8000/api/weather/current?lat=35.6762&lon=139.6503"

# Get complete weather data
curl "http://localhost:8000/api/weather/complete?q=Tokyo&days=5"
```

---

## Data Source

This API uses [Open-Meteo](https://open-meteo.com/) as the weather data provider:

- Free and open-source weather API
- No API key required
- High-quality data from national weather services
- Worldwide coverage

---

## CORS Configuration

CORS is configured in `config/settings.py` to allow requests from:

- `http://localhost:3000` (Next.js frontend)
- Other origins as configured

---

## Development

Start the development server:

```bash
cd apps/backend
source venv/bin/activate  # On Windows: .\venv\Scripts\activate
python manage.py runserver
```

The API will be available at `http://localhost:8000/api/weather/`
