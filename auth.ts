import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { env, isGoogleConfigured } from "@/lib/env";

/*
  Auth.js v5 — Google OAuth with JWT (stateless) sessions.
  The Prisma adapter persists User/Account rows so program progress can attach
  to a real user; sessions themselves are JWTs (no Session table lookups).

  Google is only registered when its keys are present, so the app runs in demo
  mode locally without OAuth configured.
*/
export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  secret: env.AUTH_SECRET,
  trustHost: true,
  pages: {
    signIn: "/login",
  },
  providers: isGoogleConfigured
    ? [
        Google({
          clientId: env.AUTH_GOOGLE_ID,
          clientSecret: env.AUTH_GOOGLE_SECRET,
          allowDangerousEmailAccountLinking: true,
        }),
      ]
    : [],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.uid = user.id;
        // @ts-expect-error — role added on our User model
        token.role = user.role ?? "USER";
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = (token.uid as string) ?? session.user.id;
        // @ts-expect-error — expose role on the session
        session.user.role = token.role ?? "USER";
      }
      return session;
    },
  },
});
