FROM node:24-alpine

WORKDIR /app

COPY package*.json .

RUN npm ci

USER node

COPY . .

EXPOSE 3000

CMD [ "npm", "run", "start:dev" ]