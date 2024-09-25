import { Context, Next } from 'koa';
import jwt, { JwtPayload } from 'jsonwebtoken';
import jwksRsa from 'jwks-rsa';

const AWS_REGION = "us-east-2"
const USER_POOL_ID = "us-east-2_xKcpmvmhJ"

// Função para buscar a chave pública usada pelo Cognito para verificar o JWT
const jwksClient = jwksRsa({
  jwksUri: `https://cognito-idp.${AWS_REGION}.amazonaws.com/${USER_POOL_ID}/.well-known/jwks.json`,
});


const getKey = (header: any, callback: any) => {
  jwksClient.getSigningKey(header.kid, (err, key) => {
    const signingKey = key.getPublicKey();
    callback(null, signingKey);
  });
};

// Middleware de autenticação
export const authenticate = async (ctx: Context, next: Next) => {
  const token = ctx.headers['authorization'];

  if (!token) {
    ctx.status = 401;
    ctx.body = { message: 'Access token is missing' };
    return;
  }

  try {
    // Verifica o JWT usando a chave pública obtida do Cognito
    const decodedToken = await new Promise<JwtPayload>((resolve, reject) => {
      jwt.verify(token, getKey, { algorithms: ['RS256'] }, (err, decoded) => {
        if (err) return reject(err);
        resolve(decoded as JwtPayload);
      });
    });

    ctx.state.user = decodedToken;
    await next();
  } catch (error) {
    console.log(error)
    ctx.status = 401;
    ctx.body = { message: 'Invalid or expired token' };
  }
};
