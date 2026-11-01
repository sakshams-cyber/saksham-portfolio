# Saksham Srivastava — Particle Portfolio

A single-page portfolio in which one cloud of light particles keeps re-forming into the things the
work is about: a bird, a DNA double helix, a distress-call waveform, and the name. Each section
morphs the particles and recolours the page. Every project and award carries an honesty tag
(**Confirmed**, **Built** or **Prepared**), and a page-wide filter shows only one level at a time.

Stack: Vite · React 18 · TypeScript (strict) · three.js (raw, with custom shaders) · GSAP +
ScrollTrigger · Lenis · CSS Modules with design tokens. The page is pre-rendered to static HTML at
build time, so it reads fully without JavaScript, and it falls back to a static backdrop when WebGL
is unavailable or reduced motion is on.

## Run it

```bash
npm install
npm run dev            # http://localhost:5173
```

| Command | What it does |
|---|---|
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Typecheck, client build, SSR build, then pre-render into `dist/index.html` |
| `npm run preview` | Serve `dist/` on http://localhost:4173 |
| `npm run typecheck` / `npm run lint` | TypeScript and ESLint (with `jsx-a11y`) |
| `npm test` | Unit tests (Vitest): content schema, shapes, colours, morph maths |
| `npm run test:e2e` | Playwright: smoke, filter, fallbacks, axe, shapes, visual (needs `npm run build` first) |
| `npm run lhci` | Lighthouse CI against `dist/` with the thresholds in `lighthouserc.json` |
| `npm run og` | Regenerate `public/og-image.png` from the built site |
| `npm run icons` | Regenerate the PNG app icons |

The first e2e run needs browsers: `npx playwright install chromium webkit`.

### Test and debug URL flags

| Flag | Effect |
|---|---|
| `?nointro=1` | Skip the hero intro and start settled on the name |
| `?freeze=1` | Freeze time and make every tween instant (deterministic screenshots) |
| `?debug=1` | Debug panel: shape and accent buttons, FPS, particle count, GPU tier |
| `?forceStatic=1` | Behave as if WebGL were unavailable |
| `?level=confirmed` | Pre-select a confidence filter (also written by the filter itself) |

## Deploy

Set `VITE_SITE_URL` to the public origin, with no trailing slash (e.g.
`https://saksham.example.com`). It fills the canonical URL, Open Graph URLs and JSON-LD. The
default in `.env` is the placeholder `https://REPLACE_WITH_DOMAIN`.

- **Vercel (default):** import the repo. `vercel.json` sets the build command, output directory,
  immutable caching for `/assets` and `/fonts`, and security headers. Every PR gets a preview URL.
- **Netlify:** `netlify.toml` has the same build and headers.
- **Cloudflare Pages:** build command `npm run build`, output `dist`. Copy the headers from
  `netlify.toml` into a `public/_headers` file in the same format.
- **GitHub Pages:** build in a workflow and publish `dist/`. For a project subpath, set
  `base: '/<repo>/'` in `vite.config.ts` and update the absolute `/fonts/...` URLs in
  `src/styles/base.css` and `index.html`.

After the first deploy, run `npm run og` and commit the new `public/og-image.png`.

## Editing your portfolio

This section is for Saksham.

1. **All the words live in `src/content/portfolio.ts`.** You never need to touch the 3D code.
2. **To add a project,** copy an existing object inside the right section's `projects` array, give
   it a new unique `id` (lowercase-with-dashes), and set `level` honestly:
   - `confirmed`: it happened and can be checked (an award, a placement, a talk you gave).
   - `built`: the thing exists (code, paper, video), whatever the outcome.
   - `prepared`: applied, submitted, or a concept still in progress.
   Add `feature: true` to make a card span the full row.
3. **When an outcome lands** (for example IYRC acceptance or the App Challenge result), update the
   project's `note`. If it's now an award, add a row to the `awards` array with
   `level: 'confirmed'`.
4. **To change a section's colour or particle shape,** edit its `accent` (a `#rrggbb` hex) or its
   `shape` (`bird`, `helix`, `wave`, `name`, `sphere` or `ring`).
5. Run `npm run dev` to preview and `npm test` to check nothing broke. The content test fails if
   you use a banned word (like "revolutionary" or "passionate"), leave a placeholder (`TODO`,
   `TBD`, "fill in"), or give a project zero bullets. Then push; Vercel deploys automatically.

## How it works

- `src/content/`: the typed content model (`types.ts`), the data (`portfolio.ts`) and the schema
  checks (`validate.ts`).
- `src/three/`: the particle engine. Six seeded shape generators in `shapes/`; `morph.ts` owns the
  attribute buffers and tweens a single `uProgress` float; the vertex shader does the
  per-particle staggered morph on the GPU; `morph.ts` mirrors that maths on the CPU so an
  interrupted morph continues from where the particles actually are.
- `src/scroll/`: Lenis smooth scroll, the section director (ScrollTrigger: section → shape, accent
  and nav) and the timed hero intro.
- The engine (three.js) and the scroll stack (GSAP, Lenis) load as separate chunks after first
  paint. Hero text never waits on them.

Design and engineering decisions, deviations from the spec and known gaps are in
[DECISIONS.md](DECISIONS.md).
