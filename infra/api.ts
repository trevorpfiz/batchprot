/**
 * FastAPI Lambda function infrastructure
 */
/** biome-ignore-all lint/correctness/noUndeclaredVariables: sst */

import { rds } from './rds.js';
import { vpc } from './vpc.js';

const BACKEND_CORS_ORIGINS =
  $app.stage !== 'production'
    ? 'http://localhost:3000,http://127.0.0.1:3000'
    : 'https://batchprot.com,https://www.batchprot.com';
const ENVIRONMENT = $app.stage !== 'production' ? 'dev' : 'production';
const AUTH_BASE_URL =
  $app.stage !== 'production'
    ? 'http://localhost:3000'
    : 'https://batchprot.com';

export const api = new sst.aws.Function('BatchProtAPI', {
  python: {
    container: true,
  },
  handler: './functions/src/functions/main.handler',
  runtime: 'python3.12',
  timeout: '30 seconds',
  memory: '1024 MB',
  url: true,
  link: [rds],
  vpc,
  environment: {
    BACKEND_CORS_ORIGINS,
    ENVIRONMENT,
    AUTH_BASE_URL,
  },
});
