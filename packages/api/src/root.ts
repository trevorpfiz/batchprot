import { jobRouter } from '~/src/router/job';
import { authRouter } from './router/auth';
import { createTRPCRouter } from './trpc';

export const appRouter = createTRPCRouter({
  auth: authRouter,
  job: jobRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
