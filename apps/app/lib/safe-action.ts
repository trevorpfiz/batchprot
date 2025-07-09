import { createSafeActionClient } from 'next-safe-action';

import { z } from 'zod';
import { getSession } from '~/auth/server';

// Base client
export const actionClient = createSafeActionClient({
  defineMetadataSchema() {
    return z.object({
      actionName: z.string().optional(),
    });
  },
});

// Auth client
export const authActionClient = actionClient.use(async ({ next }) => {
  const session = await getSession();

  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  return next({ ctx: { user: session.user, session } });
});
