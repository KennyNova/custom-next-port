// Waves: a raymarched ocean whose surface is the recent spectrogram. Every
// frame's spectrum becomes a wavefront that rolls out toward the horizon on
// top of a wind-driven swell, with glowing crests, foam and an aurora drawn
// from the live waveform.

import { DataTexture } from '../gl.js';
import { SPECTRUM_SIZE } from '../audio.js';

const ROWS = 256;

const FS = `#include common
in vec2 vUv; out vec4 o;
uniform sampler2D uHist;
uniform float uHead, uAmp, uSwell, uChop, uSpeed, uGlow, uFoam, uCamH, uAurora;

const float SPAN = 14.0;   // half-width of the spectral field in world units
const float DEPTH = 46.0;  // distance covered by the history

float histAt(vec2 p) {
  float x = abs(p.x) / SPAN;
  float age = (p.y + p.x * p.x * 0.012) / DEPTH;
  if (age < 0.0 || age > 1.0 || x > 1.0) return 0.0;
  float v = uHead - age * (float(${ROWS}) - 2.0) / float(${ROWS});
  float u = x * 0.92 + 0.02;
  float s = texture(uHist, vec2(u, v)).r * 0.5
          + texture(uHist, vec2(u - 0.012, v)).r * 0.25
          + texture(uHist, vec2(u + 0.012, v)).r * 0.25;
  float edge = smoothstep(1.0, 0.6, x) * smoothstep(1.0, 0.75, age) * smoothstep(0.0, 0.02, age);
  // Crests travel with the data, so loud moments roll outward as wave trains.
  float crest = 0.5 + 0.5 * sin(age * DEPTH * 1.6 - abs(p.x) * 0.25);
  crest = crest * crest;
  return s * s * edge * (0.3 + 0.7 * crest);
}

float swell(vec2 p, int oct) {
  float h = 0.0, a = 0.5, f = 0.11;
  vec2 d = normalize(vec2(0.35, 1.0));
  mat2 r = mat2(0.82, -0.57, 0.57, 0.82);
  float t = uTime * uSpeed;
  for (int i = 0; i < 7; i++) {
    if (i >= oct) break;
    float k = f * TAU;
    float ph = dot(d, p) * k + t * sqrt(9.81 * k) + sin(dot(p, d.yx) * k * 0.37 + float(i)) * 1.3;
    float w = 1.0 - abs(sin(ph * 0.5));
    w = pow(w, 1.4 + uChop * 2.2);
    h += a * w;
    d = r * d;
    f *= 1.83;
    a *= 0.46;
  }
  return h;
}

float height(vec2 p, int oct) {
  float sw = swell(p, oct) * uSwell * (0.55 + uBass * 0.7);
  return sw + histAt(p) * uAmp * 1.5;
}

vec3 sky(vec3 rd, vec3 sunDir) {
  float y = max(rd.y, 0.0);
  vec3 top = pal(0.02) * 0.6;
  vec3 hor = mix(pal(0.32), pal(0.55), 0.35) * 0.9;
  vec3 c = mix(hor, top, pow(y, 0.45));
  float sd = max(dot(rd, sunDir), 0.0);
  c += pal(0.9) * pow(sd, 24.0) * 0.35 + pal(1.0) * smoothstep(0.9993, 0.9997, sd) * 2.5;
  c += pal(0.75) * exp(-y * 14.0) * (0.15 + uBass * 0.35);

  // Cloud banks: fbm stretched along the horizon.
  vec2 cp = rd.xz / (rd.y + 0.12) * 1.4 + vec2(uTime * 0.02, 0.0);
  float cl = smoothstep(0.45, 0.85, fbm(cp * vec2(0.6, 1.4)));
  c = mix(c, mix(pal(0.2), pal(0.6), fbm(cp * 2.0)) * 0.7, cl * smoothstep(0.0, 0.25, y) * 0.55);

  // Aurora curtain shaped by the waveform.
  float az = atan(rd.x, rd.z) / PI * 0.5 + 0.5;
  float wv = wave(fract(az * 1.5));
  float band = rd.y - (0.2 + wv * 0.06 * uAurora + sin(az * 9.0 + uTime * 0.2) * 0.025);
  float streak = 0.55 + 0.45 * vnoise(vec2(az * 220.0, uTime * 0.6));
  float cur = exp(-max(band, 0.0) * 16.0) * smoothstep(-0.03, 0.0, band) * streak;
  c += mix(pal(0.6), pal(0.95), smoothstep(0.0, 0.12, band)) * cur * uAurora * (0.35 + uMid * 1.2);

  // Stars.
  vec2 sp = rd.xy / max(rd.z, 0.1) * 300.0;
  float st = step(0.996, hash12(floor(sp))) * smoothstep(0.1, 0.5, y);
  c += vec3(st) * (0.4 + 0.6 * sin(uTime * 3.0 + hash12(floor(sp)) * 40.0));
  return c;
}

void main() {
  vec2 uv = (vUv * uRes - 0.5 * uRes) / uRes.y;
  float sway = sin(uTime * 0.13) * 0.6;
  vec3 ro = vec3(sway, uCamH + uBass * 0.35, -3.0);
  vec3 ta = vec3(sway * 0.3, 0.4, 18.0);
  vec3 fw = normalize(ta - ro);
  vec3 rt = normalize(cross(vec3(0, 1, 0), fw));
  vec3 up = cross(fw, rt);
  vec3 rd = normalize(uv.x * rt + uv.y * up + 1.35 * fw);
  vec3 sunDir = normalize(vec3(0.35, 0.16, 1.0));

  vec3 col;
  float t = 0.1;
  bool hit = false;
  if (rd.y < 0.02) {
    for (int i = 0; i < 140; i++) {
      vec3 p = ro + rd * t;
      float d = p.y - height(p.xz, 3);
      if (d < 0.002 * t) { hit = true; break; }
      t += max(d * 0.5, 0.01 + t * 0.002);
      if (t > 120.0) break;
    }
  }

  if (hit) {
    // Refine the hit with a short bisection.
    float a = t * 0.9, b = t;
    for (int i = 0; i < 6; i++) {
      float m = 0.5 * (a + b);
      vec3 p = ro + rd * m;
      if (p.y - height(p.xz, 3) < 0.0) b = m; else a = m;
    }
    t = b;
    vec3 p = ro + rd * t;
    float e = 0.012 + t * 0.0025;
    float h0 = height(p.xz, 7);
    vec3 n = normalize(vec3(height(p.xz - vec2(e, 0), 7) - height(p.xz + vec2(e, 0), 7), 2.0 * e,
                            height(p.xz - vec2(0, e), 7) - height(p.xz + vec2(0, e), 7)));
    // Fine capillary ripples, driven by the highs.
    float rip = (0.15 + uHigh * 0.8) * exp(-t * 0.03);
    vec2 g = vec2(vnoise(p.xz * 6.0 + uTime * 0.7), vnoise(p.xz * 6.0 - uTime * 0.6 + 9.0)) - 0.5;
    n = normalize(n + vec3(g.x, 0.0, g.y) * rip);

    float fres = 0.02 + 0.98 * pow(1.0 - max(dot(n, -rd), 0.0), 5.0);
    vec3 refl = sky(reflect(rd, n), sunDir);
    vec3 deep = pal(0.08) * 0.35;
    vec3 body = mix(deep, pal(0.35) * 0.7, smoothstep(-0.2, 1.4, h0));
    float sss = pow(max(dot(rd, -sunDir) * 0.5 + 0.5, 0.0), 3.0) * smoothstep(0.2, 1.6, h0);
    body += pal(0.55) * sss * 0.45;
    col = mix(body, refl, fres);

    float spec = pow(max(dot(reflect(rd, n), sunDir), 0.0), 220.0);
    col += pal(1.0) * spec * 1.6;

    // Spectral crests glow with the colour of their frequency.
    float hs = histAt(p.xz);
    float fx = clamp(abs(p.x) / SPAN, 0.0, 1.0);
    col += pal(0.45 + 0.55 * fx) * pow(hs, 1.5) * uGlow * 2.4;

    // Foam: on steep, high crests, broken up by layered noise.
    float steep = 1.0 - n.y;
    float fm = smoothstep(0.8, 1.6, h0 + steep * 1.2);
    float tex = fbm(p.xz * 3.0 + vec2(0.0, uTime * 0.4)) * 0.7 + vnoise(p.xz * 22.0) * 0.3;
    fm *= smoothstep(0.45, 0.8, tex) * uFoam;
    col = mix(col, pal(0.97) * 0.9, clamp(fm, 0.0, 1.0) * exp(-t * 0.025));

    float fog = 1.0 - exp(-t * 0.018);
    col = mix(col, sky(normalize(vec3(rd.x, 0.02, rd.z)), sunDir), fog);
  } else {
    col = sky(rd, sunDir);
  }

  o = vec4(col, 1.0);
}`;

export default class Waves {
  static id = 'waves';
  static label = 'Waves';
  static blurb = 'Raymarched ocean built from the spectrogram';
  static renderScale = 0.7;
  static params = [
    { key: 'amp', label: 'Spectral height', min: 0, max: 2, step: 0.01, value: 1 },
    { key: 'swell', label: 'Swell', min: 0, max: 2, step: 0.01, value: 0.9 },
    { key: 'chop', label: 'Choppiness', min: 0, max: 1, step: 0.01, value: 0.45 },
    { key: 'speed', label: 'Wind speed', min: 0, max: 2, step: 0.01, value: 0.8 },
    { key: 'glow', label: 'Crest glow', min: 0, max: 2, step: 0.01, value: 1 },
    { key: 'foam', label: 'Foam', min: 0, max: 1.5, step: 0.01, value: 0.8 },
    { key: 'aurora', label: 'Aurora', min: 0, max: 2, step: 0.01, value: 1 },
    { key: 'camH', label: 'Camera height', min: 1.2, max: 7, step: 0.01, value: 3 },
  ];

  constructor(core) {
    this.core = core;
    this.prog = core.program(FS);
    this.hist = new DataTexture(core, SPECTRUM_SIZE, ROWS, 'R16F', 'repeat');
    this.row = new Float32Array(SPECTRUM_SIZE);
    this.head = 0;
    this.acc = 0;
  }

  resize() {}

  frame(scene, dt, audio, params) {
    // Push rows at a fixed rate so wave speed doesn't depend on frame rate.
    this.acc += dt;
    let pushes = 0;
    while (this.acc > 1 / 60 && pushes < 4) {
      this.acc -= 1 / 60;
      this.head = (this.head + 1) % ROWS;
      this.row.set(audio.spectrum);
      this.hist.upload(this.row, this.head, 1);
      pushes++;
    }
    if (this.acc > 0.1) this.acc = 0;

    this.core.pass(this.prog, {
      uHist: this.hist,
      uHead: (this.head + 0.5) / ROWS,
      uAmp: params.amp,
      uSwell: params.swell,
      uChop: params.chop,
      uSpeed: params.speed,
      uGlow: params.glow,
      uFoam: params.foam,
      uAurora: params.aurora,
      uCamH: params.camH,
    }, scene);
  }

  dispose() {
    this.hist.dispose();
  }
}
