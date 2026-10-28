import { config } from "dotenv";
import { definePrismaConfig } from "prisma/config";
import { defineConfig as definePostgresConfig } from "@prisma/orm-postgres/config";

// Load Neon-pulled vars first, then let `.env` override (dev branch URL, etc.).
config({ path: ".env.local" });
config({ path: ".env", override: true });

function resolveMigrationUrl(): string {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not set");
  }

  // CLI / migrations need a direct (non-pooled) Neon connection.
  if (databaseUrl.includes("-pooler.")) {
    return databaseUrl.replace("-pooler.", ".");
  }

  return process.env.DATABASE_URL_UNPOOLED ?? databaseUrl;
}

export default definePrismaConfig({
  orm: definePostgresConfig({
    contract: "src/prisma/contract.prisma",
    output: "src/prisma",
    migrations: {
      dir: "migrations",
    },
    db: {
      connection: resolveMigrationUrl(),
    },
  }),
});
