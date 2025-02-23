import { NextFunction, Request, Response } from "express";
import AppError from "../utils/AppError";

export const isBranchOrDriver = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const { profile } = req as any;

  if (!["BRANCH", "DRIVER"].includes(profile)) {
    return next(new AppError("Acesso não autorizado.", 403));
  }

  next();
};
