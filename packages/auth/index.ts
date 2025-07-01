import { db } from '@repo/database/client';
import type { BetterAuthOptions } from 'better-auth';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { jwt } from 'better-auth/plugins';

export function initAuth(options: {
  baseUrl: string;
  productionUrl: string;
  secret: string | undefined;

  githubClientId: string;
  githubClientSecret: string;
}) {
  const config = {
    database: drizzleAdapter(db, {
      provider: 'pg',
    }),
    baseURL: options.baseUrl,
    plugins: [
      jwt({
        jwks: {
          keyPairConfig: {
            alg: 'RS256', // RSA256 algorithm
            modulusLength: 2048, // Optional: key size (default is 2048)
          },
        },
      }),
    ],
    secret: options.secret,
    socialProviders: {
      github: {
        clientId: options.githubClientId,
        clientSecret: options.githubClientSecret,
      },
    },
  } satisfies BetterAuthOptions;

  return betterAuth(config);
}

export type Auth = ReturnType<typeof initAuth>;
export type Session = Auth['$Infer']['Session'];
