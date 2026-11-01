/** Calls onChange(visible) whenever the page's visibility changes. Returns an unsubscribe. */
export function onVisibilityChange(onChange: (visible: boolean) => void): () => void {
  const handler = () => onChange(document.visibilityState === 'visible');
  document.addEventListener('visibilitychange', handler);
  return () => document.removeEventListener('visibilitychange', handler);
}
