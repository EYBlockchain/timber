FROM node:lts-alpine

ENV USERNAME="app"

RUN addgroup -S $USERNAME && \
    adduser -S $USERNAME -G $USERNAME --home /app $USERNAME

WORKDIR /app

COPY ./package.json ./package-lock.json ./
RUN npm install
COPY ./src ./src
COPY ./test ./test
COPY ./.babelrc ./

USER $USERNAME:$USERNAME

EXPOSE 80

CMD npm start
