import { Feedback, insertFeedbackParams } from '@repo/database/schema';
import type { TRPCRouterRecord } from '@trpc/server';

import { protectedProcedure } from '../trpc';

export const feedbackRouter = {
  create: protectedProcedure
    .input(insertFeedbackParams)
    .mutation(async ({ ctx, input }) => {
      const { content } = input;
      const userId = ctx.session.user.id;

      const feedback = await ctx.db.insert(Feedback).values({
        content,
        userId,
      });

      return feedback;
    }),
} satisfies TRPCRouterRecord;
