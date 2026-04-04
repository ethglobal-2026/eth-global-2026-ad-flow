import { desc, eq } from "drizzle-orm";
import type { InferInsertModel } from "drizzle-orm";
import { db } from "~~/services/database/config/postgresClient";
import { publisherCampaigns } from "~~/services/database/config/schema";

export type PublisherCampaignRow = typeof publisherCampaigns.$inferSelect;
export type NewPublisherCampaign = InferInsertModel<typeof publisherCampaigns>;

export async function getCampaignsByPublisherId(publisherId: string) {
  return await db
    .select()
    .from(publisherCampaigns)
    .where(eq(publisherCampaigns.publisherId, publisherId))
    .orderBy(desc(publisherCampaigns.createdAt));
}

export async function insertPublisherCampaigns(rows: NewPublisherCampaign[]) {
  if (rows.length === 0) return;
  await db.insert(publisherCampaigns).values(rows);
}
