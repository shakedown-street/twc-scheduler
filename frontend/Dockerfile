FROM node:18-alpine3.16

WORKDIR /frontend

COPY package.json ./
COPY package-lock.json ./

RUN npm install
COPY . .

ARG MODE

RUN npm run build${MODE}
