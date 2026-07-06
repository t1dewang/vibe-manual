#!/bin/bash
# Exit immediately if a command exits with a non-zero status
set -e

echo "=== VibeManual Starter ==="

# Check if Python 3 is installed
if ! command -v python3 &> /dev/null; then
    echo "Error: python3 is not installed. Please install Python 3 and try again."
    exit 1
fi

# Create virtual environment if it doesn't exist
if [ ! -d ".venv" ]; then
    echo "Creating virtual environment .venv..."
    python3 -m venv .venv
fi

# Activate virtual environment and install/update requirements
echo "Installing/updating dependencies..."
.venv/bin/pip install --upgrade pip
.venv/bin/pip install -r requirements.txt

# Ensure data folders exist
mkdir -p data/presets data/cache

# Check if .env file exists, create empty if not
if [ ! -f ".env" ]; then
    echo "Creating empty .env file..."
    touch .env
fi

echo "Starting VibeManual server on http://localhost:8000..."
.venv/bin/uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
