import { NextFunction, Request, Response } from "express";
import AppError from "../utils/AppError";

export const isAdmin = (req: Request, _res: Response, next: NextFunction) => {
  if ((req as any).profile !== "ADMIN") {
    return next(
      new AppError(
        "Acesso negado. Apenas administradores podem realizar essa ação.",
        403
      )
    );
  }

  next();
};
