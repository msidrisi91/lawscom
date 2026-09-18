Write-Host "=========================================" -ForegroundColor Cyan
Write-Host " Starting JurisShorts Platform Services   " -ForegroundColor Yellow
Write-Host "=========================================" -ForegroundColor Cyan

# 1. Start Backend in new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; venv\Scripts\python -m uvicorn app.main:app --port 8000 --reload"
Write-Host "[✓] Backend API launching on http://localhost:8000 (Docs: http://localhost:8000/docs)" -ForegroundColor Green

# 2. Start Consumer PWA in new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd consumer-app; npm run dev"
Write-Host "[✓] Consumer App launching on http://localhost:3000" -ForegroundColor Green

# 3. Start Decoupled Admin Dashboard in new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd admin-app; npm run dev"
Write-Host "[✓] Admin Dashboard launching on http://localhost:3001" -ForegroundColor Green

Write-Host "`nAll 3 decoupled platform services launched!" -ForegroundColor Cyan
