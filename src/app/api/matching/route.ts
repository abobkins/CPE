import { NextRequest, NextResponse } from "next/server";
import { db, ensureDatabaseReady } from "@/db";
import { companies, foreignPartners, matches } from "@/db/schema";
import { eq, sql, and } from "drizzle-orm";

// Matching algorithm: compare foreign partner product interests with
// Russian companies by TN VED codes, sphere, and product keywords
function computeMatch(fp: any, co: any): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];

  // 1. TN VED code overlap
  const fpTnved = (fp.productInterests || "").toLowerCase();
  const coTnved = (co.tnved || "").toLowerCase();
  if (fpTnved && coTnved) {
    const fpCodes = fpTnved.split(",").map((s: string) => s.trim()).filter(Boolean);
    const coCodes = coTnved.split(",").map((s: string) => s.trim()).filter(Boolean);
    const overlap = fpCodes.filter((c: string) => coCodes.some((cc: string) => cc.includes(c) || c.includes(cc)));
    if (overlap.length > 0) {
      score += overlap.length * 30;
      reasons.push(`Совпадение кодов ТН ВЭД: ${overlap.join(", ")}`);
    }
  }

  // 2. Sphere match by product interests keywords
  const fpText = (fp.productInterests || "").toLowerCase();
  const coSphere = (co.sphere || "").toLowerCase();
  const coProducts = (co.products || "").toLowerCase();
  const coMainActivity = (co.mainActivity || "").toLowerCase();

  // Agro keywords
  const agroKeywords = ["агро", "сельск", "пищев", "продовольств", "зерн", "мук", "масл", "молок", "мяс", "рыб", "фрукт", "овощ", "сахар", "напит", "кондитер"];
  const industryKeywords = ["промыш", "машин", "оборуд", "металл", "электро", "хими", "нефт", "газ", "строитель", "текстиль", "одежд", "кож", "дерев", "мебель"];

  const isAgro = agroKeywords.some(k => fpText.includes(k));
  const isIndustry = industryKeywords.some(k => fpText.includes(k));

  if (isAgro && coSphere === "АПК") {
    score += 20;
    reasons.push("Совпадение сферы: АПК");
  } else if (isIndustry && coSphere === "Промышленность") {
    score += 20;
    reasons.push("Совпадение сферы: Промышленность");
  } else if (!isAgro && !isIndustry) {
    // General match — give partial score for sphere neutrality
    if (coSphere === "Прочие") {
      score += 5;
    }
  }

  // 3. Keyword match in company products / main activity
  const keywords = fpText
    .split(/[\s,;.]+/)
    .filter((k: string) => k.length > 3)
    .map((k: string) => k.toLowerCase().replace(/[^\wа-яё]/g, ""));

  const matchTargets = [coProducts, coMainActivity, coSphere].join(" ").toLowerCase();
  const matchedKeywords = keywords.filter((k: string) => matchTargets.includes(k));

  if (matchedKeywords.length > 0) {
    score += matchedKeywords.length * 10;
    reasons.push(`Совпадение по продукции/деятельности: ${matchedKeywords.slice(0, 3).join(", ")}${matchedKeywords.length > 3 ? "..." : ""}`);
  }

  // 4. Country-based logic: if foreign partner already imports from this company's export countries
  const coCountries = (co.exportCountries || "").toLowerCase();
  const fpCountry = (fp.country || "").toLowerCase();
  if (coCountries && fpCountry && coCountries.includes(fpCountry)) {
    score += 15;
    reasons.push(`Компания уже экспортирует в ${fp.country}`);
  }

  return { score: Math.min(100, score), reasons };
}

export async function GET(req: NextRequest) {
  try {
    await ensureDatabaseReady();
    const { searchParams } = new URL(req.url);
    const fpId = searchParams.get("foreignPartnerId");
    const status = searchParams.get("status") || "";
    const recalc = searchParams.get("recalc") === "true";

    // If recalc=true, drop all existing matches and recompute
    if (recalc) {
      await db.execute(sql`DELETE FROM matches`);
      const fpList = await db.select().from(foreignPartners);
      const coList = await db.select().from(companies);

      const insertValues: any[] = [];
      for (const fp of fpList) {
        for (const co of coList) {
          const { score, reasons } = computeMatch(fp, co);
          if (score >= 20) {
            insertValues.push({
              foreignPartnerId: fp.id,
              companyId: co.id,
              score,
              matchReason: reasons.join(". "),
              status: "new",
              notes: "",
            });
          }
        }
      }

      if (insertValues.length > 0) {
        for (const val of insertValues) {
          await db.insert(matches).values(val);
        }
      }
    }

    // Build query conditions
    const conditions = [];
    if (fpId) {
      conditions.push(eq(matches.foreignPartnerId, parseInt(fpId)));
    }
    if (status) {
      conditions.push(eq(matches.status, status));
    }

    const query = db.select().from(matches)
      .orderBy(sql`${matches.score} DESC`);

    if (conditions.length > 0) {
      (query as any).where(and(...conditions));
    }

    const allMatches = await query;

    // Join with foreign partners and companies for display
    const fpList = await db.select().from(foreignPartners);
    const coList = await db.select().from(companies);

    const fpMap = new Map(fpList.map(f => [f.id, f]));
    const coMap = new Map(coList.map(c => [c.id, c]));

    const enriched = allMatches.map(m => ({
      ...m,
      foreignPartner: fpMap.get(m.foreignPartnerId) || null,
      company: coMap.get(m.companyId) || null,
    }));

    return NextResponse.json(enriched);
  } catch (error: any) {
    console.error("Error in GET /api/matching:", error);
    return NextResponse.json({ error: error.message || "Unknown error" }, { status: 500 });
  }
}

// Update match status
export async function PATCH(req: NextRequest) {
  try {
    await ensureDatabaseReady();
    const body = await req.json();
    const { id, status, notes } = body;

    if (!id) {
      return NextResponse.json({ error: "Match ID required" }, { status: 400 });
    }

    const updateData: Record<string, any> = { updatedAt: new Date() };
    if (status) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;

    const result = await db.update(matches)
      .set(updateData)
      .where(eq(matches.id, parseInt(id)))
      .returning();

    return NextResponse.json(result[0] || { error: "Not found" });
  } catch (error: any) {
    console.error("Error in PATCH /api/matching:", error);
    return NextResponse.json({ error: error.message || "Unknown error" }, { status: 500 });
  }
}
