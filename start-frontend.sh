#!/bin/bash

# Frontend starter script with configurable API settings
# Usage: ./start-frontend.sh [API_HOST] [API_PORT] [FRONTEND_PORT] [PROTOCOL]
# Examples: 
#   ./start-frontend.sh localhost 5100 3000 http
#   ./start-frontend.sh risus.potter.sh 443 3000 https

API_HOST=${1:-localhost}
API_PORT=${2:-5000}
FRONTEND_PORT=${3:-5173}
API_PROTOCOL=${4:-http}

echo "Starting Risus Companion Frontend"
echo "================================="
echo "Frontend will run on: http://0.0.0.0:$FRONTEND_PORT"
echo "Connecting to API at: $API_PROTOCOL://$API_HOST:$API_PORT/api"
echo ""

cd frontend

# Set environment variables and start the development server
VITE_API_HOST=$API_HOST VITE_API_PORT=$API_PORT VITE_API_PROTOCOL=$API_PROTOCOL npm run dev -- --port $FRONTEND_PORT