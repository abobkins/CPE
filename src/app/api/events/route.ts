import { NextRequest, NextResponse } from "next/server";
import { db, ensureDatabaseReady } from "@/db";
import { events, companies, foreignPartners, eventMeetings } from "@/db/schema";
import { eq, sql, and } from "drizzle-orm";

function computeMatchScore(co: any, fp: any, serviceCountry: string): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];

  // TN VED
  const fpTnved = (fp.productInterests || "").toLowerCase();
  const coTnved = (co.tnved || "").toLowerCase();
  if (fpTnved && coTnved) {
    const fpCodes = fpTnved.split(",").map((s: string) => s.trim()).filter(Boolean);
    const coCodes = coTnved.split(",").map((s: string) => s.trim()).filter(Boolean);
    const overlap = fpCodes.filter((c: string) => coCodes.some((cc: string) => cc.includes(c) || c.includes(cc)));
    if (overlap.length > 0) {
      score += overlap.length * 25;
      reasons.push(`ТН ВЭД: ${overlap.join(", ")}`);
    }
  }

  // Sphere
  const fpText = (fp.productInterests || "").toLowerCase();
  const coSphere = (co.sphere || "").toLowerCase();
  const agroK = ["агро", "сельск", "пищев", "продовольств", "зерн", "мук", "масл", "молок", "мяс", "рыб", "фрукт", "овощ"];
  const indK = ["промыш", "машин", "оборуд", "металл", "электро", "хими", "строитель", "текстиль", "дерев", "мебель"];
  if (agroK.some(k => fpText.includes(k)) && coSphere === "АПК") { score += 20; reasons.push("Сфера: АПК"); }
  else if (indK.some(k => fpText.includes(k)) && coSphere === "Промышленность") { score += 20; reasons.push("Сфера: Промышленность"); }

  // Product keywords
  const keywords = fpText.split(/[\s,;.]+/).filter((k: string) => k.length > 3);
  const matchTargets = [co.products || "", co.mainActivity || "", coSphere].join(" ").toLowerCase();
  const matched = keywords.filter((k: string) => matchTargets.includes(k.toLowerCase()));
  if (matched.length > 0) { score += matched.length * 10; reasons.push(`Продукция: ${matched.slice(0, 2).join(", ")}`); }

  // Country match: FP country matches service country
  if (fp.country && serviceCountry && fp.country.toLowerCase() === serviceCountry.toLowerCase()) {
    score += 15;
    reasons.push("Страна партнёра совпадает с мероприятием");
  }
  // Company already exports to this country
  const coCountries = (co.exportCountries || "").toLowerCase();
  if (serviceCountry && coCountries.includes(serviceCountry.toLowerCase())) {
    score += 10;
    reasons.push(`Уже экспортирует в ${serviceCountry}`);
  }

  return { score: Math.min(100, score), reasons };
}

export async function GET(req: NextRequest) {
  try {
    await ensureDatabaseReady();
    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get("eventId");

    if (eventId) {
      const ev = await db.select().from(events).where(eq(events.id, parseInt(eventId))).limit(1);
      if (ev.length === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });

      const meetings = await db.select().from(eventMeetings)
        .where(eq(eventMeetings.eventId, parseInt(eventId)))
        .orderBy(sql`${eventMeetings.matchScore} DESC`);

      const coList = await db.select().from(companies);
      const fpList = await db.select().from(foreignPartners);
      const coMap = new Map(coList.map(c => [c.id, c]));
      const fpMap = new Map(fpList.map(f => [f.id, f]));

      const enrichedMeetings = meetings.map(m => ({
        ...m,
        company: coMap.get(m.companyId) || null,
        foreignPartner: fpMap.get(m.foreignPartnerId) || null,
      }));

      return NextResponse.json({ event: ev[0], meetings: enrichedMeetings });
    }

    const all = await db.select().from(events).orderBy(sql`${events.createdAt} DESC`);
    return NextResponse.json(all);
  } catch (error: any) {
    console.error("Error in GET /api/events:", error);
    return NextResponse.json({ error: error.message || "Unknown error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await ensureDatabaseReady();
    const body = await req.json();
    const { name, serviceType, serviceCategory, country, notes } = body;

    if (!name || !serviceType || !country) {
      return NextResponse.json({ error: "Название, тип услуги и страна обязательны" }, { status: 400 });
    }

    const inserted = await db.insert(events).values({
      name,
      serviceType,
      serviceCategory: serviceCategory || "complex",
      country,
      status: "planned",
      notes: notes || "",
    }).returning();

    const ev = inserted[0];

    // Auto-generate meetings: match all companies with foreign partners from this country
    const coList = await db.select().from(companies);
    const fpList = await db.select().from(foreignPartners).where(eq(foreignPartners.country, country));

    if (fpList.length > 0) {
      for (const co of coList) {
        for (const fp of fpList) {
          const { score, reasons } = computeMatchScore(co, fp, country);
          if (score >= 15) {
            await db.insert(eventMeetings).values({
              eventId: ev.id,
              companyId: co.id,
              foreignPartnerId: fp.id,
              matchScore: score,
              matchType: "auto",
              status: "suggested",
              notes: reasons.join(". "),
            });
          }
        }
      }
    }

    return NextResponse.json(ev);
  } catch (error: any) {
    console.error("Error in POST /api/events:", error);
    return NextResponse.json({ error: error.message || "Unknown error" }, { status: 500 });
  }
}
