import { Context } from "koa";
import { AppDataSource } from "../../database"
import { User } from "../../models/User"

interface RequestBody {
    name: string;
    role?: string;
}

export async function editUserController(ctx: Context) {
    const requestBody: RequestBody = JSON.parse(ctx.request.rawBody)

    const isAdmin = ctx.state.user['cognito:groups'].includes("admin");
    const findByParameter = isAdmin ? { id: ctx.params.id } : { email: ctx.state.user.email }

    const user = await AppDataSource.manager.findOneBy(User, findByParameter)

    if(!user) {
        ctx.status = 404
        return
    }

    user.name = requestBody.name;

    if(isAdmin) {
        user.role = requestBody.role;
    }
    
    user.isOnboarded = true;
    user.updateAt = new Date().toISOString();

    await AppDataSource.manager.save(user)
    ctx.body = user
}