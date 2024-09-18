# Build stage
FROM node:20-alpine AS build

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Development stage
FROM node:20-alpine AS development

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .

CMD ["npm", "run", "start:dev"]

# Production stage
FROM node:20-alpine AS production

WORKDIR /usr/src/app

COPY --from=build /usr/src/app/package*.json ./
COPY --from=build /usr/src/app/dist ./dist

RUN npm ci --only=production && \
    npm install -g @nestjs/cli && \
    npm install bcrypt --build-from-source && \
    npm cache clean --force

USER node

CMD ["node", "dist/main.js"]