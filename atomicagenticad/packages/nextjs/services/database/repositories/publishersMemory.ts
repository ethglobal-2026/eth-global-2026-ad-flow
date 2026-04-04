import { randomUUID } from "node:crypto";
import type { InferInsertModel } from "drizzle-orm";
import { publishers } from "~~/services/database/config/schema";
import type { Publisher } from "~~/types/adflow";

type Insert = InferInsertModel<typeof publishers>;

const store: Publisher[] = [];

let warned = false;

function warnOnce() {
  if (warned) return;
  warned = true;
  console.warn(
    "[publishers] POSTGRES_URL is unset — using in-memory publisher store (development only; data is lost on server restart).",
  );
}

function normEmail(email: string) {
  return email.trim().toLowerCase();
}

export function memoryListPublishers(): Publisher[] {
  warnOnce();
  return [...store].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export function memoryGetPublisherById(id: string): Publisher | undefined {
  warnOnce();
  return store.find(p => p.id === id);
}

export function memoryGetPublisherByEmail(email: string): Publisher | undefined {
  warnOnce();
  const key = normEmail(email);
  return store.find(p => p.email === key);
}

export function memoryGetPublisherByWalletAddress(walletAddress: string): Publisher | undefined {
  warnOnce();
  return store.find(p => p.walletAddress === walletAddress);
}

export function memoryCreatePublisher(values: Insert): Publisher {
  warnOnce();
  const now = new Date();
  const row: Publisher = {
    id: randomUUID(),
    createdAt: now,
    email: values.email,
    walletAddress: values.walletAddress ?? null,
    siteUrl: values.siteUrl,
    name: values.name,
    category: values.category,
    qualityScore: values.qualityScore,
    contentFocus: values.contentFocus ?? null,
    language: values.language ?? null,
    estimatedMonthlyTraffic: values.estimatedMonthlyTraffic ?? null,
    audience: values.audience ?? null,
    floorPricePer1kUsd: values.floorPricePer1kUsd,
    adFormat: values.adFormat,
    blockedCategories: values.blockedCategories ?? [],
    preferredAdvertiserTypes: values.preferredAdvertiserTypes ?? [],
  };
  store.push(row);
  return row;
}
