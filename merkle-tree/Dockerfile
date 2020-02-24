FROM node:11.15

WORKDIR /app

COPY ./package.json ./package-lock.json ./
COPY ./src ./src
COPY ./test ./test
COPY ./setup-mongo-acl-for-new-users.js ./.babelrc ./
RUN npm install

EXPOSE 80
CMD npm start
