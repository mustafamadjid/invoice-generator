import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  testMatch: 'production.spec.js',
  outputDir: 'test-results/production-app',
  projects: [
    { name: 'production-desktop', use: { baseURL: 'http://127.0.0.1:4173', channel: process.env.PLAYWRIGHT_CHANNEL || 'chrome', viewport: { width: 1440, height: 1000 } } },
    { name: 'production-mobile', use: { baseURL: 'http://127.0.0.1:4173', channel: process.env.PLAYWRIGHT_CHANNEL || 'chrome', viewport: { width: 390, height: 844 } } },
    { name: 'production-firefox', use: { browserName: 'firefox', baseURL: 'http://127.0.0.1:4173', viewport: { width: 1440, height: 1000 } } },
  ],
  webServer: {
    command: 'npm run preview -- --host 127.0.0.1 --port 4173 --strictPort',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: false,
  },
})
