import { NextRequest, NextResponse } from "next/server";
import { db, ensureDatabaseReady } from "@/db";
import { eventsCalendar } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await ensureDatabaseReady();
    const { id: idStr } = await params;
    const id = parseInt(idStr, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: "Неверный ID" }, { status: 400 });
    }

    const result = await db.select().from(eventsCalendar).where(eq(eventsCalendar.id, id)).limit(1);
    if (result.length === 0) {
      return NextResponse.json({ error: "Не найдено" }, { status: 404 });
    }

    return NextResponse.json(result[0]);
  } catch (error: any) {
    console.error("Error in GET /api/events-calendar/[id]:", error);
    return NextResponse.json({ error: error.message || "Unknown error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await ensureDatabaseReady();
    const { id: idStr } = await params;
    const id = parseInt(idStr, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: "Неверный ID" }, { status: 400 });
    }

    const body = await req.json();

    const existing = await db.select().from(eventsCalendar).where(eq(eventsCalendar.id, id)).limit(1);
    if (existing.length === 0) {
      return NextResponse.json({ error: "Не найдено" }, { status: 404 });
    }

    const updateData: any = {
      ...body,
      updatedAt: new Date(),
    };

    if (body.dateFrom) updateData.dateFrom = new Date(body.dateFrom);
    if (body.dateTo) updateData.dateTo = new Date(body.dateTo);

    delete updateData.id;
    delete updateData.createdAt;

    const result = await db.update(eventsCalendar)
      .set(updateData)
      .where(eq(eventsCalendar.id, id))
      .returning();

    return NextResponse.json(result[0]);
  } catch (error: any) {
    console.error("Error in PUT /api/events-calendar/[id]:", error);
    return NextResponse.json({ error: error.message || "Unknown error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await ensureDatabaseReady();
    const { id: idStr } = await params;
    const id = parseInt(idStr, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: "Неверный ID" }, { status: 400 });
    }

    const existing = await db.select().from(eventsCalendar).where(eq(eventsCalendar.id, id)).limit(1);
    if (existing.length === 0) {
      return NextResponse.json({ error: "Не найдено" }, { status: 404 });
    }

    await db.delete(eventsCalendar).where(eq(eventsCalendar.id, id));
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error in DELETE /api/events-calendar/[id]:", error);
    return NextResponse.json({ error: error.message || "Unknown error" }, { status: 500 });
  }
}
