
import type { Request, Response, NextFunction } from "express";
import { detaiService } from "../services/detai.service";

type DeTaiParams = { ma_dt: string };

export const detaiController = {
  async findAll(_req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await detaiService.findAll());
    } catch (error) {
      next(error);
    }
  },

  async findById(req: Request<DeTaiParams>, res: Response, next: NextFunction) {
    try {
      res.json(await detaiService.findById(req.params.ma_dt));
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      res.status(201).json(await detaiService.create(req.body));
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request<DeTaiParams>, res: Response, next: NextFunction) {
    try {
      res.json(
        await detaiService.update(req.params.ma_dt, req.body),
      );
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request<DeTaiParams>, res: Response, next: NextFunction) {
    try {
      await detaiService.delete(req.params.ma_dt);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
};
