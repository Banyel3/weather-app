#!/usr/bin/env bash
# exit on error
set -o errexit

# Install Python dependencies
pip install -r requirements.txt

# Run database migrations
python manage.py migrate

# Collect static files (if needed)
python manage.py collectstatic --no-input
