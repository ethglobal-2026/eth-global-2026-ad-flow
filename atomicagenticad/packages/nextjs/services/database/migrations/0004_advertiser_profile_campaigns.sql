CREATE TABLE "advertiser_campaigns" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"advertiser_id" uuid NOT NULL,
	"product_description" text NOT NULL,
	"target_audience" text NOT NULL,
	"budget_usdc" varchar(32) NOT NULL,
	"target_impressions" integer NOT NULL,
	"creative_file_name" varchar(512),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "advertiser_campaigns_advertiser_id_advertisers_id_fk" FOREIGN KEY ("advertiser_id") REFERENCES "public"."advertisers"("id") ON DELETE cascade ON UPDATE no action
);

INSERT INTO "advertiser_campaigns" ("advertiser_id", "product_description", "target_audience", "budget_usdc", "target_impressions", "creative_file_name", "created_at")
SELECT "id", "product_description", "target_audience", "budget_usdc", "target_impressions", "creative_file_name", "created_at" FROM "advertisers";

ALTER TABLE "advertisers" ADD COLUMN "display_name" varchar(255);
ALTER TABLE "advertisers" ADD COLUMN "company_name" varchar(255);
ALTER TABLE "advertisers" ADD COLUMN "about" text;

UPDATE "advertisers" SET "display_name" = COALESCE(NULLIF(trim(split_part("email", '@', 1)), ''), 'Advertiser') WHERE "display_name" IS NULL;

ALTER TABLE "advertisers" ALTER COLUMN "display_name" SET NOT NULL;

ALTER TABLE "advertisers" DROP COLUMN "product_description";
ALTER TABLE "advertisers" DROP COLUMN "target_audience";
ALTER TABLE "advertisers" DROP COLUMN "budget_usdc";
ALTER TABLE "advertisers" DROP COLUMN "target_impressions";
ALTER TABLE "advertisers" DROP COLUMN "creative_file_name";

UPDATE "advertisers" SET "wallet_address" = ('0x' || rpad(replace("id"::text, '-', ''), 40, '0')) WHERE "wallet_address" IS NULL;

ALTER TABLE "advertisers" ALTER COLUMN "wallet_address" SET NOT NULL;

UPDATE "advertisers" SET "wallet_address" = lower("wallet_address");
