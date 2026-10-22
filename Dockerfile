FROM node:24.22.1-slim

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY ["package.json", "package-lock.json*", "./"]

RUN npm config set registry https://registry.npmmirror.com

RUN npm install

COPY . .


EXPOSE 9527
CMD ["npm","start"]