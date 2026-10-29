// Общие данные Phoba Agency
// Используются как на фронтенде (рендер карточек, модалок), так и на бэкенде
// (контекст для AI-ассистента в /api/chat).

export type Service = {
  id: string;
  name: string;
  category: string;
  icon: string; // SVG-строка
  short: string;
  detailed: string;
  includes: string[];
  images: string[];
  tags: string[];
  price: string;
};

export type CaseItem = {
  id: string;
  brand: string;
  title: string;
  desc: string;
  cover: string;
  images: string[];
  stats: { value: string; label: string }[];
  tags: string[];
};

export const services: Service[] = [
  {
    id: "branding",
    name: "Брендинг",
    category: "Стратегия и идентичность",
    icon: `<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a15 15 0 0 1 0 20"></path><path d="M12 2a15 15 0 0 0 0 20"></path><line x1="2" y1="12" x2="22" y2="12"></line></svg>`,
    short:
      "Создаём логотип, фирменный стиль и визуальную идентичность для вашего бизнеса.",
    detailed:
      "Брендинг — это не просто логотип. Это цельная система, по которой вас будут узнавать. Мы проводим анализ рынка, определяем позиционирование, создаём название (если нужно), разрабатываем логотип и полный фирстиль, а также бренд-бук с правилами использования. На выходе вы получаете готовый инструмент, который можно применять в любых точках контакта с клиентом.",
    includes: [
      "Логотип и знаки",
      "Фирменный стиль",
      "Brand book (60+ стр.)",
      "Цветовая палитра",
      "Типографика",
      "Шаблоны соцсетей",
      "Бизнес-карточки",
      "Презентации",
    ],
    images: [
      "https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1572044162444-ad60f128bdea?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1606857521015-7f9fcf423740?auto=format&fit=crop&w=600&q=80",
    ],
    tags: ["Логотип", "Brand book", "Фирстиль", "Naming"],
    price: "от 80 000 ₽",
  },
  {
    id: "targeting",
    name: "Таргетинг",
    category: "Performance-маркетинг",
    icon: `<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>`,
    short:
      "Разрабатываем рекламные кампании, которые приносят клиентов, а не показы.",
    detailed:
      "Таргетированная реклама в VK, Instagram, Facebook и Telegram. Мы не просто запускаем кампании — мы строим систему. Анализируем вашу аудиторию, сегментируем её, создаём креативы под каждый сегмент, тестируем гипотезы и масштабируем то, что работает. Прозрачная аналитика и отчётность каждую неделю.",
    includes: [
      "Анализ аудитории",
      "Сегментация ЦА",
      "Создание креативов",
      "A/B тесты",
      "Настройка пикселя",
      "Ретаргетинг",
      "Еженедельные отчёты",
      "Оптимизация CPM/CPC",
    ],
    images: [
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1611926653458-09294b3142bf?auto=format&fit=crop&w=600&q=80",
    ],
    tags: ["VK Реклама", "Meta Ads", "Telegram Ads", "Аналитика"],
    price: "от 35 000 ₽/мес",
  },
  {
    id: "smm",
    name: "SMM",
    category: "Соцсети и контент",
    icon: `<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 2l4 4-4 4"></path><path d="M3 11v-1a4 4 0 0 1 4-4h14"></path><path d="M7 22l-4-4 4-4"></path><path d="M21 13v1a4 4 0 0 1-4 4H3"></path></svg>`,
    short: "Ведём соцсети так, чтобы аудитория ждала ваших постов и покупала.",
    detailed:
      "Полное ведение социальных сетей: Instagram, VK, Telegram, YouTube. Разрабатываем контент-стратегию, создаём визуал, пишем тексты, снимаем Reels и Stories, общаемся с аудиторией и работаем с комментариями. Цель — не просто публикации, а живое комьюнити вокруг вашего бренда.",
    includes: [
      "Контент-стратегия",
      "Контент-план на месяц",
      "Дизайн постов",
      "Тексты и сценарии",
      "Reels и Stories",
      "Сообщества и комменты",
      "Storytelling",
      "Инфлюенсеры",
    ],
    images: [
      "https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1611926653458-09294b3142bf?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1432888622747-4eb9a8efeb4b?auto=format&fit=crop&w=600&q=80",
    ],
    tags: ["Instagram", "VK", "Telegram", "Контент"],
    price: "от 45 000 ₽/мес",
  },
  {
    id: "analytics",
    name: "Аналитика",
    category: "Data-driven решения",
    icon: `<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>`,
    short: "Превращаем данные в решения. Знаем, что работает, а что — нет.",
    detailed:
      "Сквозная аналитика и attribution-модели. Подключаем Яндекс.Метрику, Google Analytics 4, настраиваем цели и события, строим дашборды в Power BI или Looker Studio. Находим узкие места в воронке, считаем ROI каждого канала и даём рекомендации по оптимизации бюджета. Маркетинг, который измерим — управляем.",
    includes: [
      "Сквозная аналитика",
      "Настройка Метрики/GA4",
      "Дашборды (BI)",
      "Атрибуция каналов",
      "A/B-тесты",
      "Расчёт ROI/ROMI",
      "Отчёты по воронке",
      "Рекомендации",
    ],
    images: [
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1543286386-2e659306cd6c?auto=format&fit=crop&w=600&q=80",
    ],
    tags: ["Метрика", "GA4", "BI-дашборды", "ROI"],
    price: "от 25 000 ₽",
  },
];

export const cases: CaseItem[] = [
  {
    id: "nike",
    brand: "Nike",
    title: "Кампания «Run Your City»",
    desc: "Создали динамичную видео-кампанию с яркой графикой и баннерами для запуска новой линейки беговой одежды. Запуск прошёл одновременно в Instagram, YouTube и наружной рекламе трёх городов.",
    cover:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1556906781-9a412961c28c?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?auto=format&fit=crop&w=800&q=80",
    ],
    stats: [
      { value: "2.3M", label: "Охват" },
      { value: "+45%", label: "Вовлечённость" },
      { value: "180K", label: "Переходов" },
    ],
    tags: ["Видеопродакшн", "Таргетинг", "SMM", "Брендинг"],
  },
  {
    id: "adidas",
    brand: "Adidas",
    title: "Запуск Ultraboost 22",
    desc: "Онлайн-продвижение нового продукта через соцсети и инфлюенсеров. Разработали лендинг, серию сторис и Reels, настроили ретаргетинг на горячую аудиторию.",
    cover:
      "https://images.unsplash.com/photo-1518002171953-a080ee817e1f?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1556906918-c3cd8f5c4060?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1599058917765-a780eda07a3e?auto=format&fit=crop&w=800&q=80",
    ],
    stats: [
      { value: "+60%", label: "Продажи" },
      { value: "1.8M", label: "Охват" },
      { value: "12%", label: "Конверсия" },
    ],
    tags: ["Лендинг", "Инфлюенсеры", "Таргетинг"],
  },
  {
    id: "reebok",
    brand: "Reebok",
    title: "Визуал для Instagram",
    desc: "Разработали стильный визуальный контент и промо-материалы для сайта и Instagram. Создали единый визуальный язык для ленты на 6 месяцев вперёд.",
    cover:
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&w=800&q=80",
    ],
    stats: [
      { value: "+35%", label: "Подписчики" },
      { value: "8.7%", label: "ER" },
      { value: "94", label: "Поста" },
    ],
    tags: ["SMM", "Дизайн", "Контент"],
  },
  {
    id: "kappa",
    brand: "Kappa",
    title: "Лендинг кампании SS24",
    desc: "Создали лендинг и графику для кампании, чтобы бренд выглядел современно и привлекательно. Запустили A/B тесты двух вариантов лендинга и оптимизировали конверсию.",
    cover:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80",
    ],
    stats: [
      { value: "+28%", label: "Конверсия" },
      { value: "0.8с", label: "Загрузка" },
      { value: "A/B", label: "Тесты" },
    ],
    tags: ["Веб-дизайн", "Разработка", "Аналитика"],
  },
];

// Краткое описание для системного промпта AI.
// Включаем услуги, кейсы, цены и цели агентства.
export function buildAgencyContextForAI(): string {
  const servicesBlock = services
    .map((s) => {
      return `• ${s.name} (${s.category}) — ${s.short}\n  Цена: ${s.price}\n  Что входит: ${s.includes.join(", ")}\n  Подробнее: ${s.detailed}`;
    })
    .join("\n\n");

  const casesBlock = cases
    .map((c) => {
      return `• ${c.brand} — ${c.title}\n  ${c.desc}\n  Результаты: ${c.stats
        .map((s) => `${s.value} (${s.label})`)
        .join(", ")}`;
    })
    .join("\n\n");

  return `== Phoba Agency — Рекламное агентство полного цикла ==

Мы объединяем стратегию, дизайн и технологии, чтобы выводить бренды на новый уровень. Полный цикл работ под ключ: от идеи до результата.

Стаж на рынке: 7 лет. 120 завершённых проектов. 48 клиентов. 98% довольных.

== Услуги ==

${servicesBlock}

== Кейсы ==

${casesBlock}

== Контакт для передачи заявки менеджеру ==

Telegram-менеджер: @cursedfantasy — именно туда отправляем клиента, когда определили его потребности.`;
}
