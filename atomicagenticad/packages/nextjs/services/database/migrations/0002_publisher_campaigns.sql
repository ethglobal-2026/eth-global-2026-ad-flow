CREATE TABLE "publisher_campaigns" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"publisher_id" uuid NOT NULL,
	"advertiser_name" varchar(255) NOT NULL,
	"advertiser_category" varchar(255),
	"impressions_served" integer DEFAULT 0 NOT NULL,
	"impressions_total" integer NOT NULL,
	"revenue_usdc" varchar(32) DEFAULT '0' NOT NULL,
	"status" varchar(32) DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
ALTER TABLE "publisher_campaigns" ADD CONSTRAINT "publisher_campaigns_publisher_id_publishers_id_fk" FOREIGN KEY ("publisher_id") REFERENCES "public"."publishers"("id") ON DELETE cascade ON UPDATE no action;
