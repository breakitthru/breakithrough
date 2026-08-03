-- Add password hash for email/password sign-in (nullable; OAuth-only users have none).
ALTER TABLE "User" ADD COLUMN "password" TEXT;
