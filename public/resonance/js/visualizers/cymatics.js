// Cymatics: sand on a vibrating plate. The plate's standing-wave field is a
// blend of Chladni modes, one per frequency band, weighted by that band's
// energy. Grains are kicked hard on antinodes and drift into the nodal lines,
// so the pattern re-forms whenever the music's balance shifts.

const N = 512;
const MODES = 6;

const FIELD = `
uniform vec2 uModes[${MODES}];
uniform float uWeights[${MODES}];
uniform float uRound;

float chladni(vec2 p, vec2 nm, float s) {
  if (uRound > 0.5) {
    float r = length(p);
    float a = atan(p.y, p.x);
    return cos(nm.x * a) * sin(nm.y * PI * r + 0.5) * (1.0 - r * 0.3) + s * 0.15 * cos(nm.y * 2.0 * PI * r);
  }
  // Centred on the plate, so every blend of modes stays mirror-symmetric.
  vec2 q = p * PI * 0.5;
  return cos(nm.x * q.x) * cos(nm.y * q.y) + s * cos(nm.y * q.x) * cos(nm.x * q.y);
}

float field(vec2 p) {
  float f = 0.0, w = 0.0;
  for (int i = 0; i < ${MODES}; i++) {
    f += uWeights[i] * chladni(p, uModes[i], (i % 2 == 0) ? -1.0 : 1.0);
    w += uWeights[i];
  }
  return f / max(w, 1e-3);
}
`;

const UPDATE = `#include common
in vec2 vUv; out vec4 o;
uniform sampler2D uState;
uniform float uDt, uForce, uShake, uDamp, uSeed, uDrive;
${FIELD}
void main() {
  vec4 s = texture(uState, vUv);
  vec2 p = s.xy, v = s.zw;
  const float e = 0.004;
  float f = field(p);
  vec2 g = vec2(field(p + vec2(e, 0)) - field(p - vec2(e, 0)), field(p + vec2(0, e)) - field(p - vec2(0, e))) / (2.0 * e);
  // Gradient of f^2 points away from nodal lines; descend it.
  // A silent plate doesn't vibrate: with no drive the grains coast to a stop.
  vec2 force = -2.0 * f * g * uForce * uDrive;
  vec2 rnd = hash22(vUv * 1931.0 + uSeed) - 0.5;
  float shake = abs(f) * (0.12 + uLevel * 1.4 + uBeat * 0.8) * uShake * uDrive;
  v = v * mix(0.8, uDamp, uDrive) + force * uDt * 0.06 + rnd * shake * 0.02;
  p += v * uDt * 6.0;

  bool outside = uRound > 0.5 ? length(p) > 1.0 : (abs(p.x) > 1.0 || abs(p.y) > 1.0);
  if (outside) {
    if (uRound > 0.5) p = normalize(p) * 0.995; else p = clamp(p, -0.995, 0.995);
    v *= -0.3;
  }
  o = vec4(p, v);
}`;

const DRAW_VS = `#include common
uniform sampler2D uState;
uniform vec2 uPlateScale;
uniform float uPointSize;
out vec4 vData;
void main() {
  ivec2 c = ivec2(gl_VertexID % ${N}, gl_VertexID / ${N});
  vec4 s = texelFetch(uState, c, 0);
  gl_Position = vec4(s.xy * uPlateScale, 0.0, 1.0);
  float tint = hash12(vec2(c));
  float speed = length(s.zw);
  vData = vec4(1.0, tint, min(speed * 4.0, 4.0), 0.0);
  gl_PointSize = uPointSize;
}`;

const DRAW_FS = `#include common
in vec4 vData; out vec4 o;
void main() {
  vec2 d = gl_PointCoord - 0.5;
  if (dot(d, d) > 0.25) discard;
  o = vData;
}`;

const PLATE = `#include common
in vec2 vUv; out vec4 o;
uniform sampler2D uSand;
uniform vec2 uPlateScale, uTexel;
uniform float uSandScale, uShimmer;
${FIELD}

float dens(vec2 uv) { return texture(uSand, uv).r * uSandScale; }

void main() {
  vec2 ndc = vUv * 2.0 - 1.0;
  vec2 p = ndc / uPlateScale; // plate coordinates
  float inside;
  float edgeDist;
  if (uRound > 0.5) { edgeDist = 1.0 - length(p); }
  else { edgeDist = 1.0 - max(abs(p.x), abs(p.y)); }
  inside = smoothstep(0.0, 0.004, edgeDist);

  // Backdrop: dark cloth with soft falloff.
  vec2 sp = vUv * uRes;
  float cloth = vnoise(sp * vec2(0.5, 0.05)) * 0.5 + vnoise(sp * vec2(0.05, 0.5)) * 0.5;
  vec3 bg = pal(0.0) * (0.25 + 0.1 * cloth) * (1.0 - length(ndc) * 0.35);

  // Plate: brushed metal tinted by the palette, with a broad light spot.
  float brushed = vnoise(vec2(p.x * 3.0, p.y * 380.0)) * 0.6 + vnoise(vec2(p.x * 9.0, p.y * 1200.0)) * 0.4;
  float spot = exp(-dot(p - vec2(-0.35, 0.4), p - vec2(-0.35, 0.4)) * 1.2);
  vec3 metal = mix(pal(0.08), pal(0.22), brushed * 0.5 + spot * 0.6) * (0.55 + 0.45 * spot);
  float fl = field(p);
  metal += pal(0.5) * (1.0 - smoothstep(0.0, 0.12, abs(fl))) * 0.05 * uShimmer * (0.3 + uLevel);
  metal += pal(0.3) * abs(fl) * 0.06 * uShimmer * uBeat;

  // Bevelled rim.
  float rim = smoothstep(0.03, 0.0, edgeDist) * inside;
  metal += pal(0.7) * rim * 0.35;

  // Sand: density -> height. Light it from the upper left, with contact shadows.
  vec4 sd = texture(uSand, vUv);
  float h = dens(vUv);
  float hl = dens(vUv - vec2(uTexel.x, 0.0)), hr = dens(vUv + vec2(uTexel.x, 0.0));
  float hb = dens(vUv - vec2(0.0, uTexel.y)), ht = dens(vUv + vec2(0.0, uTexel.y));
  vec3 n = normalize(vec3(hl - hr, hb - ht, 0.6));
  vec3 ld = normalize(vec3(-0.5, 0.6, 0.65));
  float diff = clamp(dot(n, ld), 0.0, 1.0);
  float shadow = 0.0;
  for (int i = 1; i <= 4; i++) shadow += dens(vUv + vec2(-uTexel.x, uTexel.y) * float(i) * 1.5);
  shadow = clamp(shadow * 0.25 - h, 0.0, 1.0);

  float cover = 1.0 - exp(-h * 1.6);
  float tint = sd.r > 0.0 ? sd.g / sd.r : 0.5;
  float hot = sd.r > 0.0 ? sd.b / sd.r : 0.0;
  vec3 sand = pal(mix(0.62, 0.92, tint)) * (0.35 + 0.85 * diff);
  sand = mix(sand, pal(1.0) * 1.6, clamp(hot * 0.6, 0.0, 1.0));
  sand *= 0.85 + 0.3 * hash12(sp);

  vec3 plate = metal * (1.0 - shadow * 0.6);
  vec3 col = mix(plate, sand, cover);
  o = vec4(mix(bg, col, inside), 1.0);
}`;

// Mode bank: low bands get broad, simple modes; high bands intricate ones.
const BASE_MODES = [[1, 2], [2, 3], [3, 5], [4, 7], [6, 9], [8, 11]];

export default class Cymatics {
  static id = 'cymatics';
  static label = 'Cymatics';
  static blurb = 'Sand settling into Chladni patterns on a vibrating plate';
  static renderScale = 1;
  static params = [
    { key: 'plate', label: 'Plate', type: 'select', options: ['Square', 'Round'], value: 0 },
    { key: 'force', label: 'Node pull', min: 0, max: 3, step: 0.01, value: 1 },
    { key: 'shake', label: 'Vibration', min: 0, max: 3, step: 0.01, value: 1 },
    { key: 'damp', label: 'Friction', min: 0.5, max: 0.98, step: 0.005, value: 0.86 },
    { key: 'drift', label: 'Mode drift', min: 0, max: 2, step: 0.01, value: 0.6 },
    { key: 'complexity', label: 'Complexity', min: 0.4, max: 2, step: 0.01, value: 1 },
    { key: 'grain', label: 'Grain size', min: 0.6, max: 3, step: 0.01, value: 1.2 },
    { key: 'shimmer', label: 'Plate shimmer', min: 0, max: 3, step: 0.01, value: 1 },
  ];

  constructor(core) {
    this.core = core;
    this.pUpdate = core.program(UPDATE);
    this.pDraw = core.program(DRAW_FS, DRAW_VS);
    this.pPlate = core.program(PLATE);
    this.state = core.pingpong(N, N, { format: 'RGBA32F', filter: 'nearest' });
    this.weights = new Float32Array(MODES).fill(0.2);
    this.modes = new Float32Array(MODES * 2);
    this.t = 0;
    this.drive = 0;
    this._seed();
  }

  _seed() {
    const d = new Float32Array(N * N * 4);
    for (let i = 0; i < N * N; i++) d.set([Math.random() * 2 - 1, Math.random() * 2 - 1, 0, 0], i * 4);
    const gl = this.core.gl;
    gl.bindTexture(gl.TEXTURE_2D, this.state.read.tex);
    gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, N, N, gl.RGBA, gl.FLOAT, d);
  }

  resize(w, h) {
    this.sand?.dispose();
    this.sand = this.core.target(w, h, { format: 'RGBA16F' });
  }

  frame(scene, dt, audio, params) {
    const core = this.core;
    dt = Math.min(dt, 1 / 30);
    // How hard the plate is being driven: 0 in silence, 1 once music is clearly playing.
    const drive = Math.min(1, Math.max(0, (audio.level - 0.005) / 0.04));
    this.drive += (drive - this.drive) * Math.min(1, dt * (drive > this.drive ? 12 : 3));
    this.t += dt * params.drift * this.drive;

    // Band weights, sharpened so the dominant band shapes the plate.
    const spec = audio.spectrum;
    let maxE = 0;
    const e = [];
    for (let i = 0; i < MODES; i++) {
      const a = Math.floor(Math.pow(i / MODES, 1.3) * spec.length);
      const b = Math.max(a + 1, Math.floor(Math.pow((i + 1) / MODES, 1.3) * spec.length));
      let s = 0;
      for (let j = a; j < b; j++) s += spec[j];
      e.push(s / (b - a));
      maxE = Math.max(maxE, e[i]);
    }
    for (let i = 0; i < MODES; i++) {
      const target = maxE > 0.02 ? Math.pow(e[i] / maxE, 3) + 0.02 : (i === 1 ? 1 : 0.05);
      this.weights[i] += (target - this.weights[i]) * Math.min(1, dt * 2.5);
      const [n, m] = BASE_MODES[i];
      const k = params.complexity;
      // Near-integer modes keep the plate symmetric; drift lets it breathe.
      this.modes[i * 2] = Math.max(1, Math.round(n * k)) + Math.sin(this.t * 0.31 + i * 1.7) * 0.12;
      this.modes[i * 2 + 1] = Math.max(1, Math.round(m * k)) + Math.sin(this.t * 0.23 + i * 2.3) * 0.12;
    }

    const aspect = scene.w / scene.h;
    const size = 0.9;
    const plateScale = aspect >= 1 ? [size / aspect, size] : [size, size * aspect];
    const shared = { uModes: this.modes, uWeights: this.weights, uRound: params.plate === 1 ? 1 : 0 };

    core.pass(this.pUpdate, {
      ...shared,
      uState: this.state.read,
      uDt: dt,
      uForce: params.force,
      uShake: params.shake,
      uDamp: params.damp,
      uDrive: this.drive,
      uSeed: Math.random() * 1000,
    }, this.state.write);
    this.state.swap();

    const grainPx = Math.max(1, (scene.h / 1000) * params.grain * 1.6);
    core.points(this.pDraw, { uState: this.state.read, uPlateScale: plateScale, uPointSize: grainPx }, N * N, this.sand, { blend: 'add', clear: true });

    // Density normalisation: grains per pixel area at uniform coverage.
    const plateArea = scene.w * plateScale[0] * scene.h * plateScale[1];
    const uniform = (N * N * grainPx * grainPx * 0.78) / plateArea;
    core.pass(this.pPlate, {
      ...shared,
      uSand: this.sand,
      uPlateScale: plateScale,
      uTexel: this.sand.texel,
      uSandScale: 0.6 / Math.max(uniform, 0.05),
      uShimmer: params.shimmer,
    }, scene);
  }

  dispose() {
    this.state.dispose();
    this.sand?.dispose();
  }
}
