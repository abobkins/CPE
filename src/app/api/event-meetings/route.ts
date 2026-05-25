import { NextRequest, NextResponse } from "next/server";
import { db, ensureDatabaseReady } from "@/db";
import { eventMeetings } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    await ensureDatabaseReady();
    const body = await req.json();
    const { eventId, companyId, foreignPartnerId, notes } = body;

    if (!eventId || !companyId || !foreignPartnerId) {
      return NextResponse.json({ error: "eventId, companyId, foreignPartnerId required" }, { status: 400 });
    }

    const inserted = await db.insert(eventMeetings).values({
      eventId,
      companyId,
      foreignPartnerId,
      matchScore: 0,
      matchType: "manual",
      status: "suggested",
      stage: "selected",
      assignedEmployee: "",
      notes: notes || "Добавлено вручную",
    }).returning();

    return NextResponse.json(inserted[0]);
  } catch (error: any) {
    console.error("Error in POST /api/event-meetings:", error);
    return NextResponse.json({ error: error.message || "Unknown error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await ensureDatabaseReady();
    const body = await req.json();
    const { id, status, notes } = body;

    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    const updates: Record<string, any> = { updatedAt: new Date() };
    if (status) updates.status = status;
    if (body.stage) updates.stage = body.stage;
    if (body.assignedEmployee !== undefined) updates.assignedEmployee = body.assignedEmployee;
    if (notes !== undefined) updates.notes = notes;

    const result = await db.update(eventMeetings).set(updates).where(eq(eventMeetings.id, parseInt(id))).returning();
    return NextResponse.json(result[0] || { error: "Not found" });
  } catch (error: any) {
    console.error("Error in PATCH /api/event-meetings:", error);
    return NextResponse.json({ error: error.message || "Unknown error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { id } = body;
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
    await db.delete(eventMeetings).where(eq(eventMeetings.id, parseInt(id)));
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error in DELETE /api/event-meetings:", error);
    return NextResponse.json({ error: error.message || "Unknown error" }, { status: 500 });
  }
}
