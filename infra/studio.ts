/** biome-ignore-all lint/correctness/noUndeclaredVariables: sst */
import { rds } from './rds.js';

// Create Drizzle Studio dev command
export const studio = new sst.x.DevCommand('Studio', {
  link: [rds],
  dev: {
    command: 'turbo run studio -F @repo/database',
  },
});
