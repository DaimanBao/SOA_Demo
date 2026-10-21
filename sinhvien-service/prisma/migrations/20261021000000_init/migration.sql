-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "sinhvien" (
    "ma_sv" VARCHAR(20) NOT NULL,
    "ho_ten" VARCHAR(100) NOT NULL,
    "ngay_sinh" DATE,
    "gioi_tinh" VARCHAR(10),
    "email" VARCHAR(100),
    "so_dien_thoai" VARCHAR(15),
    "lop" VARCHAR(50) NOT NULL,

    CONSTRAINT "sinhvien_pkey" PRIMARY KEY ("ma_sv")
);

-- CreateIndex
CREATE UNIQUE INDEX "sinhvien_email_key" ON "sinhvien"("email");

-- CreateIndex
CREATE UNIQUE INDEX "sinhvien_so_dien_thoai_key" ON "sinhvien"("so_dien_thoai");
