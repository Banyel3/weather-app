# Weather App Backend

Django backend with Django Ninja REST API for the Weather App, integrated with Open-Meteo weather API.

## Features

- ✅ RESTful API with Django Ninja
- ✅ Open-Meteo integration for weather data
- ✅ Clean architecture (Controllers + Services)
- ✅ CORS enabled for frontend integration
- ✅ Automatic API documentation
- ✅ Type-safe schemas with Pydantic

## Tech Stack

- **Django 5.0+**: Web framework
- **Django Ninja**: Modern API framework
- **Open-Meteo API**: Weather data provider
- **Python 3.10+**

## Project Structure

```
backend/
├── config/              # Django project settings
│   ├── settings.py
│   └── urls.py
├── api/                 # Main API app
│   ├── api.py          # API controllers/endpoints
│   ├── services.py     # Business logic & external API calls
│   ├── models.py
│   └── migrations/
├── requirements.txt     # Python dependencies
├── manage.py
└── .env                # Environment variables
```

## Setup

### 1. Create Virtual Environment

```bash
cd apps/backend
python -m venv venv
```

### 2. Activate Virtual Environment

**Windows:**

```bash
.\venv\Scripts\activate
```

**Mac/Linux:**

```bash
source venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Environment Variables

Create a `.env` file:

```env
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

### 5. Run Migrations

```bash
python manage.py migrate
```

### 6. Start Development Server

```bash
python manage.py runserver
```

The API will be available at `http://localhost:8000/api/`

## API Documentation

### Interactive Documentation

- **Swagger UI**: http://localhost:8000/api/docs
- **OpenAPI JSON**: http://localhost:8000/api/openapi.json

### Full API Documentation

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for complete endpoint documentation.

### Quick Endpoints Overview

| Endpoint            | Method | Description                                |
| ------------------- | ------ | ------------------------------------------ |
| `/weather/search`   | GET    | Search for locations                       |
| `/weather/current`  | GET    | Get current weather                        |
| `/weather/forecast` | GET    | Get daily forecast (up to 16 days)         |
| `/weather/hourly`   | GET    | Get hourly forecast (up to 168 hours)      |
| `/weather/complete` | GET    | Get complete weather data by location name |

## Testing

Run the test script:

```bash
python test_api.py
```

Or use curl to test individual endpoints:

```bash
# Search for London
curl "http://localhost:8000/api/weather/search?q=London"

# Get current weather for London
curl "http://localhost:8000/api/weather/current?lat=51.5074&lon=-0.1278"

# Get complete weather data
curl "http://localhost:8000/api/weather/complete?q=London&days=5"
```

## Architecture

### Controller Layer (`api.py`)

- Handles HTTP requests/responses
- Input validation with Ninja schemas
- Error handling and status codes
- Routes requests to services

### Service Layer (`services.py`)

- Business logic
- External API integration (Open-Meteo)
- Data transformation
- Reusable functions

### Benefits

- ✅ Separation of concerns
- ✅ Easy to test
- ✅ Maintainable and scalable
- ✅ Type-safe with schemas

## Weather Data Source

This API uses [Open-Meteo](https://open-meteo.com/):

- ✅ Free and open-source
- ✅ No API key required
- ✅ High-quality data from national weather services
- ✅ Worldwide coverage
- ✅ Multiple weather variables

## Frontend Integration

The backend is configured with CORS to allow requests from:

- `http://localhost:3000` (Next.js dev server)
- `http://127.0.0.1:3000`

Update `CORS_ALLOWED_ORIGINS` in `.env` to add more origins.

## Dependencies

Main dependencies:

- `Django>=5.0.0` - Web framework
- `django-ninja>=1.1.0` - API framework
- `django-cors-headers>=4.3.0` - CORS support
- `python-dotenv>=1.0.0` - Environment variables
- `requests>=2.31.0` - HTTP client

See `requirements.txt` for complete list.
