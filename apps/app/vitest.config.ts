import sharedConfig from '@repo/testing';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig, mergeConfig } from 'vitest/config';

export default mergeConfig(
  sharedConfig,
  defineConfig({
    plugins: [tsconfigPaths()],
  })
);
