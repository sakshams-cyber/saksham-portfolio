import { defineConfig, devices } from '@playwright/test';

// SwiftShader gives headless Chromium a working (slow) WebGL in CI (§17.3).
const webglArgs = ['--use-angle=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'];

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
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
      use: { ...devices['Desktop Chrome'], launchOptions: { args: webglArgs } },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
      // Visual baselines and context-loss simulation are Chromium-only; WebKit runs the rest.
      testIgnore: /visual\.spec\.ts/,
    },
  ],
});
