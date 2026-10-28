import { config } from "dotenv";
import { PrismaNeon } from "@prisma/adapter-neon";

import { PrismaClient } from "../src/generated/prisma/client";

config({ path: ".env.local" });
config({ path: ".env", override: true });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const prisma = new PrismaClient({
  adapter: new PrismaNeon({ connectionString }),
});

const systemItemTypes = [
  { name: "snippet", icon: "Code", color: "#3b82f6", isSystem: true },
  { name: "prompt", icon: "Sparkles", color: "#8b5cf6", isSystem: true },
  { name: "command", icon: "Terminal", color: "#f97316", isSystem: true },
  { name: "note", icon: "StickyNote", color: "#fde047", isSystem: true },
  { name: "file", icon: "File", color: "#6b7280", isSystem: true },
  { name: "image", icon: "Image", color: "#ec4899", isSystem: true },
  { name: "link", icon: "Link", color: "#10b981", isSystem: true },
] as const;

async function main() {
  console.log("Seeding system item types...");

  for (const type of systemItemTypes) {
    const existing = await prisma.itemType.findFirst({
      where: { name: type.name, userId: null, isSystem: true },
    });

    if (existing) {
      await prisma.itemType.update({
        where: { id: existing.id },
        data: {
          icon: type.icon,
          color: type.color,
          isSystem: true,
        },
      });
      continue;
    }

    await prisma.itemType.create({
      data: {
        name: type.name,
        icon: type.icon,
        color: type.color,
        isSystem: true,
        userId: null,
      },
    });
  }

  const count = await prisma.itemType.count({ where: { isSystem: true } });
  console.log(`Seeding complete! System item types: ${count}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
