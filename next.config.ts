import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Отключаем оптимизацию изображений, чтобы не было конфликтов
  images: {
    unoptimized: true,
  },
  // Явно указываем папку для сборки
  distDir: '.next',
};

export default nextConfig;
