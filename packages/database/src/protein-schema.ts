import { relations, sql } from 'drizzle-orm';
import { index, pgEnum } from 'drizzle-orm/pg-core';
import { createInsertSchema, createUpdateSchema } from 'drizzle-zod';
import { z } from 'zod/v4';

import { createTable } from './_table';
import { user } from './auth-schema';
import { timestamps } from './lib/utils';

export const jobStatus = pgEnum('job_status', [
  'queued',
  'running',
  'succeeded',
  'failed',
]);

// Job table for batch protein analysis
export const Job = createTable(
  'job',
  (t) => ({
    id: t.uuid().defaultRandom().primaryKey(),
    userId: t
      .text()
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    title: t.varchar({ length: 256 }).notNull(),
    status: jobStatus('job_status').default('queued').notNull(),
    algorithm: t.varchar({ length: 64 }).default('biopython-1.76'),

    createdAt: t.timestamp().defaultNow().notNull(),
    updatedAt: t
      .timestamp({ mode: 'date', withTimezone: true })
      .$onUpdateFn(() => new Date()),
  }),
  (table) => [
    index('job_user_created_idx').on(table.userId, table.createdAt.desc()),
  ]
);

// Type for the protein analysis result JSONB field
export interface ProteinAnalysisResult {
  aminoAcidCounts: Record<string, number>;
  aminoAcidPercentages: Record<string, number>;
  flexibilityScores?: number[];
}

// Individual protein analysis results
export const ProteinAnalysis = createTable(
  'protein_analysis',
  (t) => ({
    id: t.uuid().defaultRandom().primaryKey(),
    jobId: t
      .uuid()
      .notNull()
      .references(() => Job.id, { onDelete: 'cascade' }),

    /* identifying data */
    sequenceHash: t.char({ length: 40 }).notNull(), // SHA-1 of seq
    sequence: t.text().notNull(),
    length: t.integer().notNull(),

    /* searchable scalar metrics */
    molecularWeight: t.numeric({ precision: 10, scale: 2 }).notNull(),
    aromaticity: t.numeric({ precision: 5, scale: 3 }).notNull(),
    instabilityIndex: t.numeric({ precision: 5, scale: 2 }).notNull(),
    gravy: t.numeric({ precision: 5, scale: 2 }).notNull(),
    isoelectricPoint: t.numeric({ precision: 4, scale: 2 }).notNull(),
    helixFraction: t.numeric({ precision: 4, scale: 2 }).notNull(),
    turnFraction: t.numeric({ precision: 4, scale: 2 }).notNull(),
    sheetFraction: t.numeric({ precision: 4, scale: 2 }).notNull(),
    extinctionCoeffReduced: t.integer().notNull(),
    extinctionCoeffOxidized: t.integer().notNull(),
    chargeAtPh7: t.numeric({ precision: 6, scale: 2 }).notNull(),

    /* flexible payload */
    result: t
      .jsonb()
      .$type<ProteinAnalysisResult>()
      .notNull()
      .default(sql`'{}'::jsonb`),

    /* bookkeeping */
    createdAt: t.timestamp().defaultNow().notNull(),
    updatedAt: t
      .timestamp({ mode: 'date', withTimezone: true })
      .$onUpdateFn(() => new Date()),
  }),
  (table) => [
    index('pa_job_idx').on(table.jobId),
    index('pa_seqhash_idx').on(table.sequenceHash),
    index('pa_instability_idx').on(table.instabilityIndex),
    // Add GIN index for JSONB result data for efficient searching
    index('pa_result_gin_idx').using('gin', table.result),
  ]
);

// Relations
export const JobRelations = relations(Job, ({ one, many }) => ({
  user: one(user, {
    fields: [Job.userId],
    references: [user.id],
  }),
  proteinAnalyses: many(ProteinAnalysis),
}));

export const ProteinAnalysisRelations = relations(
  ProteinAnalysis,
  ({ one }) => ({
    job: one(Job, {
      fields: [ProteinAnalysis.jobId],
      references: [Job.id],
    }),
  })
);

// Zod schemas for validation
// Job schemas
export const insertJobSchema = createInsertSchema(Job, {
  title: z.string().min(1).max(256),
}).omit(timestamps);

export const insertJobParams = insertJobSchema.omit({
  id: true,
  userId: true,
  status: true,
});

export const updateJobSchema = createUpdateSchema(Job);

export const jobIdSchema = z.object({
  id: z.uuid(),
});

// Protein Analysis schemas
export const insertProteinAnalysisSchema = createInsertSchema(ProteinAnalysis, {
  sequenceHash: z.string().length(40),
  sequence: z.string().min(1),
}).omit(timestamps);

export const insertProteinAnalysisParams = insertProteinAnalysisSchema.omit({
  id: true,
  jobId: true,
});

export const updateProteinAnalysisSchema = createUpdateSchema(ProteinAnalysis);

export const proteinAnalysisIdSchema = z.object({
  id: z.uuid(),
});

// Search/filter schema
export const ProteinAnalysisFilterSchema = z
  .object({
    molecularWeightMin: z.number().positive().optional(),
    molecularWeightMax: z.number().positive().optional(),
    instabilityIndexMin: z.number().optional(),
    instabilityIndexMax: z.number().optional(),
    isoelectricPointMin: z.number().positive().optional(),
    isoelectricPointMax: z.number().positive().optional(),
    aromaticityMin: z.number().min(0).max(1).optional(),
    aromaticityMax: z.number().min(0).max(1).optional(),
    gravyMin: z.number().optional(),
    gravyMax: z.number().optional(),
    lengthMin: z.number().int().positive().optional(),
    lengthMax: z.number().int().positive().optional(),
  })
  .partial();

// Types for API - using direct infer types
export type Job = typeof Job.$inferSelect;
export type NewJob = typeof Job.$inferInsert;
export type JobId = Job['id'];
export type JobStatus = (typeof jobStatus.enumValues)[number];

export type ProteinAnalysis = typeof ProteinAnalysis.$inferSelect;
export type NewProteinAnalysis = typeof ProteinAnalysis.$inferInsert;
export type ProteinAnalysisId = ProteinAnalysis['id'];
export type ProteinAnalysisFilter = z.infer<typeof ProteinAnalysisFilterSchema>;
