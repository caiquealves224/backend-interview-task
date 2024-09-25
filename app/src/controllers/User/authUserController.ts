import { Context } from "koa";
import { AppDataSource } from "../../database";
import { User } from "../../models/User";
import { CognitoIdentityServiceProvider } from "aws-sdk"

const cognito = new CognitoIdentityServiceProvider({
    region: process.env.AWS_COGNITO_REGION
})

interface RequestBody {
    name: string,
    email: string,
    password: string,
}

export async function authUserController(ctx: Context) {
    const requestBody: RequestBody = JSON.parse(ctx.request.rawBody)

    const { name, email, password } = requestBody

    if (!name || !email || !password) {
        ctx.status = 400;
        ctx.body = { message: 'Name, Email and password are required' }
        return;
    }

    if(await AppDataSource.manager.findOneBy(User, { email })) {
        await login(requestBody, ctx)
        return
    }
    
    await register(requestBody, ctx)
    return
    
}


const register = async ({name, email, password}: RequestBody, ctx: Context) => {
    const user = new User()
    user.name = name
    user.email = email
    user.role = "default"
    user.isOnboarded = false
    user.createdAt = new Date().toISOString()
    user.updateAt = new Date().toISOString()

    await AppDataSource.manager.save(user)

    const signUpParams = {
        ClientId: process.env.AWS_COGNITO_CLIENT_ID,
        Username: email,
        Password: password, 
        UserAttributes: [
            { Name: "name", Value: name },
            { Name: "email", Value: email },
        ],
      };

    await cognito.signUp(signUpParams).promise();

    const authResult = await cognito.initiateAuth({
        AuthFlow: 'USER_PASSWORD_AUTH',
        ClientId: process.env.AWS_COGNITO_CLIENT_ID,
        AuthParameters: {
            USERNAME: email,
            PASSWORD: password,
        },}).promise();

    ctx.status = 201;
    ctx.body = {
        message: 'Account created and signed in successfully',
        token: authResult.AuthenticationResult?.IdToken, // JWT Token do Cognito
    };
}

const login = async ({ email, password }: RequestBody, ctx: Context) => {
    const signInParams = {
        AuthFlow: 'USER_PASSWORD_AUTH',
        ClientId: process.env.AWS_COGNITO_CLIENT_ID,
        AuthParameters: {
            USERNAME: email,
            PASSWORD: password,
        },
    };

    const result = await cognito.initiateAuth(signInParams).promise();

    ctx.status = 200;
    ctx.body = {
        message: 'Signed in successfully',
        token: result.AuthenticationResult?.IdToken
    };
}