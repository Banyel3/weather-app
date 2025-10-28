#!/bin/bash
# Quick setup script for Weather App monorepo

echo "🌤️  Weather App Monorepo Setup"
echo "================================"
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js >= 18.0.0"
    exit 1
fi
echo "✅ Node.js found: $(node --version)"

# Check Python
if ! command -v python &> /dev/null && ! command -v python3 &> /dev/null; then
    echo "❌ Python is not installed. Please install Python >= 3.10"
    exit 1
fi

PYTHON_CMD=$(command -v python3 || command -v python)
echo "✅ Python found: $($PYTHON_CMD --version)"

echo ""
echo "📦 Installing Node dependencies..."
npm install

echo ""
echo "🐍 Setting up Python backend..."
cd apps/backend

# Create virtual environment
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    $PYTHON_CMD -m venv venv
fi

# Activate and install
echo "Installing Python dependencies..."
source venv/bin/activate
pip install -r requirements.txt

# Run migrations
echo "Running Django migrations..."
python manage.py migrate

# Create .env if it doesn't exist
if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    cp .env.example .env
    echo "⚠️  Please update .env with your configuration"
fi

cd ../..

# Create frontend .env.local if it doesn't exist
if [ ! -f "apps/frontend/.env.local" ]; then
    echo "Creating frontend .env.local..."
    cp apps/frontend/.env.example apps/frontend/.env.local
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "To start development:"
echo "  npm run dev"
echo ""
echo "Apps will be available at:"
echo "  Frontend: http://localhost:3000"
echo "  Backend:  http://localhost:8000"
echo "  API Docs: http://localhost:8000/api/docs"
