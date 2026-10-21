ALTER TABLE "users"
  ALTER COLUMN "username" TYPE VARCHAR(120);

ALTER TABLE "users"
  ADD COLUMN "must_change_password" BOOLEAN NOT NULL DEFAULT false;
