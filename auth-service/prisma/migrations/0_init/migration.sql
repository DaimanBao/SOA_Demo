CREATE TABLE "users" (
  "id" SERIAL NOT NULL,
  "username" VARCHAR(50) NOT NULL,
  "password_hash" VARCHAR(255) NOT NULL,
  "role" VARCHAR(20) NOT NULL DEFAULT 'STUDENT',
  "ma_sv" VARCHAR(20),

  CONSTRAINT "users_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "users_username_key" UNIQUE ("username"),
  CONSTRAINT "users_ma_sv_key" UNIQUE ("ma_sv"),
  CONSTRAINT "chk_users_role" CHECK ("role" IN ('ADMIN', 'STUDENT')),
  CONSTRAINT "chk_users_student" CHECK ("role" <> 'STUDENT' OR "ma_sv" IS NOT NULL)
);
