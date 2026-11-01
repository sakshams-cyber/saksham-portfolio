// Morph between two shapes (A → B) with per-particle staggered easing.
// morph.ts mirrors this math on the CPU (resolveInto) — keep the two in sync.
uniform float uProgress;     // 0 → 1, tweened on the CPU
uniform float uTime;         // seconds
uniform float uSize;         // base point size in world units (~0.11)
uniform float uScale;        // drawingBufferHeight / (2 * tan(fov/2))
uniform float uMaxPoint;     // GPU max point size (ALIASED_POINT_SIZE_RANGE[1])
uniform float uShapeScale;   // < 1 on portrait viewports

attribute vec3 aPosA;
attribute vec3 aPosB;
attribute vec3 aColA;
attribute vec3 aColB;
attribute float aSeed;       // 0..1, fixed per particle

varying vec3 vColor;

const float PI = 3.14159265;

void main() {
  // Stagger: particle i starts at progress d = seed/2, so up to half the cloud starts late and the
  // shape reassembles like a swarm. Remap [d, 1] → [0, 1], then smoothstep for soft ends.
  float d  = aSeed * 0.5;
  float le = clamp((uProgress - d) / (1.0 - d), 0.0, 1.0);
  le = le * le * (3.0 - 2.0 * le);

  vec3 p = mix(aPosA, aPosB, le) * uShapeScale;

  // Mid-flight bulge: paths arc outward in z during the morph; sin(πt) is zero at both ends.
  float bulge = sin(le * PI) * 1.3 * (0.4 + aSeed);
  p.z += bulge * (aSeed - 0.5);

  // Idle shimmer once settled (scaled by le so it doesn't fight the morph).
  float drift = 0.055 * le;
  p += drift * vec3(
    sin(uTime * 0.8 + aSeed * 31.0),
    cos(uTime * 0.7 + aSeed * 17.0),
    sin(uTime * 0.9 + aSeed * 23.0)
  );

  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  // Perspective size: world size × pixels-per-unit-at-distance-1 ÷ depth, clamped to the GPU max.
  // Points shrink with uShapeScale too, so portrait shapes keep the same density (not a blob).
  gl_PointSize = min(uSize * uShapeScale * uScale / max(0.001, -mv.z), uMaxPoint);
  vColor = mix(aColA, aColB, le);
}
