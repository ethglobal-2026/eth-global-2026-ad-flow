import { createPublisher } from "~~/services/database/repositories/publishers";
import { closeDb } from "~~/services/database/config/postgresClient";

async function main() {
  const connectionString = process.env.POSTGRES_URL;

  if (!connectionString) {
    throw new Error("POSTGRES_URL is not configured");
  }

  await createPublisher({
    email: "publisher@example.com",
    walletAddress: "0x1111111111111111111111111111111111111111",
    siteUrl: "https://example.com",
    name: "Example Publisher",
    category: "Technology",
    qualityScore: 8,
    contentFocus: "General technology news and tutorials.",
    language: "English",
    estimatedMonthlyTraffic: "~25,000 visitors",
    audience: "Developers and tech enthusiasts",
    floorPricePer1kUsd: "4.00",
    adFormat: "Both",
    blockedCategories: ["Gambling"],
    preferredAdvertiserTypes: ["SaaS / Software", "Education"],
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
