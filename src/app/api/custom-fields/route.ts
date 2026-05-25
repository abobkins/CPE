import { NextRequest, NextResponse } from "next/server";
import { db, ensureDatabaseReady } from "@/db";
import { customFieldDefinitions } from "@/db/schema";
import { sql } from "drizzle-orm";
import { seedDatabase } from "@/db/seed-data";

export async function GET(req: NextRequest) {
  try {
    await ensureDatabaseReady();
    // Check if seeding is needed for definitions
    const definitions = await db.select().from(customFieldDefinitions);
    if (definitions.length === 0) {
      await seedDatabase();
      const updated = await db.select().from(customFieldDefinitions);
      return NextResponse.json(updated);
    }
    return NextResponse.json(definitions);
  } catch (error: any) {
    console.error("Error in GET /api/custom-fields:", error);
    return NextResponse.json({ error: error.message || "Unknown error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await ensureDatabaseReady();
    const body = await req.json();
    const { key, label, type } = body;

    if (!key || !label) {
      return NextResponse.json({ error: "Ключ и название поля обязательны" }, { status: 400 });
    }

    // Sanitize key (only alphanumeric and underscores)
    const sanitizedKey = key.trim().toLowerCase().replace(/[^a-z0-9_]/g, "_");

    if (!sanitizedKey) {
      return NextResponse.json({ error: "Недопустимый формат ключа" }, { status: 400 });
    }

    const inserted = await db.insert(customFieldDefinitions).values({
      key: sanitizedKey,
      label: label.trim(),
      type: type || "text",
    }).returning();

    return NextResponse.json(inserted[0]);
  } catch (error: any) {
    console.error("Error in POST /api/custom-fields:", error);
    return NextResponse.json({ error: error.message || "Unknown error" }, { status: 500 });
  }
}
