import { useEffect, useState } from 'react';
import { sections } from '../content/portfolio';
import { SHAPE_KEYS } from '../content/types';
import type { Engine, EngineStats } from './engine';

const ACCENTS = [...new Set(sections.map((s) => s.accent))];

/** ?debug=1 panel: drive setTarget by hand and watch FPS / particle count / tier. */
export function DebugPanel({ engine }: { engine: Engine }) {
  const [stats, setStats] = useState<EngineStats>(engine.stats());
  const [accent, setAccent] = useState(ACCENTS[0]);
  useEffect(() => {
    const id = window.setInterval(() => setStats(engine.stats()), 500);
    return () => window.clearInterval(id);
  }, [engine]);
  return (
    <div
      style={{
        position: 'fixed',
        left: 12,
        bottom: 12,
        zIndex: 60,
        padding: 12,
        width: 260,
        background: 'rgba(5,7,14,.92)',
        border: '1px solid rgba(255,255,255,.2)',
        fontSize: 11,
        fontFamily: 'ui-monospace, monospace',
      }}
    >
      <div>
        fps {stats.fps.toFixed(0)} · n {stats.particles} · tier {stats.tier}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 8 }}>
        {SHAPE_KEYS.map((k) => (
          <button key={k} type="button" onClick={() => engine.setTarget(k, accent)}>
            {k}
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 8 }}>
        {ACCENTS.map((a) => (
          <button
            key={a}
            type="button"
            aria-label={`accent ${a}`}
            onClick={() => {
              setAccent(a);
              engine.setTarget(
                engine.current().shape === 'scatter' ? 'name' : (engine.current().shape as never),
                a,
              );
            }}
            style={{
              width: 22,
              height: 18,
              background: a,
              border: a === accent ? '2px solid #fff' : '0',
            }}
          />
        ))}
      </div>
    </div>
  );
}
