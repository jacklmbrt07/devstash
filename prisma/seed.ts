import { config } from "dotenv";

config({ path: ".env.local" });
config({ path: ".env", override: true });

const systemItemTypes = [
  { name: "snippet", icon: "Code", color: "#3b82f6", isSystem: true as const },
  { name: "prompt", icon: "Sparkles", color: "#8b5cf6", isSystem: true as const },
  { name: "command", icon: "Terminal", color: "#f97316", isSystem: true as const },
  { name: "note", icon: "StickyNote", color: "#fde047", isSystem: true as const },
  { name: "file", icon: "File", color: "#6b7280", isSystem: true as const },
  { name: "image", icon: "Image", color: "#ec4899", isSystem: true as const },
  { name: "link", icon: "Link", color: "#10b981", isSystem: true as const },
];

async function main() {
  const { db } = await import("../src/prisma/db");

  console.log("Seeding system item types...");

  for (const type of systemItemTypes) {
    const existing = await db.orm.public.ItemType.where({
      name: type.name,
      isSystem: true,
    })
      .where((row) => row.userId.isNull())
      .first();

    if (existing) {
      await db.orm.public.ItemType.where({ id: existing.id }).update({
        icon: type.icon,
        color: type.color,
        isSystem: true,
      });
      continue;
    }

    await db.orm.public.ItemType.create({
      name: type.name,
      icon: type.icon,
      color: type.color,
      isSystem: true,
      userId: null,
    });
  }

  const { total } = await db.orm.public.ItemType.where({
    isSystem: true,
  }).aggregate((agg) => ({ total: agg.count() }));

  console.log(`Seeding complete! System item types: ${total}`);
  await db.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
