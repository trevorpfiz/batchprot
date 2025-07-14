import { db } from '@repo/database/client';
// biome-ignore lint: The Drizzle adapter requires the full schema object.
import * as schema from '@repo/database/schema';
import type { BetterAuthOptions } from 'better-auth';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { nextCookies } from 'better-auth/next-js';
import { bearer, jwt } from 'better-auth/plugins';

export interface AuthConfig {
  baseUrl: string;
  productionUrl?: string;
  secret: string | undefined;
  githubClientId: string;
  githubClientSecret: string;
}

export function initAuth(options: AuthConfig) {
  const config = {
    database: drizzleAdapter(db, {
      schema: {
        ...schema,
      },
      provider: 'pg',
    }),
    baseURL: options.baseUrl,
    emailAndPassword: {
      enabled: true,
    },
    plugins: [
      bearer({
        requireSignature: true,
      }),
      jwt({
        jwt: {
          expirationTime: '1y',
        },
        jwks: {
          keyPairConfig: {
            alg: 'EdDSA',
            crv: 'Ed25519',
          },
        },
      }),
      nextCookies(), // Must be last plugin for Next.js cookie handling
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
export type User = Session['user'];
