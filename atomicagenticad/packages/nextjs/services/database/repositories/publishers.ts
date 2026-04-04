import { desc, eq } from "drizzle-orm";
import type { InferInsertModel } from "drizzle-orm";
import { db } from "~~/services/database/config/postgresClient";
import { publishers } from "~~/services/database/config/schema";
import type { Publisher } from "~~/types/adflow";
import { useInMemoryPublishers } from "~~/services/database/repositories/publishersBackend";
import * as memory from "~~/services/database/repositories/publishersMemory";

export type { Publisher };
export type NewPublisher = InferInsertModel<typeof publishers>;

export function normalizePublisherEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function getPublishers() {
  if (useInMemoryPublishers()) {
    return memory.memoryListPublishers();
  }
  return await db.query.publishers.findMany({
    orderBy: [desc(publishers.createdAt)],
  });
}

export async function getPublisherById(id: string) {
  if (useInMemoryPublishers()) {
    return memory.memoryGetPublisherById(id);
  }
  return await db.query.publishers.findFirst({
    where: eq(publishers.id, id),
  });
}

export async function getPublisherByEmail(email: string) {
  if (useInMemoryPublishers()) {
    return memory.memoryGetPublisherByEmail(email);
  }
  return await db.query.publishers.findFirst({
    where: eq(publishers.email, normalizePublisherEmail(email)),
  });
}

export async function getPublisherByWalletAddress(walletAddress: string) {
  if (useInMemoryPublishers()) {
    return memory.memoryGetPublisherByWalletAddress(walletAddress);
  }
  return await db.query.publishers.findFirst({
    where: eq(publishers.walletAddress, walletAddress),
  });
}

export async function createPublisher(publisher: NewPublisher) {
  if (useInMemoryPublishers()) {
    return memory.memoryCreatePublisher(publisher);
  }
  const [createdPublisher] = await db.insert(publishers).values(publisher).returning();
  if (!createdPublisher) {
    throw new Error("Publisher insert did not return a row");
  }
  return createdPublisher;
}
