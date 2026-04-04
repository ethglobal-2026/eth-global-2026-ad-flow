import { sql } from "drizzle-orm";
import { closeDb, db } from "~~/services/database/config/postgresClient";

async function main() {
  const connectionString = process.env.POSTGRES_URL;

  if (!connectionString) {
    throw new Error("POSTGRES_URL is not configured");
  }

  await db.execute(sql`truncate table advertisers restart identity cascade`);
  await db.execute(sql`truncate table publishers restart identity cascade`);
}

main()
  .catch(error => {
    console.error("[db:wipe]", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await closeDb();
  });
