# Frontend-Backend Integration Guide

## Overview

The Next.js frontend is now fully integrated with the Django backend via the Open-Meteo weather API.

## Architecture

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│   Next.js UI    │─────▶│  Django API     │─────▶│  Open-Meteo API │
│   (Frontend)    │◀─────│   (Backend)     │◀─────│   (Weather Data)│
└─────────────────┘      └─────────────────┘      └─────────────────┘
```

## Setup Instructions

### 1. Backend Setup (Django)

```bash
cd apps/backend

# Activate virtual environment
.\venv\Scripts\activate  # Windows
# OR
source venv/bin/activate  # Mac/Linux

# Install dependencies (if not already done)
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Start the server
python manage.py runserver
```

Backend will run on: **http://localhost:8000**

### 2. Frontend Setup (Next.js)

```bash
cd apps/frontend

# Install dependencies (if not already done)
npm install

# Start development server
npm run dev
```

Frontend will run on: **http://localhost:3000**

### 3. Environment Variables

The frontend `.env.local` file is already configured:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/weather
```

## API Integration

### API Client (`lib/api-client.ts`)

The frontend uses a TypeScript API client that provides:

- ✅ Type-safe interfaces for all API responses
- ✅ Error handling
- ✅ Clean API methods

**Available Methods:**

```typescript
// Search for locations
await weatherAPI.searchLocation("London");

// Get current weather by coordinates
await weatherAPI.getCurrentWeather(lat, lon);

// Get daily forecast
await weatherAPI.getForecast(lat, lon, days);

// Get hourly forecast
await weatherAPI.getHourlyForecast(lat, lon, hours);

// Get complete weather data (location + current + forecast)
await weatherAPI.getCompleteWeather("Paris", days);

// Get weather by geolocation
await weatherAPI.getWeatherByCoordinates(lat, lon, days);
```

### Data Flow

1. **User searches for a location** → `LocationSearch` component
2. **Frontend calls API** → `weatherAPI.getCompleteWeather()`
3. **Backend fetches from Open-Meteo** → Django services layer
4. **Data flows back to frontend** → State updates
5. **UI renders weather data** → `CurrentWeather` & `ForecastCard` components

## Components Updated

### 1. `app/page.tsx`

- ✅ Integrated with API client
- ✅ Handles location search
- ✅ Handles geolocation
- ✅ Error handling
- ✅ Loading states

### 2. `components/current-weather.tsx`

- ✅ Updated to use API data structure
- ✅ Weather code to icon mapping
- ✅ Displays temperature, humidity, wind, precipitation, pressure

### 3. `components/forecast-card.tsx`

- ✅ Updated to use API data structure
- ✅ Shows daily forecasts
- ✅ Day name formatting (Today, Tomorrow, etc.)

### 4. `components/location-search.tsx`

- ✅ Type-safe props
- ✅ Form submission handling

## Features

### ✅ Location Search

- Search by city name (e.g., "London", "Paris", "Tokyo")
- Automatic geocoding via backend

### ✅ Current Weather

- Temperature (°C)
- Feels like temperature
- Weather description with icons
- Humidity (%)
- Wind speed (km/h)
- Precipitation (mm)
- Atmospheric pressure (hPa)

### ✅ 7-Day Forecast

- Daily high/low temperatures
- Weather conditions
- Precipitation probability
- Weather icons

### ✅ Geolocation

- "Use My Location" button
- Browser geolocation API
- Automatic weather fetch for current coordinates

## Weather Icons

Weather icons are mapped from WMO weather codes:

| Code  | Icon | Description   |
| ----- | ---- | ------------- |
| 0     | ☀️   | Clear sky     |
| 1-3   | 🌤️   | Partly cloudy |
| 45-48 | 🌫️   | Fog           |
| 51-57 | 🌦️   | Drizzle       |
| 61-67 | 🌧️   | Rain          |
| 71-77 | 🌨️   | Snow          |
| 80-82 | 🌧️   | Rain showers  |
| 85-86 | 🌨️   | Snow showers  |
| 95-99 | ⛈️   | Thunderstorm  |

## Testing

### Test the Full Stack

1. **Start backend:**

   ```bash
   cd apps/backend
   .\venv\Scripts\activate
   python manage.py runserver
   ```

2. **Start frontend:**

   ```bash
   cd apps/frontend
   npm run dev
   ```

3. **Open browser:**
   - Go to http://localhost:3000
   - Search for "London" or any city
   - Try "Use My Location" button

### Test Backend API Directly

```bash
# Search for a location
curl "http://localhost:8000/api/weather/search?q=London"

# Get current weather
curl "http://localhost:8000/api/weather/current?lat=51.5074&lon=-0.1278"

# Get complete weather
curl "http://localhost:8000/api/weather/complete?q=Tokyo&days=7"
```

### Test Frontend Independently

The API client can be tested in browser console:

```javascript
import { weatherAPI } from "@/lib/api-client";

// Search for London
const locations = await weatherAPI.searchLocation("London");
console.log(locations);

// Get complete weather
const weather = await weatherAPI.getCompleteWeather("Paris", 7);
console.log(weather);
```

## CORS Configuration

CORS is already configured in the Django backend (`config/settings.py`):

```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
```

## Error Handling

Both frontend and backend handle errors gracefully:

- **Backend**: Returns appropriate HTTP status codes (400, 404, 500) with error messages
- **Frontend**: Displays user-friendly error messages in the UI

## TypeScript Types

All API responses are fully typed in `lib/api-client.ts`:

```typescript
interface Location { ... }
interface CurrentWeather { ... }
interface DailyForecast { ... }
interface HourlyForecast { ... }
interface CompleteWeatherData { ... }
```

## Production Deployment

### Environment Variables

Update `.env.local` for production:

```env
NEXT_PUBLIC_API_URL=https://your-backend-domain.com/api/weather
```

### CORS

Update Django `CORS_ALLOWED_ORIGINS` to include your production frontend URL.

### Build

```bash
# Frontend
cd apps/frontend
npm run build
npm start

# Backend
cd apps/backend
# Use production WSGI server (gunicorn, etc.)
```

## Troubleshooting

### Issue: CORS errors

**Solution**: Ensure Django backend has correct CORS settings and is running

### Issue: API connection refused

**Solution**: Make sure Django backend is running on port 8000

### Issue: No weather data returned

**Solution**: Check Django backend logs for errors from Open-Meteo API

### Issue: Geolocation not working

**Solution**: Ensure HTTPS in production (browsers require it for geolocation)

## Next Steps

Potential enhancements:

- [ ] Add hourly forecast display
- [ ] Add weather alerts
- [ ] Add historical weather data
- [ ] Add weather maps
- [ ] Add favorite locations
- [ ] Add unit conversion (Celsius/Fahrenheit)
- [ ] Add dark mode toggle
- [ ] Add PWA support

## Resources

- [Open-Meteo API Docs](https://open-meteo.com/en/docs)
- [Django Ninja Docs](https://django-ninja.rest-framework.com/)
- [Next.js Docs](https://nextjs.org/docs)
