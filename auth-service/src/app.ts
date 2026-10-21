
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

export default app;
