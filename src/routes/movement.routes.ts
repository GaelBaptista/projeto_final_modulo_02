import { Router } from "express";
import MovementController from "../controllers/MovementController";
import verifyToken from "../middlewares/auth";
import { isBranch } from "../middlewares/isBrancher";
import { isBranchOrDriver } from "../middlewares/isBranchOrDriver";

const movementRouter = Router();

movementRouter.post("/", verifyToken, isBranch, MovementController.create);
movementRouter.get("/", verifyToken, isBranchOrDriver, MovementController.list);

export default movementRouter;
