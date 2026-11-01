import { defineConfig, devices } from '@playwright/test';

// SwiftShader gives headless Chromium a working (slow) WebGL in CI (§17.3).
const webglArgs = ['--use-angle=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'];

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  // Each worker renders WebGL in software (SwiftShader); more than a few saturate the CPU.
  workers: process.env.CI ? 2 : 3,
  retries: process.env.CI ? 1 : 0,
  // Visual baselines are per-OS; a missing one (e.g. first Linux CI run) is written, not failed.
  updateSnapshots: 'missing',
  reporter: process.env.CI ? [['html', { open: 'never' }], ['list']] : 'list',
  use: { baseURL: 'http://localhost:4173', trace: 'retain-on-failure' },
  webServer: {
    command: 'npx vite preview --port 4173 --strictPort',
    port: 4173,
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    {
      name: 'chromium',
      // PW_CHANNEL=chrome runs against an installed Google Chrome instead of the bundled build.
      use: {
        ...devices['Desktop Chrome'],
        channel: process.env.PW_CHANNEL || undefined,
        launchOptions: { args: webglArgs },
      },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
      // Visual baselines and context-loss simulation are Chromium-only; WebKit runs the rest.
      testIgnore: /visual\.spec\.ts/,
    },
  ],
});
