import { NextRequest, NextResponse } from "next/server";
import { seedDatabase } from "@/db/seed-data";

export async function POST(req: NextRequest) {
  try {
    const result = await seedDatabase(true);
    return NextResponse.json({ ...result, message: "База данных успешно перезапущена и засеяна демонстрационными данными" });
  } catch (error: any) {
    console.error("Error in POST /api/companies/seed:", error);
    return NextResponse.json({ error: error.message || "Unknown error" }, { status: 500 });
  }
}
