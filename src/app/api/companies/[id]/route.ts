import { NextRequest, NextResponse } from "next/server";
import { db, ensureDatabaseReady } from "@/db";
import { companies } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureDatabaseReady();
    const { id } = await params;
    const companyId = parseInt(id, 10);
    if (isNaN(companyId)) {
      return NextResponse.json({ error: "Некорректный ID" }, { status: 400 });
    }

    const data = await db.select().from(companies).where(eq(companies.id, companyId)).limit(1);

    if (data.length === 0) {
      return NextResponse.json({ error: "Компания не найдена" }, { status: 404 });
    }

    return NextResponse.json(data[0]);
  } catch (error: any) {
    console.error("Error in GET /api/companies/[id]:", error);
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
    const companyId = parseInt(id, 10);
    if (isNaN(companyId)) {
      return NextResponse.json({ error: "Некорректный ID" }, { status: 400 });
    }

    const body = await req.json();
    const { userName, actionType, ...fieldsToUpdate } = body;

    // Get current record for change logging
    const existing = await db.select().from(companies).where(eq(companies.id, companyId)).limit(1);
    if (existing.length === 0) {
      return NextResponse.json({ error: "Компания не найдена" }, { status: 404 });
    }
    const current = existing[0];

    // Determine change log details
    const author = userName || "Менеджер";
    const timestamp = new Date().toISOString();
    let changeDetails = "";

    if (actionType === "add_interaction") {
      changeDetails = `Добавлено взаимодействие: "${fieldsToUpdate.interactionText}"`;
    } else if (actionType === "add_task") {
      changeDetails = `Добавлена задача: "${fieldsToUpdate.taskText}" (Срок: ${fieldsToUpdate.taskDate})`;
    } else if (actionType === "toggle_task") {
      changeDetails = `Статус задачи изменен на "${fieldsToUpdate.taskStatus === "completed" ? "Выполнено" : "В процессе"}"`;
    } else if (actionType === "add_measure") {
      changeDetails = `Добавлена мера поддержки: "${fieldsToUpdate.measureName}" (${fieldsToUpdate.measureAmount} руб.)`;
    } else if (actionType === "delete_measure") {
      changeDetails = `Удалена мера поддержки с ID: ${fieldsToUpdate.measureId}`;
    } else {
      // General fields update
      const changes = [];
      for (const k of Object.keys(fieldsToUpdate)) {
        // Skip logs and arrays
        if (["changeLogs", "interactions", "tasks", "supportMeasures"].includes(k)) continue;
        
        const oldVal = typeof (current as any)[k] === "object" ? JSON.stringify((current as any)[k]) : String((current as any)[k] ?? "");
        const newVal = typeof fieldsToUpdate[k] === "object" ? JSON.stringify(fieldsToUpdate[k]) : String(fieldsToUpdate[k] ?? "");
        
        if (oldVal !== newVal) {
          changes.push(`${k}: "${oldVal}" -> "${newVal}"`);
        }
      }
      changeDetails = changes.join(", ") || "Обновление карточки";
    }

    const newLogEntry = {
      timestamp,
      user: author,
      action: actionType || "Редактирование",
      details: changeDetails,
    };

    const updatedLogs = [...(current.changeLogs as any[]), newLogEntry];

    // Build the final updates payload
    const finalUpdates: any = {
      updatedAt: new Date(),
      changeLogs: updatedLogs,
    };

    // If it's adding interaction
    if (actionType === "add_interaction") {
      const newInteraction = {
        id: "int-" + Math.random().toString(36).substr(2, 9),
        date: timestamp.split("T")[0],
        author,
        text: fieldsToUpdate.interactionText,
      };
      finalUpdates.interactions = [...(current.interactions as any[]), newInteraction];
    }
    // If it's adding a task
    else if (actionType === "add_task") {
      const newTask = {
        id: "task-" + Math.random().toString(36).substr(2, 9),
        text: fieldsToUpdate.taskText,
        date: fieldsToUpdate.taskDate,
        status: "pending",
        assignedTo: fieldsToUpdate.taskAssignedTo || author,
      };
      finalUpdates.tasks = [...(current.tasks as any[]), newTask];
    }
    // If it's toggling task status
    else if (actionType === "toggle_task") {
      const targetId = fieldsToUpdate.taskId;
      finalUpdates.tasks = (current.tasks as any[]).map(t => {
        if (t.id === targetId) {
          return { ...t, status: fieldsToUpdate.taskStatus };
        }
        return t;
      });
    }
    // If it's adding support measure
    else if (actionType === "add_measure") {
      const newMeasure = {
        id: "sm-" + Math.random().toString(36).substr(2, 9),
        name: fieldsToUpdate.measureName,
        date: fieldsToUpdate.measureDate,
        status: fieldsToUpdate.measureStatus,
        amount: Number(fieldsToUpdate.measureAmount) || 0,
      };
      finalUpdates.supportMeasures = [...(current.supportMeasures as any[]), newMeasure];
    }
    // If it's deleting a support measure
    else if (actionType === "delete_measure") {
      const targetId = fieldsToUpdate.measureId;
      finalUpdates.supportMeasures = (current.supportMeasures as any[]).filter(m => m.id !== targetId);
    }
    // Else regular update
    else {
      // Assign simple fields
      const simpleFields = [
        "inn", "name", "statusExporter", "cpeCooperation", "mspStatus", "categoryMsp", 
        "sphere", "sector", "mainActivity", "products", "emailMinprom", "phoneMinprom", 
        "contactMinprom", "emailCpe", "phoneCpe", "contactCpe", "exportVolume2023", 
        "exportVolume2024", "exportVolume2025", "exportCountries", "notes", "needsUpdate",
        "customFields"
      ];

      for (const f of simpleFields) {
        if (fieldsToUpdate[f] !== undefined) {
          if (f === "cpeCooperation" || f === "mspStatus" || f === "needsUpdate") {
            finalUpdates[f] = fieldsToUpdate[f] === true || fieldsToUpdate[f] === "true";
          } else if (f === "exportVolume2023" || f === "exportVolume2024" || f === "exportVolume2025") {
            finalUpdates[f] = Number(fieldsToUpdate[f]) || 0;
          } else {
            finalUpdates[f] = fieldsToUpdate[f];
          }
        }
      }
    }

    const res = await db.update(companies)
      .set(finalUpdates)
      .where(eq(companies.id, companyId))
      .returning();

    return NextResponse.json(res[0]);
  } catch (error: any) {
    console.error("Error in PUT /api/companies/[id]:", error);
    const causeMessage = error?.cause?.message || error?.cause?.detail || "";
    return NextResponse.json({
      error: [error.message, causeMessage].filter(Boolean).join("\nПричина PostgreSQL: ") || "Unknown error",
      cause: error?.cause || null,
    }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureDatabaseReady();
    const { id } = await params;
    const companyId = parseInt(id, 10);
    if (isNaN(companyId)) {
      return NextResponse.json({ error: "Некорректный ID" }, { status: 400 });
    }

    const res = await db.delete(companies).where(eq(companies.id, companyId)).returning();

    if (res.length === 0) {
      return NextResponse.json({ error: "Компания не найдена" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Компания успешно удалена" });
  } catch (error: any) {
    console.error("Error in DELETE /api/companies/[id]:", error);
    return NextResponse.json({ error: error.message || "Unknown error" }, { status: 500 });
  }
}
