/**
 * Calls `cb` once, the first time `el` scrolls into view. IntersectionObserver is the main
 * trigger; a throttled scroll check is the fallback for fast jumps (End key, scrollbar drag)
 * that carry an element from below the viewport to above it without it ever intersecting —
 * IO reports no change then, and the element would stay hidden forever.
 */
type Entry = { el: Element; cb: () => void; io: IntersectionObserver | null };

const pending = new Set<Entry>();
let listening = false;
let raf = 0;

function sweep() {
  raf = 0;
  const limit = window.innerHeight * 0.92;
  for (const e of pending) {
    // Reached or passed: its top is above the trigger line (including far above the viewport).
    if (e.el.getBoundingClientRect().top < limit) fire(e);
  }
  if (pending.size === 0 && listening) {
    window.removeEventListener('scroll', onScroll);
    listening = false;
  }
}

function onScroll() {
  if (!raf) raf = requestAnimationFrame(sweep);
}

function fire(e: Entry) {
  if (!pending.delete(e)) return;
  e.io?.disconnect();
  e.cb();
}

export function whenRevealed(el: Element, cb: () => void, threshold = 0.18): () => void {
  const entry: Entry = { el, cb, io: null };
  pending.add(entry);
  if (typeof IntersectionObserver === 'undefined') {
    fire(entry);
    return () => {};
  }
  entry.io = new IntersectionObserver(
    (records) => {
      if (records.some((r) => r.isIntersecting)) fire(entry);
    },
    { threshold, rootMargin: '0px 0px -8% 0px' },
  );
  entry.io.observe(el);
  if (!listening) {
    window.addEventListener('scroll', onScroll, { passive: true });
    listening = true;
  }
  onScroll(); // also catch anything already scrolled past (deep links, restored scroll)
  return () => {
    pending.delete(entry);
    entry.io?.disconnect();
  };
}
