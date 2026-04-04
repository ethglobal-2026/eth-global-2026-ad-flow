import type { InferSelectModel } from "drizzle-orm";
import type { publishers } from "~~/services/database/config/schema";

/** Row shape for `publishers` — same as repository `Publisher`; defined here so client code never imports the DB layer. */
export type Publisher = InferSelectModel<typeof publishers>;

/** Stored in sessionStorage after successful publisher onboarding (see `/publisher/onboard`). */
export type PublisherSessionSummary = Pick<Publisher, "id" | "email" | "siteUrl" | "floorPricePer1kUsd" | "category">;
