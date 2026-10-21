
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

export default app;
