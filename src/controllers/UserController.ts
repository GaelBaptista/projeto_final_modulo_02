import { Request, Response, NextFunction } from "express";
import { AppDataSource } from "../data-source";
import { User } from "../entities/User";
import { Branch } from "../entities/Brancher";
import { Driver } from "../entities/Driver";
import bcrypt from "bcryptjs";
import AppError from "../utils/AppError";
import { cpf, cnpj } from "cpf-cnpj-validator";

class UserController {
  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { profile } = req.query;

      const userRepository = AppDataSource.getRepository(User);

      let users;
      if (profile) {
        const profileString = String(profile);

        if (!["DRIVER", "BRANCH", "ADMIN"].includes(profileString)) {
          return next(
            new AppError("Perfil inválido. Use DRIVER, BRANCH ou ADMIN.", 400)
          );
        }

        users = await userRepository.find({
          where: { profile: profileString as "DRIVER" | "BRANCH" | "ADMIN" },
          select: ["id", "name", "status", "profile"],
        });
      } else {
        users = await userRepository.find({
          select: ["id", "name", "status", "profile"],
        });
      }

      res.status(200).json(users);
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, profile, email, password, document, full_address } =
        req.body;

      if (!name || !profile || !email || !password || !document) {
        return next(
          new AppError(
            "Todos os campos obrigatórios devem ser preenchidos.",
            400
          )
        );
      }

      if (!["DRIVER", "BRANCH", "ADMIN"].includes(profile)) {
        return next(
          new AppError(
            "Perfil inválido. Os valores permitidos são: DRIVER, BRANCH ou ADMIN.",
            400
          )
        );
      }

      if (password.length < 6 || password.length > 20) {
        return next(
          new AppError("A senha deve ter entre 6 e 20 caracteres.", 400)
        );
      }

      if (profile === "DRIVER" && !cpf.isValid(document)) {
        return next(new AppError("CPF inválido.", 400));
      }
      if (profile === "BRANCH" && !cnpj.isValid(document)) {
        return next(new AppError("CNPJ inválido.", 400));
      }

      const userRepository = AppDataSource.getRepository(User);
      const branchRepository = AppDataSource.getRepository(Branch);
      const driverRepository = AppDataSource.getRepository(Driver);

      const emailExistente = await userRepository.findOneBy({ email });
      if (emailExistente) {
        return next(new AppError("Email já cadastrado.", 409));
      }

      const password_hash = await bcrypt.hash(password, 10);

      const userCreated = userRepository.create({
        name,
        profile,
        email,
        password_hash,
      });
      await userRepository.save(userCreated);

      if (profile === "DRIVER") {
        await driverRepository.save({
          full_address,
          document,
          user: userCreated,
        });
      } else if (profile === "BRANCH") {
        await branchRepository.save({
          full_address,
          document,
          user: userCreated,
        });
      }

      res.status(201).json({
        message: "Usuário criado com sucesso!",
        user: { name: userCreated.name, profile: userCreated.profile },
      });
    } catch (error) {
      next(error);
    }
  };
  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { userId, profile } = req as any;

      const userRepository = AppDataSource.getRepository(User);
      const driverRepository = AppDataSource.getRepository(Driver);

      // 📌 Busca o usuário pelo ID
      const user = await userRepository.findOne({
        where: { id },
        select: ["id", "name", "status", "profile"],
      });

      if (!user) {
        return next(new AppError("Usuário não encontrado.", 404));
      }

      let full_address = null;

      if (user.profile === "DRIVER") {
        const driver = await driverRepository.findOne({
          where: { user: { id: user.id } },
          select: ["full_address"],
        });
        full_address = driver?.full_address || null;
      }

      if (profile !== "ADMIN" && userId !== id) {
        return next(new AppError("Acesso não autorizado.", 401));
      }

      res.status(200).json({
        id: user.id,
        name: user.name,
        status: user.status,
        profile: user.profile,
        full_address,
      });
    } catch (error) {
      next(error);
    }
  };
}

export default new UserController();
