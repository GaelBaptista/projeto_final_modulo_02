import { RequestHandler } from "express";
import AppError from "../utils/AppError";

export const isAdmin: RequestHandler = (req, res, next) => {
  if ((req as any).userProfile !== "ADMIN") {
    return next(
      new AppError(
        "Acesso negado. Apenas administradores podem realizar essa ação.",
        403
      )
    );
  }
  next();
};
