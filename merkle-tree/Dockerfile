FROM node:11.15

WORKDIR /app

COPY ./package.json ./package-lock.json ./
COPY ./src ./src
COPY ./.babelrc ./setup-mongo-acl-for-new-users.js ./
RUN npm ci

EXPOSE 80
CMD npm start
