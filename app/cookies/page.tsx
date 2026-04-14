// app/cookies/page.tsx
"use client";

import { useState, useEffect } from "react";

export default function CookiesPage() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("darkMode");
    if (savedTheme) setDarkMode(savedTheme === "true");
  }, []);

  const bgColor = darkMode ? "#1a1a1a" : "#f7f7f8";
  const textColor = darkMode ? "#fff" : "#1a1a1a";
  const textSecondary = darkMode ? "#aaa" : "#666";

  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: "40px 20px", background: bgColor, minHeight: "100vh" }}>
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        style={{
          position: "fixed",
          bottom: 30,
          right: 30,
          background: "#667eea",
          color: "#fff",
          border: "none",
          borderRadius: "50%",
          width: 50,
          height: 50,
          cursor: "pointer",
          fontSize: 20,
          zIndex: 1000,
        }}
      >
        ↑
      </button>

      <h1 style={{ fontSize: 28, color: textColor, marginBottom: 20, borderBottom: `2px solid #667eea`, paddingBottom: 10 }}>
        Политика использования файлов cookie
      </h1>
      
      <div style={{ color: textSecondary, marginBottom: 30 }}>
        <p><strong>Дата публикации:</strong> 14 апреля 2026 г.</p>
        <p><strong>Дата вступления в силу:</strong> 14 апреля 2026 г.</p>
      </div>

      <div style={{ color: textColor, lineHeight: 1.6 }}>
        <h2 style={{ fontSize: 20, marginTop: 25, marginBottom: 15, color: "#667eea" }}>1. Что такое cookie?</h2>
        <p>Файлы cookie — это небольшие текстовые файлы, которые веб-сайт сохраняет на вашем компьютере или мобильном устройстве, когда вы его посещаете. Они позволяют сайту запоминать ваши действия и предпочтения (например, язык, тему оформления, данные авторизации) на определённый период времени, чтобы вам не приходилось заново вводить их при каждом посещении.</p>

        <h2 style={{ fontSize: 20, marginTop: 25, marginBottom: 15, color: "#667eea" }}>2. Какие cookie мы используем?</h2>
        
        <h3 style={{ fontSize: 18, marginTop: 20, marginBottom: 10, color: "#667eea" }}>2.1. Технически необходимые cookie</h3>
        <p>Эти cookie необходимы для обеспечения корректной работы сайта. Они позволяют:</p>
        <ul style={{ marginLeft: 20, marginBottom: 15 }}>
          <li>Сохранять информацию о вашей авторизации (сессия);</li>
          <li>Запоминать выбранную вами тему оформления (светлая/тёмная);</li>
          <li>Обеспечивать безопасность и защиту от мошенничества.</li>
        </ul>
        <p><strong>Эти cookie не могут быть отключены, так как без них сайт не будет работать корректно.</strong></p>

        <h3 style={{ fontSize: 18, marginTop: 20, marginBottom: 10, color: "#667eea" }}>2.2. Аналитические cookie</h3>
        <p>Эти cookie помогают нам понять, как посетители взаимодействуют с сайтом, собирая информацию анонимно. Мы используем:</p>
        <ul style={{ marginLeft: 20, marginBottom: 15 }}>
          <li><strong>Google Analytics</strong> — для анализа трафика и поведения пользователей на сайте.</li>
        </ul>
        <p>Эти cookie собирают информацию о вашем устройстве, типе браузера, времени посещения, просмотренных страницах. <strong>Эти данные не содержат персональной информации и не могут быть использованы для вашей идентификации.</strong></p>

        <h3 style={{ fontSize: 18, marginTop: 20, marginBottom: 10, color: "#667eea" }}>2.3. Функциональные cookie</h3>
        <p>Эти cookie позволяют сайту запоминать сделанный вами выбор (например, закрытое уведомление о cookie) и обеспечивать расширенную функциональность.</p>

        <h2 style={{ fontSize: 20, marginTop: 25, marginBottom: 15, color: "#667eea" }}>3. Как управлять cookie?</h2>
        <p>Вы можете управлять файлами cookie через настройки вашего браузера. Вы можете:</p>
        <ul style={{ marginLeft: 20, marginBottom: 15 }}>
          <li>Заблокировать все cookie;</li>
          <li>Удалить уже сохранённые cookie;</li>
          <li>Настроить браузер на уведомление перед сохранением cookie.</li>
        </ul>
        <p>Инструкции для разных браузеров:</p>
        <ul style={{ marginLeft: 20, marginBottom: 15 }}>
          <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" style={{ color: "#667eea" }}>Google Chrome</a></li>
          <li><a href="https://support.mozilla.org/ru/kb/udalenie-faylov-cookie-dlya-udaleniya-informacii" target="_blank" style={{ color: "#667eea" }}>Mozilla Firefox</a></li>
          <li><a href="https://support.apple.com/ru-ru/guide/safari/sfri11471/mac" target="_blank" style={{ color: "#667eea" }}>Safari</a></li>
          <li><a href="https://support.microsoft.com/ru-ru/microsoft-edge/udalennie-faylov-cookie-v-brauzere-microsoft-edge" target="_blank" style={{ color: "#667eea" }}>Microsoft Edge</a></li>
        </ul>
        <p><strong>Важно:</strong> Полное отключение cookie может привести к невозможности использования некоторых функций сайта (например, авторизации, сохранения темы оформления).</p>

        <h2 style={{ fontSize: 20, marginTop: 25, marginBottom: 15, color: "#667eea" }}>4. Срок хранения cookie</h2>
        <ul style={{ marginLeft: 20, marginBottom: 15 }}>
          <li><strong>Сессионные cookie:</strong> удаляются после закрытия браузера.</li>
          <li><strong>Постоянные cookie:</strong> сохраняются на вашем устройстве до истечения срока их действия или до их удаления (до 12 месяцев).</li>
        </ul>

        <h2 style={{ fontSize: 20, marginTop: 25, marginBottom: 15, color: "#667eea" }}>5. Согласие на использование cookie</h2>
        <p>Продолжая использовать наш сайт, вы соглашаетесь на использование файлов cookie в соответствии с настоящей Политикой. При первом посещении сайта вам будет показано уведомление о cookie, и ваше действие (нажатие «Принять» или продолжение использования сайта) будет считаться согласием.</p>
        <p>Вы можете в любой момент отозвать своё согласие, удалив cookie через настройки браузера.</p>

        <h2 style={{ fontSize: 20, marginTop: 25, marginBottom: 15, color: "#667eea" }}>6. Изменение Политики cookie</h2>
        <p>Администрация вправе вносить изменения в настоящую Политику. Новая редакция Политики вступает в силу с момента её размещения на Сайте.</p>

        <h2 style={{ fontSize: 20, marginTop: 25, marginBottom: 15, color: "#667eea" }}>7. Контактная информация</h2>
        <div style={{ background: darkMode ? "#2d2d2d" : "#f5f5f5", padding: 15, borderRadius: 10, marginTop: 10 }}>
          <p style={{ margin: 5 }}>По всем вопросам, связанным с использованием cookie, вы можете обратиться:</p>
          <p style={{ margin: 5 }}><strong>Email:</strong> dr.rayter@yandex.ru</p>
          <p style={{ margin: 5 }}><strong>Телефон:</strong> +7 (964) 783-11-81</p>
        </div>
      </div>
    </main>
  );
}