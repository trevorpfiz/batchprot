import { vpc } from './vpc';

export const rds = new sst.aws.Postgres('MyPostgres', {
  // https://sst.dev/docs/examples/#aws-postgres-local
  dev: {
    username: 'postgres',
    password: 'password',
    database: 'local',
    host: 'localhost',
    port: 5432,
  },
  vpc,
});

/**
 * ```bash
 * docker run \
 *   --rm \
 *   -p 5432:5432 \
 *   -v $(pwd)/.sst/storage/postgres:/var/lib/postgresql/data \
 *   -e POSTGRES_USER=postgres \
 *   -e POSTGRES_PASSWORD=password \
 *   -e POSTGRES_DB=local \
 *   postgres:16.4
 * ```
 */
