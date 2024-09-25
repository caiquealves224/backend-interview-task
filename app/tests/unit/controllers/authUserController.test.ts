import { Context } from "koa";
import { AppDataSource } from "../../../src/database";
import { User } from "../../../src/models/User";
import { CognitoIdentityServiceProvider } from "aws-sdk";
import { authUserController } from "../../../src/controllers/User/authUserController";


jest.mock("aws-sdk", () => {
  return {
    CognitoIdentityServiceProvider: jest.fn().mockImplementation(() => ({
      signUp: jest.fn().mockImplementation(() => ({
        promise: jest.fn().mockResolvedValue({ 
          user: { getUsername: () => "mock-username" }, // Retorno simulado
        }),
      })),
      initiateAuth: jest.fn().mockImplementation(() => ({
        promise: jest.fn().mockResolvedValue({
          AuthenticationResult: { IdToken: "mock-id-token" },
        }),
      })),
    })),
  };
});

jest.mock("../../../src/database");

const mockCognito = new CognitoIdentityServiceProvider();

describe("authUserController", () => {
  let ctx: Context;

  beforeEach(() => {
    // Setup contexto simulado (mockado) para Koa
    ctx = {
      request: {
        rawBody: JSON.stringify({
          name: "Test User",
          email: "test@example.com",
          password: "Password123!",
        }),
      },
      status: 0,
      body: {},
    } as unknown as Context;

    // Resetar todos os mocks antes de cada teste
    jest.clearAllMocks();
  });

  it("deve registrar um usuário quando ele não existe", async () => {
    // Mockar a resposta do banco de dados para usuário inexistente
    (AppDataSource.manager.findOneBy as jest.Mock).mockResolvedValue(null);


    await authUserController(ctx);

    expect(AppDataSource.manager.findOneBy).toHaveBeenCalledWith(User, { email: "test@example.com" });
    expect(ctx.status).toBe(201);
    expect(ctx.body).toEqual({
      message: "Account created and signed in successfully",
      token: "mock-id-token",
    });
  });

  it("deve logar o usuário quando ele já existe", async () => {
    // Mockar a resposta do banco de dados para usuário existente
    (AppDataSource.manager.findOneBy as jest.Mock).mockResolvedValue({ email: "test@example.com" });

    await authUserController(ctx);

    expect(AppDataSource.manager.findOneBy).toHaveBeenCalledWith(User, { email: "test@example.com" });
    expect(ctx.status).toBe(200);
    expect(ctx.body).toEqual({
      message: "Signed in successfully",
      token: "mock-id-token",
    });
  });

  it("deve retornar erro 400 quando faltar parâmetros obrigatórios", async () => {
    // Simulando um corpo de requisição inválido
    ctx.request.rawBody = JSON.stringify({
      email: "test@example.com",
      password: "Password123!",
    });

    await authUserController(ctx);

    expect(ctx.status).toBe(400);
    expect(ctx.body).toEqual({
      message: "Name, Email and password are required",
    });
  });
});
