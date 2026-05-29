import { NextRequest, NextResponse } from "next/server";
import { db, ensureDatabaseReady } from "@/db";
import { eventsCalendar } from "@/db/schema";
import { eq, sql, desc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    await ensureDatabaseReady();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const fromDate = searchParams.get("fromDate") || "";
    const toDate = searchParams.get("toDate") || "";

    const all = await db.select().from(eventsCalendar).orderBy(desc(eventsCalendar.dateFrom));

    let filtered = all;

    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(e =>
        e.title.toLowerCase().includes(q) ||
        (e.description && e.description.toLowerCase().includes(q)) ||
        (e.location && e.location.toLowerCase().includes(q))
      );
    }

    if (status) {
      filtered = filtered.filter(e => e.status === status);
    }

    if (fromDate) {
      const from = new Date(fromDate);
      filtered = filtered.filter(e => new Date(e.dateFrom) >= from);
    }

    if (toDate) {
      const to = new Date(toDate);
      filtered = filtered.filter(e => new Date(e.dateFrom) <= to);
    }

    return NextResponse.json(filtered);
  } catch (error: any) {
    console.error("Error in GET /api/events-calendar:", error);
    return NextResponse.json({ error: error.message || "Unknown error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await ensureDatabaseReady();
    const body = await req.json();
    const {
      title, description, dateFrom, dateTo, location, organizer,
      imageUrl, registrationUrl, status,
    } = body;

    if (!title || !dateFrom) {
      return NextResponse.json({ error: "Название и дата начала обязательны" }, { status: 400 });
    }

    const inserted = await db.insert(eventsCalendar).values({
      title,
      description: description || null,
      dateFrom: new Date(dateFrom),
      dateTo: dateTo ? new Date(dateTo) : null,
      location: location || null,
      organizer: organizer || null,
      imageUrl: imageUrl || null,
      registrationUrl: registrationUrl || null,
      status: status || "published",
    }).returning();

    return NextResponse.json(inserted[0]);
  } catch (error: any) {
    console.error("Error in POST /api/events-calendar:", error);
    return NextResponse.json({ error: error.message || "Unknown error" }, { status: 500 });
  }
}
