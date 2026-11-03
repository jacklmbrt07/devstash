// @auth/prisma-adapter types import PrismaClient. This app uses Prisma 8,
// so the classic client is not installed. The runtime client is authPrisma.
declare module "@prisma/client" {
  export interface PrismaClient {
    $extends?(...args: unknown[]): PrismaClient;
  }
}
