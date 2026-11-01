/**
 * Renders public/og-image.png (1200×630): the built site in ?og=1 mode — only the name over the
 * settled `name` particle shape. Run after `npm run build`: `npm run og`.
 */
import { spawn } from 'node:child_process';
import { resolve } from 'node:path';
import { chromium } from '@playwright/test';

const root = resolve(import.meta.dirname, '..');
const port = 4179;
const server = spawn('npx', ['vite', 'preview', '--port', String(port), '--strictPort'], {
  cwd: root,
  stdio: 'ignore',
});

try {
  await new Promise((r) => setTimeout(r, 1500));
  const browser = await chromium.launch({
    channel: process.env.PW_CHANNEL || undefined,
    args: ['--use-angle=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'],
  });
  const page = await browser.newPage({
    viewport: { width: 1200, height: 630 },
    deviceScaleFactor: 1,
  });
  await page.goto(`http://localhost:${port}/?nointro=1&freeze=1&og=1`);
  await page.waitForFunction(
    () => document.documentElement.style.getPropertyValue('--accent') !== '',
  );
  await page.waitForTimeout(3000); // engine boot + opacity fade under SwiftShader
  await page.screenshot({ path: resolve(root, 'public/og-image.png') });
  await browser.close();
  console.log('og-image.png written');
} finally {
  server.kill();
}
