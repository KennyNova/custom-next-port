// HDR post chain: bloom pyramid -> composite with chromatic aberration,
// film grain, paper texture, vignette and a palette-preserving shoulder.

const PREFILTER = `#include common
in vec2 vUv; out vec4 o;
uniform sampler2D uSrc; uniform vec2 uTexel; uniform float uThreshold;
void main() {
  vec3 c = vec3(0.0);
  c += texture(uSrc, vUv + uTexel * vec2(-1, -1)).rgb;
  c += texture(uSrc, vUv + uTexel * vec2( 1, -1)).rgb;
  c += texture(uSrc, vUv + uTexel * vec2(-1,  1)).rgb;
  c += texture(uSrc, vUv + uTexel * vec2( 1,  1)).rgb;
  c *= 0.25;
  float br = max(c.r, max(c.g, c.b));
  float soft = clamp(br - uThreshold + 0.25, 0.0, 0.5);
  soft = soft * soft / 0.5;
  float w = max(soft, br - uThreshold) / max(br, 1e-4);
  o = vec4(c * w, 1.0);
}`;

const DOWN = `#include common
in vec2 vUv; out vec4 o;
uniform sampler2D uSrc; uniform vec2 uTexel;
void main() {
  vec3 c = texture(uSrc, vUv).rgb * 4.0;
  c += texture(uSrc, vUv + uTexel * vec2(-1, -1)).rgb;
  c += texture(uSrc, vUv + uTexel * vec2( 1, -1)).rgb;
  c += texture(uSrc, vUv + uTexel * vec2(-1,  1)).rgb;
  c += texture(uSrc, vUv + uTexel * vec2( 1,  1)).rgb;
  o = vec4(c / 8.0, 1.0);
}`;

const UP = `#include common
in vec2 vUv; out vec4 o;
uniform sampler2D uSrc; uniform vec2 uTexel; uniform float uWeight;
void main() {
  vec3 c = vec3(0.0);
  c += texture(uSrc, vUv + uTexel * vec2(-1, -1)).rgb;
  c += texture(uSrc, vUv + uTexel * vec2( 0, -1)).rgb * 2.0;
  c += texture(uSrc, vUv + uTexel * vec2( 1, -1)).rgb;
  c += texture(uSrc, vUv + uTexel * vec2(-1,  0)).rgb * 2.0;
  c += texture(uSrc, vUv).rgb * 4.0;
  c += texture(uSrc, vUv + uTexel * vec2( 1,  0)).rgb * 2.0;
  c += texture(uSrc, vUv + uTexel * vec2(-1,  1)).rgb;
  c += texture(uSrc, vUv + uTexel * vec2( 0,  1)).rgb * 2.0;
  c += texture(uSrc, vUv + uTexel * vec2( 1,  1)).rgb;
  o = vec4(c / 16.0 * uWeight, 1.0);
}`;

const COMPOSITE = `#include common
in vec2 vUv; out vec4 o;
uniform sampler2D uScene, uBloom;
uniform float uBloomAmt, uGrain, uPaper, uAberration, uVignette, uFade, uExposure;
uniform vec2 uOutRes;

vec3 shoulder(vec3 x) {
  const float k = 0.72;
  vec3 over = max(x - k, 0.0);
  return min(x, vec3(k)) + (1.0 - k) * (1.0 - exp(-over / (1.0 - k)));
}

// Fibrous paper: layered anisotropic noise, mostly in luminance.
float paper(vec2 p) {
  float f = 0.0;
  f += (vnoise(p * vec2(1.2, 0.35) * 0.9) - 0.5) * 0.5;
  f += (vnoise(p * vec2(0.3, 1.4) * 1.7 + 11.0) - 0.5) * 0.35;
  f += (fbm(p * 0.08) - 0.5) * 0.6;
  f += (hash12(floor(p * 0.7)) - 0.5) * 0.25;
  return f;
}

void main() {
  vec2 uv = vUv;
  vec2 d = uv - 0.5;
  float r2 = dot(d, d);

  // Chromatic aberration grows toward the edges.
  vec2 off = d * r2 * uAberration * 0.06;
  vec3 c;
  c.r = texture(uScene, uv - off).r;
  c.g = texture(uScene, uv).g;
  c.b = texture(uScene, uv + off).b;

  c += texture(uBloom, uv).rgb * uBloomAmt;
  c *= uExposure;

  vec2 px = uv * uOutRes;
  float pap = paper(px);
  c *= 1.0 + pap * uPaper * 0.55;
  c += vec3(pap) * uPaper * 0.015;

  float vig = 1.0 - smoothstep(0.15, 0.95, r2 * 2.2) * uVignette;
  c *= vig;

  c = shoulder(max(c, 0.0));
  c = pow(c, vec3(1.0 / 2.2));

  // Film grain, strongest in the mid-tones, re-rolled each frame.
  float l = luma(c);
  float g = hash12(px + fract(uTime * 7.31) * 913.0) + hash12(px * 1.37 + fract(uTime * 3.7) * 517.0) - 1.0;
  c += g * uGrain * 0.11 * (0.35 + 1.3 * l * (1.0 - l));

  c += (hash12(px + 0.5) - 0.5) / 255.0; // dither
  o = vec4(c * uFade, 1.0);
}`;

export class Post {
  constructor(core) {
    this.core = core;
    this.pPre = core.program(PREFILTER);
    this.pDown = core.program(DOWN);
    this.pUp = core.program(UP);
    this.pComp = core.program(COMPOSITE);
    this.mips = [];
    this.settings = { bloom: 0.8, grain: 0.5, paper: 0.35, aberration: 0.4, vignette: 0.55, threshold: 0.7, exposure: 1 };
  }

  resize(w, h) {
    this.mips.forEach((m) => m.dispose());
    this.mips = [];
    let mw = Math.max(2, w >> 1);
    let mh = Math.max(2, h >> 1);
    for (let i = 0; i < 6 && mw > 4 && mh > 4; i++) {
      this.mips.push(this.core.target(mw, mh, { format: 'RGBA16F' }));
      mw >>= 1;
      mh >>= 1;
    }
  }

  render(scene, fade = 1) {
    const core = this.core;
    const s = this.settings;
    const m = this.mips;
    core.pass(this.pPre, { uSrc: scene, uTexel: scene.texel, uThreshold: s.threshold }, m[0]);
    for (let i = 1; i < m.length; i++) core.pass(this.pDown, { uSrc: m[i - 1], uTexel: m[i - 1].texel }, m[i]);
    for (let i = m.length - 1; i > 0; i--) {
      core.pass(this.pUp, { uSrc: m[i], uTexel: m[i].texel, uWeight: 1.0 }, m[i - 1], { blend: 'add' });
    }
    const c = core.canvas;
    core.pass(this.pComp, {
      uScene: scene,
      uBloom: m[0],
      uBloomAmt: s.bloom * 0.6,
      uGrain: s.grain,
      uPaper: s.paper,
      uAberration: s.aberration,
      uVignette: s.vignette,
      uExposure: s.exposure,
      uFade: fade,
      uOutRes: [c.width, c.height],
    }, null);
  }
}
