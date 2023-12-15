FROM node:iron-slim

WORKDIR /app

COPY ./package.json ./package-lock.json ./
RUN npm i

EXPOSE 80
CMD npm run dev
