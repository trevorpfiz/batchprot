CREATE TYPE "public"."job_status" AS ENUM('queued', 'running', 'succeeded', 'failed');--> statement-breakpoint
CREATE TABLE "prot_account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "prot_session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "prot_session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "prot_user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean NOT NULL,
	"image" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "prot_user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "prot_verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "prot_job" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"title" varchar(256) NOT NULL,
	"job_status" "job_status" DEFAULT 'queued' NOT NULL,
	"algorithm" varchar(64) DEFAULT 'biopython-1.76',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "prot_protein_analysis" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_id" uuid NOT NULL,
	"sequence_hash" char(40) NOT NULL,
	"sequence" text NOT NULL,
	"length" integer NOT NULL,
	"molecular_weight" numeric(10, 2) NOT NULL,
	"aromaticity" numeric(5, 3) NOT NULL,
	"instability_index" numeric(5, 2) NOT NULL,
	"gravy" numeric(5, 2) NOT NULL,
	"isoelectric_point" numeric(4, 2) NOT NULL,
	"helix_fraction" numeric(4, 2) NOT NULL,
	"turn_fraction" numeric(4, 2) NOT NULL,
	"sheet_fraction" numeric(4, 2) NOT NULL,
	"extinction_coeff_reduced" integer NOT NULL,
	"extinction_coeff_oxidized" integer NOT NULL,
	"charge_at_ph7" numeric(6, 2) NOT NULL,
	"result" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "prot_account" ADD CONSTRAINT "prot_account_user_id_prot_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."prot_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prot_session" ADD CONSTRAINT "prot_session_user_id_prot_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."prot_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prot_job" ADD CONSTRAINT "prot_job_user_id_prot_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."prot_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prot_protein_analysis" ADD CONSTRAINT "prot_protein_analysis_job_id_prot_job_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."prot_job"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "job_user_created_idx" ON "prot_job" USING btree ("user_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "pa_job_idx" ON "prot_protein_analysis" USING btree ("job_id");--> statement-breakpoint
CREATE INDEX "pa_seqhash_idx" ON "prot_protein_analysis" USING btree ("sequence_hash");--> statement-breakpoint
CREATE INDEX "pa_instability_idx" ON "prot_protein_analysis" USING btree ("instability_index");--> statement-breakpoint
CREATE INDEX "pa_result_gin_idx" ON "prot_protein_analysis" USING gin ("result");