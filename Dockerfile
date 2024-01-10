FROM node:18.19.0-alpine3.18

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY ["package.json", "package-lock.json*", "./"]

RUN npm install

COPY . .


EXPOSE 3000
CMD ["npm","start"]