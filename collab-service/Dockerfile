# collab-service/Dockerfile

FROM node:22-alpine AS base
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM base AS dev
ENV NODE_ENV=development
RUN apk add --no-cache curl
COPY . .
EXPOSE 3004
CMD ["npm", "run", "dev"]

FROM node:22-alpine AS prod
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm prune --omit=dev
EXPOSE 8080
CMD ["npm", "run", "start"]