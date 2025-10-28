@echo off
REM Quick setup script for Weather App monorepo (Windows)

echo 🌤️  Weather App Monorepo Setup
echo ================================
echo.

REM Check Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js >= 18.0.0
    exit /b 1
)
echo ✅ Node.js found

REM Check Python
where python >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Python is not installed. Please install Python >= 3.10
    exit /b 1
)
echo ✅ Python found

echo.
echo 📦 Installing Node dependencies...
call npm install

echo.
echo 🐍 Setting up Python backend...
cd apps\backend

REM Create virtual environment
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
)

REM Activate and install
echo Installing Python dependencies...
call venv\Scripts\activate.bat
pip install -r requirements.txt

REM Run migrations
echo Running Django migrations...
python manage.py migrate

REM Create .env if it doesn't exist
if not exist ".env" (
    echo Creating .env file...
    copy .env.example .env
    echo ⚠️  Please update .env with your configuration
)

cd ..\..

REM Create frontend .env.local if it doesn't exist
if not exist "apps\frontend\.env.local" (
    echo Creating frontend .env.local...
    copy apps\frontend\.env.example apps\frontend\.env.local
)

echo.
echo ✅ Setup complete!
echo.
echo To start development:
echo   npm run dev
echo.
echo Apps will be available at:
echo   Frontend: http://localhost:3000
echo   Backend:  http://localhost:8000
echo   API Docs: http://localhost:8000/api/docs
echo.
pause
