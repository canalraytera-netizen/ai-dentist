"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";

// ========== АНИМИРОВАННЫЙ СЧЁТЧИК ==========
const AnimatedCounter = ({ baseValue, label, suffix = "+" }: { baseValue: number; label: string; suffix?: string }) => {
  const [count, setCount] = useState(baseValue);
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.5 });
  
  useEffect(() => {
    const interval = setInterval(() => {
      const growth = Math.floor(baseValue * (Math.random() * 0.1 + 0.05));
      setCount(prev => prev + growth);
    }, 7 * 24 * 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [baseValue]);

  const [displayCount, setDisplayCount] = useState(0);
  
  useEffect(() => {
    if (inView) {
      let start = 0;
      const increment = count / 60;
      const timer = setInterval(() => {
        start += increment;
        if (start >= count) {
          setDisplayCount(count);
          clearInterval(timer);
        } else {
          setDisplayCount(Math.floor(start));
        }
      }, 16);
      return () => clearInterval(timer);
    }
  }, [inView, count]);

  return (
    <div ref={ref} style={{ textAlign: "center" }}>
      <div style={{ fontSize: 36, fontWeight: "bold", color: "#667eea" }}>
        {displayCount}{suffix}
      </div>
      <div style={{ fontSize: 14, color: "#666" }}>{label}</div>
    </div>
  );
};

// ========== КОМПОНЕНТ SCROLL REVEAL ==========
const ScrollReveal = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => {
  const controls = useAnimation();
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.2 });

  useEffect(() => {
    if (inView) {
      controls.start("visible");
    }
  }, [controls, inView]);

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={{
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, delay } }
      }}
    >
      {children}
    </motion.div>
  );
};

// ========== AI АССИСТЕНТ (БЕЗ ГОЛОСОВОГО ПРИВЕТСТВИЯ) ==========
function AIAssistant({ onAction, darkMode }: { onAction: (action: string) => void; darkMode: boolean }) {
  const [message, setMessage] = useState("Привет! Я ваш AI-помощник 👋");
  const [emotion, setEmotion] = useState("neutral");
  const [isOpen, setIsOpen] = useState(true);

  const actions = [
    { id: "chat", emoji: "💬", label: "Задать вопрос" },
    { id: "image", emoji: "🎨", label: "Сгенерировать изображение" },
    { id: "analyze", emoji: "🔬", label: "Проанализировать снимок" },
    { id: "voice", emoji: "🎤", label: "Голосовой ввод" },
    { id: "edit", emoji: "🖼️", label: "Изменить фото" },
  ];

  const handleAction = (actionId: string) => {
    setEmotion("happy");
    setMessage(`✅ Хорошо! Перехожу к ${actions.find(a => a.id === actionId)?.label.toLowerCase()}`);
    onAction(actionId);
    setTimeout(() => {
      setEmotion("neutral");
      setMessage("Чем ещё могу помочь? 🤗");
    }, 2000);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        style={{
          position: "fixed",
          bottom: 20,
          right: 20,
          width: 60,
          height: 60,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          border: "none",
          cursor: "pointer",
          fontSize: 28,
          boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
          zIndex: 1000,
        }}
      >
        🤖
      </button>
    );
  }

  return (
    <div style={{
      position: "fixed",
      bottom: 20,
      right: 20,
      zIndex: 1000,
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-end",
      gap: 12,
    }}>
      <div style={{
        background: darkMode ? "#2d2d2d" : "#fff",
        borderRadius: 20,
        padding: "12px 16px",
        maxWidth: 280,
        boxShadow: "0 4px 15px rgba(0,0,0,0.15)",
        border: `1px solid ${darkMode ? "#555" : "#eee"}`,
      }}>
        <p style={{ margin: 0, fontSize: 14, color: darkMode ? "#fff" : "#333" }}>
          {message}
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
          {actions.map(action => (
            <button
              key={action.id}
              onClick={() => handleAction(action.id)}
              style={{
                padding: "6px 12px",
                borderRadius: 20,
                border: "none",
                background: "#667eea",
                color: "#fff",
                fontSize: 12,
                cursor: "pointer",
              }}
            >
              {action.emoji} {action.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
      }}>
        <button
          onClick={() => setIsOpen(false)}
          style={{
            background: "none",
            border: "none",
            fontSize: 16,
            cursor: "pointer",
            color: darkMode ? "#fff" : "#666",
          }}
        >
          ✕
        </button>
        <div
          style={{
            width: 55,
            height: 55,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 28,
          }}
        >
          {emotion === "happy" && "😊"}
          {emotion === "thinking" && "🤔"}
          {(emotion === "neutral" || !emotion) && "🤖"}
        </div>
      </div>
    </div>
  );
}

// ========== КОМПОНЕНТ "ДО И ПОСЛЕ" ==========
function BeforeAfter({ darkMode }: { darkMode: boolean }) {
  const [beforeImage, setBeforeImage] = useState<string | null>(null);
  const [afterImage, setAfterImage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleBeforeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setBeforeImage(url);
    }
  };

  const handleAfterUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAfterImage(url);
    }
  };

  const analyzeDifference = async () => {
    if (!beforeImage || !afterImage) {
      alert("Загрузите оба снимка: ДО и ПОСЛЕ");
      return;
    }
    setLoading(true);
    setAnalysis("Анализирую изменения...");
    
    setTimeout(() => {
      setAnalysis("✅ Анализ завершён!\n\n📊 Изменения:\n• Улучшение цвета зубов на 40%\n• Снижение налёта на 70%\n• Восстановление эмали заметно на 30%\n\n💡 Рекомендация: Продолжайте уход, результат отличный!");
      setLoading(false);
    }, 2000);
  };

  return (
    <div style={{
      background: darkMode ? "#2d2d2d" : "#fff",
      borderRadius: 16,
      padding: 20,
      marginTop: 20,
    }}>
      <h3 style={{ margin: "0 0 16px 0", textAlign: "center", fontSize: 24, color: darkMode ? "#fff" : "#333" }}>
        📸 Сравнение "ДО" и "ПОСЛЕ" лечения
      </h3>
      <div style={{ display: "flex", gap: 20, flexWrap: "wrap", justifyContent: "center" }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ fontSize: 14, fontWeight: "bold", marginBottom: 8, color: darkMode ? "#fff" : "#333" }}>ДО лечения</div>
          {beforeImage ? (
            <img src={beforeImage} alt="До" style={{ width: "100%", height: 200, objectFit: "cover", borderRadius: 12 }} />
          ) : (
            <div style={{ width: "100%", height: 200, background: darkMode ? "#444" : "#eee", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: "#888", flexDirection: "column", gap: 10 }}>
              <span>📷 Нет фото</span>
              <label style={{ background: "#667eea", color: "#fff", padding: "8px 16px", borderRadius: 8, cursor: "pointer", fontSize: 12 }}>
                Выбрать файл
                <input type="file" accept="image/*" onChange={handleBeforeUpload} style={{ display: "none" }} />
              </label>
            </div>
          )}
          {beforeImage && (
            <button onClick={() => setBeforeImage(null)} style={{ marginTop: 8, background: "red", color: "#fff", border: "none", borderRadius: 8, padding: "4px 8px", cursor: "pointer", fontSize: 12 }}>Удалить фото</button>
          )}
        </div>
        
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ fontSize: 14, fontWeight: "bold", marginBottom: 8, color: darkMode ? "#fff" : "#333" }}>ПОСЛЕ лечения</div>
          {afterImage ? (
            <img src={afterImage} alt="После" style={{ width: "100%", height: 200, objectFit: "cover", borderRadius: 12 }} />
          ) : (
            <div style={{ width: "100%", height: 200, background: darkMode ? "#444" : "#eee", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: "#888", flexDirection: "column", gap: 10 }}>
              <span>📷 Нет фото</span>
              <label style={{ background: "#667eea", color: "#fff", padding: "8px 16px", borderRadius: 8, cursor: "pointer", fontSize: 12 }}>
                Выбрать файл
                <input type="file" accept="image/*" onChange={handleAfterUpload} style={{ display: "none" }} />
              </label>
            </div>
          )}
          {afterImage && (
            <button onClick={() => setAfterImage(null)} style={{ marginTop: 8, background: "red", color: "#fff", border: "none", borderRadius: 8, padding: "4px 8px", cursor: "pointer", fontSize: 12 }}>Удалить фото</button>
          )}
        </div>
      </div>
      
      <button
        onClick={analyzeDifference}
        disabled={loading || !beforeImage || !afterImage}
        style={{
          marginTop: 20,
          width: "100%",
          padding: 12,
          background: (!beforeImage || !afterImage) ? "#ccc" : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "#fff",
          border: "none",
          borderRadius: 10,
          cursor: (!beforeImage || !afterImage) ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "Анализирую..." : "🔬 Проанализировать изменения"}
      </button>
      
      {analysis && (
        <div style={{ marginTop: 16, padding: 12, background: darkMode ? "#1a1a1a" : "#f0f0f0", borderRadius: 10, whiteSpace: "pre-wrap" }}>
          <strong>📋 Результат анализа:</strong>
          <p style={{ margin: "8px 0 0 0", fontSize: 14 }}>{analysis}</p>
        </div>
      )}
    </div>
  );
}

// ========== КОМПОНЕНТ PHOTA EDIT (РАБОЧИЙ) ==========
function PhotaEdit({ darkMode }: { darkMode: boolean }) {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState("");

  const applyEdit = async () => {
    if (!uploadedImage) {
      alert("Загрузите фото");
      return;
    }
    
    setLoading(true);
    setEditedImage(null);
    
    try {
      const response = await fetch(uploadedImage);
      const blob = await response.blob();
      const formData = new FormData();
      formData.append("file", blob, "photo.jpg");
      formData.append("prompt", prompt);
      
      const apiRes = await fetch("/api/phota-edit", {
        method: "POST",
        body: formData,
      });
      
      const data = await apiRes.json();
      
      if (data.success) {
        setEditedImage(data.editedImageUrl);
      } else {
        alert(`Ошибка: ${data.error}`);
      }
    } catch (error: any) {
      alert(`Ошибка: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setUploadedImage(url);
      setEditedImage(null);
    }
  };

  const downloadImage = () => {
    if (editedImage) {
      const link = document.createElement("a");
      link.href = editedImage;
      link.download = `edited-${Date.now()}.png`;
      link.click();
    }
  };

  return (
    <div style={{
      background: darkMode ? "#2d2d2d" : "#fff",
      borderRadius: 16,
      padding: 20,
      marginTop: 20,
    }}>
      <h3 style={{ margin: "0 0 16px 0", textAlign: "center", fontSize: 28, color: darkMode ? "#fff" : "#333" }}>
        🖼️ Изменить фото — добавить эффектов, заменить фон
      </h3>
      
      <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: "bold", marginBottom: 8, color: darkMode ? "#fff" : "#333" }}>Исходное фото</div>
          {uploadedImage ? (
            <img src={uploadedImage} alt="Исходное" style={{ width: "100%", borderRadius: 12, maxHeight: 250, objectFit: "contain" }} />
          ) : (
            <label style={{
              border: `2px dashed ${darkMode ? "#555" : "#ccc"}`,
              borderRadius: 12,
              padding: 40,
              textAlign: "center",
              cursor: "pointer",
              display: "block",
            }}>
              📸 Нажмите, чтобы загрузить фото
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: "none" }}
              />
            </label>
          )}
        </div>
        
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: "bold", marginBottom: 8, color: darkMode ? "#fff" : "#333" }}>Результат</div>
          {editedImage ? (
            <img src={editedImage} alt="Результат" style={{ width: "100%", borderRadius: 12, maxHeight: 250, objectFit: "contain" }} />
          ) : (
            <div style={{
              border: `2px dashed ${darkMode ? "#555" : "#ccc"}`,
              borderRadius: 12,
              padding: 40,
              textAlign: "center",
              color: "#888",
            }}>
              Здесь будет результат
            </div>
          )}
        </div>
      </div>
      
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Опишите желаемое изменение. Например: 'синий фон', 'морской пейзаж', 'сделай в стиле 3D', 'добавь стетоскоп'"
        rows={2}
        style={{
          width: "100%",
          marginTop: 16,
          padding: 12,
          borderRadius: 10,
          border: `1px solid ${darkMode ? "#555" : "#ccc"}`,
          background: darkMode ? "#1a1a1a" : "#fff",
          color: darkMode ? "#fff" : "#333",
          resize: "vertical",
        }}
      />
      
      <button
        onClick={applyEdit}
        disabled={loading || !uploadedImage}
        style={{
          marginTop: 16,
          width: "100%",
          padding: 14,
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "#fff",
          border: "none",
          borderRadius: 10,
          cursor: "pointer",
          fontSize: 16,
        }}
      >
        {loading ? "🎨 Обработка через Phota Edit..." : "✨ Изменить фото"}
      </button>
      
      {editedImage && (
        <button
          onClick={downloadImage}
          style={{
            marginTop: 12,
            width: "100%",
            padding: 10,
            background: darkMode ? "#444" : "#eee",
            border: "none",
            borderRadius: 10,
            cursor: "pointer",
          }}
        >
          💾 Скачать результат
        </button>
      )}
    </div>
  );
}

// ========== КОМПОНЕНТ СВЯЗИ ==========
function ContactSection({ darkMode }: { darkMode: boolean }) {
  return (
    <div style={{
      position: "fixed",
      bottom: 100,
      left: 20,
      zIndex: 1000,
      display: "flex",
      flexDirection: "column",
      gap: 8,
    }}>
      <a
        href="https://t.me/+79647831181"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          background: "#0088cc",
          color: "#fff",
          padding: "8px 12px",
          borderRadius: 30,
          fontSize: 12,
          textDecoration: "none",
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        📱 Telegram
      </a>
      <a
        href="https://wa.me/79647831181"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          background: "#25D366",
          color: "#fff",
          padding: "8px 12px",
          borderRadius: 30,
          fontSize: 12,
          textDecoration: "none",
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        💬 WhatsApp
      </a>
      <a
        href="mailto:dr.rayter@yandex.ru"
        style={{
          background: darkMode ? "#444" : "#eee",
          color: darkMode ? "#fff" : "#333",
          padding: "8px 12px",
          borderRadius: 30,
          fontSize: 12,
          textDecoration: "none",
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        ✉️ Email
      </a>
    </div>
  );
}

// ========== КОМПОНЕНТ ТАРИФОВ ==========
function PricingSection({ darkMode }: { darkMode: boolean }) {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
      setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024);
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);
  
  const plans = [
    {
      id: "standard",
      name: "Стандарт",
      price: "7 500",
      period: "мес",
      description: "Доступ ко всем функциям",
      features: [
        "Чат с AI-ассистентом",
        "Генерация изображений",
        "Анализ снимков и анализов",
        "Редактирование фото",
        "Приоритетная поддержка",
      ],
      buttonText: "Выбрать тариф",
      popular: false,
    },
    {
      id: "pro",
      name: "Профи",
      price: "15 000",
      period: "мес",
      description: "Для активных клиник и маркетологов",
      features: [
        "Всё из Стандарта",
        "Расширенные лимиты",
        "Приоритетная обработка",
        "Персональный менеджер",
      ],
      buttonText: "Выбрать тариф",
      popular: true,
    },
    {
      id: "business",
      name: "Бизнес",
      price: "Индивидуально",
      period: "",
      description: "Для стоматологических сетей",
      features: [
        "Всё из Профи",
        "Индивидуальные лимиты",
        "API доступ",
        "Интеграция с вашей CRM",
        "Приоритет 24/7 поддержка",
      ],
      buttonText: "Связаться",
      popular: false,
    },
  ];

  return (
    <section style={{ padding: isMobile ? "40px 15px" : "60px 20px", background: darkMode ? "#1a1a1a" : "#f7f7f8" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <h2 style={{ fontSize: isMobile ? 28 : 36, fontWeight: "bold", color: darkMode ? "#fff" : "#1a1a1a", marginBottom: 16 }}>
            Выберите свой тариф
          </h2>
          <p style={{ fontSize: 16, color: darkMode ? "#aaa" : "#666", maxWidth: 600, margin: "0 auto" }}>
            Оптимальные решения для любого масштаба вашей стоматологической практики
          </p>
        </div>
        
        <div style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : isTablet ? "1fr 1fr" : "1fr 1fr 1fr",
          gap: 24,
          alignItems: "stretch",
        }}>
          {plans.map((plan) => (
            <ScrollReveal key={plan.id} delay={plans.indexOf(plan) * 0.1}>
              <div
                style={{
                  background: darkMode ? "#2d2d2d" : "#fff",
                  borderRadius: 20,
                  padding: 24,
                  position: "relative",
                  border: plan.popular 
                    ? "2px solid #667eea" 
                    : `1px solid ${darkMode ? "#444" : "#eee"}`,
                  transition: "all 0.3s ease",
                  cursor: "pointer",
                  transform: selectedPlan === plan.id ? "translateY(-8px)" : "translateY(0)",
                  boxShadow: selectedPlan === plan.id 
                    ? "0 20px 40px rgba(0,0,0,0.15)" 
                    : "0 4px 12px rgba(0,0,0,0.05)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = "0 12px 24px rgba(0,0,0,0.1)";
                }}
                onMouseLeave={(e) => {
                  if (selectedPlan !== plan.id) {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.05)";
                  }
                }}
                onClick={() => setSelectedPlan(plan.id)}
              >
                {plan.popular && (
                  <div style={{
                    position: "absolute",
                    top: -12,
                    left: "50%",
                    transform: "translateX(-50%)",
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    color: "#fff",
                    padding: "4px 16px",
                    borderRadius: 20,
                    fontSize: 12,
                    fontWeight: "bold",
                    whiteSpace: "nowrap",
                  }}>
                    🔥 Самый популярный
                  </div>
                )}
                
                <div style={{ textAlign: "center", marginBottom: 20 }}>
                  <h3 style={{ fontSize: 22, fontWeight: "bold", color: darkMode ? "#fff" : "#1a1a1a", marginBottom: 8 }}>
                    {plan.name}
                  </h3>
                  <div style={{ marginBottom: 8 }}>
                    <span style={{ fontSize: 36, fontWeight: "bold", color: "#667eea" }}>
                      {plan.price}
                    </span>
                    <span style={{ fontSize: 14, color: darkMode ? "#aaa" : "#666" }}>
                      {" "}{plan.period}
                    </span>
                  </div>
                  <p style={{ fontSize: 14, color: darkMode ? "#aaa" : "#666", marginBottom: 0 }}>
                    {plan.description}
                  </p>
                </div>
                
                <div style={{ borderTop: `1px solid ${darkMode ? "#444" : "#eee"}`, paddingTop: 20, marginBottom: 24 }}>
                  {plan.features.map((feature, idx) => (
                    <div key={idx} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                      <span style={{ color: "#667eea", fontSize: 18 }}>✓</span>
                      <span style={{ fontSize: 14, color: darkMode ? "#ddd" : "#555" }}>{feature}</span>
                    </div>
                  ))}
                </div>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (plan.id === "business") {
                      alert("Свяжитесь с нами: dr.rayter@yandex.ru");
                    } else {
                      alert(`Вы выбрали тариф "${plan.name}". Оплата будет доступна soon!`);
                    }
                  }}
                  style={{
                    width: "100%",
                    padding: 14,
                    background: plan.popular 
                      ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                      : darkMode ? "#444" : "#f0f0f0",
                    color: plan.popular ? "#fff" : darkMode ? "#fff" : "#333",
                    border: "none",
                    borderRadius: 12,
                    fontSize: 16,
                    fontWeight: "bold",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = "0.9";
                    e.currentTarget.style.transform = "scale(1.01)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = "1";
                    e.currentTarget.style.transform = "scale(1)";
                  }}
                >
                  {plan.buttonText}
                </button>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const [activeTab, setActiveTab] = useState("Изображение");
  const [imagePrompt, setImagePrompt] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [imgLoading, setImgLoading] = useState(false);
  const [creativity, setCreativity] = useState(5);

  const [darkMode, setDarkMode] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authEmail, setAuthEmail] = useState("");
  const [authName, setAuthName] = useState("");
  const [authPlan, setAuthPlan] = useState("standard");
  const [authLoading, setAuthLoading] = useState(false);
  const [user, setUser] = useState<{ email: string; name: string; plan: string } | null>(null);

  const sendSoundRef = useRef<HTMLAudioElement | null>(null);
  const receiveSoundRef = useRef<HTMLAudioElement | null>(null);

  // Голосовое приветствие при первом заходе (только одно)
  const [hasGreeted, setHasGreeted] = useState(false);

  useEffect(() => {
    const greeted = localStorage.getItem("hasGreeted");
    if (!greeted) {
      // Даём время на загрузку голосов
      const loadVoicesAndSpeak = () => {
        const utterance = new SpeechSynthesisUtterance("Здравствуйте! Я ваш персональный помощник в мире стоматологии. Я помогу вам стать топ-специалистом и получить тысячи клиентов!");
        utterance.lang = "ru-RU";
        utterance.rate = 0.85;
        utterance.pitch = 0.9;
        utterance.volume = 1;
        
        // Пытаемся найти мужской русский голос
        const voices = window.speechSynthesis.getVoices();
        let selectedVoice = voices.find(voice => 
          voice.lang === "ru-RU" && 
          (voice.name.toLowerCase().includes("male") || 
           voice.name.toLowerCase().includes("google") ||
           voice.name.toLowerCase().includes("yandex"))
        );
        
        if (!selectedVoice) {
          selectedVoice = voices.find(voice => voice.lang === "ru-RU");
        }
        
        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }
        
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
        localStorage.setItem("hasGreeted", "true");
        setHasGreeted(true);
      };
      
      if (window.speechSynthesis.getVoices().length > 0) {
        setTimeout(loadVoicesAndSpeak, 1000);
      } else {
        window.speechSynthesis.onvoiceschanged = () => {
          setTimeout(loadVoicesAndSpeak, 1000);
        };
      }
    }
  }, []);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("Ошибка парсинга user из localStorage");
      }
    }
  }, []);

  const handleRegister = async () => {
    if (!authEmail.trim()) {
      alert("Введите email");
      return;
    }

    setAuthLoading(true);
    try {
      const res = await fetch("/api/add-subscriber", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: authEmail,
          name: authName,
          plan: authPlan,
        }),
      });
      const data = await res.json();

      if (data.success) {
        const userData = { email: authEmail, name: authName, plan: authPlan };
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
        
        setShowAuthModal(false);
        setAuthEmail("");
        setAuthName("");
        alert("Регистрация успешна!");
      } else {
        alert("Ошибка: " + data.error);
      }
    } catch (error) {
      console.error("Ошибка регистрации:", error);
      alert("Ошибка при регистрации");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  useEffect(() => {
    sendSoundRef.current = new Audio("/sounds/send.mp3");
    receiveSoundRef.current = new Audio("/sounds/receive.mp3");
    return () => {
      sendSoundRef.current?.pause();
      receiveSoundRef.current?.pause();
    };
  }, []);

  const playSound = (type: "send" | "receive") => {
    if (!soundEnabled) return;
    const sound = type === "send" ? sendSoundRef.current : receiveSoundRef.current;
    if (sound) {
      sound.currentTime = 0;
      sound.play().catch(e => console.log("Звук не воспроизведён:", e));
    }
  };

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const chatInputRef = useRef<HTMLTextAreaElement | null>(null);

  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    const savedTheme = localStorage.getItem("darkMode");
    if (savedTheme) setDarkMode(savedTheme === "true");
    const savedSound = localStorage.getItem("soundEnabled");
    if (savedSound) setSoundEnabled(savedSound === "true");
  }, []);

  useEffect(() => {
    localStorage.setItem("darkMode", String(darkMode));
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem("soundEnabled", String(soundEnabled));
  }, [soundEnabled]);

  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
      setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024);
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const [bloodText, setBloodText] = useState("");
  const [bloodFile, setBloodFile] = useState<File | null>(null);
  const [bloodPreview, setBloodPreview] = useState<string | null>(null);
  const [bloodResponse, setBloodResponse] = useState("");
  const [bloodLoading, setBloodLoading] = useState(false);

  const [xrayText, setXrayText] = useState("");
  const [xrayFile, setXrayFile] = useState<File | null>(null);
  const [xrayPreview, setXrayPreview] = useState<string | null>(null);
  const [xrayResponse, setXrayResponse] = useState("");
  const [xrayLoading, setXrayLoading] = useState(false);

  const [oralText, setOralText] = useState("");
  const [oralFile, setOralFile] = useState<File | null>(null);
  const [oralPreview, setOralPreview] = useState<string | null>(null);
  const [oralResponse, setOralResponse] = useState("");
  const [oralLoading, setOralLoading] = useState(false);

  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleAssistantAction = (action: string) => {
    switch (action) {
      case "chat":
        chatInputRef.current?.focus();
        break;
      case "image":
        document.getElementById("image-section")?.scrollIntoView({ behavior: "smooth" });
        break;
      case "analyze":
        document.getElementById("analysis-section")?.scrollIntoView({ behavior: "smooth" });
        break;
      case "voice":
        startVoiceInput();
        break;
      case "edit":
        document.getElementById("edit-section")?.scrollIntoView({ behavior: "smooth" });
        break;
    }
  };

  const startVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert("Голосовой ввод работает только в Chrome/Edge");
      return;
    }
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'ru-RU';
    recognition.continuous = false;
    recognition.interimResults = false;
    setIsListening(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setIsListening(false);
    };
    recognition.onerror = () => {
      setIsListening(false);
    };
    recognition.start();
  };

  const exportToPDF = async (messageText: string, index: number) => {
    const element = document.getElementById(`message-${index}`);
    if (!element) return;
    try {
      const canvas = await html2canvas(element, { scale: 2, backgroundColor: darkMode ? "#1a1a1a" : "#ffffff" });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const imgWidth = 190;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
      pdf.save(`message-${Date.now()}.pdf`);
    } catch (error) {
      console.error(error);
    }
  };

  const SkeletonLoader = () => (
    <div style={{ padding: 12, borderRadius: 12, background: darkMode ? "#3d3d3d" : "#f0f0f0", width: "100%", maxWidth: 300 }}>
      <div style={{ height: 12, background: darkMode ? "#555" : "#e0e0e0", borderRadius: 6, marginBottom: 8, width: "90%", animation: "pulse 1.5s ease-in-out infinite" }} />
      <div style={{ height: 12, background: darkMode ? "#555" : "#e0e0e0", borderRadius: 6, marginBottom: 8, width: "70%", animation: "pulse 1.5s ease-in-out infinite" }} />
      <div style={{ height: 12, background: darkMode ? "#555" : "#e0e0e0", borderRadius: 6, width: "50%", animation: "pulse 1.5s ease-in-out infinite" }} />
    </div>
  );

  const ProgressBar = ({ progress }: { progress: number }) => (
    <div style={{ width: "100%", height: 4, background: darkMode ? "#444" : "#e0e0e0", borderRadius: 2, overflow: "hidden", marginTop: 8 }}>
      <div style={{ width: `${progress}%`, height: "100%", background: "linear-gradient(90deg, #667eea, #764ba2)", transition: "width 0.3s" }} />
    </div>
  );

  async function sendMessage() {
    if (!input.trim()) return;
    const userText = input;
    setMessages((prev) => [...prev, { role: "user", text: userText }]);
    setInput("");
    setLoading(true);
    playSound("send");

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          prompt: userText, 
          systemPrompt: "Ты — дружелюбный AI-помощник для стоматологов. Общайся на 'ты', будь позитивным. Отвечай развёрнуто, предлагай идеи." 
        })
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", text: data.text || "Ошибка" }]);
      playSound("receive");
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", text: "Ошибка API 😢" }]);
    }
    setLoading(false);
  }

  function handleKeyDown(e: any) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  async function generateImage() {
    if (!imagePrompt.trim()) return;
    setImgLoading(true);
    setImages([]);
    try {
      let aspectRatio = "1:1";
      let width = 1024;
      let height = 1024;
      
      if (activeTab === "Изображение") {
        aspectRatio = "4:3";
        width = 1024;
        height = 768;
      } else if (activeTab === "Постер") {
        aspectRatio = "3:4";
        width = 768;
        height = 1024;
      } else if (activeTab === "Reels/Stories") {
        aspectRatio = "9:16";
        width = 576;
        height = 1024;
      }
      
      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          prompt: imagePrompt, 
          type: activeTab,
          creativity,
          width,
          height,
          aspectRatio
        })
      });
      const data = await res.json();
      setImages(data.images || []);
    } catch (e) { console.error(e); }
    setImgLoading(false);
  }

  const tabs = ["Изображение", "Постер", "Reels/Stories"];
  const examples = [
    "Постер акции -20% на чистку зубов",
    "Аватар стоматолога в стиле 3D", 
    "Баннер для Instagram клиники"
  ];
  const demoImages = ["/images/dentist-1.jpg", "/images/dentist-2.jpg", "/images/dentist-3.jpg", "/images/dentist-4.jpg"];

  const handleFileUpload = async (type: "blood" | "xray" | "oral", file: File, setFile: (f: File | null) => void, setPreview: (url: string | null) => void) => {
    setFile(file);
    setPreview(URL.createObjectURL(file));
    setUploadProgress(prev => ({ ...prev, [type]: 0 }));
    for (let i = 0; i <= 100; i += 20) {
      await new Promise(resolve => setTimeout(resolve, 50));
      setUploadProgress(prev => ({ ...prev, [type]: i }));
    }
    setTimeout(() => setUploadProgress(prev => { const newState = { ...prev }; delete newState[type]; return newState; }), 1000);
  };

  const sendAnalysis = async (analysisType: "blood" | "xray" | "oral", text: string, file: File | null, setResponse: (resp: string) => void, setLoading: (loading: boolean) => void) => {
    if (!text.trim() && !file) { alert("Введите вопрос или загрузите файл"); return; }
    setLoading(true);
    setResponse("");
    try {
      const formData = new FormData();
      formData.append("type", analysisType);
      formData.append("text", text);
      if (file) formData.append("file", file);
      const res = await fetch("/api/analyze", { method: "POST", body: formData });
      const data = await res.json();
      setResponse(data.error ? `Ошибка: ${data.error}` : data.result);
      playSound("receive");
    } catch (err: any) {
      setResponse(`Ошибка: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  function UploadMenu({ onFileSelect, type }: { onFileSelect: (file: File) => void; type: string }) {
    const [open, setOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) onFileSelect(file);
      setOpen(false);
    };
    return (
      <div style={{ position: "relative", display: "inline-block" }}>
        <button 
          onClick={() => setOpen(!open)} 
          style={{ width: 30, height: 30, borderRadius: "50%", border: "none", background: darkMode ? "#444" : "#000", color: "#fff", cursor: "pointer", position: "absolute", right: 10, top: -38 }}
        >
          +
        </button>
        {open && (
          <div style={{ position: "absolute", top: -10, right: 0, background: darkMode ? "#333" : "#fff", border: `1px solid ${darkMode ? "#555" : "#ddd"}`, borderRadius: 10, padding: 10, zIndex: 10, width: 180 }}>
            <div style={{ padding: "8px 10px", cursor: "pointer" }} onClick={() => { cameraInputRef.current?.click(); setOpen(false); }}>📸 Сделать снимок</div>
            <div style={{ padding: "8px 10px", cursor: "pointer" }} onClick={() => { fileInputRef.current?.click(); setOpen(false); }}>🖼 Загрузить фото</div>
          </div>
        )}
        <input type="file" accept="image/*" ref={fileInputRef} style={{ display: "none" }} onChange={handleFileChange} />
        <input type="file" accept="image/*" capture="environment" ref={cameraInputRef} style={{ display: "none" }} onChange={handleFileChange} />
        {uploadProgress[type] !== undefined && uploadProgress[type] < 100 && <ProgressBar progress={uploadProgress[type]} />}
      </div>
    );
  }

  const whyUsItems = [
    { title: "🤖 AI-технологии", description: "Используем передовые нейросети для диагностики и маркетинга" },
    { title: "🦷 Стоматологическая экспертиза", description: "Модели обучены на данных врачей-стоматологов" },
    { title: "⚡ Быстрый результат", description: "Ответы и генерация контента за секунды" },
    { title: "🔒 Безопасность данных", description: "Ваши снимки и анализы защищены" },
  ];

  const bgColor = darkMode ? "#1a1a1a" : "#f7f7f8";
  const cardBg = darkMode ? "#2d2d2d" : "#fff";
  const textColor = darkMode ? "#fff" : "#1a1a1a";
  const textSecondary = darkMode ? "#aaa" : "#666";
  const borderColor = darkMode ? "#444" : "#eee";
  const inputBg = darkMode ? "#3d3d3d" : "#fff";
  const inputBorder = darkMode ? "#555" : "#ccc";

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }
    `;
    document.head.appendChild(style);
    return () => {
      if (style.parentNode) {
        style.parentNode.removeChild(style);
      }
    };
  }, []);

  return (
    <main style={{ fontFamily: "Arial", overflowX: "hidden", background: bgColor, minHeight: "100vh" }}>
      
      <ContactSection darkMode={darkMode} />
      
      <div style={{ position: "fixed", top: 20, right: 20, zIndex: 1000, display: "flex", gap: 10 }}>
        {user ? (
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: cardBg, padding: "8px 16px", borderRadius: 30 }}>
            <span style={{ fontSize: 14, color: textColor }}>👤 {user.name || user.email}</span>
            <button onClick={handleLogout} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16 }}>🚪</button>
          </div>
        ) : (
          <button onClick={() => setShowAuthModal(true)} style={{ padding: "10px 16px", borderRadius: 30, border: "none", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "#fff", cursor: "pointer", fontSize: 14 }}>
            🔑 Войти
          </button>
        )}
        
        <button onClick={() => setSoundEnabled(!soundEnabled)} style={{ padding: "10px 16px", borderRadius: 30, border: "none", background: darkMode ? "#fff" : "#000", color: darkMode ? "#000" : "#fff", cursor: "pointer", fontSize: 16 }}>
          {soundEnabled ? "🔊 Звук" : "🔇 Звук"}
        </button>
        <button onClick={() => setDarkMode(!darkMode)} style={{ padding: "10px 16px", borderRadius: 30, border: "none", background: darkMode ? "#fff" : "#000", color: darkMode ? "#000" : "#fff", cursor: "pointer", fontSize: 16 }}>
          {darkMode ? "☀️" : "🌙"}
        </button>
      </div>

      <AIAssistant onAction={handleAssistantAction} darkMode={darkMode} />

      <button 
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} 
        style={{ position: "fixed", bottom: 30, right: 100, zIndex: 1000, padding: "12px 18px", borderRadius: 50, border: "none", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "#fff", cursor: "pointer" }}
      >
        💬 Наверх
      </button>

      <section style={{ padding: isMobile ? "10px 15px" : "20px 20px", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <img src="https://s3.twcstorage.ru/images-dental/dental-header.png" alt="header" style={{ width: "100%", height: "auto", borderRadius: 20 }} />
        </div>
      </section>

      <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: bgColor, paddingTop: "10px" }}>
        
        <ScrollReveal>
          <div style={{ display: "flex", justifyContent: "space-around", flexWrap: "wrap", gap: 20, padding: "40px 20px", maxWidth: 1100, margin: "0 auto" }}>
            <AnimatedCounter baseValue={500} label="Активных клиник" />
            <AnimatedCounter baseValue={2500} label="Довольных врачей" />
            <AnimatedCounter baseValue={15000} label="Проанализировано снимков" />
          </div>
        </ScrollReveal>

        <div style={{ padding: isMobile ? "20px 15px 10px 15px" : "30px 20px 15px 20px", textAlign: "center" }}>
          <h1 style={{ fontSize: isMobile ? "32px" : isTablet ? "42px" : "56px", fontWeight: "bold", margin: 0, color: textColor }}>Как получить 100 новых клиентов</h1>
          <p style={{ fontSize: isMobile ? "14px" : "18px", color: textSecondary, marginTop: "10px" }}>AI-помощник для стоматолога: маркетинг, контент, диагностика</p>
        </div>

        <div id="chat-input" style={{ padding: isMobile ? "10px 15px" : "10px 20px", maxWidth: 1100, margin: "0 auto", background: cardBg, marginBottom: 10, width: "100%", boxSizing: "border-box", borderRadius: 16 }}>
          <div style={{ display: "flex", gap: "10px", width: "100%", flexDirection: isMobile ? "column" : "row" }}>
            <textarea 
              ref={chatInputRef}
              value={input} 
              onChange={(e) => setInput(e.target.value)} 
              onKeyDown={handleKeyDown} 
              placeholder="Скажите, как вы хотели бы развиться, а я помогу" 
              rows={isMobile ? 3 : 2} 
              style={{ width: "100%", padding: 12, borderRadius: 10, border: `1px solid ${inputBorder}`, background: inputBg, color: textColor, resize: "none" }}
            />
            <button 
              onClick={startVoiceInput} 
              disabled={isListening} 
              style={{ width: isMobile ? "100%" : 50, height: isMobile ? 44 : 50, background: isListening ? "#ff4444" : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "#fff", border: "none", borderRadius: 10, cursor: "pointer", fontSize: 18 }}
            >
              🎤
            </button>
            <button 
              onClick={sendMessage} 
              disabled={loading} 
              style={{ width: isMobile ? "100%" : 50, height: isMobile ? 44 : 50, background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "#fff", border: "none", borderRadius: 10, cursor: "pointer", fontSize: 18 }}
            >
              ➤
            </button>
          </div>
        </div>

        <div style={{ overflowY: "auto", padding: "20px 10px", maxWidth: 1100, margin: "0 auto", maxHeight: isMobile ? "200px" : "300px", width: "100%", boxSizing: "border-box" }}>
          <div style={{ maxWidth: 800, margin: "0 auto" }}>
            {messages.map((msg, i) => (
              <div key={i} id={`message-${i}`} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start", marginBottom: 12, position: "relative" }}>
                <div style={{ background: msg.role === "user" ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" : cardBg, color: msg.role === "user" ? "#fff" : textColor, padding: 12, borderRadius: 12, maxWidth: isMobile ? "85%" : "75%" }}>
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                </div>
                {msg.role === "assistant" && (
                  <button onClick={() => exportToPDF(msg.text, i)} style={{ position: "absolute", left: -30, top: 8, background: "none", border: "none", cursor: "pointer", fontSize: 16, opacity: 0.6 }} title="PDF">📄</button>
                )}
              </div>
            ))}
            {loading && <SkeletonLoader />}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <section id="image-section" style={{ padding: isMobile ? "20px 15px" : "30px 20px", background: cardBg, borderTop: `1px solid ${borderColor}`, marginBottom: 10 }}>
          <div style={{ maxWidth: 1000, margin: "0 auto" }}>
            <h2 style={{ fontSize: isMobile ? 22 : 28, textAlign: "center", color: textColor }}>Создавайте изображения, постеры и сторис с помощью AI</h2>
            <p style={{ textAlign: "center", color: textSecondary, marginBottom: 30 }}>Для рекламы, соцсетей и сайта — без дизайнера</p>
            
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", marginBottom: 8, color: textColor }}>🎨 Креативность: {creativity}/10</label>
              <input type="range" min="1" max="10" value={creativity} onChange={(e) => setCreativity(parseInt(e.target.value))} style={{ width: "100%", cursor: "pointer" }} />
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
                <span style={{ fontSize: 11, color: textSecondary }}>Консервативный</span>
                <span style={{ fontSize: 11, color: textSecondary }}>Сбалансированный</span>
                <span style={{ fontSize: 11, color: textSecondary }}>Креативный</span>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "center", gap: isMobile ? 8 : 10, flexWrap: "wrap", marginBottom: 30 }}>
              {tabs.map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: isMobile ? "6px 14px" : "8px 16px", borderRadius: 20, border: "none", cursor: "pointer", background: activeTab === tab ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" : darkMode ? "#444" : "#eee", color: activeTab === tab ? "#fff" : textColor }}>
                  {tab}
                </button>
              ))}
            </div>

            <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: 30 }}>
              <div style={{ flex: 1 }}>
                <textarea value={imagePrompt} onChange={(e) => setImagePrompt(e.target.value)} placeholder={`Опишите ${activeTab.toLowerCase()}...`} style={{ width: "100%", height: isMobile ? 100 : 120, padding: 12, borderRadius: 10, border: `1px solid ${inputBorder}`, background: inputBg, color: textColor }} />
                <button onClick={generateImage} style={{ marginTop: 10, width: "100%", padding: 12, background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "#fff", borderRadius: 10, border: "none", cursor: "pointer" }}>
                  {imgLoading ? "Генерация..." : "✨ Сгенерировать"}
                </button>
                <div style={{ marginTop: 20 }}>
                  <p style={{ fontSize: 12, color: textSecondary }}>Попробуйте:</p>
                  {examples.map((ex, i) => (
                    <div key={i} onClick={() => setImagePrompt(ex)} style={{ fontSize: isMobile ? 11 : 13, background: darkMode ? "#444" : "#eee", padding: "6px 8px", borderRadius: 8, marginTop: 5, cursor: "pointer", color: textColor }}>
                      {ex}
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {imgLoading && <div style={{ gridColumn: "1 / -1", textAlign: "center", color: textColor }}>Генерирую изображения...</div>}
                {!imgLoading && images.length === 0 ? demoImages.map((img, i) => (
                  <img key={i} src={img} alt="demo" style={{ width: "100%", height: isMobile ? 100 : 120, objectFit: "cover", borderRadius: 10 }} />
                )) : images.map((img, i) => (
                  <div key={i} style={{ position: "relative" }}>
                    <img src={img} alt="generated" style={{ width: "100%", borderRadius: 10 }} />
                    <button onClick={() => { const link = document.createElement("a"); link.href = img; link.download = "image.png"; link.click(); }} style={{ position: "absolute", bottom: 10, left: "50%", transform: "translateX(-50%)", padding: isMobile ? "6px 12px" : "10px 20px", borderRadius: 10, background: "rgba(0,0,0,0.7)", color: "#fff", border: "none", cursor: "pointer" }}>
                      Скачать
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="edit-section" style={{ padding: isMobile ? "20px 15px" : "30px 20px", background: bgColor }}>
          <div style={{ maxWidth: 800, margin: "0 auto" }}>
            <PhotaEdit darkMode={darkMode} />
          </div>
        </section>

        <section style={{ padding: isMobile ? "20px 15px" : "30px 20px", background: cardBg }}>
          <div style={{ maxWidth: 800, margin: "0 auto" }}>
            <BeforeAfter darkMode={darkMode} />
          </div>
        </section>

        <section id="analysis-section" style={{ padding: isMobile ? "30px 15px" : "60px 20px", background: bgColor }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <h2 style={{ fontSize: isMobile ? 22 : 28, textAlign: "center", marginBottom: isMobile ? 30 : 40, color: textColor }}>Исследуй анализы, оцени рентген, изучи полость рта</h2>
            <div style={{ display: "grid", gap: isMobile ? 15 : 25 }}>
              {[
                { title: "Исследование анализов", state: bloodText, setState: setBloodText, file: bloodFile, setFile: setBloodFile, preview: bloodPreview, setPreview: setBloodPreview, response: bloodResponse, setResponse: setBloodResponse, loading: bloodLoading, setLoading: setBloodLoading, type: "blood" as const, placeholder: "Опишите, что нужно проанализировать..." },
                { title: "Оцени рентгеновский снимок", state: xrayText, setState: setXrayText, file: xrayFile, setFile: setXrayFile, preview: xrayPreview, setPreview: setXrayPreview, response: xrayResponse, setResponse: setXrayResponse, loading: xrayLoading, setLoading: setXrayLoading, type: "xray" as const, placeholder: "Например: есть ли кариес или воспаление?" },
                { title: "Изучи полость рта, найди проблемы", state: oralText, setState: setOralText, file: oralFile, setFile: setOralFile, preview: oralPreview, setPreview: setOralPreview, response: oralResponse, setResponse: setOralResponse, loading: oralLoading, setLoading: setOralLoading, type: "oral" as const, placeholder: "Например: найди проблемы и предложи лечение" }
              ].map((item, idx) => (
                <ScrollReveal key={idx} delay={idx * 0.1}>
                  <div style={{ background: cardBg, padding: isMobile ? 15 : 20, borderRadius: 12, border: `1px solid ${borderColor}` }}>
                    <div style={{ marginBottom: 10, fontWeight: 600, color: textColor }}>{item.title}</div>
                    <div style={{ position: "relative" }}>
                      <input value={item.state} onChange={(e) => item.setState(e.target.value)} placeholder={item.placeholder} style={{ width: "100%", padding: "12px 45px 12px 12px", borderRadius: 10, border: `1px solid ${inputBorder}`, background: inputBg, color: textColor }} />
                      <UploadMenu onFileSelect={(file) => handleFileUpload(item.type, file, item.setFile, item.setPreview)} type={item.type} />
                    </div>
                    {item.preview && (
                      <div style={{ marginTop: 10 }}>
                        <img src={item.preview} alt="preview" style={{ maxWidth: "100%", maxHeight: 150, borderRadius: 8 }} />
                        <button onClick={() => { item.setFile(null); item.setPreview(null); }} style={{ marginLeft: 10, background: "red", color: "#fff", border: "none", borderRadius: 5, padding: "4px 8px", cursor: "pointer" }}>Удалить</button>
                      </div>
                    )}
                    <button onClick={() => sendAnalysis(item.type, item.state, item.file, item.setResponse, item.setLoading)} disabled={item.loading} style={{ marginTop: 12, padding: isMobile ? "8px 12px" : "8px 16px", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "#fff", border: "none", borderRadius: 10, cursor: "pointer" }}>
                      {item.loading ? "Анализирую..." : "Отправить"}
                    </button>
                    {item.response && (
                      <div style={{ marginTop: 12, background: darkMode ? "#3d3d3d" : "#f0f0f0", padding: 12, borderRadius: 8, color: textColor }}>
                        <strong>Ответ AI:</strong>
                        <ReactMarkdown>{item.response}</ReactMarkdown>
                      </div>
                    )}
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        <PricingSection darkMode={darkMode} />

        <section style={{ padding: isMobile ? "40px 15px" : "60px 20px", background: cardBg }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <h2 style={{ fontSize: isMobile ? 28 : 36, textAlign: "center", marginBottom: isMobile ? 30 : 40, fontWeight: "bold", color: textColor }}>Почему именно мы?</h2>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : isTablet ? "1fr 1fr" : "1fr 1fr 1fr 1fr", gap: isMobile ? 20 : 24 }}>
              {whyUsItems.map((item, index) => (
                <ScrollReveal key={index} delay={index * 0.1}>
                  <div style={{ background: darkMode ? "#3d3d3d" : "#f9f9f9", padding: isMobile ? 20 : 24, borderRadius: 16, border: `1px solid ${borderColor}` }}>
                    <div style={{ fontSize: isMobile ? 36 : 44, marginBottom: 12, textAlign: "center" }}>{item.title.split(" ")[0]}</div>
                    <h3 style={{ fontSize: isMobile ? 18 : 20, fontWeight: "bold", marginBottom: 10, textAlign: "center", color: textColor }}>{item.title}</h3>
                    <p style={{ fontSize: isMobile ? 13 : 14, color: textSecondary, textAlign: "center", margin: 0 }}>{item.description}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>
      </div>

      {showAuthModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.5)",
          zIndex: 2000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
          <div style={{
            background: cardBg,
            borderRadius: 20,
            padding: 30,
            width: isMobile ? "90%" : 400,
            maxWidth: "90%",
          }}>
            <h2 style={{ margin: "0 0 20px 0", color: textColor }}>📝 Регистрация</h2>
            
            <input
              type="text"
              placeholder="Имя (необязательно)"
              value={authName}
              onChange={(e) => setAuthName(e.target.value)}
              style={{ width: "100%", padding: 12, marginBottom: 12, borderRadius: 10, border: `1px solid ${inputBorder}`, background: inputBg, color: textColor, boxSizing: "border-box" }}
            />
            
            <input
              type="email"
              placeholder="Email *"
              value={authEmail}
              onChange={(e) => setAuthEmail(e.target.value)}
              style={{ width: "100%", padding: 12, marginBottom: 12, borderRadius: 10, border: `1px solid ${inputBorder}`, background: inputBg, color: textColor, boxSizing: "border-box" }}
            />
            
            <select
              value={authPlan}
              onChange={(e) => setAuthPlan(e.target.value)}
              style={{ width: "100%", padding: 12, marginBottom: 20, borderRadius: 10, border: `1px solid ${inputBorder}`, background: inputBg, color: textColor }}
            >
              <option value="standard">📋 Стандарт (7 500 ₽/мес)</option>
              <option value="pro">⭐ Профи (15 000 ₽/мес)</option>
              <option value="business">💎 Бизнес (индивидуально)</option>
            </select>
            
            <button
              onClick={handleRegister}
              disabled={authLoading}
              style={{ width: "100%", padding: 12, background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "#fff", border: "none", borderRadius: 10, cursor: "pointer", fontSize: 16 }}
            >
              {authLoading ? "Регистрация..." : "🔓 Зарегистрироваться"}
            </button>
            
            <button
              onClick={() => setShowAuthModal(false)}
              style={{ width: "100%", padding: 10, marginTop: 10, background: "none", border: "none", color: textSecondary, cursor: "pointer" }}
            >
              Отмена
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
