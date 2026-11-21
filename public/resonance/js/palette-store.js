// Live palette state: colours, locks, undo history, saved palettes, and the
// GPU-side ramp that eases toward each new palette.

import { bakeRamp, generate, hexToRgb, srgbToLinear, PRESETS, MIN_COLORS, MAX_COLORS, mixHex } from './palette.js';

const KEY = 'resonance.palette.v1';

export class PaletteStore {
  constructor() {
    const saved = load();
    this.colors = saved?.colors || PRESETS[0].colors.slice();
    this.locks = saved?.locks || this.colors.map(() => false);
    this.mode = saved?.mode || 'auto';
    this.library = saved?.library || [];
    this.history = [];
    this.future = [];
    this.listeners = new Set();
    this._ramp = bakeRamp(this.colors);
    this._target = this._ramp.slice();
  }

  on(fn) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  _commit(colors, locks = this.locks, record = true) {
    if (record) {
      this.history.push({ colors: this.colors.slice(), locks: this.locks.slice() });
      if (this.history.length > 100) this.history.shift();
      this.future = [];
    }
    this.colors = colors;
    this.locks = locks;
    this._target = bakeRamp(colors);
    this._save();
    this.listeners.forEach((fn) => fn(this));
  }

  set(i, hex, record = true) {
    const c = this.colors.slice();
    c[i] = hex.replace('#', '').toUpperCase();
    this._commit(c, this.locks, record);
  }

  setAll(colors) {
    const c = colors.slice(0, MAX_COLORS);
    this._commit(c, c.map(() => false));
  }

  toggleLock(i) {
    const l = this.locks.slice();
    l[i] = !l[i];
    this.locks = l;
    this._save();
    this.listeners.forEach((fn) => fn(this));
  }

  generate() {
    this._commit(generate(this.colors, this.locks, this.mode));
  }

  setMode(mode) {
    this.mode = mode;
    this._save();
  }

  insert(at) {
    if (this.colors.length >= MAX_COLORS) return;
    const left = this.colors[Math.max(0, at - 1)];
    const right = this.colors[Math.min(this.colors.length - 1, at)];
    const c = this.colors.slice();
    const l = this.locks.slice();
    c.splice(at, 0, mixHex(left, right));
    l.splice(at, 0, false);
    this._commit(c, l);
  }

  remove(i) {
    if (this.colors.length <= MIN_COLORS) return;
    const c = this.colors.slice();
    const l = this.locks.slice();
    c.splice(i, 1);
    l.splice(i, 1);
    this._commit(c, l);
  }

  move(from, to, record = true) {
    if (from === to) return;
    const c = this.colors.slice();
    const l = this.locks.slice();
    const [cc] = c.splice(from, 1);
    const [ll] = l.splice(from, 1);
    c.splice(to, 0, cc);
    l.splice(to, 0, ll);
    this._commit(c, l, record);
  }

  // Snapshot for undo before a continuous edit (picker drag, reorder drag).
  beginEdit() {
    this.history.push({ colors: this.colors.slice(), locks: this.locks.slice() });
    this.future = [];
  }

  reverse() {
    this._commit(this.colors.slice().reverse(), this.locks.slice().reverse());
  }

  undo() {
    const prev = this.history.pop();
    if (!prev) return;
    this.future.push({ colors: this.colors.slice(), locks: this.locks.slice() });
    this._commit(prev.colors, prev.locks, false);
  }

  redo() {
    const next = this.future.pop();
    if (!next) return;
    this.history.push({ colors: this.colors.slice(), locks: this.locks.slice() });
    this._commit(next.colors, next.locks, false);
  }

  saveToLibrary(name) {
    this.library.unshift({ name: name || `Palette ${this.library.length + 1}`, colors: this.colors.slice() });
    this._save();
    this.listeners.forEach((fn) => fn(this));
  }

  removeFromLibrary(i) {
    this.library.splice(i, 1);
    this._save();
    this.listeners.forEach((fn) => fn(this));
  }

  // Ease the GPU ramp toward the target; returns true while still moving.
  tick(dt) {
    const k = 1 - Math.exp(-dt * 7);
    let moving = false;
    for (let i = 0; i < this._ramp.length; i++) {
      const d = this._target[i] - this._ramp[i];
      if (Math.abs(d) > 1e-4) {
        this._ramp[i] += d * k;
        moving = true;
      }
    }
    return moving;
  }

  get ramp() {
    return this._ramp;
  }

  // Linear RGB at position t of the current (eased) ramp.
  sample(t) {
    const n = this._ramp.length / 4;
    const i = Math.max(0, Math.min(n - 1, Math.round(t * (n - 1)))) * 4;
    return [this._ramp[i], this._ramp[i + 1], this._ramp[i + 2]];
  }

  linearSwatches() {
    const out = new Float32Array(8 * 3);
    this.colors.forEach((c, i) => out.set(srgbToLinear(hexToRgb(c)), i * 3));
    return out;
  }

  _save() {
    try {
      localStorage.setItem(KEY, JSON.stringify({ colors: this.colors, locks: this.locks, mode: this.mode, library: this.library }));
    } catch {}
  }
}

function load() {
  try {
    const v = JSON.parse(localStorage.getItem(KEY));
    if (v && Array.isArray(v.colors) && v.colors.length >= MIN_COLORS) return v;
  } catch {}
  return null;
}
