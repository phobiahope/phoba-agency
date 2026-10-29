# Phoba Agency — сайт с ИИ-ассистентом

Рекламное агентство полного цикла: брендинг, таргетинг, SMM, аналитика.
Сайт содержит встроенный ИИ-ассистент «Анна», который:

- Знакомится с посетителем и помогает определиться с услугой
- Подробно рассказывает о сервисах и кейсах
- Задаёт уточняющие вопросы по бизнесу, бюджету, срокам
- Когда понимает задачу — формирует структурированное описание для менеджера
  и предлагает написать в Telegram менеджеру

## Стек

- Next.js 16** (App Router) + TypeScript 5
- Tailwind CSS 4** + shadcn/ui
- LLM через прямой fetch к OpenAI-совместимому API (по умолчанию
  reformboss.com / qwen-plus, ключ встроен; можно переключить на OpenAI,
  OpenRouter, DeepSeek, Groq и др. через переменные окружения)
- Prisma ORM (SQLite локально; на Vercel — Postgres)

**API-ключ уже встроен в код** (reformboss.com / qwen-plus) — ничего настраивать
не нужно. Это сделано специально для удобства запуска.

### Если хочешь использовать другого провайдера

Создай файл `.env.local` в корне проекта и переопредели переменные:

```bash
 Пример для OpenAI
ZAI_API_KEY="sk-..."
ZAI_BASE_URL="https://api.openai.com/v1"
ZAI_MODEL="gpt-4o-mini"

# Пример для OpenRouter (мульти-провайдер, есть бесплатные модели)
ZAI_API_KEY="sk-or-v1-..."
ZAI_BASE_URL="https://openrouter.ai/api/v1"
ZAI_MODEL="meta-llama/llama-3.3-70b-instruct"

# Пример для Groq (быстрый и бесплатный)
ZAI_API_KEY="gsk_..."
ZAI_BASE_URL="https://api.groq.com/openai/v1"
ZAI_MODEL="llama-3.3-70b-versatile"
```

Список других провайдеров — см. `.env.example`.

## Деплой на Vercel

Vercel — рекомендуемый хостинг, поддерживает Next.js и API routes из коробки.

1. Запушь репозиторий на GitHub.
2. Зайди на [vercel.com](https://vercel.com) → залогинься через GitHub.
3. **Add New... → Project** → выбери репозиторий.
4. Framework Preset: **Next.js** (определится автоматически).
5. Environment Variables можно НЕ добавлять — ключ уже встроен в код.
   (Если хочешь переопределить на свой — добавь `ZAI_API_KEY`, `ZAI_BASE_URL`, `ZAI_MODEL`.)
6. **Deploy**.

Подробная инструкция — в разделе **«Инструкция по деплою»** ниже.

### База данных на Vercel

Локально используется SQLite (`prisma/db.sqlite`), но на Vercel файловая система
эфемерна — SQLite не подойдёт. Варианты:

- **Vercel Postgres** (бесплатно для небольших проектов): Settings → Storage →
  Create Database → Postgres → подключи к проекту. Vercel сам подставит
  `DATABASE_URL` в переменные окружения. Затем обнови `prisma/schema.prisma`:
  ```prisma
  datasource db {
    provider = "postgresql"
    url      = env("DATABASE_URL")
  }
  ```
  и запуши — Vercel автоматически применит миграции.
- **База не нужна вообще**: проект Phoba Agency на текущий момент ничего не
  пишет в БД. Можно просто задеплоить как есть — `/api/chat` работает с LLM
  и БД не трогает. Prisma устанавливается, но schema пустая по факту не используется.

## Структура проекта

```
src/
├── app/
│   ├── api/
│   │   └── chat/
│   │       └── route.ts      ИИ-ассистент: приём сообщений, вызов LLM
│   ├── page.tsx               Главная страница (4 слайда + чат-виджет)
│   ├── phoba.css              Все стили Phoba Agency
│   ├── layout.tsx            Корневой layout
│   └── globals.css            Tailwind + shadcn
├── components/ui/             shadcn/ui компоненты
├── lib/
│   ├── agency-data.ts        Данные услуг/кейсов + контекст для LLM
│   ├── db.ts                 Prisma client
│   └── utils.ts
└── hooks/

prisma/
└── schema.prisma              Схема БД 
```

## Как работает ИИ-ассистент

1. Клиент открывает чат → фронт шлёт `POST /api/chat` с сообщением "Привет!"
2. Бэкенд (`src/app/api/chat/route.ts`) формирует системный промпт с данными
   об агентстве (услуги, кейсы, цены) и историей диалога, вызывает LLM через
   `z-ai-web-dev-sdk`.
3. LLM отвечает от лица «Анны, менеджера», задаёт уточняющие вопросы.
4. Когда клиент называет услугу + нишу + бюджет/сроки, ассистент формирует
   структурированное « Описание для менеджера» и предлагает написать в
   Telegram менеджеру
5. В ответе API возвращает флаг `handoffToTelegram: true` — фронт показывает
   отдельную синюю кнопку со ссылкой `https://t.me/менеджер`.

Системный промпт и контекст редактируются в `src/app/api/chat/route.ts` и
`src/lib/agency-data.ts`.

## Лицензия

MIT — используй как хочешь.
