import { config } from "dotenv";

config({ path: ".env.local" });
config({ path: ".env", override: true });

async function main() {
  const { db } = await import("../src/prisma/db");

  console.log("Testing database connection (Prisma 8)...");

  const ping = db.raw
    .sql`SELECT 1::int AS ok`
    .returnsRow({ ok: "pg/int4@1" as const })
    .build();
  const result = await db.query(ping);

  const itemTypeStats = await db.orm.public.ItemType.aggregate((agg) => ({
    total: agg.count(),
  }));
  const userStats = await db.orm.public.User.aggregate((agg) => ({
    total: agg.count(),
  }));

  console.log(
    JSON.stringify(
      {
        ok: Number(result[0]?.ok) === 1,
        prisma: "8",
        neonBranch: process.env.NEON_BRANCH ?? null,
        itemTypeCount: itemTypeStats.total,
        userCount: userStats.total,
      },
      null,
      2
    )
  );

  await db.close();
}

main().catch((error) => {
  console.error("Database test failed:", error);
  process.exit(1);
});
