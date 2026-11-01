export interface WebGLInfo {
  supported: boolean;
  renderer: string;
  /** Browser reports the context as software/slow (failIfMajorPerformanceCaveat). */
  slow: boolean;
  maxPointSize: number;
}

let cached: WebGLInfo | null = null;

/** Probe WebGL once with a throwaway canvas. Never throws. */
export function probeWebGL(): WebGLInfo {
  if (cached) return cached;
  const info: WebGLInfo = { supported: false, renderer: '', slow: false, maxPointSize: 64 };
  try {
    const cv = document.createElement('canvas');
    const fast =
      cv.getContext('webgl2', { failIfMajorPerformanceCaveat: true }) ??
      cv.getContext('webgl', { failIfMajorPerformanceCaveat: true });
    const gl = (fast ??
      cv.getContext('webgl2') ??
      cv.getContext('webgl')) as WebGLRenderingContext | null;
    if (gl) {
      info.supported = true;
      info.slow = !fast;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      info.renderer = String(
        ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER),
      );
      const range = gl.getParameter(gl.ALIASED_POINT_SIZE_RANGE) as Float32Array | null;
      if (range) info.maxPointSize = range[1];
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    }
  } catch {
    info.supported = false;
  }
  cached = info;
  return info;
}

export function webglSupported(): boolean {
  return probeWebGL().supported;
}
