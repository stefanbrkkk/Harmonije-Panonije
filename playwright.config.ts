import { defineConfig, devices } from "@playwright/test";

/**
 * Behavioral regression suite. Runs against the production server:
 *   npm run build && npm run test:e2e
 * (or `npm run qa` for the full chain — the build happens exactly once).
 * The webServer below serves the existing production build; it never
 * rebuilds. Set E2E_PORT to override the default 4311.
 *
 * Fresh-server ownership is the default: reusing a stale `next start`
 * process would silently test old code. Opt into reuse explicitly for
 * interactive development with PW_REUSE_EXISTING_SERVER=1.
 */
const port = Number(process.env.E2E_PORT ?? 4311);
// Cross-engine smoke runs in CI and on explicit request; local default is
// Chromium only so a missing WebKit/Firefox install never breaks `test:e2e`.
const crossBrowser = process.env.CI === "true" || process.env.PW_CROSS_BROWSER === "1";

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
      testIgnore: /cross-browser\.spec\.ts/,
    },
    // Cross-engine smoke only (full matrix stays on Chromium for speed).
    // Enabled in CI and with PW_CROSS_BROWSER=1; --project=webkit/firefox
    // also works explicitly once those browsers are installed.
    ...(crossBrowser
      ? [
          {
            name: "webkit" as const,
            use: { ...devices["Desktop Safari"] },
            testMatch: /cross-browser\.spec\.ts/,
          },
          {
            name: "firefox" as const,
            use: { ...devices["Desktop Firefox"] },
            testMatch: /cross-browser\.spec\.ts/,
          },
        ]
      : []),
  ],
  webServer: {
    command: `npm run start -- --port ${port}`,
    url: `http://localhost:${port}/`,
    reuseExistingServer: process.env.PW_REUSE_EXISTING_SERVER === "1",
    timeout: 120_000,
    stdout: "ignore",
    stderr: "pipe",
  },
});
