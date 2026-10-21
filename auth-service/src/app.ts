
import express, { type ErrorRequestHandler } from "express";
import { Prisma } from "../generated/prisma/client";
import authRoutes from "./routes/auth.routes";

const app = express();

app.use(express.json());
app.use("/api/auth", authRoutes);

app.get("/health", (_req, res) => {
  res.json({
    service: "auth-service",
    status: "OK",
  });
});

const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  ) {
    res.status(409).json({
      message: "Tài khoản cho sinh viên này đã được tạo hoặc username đã tồn tại",
    });
    return;
  }

  const statusCode =
    typeof error?.statusCode === "number" ? error.statusCode : 500;
  const message =
    statusCode < 500 && typeof error?.message === "string"
      ? error.message
      : "Đã xảy ra lỗi khi xử lý yêu cầu";

  res.status(statusCode).json({ message });
};

app.use(errorHandler);

export default app;
