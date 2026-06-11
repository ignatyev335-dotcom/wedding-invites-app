# Wedding Invites App — SPEC.md

## Overview
Telegram Mini App for creating and sending wedding invitations. Freemium model with YooKassa payments.

## Project Structure
```
/mnt/agents/output/
├── app/                    # Frontend (React + Vite + Tailwind)
│   ├── src/
│   └── ...
├── backend/                # Node.js + Express + Prisma + PostgreSQL
│   ├── src/
│   │   ├── routes/
│   │   │   ├── auth.ts
│   │   │   ├── invites.ts
│   │   │   ├── guests.ts
│   │   │   ├── payments.ts
│   │   │   ├── admin.ts
│   │   │   └── analytics.ts
│   │   ├── services/
│   │   │   ├── payment.ts
│   │   │   └── bot.ts
│   │   ├── middleware/
│   │   │   ├── auth.ts
│   │   │   ├── admin.ts
│   │   │   └── validate.ts
│   │   ├── utils/
│   │   │   └── telegram.ts
│   │   └── index.ts
│   ├── prisma/
│   │   └── schema.prisma
│   └── package.json
├── bot/                    # Telegram Bot (grammy)
│   ├── src/
│   │   ├── handlers/
│   │   │   ├── start.ts
│   │   │   ├── webapp.ts
│   │   │   └── callbacks.ts
│   │   ├── commands/
│   │   │   └── index.ts
│   │   ├── utils/
│   │   │   └── api.ts
│   │   └── index.ts
│   └── package.json
└── SPEC.md
```

## Database Schema (Prisma)
See `/mnt/agents/upload/02-database.md` for complete schema.

Key models: User, Invite, Template, Envelope, DressCode, Illustration, Music, Guest, Payment, Analytics.

## API Endpoints

### Auth
- `POST /api/auth/telegram` — Auth via Telegram WebApp initData

### Templates & Resources
- `GET /api/templates?tariff=FREE|LIGHT|PREMIUM`
- `GET /api/envelopes`
- `GET /api/dress-codes`
- `GET /api/illustrations?category=...`
- `GET /api/music`

### Invites
- `POST /api/invites` — Create
- `GET /api/invites/:slug` — Get (public, no auth)
- `PUT /api/invites/:id` — Update
- `DELETE /api/invites/:id` — Delete
- `POST /api/invites/:id/publish` — Publish
- `POST /api/invites/:id/guests` — Add guests
- `POST /api/invites/:id/send` — Send invites

### Guests (RSVP)
- `POST /api/guests/:id/rsvp`
- `POST /api/guests/:id/transfer`

### Payments
- `POST /api/payments/create`
- `POST /api/payments/callback` — YooKassa webhook

### Admin
- `GET /api/admin/stats`
- `GET /api/admin/users`
- `GET /api/admin/payments`
- `POST /api/admin/templates`
- `POST /api/admin/envelopes`
- `POST /api/admin/music`
- `POST /api/admin/illustrations`

## Middleware
- `auth` — JWT verification
- `admin` — ADMIN_TELEGRAM_ID check
- `validate` — body/params validation

## Telegram Bot Flow
1. `/start` → Web App button
2. Mini App opens → Quiz → Template → Editor → Preview
3. Invite created → "Add guests" button
4. Guests added → "Send invites" button
5. Send → Each guest gets message with Web App link
6. RSVP → Creator gets notification

## YooKassa Integration
- `yookassa-ts` npm package
- Create payment with redirect confirmation
- Webhook for success/cancel
- Tariffs: FREE (0₽), LIGHT (499₽), PREMIUM (999₽)

## Frontend Pages
- Quiz.tsx — 5-step questionnaire
- Templates.tsx — Template selection
- Editor.tsx — Drag-and-drop block editor
- Preview.tsx — Invitation preview
- GuestView.tsx — Guest view (envelope → invitation)
- Admin.tsx — Admin dashboard

## i18n
Languages: ru, en, zh
Translation keys provided in 11-languages.md

## Tech Stack
- Frontend: React 19 + Vite + Tailwind CSS + Framer Motion + @dnd-kit + Zustand
- Backend: Node.js + Express + Prisma + PostgreSQL
- Bot: grammy
- Payments: yookassa-ts
