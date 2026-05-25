import { NextRequest, NextResponse } from "next/server";
import { db, ensureDatabaseReady } from "@/db";
import { kpiTargets } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export async function GET() {
  try {
    await ensureDatabaseReady();
    let targets = await db.select().from(kpiTargets).orderBy(sql`${kpiTargets.year} DESC`).limit(1);

    if (targets.length === 0) {
      const inserted = await db.insert(kpiTargets).values({
        year: new Date().getFullYear(),
        supportedExportVolume: 500,
        countryDiversification: 15,
        newExporters: 10,
      }).returning();
      targets = inserted;
    }

    return NextResponse.json(targets[0]);
  } catch (error: any) {
    console.error("Error in GET /api/kpi-targets:", error);
    return NextResponse.json({ error: error.message || "Unknown error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await ensureDatabaseReady();
    const body = await req.json();
    const { year, supportedExportVolume, countryDiversification, newExporters } = body;

    if (!year) {
      return NextResponse.json({ error: "Год обязателен" }, { status: 400 });
    }

    const existing = await db.select().from(kpiTargets).where(eq(kpiTargets.year, year)).limit(1);

    let result;
    if (existing.length > 0) {
      result = await db.update(kpiTargets)
        .set({
          supportedExportVolume: Number(supportedExportVolume) || 500,
          countryDiversification: Number(countryDiversification) || 15,
          newExporters: Number(newExporters) || 10,
          updatedAt: new Date(),
        })
        .where(eq(kpiTargets.year, year))
        .returning();
    } else {
      result = await db.insert(kpiTargets).values({
        year,
        supportedExportVolume: Number(supportedExportVolume) || 500,
        countryDiversification: Number(countryDiversification) || 15,
        newExporters: Number(newExporters) || 10,
      }).returning();
    }

    return NextResponse.json(result[0]);
  } catch (error: any) {
    console.error("Error in PUT /api/kpi-targets:", error);
    return NextResponse.json({ error: error.message || "Unknown error" }, { status: 500 });
  }
}
