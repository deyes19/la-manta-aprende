@echo off
cd /d "%~dp0.."
where node >nul 2>nul
if errorlevel 1 (
  echo Instala Node.js 24 LTS y vuelve a abrir este archivo.
  pause
  exit /b 1
)
start "La Manta Aprende" "http://localhost:4173"
node scripts/serve-dist.mjs
pause
