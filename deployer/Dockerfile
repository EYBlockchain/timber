FROM node:11.15

RUN mkdir /app
WORKDIR /app

COPY ./package.json ./package-lock.json ./
RUN npm install 

EXPOSE 80
CMD npm start
