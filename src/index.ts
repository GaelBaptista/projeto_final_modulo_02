require("dotenv").config();
import "reflect-metadata";
import express from "express";
import { AppDataSource } from "./data-source";

import cors from "cors";

import userRouter from "./routes/user.routes";
import authRouter from "./routes/auth.routes";
import productRouter from "./routes/product.routes";

import { handleError } from "./middlewares/handleError";
import logger from "./config/winston";
import movementRouter from "./routes/movement.routes";

import brancherRouter from "./routes/brancher.routes";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/users", userRouter);
app.use("/login", authRouter);
app.use("/products", productRouter);
app.use("/movements", movementRouter);

app.use("/branches", brancherRouter);

app.get("/env", (req, res) => {
  res.json({
    port: process.env.PORT,
    node_env: process.env.NODE_ENV,
  });
});

app.use(handleError);

AppDataSource.initialize()
  .then(() => {
    app.listen(process.env.PORT, () => {
      logger.info(
        `O servidor está rodando em http://localhost:${process.env.PORT}`
      );
    });
  })
  .catch((error) => console.log(error));
