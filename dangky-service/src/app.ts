
import express, { type ErrorRequestHandler } from "express";
import { Prisma } from "../generated/prisma/client";
import dangkyRoutes from "./routes/dangky.routes";

const app = express();

app.use(express.json());
app.use("/api/dangky", dangkyRoutes);

app.get("/health", (_req, res) => {
  res.status(200).json({
    service: "dangky-service",
    status: "OK",
  });
});

const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  ) {
    res.status(409).json({
      message:
        "Sinh viên đã có đăng ký cho đề tài này. Vui lòng kiểm tra danh sách đăng ký hoặc chọn đề tài khác.",
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
