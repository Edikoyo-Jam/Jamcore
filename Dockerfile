FROM node:18-alpine

WORKDIR /usr/src/app

RUN apk add --no-cache postgresql-client

COPY package*.json ./
RUN npm install

COPY . .
RUN npx prisma generate

EXPOSE 3005