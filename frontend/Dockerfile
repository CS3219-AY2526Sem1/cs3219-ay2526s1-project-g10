# user-service/Dockerfile
FROM node:20-alpine
WORKDIR /app/src
ENV NODE_ENV=development

COPY package.json package-lock.json ./
RUN npm ci

EXPOSE 3000
CMD ["npm", "run", "dev"]