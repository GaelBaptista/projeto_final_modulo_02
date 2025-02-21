import { Router } from "express";
import UserController from "../controllers/UserController";
import verifyToken from "../middlewares/auth";
import { isAdmin } from "../middlewares/isAdmin";

const userRouter = Router();

userRouter.post("/", verifyToken, isAdmin, UserController.create);

export default userRouter;
