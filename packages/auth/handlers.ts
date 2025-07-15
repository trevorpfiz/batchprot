import 'server-only';

import { logger } from '@repo/logger';
import { toNextJsHandler } from 'better-auth/next-js';
import type { NextRequest } from 'next/server';
import type { Auth } from './index';

export function createNextJsHandlers(auth: Auth) {
  const originalHandlers = toNextJsHandler(auth.handler);

  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const GET = async (req: NextRequest, _ctx: any) => {
    logger.info(`--- Handling GET request for: ${req.url} ---`);
    try {
      const response = await originalHandlers.GET(req);
      logger.info(
        `--- Finished handling GET request for: ${req.url} with status: ${response.status} ---`
      );
      return response;
    } catch (error) {
      logger.error(`--- Error handling GET request for: ${req.url} ---`, error);
      throw error;
    }
  };

  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const POST = async (req: NextRequest, _ctx: any) => {
    const clonedReq = req.clone();
    logger.info(`--- Handling POST request for: ${req.url} ---`);
    try {
      const body = await clonedReq
        .json()
        .catch(() => 'could not parse body as json');
      logger.info('Request body:', body);
    } catch (_e) {
      logger.info('could not read body');
    }

    try {
      const response = await originalHandlers.POST(req);
      logger.info(
        `--- Finished handling POST request for: ${req.url} with status: ${response.status} ---`
      );
      return response;
    } catch (error) {
      logger.error(
        `--- Error handling POST request for: ${req.url} ---`,
        error
      );
      throw error;
    }
  };

  return { GET, POST };
}
