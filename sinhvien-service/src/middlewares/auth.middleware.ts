
import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  user?: {
    sub: string;
    username: string;
    role: "ADMIN" | "STUDENT";
    ma_sv: string | null;
  };
}

export function authenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  const authorization = req.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    res.status(401).json({
      message: "Bạn cần đăng nhập",
    });
    return;
  }

  const secret = process.env.JWT_SECRET;

  if (!secret) {
    res.status(500).json({
      message: "Service chưa cấu hình JWT_SECRET",
    });
    return;
  }

  try {
    const decoded = jwt.verify(
      authorization.slice(7),
      secret,
      { algorithms: ["HS256"] },
    );

    if (
      typeof decoded === "string" ||
      typeof decoded.sub !== "string" ||
      typeof decoded.username !== "string" ||
      !["ADMIN", "STUDENT"].includes(decoded.role) ||
      !(
        decoded.ma_sv === null ||
        typeof decoded.ma_sv === "string"
      )
    ) {
      res.status(401).json({ message: "Token không hợp lệ" });
      return;
    }

    req.user = {
      sub: decoded.sub,
      username: decoded.username,
      role: decoded.role,
      ma_sv: decoded.ma_sv,
    };

    next();
  } catch {
    res.status(401).json({
      message: "Token không hợp lệ hoặc đã hết hạn",
    });
  }
}

export function requireAdmin(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  if (req.user?.role !== "ADMIN") {
    res.status(403).json({
      message: "Chỉ ADMIN được thực hiện thao tác này",
    });
    return;
  }

  next();
}
