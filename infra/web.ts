/** biome-ignore-all lint/correctness/noUndeclaredVariables: sst */
import { api } from './api.js';
import { rds } from './rds.js';
import { vpc } from './vpc.js';

export const web = new sst.aws.Nextjs('MyWeb', {
  path: 'apps/app',
  link: [rds, api],
  vpc,
  domain: {
    name: 'batchprot.com',
    redirects: ['www.batchprot.com'],
    dns: false,
    cert: 'arn:aws:acm:us-east-1:950158627409:certificate/2878e3f6-4b6f-41ce-968a-51315a6e5efa',
  },
});
