import { config } from "dotenv";

// Intentionally never loads `.env.production`.
config({ path: ".env.local" });
config({ path: ".env", override: true });

const DEMO_USER_EMAIL = "demo@devstash.io";
const ALLOWED_BRANCH = "development";

function envValue(name: string): string {
  return (process.env[name] ?? "").trim().replace(/^["']|["']$/g, "");
}

function assertDevelopmentOnly() {
  const branch = envValue("NEON_BRANCH");
  const nodeEnv = envValue("NODE_ENV");

  if (nodeEnv === "production") {
    throw new Error(
      "Refusing to run: NODE_ENV=production. This script is development-only.",
    );
  }

  if (branch !== ALLOWED_BRANCH) {
    throw new Error(
      `Refusing to run: NEON_BRANCH must be "${ALLOWED_BRANCH}" (got "${branch || "(unset)"}"). This script never runs against production.`,
    );
  }
}

async function main() {
  assertDevelopmentOnly();

  const { db } = await import("../src/prisma/db");

  console.log(`Keeping user: ${DEMO_USER_EMAIL}`);
  console.log(`Neon branch: ${envValue("NEON_BRANCH")}`);

  const demo = await db.orm.public.User.where({
    email: DEMO_USER_EMAIL,
  }).first();
  if (!demo) {
    throw new Error(
      `Demo user ${DEMO_USER_EMAIL} was not found. Aborting so content is not wiped by mistake.`,
    );
  }

  const before = await db.orm.public.User.aggregate((agg) => ({
    total: agg.count(),
  }));

  const toDelete = await db.orm.public.User.where((user) =>
    user.email.neq(DEMO_USER_EMAIL),
  )
    .select("id", "email")
    .all();

  console.log(
    `Found ${toDelete.length} non-demo user(s) of ${before.total} total.`,
  );

  for (const user of toDelete) {
    // VerificationToken has no primary key, so ORM delete-by-identifier fails.
    // Tokens are keyed by email (identifier), not userId.
    const deleteTokens = db.raw.sql`
      DELETE FROM verification_tokens
      WHERE identifier = ${user.email}
    `
      .affectedCount()
      .build();
    await db.execute(deleteTokens);

    // Cascades remove accounts, sessions, collections, items, joins, and
    // user-owned item types.
    await db.orm.public.User.where({ id: user.id }).delete();
    console.log(`Deleted ${user.email} (${user.id})`);
  }

  // Drop tags that nothing references after non-demo items were removed.
  const orphanTags = db.raw.sql`
    DELETE FROM tags
    WHERE id NOT IN (SELECT DISTINCT "B" FROM "_ItemTags")
    RETURNING id, name
  `
    .returnsRow({
      id: "pg/text@1" as const,
      name: "pg/text@1" as const,
    })
    .build();
  const removedTags = await db.query(orphanTags);
  if (removedTags.length > 0) {
    console.log(
      `Removed ${removedTags.length} orphan tag(s): ${removedTags
        .map((tag) => tag.name)
        .join(", ")}`,
    );
  }

  const after = await db.orm.public.User.aggregate((agg) => ({
    total: agg.count(),
  }));
  const demoItems = await db.orm.public.Item.where({
    userId: demo.id,
  }).aggregate((agg) => ({ total: agg.count() }));
  const demoCollections = await db.orm.public.Collection.where({
    userId: demo.id,
  }).aggregate((agg) => ({ total: agg.count() }));

  console.log(
    JSON.stringify(
      {
        ok: true,
        usersRemaining: after.total,
        demoEmail: demo.email,
        demoItemCount: demoItems.total,
        demoCollectionCount: demoCollections.total,
        usersDeleted: toDelete.length,
      },
      null,
      2,
    ),
  );

  await db.close();
}

main().catch((error) => {
  console.error("Cleanup failed:", error);
  process.exit(1);
});
