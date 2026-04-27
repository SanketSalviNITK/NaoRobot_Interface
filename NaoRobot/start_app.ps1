# Nao OS // V1.0 - Master Launch Script
.\cleanup.ps1

echo "Initializing Neural Link Engine..."
Start-Process -NoNewWindow -FilePath ".\nao_env\Scripts\python.exe" -ArgumentList ".\backend\server.py"

echo "Initializing Master Command Center UI..."
Set-Location .\frontend
npm run dev
