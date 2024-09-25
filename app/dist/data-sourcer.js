"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
const typeorm_1 = require("typeorm");
const User_1 = require("./entity/User");
exports.AppDataSource = new typeorm_1.DataSource({
    type: "postgres",
    host: "db",
    port: 5432,
    username: "postgres",
    password: "senha",
    database: "meubanco",
    synchronize: true,
    logging: false,
    entities: [User_1.User],
    migrations: [],
    subscribers: [],
});
//# sourceMappingURL=data-sourcer.js.map