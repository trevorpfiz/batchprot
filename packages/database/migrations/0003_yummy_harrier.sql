CREATE TYPE "public"."analysis_type" AS ENUM('basic', 'advanced');--> statement-breakpoint
ALTER TABLE "prot_job" ALTER COLUMN "algorithm" SET DEFAULT 'biopython-1.85';--> statement-breakpoint
ALTER TABLE "prot_protein_analysis" ALTER COLUMN "aromaticity" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "prot_protein_analysis" ALTER COLUMN "instability_index" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "prot_protein_analysis" ALTER COLUMN "gravy" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "prot_protein_analysis" ALTER COLUMN "helix_fraction" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "prot_protein_analysis" ALTER COLUMN "turn_fraction" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "prot_protein_analysis" ALTER COLUMN "sheet_fraction" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "prot_protein_analysis" ALTER COLUMN "extinction_coeff_reduced" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "prot_protein_analysis" ALTER COLUMN "extinction_coeff_oxidized" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "prot_protein_analysis" ALTER COLUMN "charge_at_ph7" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "prot_job" ADD COLUMN "analysis_type" "analysis_type" DEFAULT 'basic' NOT NULL;