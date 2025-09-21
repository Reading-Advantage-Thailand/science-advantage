import { PrismaAdapter } from "@next-auth/prisma-adapter";
import type { DefaultSession, NextAuthOptions, Session } from "next-auth";
import { getServerSession } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

import { Role } from "@prisma/client";

import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { isDevAuthEnabled } from "@/lib/dev-auth";
import {
  ensureDevUser,
  getDevAuthCookie,
  toPrismaRole,
} from "@/lib/dev-auth.server";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
    } & DefaultSession["user"];
  }

  interface User {
    role: Role;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: Role;
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  secret: env.nextAuthSecret,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/signin",
  },
  providers: [
    GoogleProvider({
      clientId: env.googleClientId,
      clientSecret: env.googleClientSecret,
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }

      if (session.user && token.role) {
        session.user.role = token.role as Role;
      }

      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role: Role }).role ?? Role.STUDENT;
      }

      return token;
    },
  },
};

export const getServerAuthSession = async () => {
  const session = await getServerSession(authOptions);

  if (session?.user || !isDevAuthEnabled()) {
    return session;
  }

  const devOverride = await getDevAuthCookie();

  if (!devOverride) {
    return session;
  }

  await ensureDevUser(devOverride);

  const devSession: Session = {
    user: {
      id: devOverride.id,
      role: toPrismaRole(devOverride.role),
      name: devOverride.name,
      email: devOverride.email,
    },
    expires: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
  };

  return devSession;
};
