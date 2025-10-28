#!/bin/bash
# Unix/Mac script to run Django dev server with virtual environment

# Check if virtual environment exists
if [ ! -f "venv/bin/activate" ]; then
    echo "Error: Virtual environment not found!"
    echo "Please run: python -m venv venv"
    echo "Then run: source venv/bin/activate"
    echo "Then run: pip install -r requirements.txt"
    exit 1
fi

# Activate virtual environment and run server
source venv/bin/activate && python manage.py runserver
