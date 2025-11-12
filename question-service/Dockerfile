FROM node:20-alpine AS base
WORKDIR /app
ENV NODE_ENV=development

# Install deps
COPY package.json package-lock.json ./
# Ensure prisma is available during install/generate
COPY prisma ./prisma
RUN npm ci
RUN apk add --no-cache curl

# Copy source
COPY . .

# Generate Prisma client from prisma/schema.prisma
RUN npx prisma generate

EXPOSE 3002
# Also generate at runtime (useful if you bind-mount code in dev)
CMD ["sh", "-lc", "npx prisma generate && npm run dev"]