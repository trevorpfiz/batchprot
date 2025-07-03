import type { Config } from 'drizzle-kit';
import { Resource } from 'sst';

export default {
  schema: './src/schema.ts',
  dialect: 'postgresql',
  out: './migrations',
  dbCredentials: {
    host: Resource.MyPostgres.host,
    port: Resource.MyPostgres.port,
    user: Resource.MyPostgres.username,
    password: Resource.MyPostgres.password,
    database: Resource.MyPostgres.database,
    ssl:
      Resource.MyPostgres.host !== 'localhost'
        ? {
            rejectUnauthorized: false,
          }
        : false,
  },
  tablesFilter: ['prot_*'],
  casing: 'snake_case',
} satisfies Config;
