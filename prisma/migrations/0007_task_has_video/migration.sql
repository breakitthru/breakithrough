-- Whether a task is meant to show a video slot to members.
ALTER TABLE "Task" ADD COLUMN "hasVideo" BOOLEAN NOT NULL DEFAULT true;
