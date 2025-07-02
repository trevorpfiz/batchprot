import { createNextJsHandlers } from '@repo/auth/handlers';
import { auth } from '~/auth/server';

export const { GET, POST } = createNextJsHandlers(auth);
