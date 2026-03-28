# Настройка Gemini AI (Vertex AI / Google Cloud)

## Обзор

Приложение теперь поддерживает использование Google Gemini AI для анализа матчей CS2. Gemini 2.0 Flash Exp - это быстрая и мощная модель, которая отлично подходит для анализа спортивных данных.

## Что добавлено

✅ Поддержка Google Gemini AI через Vertex AI  
✅ Автоматический выбор AI провайдера (Gemini или OpenAI/DeepSeek)  
✅ JSON режим для структурированных ответов  
✅ Улучшенная обработка ошибок  
✅ Логирование для отладки  

## Шаг 1: Настройка Environment Variables

В файле `backend/.env` добавьте следующие переменные:

```env
# Gemini AI Configuration
GEMINI_API_KEY=AQ.Ab8RN6JmQVGn0cEk-khyO8dwumUCF4-XdVaOMcC1oMhKN6n1eg
AI_PROVIDER=gemini

# Можно также оставить DeepSeek как fallback
DEEPSEEK_API_KEY=sk-iXXarAX8uj0PlIbwj2XZSEyKihwLJiO2
DEEPSEEK_BASE_URL=https://api.proxyapi.ru/openai/v1
```

## Шаг 2: Установка зависимостей

```bash
cd backend
npm install @google/generative-ai
```

Или если используете yarn:

```bash
cd backend
yarn add @google/generative-ai
```

## Шаг 3: Настройка на Render.com

1. Зайдите в панель управления вашего сервиса на Render.com
2. Перейдите в **Environment** раздел
3. Добавьте новые переменные окружения:
   - `GEMINI_API_KEY` = `AQ.Ab8RN6JmQVGn0cEk-khyO8dwumUCF4-XdVaOMcC1oMhKN6n1eg`
   - `AI_PROVIDER` = `gemini`

4. Сохраните изменения
5. Render автоматически пересоздаст ваш сервис с новыми настройками

## Шаг 4: Проверка работы

После деплоя проверьте логи на Render:

```
[AI] Gemini client initialized
Config loaded: {
  ...
  geminiConfigured: true,
  aiProvider: 'gemini',
}
```

## Переключение между AI провайдерами

Вы можете переключаться между Gemini и OpenAI/DeepSeek, изменив переменную `AI_PROVIDER`:

- `AI_PROVIDER=gemini` - использовать Gemini AI
- `AI_PROVIDER=openai` - использовать OpenAI/DeepSeek через ProxyAPI

## Используемая модель

По умолчанию используется модель **gemini-2.0-flash-exp**:
- Быстрая генерация ответов
- Поддержка JSON режима
- Хорошо работает с структурированными данными
- Оптимальна для аналитических задач

## Что анализирует AI

1. **Анализ карт** (`analyzeMapPrediction`):
   - Статистика команд на конкретной карте
   - Винрейты (CT/T стороны)
   - Данные игроков (рейтинг, K/D)
   - Предсказание победителя с вероятностью

2. **Общий анализ матча** (`analyzeOverallMatch`):
   - Общая форма команд
   - Рейтинги команд
   - Агрегированные предсказания по картам
   - Итоговый прогноз с уровнем уверенности

## Troubleshooting

### Ошибка "GEMINI_API_KEY not set"

Убедитесь, что:
1. Переменная добавлена в `.env` файл
2. На Render.com добавлена в Environment Variables
3. Сервис перезапущен после добавления переменной

### AI возвращает null

Проверьте:
1. Валидность API ключа
2. Логи на наличие ошибок от Gemini API
3. Что `AI_PROVIDER` установлен в `gemini`

### Проблемы с JSON парсингом

Gemini настроен на `responseMimeType: 'application/json'`, но если возникают проблемы:
1. Проверьте логи для просмотра сырого ответа
2. Убедитесь, что промпты четко требуют JSON формат
3. Fallback на OpenAI/DeepSeek если проблема критична

## Дополнительная информация

- [Google AI SDK Documentation](https://ai.google.dev/docs)
- [Gemini API Reference](https://ai.google.dev/api/rest/v1beta/models/generateContent)
- [Vertex AI Documentation](https://cloud.google.com/vertex-ai/docs)

## Контакты и поддержка

При возникновении проблем:
1. Проверьте логи на Render.com
2. Убедитесь, что все переменные окружения установлены
3. Проверьте квоты и лимиты вашего Gemini API ключа
