FROM node:iron-slim

WORKDIR /app

COPY ./package.json ./package-lock.json ./
COPY ./src ./src
COPY ./test ./test
COPY ./.babelrc ./
RUN npm install

EXPOSE 80
CMD npm start
