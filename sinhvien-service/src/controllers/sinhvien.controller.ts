
import type { Request, Response, NextFunction } from "express";
import { sinhvienService } from "../services/sinhvien.service";

type SinhVienParams = { ma_sv: string };

export const sinhvienController = {
  async findAll(_req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await sinhvienService.findAll());
    } catch (error) {
      next(error);
    }
  },

  async findById(req: Request<SinhVienParams>, res: Response, next: NextFunction) {
    try {
      res.json(await sinhvienService.findById(req.params.ma_sv));
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const student = await sinhvienService.create(req.body);
      res.status(201).json(student);
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request<SinhVienParams>, res: Response, next: NextFunction) {
    try {
      res.json(
        await sinhvienService.update(req.params.ma_sv, req.body),
      );
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request<SinhVienParams>, res: Response, next: NextFunction) {
    try {
      await sinhvienService.delete(req.params.ma_sv);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
};
