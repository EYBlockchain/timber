FROM node:11.15

WORKDIR /app

COPY ./package.json ./
RUN npm install

EXPOSE 80
CMD npm start
