import { defineConfig, devices } from "@playwright/test";

/**
 * Behavioral regression suite. Runs against the production server:
 *   npm run build && npm run test:e2e
 * (or `npm run qa` for the full chain — the build happens exactly once).
 * The webServer below serves the existing production build; it never
 * rebuilds. Set E2E_PORT to override the default 4311.
 */
const port = Number(process.env.E2E_PORT ?? 4311);

export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"], ["html", { open: "never" }]],
  timeout: 120_000,
  expect: { timeout: 8_000 },
  use: {
    baseURL: `http://localhost:${port}`,
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: `npm run start -- --port ${port}`,
    url: `http://localhost:${port}/`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    stdout: "ignore",
    stderr: "pipe",
  },
});
