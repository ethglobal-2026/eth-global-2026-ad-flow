import { createPublisher } from "~~/services/database/repositories/publishers";
import { closeDb } from "~~/services/database/config/postgresClient";

async function main() {
  const connectionString = process.env.POSTGRES_URL;

  if (!connectionString) {
    throw new Error("POSTGRES_URL is not configured");
  }

  await createPublisher({
    walletAddress: "0x1111111111111111111111111111111111111111",
    siteUrl: "https://example.com",
    name: "Example Publisher",
    category: "Technology",
    qualityScore: 8,
  });
}

main()
  .catch(error => {
    console.error("[db:seed]", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await closeDb();
  });
