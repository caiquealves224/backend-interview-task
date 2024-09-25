"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const data_sourcer_1 = require("./data-sourcer");
const User_1 = require("./entity/User");
// import Koa from 'koa';
// import Router from '@koa/router';
// import bodyParser from 'koa-bodyparser';
// import logger from 'koa-logger';
// // Inicializando o aplicativo Koa
// const app = new Koa();
// const router = new Router();
// // Middleware de logging
// app.use(logger());
// // Middleware para analisar o corpo das requisições (JSON, URL-encoded)
// app.use(bodyParser());
// // Definindo uma rota básica de exemplo
// router.get('/', async (ctx) => {
//   ctx.body = {
//     message: 'Hello, World 3!',
//   };
// });
// // Outra rota de exemplo com parâmetros
// router.get('/hello/:name', async (ctx) => {
//   const { name } = ctx.params;
//   ctx.body = {
//     message: `Hello, ${name}!`,
//   };
// });
// // Adicionando as rotas ao aplicativo Koa
// app.use(router.routes()).use(router.allowedMethods());
// // Iniciando o servidor na porta 3000
// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`Server is running on http://localhost:${PORT}`);
// });
data_sourcer_1.AppDataSource.initialize().then(() => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Inserting a new user into the database...");
    const user = new User_1.User();
    user.firstName = "Timber";
    user.lastName = "Saw";
    user.age = 25;
    yield data_sourcer_1.AppDataSource.manager.save(user);
    console.log("Saved a new user with id: " + user.id);
    console.log("Loading users from the database...");
    const users = yield data_sourcer_1.AppDataSource.manager.find(User_1.User);
    console.log("Loaded users: ", users);
    console.log("Here you can setup and run express / fastify / any other framework.");
})).catch(error => console.log(error));
//# sourceMappingURL=index.js.map