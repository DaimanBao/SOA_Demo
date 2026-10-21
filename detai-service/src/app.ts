
import express from "express";
import detaiRoutes from "./routes/detai.routes";

const app = express();

app.use(express.json());
app.use("/api/detai", detaiRoutes);

app.get("/health", (_req, res) => {
  res.status(200).json({
    service: "detai-service",
    status: "OK",
  });
});

export default app;
