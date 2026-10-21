
import type { Response, NextFunction } from "express";
import { dangkyService } from "../services/dangky.service";
import type { AuthRequest } from "../middlewares/auth.middleware";

type DangKyParams = { ma_dk: string };

function parseId(value: string): number {
  const id = Number(value);

  if (!Number.isInteger(id) || id < 1) {
    throw Object.assign(new Error("ma_dk không hợp lệ"), {
      statusCode: 400,
    });
  }

  return id;
}

export const dangkyController = {
  async findAll(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      if (!req.user) {
        res.status(401).json({ message: "Bạn cần đăng nhập" });
        return;
      }

      const ma_sv =
        req.user.role === "ADMIN" ? undefined : req.user.ma_sv;

      res.json(await dangkyService.findAll(ma_sv));
    } catch (error) {
      next(error);
    }
  },

  async findById(
    req: AuthRequest & { params: DangKyParams },
    res: Response,
    next: NextFunction,
  ) {
    try {
      if (!req.user) {
        res.status(401).json({ message: "Bạn cần đăng nhập" });
        return;
      }

      const ma_sv =
        req.user.role === "ADMIN" ? undefined : req.user.ma_sv;

      res.json(
        await dangkyService.findById(
          parseId(req.params.ma_dk),
          ma_sv,
        ),
      );
    } catch (error) {
      next(error);
    }
  },

  async create(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { ma_sv, ma_dt, ngay_dang_ky } = req.body;
      const authorization = req.headers.authorization;

      if (!authorization?.startsWith("Bearer ")) {
        res.status(401).json({ message: "Bạn cần đăng nhập" });
        return;
      }

      const result = await dangkyService.create(
        ma_sv,
        ma_dt,
        authorization.slice(7),
        req.user?.role === "ADMIN" ? ngay_dang_ky : undefined,
      );

      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  },

  async update(
    req: AuthRequest & { params: DangKyParams },
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { trang_thai, diem } = req.body;
      const data: {
        trang_thai?: string;
        diem?: number | null;
      } = {};

      if (trang_thai !== undefined) {
        data.trang_thai = trang_thai;
      }

      if (diem !== undefined) {
        if (diem !== null && typeof diem !== "number") {
          throw Object.assign(
            new Error("Điểm phải là số hoặc null"),
            { statusCode: 400 },
          );
        }

        data.diem = diem;
      }

      res.json(
        await dangkyService.update(
          parseId(req.params.ma_dk),
          data,
        ),
      );
    } catch (error) {
      next(error);
    }
  },

  async delete(
    req: AuthRequest & { params: DangKyParams },
    res: Response,
    next: NextFunction,
  ) {
    try {
      await dangkyService.delete(parseId(req.params.ma_dk));
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
};
