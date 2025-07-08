/**
 * FastAPI Lambda function infrastructure
 */

import { rds } from './rds.js';
import { vpc } from './vpc.js';

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
});
