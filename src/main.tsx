import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { App } from './App';
import { person, sections } from './content/portfolio';
import { validateContent } from './content/validate';
import './styles/tokens.css';
import './styles/base.css';
import './styles/motion.css';

declare global {
  interface Window {
    __app?: boolean;
  }
}

if (import.meta.env.DEV) validateContent(sections, person);

window.__app = true;
const root = document.getElementById('root')!;
const tree = (
  <StrictMode>
    <App />
  </StrictMode>
);
// Production HTML is pre-rendered (scripts/prerender.ts), so hydrate; dev starts empty.
if (root.firstElementChild) hydrateRoot(root, tree);
else createRoot(root).render(tree);
