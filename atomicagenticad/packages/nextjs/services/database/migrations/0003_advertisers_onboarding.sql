CREATE TABLE "advertisers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"wallet_address" varchar(42),
	"product_description" text NOT NULL,
	"target_audience" text NOT NULL,
	"budget_usdc" varchar(32) NOT NULL,
	"target_impressions" integer NOT NULL,
	"creative_file_name" varchar(512),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "advertisers_email_unique" UNIQUE("email"),
	CONSTRAINT "advertisers_wallet_address_unique" UNIQUE("wallet_address")
);
