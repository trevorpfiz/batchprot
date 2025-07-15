import 'server-only';

import { type AuthConfig, initAuth } from '@repo/auth';
import { logger } from '@repo/logger';
import { headers } from 'next/headers';
import { cache } from 'react';
import { env } from '~/env';

const getBaseUrl = () => {
  if (env.NODE_ENV === 'production') {
    return `${env.NEXT_PUBLIC_APP_URL}`;
  }
  return 'http://localhost:3000';
};

const baseUrl = getBaseUrl();

const authConfig: AuthConfig = {
  baseUrl,
  productionUrl: `https://${env.NEXT_PUBLIC_APP_URL ?? 'batchprot.com'}`,
  secret: env.BETTER_AUTH_SECRET,
  githubClientId: env.AUTH_GITHUB_ID,
  githubClientSecret: env.AUTH_GITHUB_SECRET,
};

export const auth = initAuth(authConfig);
export type { Session, User } from '@repo/auth';

export const getSession = cache(async () =>
  auth.api.getSession({ headers: await headers() })
);

// can be use to get the jwt from a server component to pass it to the fastapi
export const getFastApiJwt = async (
  sessionToken: string
): Promise<string | null> => {
  try {
    const tokenResponse = await fetch(
      new URL('/api/auth/token', env.NEXT_PUBLIC_APP_URL),
      {
        headers: {
          Authorization: `Bearer ${sessionToken}`,
        },
      }
    );

    if (tokenResponse.ok) {
      const { token } = (await tokenResponse.json()) as { token: string };
      return token;
    }

    const errorText = await tokenResponse.text();
    logger.error(`Error fetching FastAPI JWT: ${errorText}`);
    return null;
  } catch (e) {
    logger.error(
      `An unexpected error occurred while fetching FastAPI JWT: ${
        (e as Error).message
      }`,
      {
        error: e,
      }
    );
    return null;
  }
};
