import { Request, Response, NextFunction } from "express";
import { AppDataSource } from "../data-source";
import { User } from "../entities/User";
import { Branch } from "../entities/Brancher";
import { Driver } from "../entities/Driver";
import bcrypt from "bcryptjs";
import AppError from "../utils/AppError";
import { cpf, cnpj } from "cpf-cnpj-validator";

class UserController {
  create = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
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

      // Validação de CPF/CNPJ
      if (profile === "DRIVER" && !cpf.isValid(document)) {
        return next(new AppError("CPF inválido.", 400));
      }
      if (profile === "BRANCH" && !cnpj.isValid(document)) {
        return next(new AppError("CNPJ inválido.", 400));
      }

      const userRepository = AppDataSource.getRepository(User);
      const branchRepository = AppDataSource.getRepository(Branch);
      const driverRepository = AppDataSource.getRepository(Driver);

      // Verifica se o email já existe
      const emailExistente = await userRepository.findOneBy({ email });
      if (emailExistente) {
        return next(new AppError("Email já cadastrado.", 409));
      }

      // Hash da senha
      const password_hash = await bcrypt.hash(password, 10);

      // Criação do usuário
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
}

export default new UserController();
