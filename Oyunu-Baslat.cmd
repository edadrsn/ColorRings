@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>&1
if errorlevel 1 (
  echo Node.js bulunamadi. Once Node.js kurulmali.
  pause
  exit /b 1
)
if not exist "node_modules\vite\bin\vite.js" (
  echo Proje klasorunde bir kez npm install komutunu calistir.
  pause
  exit /b 1
)
node scripts/check-preview.mjs
if not errorlevel 1 (
  start "" "http://localhost:5173/"
  exit /b 0
)
echo Spin Sort baslatiliyor...
echo Oynarken bu pencereyi acik tut. Kapatirsan yerel sunucu da kapanir.
node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 5173 --strictPort --open http://localhost:5173/
if errorlevel 1 (
  echo Sunucu baslatilamadi. Yukaridaki hata mesajini kontrol et.
  pause
)
