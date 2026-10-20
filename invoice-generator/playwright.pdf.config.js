import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  testMatch: 'pdf.spec.js',
  outputDir: 'test-results/pdf-browser',
  projects: [
    { name: 'development', use: { channel: process.env.PLAYWRIGHT_CHANNEL || 'chrome', baseURL: 'http://127.0.0.1:5173' } },
    { name: 'production', use: { channel: process.env.PLAYWRIGHT_CHANNEL || 'chrome', baseURL: 'http://127.0.0.1:4174' } },
    { name: 'firefox', use: { browserName: 'firefox', baseURL: 'http://127.0.0.1:5173' } },
  ],
  webServer: [
    {
      command: 'npm run dev -- --host 127.0.0.1',
      url: 'http://127.0.0.1:5173', reuseExistingServer: !process.env.CI,
    },
    {
      command: 'npm run build:pdf-test && npm run preview -- --outDir test-results/pdf-build --host 127.0.0.1 --port 4174 --strictPort',
      url: 'http://127.0.0.1:4174/e2e/fixtures/pdf.html',
      reuseExistingServer: false,
    },
  ],
})
