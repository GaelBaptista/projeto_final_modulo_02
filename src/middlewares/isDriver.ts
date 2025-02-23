import { NextFunction, Request, Response } from "express";
import AppError from "../utils/AppError";

export const isDriver = (req: Request, _res: Response, next: NextFunction) => {
  const { profile } = req as any;

  if (profile !== "DRIVER") {
    return next(
      new AppError(
        "Acesso não autorizado. Apenas MOTORISTAS podem realizar esta ação.",
        403
      )
    );
  }

  next();
};
