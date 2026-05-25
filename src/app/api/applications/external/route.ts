import { NextRequest, NextResponse } from "next/server";
import { db, ensureDatabaseReady } from "@/db";
import { applications } from "@/db/schema";

export async function POST(req: NextRequest) {
  try {
    await ensureDatabaseReady();

    const body = await req.json();
    const { companyName, companyInn, contactName, contactPhone, contactEmail, subject, message, source, sourceUrl } = body;

    if (!companyName || !subject) {
      return NextResponse.json(
        { error: "Поля companyName и subject обязательны" },
        { status: 400 }
      );
    }

    const inserted = await db.insert(applications).values({
      source: source || "external",
      sourceUrl: sourceUrl || "",
      companyName,
      companyInn: companyInn || "",
      contactName: contactName || "",
      contactPhone: contactPhone || "",
      contactEmail: contactEmail || "",
      subject,
      message: message || "",
      status: "new",
      rawData: body,
    }).returning();

    return NextResponse.json({
      success: true,
      id: inserted[0].id,
      message: "Заявка успешно принята",
    }, { status: 201 });
  } catch (error: any) {
    console.error("Error in POST /api/applications/external:", error);
    return NextResponse.json({ error: error.message || "Unknown error" }, { status: 500 });
  }
}
