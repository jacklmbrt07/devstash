import { NextResponse } from "next/server";

import { db } from "@/prisma/db";

export async function GET() {
  try {
    const ping = db.raw
      .sql`SELECT 1::int AS ok`
      .returnsRow({ ok: "pg/int4@1" as const })
      .build();
    const result = await db.query(ping);
    const { total: itemTypeCount } = await db.orm.public.ItemType.aggregate(
      (agg) => ({ total: agg.count() })
    );

    return NextResponse.json({
      ok: Number(result[0]?.ok) === 1,
      neonBranch: process.env.NEON_BRANCH ?? null,
      itemTypeCount,
      prisma: "8",
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
