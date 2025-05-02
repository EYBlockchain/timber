FROM node:11.15

WORKDIR /app

# install additional ca-certificates e.g. zscaler certificate (can be removed if not needed)
COPY ./config/trust/* /usr/local/share/ca-certificates/
RUN chmod 644 /usr/local/share/ca-certificates/* && update-ca-certificates

COPY ./package.json ./package-lock.json ./
COPY ./src ./src
COPY ./test ./test
COPY ./.babelrc ./
RUN npm ci

EXPOSE 80
CMD npm start
