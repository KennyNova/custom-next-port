// Flow: a quarter-million particles advected through layered curl noise.
// They are born on a ring shaped by the spectrum, carry the colour of the
// frequency they came from, and leave smeared trails in a feedback buffer.

const N = 512;

const UPDATE = `#include common
in vec2 vUv; out vec4 o;
uniform sampler2D uState;
uniform float uDt, uAspect, uScale, uSpeed, uTurb, uSwirl, uPulse, uSeed;

vec4 spawn(vec2 id) {
  vec3 h = hash32(id * 913.7 + uSeed);
  float x = h.x;                         // frequency 0..1 (mirrored around the ring)
  float a = (x * 0.5 + (h.y > 0.5 ? 0.5 : 0.0)) * TAU + uTime * 0.05;
  float s = spec(x);
  float r = 0.22 + uBass * 0.12 + s * 0.42 + (h.z - 0.5) * 0.05;
  return vec4(cos(a) * r, sin(a) * r, h.z * 0.2, x);
}

void main() {
  vec4 s = texture(uState, vUv);
  vec2 p = s.xy;
  float age = s.z;
  float t = uTime * 0.06;

  vec2 v = curl(vec3(p * uScale, t)) * (0.08 + uMid * 0.5) * uTurb;
  v += curl(vec3(p * uScale * 2.7 + 5.2, t * 1.9)) * (0.02 + uHigh * 0.35) * uTurb;
  float r = length(p) + 1e-4;
  v += (p / r) * uBeat * uPulse * 0.9 * exp(-r * 1.5);
  v += vec2(-p.y, p.x) * (0.04 + uLowMid * 0.3) * uSwirl / (0.4 + r);
  v -= p * 0.04 * smoothstep(0.7, 1.4, r);

  p += v * uDt * uSpeed;
  float life = 0.09 + 0.12 * hash12(vUv * 77.0);
  age += uDt * life * (0.7 + uLevel * 1.6);

  if (age > 1.0 || abs(p.x) > uAspect * 1.15 || abs(p.y) > 1.15) {
    o = spawn(vUv + fract(uTime * 0.731));
  } else {
    o = vec4(p, age, s.w);
  }
}`;

const DRAW_VS = `#include common
uniform sampler2D uState;
uniform float uAspect, uPointSize, uBright;
out vec3 vCol;
void main() {
  ivec2 c = ivec2(gl_VertexID % ${N}, gl_VertexID / ${N});
  vec4 s = texelFetch(uState, c, 0);
  gl_Position = vec4(s.x / uAspect, s.y, 0.0, 1.0);
  float fade = smoothstep(0.0, 0.08, s.z) * (1.0 - smoothstep(0.65, 1.0, s.z));
  float hot = spec(s.w);
  vec3 col = pal(mix(0.3, 1.0, s.w));
  col = mix(col, pal(1.0), hot * hot * 0.5);
  vCol = col * fade * uBright * (0.4 + hot * 1.6);
  gl_PointSize = uPointSize * (0.8 + hot);
}`;

const DRAW_FS = `#include common
in vec3 vCol; out vec4 o;
void main() {
  vec2 d = gl_PointCoord - 0.5;
  float a = smoothstep(0.5, 0.0, length(d));
  o = vec4(vCol * a, 1.0);
}`;

// Fade the trail buffer while smearing it along the flow, which gives the
// smoke its fibrous texture.
const FADE = `#include common
in vec2 vUv; out vec4 o;
uniform sampler2D uTrail;
uniform float uDecay, uAspect, uSmear;
void main() {
  vec2 p = (vUv - 0.5) * vec2(uAspect, 1.0) * 2.0;
  vec2 f = curl(vec3(p * 1.3, uTime * 0.05)) * 0.0006 * uSmear;
  vec2 zoom = -(vUv - 0.5) * 0.0015 * (1.0 + uBass * 2.0);
  vec3 c = texture(uTrail, vUv + f + zoom).rgb;
  o = vec4(c * uDecay, 1.0);
}`;

const COMPOSE = `#include common
in vec2 vUv; out vec4 o;
uniform sampler2D uTrail;
uniform float uAspect, uNebula;
void main() {
  vec2 p = (vUv - 0.5) * vec2(uAspect, 1.0) * 2.0;
  float n = fbm(p * 1.6 + vec2(uTime * 0.01, 0.0));
  float n2 = fbm(p * 3.5 - n * 1.5 + uTime * 0.02);
  vec3 bg = mix(pal(0.0) * 0.5, pal(0.18) * 0.6, n * n2) * uNebula;
  bg += pal(0.4) * pow(n2, 4.0) * 0.25 * uNebula * (0.5 + uLowMid);
  vec3 tr = texture(uTrail, vUv).rgb;
  tr = tr / (1.0 + luma(tr) * 0.25);
  o = vec4(bg + tr, 1.0);
}`;

export default class Flow {
  static id = 'flow';
  static label = 'Flow';
  static blurb = 'Particles born from the spectrum, carried by curl noise';
  static renderScale = 1;
  static params = [
    { key: 'speed', label: 'Speed', min: 0.1, max: 3, step: 0.01, value: 1 },
    { key: 'turb', label: 'Turbulence', min: 0, max: 3, step: 0.01, value: 1.2 },
    { key: 'scale', label: 'Field scale', min: 0.3, max: 4, step: 0.01, value: 1.4 },
    { key: 'swirl', label: 'Swirl', min: 0, max: 2, step: 0.01, value: 0.6 },
    { key: 'pulse', label: 'Beat pulse', min: 0, max: 2, step: 0.01, value: 1 },
    { key: 'trail', label: 'Trail length', min: 0.8, max: 0.995, step: 0.001, value: 0.94 },
    { key: 'smear', label: 'Smoke smear', min: 0, max: 3, step: 0.01, value: 1 },
    { key: 'bright', label: 'Brightness', min: 0.1, max: 3, step: 0.01, value: 1 },
    { key: 'nebula', label: 'Nebula', min: 0, max: 2, step: 0.01, value: 1 },
  ];

  constructor(core) {
    this.core = core;
    this.pUpdate = core.program(UPDATE);
    this.pDraw = core.program(DRAW_FS, DRAW_VS);
    this.pFade = core.program(FADE);
    this.pCompose = core.program(COMPOSE);
    this.state = core.pingpong(N, N, { format: 'RGBA32F', filter: 'nearest' });
    this.seeded = false;
    this.trail = null;
  }

  resize(w, h) {
    this.trail?.dispose();
    this.trail = this.core.pingpong(w, h, { format: 'RGBA16F' });
  }

  frame(scene, dt, audio, params) {
    const core = this.core;
    const aspect = scene.w / scene.h;
    const step = Math.min(dt, 1 / 30);

    if (!this.seeded) {
      // First frames: age everything so particles respawn on the ring.
      const seed = new Float32Array(N * N * 4);
      for (let i = 0; i < N * N; i++) seed.set([0, 0, 1 + Math.random(), Math.random()], i * 4);
      const gl = core.gl;
      gl.bindTexture(gl.TEXTURE_2D, this.state.read.tex);
      gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, N, N, gl.RGBA, gl.FLOAT, seed);
      this.seeded = true;
    }

    core.pass(this.pUpdate, {
      uState: this.state.read,
      uDt: step,
      uAspect: aspect,
      uScale: params.scale,
      uSpeed: params.speed,
      uTurb: params.turb,
      uSwirl: params.swirl,
      uPulse: params.pulse,
      uSeed: Math.random() * 100,
    }, this.state.write);
    this.state.swap();

    core.pass(this.pFade, { uTrail: this.trail.read, uDecay: params.trail, uAspect: aspect, uSmear: params.smear }, this.trail.write);
    core.points(this.pDraw, {
      uState: this.state.read,
      uAspect: aspect,
      uPointSize: Math.max(1, scene.h / 900) * 1.6,
      uBright: params.bright * 0.022,
    }, N * N, this.trail.write, { blend: 'add' });
    this.trail.swap();

    core.pass(this.pCompose, { uTrail: this.trail.read, uAspect: aspect, uNebula: params.nebula }, scene);
  }

  dispose() {
    this.state.dispose();
    this.trail?.dispose();
  }
}
