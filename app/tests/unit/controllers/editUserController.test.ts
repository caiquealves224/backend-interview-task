import { Context } from "koa";
import { editUserController } from "../../../src/controllers/User/editUserController";
import { AppDataSource } from "../../../src/database";
import { User } from "../../../src/models/User";

// Mocking do User
jest.mock("../../../src/models/User");

// Mocking do AppDataSource
jest.mock("../../../src/database", () => ({
    AppDataSource: {
        manager: {
            findOneBy: jest.fn(),
            save: jest.fn(),
        },
    },
}));

describe("editUserController", () => {
    let ctx: Context;

    beforeEach(() => {
        // Mock do contexto Koa
        ctx = {
            request: {
                rawBody: JSON.stringify({
                    name: "Updated User",
                    role: "admin", // Incluir role para administradores
                }),
            },
            params: { id: "1" },
            state: {
                user: {
                    email: "test@example.com",
                    "cognito:groups": [], // Pode ser vazio para testar o caso não admin
                },
            },
            status: 0,
            body: {},
        } as unknown as Context;

        jest.clearAllMocks(); // Resetar mocks antes de cada teste
    });

    it("deve atualizar um usuário com sucesso para admin", async () => {
        ctx.state.user["cognito:groups"].push("admin"); // Simular que o usuário é um admin
        const mockUser = { id: "1", name: "Old Name", role: "default", isOnboarded: false, updateAt: "" };
        
        (AppDataSource.manager.findOneBy as jest.Mock).mockResolvedValue(mockUser); // Mock do usuário encontrado

        await editUserController(ctx);

        // Verifique se o usuário foi salvo corretamente
        expect(AppDataSource.manager.save).toHaveBeenCalledWith({
            ...mockUser,
            name: "Updated User",
            role: "admin", // O role deve ser atualizado
            isOnboarded: true,
            updateAt: expect.any(String), // Verifique se updateAt foi atualizado
        });

        // Verifique a resposta correta do ctx
        expect(ctx.body).toEqual({
            ...mockUser,
            name: "Updated User",
            role: "admin",
            isOnboarded: true,
            updateAt: expect.any(String),
        });
    });

    it("deve atualizar um usuário com sucesso para um usuário não admin", async () => {
        const mockUser = { id: "1", name: "Old Name", role: "default", isOnboarded: false, updateAt: "" };

        (AppDataSource.manager.findOneBy as jest.Mock).mockResolvedValue(mockUser); // Mock do usuário encontrado

        await editUserController(ctx);

        // Verifique se o usuário foi salvo corretamente
        expect(AppDataSource.manager.save).toHaveBeenCalledWith({
            ...mockUser,
            name: "Updated User",
            isOnboarded: true,
            updateAt: expect.any(String),
        });

        // Verifique a resposta correta do ctx
        expect(ctx.body).toEqual({
            ...mockUser,
            name: "Updated User",
            isOnboarded: true,
            updateAt: expect.any(String),
        });
    });

    it("deve retornar 404 se o usuário não for encontrado", async () => {
        (AppDataSource.manager.findOneBy as jest.Mock).mockResolvedValue(null); // Simula que o usuário não foi encontrado

        await editUserController(ctx);

        expect(ctx.status).toBe(404);
        expect(AppDataSource.manager.save).not.toHaveBeenCalled(); // Verifique se nada foi salvo
    });
});
