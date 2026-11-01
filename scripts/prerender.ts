/**
 * Build step: render the app to static HTML and inject it into dist/index.html so crawlers,
 * link previewers and no-JS visitors get the complete content. React hydrates on top.
 */
import { readFileSync, rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const root = resolve(import.meta.dirname, '..');
const htmlPath = resolve(root, 'dist/index.html');
const ssrEntry = resolve(root, 'dist-ssr/entry-server.js');

const { render } = (await import(pathToFileURL(ssrEntry).href)) as { render: () => string };
const html = readFileSync(htmlPath, 'utf8');
if (!html.includes('<!--app-->'))
  throw new Error('prerender: <!--app--> marker missing in dist/index.html');
const out = html.replace('<!--app-->', render());
writeFileSync(htmlPath, out);
rmSync(resolve(root, 'dist-ssr'), { recursive: true, force: true });
console.log(`prerender: wrote ${(out.length / 1024).toFixed(1)} KB to dist/index.html`);
