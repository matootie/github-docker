FROM node:12.16.3-slim

WORKDIR /github-actions

COPY package*.json ./

RUN npm install \
    && npm run package \
    && npm cache clean --force

COPY . .