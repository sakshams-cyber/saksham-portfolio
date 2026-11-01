uniform float uScale;
uniform float uSize;
attribute float aBright;
varying float vBright;

void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = max(1.0, uSize * uScale / max(0.001, -mv.z));
  vBright = aBright;
}
