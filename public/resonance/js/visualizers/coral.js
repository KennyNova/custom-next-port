// Coral: Gray-Scott reaction-diffusion. Feed and kill rates vary across the
// canvas with the spectrum (radius = frequency), so loud bands grow and
// quiet ones recede. Beats seed new colonies; the result is lit as glossy
// relief so the patterns read as a carved, wet surface.

const PRESETS = [
  { name: 'Coral', f: 0.0545, k: 0.062 },
  { name: 'Worms', f: 0.046, k: 0.063 },
  { name: 'Maze', f: 0.029, k: 0.057 },
  { name: 'Mitosis', f: 0.0367, k: 0.0649 },
  { name: 'Spots', f: 0.035, k: 0.065 },
];

const STEP = `#include common
in vec2 vUv; out vec4 o;
uniform sampler2D uState;
uniform vec2 uTexel;
uniform float uF, uK, uReact, uTwist, uAspect, uSeedOn;
uniform vec3 uSeed; // x, y, radius (uv); applied when uSeedOn > 0

vec2 at(vec2 uv) { return texture(uState, uv).xy; }

void main() {
  vec2 c = vUv - 0.5;
  // Low-mids slowly twist the medium, which drags patterns into spirals.
  float tw = uTwist * (0.0004 + uLowMid * 0.002) * smoothstep(0.5, 0.0, length(c));
  vec2 uv = 0.5 + rot(tw) * c;

  vec2 s = at(uv);
  vec2 lap = -s;
  lap += 0.2 * (at(uv + vec2(uTexel.x, 0)) + at(uv - vec2(uTexel.x, 0)) + at(uv + vec2(0, uTexel.y)) + at(uv - vec2(0, uTexel.y)));
  lap += 0.05 * (at(uv + uTexel) + at(uv - uTexel) + at(uv + vec2(uTexel.x, -uTexel.y)) + at(uv + vec2(-uTexel.x, uTexel.y)));

  // Frequency mapped to radius: centre is bass, rim is treble.
  vec2 pc = c * vec2(uAspect, 1.0);
  float r = clamp(length(pc) / (0.5 * max(uAspect, 1.0)), 0.0, 1.0);
  float e = spec(r * 0.9);
  float f = uF + (e - 0.35) * 0.008 * uReact;
  float k = uK - (e - 0.35) * 0.0035 * uReact;

  float a = s.x, b = s.y;
  float abb = a * b * b;
  a += (1.0 * lap.x - abb + f * (1.0 - a));
  b += (0.5 * lap.y + abb - (k + f) * b);

  if (uSeedOn > 0.0) {
    vec2 d = (vUv - uSeed.xy) * vec2(uAspect, 1.0);
    float m = smoothstep(uSeed.z, uSeed.z * 0.5, length(d));
    float ring = m * (0.5 + 0.5 * step(0.5, hash12(floor(vUv / uTexel / 3.0))));
    b = max(b, ring * 0.9);
  }
  o = vec4(clamp(a, 0.0, 1.0), clamp(b, 0.0, 1.0), 0.0, 1.0);
}`;

const DISPLAY = `#include common
in vec2 vUv; out vec4 o;
uniform sampler2D uState;
uniform vec2 uTexel;
uniform float uRelief, uGloss, uAspect, uGlow;
float hB(vec2 uv) { return texture(uState, uv).y; }
void main() {
  vec2 s = texture(uState, vUv).xy;
  float b = s.y;
  float d = 1.5;
  float l = hB(vUv - vec2(uTexel.x * d, 0)), r = hB(vUv + vec2(uTexel.x * d, 0));
  float bt = hB(vUv - vec2(0, uTexel.y * d)), t = hB(vUv + vec2(0, uTexel.y * d));
  vec3 n = normalize(vec3((l - r) * uRelief * 6.0, (bt - t) * uRelief * 6.0, 1.0));
  vec3 ld = normalize(vec3(-0.45, 0.55, 0.7));
  float diff = clamp(dot(n, ld), 0.0, 1.0);
  vec3 h = normalize(ld + vec3(0, 0, 1));
  float sp = pow(max(dot(n, h), 0.0), 60.0) * uGloss;

  // Cheap cavity term from a wider ring of samples.
  float cav = 0.0;
  for (int i = 0; i < 8; i++) {
    float a = float(i) / 8.0 * TAU;
    cav += hB(vUv + vec2(cos(a), sin(a)) * uTexel * 5.0);
  }
  cav = clamp(b - cav / 8.0 + 0.5, 0.0, 1.0);

  float v = smoothstep(0.08, 0.42, b);
  vec3 base = pal(v * 0.9 + 0.05);
  vec3 col = base * (0.35 + 0.85 * diff) * mix(0.7, 1.15, cav);
  col += pal(1.0) * sp;

  // Living edges glow with the music.
  float edge = smoothstep(0.05, 0.25, b) * (1.0 - smoothstep(0.25, 0.4, b));
  vec2 pc = (vUv - 0.5) * vec2(uAspect, 1.0);
  float e = spec(clamp(length(pc) / (0.5 * max(uAspect, 1.0)), 0.0, 1.0) * 0.9);
  col += pal(0.85) * edge * e * e * uGlow * 1.5;

  o = vec4(col, 1.0);
}`;

export default class Coral {
  static id = 'coral';
  static label = 'Coral';
  static blurb = 'Reaction-diffusion growth fed by the spectrum';
  static renderScale = 1;
  static params = [
    { key: 'preset', label: 'Pattern', type: 'select', options: PRESETS.map((p) => p.name), value: 0 },
    { key: 'speed', label: 'Growth speed', min: 1, max: 24, step: 1, value: 12 },
    { key: 'react', label: 'Audio reaction', min: 0, max: 2, step: 0.01, value: 1 },
    { key: 'twist', label: 'Twist', min: 0, max: 3, step: 0.01, value: 1 },
    { key: 'seeds', label: 'Beat seeding', min: 0, max: 2, step: 0.01, value: 1 },
    { key: 'scale', label: 'Pattern scale', min: 0.25, max: 1, step: 0.05, value: 0.5 },
    { key: 'relief', label: 'Relief', min: 0, max: 3, step: 0.01, value: 1.2 },
    { key: 'gloss', label: 'Gloss', min: 0, max: 2, step: 0.01, value: 0.8 },
    { key: 'glow', label: 'Edge glow', min: 0, max: 3, step: 0.01, value: 1 },
  ];

  constructor(core) {
    this.core = core;
    this.pStep = core.program(STEP);
    this.pDisplay = core.program(DISPLAY);
    this.lastBeat = 0;
    this.scale = 0;
    this.seedQueue = [];
    this._onDown = (e) => {
      if (e.target !== core.canvas) return;
      const r = core.canvas.getBoundingClientRect();
      this.seedQueue.push([(e.clientX - r.left) / r.width, 1 - (e.clientY - r.top) / r.height, 0.03]);
    };
    window.addEventListener('pointerdown', this._onDown);
  }

  resize(w, h) {
    this.sw = w;
    this.sh = h;
    this.scale = 0; // force a rebuild at the current pattern scale
  }

  _build(scale) {
    this.state?.dispose();
    const w = Math.max(64, Math.round(this.sw * scale));
    const h = Math.max(64, Math.round(this.sh * scale));
    this.state = this.core.pingpong(w, h, { format: 'RGBA32F', filter: 'linear' });
    const d = new Float32Array(w * h * 4);
    for (let i = 0; i < w * h; i++) d.set([1, 0, 0, 1], i * 4);
    // A scatter of initial colonies.
    for (let s = 0; s < 40; s++) {
      const cx = Math.floor(Math.random() * w);
      const cy = Math.floor(Math.random() * h);
      const rad = 2 + Math.floor(Math.random() * 4);
      for (let y = -rad; y <= rad; y++) {
        for (let x = -rad; x <= rad; x++) {
          const px = (cx + x + w) % w;
          const py = (cy + y + h) % h;
          d[(py * w + px) * 4 + 1] = 0.9;
        }
      }
    }
    const gl = this.core.gl;
    gl.bindTexture(gl.TEXTURE_2D, this.state.read.tex);
    gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, w, h, gl.RGBA, gl.FLOAT, d);
    this.scale = scale;
  }

  frame(scene, dt, audio, params) {
    if (this.scale !== params.scale) this._build(params.scale);
    const core = this.core;
    const preset = PRESETS[params.preset] || PRESETS[0];
    const aspect = scene.w / scene.h;

    if (audio.beatCount !== this.lastBeat) {
      this.lastBeat = audio.beatCount;
      const n = Math.round((1 + audio.bands.bass * 3) * params.seeds);
      for (let i = 0; i < n; i++) {
        // Seed at the radius of the loudest region, in a random direction.
        const a = Math.random() * Math.PI * 2;
        const r = 0.05 + audio.centroid * 0.4;
        this.seedQueue.push([0.5 + (Math.cos(a) * r) / aspect, 0.5 + Math.sin(a) * r, 0.006 + audio.bands.bass * 0.012]);
      }
    }
    if (Math.random() < audio.bands.high * 0.15 * params.seeds) {
      this.seedQueue.push([Math.random(), Math.random(), 0.004]);
    }

    const iters = Math.round(params.speed);
    for (let i = 0; i < iters; i++) {
      const seed = i === 0 ? this.seedQueue.shift() : null;
      core.pass(this.pStep, {
        uState: this.state.read,
        uTexel: this.state.texel,
        uF: preset.f,
        uK: preset.k,
        uReact: params.react,
        // Twisting resamples the grid, so apply it once per frame to avoid blurring.
        uTwist: i === 0 ? params.twist * 4 : 0,
        uAspect: aspect,
        uSeedOn: seed ? 1 : 0,
        uSeed: seed || [0, 0, 0],
      }, this.state.write);
      this.state.swap();
    }
    if (this.seedQueue.length > 24) this.seedQueue.length = 24;

    core.pass(this.pDisplay, {
      uState: this.state.read,
      uTexel: this.state.texel,
      uRelief: params.relief,
      uGloss: params.gloss,
      uAspect: aspect,
      uGlow: params.glow,
    }, scene);
  }

  dispose() {
    window.removeEventListener('pointerdown', this._onDown);
    this.state?.dispose();
  }
}
