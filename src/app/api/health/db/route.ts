import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const result = await prisma.$queryRaw<Array<{ ok: number }>>`SELECT 1 AS ok`;
    const itemTypeCount = await prisma.itemType.count();

    return NextResponse.json({
      ok: result[0]?.ok === 1,
      neonBranch: process.env.NEON_BRANCH ?? null,
      itemTypeCount,
    });
  } catch (error) {
    console.error("Database health check failed:", error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown database error",
      },
      { status: 500 }
    );
  }
}
