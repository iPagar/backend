# Используем Node.js как базовый образ
FROM node:16-alpine

RUN apk add --no-cache bash

# Создаем директорию приложения внутри образа
WORKDIR /app

# Копируем файлы package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm i

# Копируем все файлы проекта внутрь образа
COPY . .

# Запускаем приложение
CMD ["npm", "run", "start:prod"]

