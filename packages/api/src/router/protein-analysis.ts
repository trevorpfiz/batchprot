import { createHash } from 'node:crypto';
import { and, eq } from '@repo/database';
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
      aromaticity: z.number(),
      instability_index: z.number(),
      gravy: z.number(),
      isoelectric_point: z.number(),
      helix_fraction: z.number(),
      turn_fraction: z.number(),
      sheet_fraction: z.number(),
      extinction_coeff_reduced: z.number(),
      extinction_coeff_oxidized: z.number(),
      charge_at_ph7: z.number(),
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
          aromaticity: result.aromaticity.toString(),
          instabilityIndex: result.instability_index.toString(),
          gravy: result.gravy.toString(),
          isoelectricPoint: result.isoelectric_point.toString(),
          helixFraction: result.helix_fraction.toString(),
          turnFraction: result.turn_fraction.toString(),
          sheetFraction: result.sheet_fraction.toString(),
          extinctionCoeffReduced: result.extinction_coeff_reduced,
          extinctionCoeffOxidized: result.extinction_coeff_oxidized,
          chargeAtPh7: result.charge_at_ph7.toString(),
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
                aromaticity: result.aromaticity.toString(),
                instabilityIndex: result.instability_index.toString(),
                gravy: result.gravy.toString(),
                isoelectricPoint: result.isoelectric_point.toString(),
                helixFraction: result.helix_fraction.toString(),
                turnFraction: result.turn_fraction.toString(),
                sheetFraction: result.sheet_fraction.toString(),
                extinctionCoeffReduced: result.extinction_coeff_reduced,
                extinctionCoeffOxidized: result.extinction_coeff_oxidized,
                chargeAtPh7: result.charge_at_ph7.toString(),
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
} satisfies TRPCRouterRecord;
