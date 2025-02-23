import { Router } from "express";
import MovementController from "../controllers/MovementController";
import verifyToken from "../middlewares/auth";
import { isBranch } from "../middlewares/isBrancher";

const movementRouter = Router();

movementRouter.post("/", verifyToken, isBranch, MovementController.create);

export default movementRouter;
