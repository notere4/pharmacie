@echo off
setlocal

REM Launch backend in a new window
start "Backend" cmd /k "cd /d %~dp0backend && if exist venv\Scripts\activate.bat call venv\Scripts\activate.bat && echo Starting Django on http://localhost:8000 ... && python manage.py runserver 0.0.0.0:8000"

REM Launch frontend in a new window
start "Frontend" cmd /k "cd /d %~dp0 && echo Starting Vite on http://localhost:5173 ... && npm run dev"

endlocal
