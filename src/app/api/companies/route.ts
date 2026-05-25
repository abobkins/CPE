import { NextRequest, NextResponse } from "next/server";
import { db, ensureDatabaseReady } from "@/db";
import { companies } from "@/db/schema";
import { seedDatabase } from "@/db/seed-data";
import { eq, and, sql, or, like } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    await ensureDatabaseReady();
    // Check if seeding is needed
    const countResult = await db.execute(sql`SELECT count(*) FROM companies`);
    const countVal = parseInt((countResult.rows[0] as any)?.count || "0", 10);
    if (countVal === 0) {
      await seedDatabase();
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const sphere = searchParams.get("sphere") || "";
    const statusExporter = searchParams.get("statusExporter") || "";
    const cpeCooperation = searchParams.get("cpeCooperation") || "";
    const categoryMsp = searchParams.get("categoryMsp") || "";
    const needsUpdate = searchParams.get("needsUpdate") || "";
    const hasContacts = searchParams.get("hasContacts") || "";
    const tnved = searchParams.get("tnved") || "";

    // Fetch all companies to perform filtering on-memory if complex, 
    // but since we want to be fast and allow advanced search, let's fetch all or write queries.
    // Given 5000+ companies requirement, simple SQL or SQL conditions are great. Let's fetch all and filter in-memory 
    // or build a Drizzle query. In-memory filtering is extremely easy to expand for dynamic custom fields and and/or logic.
    // Let's load the list. Since we only have a few dozen in seed and 5000+ is standard, either works.
    // Let's do a select.
    const allCompanies = await db.select().from(companies).orderBy(sql`${companies.name} ASC`);

    let filtered = allCompanies;

    // Search query
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(c => 
        (c.name && c.name.toLowerCase().includes(q)) ||
        (c.inn && c.inn.includes(q)) ||
        (c.products && c.products.toLowerCase().includes(q)) ||
        (c.mainActivity && c.mainActivity.toLowerCase().includes(q)) ||
        (c.sector && c.sector.toLowerCase().includes(q)) ||
        (c.contactMinprom && c.contactMinprom.toLowerCase().includes(q)) ||
        (c.contactCpe && c.contactCpe.toLowerCase().includes(q)) ||
        (c.notes && c.notes.toLowerCase().includes(q)) ||
        (c.tnved && c.tnved.toLowerCase().includes(q))
      );
    }

    // Sphere filter
    if (sphere) {
      filtered = filtered.filter(c => c.sphere === sphere);
    }

    // Status Exporter filter
    if (statusExporter) {
      filtered = filtered.filter(c => c.statusExporter === statusExporter);
    }

    // CPE Cooperation filter
    if (cpeCooperation) {
      const isCpe = cpeCooperation === "true";
      filtered = filtered.filter(c => c.cpeCooperation === isCpe);
    }

    // Category MSP filter
    if (categoryMsp) {
      filtered = filtered.filter(c => c.categoryMsp === categoryMsp);
    }

    // Needs update filter
    if (needsUpdate) {
      const isNeed = needsUpdate === "true";
      filtered = filtered.filter(c => c.needsUpdate === isNeed);
    }

    // Has contacts filter
    if (hasContacts) {
      if (hasContacts === "true") {
        filtered = filtered.filter(c => (c.emailMinprom || c.phoneMinprom || c.emailCpe || c.phoneCpe));
      } else {
        filtered = filtered.filter(c => !(c.emailMinprom || c.phoneMinprom || c.emailCpe || c.phoneCpe));
      }
    }

    // TN VED filter
    if (tnved) {
      const q = tnved.toLowerCase().trim();
      filtered = filtered.filter(c => c.tnved && c.tnved.toLowerCase().includes(q));
    }

    return NextResponse.json(filtered);
  } catch (error: any) {
    console.error("Error in GET /api/companies:", error);
    return NextResponse.json({ error: error.message || "Unknown error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await ensureDatabaseReady();
    const body = await req.json();
    const {
      inn,
      name,
      statusExporter,
      cpeCooperation,
      mspStatus,
      categoryMsp,
      sphere,
      sector,
      mainActivity,
      products,
      emailMinprom,
      phoneMinprom,
      contactMinprom,
      emailCpe,
      phoneCpe,
      contactCpe,
      exportVolume2023,
      exportVolume2024,
      exportVolume2025,
      exportCountries,
      tnved,
      notes,
      customFields,
    } = body;

    if (!inn || !name) {
      return NextResponse.json({ error: "ИНН и Наименование компании обязательны" }, { status: 400 });
    }

    const systemLog = {
      timestamp: new Date().toISOString(),
      user: body.userName || "Менеджер",
      action: "Создание",
      details: "Компания добавлена вручную в CRM",
    };

    const inserted = await db.insert(companies).values({
      inn,
      name,
      statusExporter: statusExporter || "не экспортер",
      cpeCooperation: !!cpeCooperation,
      mspStatus: !!mspStatus,
      categoryMsp: categoryMsp || "Микро",
      sphere: sphere || "Прочие",
      sector: sector || "Не указана",
      mainActivity: mainActivity || "Не указан",
      products: products || "",
      emailMinprom: emailMinprom || "",
      phoneMinprom: phoneMinprom || "",
      contactMinprom: contactMinprom || "",
      emailCpe: emailCpe || "",
      phoneCpe: phoneCpe || "",
      contactCpe: contactCpe || "",
      exportVolume2023: Number(exportVolume2023) || 0,
      exportVolume2024: Number(exportVolume2024) || 0,
      exportVolume2025: Number(exportVolume2025) || 0,
      exportCountries: exportCountries || "",
      tnved: tnved || "",
      notes: notes || "",
      customFields: customFields || {},
      supportMeasures: [],
      interactions: [],
      tasks: [],
      changeLogs: [systemLog],
      needsUpdate: false,
    }).returning();

    return NextResponse.json(inserted[0]);
  } catch (error: any) {
    console.error("Error in POST /api/companies:", error);
    const causeMessage = error?.cause?.message || error?.cause?.detail || "";
    return NextResponse.json({
      error: [error.message, causeMessage].filter(Boolean).join("\nПричина PostgreSQL: ") || "Unknown error",
      cause: error?.cause || null,
    }, { status: 500 });
  }
}

// Bulk update or individual edit
export async function PUT(req: NextRequest) {
  try {
    await ensureDatabaseReady();
    const body = await req.json();
    const { companyIds, updates, userName } = body;

    if (!companyIds || !Array.isArray(companyIds) || companyIds.length === 0) {
      return NextResponse.json({ error: "companyIds array is required" }, { status: 400 });
    }

    const author = userName || "Администратор";
    const timestamp = new Date().toISOString();

    const updatedRecords = [];

    for (const id of companyIds) {
      // First, get the current record to generate correct audit log
      const existing = await db.select().from(companies).where(eq(companies.id, id)).limit(1);
      if (existing.length === 0) continue;

      const current = existing[0];
      const logDetails = Object.keys(updates)
        .map(key => `${key}: '${(current as any)[key]}' -> '${(updates as any)[key]}'`)
        .join(", ");

      const newLogEntry = {
        timestamp,
        user: author,
        action: "Массовое обновление",
        details: logDetails || "Обновление полей",
      };

      const updatedLogs = [...(current.changeLogs as any[]), newLogEntry];

      const updateData: any = {
        ...updates,
        changeLogs: updatedLogs,
        updatedAt: new Date(),
      };

      // Handle boolean Conversions
      if (updates.cpeCooperation !== undefined) {
        updateData.cpeCooperation = updates.cpeCooperation === "true" || updates.cpeCooperation === true;
      }
      if (updates.mspStatus !== undefined) {
        updateData.mspStatus = updates.mspStatus === "true" || updates.mspStatus === true;
      }
      if (updates.needsUpdate !== undefined) {
        updateData.needsUpdate = updates.needsUpdate === "true" || updates.needsUpdate === true;
      }

      const res = await db.update(companies)
        .set(updateData)
        .where(eq(companies.id, id))
        .returning();

      if (res.length > 0) {
        updatedRecords.push(res[0]);
      }
    }

    return NextResponse.json({ success: true, count: updatedRecords.length, records: updatedRecords });
  } catch (error: any) {
    console.error("Error in PUT /api/companies:", error);
    const causeMessage = error?.cause?.message || error?.cause?.detail || "";
    return NextResponse.json({
      error: [error.message, causeMessage].filter(Boolean).join("\nПричина PostgreSQL: ") || "Unknown error",
      cause: error?.cause || null,
    }, { status: 500 });
  }
}
