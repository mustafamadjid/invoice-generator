import { defineConfig } from 'vite'
import { fileURLToPath } from 'node:url'

// Dedicated verification bundle; never included in the production application's dist/.
export default defineConfig({
  build: {
    outDir: 'test-results/pdf-build',
    chunkSizeWarningLimit: 1200,
    rolldownOptions: {
      input: fileURLToPath(new URL('./fixtures/pdf.html', import.meta.url)),
    },
  },
})
