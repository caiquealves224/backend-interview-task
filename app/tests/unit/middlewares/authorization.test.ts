import { Context, Next } from 'koa';
import { authorize } from '../../../src/middlewares/authorization'; // Ajuste o caminho conforme necessário

describe('authorize middleware', () => {
    let ctx: Context;
    let next: Next;

    beforeEach(() => {
        // Mocking do contexto Koa e a função next
        ctx = {
            state: {},
            status: 0,
            body: {},
        } as unknown as Context;

        next = jest.fn(); // Mock da função next

        jest.clearAllMocks(); // Resetar mocks antes de cada teste
    });

    it('deve retornar 401 se o usuário não estiver autenticado', async () => {
        const requiredRoles = ['admin'];

        const middleware = authorize(requiredRoles);
        await middleware(ctx, next);

        expect(ctx.status).toBe(401);
        expect(ctx.body).toEqual({ message: 'User not authenticated' });
        expect(next).not.toHaveBeenCalled(); // next não deve ser chamado
    });

    it('deve retornar 403 se o usuário não tiver as permissões necessárias', async () => {
        const requiredRoles = ['admin'];
        
        // Simulando um usuário autenticado sem a role 'admin'
        ctx.state.user = {
            'cognito:groups': ['user'] // Usuário com role 'user'
        };

        const middleware = authorize(requiredRoles);
        await middleware(ctx, next);

        expect(ctx.status).toBe(403);
        expect(ctx.body).toEqual({ message: 'Forbidden: Insufficient permissions' });
        expect(next).not.toHaveBeenCalled(); // next não deve ser chamado
    });

    it('deve chamar next se o usuário tiver as permissões necessárias', async () => {
        const requiredRoles = ['admin'];

        // Simulando um usuário autenticado com a role 'admin'
        ctx.state.user = {
            'cognito:groups': ['admin']
        };

        const middleware = authorize(requiredRoles);
        await middleware(ctx, next);

        expect(next).toHaveBeenCalled(); // next deve ser chamado
        expect(ctx.status).toBe(0); // O status HTTP não deve ser alterado
        expect(ctx.body).toEqual({}); // O corpo da resposta não deve ser modificado
    });

    it('deve permitir usuários com múltiplas roles, desde que uma corresponda', async () => {
        const requiredRoles = ['admin'];

        // Simulando um usuário com múltiplas roles, incluindo 'admin'
        ctx.state.user = {
            'cognito:groups': ['user', 'admin', 'editor']
        };

        const middleware = authorize(requiredRoles);
        await middleware(ctx, next);

        expect(next).toHaveBeenCalled(); // next deve ser chamado
        expect(ctx.status).toBe(0); // O status HTTP não deve ser alterado
        expect(ctx.body).toEqual({}); // O corpo da resposta não deve ser modificado
    });

    it('deve permitir se qualquer uma das roles necessárias for satisfeita', async () => {
        const requiredRoles = ['admin', 'editor'];

        // Simulando um usuário com a role 'editor'
        ctx.state.user = {
            'cognito:groups': ['editor']
        };

        const middleware = authorize(requiredRoles);
        await middleware(ctx, next);

        expect(next).toHaveBeenCalled(); // next deve ser chamado
        expect(ctx.status).toBe(0); // O status HTTP não deve ser alterado
        expect(ctx.body).toEqual({}); // O corpo da resposta não deve ser modificado
    });

    it('deve retornar 403 se o usuário tiver roles, mas nenhuma corresponder às necessárias', async () => {
        const requiredRoles = ['admin'];

        // Simulando um usuário com roles, mas sem 'admin'
        ctx.state.user = {
            'cognito:groups': ['user', 'editor']
        };

        const middleware = authorize(requiredRoles);
        await middleware(ctx, next);

        expect(ctx.status).toBe(403);
        expect(ctx.body).toEqual({ message: 'Forbidden: Insufficient permissions' });
        expect(next).not.toHaveBeenCalled(); // next não deve ser chamado
    });
});
