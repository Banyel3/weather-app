# Weather App Monorepo

A Turborepo-powered monorepo for the Weather App with Next.js frontend and Django backend.

## What's inside?

This Turborepo includes the following packages/apps:

### Apps

- `frontend`: a [Next.js](https://nextjs.org/) app for the weather application UI
- `backend`: a [Django](https://www.djangoproject.com/) + [Django Ninja](https://django-ninja.rest-framework.com/) API server

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend**: Django 5, Django Ninja, Python 3.10+
- **Weather Data**: Open-Meteo API
- **Monorepo**: Turborepo

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- Python >= 3.10
- npm or pnpm

### Installation

#### 1. Install Node dependencies from the root:

This will install Turborepo and all frontend dependencies:

```bash
npm install
```

#### 2. Set up Python backend:

Navigate to the backend directory and create a virtual environment:

```bash
cd apps/backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows PowerShell:
.\venv\Scripts\Activate.ps1

# Windows Command Prompt (cmd):
.\venv\Scripts\activate.bat

# Windows Git Bash:
source venv/Scripts/activate

# Mac/Linux:
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Return to root
cd ../..
```

#### 3. Set up environment variables:

**Frontend** (`apps/frontend/.env.local`):

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/weather
```

**Backend** (`apps/backend/.env`):

> **Note:** If you need to run this application, please contact me at [cornelio.vaniel38@gmail.com] and I'll provide you with the required `.env` files.

### Development

To develop all apps simultaneously, run from the root:

```bash
turbo run dev
```

This will start:

- **Frontend** on http://localhost:3000
- **Backend** on http://localhost:8000

You can also run apps individually:

```bash
# Run only frontend
turbo run dev --filter=frontend

# Run only backend
turbo run dev --filter=backend
```
