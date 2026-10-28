
import type { Request, Response, NextFunction } from "express";
import { authService } from "../services/auth.service";

export const authController = {
  async bootstrapAdmin(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.bootstrapAdmin(
        req.body?.username,
        req.body?.password,
        req.header("x-admin-bootstrap-secret"),
      );
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  },

  register(_req: Request, res: Response) {
    res.status(403).json({
      message: "Tài khoản sinh viên do quản trị viên cấp từ hồ sơ sinh viên",
    });
  },

  async provisionStudent(req: Request, res: Response, next: NextFunction) {
    try {
      const authorization = req.headers.authorization;

      if (!authorization?.startsWith("Bearer ")) {
        res.status(401).json({ message: "Bạn cần đăng nhập" });
        return;
      }

      const result = await authService.provisionStudentAccount(
        req.body?.ma_sv,
        authorization.slice(7),
      );
      res.status(result.created ? 201 : 200).json(result);
    } catch (error) {
      next(error);
    }
  },

  async resetStudentPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const authorization = req.headers.authorization;

      if (!authorization?.startsWith("Bearer ")) {
        res.status(401).json({ message: "Bạn cần đăng nhập" });
        return;
      }

      const result = await authService.resetStudentPassword(
        req.body?.ma_sv,
        authorization.slice(7),
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { username, password } = req.body;

      const result = await authService.login(username, password);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const authorization = req.headers.authorization;

      if (!authorization?.startsWith("Bearer ")) {
        res.status(401).json({ message: "Bạn cần đăng nhập" });
        return;
      }

      const result = await authService.changePassword(
        authorization.slice(7),
        req.body?.current_password,
        req.body?.new_password,
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  me(req: Request, res: Response, next: NextFunction) {
    try {
      const authorization = req.headers.authorization;

      if (!authorization?.startsWith("Bearer ")) {
        res.status(401).json({ message: "Thiếu Bearer Token" });
        return;
      }

      const token = authorization.slice(7);
      const payload = authService.verifyToken(token);

      res.json(payload);
    } catch (error) {
      next(error);
    }
  },
};
