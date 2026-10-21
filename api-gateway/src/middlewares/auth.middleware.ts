
import type { Request, Response, NextFunction } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";

export interface AuthPayload extends JwtPayload {
  sub: string;
  username: string;
  role: "ADMIN" | "STUDENT";
  ma_sv: string | null;
}

export interface AuthRequest extends Request {
  user?: AuthPayload;
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

  const token = authorization.slice(7);

  try {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      throw new Error("Thiếu JWT_SECRET");
    }

    const decoded = jwt.verify(token, secret, {
      algorithms: ["HS256"],
    });

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
      res.status(401).json({
        message: "Token không hợp lệ",
      });
      return;
    }

    req.user = decoded as AuthPayload;

    next();
  } catch {
    res.status(401).json({
      message: "Token không hợp lệ hoặc đã hết hạn",
    });
  }
}

export function authorize(...allowedRoles: Array<"ADMIN" | "STUDENT">) {
  return (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        message: "Bạn không có quyền thực hiện thao tác này",
      });
      return;
    }

    next();
  };
}

export function allowOwnRegistration(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  if (req.user?.role === "ADMIN") {
    next();
    return;
  }

  if (
    req.user?.role === "STUDENT" &&
    typeof req.body?.ma_sv === "string" &&
    req.body.ma_sv === req.user.ma_sv
  ) {
    next();
    return;
  }

  res.status(403).json({
    message: "Sinh viên chỉ được đăng ký bằng mã sinh viên của mình",
  });
}

export function requireAdminForWrite(
  req: Parameters<typeof authenticate>[0],
  res: Parameters<typeof authenticate>[1],
  next: Parameters<typeof authenticate>[2],
) {
  if (req.method === "GET") {
    next();
    return;
  }

  authorize("ADMIN")(req, res, next);
}