"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { services, cases } from "@/lib/agency-data";
import "./phoba.css";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  time: number;
};

type ChatApiResponse = {
  ok: boolean;
  reply?: string;
  handoffToTelegram?: boolean;
  error?: string;
};

const TELEGRAM_HANDLER = "@cursedfantasy";
const TELEGRAM_URL = `https://t.me/${TELEGRAM_HANDLER.replace("@", "")}`;

export default function Page() {
  // ===== Навигация (слайды) =====
  const slidesRef = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(0);

  const slides = useMemo(
    () => ["Главная", "Услуги", "Кейсы", "Контакты"],
    []
  );

  const goToSlide = useCallback(
    (i: number) => {
      const clamped = Math.max(0, Math.min(slides.length - 1, i));
      const slidesEl = slidesRef.current;
      if (!slidesEl) return;
      const slide = slidesEl.querySelectorAll<HTMLElement>(".slide")[
        clamped
      ];
      slide?.scrollIntoView({ behavior: "smooth" });
    },
    [slides.length]
  );

  // ===== Прогресс-бар и активная навигация =====
  const progressBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const slidesEl = slidesRef.current;
    if (!slidesEl) return;

    const onScroll = () => {
      const max = slidesEl.scrollHeight - slidesEl.clientHeight;
      const pct = max > 0 ? slidesEl.scrollTop / max : 0;
      const newCurrent = Math.round(pct * (slides.length - 1));
      setCurrent((prev) => (prev !== newCurrent ? newCurrent : prev));
      if (progressBarRef.current) {
        progressBarRef.current.style.width = `${pct * 100}%`;
      }
    };
    slidesEl.addEventListener("scroll", onScroll, { passive: true });
    return () => slidesEl.removeEventListener("scroll", onScroll);
  }, [slides.length]);

  // Клавиатура: стрелки вверх/вниз для переключения слайдов, Escape для закрытия модалок/чата.
  // Wheel НЕ перехватываем — пусть нативный scroll-snap сам плавно снапает.
  // Это убирает «дёрганье» от двойной прокрутки (нативная + программная) и
  // делает скролл на трекпадах плавным.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        goToSlide(current + 1);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        goToSlide(current - 1);
      } else if (e.key === "Escape") {
        if (lightboxOpen) setLightboxOpen(false);
        else if (caseModalOpen) setCaseModalOpen(false);
        else if (serviceModalOpen) setServiceModalOpen(false);
        else if (chatOpen) setChatOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  // ===== Анимация счётчиков =====
  const statsRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const anim = () => {
      const els = document.querySelectorAll<HTMLElement>("[data-count]");
      els.forEach((el) => {
        const target = parseInt(el.dataset.count || "0", 10);
        const duration = 1800;
        const start = performance.now();
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - t, 3);
          el.textContent = String(Math.round(target * eased));
          if (t < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });
    };
    const tm = setTimeout(anim, 500);
    return () => clearTimeout(tm);
  }, []);

  // ===== Cursor glow =====
  const cursorGlowRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const g = cursorGlowRef.current;
      if (!g) return;
      g.style.left = `${e.clientX}px`;
      g.style.top = `${e.clientY}px`;
      g.style.opacity = "1";
    };
    const onLeave = () => {
      if (cursorGlowRef.current) cursorGlowRef.current.style.opacity = "0";
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseleave", onLeave);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  // ===== Модалки услуг и кейсов =====
  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [activeService, setActiveService] = useState(0);
  const [caseModalOpen, setCaseModalOpen] = useState(false);
  const [activeCase, setActiveCase] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxSrc, setLightboxSrc] = useState("");

  // ===== Карусели (loop-карусель как в оригинале) =====
  const servicesTrackRef = useRef<HTMLDivElement>(null);
  const casesTrackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tracks = [
      { el: servicesTrackRef.current, gap: 18, speed: 5000 },
      { el: casesTrackRef.current, gap: 18, speed: 5000 },
    ];

    const cleanups: (() => void)[] = [];

    tracks.forEach(({ el, gap, speed }) => {
      if (!el) return;
      // Клонируем детей для бесконечной прокрутки
      const items = Array.from(el.children) as HTMLElement[];
      if (items.length === 0) return;

      // Очищаем предыдущие клоны (на случай hot-reload)
      el.querySelectorAll("[data-clone]").forEach((n) => n.remove());

      // Добавляем клоны в конец
      items.forEach((item) => {
        const clone = item.cloneNode(true) as HTMLElement;
        clone.setAttribute("data-clone", "true");
        el.appendChild(clone);
      });
      // И в начало
      items
        .slice()
        .reverse()
        .forEach((item) => {
          const clone = item.cloneNode(true) as HTMLElement;
          clone.setAttribute("data-clone", "true");
          el.insertBefore(clone, el.firstChild);
        });

      let w = items[0].getBoundingClientRect().width + gap;

      const updateTrack = (animating: boolean) => {
        el.style.transition = animating
          ? "transform 0.7s cubic-bezier(0.16,1,0.3,1)"
          : "none";
        el.style.transform = `translateX(${-(index * w)}px)`;
      };

      let index = items.length;
      let animating = false;
      let autoTimer: ReturnType<typeof setTimeout>;

      const scrollLeft = () => {
        if (animating) return;
        animating = true;
        index--;
        updateTrack(true);
        setTimeout(() => {
          if (index < items.length) {
            index += items.length;
            animating = false;
            updateTrack(false);
          } else animating = false;
        }, 700);
      };
      const scrollRight = () => {
        if (animating) return;
        animating = true;
        index++;
        updateTrack(true);
        setTimeout(() => {
          if (index >= items.length * 2) {
            index -= items.length;
            animating = false;
            updateTrack(false);
          } else animating = false;
        }, 700);
      };

      // Привязываем кнопки
      const wrapper = el.parentElement;
      if (wrapper) {
        const leftBtn = wrapper.querySelector(".carousel-arrow.left");
        const rightBtn = wrapper.querySelector(".carousel-arrow.right");
        const onLeft = () => scrollLeft();
        const onRight = () => scrollRight();
        leftBtn?.addEventListener("click", onLeft);
        rightBtn?.addEventListener("click", onRight);

        const onMouseEnter = () => clearTimeout(autoTimer);
        const onMouseLeave = () => {
          autoTimer = setTimeout(autoScroll, speed);
        };
        wrapper.addEventListener("mouseenter", onMouseEnter);
        wrapper.addEventListener("mouseleave", onMouseLeave);

        cleanups.push(() => {
          leftBtn?.removeEventListener("click", onLeft);
          rightBtn?.removeEventListener("click", onRight);
          wrapper.removeEventListener("mouseenter", onMouseEnter);
          wrapper.removeEventListener("mouseleave", onMouseLeave);
        });

        function autoScroll() {
          scrollRight();
          autoTimer = setTimeout(autoScroll, speed);
        }
        autoTimer = setTimeout(autoScroll, speed);
      }

      const onResize = () => {
        w = items[0].getBoundingClientRect().width + gap;
        updateTrack(false);
      };
      window.addEventListener("resize", onResize);
      cleanups.push(() => window.removeEventListener("resize", onResize));

      updateTrack(false);
    });

    return () => cleanups.forEach((fn) => fn());
  }, []);

  // Блокировка скролла body при открытой модалке
  useEffect(() => {
    if (serviceModalOpen || caseModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [serviceModalOpen, caseModalOpen]);

  // ===== Форма контактов =====
  const submitForm = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const nameInput = form.querySelector(
      'input[type="text"]'
    ) as HTMLInputElement | null;
    const name = nameInput?.value || "Гость";
    openChat(`Здравствуйте! Меня зовут ${name}, хочу обсудить проект.`);
    form.reset();
  };

  // ===== Чат =====
  const [chatOpen, setChatOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [chatInitialized, setChatInitialized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [showTelegramHandoff, setShowTelegramHandoff] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);

  const chatPanelRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Прокрутка вниз при новых сообщениях
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping, chatError, showTelegramHandoff]);

  const addMessage = useCallback(
    (content: string, role: "user" | "assistant") => {
      setMessages((prev) => [
        ...prev,
        { role, content, time: Date.now() },
      ]);
    },
    []
  );

  const initChat = useCallback(async () => {
    if (chatInitialized) return;
    setChatInitialized(true);

    // Приветствие от ассистента через backend
    setIsTyping(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: "Привет!" }],
        }),
      });
      const data: ChatApiResponse = await res.json();
      if (data.ok && data.reply) {
        addMessage(data.reply, "assistant");
      } else {
        addMessage(
          "👋 Привет! Я Анна, менеджер Phoba Agency. Чем могу помочь?",
          "assistant"
        );
      }
    } catch {
      addMessage(
        "👋 Привет! Я Анна, менеджер Phoba Agency. Чем могу помочь?",
        "assistant"
      );
    } finally {
      setIsTyping(false);
    }
  }, [chatInitialized, addMessage]);

  const toggleChat = () => {
    setChatOpen((prev) => {
      const next = !prev;
      if (next) {
        setUnreadCount(0);
        setTimeout(() => inputRef.current?.focus(), 300);
      }
      return next;
    });
  };

  const openChat = (prefilledText?: string) => {
    if (!chatOpen) setChatOpen(true);
    setUnreadCount(0);
    setTimeout(() => inputRef.current?.focus(), 300);
    if (prefilledText) {
      setInput(prefilledText);
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.style.height = "auto";
          inputRef.current.style.height =
            Math.min(inputRef.current.scrollHeight, 80) + "px";
        }
      }, 320);
    }
  };

  const sendMessage = async (raw?: string) => {
    const text = (raw ?? input).trim();
    if (!text || isSending) return;

    setChatError(null);
    addMessage(text, "user");
    setInput("");
    if (inputRef.current) inputRef.current.style.height = "auto";

    setIsSending(true);
    setIsTyping(true);

    // Собираем всю историю для бэкенда
    const history = [
      ...messages.map((m) => ({ role: m.role, content: m.content })),
      { role: "user" as const, content: text },
    ];

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
      });
      const data: ChatApiResponse = await res.json();
      setIsTyping(false);
      if (data.ok && data.reply) {
        addMessage(data.reply, "assistant");
        if (data.handoffToTelegram) {
          setShowTelegramHandoff(true);
          if (!chatOpen) setUnreadCount((c) => c + 1);
        }
      } else {
        setChatError(
          data.error || "Не удалось получить ответ. Попробуйте ещё раз."
        );
      }
    } catch (err) {
      setIsTyping(false);
      setChatError(
        err instanceof Error
          ? `Ошибка соединения: ${err.message}`
          : "Ошибка соединения с сервером"
      );
    } finally {
      setIsSending(false);
    }
  };

  const handleChatKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const autoResize = (el: HTMLTextAreaElement) => {
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 80) + "px";
  };

  // Если чат закрыт и пришло сообщение от ассистента — увеличиваем счётчик
  useEffect(() => {
    if (!chatOpen) {
      const lastIsAgent =
        messages.length > 0 && messages[messages.length - 1].role === "assistant";
      if (lastIsAgent && messages.length > 0) {
        // увеличиваем только если последнее сообщение ассистента пришло после последнего юзера
        // простейшая эвристика — не увеличиваем на приветствии
        if (messages.length > 1) {
          setUnreadCount((c) => (c === 0 ? 1 : c));
        }
      }
    }
  }, [messages, chatOpen]);

  const openServiceModal = (index: number) => {
    setActiveService(index);
    setServiceModalOpen(true);
  };
  const openCaseModal = (index: number) => {
    setActiveCase(index);
    setCaseModalOpen(true);
  };
  const openLightbox = (src: string) => {
    setLightboxSrc(src);
    setLightboxOpen(true);
  };

  const activeServiceData = services[activeService];
  const activeCaseData = cases[activeCase];

  return (
    <div className="phoba-page">
      <div className="bg-blobs">
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />
      </div>

      <div className="progress-bar" ref={progressBarRef} />

      <nav className="side-nav">
        {slides.map((label, i) => (
          <button
            key={label}
            className={`nav-dot${i === current ? " active" : ""}`}
            data-label={label}
            onClick={() => goToSlide(i)}
            aria-label={label}
          />
        ))}
      </nav>

      <div className="slides" ref={slidesRef}>
        {/* === Слайд 1: Hero === */}
        <section className="slide" data-index={0}>
          <div className="panel">
            <span className="badge">● Рекламное агентство</span>
            <h1 className="gradient-text">Phoba Agency</h1>
            <div className="lead">Создаём кампании, которые запоминаются.</div>
            <p
              style={{
                maxWidth: 540,
                color: "var(--muted)",
                margin: "18px 0 0 0",
                lineHeight: 1.6,
              }}
            >
              Мы объединяем стратегию, дизайн и технологии, чтобы выводить
              бренды на новый уровень. От идеи до результата — полный цикл
              работ под ключ.
            </p>

            <div
              style={{
                display: "flex",
                gap: 12,
                marginTop: 32,
                flexWrap: "wrap",
              }}
            >
              <button className="cta" onClick={() => goToSlide(1)}>
                Наши услуги
              </button>
              <button className="cta-ghost" onClick={() => openChat()}>
                Написать в чат
              </button>
            </div>

            <div className="hero-stats" ref={statsRef}>
              <div className="hero-stat">
                <div className="hero-stat-value" data-count={120}>
                  0
                </div>
                <div className="hero-stat-label">Проектов</div>
              </div>
              <div className="hero-stat">
                <div className="hero-stat-value" data-count={48}>
                  0
                </div>
                <div className="hero-stat-label">Клиентов</div>
              </div>
              <div className="hero-stat">
                <div className="hero-stat-value" data-count={7}>
                  0
                </div>
                <div className="hero-stat-label">Лет на рынке</div>
              </div>
              <div className="hero-stat">
                <div className="hero-stat-value" data-count={98}>
                  0
                </div>
                <div className="hero-stat-label">% Довольных</div>
              </div>
            </div>
          </div>
        </section>

        {/* === Слайд 2: Услуги === */}
        <section className="slide" data-index={1}>
          <div className="panel">
            <span className="badge">Услуги</span>
            <h1>
              Что мы <span className="gradient-text">предлагаем</span>
            </h1>
            <div className="lead" style={{ marginBottom: 24 }}>
              Нажмите на услугу, чтобы узнать подробности.
            </div>

            <div className="services-wrapper">
              <button
                className="carousel-arrow left"
                aria-label="Назад"
                type="button"
              >
                <span>‹</span>
              </button>
              <button
                className="carousel-arrow right"
                aria-label="Вперёд"
                type="button"
              >
                <span>›</span>
              </button>
              <div className="services-track" ref={servicesTrackRef}>
                {services.map((s, i) => (
                  <div
                    className="service"
                    key={s.id}
                    onClick={() => openServiceModal(i)}
                  >
                    <div
                      className="service-icon"
                      dangerouslySetInnerHTML={{ __html: s.icon }}
                    />
                    <h3>{s.name}</h3>
                    <p>{s.short}</p>
                    <span className="service-arrow">Подробнее →</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* === Слайд 3: Кейсы === */}
        <section className="slide" data-index={2}>
          <div className="panel">
            <span className="badge">Портфолио</span>
            <h1>
              Наши <span className="gradient-text">кейсы</span>
            </h1>
            <div className="lead" style={{ marginBottom: 24 }}>
              Нажмите на кейс, чтобы посмотреть подробности.
            </div>
            <div className="services-wrapper">
              <button
                className="carousel-arrow left"
                aria-label="Назад"
                type="button"
              >
                <span>‹</span>
              </button>
              <button
                className="carousel-arrow right"
                aria-label="Вперёд"
                type="button"
              >
                <span>›</span>
              </button>
              <div className="services-track" ref={casesTrackRef}>
                {cases.map((c, i) => (
                  <div
                    className="service clickable"
                    key={c.id}
                    onClick={() => openCaseModal(i)}
                  >
                    <div
                      className="case-thumb"
                      style={{ backgroundImage: `url('${c.cover}')` }}
                    />
                    <div className="brand">{c.brand}</div>
                    <p
                      style={{
                        color: "rgba(255,255,255,0.85)",
                        fontSize: 15,
                        fontWeight: 600,
                        margin: "0 0 8px 0",
                      }}
                    >
                      {c.title}
                    </p>
                    <p style={{ color: "var(--muted)", fontSize: 13 }}>
                      {c.desc.substring(0, 80)}...
                    </p>
                    <span className="view-btn">Смотреть кейс →</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* === Слайд 4: Контакты === */}
        <section className="slide" data-index={3}>
          <div className="panel" style={{ maxWidth: 560 }}>
            <span className="badge">Связаться</span>
            <h1>
              Начнём <span className="gradient-text">проект</span>
            </h1>
            <div className="lead" style={{ marginBottom: 24 }}>
              Заполните форму или напишите в чат — ассистент поможет
              определиться с услугой и переведёт к менеджеру.
            </div>

            <form className="contact-form" onSubmit={submitForm}>
              <input type="text" placeholder="Ваше имя" required />
              <input type="email" placeholder="Email" required />
              <textarea
                rows={4}
                placeholder="Расскажите о проекте"
              />
              <button type="submit">Отправить заявку</button>
            </form>

            <div className="contact-hint">
              <span className="pulse-dot" />
              Менеджер онлайн — напишите в чат, ассистент ответит за ~1 минуту
            </div>
          </div>
        </section>
      </div>

      {/* === Модалка услуги === */}
      <div
        className={`modal-backdrop${serviceModalOpen ? " open" : ""}`}
        onClick={(e) => {
          if (e.target === e.currentTarget) setServiceModalOpen(false);
        }}
      >
        <div className="modal">
          <button
            className="modal-close"
            onClick={() => setServiceModalOpen(false)}
            aria-label="Закрыть"
          >
            ×
          </button>
          {activeServiceData && (
            <>
              <div
                className="modal-icon"
                dangerouslySetInnerHTML={{
                  __html: activeServiceData.icon,
                }}
              />
              <div className="modal-brand">
                {activeServiceData.category}
              </div>
              <h2 className="modal-title">{activeServiceData.name}</h2>
              <p className="modal-desc">{activeServiceData.detailed}</p>

              <h3 className="modal-section-title">Что входит</h3>
              <ul className="modal-includes">
                {activeServiceData.includes.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>

              <h3 className="modal-section-title">Примеры работ</h3>
              <div className="modal-gallery">
                {activeServiceData.images.map((src) => (
                  <div
                    key={src}
                    className="gallery-item"
                    style={{ backgroundImage: `url('${src}')` }}
                    onClick={(e) => {
                      e.stopPropagation();
                      openLightbox(src);
                    }}
                  />
                ))}
              </div>

              <div className="modal-tags">
                {activeServiceData.tags.map((t) => (
                  <span className="modal-tag" key={t}>
                    {t}
                  </span>
                ))}
              </div>

              <div className="modal-footer">
                <div className="modal-price">
                  <span className="modal-price-label">Стоимость</span>
                  <span className="modal-price-value">
                    {activeServiceData.price}
                  </span>
                </div>
                <button
                  className="modal-cta"
                  onClick={() => {
                    setServiceModalOpen(false);
                    openChat(
                      `Здравствуйте! Хочу узнать подробнее про услугу: ${activeServiceData.name}.`
                    );
                  }}
                >
                  Обсудить проект →
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* === Модалка кейса === */}
      <div
        className={`modal-backdrop${caseModalOpen ? " open" : ""}`}
        onClick={(e) => {
          if (e.target === e.currentTarget) setCaseModalOpen(false);
        }}
      >
        <div className="modal">
          <button
            className="modal-close"
            onClick={() => setCaseModalOpen(false)}
            aria-label="Закрыть"
          >
            ×
          </button>
          {activeCaseData && (
            <>
              <div className="modal-brand">{activeCaseData.brand}</div>
              <h2 className="modal-title">{activeCaseData.title}</h2>
              <p className="modal-desc">{activeCaseData.desc}</p>

              <h3 className="modal-section-title">Результаты</h3>
              <div className="modal-stats">
                {activeCaseData.stats.map((s) => (
                  <div className="stat-card" key={s.label}>
                    <div className="stat-value">{s.value}</div>
                    <div className="stat-label">{s.label}</div>
                  </div>
                ))}
              </div>

              <h3 className="modal-section-title">Галерея</h3>
              <div className="modal-gallery">
                {activeCaseData.images.map((src) => (
                  <div
                    key={src}
                    className="gallery-item"
                    style={{ backgroundImage: `url('${src}')` }}
                    onClick={(e) => {
                      e.stopPropagation();
                      openLightbox(src);
                    }}
                  />
                ))}
              </div>

              <div className="modal-tags">
                {activeCaseData.tags.map((t) => (
                  <span className="modal-tag" key={t}>
                    {t}
                  </span>
                ))}
              </div>

              <div className="modal-footer">
                <button
                  className="modal-cta"
                  onClick={() => {
                    setCaseModalOpen(false);
                    openChat(
                      `Здравствуйте! Хочу проект похожий на кейс: ${activeCaseData.title}.`
                    );
                  }}
                >
                  Хочу так же →
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* === Lightbox === */}
      <div
        className={`lightbox${lightboxOpen ? " open" : ""}`}
        onClick={() => setLightboxOpen(false)}
      >
        {lightboxSrc && <img src={lightboxSrc} alt="Просмотр" />}
      </div>

      {/* === Кнопка чата === */}
      <button
        className={`chat-toggle${chatOpen ? " open" : ""}`}
        onClick={toggleChat}
        aria-label="Открыть чат"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        <span
          className={`chat-badge${unreadCount > 0 ? " show" : ""}`}
        >
          {unreadCount}
        </span>
      </button>

      {/* === Панель чата === */}
      <div
        className={`chat-panel${chatOpen ? " open" : ""}`}
        ref={chatPanelRef}
      >
        <div className="chat-header">
          <div className="chat-avatar">А</div>
          <div className="chat-header-info">
            <div className="chat-header-name">Анна · Phoba Agency</div>
            <div className="chat-header-status">
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: "#10b981",
                  display: "inline-block",
                }}
              />
              Онлайн · отвечает за ~1 мин
            </div>
          </div>
          <button
            className="chat-close"
            onClick={toggleChat}
            aria-label="Закрыть чат"
          >
            ×
          </button>
        </div>

        <div className="chat-messages">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`chat-msg ${m.role === "user" ? "visitor" : "agent"}`}
            >
              {m.content}
              <span className="chat-msg-time">
                {new Date(m.time).toLocaleTimeString("ru-RU", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          ))}
          {isTyping && (
            <div className="chat-typing show">
              <div className="typing-dot" />
              <div className="typing-dot" />
              <div className="typing-dot" />
            </div>
          )}
          {chatError && <div className="chat-error">{chatError}</div>}
          <div ref={messagesEndRef} />
        </div>

        {/* Кнопка перехода в Telegram, когда AI собрал заявку */}
        <div className={`chat-handoff${showTelegramHandoff ? " show" : ""}`}>
          <div className="chat-handoff-title">
            <span>📤</span> Готово к передаче менеджеру
          </div>
          <a
            className="chat-handoff-btn"
            href={TELEGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            Написать в Telegram {TELEGRAM_HANDLER} →
          </a>
        </div>

        <div className="chat-quick">
          <button
            className="chat-quick-btn"
            onClick={() =>
              sendMessage("Сколько стоит брендинг?")
            }
          >
            Цены
          </button>
          <button
            className="chat-quick-btn"
            onClick={() => sendMessage("Какие у вас сроки по проектам?")}
          >
            Сроки
          </button>
          <button
            className="chat-quick-btn"
            onClick={() => sendMessage("Покажите кейсы")}
          >
            Кейсы
          </button>
          <button
            className="chat-quick-btn"
            onClick={() =>
              sendMessage("Хочу бесплатную консультацию по моему проекту")
            }
          >
            Консультация
          </button>
        </div>

        <div className="chat-input-wrap">
          <textarea
            ref={inputRef}
            className="chat-input"
            placeholder="Напишите сообщение..."
            rows={1}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              autoResize(e.target);
            }}
            onKeyDown={handleChatKey}
            disabled={isSending}
          />
          <button
            className="chat-send"
            onClick={() => sendMessage()}
            disabled={isSending || !input.trim()}
            aria-label="Отправить"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>

        <div className="chat-demo-note">
          Ассистент Анна на базе ИИ — расскажет о сервисе и поможет
          определиться, после чего переведёт к менеджеру в Telegram.
        </div>
      </div>

      {/* Инициализация чата при первом открытии */}
      {chatOpen && !chatInitialized && (
        <ChatInitializer onInit={initChat} />
      )}

      <div className="cursor-glow" ref={cursorGlowRef} />
    </div>
  );
}

// Скрытый компонент, который вызывает initChat() ровно один раз
// при первом открытии чата.
function ChatInitializer({ onInit }: { onInit: () => void }) {
  useEffect(() => {
    onInit();
  }, [onInit]);
  return null;
}
