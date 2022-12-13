FROM node:16.18.1-alpine3.15

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY ["package.json", "package-lock.json*", "./"]

RUN npm install

COPY . .


EXPOSE 3000
CMD ["npm","start"]