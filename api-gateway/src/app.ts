
import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import {
  authenticate,
  authorize,
  requireAdminForWrite,
} from "./middlewares/auth.middleware";

const app = express(); 

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:4200');
  res.header(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, PATCH, DELETE, OPTIONS'
  );
  res.header(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization'
  );

  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
    return;
  }

  next();
});

const services = {
  auth: process.env.AUTH_SERVICE_URL!,
  sinhvien: process.env.SINHVIEN_SERVICE_URL!,
  detai: process.env.DETAI_SERVICE_URL!,
  dangky: process.env.DANGKY_SERVICE_URL!,
};

app.get("/health", (_req, res) => {
  res.json({
    service: "api-gateway",
    status: "OK",
  });
});

function proxy(target: string, pathFilter: string) {
  return createProxyMiddleware({
    target,
    changeOrigin: true,
    pathFilter,
  });
}

// Auth: register và login công khai
app.use(proxy(services.auth, "/api/auth"));

// Tất cả API nghiệp vụ đều cần JWT
app.use("/api/sinhvien", authenticate);
app.use("/api/detai", authenticate);
app.use("/api/dangky", authenticate);

// SinhVien và DeTai: thao tác ghi chỉ dành cho ADMIN
app.use("/api/sinhvien", requireAdminForWrite);
app.use("/api/detai", requireAdminForWrite);

// DangKy: STUDENT được gửi POST; Service sẽ kiểm tra ma_sv.
// Những thao tác ghi khác chỉ dành cho ADMIN.
app.use("/api/dangky", (req, res, next) => {
  if (req.method === "POST") {
    next();
    return;
  }

  if (req.method !== "GET") {
    authorize("ADMIN")(req, res, next);
    return;
  }

  next();
});

// Chuyển tiếp request đến các Service
app.use(proxy(services.sinhvien, "/api/sinhvien"));
app.use(proxy(services.detai, "/api/detai"));
app.use(proxy(services.dangky, "/api/dangky"));

export default app;
