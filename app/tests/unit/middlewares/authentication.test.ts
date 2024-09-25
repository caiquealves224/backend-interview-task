import { Context, Next } from 'koa';
import { authenticate } from '../../../src/middlewares/authentication'; // ajuste o caminho conforme necessário
import jwt from 'jsonwebtoken';
import jwksRsa from 'jwks-rsa';

// Mocking da biblioteca jwks-rsa e jwt
jest.mock('jsonwebtoken');
jest.mock('jwks-rsa');

describe('authenticate middleware', () => {
    let ctx: Context;
    let next: Next;

    beforeEach(() => {
        ctx = {
            headers: {},
            state: {},
            status: 0,
            body: {},
        } as unknown as Context;

        next = jest.fn(); // Mock da função next

        jest.clearAllMocks(); // Resetar mocks antes de cada teste
    });

    it('deve retornar 401 se o token de autorização não estiver presente', async () => {
        await authenticate(ctx, next);

        expect(ctx.status).toBe(401);
        expect(ctx.body).toEqual({ message: 'Access token is missing' });
        expect(next).not.toHaveBeenCalled(); // next não deve ser chamado
    });

    it('deve retornar 401 se o token for inválido ou expirado', async () => {
        ctx.headers['authorization'] = 'Bearer invalid.token';

        (jwt.verify as jest.Mock).mockImplementation((_, __, callback) => {
            callback(new Error('Invalid token'), null);
        });

        await authenticate(ctx, next);

        expect(ctx.status).toBe(401);
        expect(ctx.body).toEqual({ message: 'Invalid or expired token' });
        expect(next).not.toHaveBeenCalled(); // next não deve ser chamado
    });

    it('deve chamar next se o token for válido', async () => {
        ctx.headers['authorization'] = 'Bearer valid.token';

        const decodedToken = { email: 'test@example.com' };
        (jwt.verify as jest.Mock).mockImplementation((token, getKey, options, callback) => {
            callback(null, decodedToken);
        });

        await authenticate(ctx, next);

        expect(ctx.state.user).toEqual(decodedToken); // O usuário deve ser definido no contexto
        expect(next).toHaveBeenCalled(); // next deve ser chamado
    });
});
