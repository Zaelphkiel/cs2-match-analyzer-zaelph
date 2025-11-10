#!/bin/bash

# CS2 Analytics Backend - Quick Setup Script
# Этот скрипт автоматически настроит backend

echo "=========================================="
echo "CS2 Analytics Backend - Quick Setup"
echo "=========================================="
echo ""

# Проверка наличия Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js не установлен!"
    echo "Установите Node.js с https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js версия: $(node -v)"
echo "✅ npm версия: $(npm -v)"
echo ""

# Переход в папку backend
cd backend

echo "📦 Шаг 1: Копирование конфигураций..."

# Копирование package.json
if [ -f "package.manual.json" ]; then
    cp package.manual.json package.json
    echo "✅ package.json создан"
else
    echo "❌ package.manual.json не найден!"
    exit 1
fi

# Копирование tsconfig.json
if [ -f "tsconfig.manual.json" ]; then
    cp tsconfig.manual.json tsconfig.json
    echo "✅ tsconfig.json создан"
else
    echo "❌ tsconfig.manual.json не найден!"
    exit 1
fi

echo ""
echo "📦 Шаг 2: Установка зависимостей..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Ошибка при установке зависимостей!"
    exit 1
fi

echo ""
echo "🔨 Шаг 3: Сборка проекта..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Ошибка при сборке проекта!"
    exit 1
fi

echo ""
echo "=========================================="
echo "✅ Backend успешно настроен!"
echo "=========================================="
echo ""
echo "🚀 Для запуска локально:"
echo "   cd backend"
echo "   npm start"
echo ""
echo "🌐 Сервер запустится на: http://localhost:3000"
echo ""
echo "📖 Следующий шаг:"
echo "   Откройте SETUP_BACKEND.md для инструкций по деплою на Render.com"
echo ""
echo "🔑 Ваши API ключи уже настроены в файле .env"
echo "   Browserless: 2TO87BeFLtlmUIX274fd6c0a4fab3da48c2bd3d2c7b8cf67b"
echo "   ScraperAPI: d8a5c9b77c6a7bcdd64582811f9534ce"
echo ""
