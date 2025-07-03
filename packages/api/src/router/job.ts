import { and, desc, eq } from '@repo/database';
import {
  insertJobParams,
  Job,
  jobIdSchema,
  updateJobSchema,
} from '@repo/database/schema';
import type { TRPCRouterRecord } from '@trpc/server';

import { protectedProcedure } from '../trpc';

export const jobRouter = {
  byUser: protectedProcedure.query(async ({ ctx }) => {
    const { db, session } = ctx;
    const user = session.user;

    const jobs = await db.query.Job.findMany({
      where: eq(Job.userId, user.id),
      orderBy: desc(Job.createdAt),
      with: {
        proteinAnalyses: {
          limit: 5, // Include first 5 analyses for preview
        },
      },
    });

    return { jobs };
  }),

  byId: protectedProcedure.input(jobIdSchema).query(async ({ ctx, input }) => {
    const { db, session } = ctx;
    const user = session.user;
    const { id } = input;

    const job = await db.query.Job.findFirst({
      where: and(eq(Job.id, id), eq(Job.userId, user.id)),
      with: {
        proteinAnalyses: true,
      },
    });

    return { job };
  }),

  create: protectedProcedure
    .input(insertJobParams)
    .mutation(async ({ ctx, input }) => {
      const { db, session } = ctx;
      const user = session.user;
      const { title, algorithm } = input;

      const [job] = await db
        .insert(Job)
        .values({
          title,
          algorithm,
          userId: user.id,
        })
        .returning();

      return { job };
    }),

  rename: protectedProcedure
    .input(updateJobSchema.pick({ id: true, title: true }))
    .mutation(async ({ ctx, input }) => {
      const { db, session } = ctx;
      const user = session.user;
      const { id, title } = input;

      if (!id) {
        throw new Error('Job ID is required');
      }

      const [job] = await db
        .update(Job)
        .set({
          title,
          updatedAt: new Date(),
        })
        .where(and(eq(Job.id, id), eq(Job.userId, user.id)))
        .returning();

      return { job };
    }),

  updateStatus: protectedProcedure
    .input(updateJobSchema.pick({ id: true, status: true }))
    .mutation(async ({ ctx, input }) => {
      const { db, session } = ctx;
      const user = session.user;
      const { id, status } = input;

      if (!id) {
        throw new Error('Job ID is required');
      }

      const [job] = await db
        .update(Job)
        .set({
          status,
          updatedAt: new Date(),
        })
        .where(and(eq(Job.id, id), eq(Job.userId, user.id)))
        .returning();

      return { job };
    }),

  delete: protectedProcedure
    .input(jobIdSchema)
    .mutation(async ({ ctx, input }) => {
      const { db, session } = ctx;
      const user = session.user;
      const { id } = input;

      const [job] = await db
        .delete(Job)
        .where(and(eq(Job.id, id), eq(Job.userId, user.id)))
        .returning();

      return { job };
    }),
} satisfies TRPCRouterRecord;
