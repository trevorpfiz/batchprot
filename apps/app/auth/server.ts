import 'server-only';

import { type AuthConfig, initAuth } from '@repo/auth';
import { headers } from 'next/headers';
import { cache } from 'react';

import { env } from '~/env';

const getBaseUrl = () => {
  if (env.NODE_ENV === 'production') {
    return `https://${env.NEXT_PUBLIC_APP_URL}`;
  }
  return 'http://localhost:3000';
};

const baseUrl = getBaseUrl();

const authConfig: AuthConfig = {
  baseUrl,
  productionUrl: `https://${env.NEXT_PUBLIC_APP_URL ?? 'turbo.t3.gg'}`,
  secret: env.AUTH_SECRET,
  githubClientId: env.AUTH_GITHUB_ID,
  githubClientSecret: env.AUTH_GITHUB_SECRET,
};

export const auth = initAuth(authConfig);
export type { Session, User } from '@repo/auth';

export const getSession = cache(async () =>
  auth.api.getSession({ headers: await headers() })
);
