import { NextRequest, NextResponse } from "next/server";
import { db, ensureDatabaseReady } from "@/db";
import { foreignPartners } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    await ensureDatabaseReady();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const country = searchParams.get("country") || "";

    const all = await db.select().from(foreignPartners).orderBy(sql`${foreignPartners.companyName} ASC`);

    let filtered = all;

    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(p =>
        p.companyName.toLowerCase().includes(q) ||
        p.contactPerson.toLowerCase().includes(q) ||
        p.productInterests.toLowerCase().includes(q) ||
        p.notes.toLowerCase().includes(q)
      );
    }

    if (country) {
      filtered = filtered.filter(p => p.country === country);
    }

    return NextResponse.json(filtered);
  } catch (error: any) {
    console.error("Error in GET /api/foreign-partners:", error);
    return NextResponse.json({ error: error.message || "Unknown error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await ensureDatabaseReady();
    const body = await req.json();
    const { companyName, country, contactPerson, phone, email, website, productInterests, notes } = body;

    if (!companyName || !country) {
      return NextResponse.json({ error: "Название компании и страна обязательны" }, { status: 400 });
    }

    const inserted = await db.insert(foreignPartners).values({
      companyName,
      country,
      contactPerson: contactPerson || "",
      phone: phone || "",
      email: email || "",
      website: website || "",
      productInterests: productInterests || "",
      notes: notes || "",
    }).returning();

    return NextResponse.json(inserted[0]);
  } catch (error: any) {
    console.error("Error in POST /api/foreign-partners:", error);
    return NextResponse.json({ error: error.message || "Unknown error" }, { status: 500 });
  }
}
