-- Detailed Mood & Anxiety self-tracking. One entry per member per calendar date.
CREATE TABLE "MoodEntry" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "mood" INTEGER NOT NULL,
    "intensity" INTEGER NOT NULL,
    "frequency" INTEGER NOT NULL,
    "triggers" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "notes" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "MoodEntry_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "MoodEntry_userId_date_key" ON "MoodEntry"("userId", "date");
CREATE INDEX "MoodEntry_userId_idx" ON "MoodEntry"("userId");

ALTER TABLE "MoodEntry" ADD CONSTRAINT "MoodEntry_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
