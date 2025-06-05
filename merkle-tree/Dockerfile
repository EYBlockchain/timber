FROM node:lts-alpine

ENV USERNAME="app"

# install additional ca-certificates e.g. zscaler certificate (can be removed if not needed)
COPY ./config/trust/* /usr/local/share/ca-certificates/
RUN apk update --no-check-certificate && apk add --no-check-certificate ca-certificates
RUN chmod 644 /usr/local/share/ca-certificates/* && update-ca-certificates

RUN addgroup -S $USERNAME && \
    adduser -S $USERNAME -G $USERNAME --home /app $USERNAME

WORKDIR /app

# Uncomment for local builds
#RUN npm config set strict-ssl false

COPY ./package.json ./package-lock.json ./
RUN npm install
COPY ./src ./src
COPY ./test ./test
COPY ./.babelrc ./
COPY ./config/trust /certificates

USER $USERNAME:$USERNAME

ENV NODE_EXTRA_CA_CERTS=/usr/local/share/ca-certificates/Zscaler_Root_CA.crt

EXPOSE 80

CMD npm start
