import { closeDb } from "~~/services/database/config/postgresClient";
import { createAdvertiserCampaign } from "~~/services/database/repositories/advertiserCampaigns";
import { createAdvertiser } from "~~/services/database/repositories/advertisers";
import { insertPublisherCampaigns } from "~~/services/database/repositories/publisherCampaigns";
import { createPublisher } from "~~/services/database/repositories/publishers";

async function main() {
  const connectionString = process.env.POSTGRES_URL;

  if (!connectionString) {
    throw new Error("POSTGRES_URL is not configured");
  }

  const adv = await createAdvertiser({
    email: "advertiser-demo@example.com",
    walletAddress: "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    displayName: "Demo Advertiser",
    companyName: "BeanBox Inc",
    about: "Coffee subscription brand focused on specialty and Arabic coffee culture.",
  });

  const pub = await createPublisher({
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

  await createAdvertiserCampaign({
    advertiserId: adv.id,
    productDescription: "BeanBox — premium coffee subscription",
    targetAudience: "Coffee enthusiasts aged 25–45, specialty brewing interest.",
    budgetUsdc: "200.00",
    targetImpressions: 50_000,
    creativeFileName: null,
    selectedPublisherIds: [pub.id],
  });

  await insertPublisherCampaigns([
    {
      publisherId: pub.id,
      advertiserName: "BeanBox Coffee Co.",
      advertiserCategory: "E-commerce — Coffee subscriptions",
      impressionsServed: 22400,
      impressionsTotal: 50000,
      revenueUsdc: "89.60",
      status: "active",
    },
    {
      publisherId: pub.id,
      advertiserName: "BrewMaster App",
      advertiserCategory: "SaaS — Coffee brewing assistant",
      impressionsServed: 13300,
      impressionsTotal: 25000,
      revenueUsdc: "53.20",
      status: "active",
    },
  ]);
}

main()
  .catch(error => {
    console.error("[db:seed]", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await closeDb();
  });
