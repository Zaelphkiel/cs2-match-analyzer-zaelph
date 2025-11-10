@echo off
REM CS2 Analytics Backend - Quick Setup Script (Windows)
REM Этот скрипт автоматически настроит backend

echo ==========================================
echo CS2 Analytics Backend - Quick Setup
echo ==========================================
echo.

REM Проверка наличия Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js не установлен!
    echo Установите Node.js с https://nodejs.org/
    pause
    exit /b 1
)

node -v
npm -v
echo.

REM Переход в папку backend
cd backend

echo 📦 Шаг 1: Копирование конфигураций...

REM Копирование package.json
if exist "package.manual.json" (
    copy /Y package.manual.json package.json >nul
    echo ✅ package.json создан
) else (
    echo ❌ package.manual.json не найден!
    pause
    exit /b 1
)

REM Копирование tsconfig.json
if exist "tsconfig.manual.json" (
    copy /Y tsconfig.manual.json tsconfig.json >nul
    echo ✅ tsconfig.json создан
) else (
    echo ❌ tsconfig.manual.json не найден!
    pause
    exit /b 1
)

echo.
echo 📦 Шаг 2: Установка зависимостей...
call npm install

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Ошибка при установке зависимостей!
    pause
    exit /b 1
)

echo.
echo 🔨 Шаг 3: Сборка проекта...
call npm run build

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Ошибка при сборке проекта!
    pause
    exit /b 1
)

echo.
echo ==========================================
echo ✅ Backend успешно настроен!
echo ==========================================
echo.
echo 🚀 Для запуска локально:
echo    cd backend
echo    npm start
echo.
echo 🌐 Сервер запустится на: http://localhost:3000
echo.
echo 📖 Следующий шаг:
echo    Откройте SETUP_BACKEND.md для инструкций по деплою на Render.com
echo.
echo 🔑 Ваши API ключи уже настроены в файле .env
echo    Browserless: 2TO87BeFLtlmUIX274fd6c0a4fab3da48c2bd3d2c7b8cf67b
echo    ScraperAPI: d8a5c9b77c6a7bcdd64582811f9534ce
echo.
pause
