import Router from "@koa/router";
import { 
    getUserController, 
    listUsersController,
    authUserController,
    editUserController  
} from "./controllers/index";
import { authenticate } from "./middlewares/authentication";
import { authorize } from "./middlewares/authorization";

const router = new Router();

// Definindo uma rota de health check
router.get('/health', async (ctx) => {
    ctx.status = 200;
    ctx.body = {
      status: 'OK',
      timestamp: new Date().toISOString(),
    };
});

// Rotas Públicas
router.post("/auth", authUserController)

// Rotas Autenticadas
router.get("/me", authenticate, getUserController)
router.patch("/edit-account/:id", authenticate, editUserController)
router.get("/users", authenticate, authorize(['admin']) ,listUsersController);

export default router;