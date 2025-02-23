import { Request, Response, NextFunction } from "express";
import { AppDataSource } from "../data-source";
import { Movement } from "../entities/Movement";
import { Product } from "../entities/Products";
import { Branch } from "../entities/Brancher";
import AppError from "../utils/AppError";

class MovementController {
  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { destination_branch_id, product_id, quantity } = req.body;
      const { userId } = req as any;

      if (!destination_branch_id || !product_id || !quantity) {
        return next(
          new AppError(
            "Todos os campos obrigatórios devem ser preenchidos.",
            400
          )
        );
      }

      if (quantity <= 0) {
        return next(new AppError("A quantidade deve ser maior que 0.", 400));
      }

      const branchRepository = AppDataSource.getRepository(Branch);
      const productRepository = AppDataSource.getRepository(Product);
      const movementRepository = AppDataSource.getRepository(Movement);

      const originBranch = await branchRepository.findOne({
        where: { user: { id: userId } },
      });

      if (!originBranch) {
        return next(new AppError("Filial de origem não encontrada.", 404));
      }

      if (originBranch.id === destination_branch_id) {
        return next(
          new AppError(
            "A filial de origem não pode ser a mesma que a filial de destino.",
            400
          )
        );
      }

      const product = await productRepository.findOne({
        where: { id: product_id, branch: originBranch },
      });

      if (!product) {
        return next(
          new AppError("Produto não encontrado na filial de origem.", 404)
        );
      }

      if (product.amount < quantity) {
        return next(
          new AppError("Estoque insuficiente para essa movimentação.", 400)
        );
      }

      product.amount -= quantity;
      await productRepository.save(product);

      const movement = movementRepository.create({
        destination_branch: { id: destination_branch_id },
        product,
        quantity,
      });

      await movementRepository.save(movement);

      res.status(201).json({
        message: "Movimentação cadastrada com sucesso!",
        movement,
      });
    } catch (error) {
      next(error);
    }
  };
  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { profile } = req as any;

      if (!["BRANCH", "DRIVER"].includes(profile)) {
        return next(
          new AppError(
            "Acesso não autorizado. Apenas FILIAL e MOTORISTA podem acessar.",
            403
          )
        );
      }

      const movementRepository = AppDataSource.getRepository(Movement);

      const movements = await movementRepository.find({
        relations: ["destination_branch", "product"],
        select: {
          id: true,
          quantity: true,
          status: true,
          created_at: true,
          updated_at: true,
          destination_branch: {
            id: true,
            full_address: true,
          },
          product: {
            id: true,
            name: true,
            amount: true,
            description: true,
            url_cover: true,
          },
        },
      });

      res.status(200).json(movements);
    } catch (error) {
      next(error);
    }
  };

  startMovement = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const movementRepository = AppDataSource.getRepository(Movement);

      // Verifica se a movimentação existe
      const movement = await movementRepository.findOne({
        where: { id },
        relations: ["destination_branch", "product"], // Inclui os dados relacionados
      });

      if (!movement) {
        return next(new AppError("Movimentação não encontrada.", 404));
      }

      // Atualiza o status para "IN_PROGRESS"
      movement.status = "IN_PROGRESS";
      await movementRepository.save(movement);

      res.status(200).json({
        message: "Movimentação iniciada com sucesso!",
        movement,
      });
    } catch (error) {
      next(error);
    }
  };
}

export default new MovementController();
