import { desc, eq } from "drizzle-orm";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { db } from "~~/services/database/config/postgresClient";
import { publishers } from "~~/services/database/config/schema";

export type Publisher = InferSelectModel<typeof publishers>;
export type NewPublisher = InferInsertModel<typeof publishers>;

export async function getPublishers() {
  return await db.query.publishers.findMany({
    orderBy: [desc(publishers.createdAt)],
  });
}

export async function getPublisherByWalletAddress(walletAddress: string) {
  return await db.query.publishers.findFirst({
    where: eq(publishers.walletAddress, walletAddress),
  });
}

export async function createPublisher(publisher: NewPublisher) {
  const [createdPublisher] = await db.insert(publishers).values(publisher).returning();
  return createdPublisher;
}
