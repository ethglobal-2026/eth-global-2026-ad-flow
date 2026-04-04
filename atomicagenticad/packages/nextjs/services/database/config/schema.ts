import { integer, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export const publishers = pgTable("publishers", {
  id: uuid("id").defaultRandom().primaryKey(),
  walletAddress: varchar("wallet_address", { length: 42 }).notNull().unique(),
  siteUrl: text("site_url").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  category: varchar("category", { length: 120 }).notNull(),
  qualityScore: integer("quality_score").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
