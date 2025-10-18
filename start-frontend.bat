@echo off
REM Frontend starter script for Windows with configurable API settings
REM Usage: start-frontend.bat [API_HOST] [API_PORT] [FRONTEND_PORT] [PROTOCOL]
REM Examples:
REM   start-frontend.bat localhost 5100 3000 http
REM   start-frontend.bat risus.potter.sh 443 3000 https

set API_HOST=%1
if "%API_HOST%"=="" set API_HOST=localhost

set API_PORT=%2
if "%API_PORT%"=="" set API_PORT=5000

set FRONTEND_PORT=%3
if "%FRONTEND_PORT%"=="" set FRONTEND_PORT=5173

set API_PROTOCOL=%4
if "%API_PROTOCOL%"=="" set API_PROTOCOL=http

echo Starting Risus Companion Frontend
echo =================================
echo Frontend will run on: http://0.0.0.0:%FRONTEND_PORT%
echo Connecting to API at: %API_PROTOCOL%://%API_HOST%:%API_PORT%/api
echo.

cd frontend

REM Set environment variables and start the development server
set VITE_API_HOST=%API_HOST%
set VITE_API_PORT=%API_PORT%
set VITE_API_PROTOCOL=%API_PROTOCOL%
npm run dev -- --port %FRONTEND_PORT%