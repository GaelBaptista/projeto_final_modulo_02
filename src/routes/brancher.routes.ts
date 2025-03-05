import { Router } from "express";
import BranchController from "../controllers/BrancherController";
import verifyToken from "../middlewares/auth";
import { isAdmin } from "../middlewares/isAdmin";

const brancherRouter = Router();

brancherRouter.get("/", verifyToken, isAdmin, BranchController.list);

export default brancherRouter;
