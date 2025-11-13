FROM node:22-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM base AS prod
WORKDIR /app
ENV NODE_ENV=production
COPY . .
RUN npm prune --omit=dev
EXPOSE 8080
CMD ["node", "index.js"]
