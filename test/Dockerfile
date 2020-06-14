# This dockerfile is to use for the action test
FROM node:12.16.3-slim

ARG THISISARG1
ARG THISISARG2

WORKDIR /github-actions

COPY . .

RUN npm install \
    && npm run package \
    && npm cache clean --force

