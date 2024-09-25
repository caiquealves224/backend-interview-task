import { Context } from "koa";
import { getUserController } from "../../../src/controllers/index";
import { AppDataSource } from "../../../src/database";

jest.mock('../../../src/database', () => ({
    AppDataSource: {
        manager: {
            findOneBy: jest.fn(),
        },
    },
}));

describe('getUserController', () => {
    let ctx: Context;

    beforeEach(() => {
        // Mock do contexto Koa
        ctx = {
            state: {
                user: {
                    email: 'test@example.com',
                },
            },
            status: 0,
            body: {},
        } as unknown as Context;

        jest.clearAllMocks(); // Resetar mocks antes de cada teste
    });

    it('deve retornar o usuário encontrado', async () => {
        const mockUser = {
            id: '1',
            name: 'Test User',
            email: 'test@example.com',
            role: 'default',
            isOnboarded: true,
        };

        (AppDataSource.manager.findOneBy as jest.Mock).mockResolvedValue(mockUser);

        ctx.state.user.id = 1
        await getUserController(ctx);

        // Verifique se o usuário foi retornado corretamente
        expect(ctx.body).toEqual(mockUser);
        expect(ctx.status).toBe(200);
    });

    it('deve retornar 404 se o usuário não for encontrado', async () => {
        (AppDataSource.manager.findOneBy as jest.Mock).mockResolvedValue(null); // Simula que o usuário não foi encontrado

        await getUserController(ctx);

        expect(ctx.status).toBe(404); // Verifique se o status é 404
        expect(ctx.body).toEqual({}); // Não deve haver corpo na resposta
    });
});