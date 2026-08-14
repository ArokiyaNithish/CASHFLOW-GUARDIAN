@echo off
echo ======================================
echo  CashFlow Guardian — Backend Startup
echo ======================================
echo.
echo [1/3] Installing Python dependencies...
pip install -r requirements.txt

echo.
echo [2/3] Seeding crisis scenario database...
python seed.py

echo.
echo [3/3] Starting server on http://localhost:8000
echo       API Docs: http://localhost:8000/docs
python main.py
