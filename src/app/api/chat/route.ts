import { NextRequest, NextResponse } from "next/server";
import { buildAgencyContextForAI } from "@/lib/agency-data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ChatMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

const SYSTEM_PROMPT = `Ты — Анна, дружелюбный и компетентный менеджер-консультант рекламного агентства Phoba Agency. Ты общаешься с посетителем сайта в чате прямо сейчас.

== Твоя личность и стиль ==
• Дружелюбный, тёплый, живой тон. Не робот. Используй эмодзи аккуратно (1-2 на сообщение, не больше).
• Говоришь по-русски, простыми словами. Без канцелярита.
• Отвечаешь кратко и по делу (обычно 2–5 предложений), но всегда по сути вопроса.
• Никогда не выдумываешь факты, цены или сроки, которых нет в контексте ниже.
• Если не знаешь точную цену для конкретного случая — честно говоришь, что она зависит от объёма, и предлагаешь уточнить детали.

== Твои задачи в диалоге ==
1. ПОНЯТЬ, ЧТО ХОЧЕТ КЛИЕНТ. Задавай уточняющие вопросы про:
   - какой бизнес / ниша
   - какая услуга нужна (брендинг / таргетинг / SMM / аналитика / комбинация)
   - бюджет (если готов назвать)
   - сроки (если есть дедлайн)
   - текущая ситуация (запуск с нуля, есть действующий бизнес, есть ли материалы)
   Не спрашивай всё сразу — двигайся постепенно, по 1–2 вопроса за сообщение.

2. РАССКАЗАТЬ О СЕРВИСЕ ПОДРОБНО, если клиент спрашивает. Используй данные ниже — цены, что входит, примеры. Можешь упомянуть релевантные кейсы.

3. ОТВЕЧАТЬ НА ВОПРОСЫ. Про сроки, процессы, технологии, отчётность — что угодно.

4. КОГДА ПОНЯЛ ПОТРЕБНОСТЬ (есть услуга + бизнес/ниша + хотя бы бюджет или сроки):
   - Подведи короткий итог того, что понял.
   - СКАЖИ, ЧТО ЛУЧШЕ ПЕРЕЙТИ К МЕНЕДЖЕРУ В TELEGRAM для финальной оценки, договора и старта.
   - Укажи контакт: @cursedfantasy
   - Сформируй КРАТКОЕ, ЧИТАЕМОЕ ОПИСАНИЕ заявки (3–6 строк), которое клиент сможет скопировать и отправить менеджеру вместе с переходом в Telegram. В описании должно быть:
       • Имя/название проекта (если есть)
       • Услуга или комбинация
       • Ниша и краткое описание задачи
       • Бюджет (если назван) или "бюджет обсуждается"
       • Сроки (если есть) или "сроки гибкие"
       • Любые пожелания, которые клиент озвучил
   - Оформи это описание чётким блоком, который удобно скопировать. Например, начни со строки "📋 Описание для менеджера:" и дай готовый текст.
   - Сразу после блока с описанием дай короткую инструкцию: "Нажми на кнопку «Написать в Telegram» ниже — менеджер @cursedfantasy продолжит общение."

== Контакт для передачи заявки менеджеру ==
Telegram: @cursedfantasy

== НЕ делай ==
• Не назначай встречи сам — это делает менеджер.
• Не давай финальные сметы — для этого есть менеджер.
• Не пиши длинные полотна. Краткость важнее.
• Не переходи на английский — только русский.
• Никогда не упоминай, что ты ИИ, нейросеть, языковая модель. Ты — Анна, менеджер.

== Что знаешь об агентстве ==
${buildAgencyContextForAI()}

== Поведение в начале диалога ==
Когда клиент поздоровался или только открыл чат — поприветствуй его от лица Анны, скажи что ты менеджер Phoba Agency, и задай первый мягкий вопрос: чем занимаетесь / что хотите сделать. Не вываливай сразу все услуги.`;

/**
 * Конфигурация LLM-провайдера.
 *
 * По умолчанию используем Google Gemini (ключ ниже встроен как fallback).
 * Можно переопределить через переменные окружения:
 *   ZAI_API_KEY   — API-ключ провайдера
 *   ZAI_BASE_URL  — base URL API (с /v1 или /v1beta/openai в конце)
 *   ZAI_MODEL     — название модели
 *   ZAI_TOKEN, ZAI_CHAT_ID, ZAI_USER_ID — доп. заголовки Z.ai internal API
 *
 * На Vercel: Settings → Environment Variables.
 * Локально: создай файл .env.local со строкой ZAI_API_KEY=твой_ключ.
 *
 * ВАЖНО: Google Gemini блокирует запросы из некоторых регионов (РФ, Беларусь, Китай).
 * Если получаешь ошибку "User location is not supported" — включи VPN (США/Европа).
 */

// Ключ Gemini по умолчанию (можно переопределить через env ZAI_API_KEY).
// На Vercel ОБЯЗАТЕЛЬНО переопредели через Environment Variables,
// иначе ключ будет публичным в исходном коде.
const DEFAULT_API_KEY =
  process.env.ZAI_API_KEY ||
  "AQ.Ab8RN6L6ghzslPJbGlJvOVymM7OKkbzIUWHwhRgqfOWV_ZPozg";

const DEFAULT_BASE_URL =
  process.env.ZAI_BASE_URL ||
  "https://generativelanguage.googleapis.com/v1beta/openai";
const DEFAULT_MODEL = process.env.ZAI_MODEL || "gemini-3.8-flash";

function getConfig() {
  const baseUrl = (process.env.ZAI_BASE_URL || DEFAULT_BASE_URL).replace(/\/+$/, "");
  const apiKey = process.env.ZAI_API_KEY || DEFAULT_API_KEY;
  const token = process.env.ZAI_TOKEN; // для Z.ai internal API (X-Token)
  const model = process.env.ZAI_MODEL || DEFAULT_MODEL;
  const chatId = process.env.ZAI_CHAT_ID;
  const userId = process.env.ZAI_USER_ID;
  return { baseUrl, apiKey, token, model, chatId, userId };
}

/**
 * Строим заголовки запроса к LLM.
 * Для Z.ai internal API (если заданы token/chatId/userId) добавляем X-заголовки.
 * Для Gemini/OpenAI/OpenRouter/DeepSeek — стандартный Authorization: Bearer.
 */
function buildHeaders(cfg: ReturnType<typeof getConfig>): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${cfg.apiKey}`,
  };
  // Z.ai internal API требует эти заголовки. Добавляем только если заданы.
  if (cfg.token) headers["X-Token"] = cfg.token;
  if (cfg.chatId) headers["X-Chat-Id"] = cfg.chatId;
  if (cfg.userId) headers["X-User-Id"] = cfg.userId;
  return headers;
}

export async function POST(req: NextRequest) {
  const cfg = getConfig();

  if (!cfg.apiKey) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "ИИ-ассистент не сконфигурирован. На Vercel: Settings → Environment Variables → добавь ZAI_API_KEY. Локально: создай файл .env.local со строкой ZAI_API_KEY=твой_ключ.",
      },
      { status: 500 }
    );
  }

  try {
    const body = (await req.json().catch(() => null)) as
      | { messages?: ChatMessage[]; message?: string }
      | null;

    if (!body) {
      return NextResponse.json(
        { ok: false, error: "Неверный формат запроса" },
        { status: 400 }
      );
    }

    // Поддерживаем два формата: { message } (одно сообщение) или { messages[] } (история).
    let messages: ChatMessage[];

    if (Array.isArray(body.messages) && body.messages.length > 0) {
      messages = body.messages
        .filter((m) => m && typeof m.content === "string" && m.content.trim())
        .map((m) => ({
          role: m.role === "assistant" ? "assistant" : "user",
          content: m.content,
        }));
    } else if (typeof body.message === "string" && body.message.trim()) {
      messages = [{ role: "user", content: body.message.trim() }];
    } else {
      return NextResponse.json(
        { ok: false, error: "Сообщение пустое" },
        { status: 400 }
      );
    }

    // Ограничиваем длину истории — системный промпт + последние 12 сообщений.
    if (messages.length > 12) {
      messages = messages.slice(-12);
    }

    // Прямой вызов OpenAI-совместимого API.
    // Работает с: Z.ai, OpenAI, OpenRouter, DeepSeek, Together AI,
    // GigaChat (с своим baseUrl), локальным Ollama и любым другим
    // провайдером, поддерживающим /v1/chat/completions.
    const apiResponse = await fetch(`${cfg.baseUrl}/chat/completions`, {
      method: "POST",
      headers: buildHeaders(cfg),
      body: JSON.stringify({
        model: cfg.model,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages,
        ],
        temperature: 0.7,
        max_tokens: 1024,
      }),
    });

    if (!apiResponse.ok) {
      const errText = await apiResponse.text().catch(() => "");
      console.error(
        `[/api/chat] LLM API ${apiResponse.status}: ${errText.slice(0, 500)}`
      );

      // Человекопонятные сообщения для частых ошибок Gemini.
      let userMessage = `LLM-провайдер вернул ошибку ${apiResponse.status}.`;

      if (apiResponse.status === 400 || apiResponse.status === 403) {
        if (/location is not supported/i.test(errText)) {
          userMessage =
            "Google Gemini заблокировал запрос по твоему региону. Включи VPN (США/Европа) и попробуй снова.";
        } else if (/API key not valid|API_KEY_INVALID/i.test(errText)) {
          userMessage =
            "Неверный API-ключ. Проверь, что ZAI_API_KEY задан правильно.";
        } else if (/model.*not.*available|not found/i.test(errText)) {
          userMessage =
            "Указанная модель недоступна. Попробуй gemini-3.8-flash или gemini-2.5-flash (укажи через ZAI_MODEL).";
        } else if (/quota|rate limit|429/i.test(errText)) {
          userMessage =
            "Превышен лимит запросов к Gemini (бесплатный tier: 15 запросов/мин, 1500/день). Подожди минуту.";
        }
      } else if (apiResponse.status === 429) {
        userMessage =
          "Превышен лимит запросов к Gemini. Подожди минуту и попробуй снова.";
      }

      return NextResponse.json(
        { ok: false, error: userMessage },
        { status: 502 }
      );
    }

    const data = await apiResponse.json();
    const content: string | undefined = data?.choices?.[0]?.message?.content?.trim();

    if (!content) {
      return NextResponse.json(
        {
          ok: false,
          error: "Модель вернула пустой ответ. Попробуйте ещё раз.",
        },
        { status: 502 }
      );
    }

    // Детектим, что в ответе есть упоминание Telegram-контакта — фронтенд
    // в этом случае покажет кнопку "Написать в Telegram".
    const mentionsTelegram =
      /@cursedfantasy/i.test(content) || /telegram/i.test(content);

    return NextResponse.json({
      ok: true,
      reply: content,
      handoffToTelegram: mentionsTelegram,
    });
  } catch (err) {
    console.error("[/api/chat] error:", err);
    const message =
      err instanceof Error ? err.message : "Неизвестная ошибка на сервере";
    return NextResponse.json(
      {
        ok: false,
        error: `Не удалось связаться с LLM-провайдером: ${message}`,
      },
      { status: 500 }
    );
  }
}
