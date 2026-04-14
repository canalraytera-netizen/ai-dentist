import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Отключаем встроенную оптимизацию картинок, чтобы не было конфликтов
  images: {
    unoptimized: true,
  },
  // Указываем папку для сборки
  distDir: '.next',
  // Включаем режим 'standalone', который упаковывает всё необходимое для сервера
  output: 'standalone',
  // Настройка правильных MIME-типов для статических файлов
  async headers() {
    return [
      {
        source: "/:path*.js",
        headers: [{ key: "Content-Type", value: "application/javascript" }],
      },
      {
        source: "/:path*.mjs",
        headers: [{ key: "Content-Type", value: "application/javascript" }],
      },
      {
        source: "/:path*.css",
        headers: [{ key: "Content-Type", value: "text/css" }],
      },
      {
        source: "/:path*.jpg",
        headers: [{ key: "Content-Type", value: "image/jpeg" }],
      },
      {
        source: "/:path*.jpeg",
        headers: [{ key: "Content-Type", value: "image/jpeg" }],
      },
      {
        source: "/:path*.png",
        headers: [{ key: "Content-Type", value: "image/png" }],
      },
      {
        source: "/:path*.webp",
        headers: [{ key: "Content-Type", value: "image/webp" }],
      },
      {
        source: "/:path*.svg",
        headers: [{ key: "Content-Type", value: "image/svg+xml" }],
      },
      {
        source: "/:path*.ico",
        headers: [{ key: "Content-Type", value: "image/x-icon" }],
      },
      {
        source: "/:path*.json",
        headers: [{ key: "Content-Type", value: "application/json" }],
      },
      {
        source: "/:path*.woff",
        headers: [{ key: "Content-Type", value: "font/woff" }],
      },
      {
        source: "/:path*.woff2",
        headers: [{ key: "Content-Type", value: "font/woff2" }],
      },
      {
        source: "/:path*.ttf",
        headers: [{ key: "Content-Type", value: "font/ttf" }],
      },
    ];
  },
};

export default nextConfig;
