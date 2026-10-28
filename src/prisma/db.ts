import { config } from "dotenv";
import postgres from "@prisma/orm-postgres/runtime";
import { contractFromJson } from "@prisma/orm-postgres/static";

import type { Contract } from "./contract.d";
import contractJson from "./contract.json" with { type: "json" };

config({ path: ".env.local" });
config({ path: ".env", override: true });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

export const contract = contractFromJson<Contract>(contractJson);

function createDb() {
  return postgres({
    contract,
    url: connectionString,
  });
}

export type Db = ReturnType<typeof createDb>;

const globalForDb = globalThis as unknown as {
  prismaDb: Db | undefined;
};

export const db = globalForDb.prismaDb ?? createDb();

if (process.env.NODE_ENV !== "production") {
  globalForDb.prismaDb = db;
}
