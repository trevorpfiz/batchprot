import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const keys = () =>
  createEnv({
    server: {
      AUTH_GITHUB_ID: z.string().min(1),
      AUTH_GITHUB_SECRET: z.string().min(1),
      AUTH_SECRET:
        process.env.NODE_ENV === 'production'
          ? z.string().min(1)
          : z.string().min(1).optional(),
      NODE_ENV: z.enum(['development', 'production']).optional(),
    },
    runtimeEnv: {
      AUTH_GITHUB_ID: process.env.AUTH_GITHUB_ID,
      AUTH_GITHUB_SECRET: process.env.AUTH_GITHUB_SECRET,
      AUTH_SECRET: process.env.AUTH_SECRET,
      NODE_ENV: process.env.NODE_ENV,
    },
  });
