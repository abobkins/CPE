import { pgTable, serial, text, boolean, timestamp, jsonb, doublePrecision } from "drizzle-orm/pg-core";

export const companies = pgTable("companies", {
  id: serial("id").primaryKey(),
  inn: text("inn").notNull(),
  name: text("name").notNull(),
  statusExporter: text("status_exporter").notNull(), // 'экспортер', 'не экспортер', '2025 г.'
  cpeCooperation: boolean("cpe_cooperation").default(false).notNull(), // Да/Нет
  mspStatus: boolean("msp_status").default(false).notNull(), // Да/Нет
  categoryMsp: text("category_msp").default("Микро").notNull(), // 'Микро', 'Малое', 'Среднее'
  sphere: text("sphere").notNull(), // 'АПК', 'Промышленность', 'Прочие'
  sector: text("sector").notNull(), // Отрасль
  mainActivity: text("main_activity").notNull(), // Основной вид деятельности
  products: text("products").notNull(), // Продукция
  
  // Минпром контакты
  emailMinprom: text("email_minprom"),
  phoneMinprom: text("phone_minprom"),
  contactMinprom: text("contact_minprom"),
  
  // ЦПЭ контакты
  emailCpe: text("email_cpe"),
  phoneCpe: text("phone_cpe"),
  contactCpe: text("contact_cpe"),

  // Экспортная деятельность
  exportVolume2023: doublePrecision("export_volume_2023").default(0).notNull(),
  exportVolume2024: doublePrecision("export_volume_2024").default(0).notNull(),
  exportVolume2025: doublePrecision("export_volume_2025").default(0).notNull(),
  exportCountries: text("export_countries").default("").notNull(), // e.g., "Китай, Казахстан"
  tnved: text("tnved").default("").notNull(), // e.g., "8471, 8473, 8523"

  // Меры поддержки
  // Array of: { id: string, name: string, date: string, status: string, amount?: number }
  supportMeasures: jsonb("support_measures").default([]).notNull(),

  // CRM
  // Array of: { id: string, date: string, author: string, text: string }
  interactions: jsonb("interactions").default([]).notNull(),
  
  // Tasks
  // Array of: { id: string, text: string, date: string, status: 'pending' | 'completed', assignedTo: string }
  tasks: jsonb("tasks").default([]).notNull(),
  
  // Динамические доп. поля (key-value)
  customFields: jsonb("custom_fields").default({}).notNull(),

  // Аудит изменений
  // Array of: { timestamp: string, user: string, action: string, details: string }
  changeLogs: jsonb("change_logs").default([]).notNull(),

  notes: text("notes").default("").notNull(),
  needsUpdate: boolean("needs_update").default(false).notNull(),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const customFieldDefinitions = pgTable("custom_field_definitions", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  label: text("label").notNull(),
  type: text("type").default("text").notNull(), // 'text', 'number', 'boolean'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const applications = pgTable("applications", {
  id: serial("id").primaryKey(),
  source: text("source").notNull().default("external"),
  sourceUrl: text("source_url"),
  companyId: serial("company_id").references(() => companies.id),
  companyName: text("company_name").notNull(),
  companyInn: text("company_inn"),
  contactName: text("contact_name"),
  contactPhone: text("contact_phone"),
  contactEmail: text("contact_email"),
  subject: text("subject").notNull(),
  message: text("message"),
  status: text("status").notNull().default("new"),
  assignedTo: text("assigned_to"),
  processedAt: timestamp("processed_at"),
  processedBy: text("processed_by"),
  comment: text("comment"),
  rawData: jsonb("raw_data").default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const kpiTargets = pgTable("kpi_targets", {
  id: serial("id").primaryKey(),
  year: serial("year").notNull().unique(),
  supportedExportVolume: doublePrecision("supported_export_volume").default(500).notNull(),
  countryDiversification: doublePrecision("country_diversification").default(15).notNull(),
  newExporters: doublePrecision("new_exporters").default(10).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
