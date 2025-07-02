import { defaultPlugins, defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
  input:
    'https://nfkxbhletrjyqsuq3jggydfrl40kmcyf.lambda-url.us-east-2.on.aws/api/v1/openapi.json',
  output: {
    format: 'biome',
    lint: 'biome',
    path: 'src/client',
  },

  // Plugins configuration
  plugins: [
    ...defaultPlugins,
    '@hey-api/client-next',
    '@tanstack/react-query',
    'zod',
  ],
});
