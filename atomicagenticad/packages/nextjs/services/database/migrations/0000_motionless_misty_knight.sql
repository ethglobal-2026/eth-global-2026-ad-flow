CREATE TABLE "publishers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"wallet_address" varchar(42) NOT NULL,
	"site_url" text NOT NULL,
	"name" varchar(255) NOT NULL,
	"category" varchar(120) NOT NULL,
	"quality_score" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "publishers_wallet_address_unique" UNIQUE("wallet_address")
);
