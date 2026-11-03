import { PrismaAdapter } from "@auth/prisma-adapter";
import type { PrismaClient } from "@prisma/client";
import NextAuth from "next-auth";

import { authConfig } from "@/auth.config";
import { authPrisma } from "@/lib/auth-prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  // authPrisma implements the adapter calls with the Prisma 8 client.
  adapter: PrismaAdapter(authPrisma as unknown as PrismaClient),
  session: { strategy: "jwt" },
});
