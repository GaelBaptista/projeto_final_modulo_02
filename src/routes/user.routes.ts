import { Router } from "express";
import UserController from "../controllers/UserController";
import verifyToken from "../middlewares/auth";
import { isAdmin } from "../middlewares/isAdmin";

const userRouter = Router();

userRouter.post("/", verifyToken, isAdmin, UserController.create);
userRouter.get("/", verifyToken, isAdmin, UserController.list);
userRouter.get("/:id", verifyToken, UserController.getById);
userRouter.put("/:id", verifyToken, UserController.update);
userRouter.patch(
  "/:id/status",
  verifyToken,
  isAdmin,
  UserController.updateStatus
);

export default userRouter;
