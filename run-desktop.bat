@echo off
title V.I.S.I.O.N. - Research Prototype

cd /d "%~dp0"

echo ========================================================================
echo   V.I.S.I.O.N. - Research Prototype (Event Expo 67)
echo ========================================================================
echo.
echo Current folder: %cd%
echo.

if not exist "desktop-app" (
    echo [ERROR] desktop-app folder not found.
    echo Put this .bat in the main project folder.
    pause
    exit /b
)

echo Starting V.I.S.I.O.N. ...
echo.

cd desktop-app
npm start

echo.
echo Application closed.
pause
