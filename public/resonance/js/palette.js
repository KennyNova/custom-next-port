// Palette model: color math (sRGB / OKLab / OKLCH), harmony-based generation,
// gradient ramp baking, naming and presets.

export const MIN_COLORS = 2;
export const MAX_COLORS = 8;

// ---------- conversions ----------
export function hexToRgb(hex) {
  let h = hex.replace('#', '').trim();
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  const n = parseInt(h, 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

export function rgbToHex([r, g, b]) {
  const c = (v) => Math.round(Math.min(1, Math.max(0, v)) * 255).toString(16).padStart(2, '0');
  return (c(r) + c(g) + c(b)).toUpperCase();
}

export function isHex(s) {
  return /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.test(String(s).trim());
}

const toLinear = (c) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
const toSrgb = (c) => (c <= 0.0031308 ? c * 12.92 : 1.055 * Math.pow(c, 1 / 2.4) - 0.055);

export function srgbToLinear(rgb) { return rgb.map(toLinear); }

export function rgbToOklab(rgb) {
  const [r, g, b] = rgb.map(toLinear);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
}

export function oklabToRgb([L, a, b], clamp = true) {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const lin = [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
  const rgb = lin.map((c) => toSrgb(Math.max(0, c)));
  return clamp ? rgb.map((c) => Math.min(1, Math.max(0, c))) : rgb;
}

export function rgbToOklch(rgb) {
  const [L, a, b] = rgbToOklab(rgb);
  return [L, Math.hypot(a, b), ((Math.atan2(b, a) * 180) / Math.PI + 360) % 360];
}

function inGamut([L, a, b]) {
  return oklabToRgb([L, a, b], false).every((c) => c >= -0.001 && c <= 1.001);
}

// OKLCH -> sRGB, reducing chroma until the colour fits in gamut.
export function oklchToRgb([L, C, H]) {
  const h = (H * Math.PI) / 180;
  let c = C;
  for (let i = 0; i < 24 && !inGamut([L, c * Math.cos(h), c * Math.sin(h)]); i++) c *= 0.9;
  return oklabToRgb([L, c * Math.cos(h), c * Math.sin(h)]);
}

export function hsvToRgb(h, s, v) {
  const f = (n) => {
    const k = (n + h / 60) % 6;
    return v - v * s * Math.max(0, Math.min(k, 4 - k, 1));
  };
  return [f(5), f(3), f(1)];
}

export function rgbToHsv([r, g, b]) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  if (d) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  return [h, max ? d / max : 0, max];
}

export function mixHex(a, b, t = 0.5) {
  const la = rgbToOklab(hexToRgb(a));
  const lb = rgbToOklab(hexToRgb(b));
  return rgbToHex(oklabToRgb(la.map((v, i) => v + (lb[i] - v) * t)));
}

export function contrastText(hex) {
  const [L] = rgbToOklab(hexToRgb(hex));
  return L > 0.68 ? '#0b0b0e' : '#ffffff';
}

// 11 tints/shades of a colour at fixed OKLab lightness steps, same hue.
export function shadesOf(hex) {
  const [, C, H] = rgbToOklch(hexToRgb(hex));
  const out = [];
  for (let i = 0; i < 11; i++) {
    const L = 0.97 - i * 0.084;
    const c = C * (1 - Math.abs(L - 0.6) * 0.9);
    out.push(rgbToHex(oklchToRgb([L, Math.max(0, c), H])));
  }
  return out;
}

// ---------- generation ----------
export const MODES = {
  auto: 'Auto',
  analogous: 'Analogous',
  monochrome: 'Monochrome',
  complementary: 'Complementary',
  split: 'Split complementary',
  triadic: 'Triadic',
  tetradic: 'Square',
  nocturne: 'Nocturne (dark base, bright accents)',
};

const rand = (a, b) => a + Math.random() * (b - a);
const wrap = (h) => ((h % 360) + 360) % 360;

function schemeHues(mode, base, n) {
  const pick = (offsets) => Array.from({ length: n }, (_, i) => wrap(base + offsets[i % offsets.length] + rand(-8, 8)));
  switch (mode) {
    case 'analogous': return Array.from({ length: n }, (_, i) => wrap(base + (i - (n - 1) / 2) * rand(18, 32)));
    case 'monochrome': return Array.from({ length: n }, () => wrap(base + rand(-6, 6)));
    case 'complementary': return pick([0, 180, 0, 180, 20]);
    case 'split': return pick([0, 150, 210, 0, 30]);
    case 'triadic': return pick([0, 120, 240]);
    case 'tetradic': return pick([0, 90, 180, 270]);
    case 'nocturne': return Array.from({ length: n }, (_, i) => wrap(base + (i < 2 ? rand(-20, 20) : rand(120, 240))));
    default: return pick([0, rand(25, 45), rand(150, 200), rand(-40, -20), rand(60, 90)]);
  }
}

// Generate a palette that respects locked slots. Unlocked colours are laid out
// from dark to light so the gradient reads as background -> highlight.
export function generate(colors, locks, mode = 'auto') {
  const n = colors.length;
  const lockedIdx = locks.map((l, i) => (l ? i : -1)).filter((i) => i >= 0);
  const m = mode === 'auto' ? Object.keys(MODES).filter((k) => k !== 'auto')[Math.floor(Math.random() * 7)] : mode;

  let base = rand(0, 360);
  if (lockedIdx.length) base = rgbToOklch(hexToRgb(colors[lockedIdx[0]]))[2];
  const hues = schemeHues(m, base, n);

  const chromaBase = m === 'monochrome' ? rand(0.05, 0.14) : rand(0.08, 0.2);
  const lightStart = m === 'nocturne' ? rand(0.12, 0.2) : rand(0.15, 0.32);
  const lightEnd = rand(0.82, 0.97);

  const out = [];
  for (let i = 0; i < n; i++) {
    if (locks[i]) {
      out.push(colors[i]);
      continue;
    }
    const t = n === 1 ? 0.5 : i / (n - 1);
    const L = lightStart + (lightEnd - lightStart) * (m === 'nocturne' ? Math.pow(t, 0.6) : t) + rand(-0.04, 0.04);
    // Chroma peaks in the mid-tones, the way natural palettes do.
    let C = chromaBase * (0.55 + 0.9 * Math.sin(Math.PI * Math.min(1, t * 1.1)));
    if (m === 'nocturne' && i >= 2) C = rand(0.14, 0.24);
    out.push(rgbToHex(oklchToRgb([L, C, hues[i]])));
  }
  return out;
}

// ---------- ramp ----------
// Bake N colours into a smooth gradient, interpolated in OKLab, output as
// linear-light RGBA float data for the shaders.
export function bakeRamp(colors, size = 256) {
  const labs = colors.map((c) => rgbToOklab(hexToRgb(c)));
  const out = new Float32Array(size * 4);
  for (let i = 0; i < size; i++) {
    const x = (i / (size - 1)) * (labs.length - 1);
    const j = Math.min(labs.length - 2, Math.floor(x));
    let t = x - j;
    t = t * t * (3 - 2 * t) * 0.6 + t * 0.4; // ease between stops, keep some linearity
    const a = labs[j];
    const b = labs[j + 1] || a;
    const lab = a.map((v, k) => v + (b[k] - v) * t);
    const rgb = srgbToLinear(oklabToRgb(lab));
    out.set([rgb[0], rgb[1], rgb[2], 1], i * 4);
  }
  return out;
}

// ---------- import / export ----------
export function parsePaletteText(text) {
  const found = String(text).match(/[0-9a-f]{6}/gi);
  if (!found || found.length < MIN_COLORS) return null;
  return found.slice(0, MAX_COLORS).map((h) => h.toUpperCase());
}

export function toCoolorsUrl(colors) {
  return 'https://coolors.co/' + colors.map((c) => c.toLowerCase()).join('-');
}

// ---------- naming ----------
const NAMES = [
  ['Ink', '0B0C10'], ['Abyss', '0D1B2A'], ['Oxblood', '4A0E0E'], ['Aubergine', '3B1F3A'], ['Forest', '1F3B2C'],
  ['Slate', '4A5563'], ['Gunmetal', '2A3439'], ['Graphite', '3A3A3C'], ['Navy', '1B2A4A'], ['Cobalt', '1F4FB5'],
  ['Azure', '2F80ED'], ['Sky', '8EC5FC'], ['Ice', 'DCEFFF'], ['Teal', '127A7A'], ['Lagoon', '2BB3A8'],
  ['Seafoam', '9FE2BF'], ['Moss', '6B7F3A'], ['Olive', '7A7A2E'], ['Chartreuse', 'B5D334'], ['Lime', 'C6F432'],
  ['Mint', 'C8F5DA'], ['Sage', 'A3B59A'], ['Jade', '2E8B57'], ['Emerald', '1F9D55'], ['Saffron', 'F4B400'],
  ['Marigold', 'F2A541'], ['Honey', 'E8B44F'], ['Butter', 'F8E9A1'], ['Sand', 'D8C3A5'], ['Bone', 'EDE6D6'],
  ['Ivory', 'FAF7EE'], ['Snow', 'F7F9FC'], ['Peach', 'FFC4A3'], ['Apricot', 'F7A072'], ['Tangerine', 'F28C28'],
  ['Rust', 'B7410E'], ['Terracotta', 'C8664A'], ['Clay', 'A86E54'], ['Coral', 'FF6F61'], ['Salmon', 'F4978E'],
  ['Vermilion', 'E34234'], ['Crimson', 'C1121F'], ['Garnet', '7B1E2B'], ['Rose', 'E5989B'], ['Blush', 'F6D1D1'],
  ['Magenta', 'D6249F'], ['Fuchsia', 'E040FB'], ['Orchid', 'C77DDB'], ['Lilac', 'C8B6E2'], ['Lavender', 'B8A9E8'],
  ['Violet', '7F39FB'], ['Indigo', '3F2B96'], ['Plum', '6A2C70'], ['Mauve', '9E7A9E'], ['Taupe', '8B7D6B'],
  ['Mocha', '6F4E37'], ['Espresso', '3C2A21'], ['Umber', '5B3A29'], ['Pewter', '96A0A8'], ['Silver', 'C9CED6'],
  ['Fog', 'B6BEC9'], ['Steel', '5E7E9B'], ['Denim', '3B5B8C'], ['Cerulean', '2A9DF4'], ['Turquoise', '30D5C8'],
  ['Aqua', '7FE7F2'], ['Pine', '234F3C'], ['Mustard', 'D4A72C'], ['Brick', '9C3D2E'], ['Wine', '5E1A2F'],
];
const NAME_LABS = NAMES.map(([n, h]) => [n, rgbToOklab(hexToRgb(h))]);

export function colorName(hex) {
  const lab = rgbToOklab(hexToRgb(hex));
  let best = NAME_LABS[0][0];
  let bestD = Infinity;
  for (const [n, l] of NAME_LABS) {
    const d = (lab[0] - l[0]) ** 2 * 1.4 + (lab[1] - l[1]) ** 2 + (lab[2] - l[2]) ** 2;
    if (d < bestD) { bestD = d; best = n; }
  }
  const L = lab[0];
  const prefix = bestD > 0.004 ? (L < 0.3 ? 'Deep ' : L > 0.85 ? 'Pale ' : '') : '';
  return prefix + best;
}

// ---------- presets ----------
export const PRESETS = [
  { name: 'Tidepool', colors: ['0A1724', '0F3D4C', '1F7A7A', '7CC6B8', 'F2E6C9'] },
  { name: 'Ember', colors: ['120A08', '4A1410', 'B23A16', 'F28C28', 'FFE3A3'] },
  { name: 'Orchid night', colors: ['0E0B16', '2D1A47', '6B2FA0', 'D45FB0', 'FFD1E8'] },
  { name: 'Lichen', colors: ['141A12', '34432A', '7A8B4A', 'C8C27A', 'EFEAD2'] },
  { name: 'Glacier', colors: ['06121F', '1B3A5C', '4C7FAF', 'A8CDEB', 'F4FAFF'] },
  { name: 'Copper patina', colors: ['111111', '3B2A20', '9C5A33', '4FA38A', 'D9F0E3'] },
  { name: 'Sodium', colors: ['0B0906', '2E2414', '8A5A12', 'F2A900', 'FFF4CC'] },
  { name: 'Bruise', colors: ['0D0A12', '3A1D3F', '7D2E5C', 'E0605A', 'F5C49C'] },
  { name: 'Phosphor', colors: ['030805', '0A2A16', '1E7A3C', '6AF07A', 'E6FFE0'] },
  { name: 'Kiln', colors: ['1A1310', '5B3A29', 'C8664A', 'E8B44F', 'F6EEDC'] },
];
