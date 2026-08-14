import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright configuration for Sunset SPA browser smoke tests.
 *
 * The smoke test starts vite preview (production build) and verifies:
 * - The SPA root loads and renders the shell
 * - No backend API requests are made during initial render
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 2 : 0,
  workers: process.env['CI'] ? 1 : undefined,
  reporter: 'list',
  use: {
    /* Base URL of vite preview — default port 4173 */
    baseURL: process.env['PREVIEW_URL'] ?? 'http://localhost:4173',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  /* Automatically start `vite preview` before running e2e tests */
  webServer: {
    command: 'npm run preview',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env['CI'],
    stdout: 'pipe',
    stderr: 'pipe',
  },
})
