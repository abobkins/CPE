import { NextRequest, NextResponse } from "next/server";
import { db, ensureDatabaseReady } from "@/db";
import { applications } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureDatabaseReady();
    const { id } = await params;
    const appId = parseInt(id, 10);
    if (isNaN(appId)) {
      return NextResponse.json({ error: "Некорректный ID" }, { status: 400 });
    }

    const data = await db.select().from(applications).where(eq(applications.id, appId)).limit(1);
    if (data.length === 0) {
      return NextResponse.json({ error: "Заявка не найдена" }, { status: 404 });
    }

    return NextResponse.json(data[0]);
  } catch (error: any) {
    console.error("Error in GET /api/applications/[id]:", error);
    return NextResponse.json({ error: error.message || "Unknown error" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureDatabaseReady();
    const { id } = await params;
    const appId = parseInt(id, 10);
    if (isNaN(appId)) {
      return NextResponse.json({ error: "Некорректный ID" }, { status: 400 });
    }

    const body = await req.json();
    const allowedFields = [
      "status", "assignedTo", "comment", "processedAt", "processedBy",
      "companyId", "companyName", "companyInn", "contactName", "contactPhone",
      "contactEmail", "subject", "message", "source", "sourceUrl"
    ];

    const updates: any = { updatedAt: new Date() };
    for (const f of allowedFields) {
      if (body[f] !== undefined) {
        updates[f] = body[f];
      }
    }

    if (body.status === "in_progress" || body.status === "completed" || body.status === "rejected") {
      updates.processedAt = new Date().toISOString();
      updates.processedBy = body.processedBy || "Менеджер";
    }

    const res = await db.update(applications)
      .set(updates)
      .where(eq(applications.id, appId))
      .returning();

    if (res.length === 0) {
      return NextResponse.json({ error: "Заявка не найдена" }, { status: 404 });
    }

    return NextResponse.json(res[0]);
  } catch (error: any) {
    console.error("Error in PUT /api/applications/[id]:", error);
    return NextResponse.json({ error: error.message || "Unknown error" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureDatabaseReady();
    const { id } = await params;
    const appId = parseInt(id, 10);
    if (isNaN(appId)) {
      return NextResponse.json({ error: "Некорректный ID" }, { status: 400 });
    }

    const res = await db.delete(applications).where(eq(applications.id, appId)).returning();
    if (res.length === 0) {
      return NextResponse.json({ error: "Заявка не найдена" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Заявка успешно удалена" });
  } catch (error: any) {
    console.error("Error in DELETE /api/applications/[id]:", error);
    return NextResponse.json({ error: error.message || "Unknown error" }, { status: 500 });
  }
}
