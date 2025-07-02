import 'server-only';
import { toNextJsHandler } from 'better-auth/next-js';
import type { Auth } from './index';

export function createNextJsHandlers(auth: Auth) {
  return toNextJsHandler(auth.handler);
}
