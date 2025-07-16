import { createHash } from 'node:crypto';
import { and, eq, inArray } from '@repo/database';
import { Job, ProteinAnalysis } from '@repo/database/schema';
import type { TRPCRouterRecord } from '@trpc/server';
import { z } from 'zod';
import { analysisRunAnalysis } from '../client';
import { protectedProcedure } from '../trpc';

// Schema for saving analysis results from FastAPI
const SaveAnalysisResultsSchema = z.object({
  jobId: z.uuid(),
  results: z.array(
    z.object({
      sequence: z.string(),
      length: z.number(),
      molecular_weight: z.number(),
      isoelectric_point: z.number(),
      aromaticity: z.number().optional(),
      instability_index: z.number().optional(),
      gravy: z.number().optional(),
      helix_fraction: z.number().optional(),
      turn_fraction: z.number().optional(),
      sheet_fraction: z.number().optional(),
      extinction_coeff_reduced: z.number().optional(),
      extinction_coeff_oxidized: z.number().optional(),
      charge_at_ph7: z.number().optional(),
      amino_acid_counts: z.record(z.string(), z.number()),
      amino_acid_percentages: z.record(z.string(), z.number()),
    })
  ),
});

// Schema for triggering analysis
const TriggerAnalysisSchema = z.object({
  jobId: z.uuid(),
  sequences: z.array(z.string()).min(1),
  bearerToken: z.string().optional(),
});

export const proteinAnalysisRouter = {
  saveResults: protectedProcedure
    .input(SaveAnalysisResultsSchema)
    .mutation(async ({ ctx, input }) => {
      const { db, session } = ctx;
      const user = session.user;
      const { jobId, results } = input;

      // Verify the job belongs to the user
      const job = await db.query.Job.findFirst({
        where: and(eq(Job.id, jobId), eq(Job.userId, user.id)),
      });

      if (!job) {
        throw new Error('Job not found or access denied');
      }

      // Convert results to database format
      const analysisData = results.map((result) => {
        const sequenceHash = createHash('sha1')
          .update(result.sequence)
          .digest('hex');

        return {
          jobId,
          sequenceHash,
          sequence: result.sequence,
          length: result.length,
          molecularWeight: result.molecular_weight.toString(),
          aromaticity: result.aromaticity?.toString() || null,
          instabilityIndex: result.instability_index?.toString() || null,
          gravy: result.gravy?.toString() || null,
          isoelectricPoint: result.isoelectric_point.toString(),
          helixFraction: result.helix_fraction?.toString() || null,
          turnFraction: result.turn_fraction?.toString() || null,
          sheetFraction: result.sheet_fraction?.toString() || null,
          extinctionCoeffReduced: result.extinction_coeff_reduced,
          extinctionCoeffOxidized: result.extinction_coeff_oxidized,
          chargeAtPh7: result.charge_at_ph7?.toString() || null,
          result: {
            aminoAcidCounts: result.amino_acid_counts,
            aminoAcidPercentages: result.amino_acid_percentages,
          },
        };
      });

      // Insert all analysis results
      const insertedResults = await db
        .insert(ProteinAnalysis)
        .values(analysisData)
        .returning();

      // Update job status to succeeded
      await db
        .update(Job)
        .set({
          status: 'succeeded',
          updatedAt: new Date(),
        })
        .where(eq(Job.id, jobId));

      return { results: insertedResults };
    }),

  triggerAnalysis: protectedProcedure
    .input(TriggerAnalysisSchema)
    .mutation(async ({ ctx, input }) => {
      const { db, session } = ctx;
      const user = session.user;
      const { jobId, sequences, bearerToken } = input;

      // Verify the job belongs to the user
      const job = await db.query.Job.findFirst({
        where: and(eq(Job.id, jobId), eq(Job.userId, user.id)),
      });

      if (!job) {
        throw new Error('Job not found or access denied');
      }

      // Update job status to running
      await db
        .update(Job)
        .set({
          status: 'running',
          updatedAt: new Date(),
        })
        .where(eq(Job.id, jobId));

      try {
        // Call FastAPI using analysisRunAnalysis with optional bearer token
        const analysisResponse = await analysisRunAnalysis({
          body: {
            sequences,
            analysis_type: job.analysisType || 'basic',
          },
          ...(bearerToken && {
            headers: {
              Authorization: `Bearer ${bearerToken}`,
            },
          }),
        });

        if (
          analysisResponse.data?.results &&
          analysisResponse.data.results.length > 0
        ) {
          // Save results to database directly
          const analysisResults = analysisResponse.data.results.map(
            (result) => {
              const sequenceHash = createHash('sha1')
                .update(result.sequence)
                .digest('hex');

              return {
                jobId,
                sequenceHash,
                sequence: result.sequence,
                length: result.length,
                molecularWeight: result.molecular_weight.toString(),
                aromaticity: result.aromaticity?.toString() || null,
                instabilityIndex: result.instability_index?.toString() || null,
                gravy: result.gravy?.toString() || null,
                isoelectricPoint: result.isoelectric_point.toString(),
                helixFraction: result.helix_fraction?.toString() || null,
                turnFraction: result.turn_fraction?.toString() || null,
                sheetFraction: result.sheet_fraction?.toString() || null,
                extinctionCoeffReduced: result.extinction_coeff_reduced,
                extinctionCoeffOxidized: result.extinction_coeff_oxidized,
                chargeAtPh7: result.charge_at_ph7?.toString() || null,
                result: {
                  aminoAcidCounts: result.amino_acid_counts,
                  aminoAcidPercentages: result.amino_acid_percentages,
                },
              };
            }
          );

          // Insert all analysis results
          await db.insert(ProteinAnalysis).values(analysisResults).returning();

          // Update job status to succeeded
          await db
            .update(Job)
            .set({
              status: 'succeeded',
              updatedAt: new Date(),
            })
            .where(eq(Job.id, jobId));
        } else {
          // Mark job as failed if no results
          await db
            .update(Job)
            .set({
              status: 'failed',
              updatedAt: new Date(),
            })
            .where(eq(Job.id, jobId));
        }

        return { success: true };
      } catch (analysisError) {
        // Mark job as failed
        await db
          .update(Job)
          .set({
            status: 'failed',
            updatedAt: new Date(),
          })
          .where(eq(Job.id, jobId));

        throw new Error(
          `Analysis failed: ${analysisError instanceof Error ? analysisError.message : 'Unknown error'}`
        );
      }
    }),

  byJobId: protectedProcedure
    .input(z.object({ jobId: z.uuid() }))
    .query(async ({ ctx, input }) => {
      const { db, session } = ctx;
      const user = session.user;
      const { jobId } = input;

      // Verify the job belongs to the user
      const job = await db.query.Job.findFirst({
        where: and(eq(Job.id, jobId), eq(Job.userId, user.id)),
      });

      if (!job) {
        throw new Error('Job not found or access denied');
      }

      const analyses = await db.query.ProteinAnalysis.findMany({
        where: eq(ProteinAnalysis.jobId, jobId),
      });

      return { analyses };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { db, session } = ctx;
      const user = session.user;
      const { id } = input;

      // First, verify the protein analysis belongs to the user through the job relationship
      const proteinAnalysis = await db.query.ProteinAnalysis.findFirst({
        where: eq(ProteinAnalysis.id, id),
        with: {
          job: true,
        },
      });

      if (!proteinAnalysis || proteinAnalysis.job.userId !== user.id) {
        throw new Error('Protein analysis not found or access denied');
      }

      // Delete the protein analysis
      const [deletedAnalysis] = await db
        .delete(ProteinAnalysis)
        .where(eq(ProteinAnalysis.id, id))
        .returning();

      return { proteinAnalysis: deletedAnalysis };
    }),

  deleteMany: protectedProcedure
    .input(z.object({ ids: z.array(z.uuid()).min(1) }))
    .mutation(async ({ ctx, input }) => {
      const { db, session } = ctx;
      const user = session.user;
      const { ids } = input;

      // First, verify all protein analyses belong to the user through job relationships
      const proteinAnalyses = await db.query.ProteinAnalysis.findMany({
        where: inArray(ProteinAnalysis.id, ids),
        with: {
          job: true,
        },
      });

      // Verify all analyses belong to the user
      const userAnalyses = proteinAnalyses.filter(
        (analysis) => analysis.job.userId === user.id
      );

      if (userAnalyses.length !== ids.length) {
        throw new Error('Some protein analyses not found or access denied');
      }

      // Delete all protein analyses
      const deletedAnalyses = await db
        .delete(ProteinAnalysis)
        .where(inArray(ProteinAnalysis.id, ids))
        .returning();

      return {
        proteinAnalyses: deletedAnalyses,
        count: deletedAnalyses.length,
      };
    }),
} satisfies TRPCRouterRecord;
