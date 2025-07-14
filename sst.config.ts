/// <reference path="./.sst/platform/config.d.ts" />

/**
 * ## AWS Postgres local
 *
 * In this example, we connect to a locally running Postgres instance for dev. While
 * on deploy, we use RDS.
 *
 * We use the [`docker run`](https://docs.docker.com/reference/cli/docker/container/run/) CLI
 * to start a local container with Postgres. You don't have to use Docker, you can use
 * Postgres.app or any other way to run Postgres locally.
 *
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
 *
 * The data is saved to the `.sst/storage` directory. So if you restart the dev server, the
 * data will still be there.
 *
 * We then configure the `dev` property of the `Postgres` component with the settings for the
 * local Postgres instance.
 *
 * ```ts title="sst.config.ts"
 * dev: {
 *   username: "postgres",
 *   password: "password",
 *   database: "local",
 *   port: 5432,
 * }
 * ```
 *
 * By providing the `dev` prop for Postgres, SST will use the local Postgres instance and
 * not deploy a new RDS database when running `sst dev`.
 *
 * It also allows us to access the database through a Resource `link` without having to
 * conditionally check if we are running locally.
 *
 * ```ts title="index.ts"
 * const pool = new Pool({
 *   host: Resource.MyPostgres.host,
 *   port: Resource.MyPostgres.port,
 *   user: Resource.MyPostgres.username,
 *   password: Resource.MyPostgres.password,
 *   database: Resource.MyPostgres.database,
 * });
 * ```
 *
 * The above will work in both `sst dev` and `sst deploy`.
 */

export default $config({
  app(input) {
    return {
      name: 'batchprot',
      removal: input?.stage === 'production' ? 'retain' : 'remove',
      protect: ['production'].includes(input?.stage),
      home: 'aws',
      providers: {
        aws: {
          region: 'us-east-2',
          profile:
            input.stage === 'production' ? 'bioacc-production' : 'bioacc-dev',
        },
      },
    };
  },
  async run() {
    // Global infra

    // Infra in VPC
    const { vpc } = await import('./infra/vpc.js');
    const { rds } = await import('./infra/rds.js');
    const { web } = await import('./infra/web.js');
    const { studio } = await import('./infra/studio.js');
    const { api } = await import('./infra/api.js');

    return {
      webUrl: web.url,
      apiUrl: api.url,
    };
  },
});
