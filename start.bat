@echo off
echo Starting EnigmaCode Platform...
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo Error: Node.js is not installed or not in PATH.
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if MongoDB is running (optional check)
echo Checking dependencies...

REM Install dependencies if node_modules doesn't exist
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
    if errorlevel 1 (
        echo Error: Failed to install dependencies.
        pause
        exit /b 1
    )
    echo Dependencies installed successfully.
    echo.
)

REM Start the application
echo Starting EnigmaCode server...
echo.
echo Access the platform at: http://localhost:3000
echo.
echo To stop the server, press Ctrl+C
echo.

npm start

pause
