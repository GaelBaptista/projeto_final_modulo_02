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
  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { userId, profile } = req as any;
      const {
        name,
        email,
        password,
        full_address,
        profile: forbiddenProfile,
        status,
        created_at,
        updated_at,
      } = req.body;

      const userRepository = AppDataSource.getRepository(User);
      const driverRepository = AppDataSource.getRepository(Driver);
      const branchRepository = AppDataSource.getRepository(Branch);

      if (
        forbiddenProfile ||
        status !== undefined ||
        created_at ||
        updated_at
      ) {
        return next(
          new AppError("Não é permitido atualizar estes campos.", 401)
        );
      }

      const user = await userRepository.findOne({ where: { id } });
      if (!user) {
        return next(new AppError("Usuário não encontrado.", 404));
      }

      if (profile !== "ADMIN" && userId !== id) {
        return next(new AppError("Acesso não autorizado.", 401));
      }

      if (name) user.name = name;
      if (email) {
        const emailExistente = await userRepository.findOneBy({ email });
        if (emailExistente && emailExistente.id !== id) {
          return next(new AppError("Email já cadastrado.", 409));
        }
        user.email = email;
      }
      if (password) user.password_hash = await bcrypt.hash(password, 10);

      await userRepository.save(user);

      if (full_address) {
        if (user.profile === "DRIVER") {
          const driver = await driverRepository.findOne({
            where: { user: { id } },
          });
          if (driver) {
            driver.full_address = full_address;
            await driverRepository.save(driver);
          }
        } else if (user.profile === "BRANCH") {
          const branch = await branchRepository.findOne({
            where: { user: { id } },
          });
          if (branch) {
            branch.full_address = full_address;
            await branchRepository.save(branch);
          }
        }
      }

      res.status(200).json({
        message: "Usuário atualizado com sucesso!",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          profile: user.profile,
          full_address,
        },
      });
    } catch (error) {
      next(error);
    }
  };
  updateStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const userRepository = AppDataSource.getRepository(User);

      const user = await userRepository.findOne({ where: { id } });
      if (!user) {
        return next(new AppError("Usuário não encontrado.", 404));
      }

      user.status = !user.status;
      await userRepository.save(user);

      res.status(200).json({
        message: `Status do usuário ${user.name} atualizado com sucesso!`,
        user: {
          id: user.id,
          name: user.name,
          status: user.status,
        },
      });
    } catch (error) {
      next(error);
    }
  };
}

export default new UserController();
