@echo off
REM Windows script to run Django dev server with virtual environment

REM Check if virtual environment exists
if not exist "venv\Scripts\activate.bat" (
    echo Error: Virtual environment not found!
    echo Please run: python -m venv venv
    echo Then run: .\venv\Scripts\activate
    echo Then run: pip install -r requirements.txt
    exit /b 1
)

REM Activate virtual environment and run server
call venv\Scripts\activate.bat && python manage.py runserver
