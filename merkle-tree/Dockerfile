# Build stage
FROM node:lts-alpine AS builder

COPY ./config/trust/* /usr/local/share/ca-certificates/
RUN apk update --no-check-certificate && apk add --no-check-certificate ca-certificates
RUN chmod 644 /usr/local/share/ca-certificates/* && update-ca-certificates

WORKDIR /app

COPY ./package.json ./package-lock.json ./
RUN npm ci
COPY ./src ./src
COPY ./.babelrc ./

# Build/transpile the code
RUN npx babel src --out-dir dist


# Production stage
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
RUN npm ci --omit=dev

# Copy transpiled code
COPY --from=builder /app/dist ./dist
COPY ./config/trust /certificates

# Remove npm, npx to remove glob vulnerability
RUN rm -rf /usr/local/lib/node_modules/npm \
    && rm -f /usr/local/bin/npm /usr/local/bin/npx \
    && rm -f /usr/local/bin/yarn /usr/local/bin/yarnpkg

USER $USERNAME:$USERNAME

ENV NODE_EXTRA_CA_CERTS=/usr/local/share/ca-certificates/Zscaler_Root_CA.crt

EXPOSE 80

CMD node ./dist/index.js
