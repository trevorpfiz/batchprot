'use strict';

const react = require('@vitejs/plugin-react');
const { defineConfig } = require('vitest/config');

const config = defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
  },
  // Aliases are now handled by vite-tsconfig-paths in each app's vitest.config.ts
});

module.exports = config;
