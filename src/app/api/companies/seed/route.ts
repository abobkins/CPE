import { NextRequest, NextResponse } from "next/server";
import { seedDatabase } from "@/db/seed-data";
import { db, ensureDatabaseReady } from "@/db";
import { foreignPartners, companies } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

function computeMatch(fp: any, co: any): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];
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
  const fpText = (fp.productInterests || "").toLowerCase();
  const coSphere = (co.sphere || "").toLowerCase();
  const agroKeywords = ["агро", "сельск", "пищев", "продовольств", "зерн", "мук", "масл", "молок", "мяс", "рыб", "фрукт", "овощ", "сахар", "напит", "кондитер"];
  const industryKeywords = ["промыш", "машин", "оборуд", "металл", "электро", "хими", "нефт", "газ", "строитель", "текстиль", "одежд", "кож", "дерев", "мебель"];
  const isAgro = agroKeywords.some(k => fpText.includes(k));
  const isIndustry = industryKeywords.some(k => fpText.includes(k));
  if (isAgro && coSphere === "АПК") { score += 20; reasons.push("Совпадение сферы: АПК"); }
  else if (isIndustry && coSphere === "Промышленность") { score += 20; reasons.push("Совпадение сферы: Промышленность"); }
  const keywords = fpText.split(/[\s,;.]+/).filter((k: string) => k.length > 3).map((k: string) => k.toLowerCase().replace(/[^\wа-яё]/g, ""));
  const matchTargets = [co.products || "", co.mainActivity || "", coSphere].join(" ").toLowerCase();
  const matchedKeywords = keywords.filter((k: string) => matchTargets.includes(k));
  if (matchedKeywords.length > 0) {
    score += matchedKeywords.length * 10;
    reasons.push(`Совпадение по продукции: ${matchedKeywords.slice(0, 3).join(", ")}${matchedKeywords.length > 3 ? "..." : ""}`);
  }
  return { score: Math.min(100, score), reasons };
}

export async function POST(req: NextRequest) {
  try {
    await ensureDatabaseReady();
    const seedResult = await seedDatabase(true);

    // Auto-recalculate matches
    await db.execute(sql`DELETE FROM matches`);
    const fpList = await db.select().from(foreignPartners);
    const coList = await db.select().from(companies);
    let matchCount = 0;
    for (const fp of fpList) {
      for (const co of coList) {
        const { score, reasons } = computeMatch(fp, co);
        if (score >= 20) {
          await db.insert(require("@/db/schema").matches).values({
            foreignPartnerId: fp.id,
            companyId: co.id,
            score,
            matchReason: reasons.join(". "),
            status: "new",
            notes: "",
          });
          matchCount++;
        }
      }
    }

    return NextResponse.json({
      ...seedResult,
      matchCount,
      message: `База данных успешно перезапущена. Найдено совпадений: ${matchCount}`,
    });
  } catch (error: any) {
    console.error("Error in POST /api/companies/seed:", error);
    return NextResponse.json({ error: error.message || "Unknown error" }, { status: 500 });
  }
}
