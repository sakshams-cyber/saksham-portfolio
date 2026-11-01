precision mediump float;
uniform float uOpacity;      // global fade (hero 1.0, content 0.6)
varying vec3 vColor;

void main() {
  float r = length(gl_PointCoord - 0.5);
  float a = pow(smoothstep(0.5, 0.0, r), 1.6) * uOpacity;  // soft round sprite
  if (a < 0.01) discard;
  // Premultiplied output with ONE/ONE blending: sums stay valid (rgb ≤ alpha) on a transparent
  // canvas, and capping at 0.95 keeps dense letters tinted instead of blowing out to white.
  gl_FragColor = vec4(min(vColor, vec3(0.95)) * a, a);
}
