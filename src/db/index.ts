import { mkdirSync } from "fs";
import { drizzle as drizzleNodePg } from "drizzle-orm/node-postgres";
import { drizzle as drizzlePglite } from "drizzle-orm/pglite";
import { sql } from "drizzle-orm";
import { Pool } from "pg";
import { PGlite } from "@electric-sql/pglite";
import * as schema from "./schema";

const databaseUrl = process.env.DATABASE_URL;

const globalForDb = globalThis as typeof globalThis & {
  __arenaNextJsPostgresqlPool?: Pool;
  __exportCompassPglite?: PGlite;
  __exportCompassDbReady?: Promise<void>;
};

let pool: Pool | undefined;
let pglite: PGlite | undefined;

if (databaseUrl) {
  pool =
    globalForDb.__arenaNextJsPostgresqlPool ??
    new Pool({
      connectionString: databaseUrl,
    });

  if (process.env.NODE_ENV !== "production") {
    globalForDb.__arenaNextJsPostgresqlPool = pool;
  }
} else {
  mkdirSync(".local-db", { recursive: true });

  pglite =
    globalForDb.__exportCompassPglite ??
    new PGlite(".local-db/export-compass");

  if (process.env.NODE_ENV !== "production") {
    globalForDb.__exportCompassPglite = pglite;
  }
}

export const db = databaseUrl
  ? drizzleNodePg(pool!, { schema })
  : drizzlePglite(pglite!, { schema });

export const dbMode = databaseUrl ? "postgres" : "pglite";

export async function ensureDatabaseReady() {
  if (!globalForDb.__exportCompassDbReady) {
    globalForDb.__exportCompassDbReady = (async () => {
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS companies (
          id serial PRIMARY KEY,
          inn text NOT NULL,
          name text NOT NULL,
          status_exporter text NOT NULL,
          cpe_cooperation boolean NOT NULL DEFAULT false,
          msp_status boolean NOT NULL DEFAULT false,
          category_msp text NOT NULL DEFAULT 'Микро',
          sphere text NOT NULL,
          sector text NOT NULL,
          main_activity text NOT NULL,
          products text NOT NULL,
          email_minprom text,
          phone_minprom text,
          contact_minprom text,
          email_cpe text,
          phone_cpe text,
          contact_cpe text,
          export_volume_2023 double precision NOT NULL DEFAULT 0,
          export_volume_2024 double precision NOT NULL DEFAULT 0,
          export_volume_2025 double precision NOT NULL DEFAULT 0,
          export_countries text NOT NULL DEFAULT '',
          support_measures jsonb NOT NULL DEFAULT '[]'::jsonb,
          interactions jsonb NOT NULL DEFAULT '[]'::jsonb,
          tasks jsonb NOT NULL DEFAULT '[]'::jsonb,
          custom_fields jsonb NOT NULL DEFAULT '{}'::jsonb,
          change_logs jsonb NOT NULL DEFAULT '[]'::jsonb,
          notes text NOT NULL DEFAULT '',
          needs_update boolean NOT NULL DEFAULT false,
          created_at timestamp NOT NULL DEFAULT now(),
          updated_at timestamp NOT NULL DEFAULT now()
        )
      `);

      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS custom_field_definitions (
          id serial PRIMARY KEY,
          key text NOT NULL UNIQUE,
          label text NOT NULL,
          type text NOT NULL DEFAULT 'text',
          created_at timestamp NOT NULL DEFAULT now()
        )
      `);

      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS applications (
          id serial PRIMARY KEY,
          source text NOT NULL DEFAULT 'external',
          source_url text,
          company_id integer REFERENCES companies(id),
          company_name text NOT NULL,
          company_inn text,
          contact_name text,
          contact_phone text,
          contact_email text,
          subject text NOT NULL,
          message text,
          status text NOT NULL DEFAULT 'new',
          assigned_to text,
          processed_at timestamp,
          processed_by text,
          comment text,
          raw_data jsonb NOT NULL DEFAULT '{}'::jsonb,
          created_at timestamp NOT NULL DEFAULT now(),
          updated_at timestamp NOT NULL DEFAULT now()
        )
      `);
    })();
  }

  return globalForDb.__exportCompassDbReady;
}
