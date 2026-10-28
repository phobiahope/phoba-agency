import { NextRequest, NextResponse } from "next/server";
import ZAI from "z-ai-web-dev-sdk";
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

// Глобальный кэш инстанса ZAI — переиспользуем между запросами.
let zaiPromise: Promise<Awaited<ReturnType<typeof ZAI.create>>> | null = null;

async function getZAI() {
  if (!zaiPromise) {
    zaiPromise = ZAI.create();
  }
  return zaiPromise;
}

export async function POST(req: NextRequest) {
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
    // Если пришла история — берём её, иначе — одно сообщение.
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

    // Ограничиваем длину истории, чтобы не раздувать контекст.
    // Оставляем системный промпт + последние 12 сообщений.
    if (messages.length > 12) {
      messages = messages.slice(-12);
    }

    const zai = await getZAI();

    const completion = await zai.chat.completions.create({
      messages: [
        { role: "assistant", content: SYSTEM_PROMPT },
        ...messages,
      ],
      thinking: { type: "disabled" },
    });

    const content = completion.choices?.[0]?.message?.content?.trim();

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
      /@cursedfantasy/i.test(content) ||
      /telegram/i.test(content);

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
        error: `Не удалось получить ответ от ассистента: ${message}`,
      },
      { status: 500 }
    );
  }
}
