const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
const { Pool } = require("pg");

const envPath = path.join(process.cwd(), ".env");

console.log("\n=== Сброс локальных таблиц ЭкспортКомпас ===\n");

if (!fs.existsSync(envPath)) {
  console.error("❌ Файл .env не найден рядом с package.json.");
  process.exit(1);
}

dotenv.config({ path: envPath });

if (!process.env.DATABASE_URL) {
  console.error("❌ В .env не найдена переменная DATABASE_URL.");
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 5000,
});

async function main() {
  try {
    const info = await pool.query("select current_database() as db, current_user as user");
    console.log(`✅ Подключение успешно: база=${info.rows[0].db}, пользователь=${info.rows[0].user}`);
    console.log("⚠️  Удаляем только таблицы приложения: companies и custom_field_definitions");

    await pool.query("drop table if exists companies cascade");
    await pool.query("drop table if exists custom_field_definitions cascade");

    console.log("✅ Старые таблицы удалены.");
    console.log("\nТеперь выполните:");
    console.log("npx drizzle-kit push");
    console.log("npm run dev");
  } catch (error) {
    console.error("❌ Не удалось сбросить таблицы:");
    console.error(error.message);
    console.log("\nПроверьте DATABASE_URL в .env и доступность PostgreSQL.");
    process.exit(1);
  } finally {
    await pool.end().catch(() => {});
  }
}

main();
