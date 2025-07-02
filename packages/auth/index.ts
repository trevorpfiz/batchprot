import { db } from '@repo/database/client';
import type { BetterAuthOptions } from 'better-auth';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { nextCookies } from 'better-auth/next-js';
import { jwt } from 'better-auth/plugins';

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
      provider: 'pg',
    }),
    baseURL: options.baseUrl,
    plugins: [
      jwt({
        jwks: {
          keyPairConfig: {
            alg: 'RS256', // RSA256 algorithm for FastAPI compatibility
            modulusLength: 2048, // Optional: key size (default is 2048)
          },
        },
        jwt: {
          // Customize JWT payload for FastAPI backend
          definePayload: ({ user }) => {
            return {
              sub: user.id, // Standard 'subject' claim
              email: user.email,
              name: user.name,
              // Add any other claims your FastAPI backend needs
            };
          },
          expirationTime: '1h', // Adjust as needed
          issuer: options.baseUrl,
          audience: options.baseUrl,
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
