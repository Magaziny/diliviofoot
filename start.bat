@echo off
TITLE Express Pizza - Startup
COLOR 0B

echo ==========================================
echo    STARTING EXPRESS PIZZA PROJECT
echo ==========================================
echo.

:: Завершаем старые процессы на портах 5000 и 5173
echo [~] Останавливаю старые процессы...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":5000"') do taskkill /F /PID %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| find ":5173"') do taskkill /F /PID %%a >nul 2>&1
timeout /t 1 >nul

:: Проверка наличия node_modules
if not exist node_modules (
    echo [!] node_modules не найдены. Устанавливаю зависимости...
    call npm install
)

echo [+] Запуск системы логов и серверов...
node dev.js
