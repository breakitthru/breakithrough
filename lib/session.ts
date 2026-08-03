import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import type { User } from "@prisma/client";

/** The logged-in user's full DB record, or null if not signed in. */
export async function getCurrentUser(): Promise<User | null> {
  const session = await auth();
  const id = session?.user?.id;
  if (!id) return null;
  return prisma.user.findUnique({ where: { id } });
}

/** Require a signed-in user; redirect to /login otherwise. */
export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

/**
 * Require a signed-in AND onboarded user (for the main app).
 * Not signed in → /login. Signed in but not onboarded → /welcome/intake/1.
 */
export async function requireOnboardedUser(): Promise<User> {
  const user = await requireUser();
  if (!user.onboardedAt) redirect("/welcome/intake/1");
  return user;
}
