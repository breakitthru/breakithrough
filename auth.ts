import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { env, isGoogleConfigured } from "@/lib/env";
import { verifyPassword } from "@/lib/password";

/*
  Auth.js v5 — email/password (Credentials) as the primary sign-in, plus Google
  OAuth when its keys are configured. Sessions are stateless JWTs.

  Route protection is done in server-component layouts (see lib/session.ts), not
  in edge middleware, so the Node-only bits (Prisma, scrypt) never hit the edge.
*/
export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  secret: env.AUTH_SECRET,
  trustHost: true,
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(creds) {
        const email = String(creds?.email ?? "").trim().toLowerCase();
        const password = String(creds?.password ?? "");
        if (!email || !password) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user?.password) return null;

        const ok = await verifyPassword(password, user.password);
        if (!ok) return null;

        return {
          id: user.id,
          name: user.displayName ?? user.name,
          email: user.email,
          image: user.image,
          role: user.role,
        };
      },
    }),
    ...(isGoogleConfigured
      ? [
          Google({
            clientId: env.AUTH_GOOGLE_ID,
            clientSecret: env.AUTH_GOOGLE_SECRET,
            allowDangerousEmailAccountLinking: true,
          }),
        ]
      : []),
  ],
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
