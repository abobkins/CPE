import { NextRequest, NextResponse } from "next/server";
import { db, ensureDatabaseReady } from "@/db";
import { foreignPartners } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await ensureDatabaseReady();
    const { id } = await params;
    const numId = parseInt(id, 10);
    if (isNaN(numId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const result = await db.select().from(foreignPartners).where(eq(foreignPartners.id, numId)).limit(1);
    if (result.length === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(result[0]);
  } catch (error: any) {
    console.error("Error in GET /api/foreign-partners/[id]:", error);
    return NextResponse.json({ error: error.message || "Unknown error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await ensureDatabaseReady();
    const { id } = await params;
    const numId = parseInt(id, 10);
    if (isNaN(numId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const body = await req.json();

    const allowedFields = ["companyName", "country", "contactPerson", "phone", "email", "website", "productInterests", "notes"];
    const updates: Record<string, any> = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    updates.updatedAt = new Date();

    const result = await db.update(foreignPartners)
      .set(updates)
      .where(eq(foreignPartners.id, numId))
      .returning();

    if (result.length === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(result[0]);
  } catch (error: any) {
    console.error("Error in PATCH /api/foreign-partners/[id]:", error);
    return NextResponse.json({ error: error.message || "Unknown error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await ensureDatabaseReady();
    const { id } = await params;
    const numId = parseInt(id, 10);
    if (isNaN(numId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const result = await db.delete(foreignPartners).where(eq(foreignPartners.id, numId)).returning();
    if (result.length === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error in DELETE /api/foreign-partners/[id]:", error);
    return NextResponse.json({ error: error.message || "Unknown error" }, { status: 500 });
  }
}
