import { rds } from './rds.js';
import { vpc } from './vpc.js';

export const web = new sst.aws.Nextjs('MyWeb', {
  path: 'apps/app',
  link: [rds],
  vpc,
});
