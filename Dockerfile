FROM node:22-alpine AS builder

WORKDIR /app

# Устанавливаем Python и необходимые зависимости для canvas
RUN apk add --no-cache python3 make g++ cairo-dev pango-dev

# Копируем файлы зависимостей
COPY package*.json ./
COPY package-lock.json* ./

# Устанавливаем зависимости
RUN npm ci --legacy-peer-deps

# Копируем исходный код
COPY . .

# Собираем приложение
RUN npm run build

# Финальный образ
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Устанавливаем Python для canvas
RUN apk add --no-cache python3 cairo-dev pango-dev

# Копируем собранное приложение
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules

# Очистка кэша npm для уменьшения размера образа
RUN npm cache clean --force

EXPOSE 3000

CMD ["npm", "run", "start"]
