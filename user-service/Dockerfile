# user-service/Dockerfile
FROM node:20-alpine AS base
WORKDIR /app
ENV NODE_ENV=development

COPY package.json package-lock.json ./
RUN npm ci
RUN apk add --no-cache curl

FROM base AS dev
COPY . .

RUN npx prisma generate

EXPOSE 3002
CMD ["npm", "run", "dev"]