precision mediump float;
uniform float uOpacity;
varying float vBright;

void main() {
  float r = length(gl_PointCoord - 0.5);
  float a = smoothstep(0.5, 0.1, r) * vBright * uOpacity;
  if (a < 0.004) discard;
  // Dim blue-grey with a slight blue bias.
  gl_FragColor = vec4(vec3(0.82, 0.88, 1.0) * a, a);
}
