import { Context } from "koa";
import { AppDataSource } from "../../database";
import { User } from "../../models/User";

export async function getUserController(ctx: Context) {
    const user = await AppDataSource.manager.findOneBy(User, { email: ctx.state.user.email })
    if(!user) {
        ctx.status = 404
        return
    }
    ctx.status = 200
    ctx.body = user
}