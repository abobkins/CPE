import { NextRequest, NextResponse } from "next/server";
import { db, ensureDatabaseReady } from "@/db";
import { applications } from "@/db/schema";
import { eq, sql, desc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    await ensureDatabaseReady();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "";
    const search = searchParams.get("search") || "";
    const source = searchParams.get("source") || "";

    const allApps = await db.select().from(applications).orderBy(desc(applications.createdAt));

    let filtered = allApps;

    if (status) {
      filtered = filtered.filter(a => a.status === status);
    }
    if (source) {
      filtered = filtered.filter(a => a.source === source);
    }
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(a =>
        (a.companyName && a.companyName.toLowerCase().includes(q)) ||
        (a.companyInn && a.companyInn.includes(q)) ||
        (a.contactName && a.contactName.toLowerCase().includes(q)) ||
        (a.subject && a.subject.toLowerCase().includes(q)) ||
        (a.message && a.message.toLowerCase().includes(q))
      );
    }

    return NextResponse.json(filtered);
  } catch (error: any) {
    console.error("Error in GET /api/applications:", error);
    return NextResponse.json({ error: error.message || "Unknown error" }, { status: 500 });
  }
}
