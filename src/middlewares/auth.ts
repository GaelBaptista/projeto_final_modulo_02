import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import AppError from "../utils/AppError";

type DataJwt = JwtPayload & { userId: string; profile: string };

export const verifyToken = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(" ")[1] ?? "";

    if (!token) {
      throw new AppError("Token não informado", 401);
    }

    const data = jwt.verify(token, process.env.JWT_SECRET ?? "") as DataJwt;

    (req as any).userId = data.userId;
    (req as any).profile = data.profile;
    console.log("Middleware verifyToken -> userId:", data.userId);
    console.log("Middleware verifyToken -> profile:", data.profile);

    next();
  } catch (error) {
    if (error instanceof Error) {
      next(new AppError(error.message, 401));
    } else {
      next(new AppError("Erro desconhecido", 401));
    }
  }
};

export default verifyToken;
