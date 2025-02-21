import { Request, Response, NextFunction } from "express";
import { AppDataSource } from "../data-source";
import { User } from "../entities/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import AppError from "../utils/AppError";

class AuthController {
  login = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return next(new AppError("Email e senha são obrigatórios.", 400));
      }

      const userRepository = AppDataSource.getRepository(User);
      const user = await userRepository.findOneBy({ email });

      if (!user) {
        return next(new AppError("Credenciais inválidas.", 401));
      }

      const passwordMatch = await bcrypt.compare(password, user.password_hash);
      if (!passwordMatch) {
        return next(new AppError("Credenciais inválidas.", 401));
      }

      const token = jwt.sign(
        { userId: user.id, profile: user.profile },
        process.env.JWT_SECRET || "secret",
        { expiresIn: "1h" }
      );

      res.status(200).json({ token });
    } catch (error) {
      next(error);
    }
  };
}

export default new AuthController();
