-- Admin-authored how-to steps shown on the task page.
ALTER TABLE "Task" ADD COLUMN "steps" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
