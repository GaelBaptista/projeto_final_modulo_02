import { Router } from "express";
import AuthController from "../controllers/AuthControllerLogin";

const authRouter = Router();

// Rota de login
authRouter.post("/", AuthController.login);

export default authRouter;
