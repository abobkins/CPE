import { NextRequest, NextResponse } from "next/server";
import { db, ensureDatabaseReady } from "@/db";
import { events, eventMeetings } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await ensureDatabaseReady();
    const { id } = await params;
    const numId = parseInt(id, 10);
    if (isNaN(numId)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

    const body = await req.json();
    const allowed = ["name", "serviceType", "serviceCategory", "country", "status", "notes"];
    const updates: Record<string, any> = {};
    for (const f of allowed) if (body[f] !== undefined) updates[f] = body[f];
    if (Object.keys(updates).length === 0) return NextResponse.json({ error: "No fields" }, { status: 400 });
    updates.updatedAt = new Date();

    const result = await db.update(events).set(updates).where(eq(events.id, numId)).returning();
    if (result.length === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(result[0]);
  } catch (error: any) {
    console.error("Error in PATCH /api/events/[id]:", error);
    return NextResponse.json({ error: error.message || "Unknown error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await ensureDatabaseReady();
    const { id } = await params;
    const numId = parseInt(id, 10);
    if (isNaN(numId)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

    await db.delete(eventMeetings).where(eq(eventMeetings.eventId, numId));
    await db.delete(events).where(eq(events.id, numId));
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error in DELETE /api/events/[id]:", error);
    return NextResponse.json({ error: error.message || "Unknown error" }, { status: 500 });
  }
}
