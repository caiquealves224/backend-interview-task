import { Context, Next } from 'koa';

// Middleware de autorização que aceita as roles necessárias para acessar a rota
export const authorize = (requiredRoles: string[]) => {
  return async (ctx: Context, next: Next) => {
    const user = ctx.state.user;

    if (!user) {
      ctx.status = 401;
      ctx.body = { message: 'User not authenticated' };
      return;
    }

    const userRoles = user['cognito:groups'] || []; // Supondo que o role esteja nos grupos do Cognito
    const hasRole = requiredRoles.some((role) => userRoles.includes(role));

    if (!hasRole) {
      ctx.status = 403;
      ctx.body = { message: 'Forbidden: Insufficient permissions' };
      return;
    }

    await next();
  };
};
