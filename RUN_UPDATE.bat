@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo =============================================
echo HUG LOEI E-Book V3 - Update Server
echo =============================================
python -m pip install -r requirements.txt
if errorlevel 1 pause & exit /b 1
start "" http://localhost:8000/update.html
python server.py
pause
