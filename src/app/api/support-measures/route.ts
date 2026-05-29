import { NextRequest, NextResponse } from "next/server";
import { db, ensureDatabaseReady } from "@/db";
import { supportMeasures } from "@/db/schema";
import { eq, sql, desc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    await ensureDatabaseReady();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const personCategory = searchParams.get("personCategory") || "";
    const status = searchParams.get("status") || "";

    const all = await db.select().from(supportMeasures).orderBy(desc(supportMeasures.createdAt));

    let filtered = all;

    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(s =>
        s.title.toLowerCase().includes(q) ||
        (s.description && s.description.toLowerCase().includes(q))
      );
    }

    if (category) {
      filtered = filtered.filter(s => s.category === category);
    }

    if (personCategory) {
      filtered = filtered.filter(s => s.personCategory === personCategory);
    }

    if (status) {
      filtered = filtered.filter(s => s.status === status);
    }

    return NextResponse.json(filtered);
  } catch (error: any) {
    console.error("Error in GET /api/support-measures:", error);
    return NextResponse.json({ error: error.message || "Unknown error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await ensureDatabaseReady();
    const body = await req.json();
    const { title, description, category, personCategory, amount, deadline, body: htmlBody, sourceUrl } = body;

    if (!title) {
      return NextResponse.json({ error: "Название меры поддержки обязательно" }, { status: 400 });
    }

    const inserted = await db.insert(supportMeasures).values({
      title,
      description: description || null,
      category: category || null,
      personCategory: personCategory || null,
      amount: amount || null,
      deadline: deadline || null,
      body: htmlBody || null,
      sourceUrl: sourceUrl || null,
    }).returning();

    return NextResponse.json(inserted[0]);
  } catch (error: any) {
    console.error("Error in POST /api/support-measures:", error);
    return NextResponse.json({ error: error.message || "Unknown error" }, { status: 500 });
  }
}
