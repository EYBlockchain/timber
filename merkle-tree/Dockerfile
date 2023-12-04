FROM node:20

WORKDIR /app

COPY ./package.json ./package-lock.json ./
COPY ./src ./src
COPY ./test ./test
COPY ./.babelrc ./
RUN npm install
RUN npm ci

EXPOSE 80
CMD npm start
