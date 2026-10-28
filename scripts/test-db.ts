import { config } from "dotenv";
import { PrismaNeon } from "@prisma/adapter-neon";

import { PrismaClient } from "../src/generated/prisma/client";

// Prisma 7 / Node do not load .env automatically — use dotenv.
config({ path: ".env.local" });
config({ path: ".env", override: true });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL is not set. Add it to .env (or .env.local) and try again."
  );
}

const prisma = new PrismaClient({
  adapter: new PrismaNeon({ connectionString }),
});

async function main() {
  console.log("Testing database connection...");

  const result = await prisma.$queryRaw<Array<{ ok: number }>>`SELECT 1 AS ok`;
  const itemTypeCount = await prisma.itemType.count();
  const userCount = await prisma.user.count();

  console.log(
    JSON.stringify(
      {
        ok: result[0]?.ok === 1,
        neonBranch: process.env.NEON_BRANCH ?? null,
        itemTypeCount,
        userCount,
      },
      null,
      2
    )
  );
}

main()
  .catch((error) => {
    console.error("Database test failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
