// Alloy: a raymarched object of living metal on a neon-gridded floor. Its
// surface grows one of three organic patterns: ferrofluid spikes (one cone per
// spherical-Fibonacci cell), a gyroid lattice shell around a glowing core, or
// raised veins. Each part of the surface listens to its own slice of the
// spectrum: the equator follows the bass, the poles follow the treble. The
// material is a selectable metal with roughness and thin-film iridescence,
// lit only by a procedural studio of softboxes and neon strips.

const SMOOTH = 32;
// Spectrum range the surface listens to (skips sub-bass that rarely carries energy).
const LO = 0.07;
const SPAN = 0.78;

const FS = `#include common
in vec2 vUv; out vec4 o;
uniform vec3 uCam;
uniform float uSpin, uFlowT, uPattern, uMaterial, uRough, uIri, uDensity, uSpikes, uReach, uNeon, uHud, uGlitch;
uniform float uSmooth[${SMOOTH}];

const vec3 C = vec3(0.0, 0.2, 0.0); // object centre
const float FLOOR = -1.85;
const float PHI = 1.61803398875;

float smin(float a, float b, float k) { float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0); return mix(b, a, h) - k * h * (1.0 - h); }
float smax(float a, float b, float k) { return -smin(-a, -b, k); }

// Cone with base radius r1 at y = 0 and its tip at y = hh (after iq's capped cone).
float sdCone2(vec2 q, float r1, float hh) {
  float h = hh * 0.5;
  q.y -= h;
  vec2 k1 = vec2(0.0, h), k2 = vec2(-r1, 2.0 * h);
  vec2 ca = vec2(q.x - min(q.x, q.y < 0.0 ? r1 : 0.0), abs(q.y) - h);
  vec2 cb = q - k1 + k2 * clamp(dot(k1 - q, k2) / dot(k2, k2), 0.0, 1.0);
  float s = (cb.x < 0.0 && ca.y < 0.0) ? -1.0 : 1.0;
  return s * sqrt(min(dot(ca, ca), dot(cb, cb)));
}

// Nearest of n spherical-Fibonacci points to unit vector p (Keinert et al. 2015).
vec2 inverseSF(vec3 p, float n) {
  float m = 1.0 - 1.0 / n;
  float phi = min(atan(p.y, p.x), PI), cosTheta = p.z;
  float k = max(2.0, floor(log(n * PI * sqrt(5.0) * (1.0 - cosTheta * cosTheta)) / log(PHI + 1.0)));
  float Fk = pow(PHI, k) / sqrt(5.0);
  vec2 F = vec2(round(Fk), round(Fk * PHI));
  vec2 ka = 2.0 * F / n;
  vec2 kb = 2.0 * PI * (fract((F + 1.0) * PHI) - (PHI - 1.0));
  mat2 iB = mat2(ka.y, -ka.x, kb.y, -kb.x) / (ka.y * kb.x - ka.x * kb.y);
  vec2 c = floor(iB * vec2(phi, cosTheta - m));
  float d = 8.0, j = 0.0;
  for (int s = 0; s < 4; s++) {
    vec2 uv = vec2(float(s - 2 * (s / 2)), float(s / 2));
    float i = dot(F, uv + c);
    float ph = 2.0 * PI * fract(i * PHI);
    float ct = m - 2.0 * i / n;
    float st = sqrt(max(0.0, 1.0 - ct * ct));
    vec3 q = vec3(cos(ph) * st, sin(ph) * st, ct);
    float sd = dot(q - p, q - p);
    if (sd < d) { d = sd; j = i; }
  }
  return vec2(j, sqrt(d));
}

// Surface position 0..1 -> spectrum, skipping the sub-bass bins that rarely carry energy.
float band(float x) { return spec(${LO} + x * ${SPAN}); }

// The same range averaged into ${SMOOTH} bands on the CPU, for surfaces that
// vary continuously across the sphere: raw neighbouring bins differ so much
// that the surface would corrugate faster than the ray marcher can follow.
float bandSmooth(float x) {
  float u = clamp(x, 0.0, 1.0) * float(${SMOOTH - 1});
  int i = int(floor(u));
  float f = u - float(i);
  f = f * f * (3.0 - 2.0 * f);
  return mix(uSmooth[i], uSmooth[min(i + 1, ${SMOOTH - 1})], f);
}

vec3 toLocal(vec3 p) {
  p -= C;
  p.xz = rot(uSpin) * p.xz;
  p.yz = rot(1.2) * p.yz; // tilt the poles so both bass and treble regions face the camera
  return p;
}

// Every pattern returns (distance, material id, glow, spectrum position).
vec4 ferro(vec3 q, float r, vec3 dir, float R) {
  float n = uSpikes;
  float j = inverseSF(dir, n).x;
  float ct = 1.0 - 1.0 / n - 2.0 * j / n;
  float ph = TAU * fract(j * PHI);
  float st = sqrt(max(0.0, 1.0 - ct * ct));
  vec3 a = vec3(cos(ph) * st, sin(ph) * st, ct);
  float x = clamp(abs(ct) * 0.6 + hash11(j * 1.37) * 0.4, 0.0, 1.0);
  // Each spike follows its own band, and the whole field stands up with loudness.
  float h = uReach * (0.8 * pow(band(x), 1.15) + 0.45 * uLevel + 0.2 * uBass * hash11(j * 7.1));
  float w = 1.45 / sqrt(n);
  float along = dot(q, a);
  // Quiet spikes sink fully below the surface instead of leaving a bump.
  float y = along - (R - 0.12 - 0.2 * (1.0 - smoothstep(0.0, 0.15, h)));
  float cone = sdCone2(vec2(length(q - a * along), y), w, h + 0.12);
  float d = smin(r - R, cone, 0.07);
  // Only this cell's spike is evaluated, so never step further than a cell is wide.
  if (d > 0.0 && r < R + uReach * 1.1 + 0.2) d = min(d, 0.012 + w * 0.3);
  float tip = smoothstep(0.35, 1.0, y / (h + 0.12)) * smoothstep(0.03, 0.25, h);
  tip *= smoothstep(0.03, -0.01, cone - (r - R)); // only on the spike, never the body around it
  return vec4(d, 0.0, tip, x);
}

vec4 lattice(vec3 q, float r, float x, float R) {
  float s = bandSmooth(x);
  float k = mix(2.5, 8.0, uDensity);
  vec3 g3 = q * k + vec3(uFlowT * 0.7, uFlowT * 0.4, 0.0);
  float g = dot(sin(g3), cos(g3.zxy));
  float th = 0.18 + uReach * (0.25 * uBass + 0.55 * s);
  float shell = (abs(g) - th) / k * 0.42;
  float outer = R + uReach * 0.3 * s;
  float d = smax(r - outer, shell, 0.04);
  d = smax(d, outer * 0.55 - r, 0.04); // hollow, so the core shows through
  float core = r - (0.34 + uReach * 0.2 * uBass + 0.05 * uBeat);
  if (core < d) return vec4(core, 1.0, 1.0, x);
  float rim = smoothstep(0.04, 0.0, abs(r - outer)) * (0.1 + s);
  return vec4(d, 0.0, rim * 0.3, x);
}

vec4 veins(vec3 q, float r, float x, float R) {
  float s = bandSmooth(x);
  float k = mix(1.0, 3.5, uDensity);
  vec3 nq = q * k + vec3(0.0, uFlowT * 0.5, uFlowT * 0.25);
  float r1 = 1.0 - abs(snoise(nq));
  float r2 = 1.0 - abs(snoise(nq * 2.3 + 11.0));
  float ridge = r1 * r1 * r1 * 0.72 + r2 * r2 * r2 * 0.28;
  float amp = 0.05 + uReach * (0.05 + 0.38 * s);
  float d = (r - R - ridge * amp) * 0.2;
  float glow = smoothstep(0.8, 0.98, r1) * (0.15 + s * 1.6);
  return vec4(d, 0.0, glow, x);
}

vec4 map(vec3 p) {
  vec3 q = toLocal(p);
  float r = length(q);
  vec3 dir = q / max(r, 1e-4);
  float x = abs(dir.z);
  float R = 1.0 + uBass * 0.08 * uReach + snoise(q * 1.1 + vec3(0.0, 0.0, uFlowT * 0.4)) * 0.035;
  if (uPattern < 0.5) return ferro(q, r, dir, R);
  if (uPattern < 1.5) return lattice(q, r, x, R);
  return veins(q, r, x, R);
}

float boundR() { return 1.3 + uReach * 1.2; }

vec2 sphere(vec3 ro, vec3 rd, float r) {
  vec3 oc = ro - C;
  float b = dot(oc, rd);
  float h = b * b - dot(oc, oc) + r * r;
  if (h < 0.0) return vec2(-1.0);
  h = sqrt(h);
  return vec2(-b - h, -b + h);
}

// Returns (t, id, glow, x); t < 0 on a miss.
vec4 march(vec3 ro, vec3 rd, int steps) {
  vec2 b = sphere(ro, rd, boundR());
  if (b.y < 0.0) return vec4(-1.0);
  float t = max(b.x, 0.0);
  vec4 m = vec4(1.0);
  for (int i = 0; i < 260; i++) {
    if (i >= steps) break;
    m = map(ro + rd * t);
    if (m.x < 0.0015 * t) {
      // Settle onto the true surface, or shading shows contour lines of where rays stopped.
      for (int k = 0; k < 4; k++) t += map(ro + rd * t).x;
      return vec4(t, m.yzw);
    }
    t += m.x;
    if (t > b.y) return vec4(-1.0);
  }
  // Out of steps while creeping along a grazing surface: that's still a hit.
  return m.x < 0.03 ? vec4(t, m.yzw) : vec4(-1.0);
}

vec3 calcNormal(vec3 p) {
  const vec2 e = vec2(0.0015, -0.0015);
  return normalize(e.xyy * map(p + e.xyy).x + e.yyx * map(p + e.yyx).x + e.yxy * map(p + e.yxy).x + e.xxx * map(p + e.xxx).x);
}

float calcAO(vec3 p, vec3 n) {
  float occ = 0.0, w = 1.0;
  for (int i = 1; i <= 5; i++) {
    float h = 0.03 * float(i);
    occ += (h - map(p + n * h).x) * w;
    w *= 0.7;
  }
  return clamp(1.0 - occ * 3.5, 0.0, 1.0);
}

// The floor: brushed dark metal, a neon grid lit by the spectrum by radius
// (centre = bass), and rings that run outward on beats.
vec3 floorBase(vec2 xz, float dist) {
  float rr = length(xz);
  float brushed = vnoise(xz * vec2(2.0, 70.0)) * 0.5 + vnoise(xz * vec2(6.0, 190.0)) * 0.5;
  vec3 base = pal(0.05) * 0.28 * (0.6 + 0.6 * brushed);
  base *= 1.0 - 0.75 * exp(-rr * rr * 0.5); // contact shadow
  float aa = 0.012 + dist * 0.0025;
  vec2 g = abs(fract(xz * 0.8) - 0.5);
  float line = smoothstep(aa, 0.0, min(g.x, g.y));
  vec2 g2 = abs(fract(xz * 3.2) - 0.5);
  float fine = smoothstep(aa * 2.0, 0.0, min(g2.x, g2.y)) * 0.12 * exp(-dist * 0.12);
  float fx = clamp(rr / 12.0, 0.0, 1.0);
  float s = band(fx);
  float ring = pow(0.5 + 0.5 * sin(rr * 2.2 - uTime * 5.0), 12.0) * uBeat;
  vec3 neon = pal(0.45 + 0.55 * fx) * (line * (0.12 + s * 2.4 + ring * 2.0) + fine * (0.3 + s));
  return base + neon * uNeon * exp(-dist * 0.035);
}

// Studio around the object: softboxes overhead, neon strips around, floor below.
// Softboxes only show up in reflections; seen directly they read as flat slabs.
vec3 env(vec3 rd, bool boxes) {
  float y = rd.y;
  vec3 c = mix(pal(0.03) * 0.3, pal(0.2) * 0.9, smoothstep(-0.1, 0.9, y));
  vec3 white = mix(pal(0.96), vec3(1.0), 0.55);
  if (boxes && y > 0.0) {
    vec2 tb = rd.xz / y;
    float box = smoothstep(0.03, 0.0, max(abs(tb.x - 0.2) - 0.75, abs(tb.y) - 0.28));
    float box2 = smoothstep(0.05, 0.0, max(abs(tb.x + 1.3) - 0.2, abs(tb.y - 0.6) - 1.1));
    float box3 = smoothstep(0.05, 0.0, max(abs(tb.x - 1.6) - 0.5, abs(tb.y + 0.9) - 0.15));
    c += white * (box * 3.0 + box2 * 1.6 + box3 * 1.8);
  }
  float az = atan(rd.x, rd.z);
  // A broken ring light at eye level gives the metal a bright horizon to reflect.
  float ringY = smoothstep(0.03, 0.0, abs(y - 0.12));
  float gaps = step(0.25, fract(az / TAU * 7.0 + 0.1));
  if (boxes) c += mix(white, pal(0.7), 0.4) * ringY * gaps * (0.9 + uLowMid * 1.5);
  for (int i = 0; i < 5; i++) {
    float a0 = float(i) * TAU / 5.0 + 0.4;
    float da = abs(mod(az - a0 + PI, TAU) - PI);
    float strip = smoothstep(0.03, 0.0, da) * smoothstep(-0.15, 0.05, y) * smoothstep(0.8, 0.45, y);
    float b = band(float(i) / 4.0);
    c += pal(0.4 + 0.14 * float(i)) * strip * (0.5 + b * 3.5);
  }
  c += pal(0.62) * exp(-abs(y) * 45.0) * (0.3 + uMid * 1.6);
  if (y < 0.0) {
    float dist = (C.y - FLOOR) / -y;
    c = mix(c, floorBase(C.xz + rd.xz * dist, dist), smoothstep(0.0, -0.08, y));
  }
  return c;
}

vec3 metal(int id) {
  if (id == 1) return vec3(0.16, 0.17, 0.19);  // black chrome
  if (id == 2) return vec3(1.0, 0.77, 0.34);   // gold
  if (id == 3) return vec3(0.96, 0.6, 0.45);   // copper
  if (id == 4) return vec3(0.62, 0.6, 0.58);   // titanium
  if (id == 5) return mix(pal(0.78), vec3(1.0), 0.2);
  return vec3(0.94, 0.95, 0.97);               // chrome
}

vec3 shadeObject(vec3 p, vec3 rd, vec4 m) {
  vec3 n = calcNormal(p);
  float ndv = clamp(dot(n, -rd), 0.0, 1.0);
  if (m.y > 0.5) {
    // Reactor core seen through the lattice.
    float pulse = 1.2 + uBass * 3.0 + uBeat * 2.5;
    vec3 c = mix(pal(0.7), pal(1.0), pow(1.0 - ndv, 1.5)) * pulse;
    c *= 0.75 + 0.25 * vnoise(vec2(atan(n.x, n.z) * 6.0, n.y * 6.0 + uTime * 2.0));
    return c * uNeon;
  }
  vec3 q = toLocal(p);
  // Hammered micro-relief, stronger as the surface gets rougher.
  vec3 bump = vec3(snoise(q * 38.0), snoise(q * 38.0 + 5.1), snoise(q * 38.0 + 9.7));
  n = normalize(n + bump * (0.006 + 0.05 * uRough));

  int mid = int(uMaterial + 0.5);
  vec3 F0 = metal(mid);
  vec3 F = F0 + (1.0 - F0) * pow(1.0 - ndv, 5.0);
  float iri = clamp(uIri + (mid == 4 ? 0.75 : 0.0), 0.0, 1.0);
  vec3 film = 0.5 + 0.5 * cos(TAU * (ndv * 1.7 + m.w * 0.5 + snoise(q * 2.0) * 0.15 + vec3(0.0, 0.33, 0.67)));
  F *= mix(vec3(1.0), film * 1.5, iri);

  vec3 R = reflect(rd, n);
  vec3 refl = vec3(0.0);
  for (int i = 0; i < 3; i++) {
    vec3 j = hash32(gl_FragCoord.xy + float(i) * 37.0 + fract(uTime) * 91.0) - 0.5;
    refl += env(normalize(R + j * uRough * uRough * 0.9), true);
  }
  refl /= 3.0;
  float ao = calcAO(p, n);
  vec3 c = refl * F * ao;
  c += pal(0.5) * max(-n.y, 0.0) * 0.06 * uNeon * ao; // bounce from the grid
  c += pal(0.55 + 0.45 * m.w) * m.z * uNeon * (1.0 + uLevel * 2.5) * 1.6;
  return c;
}

vec3 hud(vec2 uv, float behind) {
  float r = length(uv);
  float a = atan(uv.y, uv.x);
  vec3 c = vec3(0.0);
  const float R0 = 0.39;
  const float SEGS = 96.0;
  float sa = (a / TAU + 0.5) * SEGS;
  float si = floor(sa), sf = fract(sa);
  float x = abs(fract((si + 0.5) / SEGS + 0.25) * 2.0 - 1.0); // bass at the bottom, mirrored
  float s = band(x);
  float bar = step(0.18, sf) * step(sf, 0.82) * step(R0, r) * step(r, R0 + 0.004 + s * 0.1);
  bar *= step(0.4, fract((r - R0) / 0.008));
  c += pal(0.5 + 0.5 * x) * bar * (0.6 + s * 1.5);
  c += pal(0.75) * smoothstep(0.0016, 0.0, abs(r - (R0 - 0.012))) * 0.5;
  float ar = a + uTime * 0.12;
  float arc = step(0.5, fract(ar / TAU * 64.0)) * step(0.35, fract(ar / TAU * 3.0));
  c += pal(0.9) * smoothstep(0.0014, 0.0, abs(r - 0.53)) * arc * 0.55;
  float tick = step(0.8, fract(a / TAU * 180.0)) * step(abs(r - 0.505), 0.005);
  c += pal(0.6) * tick * 0.35 * (0.5 + uBeat);
  return c * mix(1.0, 0.12, behind);
}

void main() {
  // Beat glitch: random horizontal bands shear sideways for a frame or two.
  float row = floor(vUv.y * 36.0);
  float gt = floor(uTime * 18.0);
  float gsel = step(hash12(vec2(row, gt)), uBeat * uBeat * uGlitch * 0.3);
  vec2 f = vUv;
  f.x += gsel * (hash12(vec2(gt, row * 1.7)) - 0.5) * 0.12 * uGlitch;
  vec2 uv = (f * uRes - 0.5 * uRes) / uRes.y;

  vec3 ro = uCam;
  vec3 fw = normalize(C - ro);
  vec3 rt = normalize(cross(vec3(0.0, 1.0, 0.0), fw));
  vec3 up = cross(fw, rt);
  vec3 rd = normalize(uv.x * rt + uv.y * up + 1.8 * fw);

  vec4 m = march(ro, rd, uPattern < 0.5 ? 140 : 220);
  float tf = rd.y < 0.0 ? (FLOOR - ro.y) / rd.y : -1.0;
  vec3 col;
  bool obj = m.x > 0.0 && (tf < 0.0 || m.x < tf);
  if (obj) {
    col = shadeObject(ro + rd * m.x, rd, m);
  } else if (tf > 0.0) {
    vec3 p = ro + rd * tf;
    col = floorBase(p.xz, tf);
    // Glossy reflection of the object in the floor, smeared along the brushing.
    vec3 rr = reflect(rd, vec3(0.0, 1.0, 0.0));
    rr.x += (vnoise(p.xz * vec2(3.0, 90.0)) - 0.5) * 0.04;
    rr = normalize(rr);
    vec4 mr = march(p + rr * 0.01, rr, 48);
    float fres = 0.08 + 0.5 * pow(1.0 - clamp(-rd.y, 0.0, 1.0), 4.0);
    col += (mr.x > 0.0 ? shadeObject(p + rr * mr.x, rr, mr) : env(rr, true) * 0.3) * fres;
    col = mix(col, env(rd, false) * 0.4, 1.0 - exp(-tf * 0.04));
  } else {
    col = env(rd, false) * 0.4;
  }

  col += hud(uv, obj ? 1.0 : 0.0) * uHud;
  col *= 1.0 - 0.05 * uHud * step(0.5, fract(gl_FragCoord.y * 0.5)); // scanlines
  col = mix(col, col.brg * 1.4, gsel * 0.6);
  o = vec4(col, 1.0);
}`;

export default class Alloy {
  static id = 'alloy';
  static label = 'Alloy';
  static blurb = 'Living metal (ferrofluid, lattice or veins) under neon light';
  static renderScale = 0.6;
  static params = [
    { key: 'pattern', label: 'Pattern', type: 'select', options: ['Ferrofluid', 'Lattice', 'Veins'], value: 0 },
    { key: 'material', label: 'Material', type: 'select', options: ['Chrome', 'Black chrome', 'Gold', 'Copper', 'Anodized titanium', 'Palette'], value: 0 },
    { key: 'rough', label: 'Roughness', min: 0, max: 1, step: 0.01, value: 0.12 },
    { key: 'iri', label: 'Iridescence', min: 0, max: 1, step: 0.01, value: 0.1 },
    { key: 'density', label: 'Pattern density', min: 0, max: 1, step: 0.01, value: 0.5 },
    { key: 'reach', label: 'Reaction', min: 0, max: 2, step: 0.01, value: 1 },
    { key: 'flow', label: 'Organic flow', min: 0, max: 2, step: 0.01, value: 0.6 },
    { key: 'neon', label: 'Neon', min: 0, max: 2, step: 0.01, value: 1 },
    { key: 'hud', label: 'HUD', min: 0, max: 1.5, step: 0.01, value: 1 },
    { key: 'glitch', label: 'Beat glitch', min: 0, max: 2, step: 0.01, value: 0.4 },
    { key: 'orbit', label: 'Camera orbit', min: 0, max: 2, step: 0.01, value: 0.5 },
  ];

  constructor(core) {
    this.core = core;
    this.prog = core.program(FS);
    this.drive = 0;
    this.flowT = 0;
    this.spin = 0;
    this.orbit = 0.6;
    this.smooth = new Float32Array(SMOOTH);
  }

  resize() {}

  frame(scene, dt, audio, params) {
    dt = Math.min(dt, 1 / 20);
    // Motion follows the music: nearly still in silence, alive when it plays.
    const drive = Math.min(1, Math.max(0, (audio.level - 0.005) / 0.04));
    this.drive += (drive - this.drive) * Math.min(1, dt * (drive > this.drive ? 10 : 2));
    this.flowT += dt * params.flow * (0.08 + 0.92 * this.drive);
    this.spin += dt * (0.03 + 0.2 * this.drive);
    this.orbit += dt * params.orbit * 0.12;

    // Overlapping averages of the spectrum, then eased over time so the surface
    // swells instead of jittering.
    const spec = audio.spectrum;
    const n = spec.length;
    const ease = Math.min(1, dt * 14);
    for (let i = 0; i < SMOOTH; i++) {
      const c = (LO + (i / (SMOOTH - 1)) * SPAN) * n;
      const half = (SPAN * n) / SMOOTH;
      const a = Math.max(0, Math.floor(c - half));
      const b = Math.min(n, Math.ceil(c + half));
      let s = 0;
      for (let j = a; j < b; j++) s += spec[j];
      this.smooth[i] += (s / Math.max(1, b - a) - this.smooth[i]) * ease;
    }

    const o = this.orbit;
    const dist = 6.6;
    this.core.pass(this.prog, {
      uCam: [Math.sin(o) * dist, 1.0 + Math.sin(o * 0.6) * 0.35, Math.cos(o) * dist],
      uSpin: this.spin,
      uFlowT: this.flowT,
      uPattern: params.pattern,
      uMaterial: params.material,
      uRough: params.rough,
      uIri: params.iri,
      uDensity: params.density,
      uSpikes: Math.round(70 + params.density * 310),
      uReach: params.reach,
      uNeon: params.neon,
      uHud: params.hud,
      uGlitch: params.glitch,
      uSmooth: this.smooth,
    }, scene);
  }

  dispose() {}
}
