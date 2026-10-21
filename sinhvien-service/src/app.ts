
import express from "express";
import sinhvienRoutes from "./routes/sinhvien.routes";

const app = express();

app.use(express.json());
app.use("/api/sinhvien", sinhvienRoutes);

app.get("/health", (_req, res) => {
  res.status(200).json({
    service: "sinhvien-service",
    status: "OK",
  });
});

export default app;
