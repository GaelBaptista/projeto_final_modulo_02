import { NextFunction, Request, Response } from "express";
import AppError from "../utils/AppError";

export const isBranch = (req: Request, _res: Response, next: NextFunction) => {
  const { profile } = req as any;

  if (profile !== "BRANCH") {
    return next(new AppError("Acesso não autorizado.", 403));
  }

  next();
};
