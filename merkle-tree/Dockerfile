FROM node:11.15 as node-build

ARG GPR_TOKEN
WORKDIR /app

COPY ./package.json ./package-lock.json /.npmrc ./
COPY ./src ./src
COPY ./test ./test
COPY ./.babelrc ./
RUN npm ci
RUN rm -f .npmrc

FROM node:11.15

WORKDIR /app

COPY --from=node-build /app /app

EXPOSE 80
CMD npm start
