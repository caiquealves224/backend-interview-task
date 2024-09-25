import { Context } from "koa";
import { listUsersController } from "../../../src/controllers/index";
import { AppDataSource } from "../../../src/database";

jest.mock('../../../src/database', () => ({
    AppDataSource: {
        manager: {
            find: jest.fn(),
        },
    },
}));

describe('listUsersController', () => {
    let ctx: Context;

    beforeEach(() => {
        // Mock do contexto Koa
        ctx = {
            status: 0,
            body: {},
        } as unknown as Context;

        jest.clearAllMocks(); // Resetar mocks antes de cada teste
    });

    it('deve retornar a lista de usuários com sucesso', async () => {
        const mockUsers = [
            { id: '1', name: 'User One', email: 'user1@example.com' },
            { id: '2', name: 'User Two', email: 'user2@example.com' },
        ];

        (AppDataSource.manager.find as jest.Mock).mockResolvedValue(mockUsers); // Mock da lista de usuários

        await listUsersController(ctx);

        // Verifique se o corpo da resposta contém a lista de usuários
        expect(ctx.body).toEqual(mockUsers);
        expect(ctx.status).toBe(200); // Espera-se que o status seja 200
    });
});