import "reflect-metadata"

import dotenv from "dotenv";
import Koa from "koa";
import bodyParser from "koa-bodyparser";
import logger from "koa-logger";

import * as swagger from 'swagger2';
import {ui} from 'swagger2-koa';

const swaggerDocument = swagger.loadDocumentSync(__dirname + "/../" + "/api.yml");

import router from "./routes";
import { AppDataSource } from "./database";

dotenv.config();

// Inicializando o aplicativo Koa
const app = new Koa();

app.use(logger());

app.use(bodyParser());

// Adicionando as rotas
app
  .use(ui(swaggerDocument, "/docs"))
  .use(router.routes())
  .use(router.allowedMethods());

const startServer = async () => {
  try {

    // Inicializando Banco de Dados
    await AppDataSource.initialize()

    const PORT = process.env.SERVER_PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Check server health on http://localhost:${PORT}/health`);
    });  
  } catch (error) {
    console.error('Erro ao conectar ao banco de dados:', error);
    process.exit(1);
  }
  
}

startServer()