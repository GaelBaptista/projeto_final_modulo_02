import { Router } from "express";
import ProductController from "../controllers/ProductController";
import verifyToken from "../middlewares/auth";
import { isBranch } from "../middlewares/isBrancher";

const productRouter = Router();

productRouter.post("/", verifyToken, isBranch, ProductController.create);
productRouter.get("/", verifyToken, isBranch, ProductController.list);

export default productRouter;
