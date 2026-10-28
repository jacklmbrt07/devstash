import { config } from "dotenv";
import { defineConfig, env } from "prisma/config";

// Load Neon-pulled vars first, then let `.env` override (dev branch URL, etc.).
config({ path: ".env.local" });
config({ path: ".env", override: true });

function resolveMigrationUrl(): string {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not set");
  }

  // Migrations must use a direct (non-pooled) Neon connection.
  if (databaseUrl.includes("-pooler.")) {
    return databaseUrl.replace("-pooler.", ".");
  }

  return process.env.DATABASE_URL_UNPOOLED ?? databaseUrl;
}

process.env.DATABASE_URL_UNPOOLED = resolveMigrationUrl();

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: env("DATABASE_URL_UNPOOLED"),
  },
});
