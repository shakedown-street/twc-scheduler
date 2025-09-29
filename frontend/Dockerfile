FROM node:22-alpine3.22

WORKDIR /frontend

COPY package.json ./
COPY package-lock.json ./

RUN npm install
COPY . .
