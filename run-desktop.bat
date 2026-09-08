@echo off
setlocal
title V.I.S.I.O.N. - Research Prototype

cd /d "%~dp0"

echo ========================================================================
echo   V.I.S.I.O.N. - Research Prototype (Event Expo 67)
echo ========================================================================
echo.
echo Current folder: %cd%
echo.

where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in PATH.
    echo Please install Node.js from https://nodejs.org/
    echo.
    pause
    exit /b 1
)

where npm >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] npm is not found in PATH.
    echo.
    pause
    exit /b 1
)

if not exist "desktop-app" (
    echo [ERROR] desktop-app folder not found.
    echo Put this .bat in the main project folder.
    echo.
    pause
    exit /b 1
)

if not exist "core\node_modules" (
    echo [SETUP] Installing core dependencies...
    cd /d "%~dp0core"
    call npm install
    cd /d "%~dp0"
    echo.
)

if not exist "desktop-app\node_modules\electron\dist\electron.exe" (
    echo [SETUP] Installing desktop-app dependencies...
    cd /d "%~dp0desktop-app"
    call npm install
    if not exist "node_modules\electron\dist\electron.exe" (
        echo [SETUP] Downloading Electron binary...
        call node node_modules\electron\install.js
    )
    cd /d "%~dp0"
    echo.
)

echo Starting V.I.S.I.O.N. ...
echo.

cd /d "%~dp0desktop-app"
call npm start %*
set "EXIT_CODE=%errorlevel%"

echo.
if %EXIT_CODE% neq 0 (
    echo Application exited with error code: %EXIT_CODE%
) else (
    echo Application closed normally.
)
pause
