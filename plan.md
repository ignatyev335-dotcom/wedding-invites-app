# Wedding Invites App — План реализации

## Описание проекта
Telegram Mini App для создания и отправки свадебных приглашений. Freemium модель с оплатой через ЮKassa.

## Структура проекта
```
wedding-invites-app/
├── frontend/    # React 18 + Vite + Tailwind + Framer Motion + @dnd-kit
├── backend/     # Node.js + Express + Prisma + PostgreSQL
└── bot/         # Telegram Bot (grammy)
```

## Этапы работы

### Stage 1: Подготовка структуры (параллельно)
- Создание директорий для всех 3 частей
- Инициализация package.json в каждой части

### Stage 2: Backend (Агент 1)
- Prisma schema (02-database.md)
- API endpoints (03-api.md)
- Auth через Telegram Web App
- YooKassa интеграция (06-payments.md)
- Middleware (auth, admin, validate)

### Stage 3: Frontend (Агент 2)
- React + Vite + Tailwind бойлерплейт
- Компоненты: Envelope, Invitation, Editor, Quiz, RSVP, MusicPlayer
- Страницы: Quiz, Templates, Editor, Preview, GuestView, Admin
- i18n (ru/en/zh) — 11-languages.md
- Drag-and-drop (@dnd-kit)
- Parallax scroll (Framer Motion)

### Stage 4: Bot (Агент 3)
- Grammy.js setup
- /start с кнопкой Web App
- Обработка web_app_data
- Рассылка приглашений
- RSVP уведомления

### Stage 5: Админка (Агент 4)
- Admin страница внутри Web App
- Dashboard со статистикой
- CRUD для шаблонов, конвертов, музыки, иллюстраций
- Таблицы пользователей и платежей

### Stage 6: Интеграция
- Соединение всех частей
- ENV конфигурация (09-env.md)
- Тестовый запуск

## Критические требования
- Конверт с пломбой + анимация открытия
- Drag-and-drop блоков (только для создателя)
- Ограничения по тарифам FREE/LIGHT/PREMIUM (10-tariffs.md)
- Мультиязычность ru/en/zh
- Вертикальные фото (валидация)
- ЮKassa тестовый режим
- 12 фиксированных конвертов (12-envelopes.md)

## Загрузка скиллов
- Stage 2-6: vibecoding-general-swarm (для backend/bot)
- Stage 3: vibecoding-webapp-swarm (для frontend)
