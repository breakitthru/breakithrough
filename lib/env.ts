import { z } from "zod";

// Validate env once, at module load. Read env only through this module —
// never touch process.env directly in app code.
const schema = z.object({
  DATABASE_URL: z.string().min(1),
  DIRECT_URL: z.string().optional(),
  AUTH_SECRET: z.string().min(1),
  AUTH_GOOGLE_ID: z.string().default(""),
  AUTH_GOOGLE_SECRET: z.string().default(""),
  AUTH_URL: z.string().default("http://localhost:3000"),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

// During `next build`, runtime-only secrets (e.g. AUTH_SECRET, which the host
// injects at runtime) may be absent. Don't fail the build for those; validate
// strictly only when the app is actually running.
const isBuildPhase =
  process.env.NEXT_PHASE === "phase-production-build" ||
  process.env.SKIP_ENV_VALIDATION === "1";

const parsed = schema.safeParse(process.env);

if (!parsed.success && !isBuildPhase) {
  console.error("Invalid environment variables:", parsed.error.flatten().fieldErrors);
  throw new Error("Invalid environment variables");
}

export const env = parsed.success
  ? parsed.data
  : {
      DATABASE_URL: process.env.DATABASE_URL ?? "",
      DIRECT_URL: process.env.DIRECT_URL,
      AUTH_SECRET: process.env.AUTH_SECRET ?? "",
      AUTH_GOOGLE_ID: process.env.AUTH_GOOGLE_ID ?? "",
      AUTH_GOOGLE_SECRET: process.env.AUTH_GOOGLE_SECRET ?? "",
      AUTH_URL: process.env.AUTH_URL ?? "http://localhost:3000",
      NODE_ENV:
        (process.env.NODE_ENV as "development" | "test" | "production") ?? "production",
    };

/** True when Google OAuth is actually configured (keys present). */
export const isGoogleConfigured = Boolean(env.AUTH_GOOGLE_ID && env.AUTH_GOOGLE_SECRET);
