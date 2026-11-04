import { PrismaAdapter } from "@auth/prisma-adapter";
import type { PrismaClient } from "@prisma/client";
import { compare } from "bcryptjs";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

import { authConfig } from "@/auth.config";
import { EmailNotVerifiedError } from "@/lib/auth/errors";
import { authPrisma } from "@/lib/auth-prisma";
import { db } from "@/prisma/db";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  // authPrisma implements the adapter calls with the Prisma 8 client.
  adapter: PrismaAdapter(authPrisma as unknown as PrismaClient),
  session: { strategy: "jwt" },
  providers: [
    ...authConfig.providers.filter(
      (provider) =>
        typeof provider === "function" || provider.id !== "credentials",
    ),
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email =
          typeof credentials.email === "string"
            ? credentials.email.trim().toLowerCase()
            : "";
        const password =
          typeof credentials.password === "string" ? credentials.password : "";
        if (!email || !password) return null;

        const user = await db.orm.public.User.where({ email }).first();
        if (!user?.password) return null;

        const valid = await compare(password, user.password);
        if (!valid) return null;

        if (!user.emailVerified) {
          throw new EmailNotVerifiedError();
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
  ],
});
