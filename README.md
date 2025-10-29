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

```bash
npm install
```

#### 2. Set up Python backend:

```bash
cd apps/backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
.\venv\Scripts\activate
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

```env
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

### Development

To develop all apps simultaneously, run from the root:

```bash
npm run dev
```

This will start:

- **Frontend** on http://localhost:3000
- **Backend** on http://localhost:8000

You can also run apps individually:

```bash
# Run only frontend
npm run dev --filter=@weather-app/frontend

# Run only backend
npm run dev --filter=@weather-app/backend
```

### Build

To build all apps and packages:

```bash
npm run build
```

### Other Commands

```bash
# Lint all apps
npm run lint

# Run backend migrations
npm run migrate --filter=@weather-app/backend

# Run backend tests
npm run test --filter=@weather-app/backend

# Clean all build artifacts
npm run clean
```

## Useful Links

Learn more about Turborepo:

- [Tasks](https://turbo.build/repo/docs/core-concepts/monorepos/running-tasks)
- [Caching](https://turbo.build/repo/docs/core-concepts/caching)
- [Remote Caching](https://turbo.build/repo/docs/core-concepts/remote-caching)
- [Filtering](https://turbo.build/repo/docs/core-concepts/monorepos/filtering)
