import { Request, Response, NextFunction } from "express";
import { AppDataSource } from "../data-source";
import { Branch } from "../entities/Brancher";

class BranchController {
  list = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const branchRepository = AppDataSource.getRepository(Branch);

      const branches = await branchRepository.find({
        select: ["id", "full_address"],
      });

      res.status(200).json(branches);
    } catch (error) {
      next(error);
    }
  };
}

export default new BranchController();
