import type { Config } from 'drizzle-kit';
import { Resource } from 'sst';

export default {
  schema: './src/schema',
  dialect: 'postgresql',
  out: './migrations',
  dbCredentials: {
    ssl: false, // Local Postgres does not support SSL
    // ssl: {
    //   rejectUnauthorized: false,
    // },
    host: Resource.MyPostgres.host,
    port: Resource.MyPostgres.port,
    user: Resource.MyPostgres.username,
    password: Resource.MyPostgres.password,
    database: Resource.MyPostgres.database,
  },
  tablesFilter: ['prot_*'],
  casing: 'snake_case',
} satisfies Config;
