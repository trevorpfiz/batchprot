import { authRouter } from './router/auth';
import { feedbackRouter } from './router/feedback';
import { jobRouter } from './router/job';
import { createTRPCRouter } from './trpc';

export const appRouter = createTRPCRouter({
  auth: authRouter,
  job: jobRouter,
  feedback: feedbackRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
