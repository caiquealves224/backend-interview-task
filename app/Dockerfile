FROM node:20

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

RUN npm install -g typescript ts-node-dev

COPY . .

RUN npm run build

# Expõe a porta que a aplicação irá usar
EXPOSE 3000

# Comando para iniciar a aplicação
CMD ["npm", "run", "start:dev"]