import { useEffect, useRef, useState } from 'react';
import { store } from '../state/store';
import { flags } from '../utils/params';
import { engineBridge } from './bridge';
import { createEngine, type Engine } from './engine';
import { detectTier, qualityFor } from './quality';
import { probeWebGL } from './webgl-support';
import { DebugPanel } from './DebugPanel';
import { initialTarget } from '../scroll/initial';
import styles from './ParticleField.module.css';

declare global {
  interface Window {
    __engine?: Engine;
  }
}

/** Mounts the one fixed canvas behind the content and boots the engine (lazy chunk). */
export default function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [engine, setEngine] = useState<Engine | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let disposed = false;
    let eng: Engine | null = null;
    const tier = detectTier();
    if (tier === 0) {
      store.set({ engineStatus: 'static' });
      return;
    }
    store.set({ engineStatus: 'loading' });
    // Shapes are generated in an idle callback so the hero text always paints first.
    const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 1));
    const handle = idle(async () => {
      try {
        eng = await createEngine({
          canvas,
          quality: qualityFor(tier),
          freeze: flags.freeze,
          maxPointSize: probeWebGL().maxPointSize,
          initial: initialTarget(),
          onStatus: (s) => {
            store.set({ engineStatus: s });
            setVisible(s === 'running');
          },
        });
        if (disposed) {
          eng.dispose();
          return;
        }
        if (flags.debug) window.__engine = eng;
        setEngine(eng);
        engineBridge.register(eng);
      } catch (err) {
        console.error('Particle engine failed; using static backdrop.', err);
        store.set({ engineStatus: 'static' });
      }
    });
    return () => {
      disposed = true;
      if (typeof handle === 'number') window.cancelIdleCallback?.(handle);
      engineBridge.register(null);
      eng?.dispose();
    };
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        className={`${styles.canvas} ${visible ? styles.visible : ''}`}
        aria-hidden="true"
        tabIndex={-1}
        data-testid="particles"
      />
      {flags.debug && engine && <DebugPanel engine={engine} />}
    </>
  );
}
