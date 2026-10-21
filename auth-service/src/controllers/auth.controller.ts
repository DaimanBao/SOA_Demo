
import type { Request, Response, NextFunction } from "express";
import { authService } from "../services/auth.service";

export const authController = {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await authService.register(req.body);
      res.status(201).json(user);
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
