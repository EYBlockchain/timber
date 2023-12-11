FROM node:iron-slim

ENV USERNAME="app"

RUN addgroup --gid 10001 $USERNAME && \
    adduser --gid 10001 --uid 10001 --home /app $USERNAME

WORKDIR /app

COPY ./package.json ./package-lock.json ./
COPY ./src ./src
COPY ./test ./test
COPY ./.babelrc ./
RUN npm install

USER $USERNAME:$USERNAME
EXPOSE 80
CMD npm start
