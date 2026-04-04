import { sql } from "drizzle-orm";
import { integer, jsonb, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export const publishers = pgTable("publishers", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  walletAddress: varchar("wallet_address", { length: 42 }).unique(),
  siteUrl: text("site_url").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  category: varchar("category", { length: 120 }).notNull(),
  qualityScore: integer("quality_score").notNull(),
  contentFocus: text("content_focus"),
  language: varchar("language", { length: 64 }),
  estimatedMonthlyTraffic: varchar("estimated_monthly_traffic", { length: 120 }),
  audience: text("audience"),
  floorPricePer1kUsd: varchar("floor_price_per_1k_usd", { length: 32 }).notNull().default("0"),
  adFormat: varchar("ad_format", { length: 64 }).notNull().default("Both"),
  blockedCategories: jsonb("blocked_categories")
    .$type<string[]>()
    .notNull()
    .default(sql`'[]'::jsonb`),
  preferredAdvertiserTypes: jsonb("preferred_advertiser_types")
    .$type<string[]>()
    .notNull()
    .default(sql`'[]'::jsonb`),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const publisherCampaigns = pgTable("publisher_campaigns", {
  id: uuid("id").defaultRandom().primaryKey(),
  publisherId: uuid("publisher_id")
    .notNull()
    .references(() => publishers.id, { onDelete: "cascade" }),
  advertiserName: varchar("advertiser_name", { length: 255 }).notNull(),
  advertiserCategory: varchar("advertiser_category", { length: 255 }),
  impressionsServed: integer("impressions_served").notNull().default(0),
  impressionsTotal: integer("impressions_total").notNull(),
  revenueUsdc: varchar("revenue_usdc", { length: 32 }).notNull().default("0"),
  status: varchar("status", { length: 32 }).notNull().default("active"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
