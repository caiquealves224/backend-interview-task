import { Context } from "koa";
import { AppDataSource } from "../../database";
import { User } from "../../models/User";

export async function listUsersController(ctx: Context) {
    const users = await AppDataSource.manager.find(User)
    ctx.status = 200
    ctx.body = users
}