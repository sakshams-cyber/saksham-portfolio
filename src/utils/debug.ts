/** Dev-only logging; compiled away in production builds (§0 rule 6). */
export function debugLog(...args: unknown[]): void {
  if (import.meta.env.DEV) console.warn('[portfolio]', ...args);
}
