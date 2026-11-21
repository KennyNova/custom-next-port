import { Core, DataTexture } from './gl.js';
import { Post } from './post.js';
import { AudioEngine, SPECTRUM_SIZE } from './audio.js';
import { PaletteStore } from './palette-store.js';
import { PaletteUI } from './palette-ui.js';
import { icon } from './icons.js';
import Waves from './visualizers/waves.js';
import Flow from './visualizers/flow.js';
import Alloy from './visualizers/alloy.js';
import Cymatics from './visualizers/cymatics.js';
import Coral from './visualizers/coral.js';

const VISUALIZERS = [Waves, Flow, Alloy, Cymatics, Coral];
const SETTINGS_KEY = 'resonance.settings.v1';

const GLOBAL_PARAMS = [
  { key: 'sensitivity', label: 'Sensitivity', min: 0.4, max: 2.5, step: 0.01, value: 1 },
  { key: 'smoothing', label: 'Smoothing', min: 0, max: 1, step: 0.01, value: 0.5 },
  { key: 'bloom', label: 'Bloom', min: 0, max: 3, step: 0.01, value: 0.8 },
  { key: 'threshold', label: 'Bloom threshold', min: 0, max: 2, step: 0.01, value: 0.7 },
  { key: 'grain', label: 'Film grain', min: 0, max: 2, step: 0.01, value: 0.5 },
  { key: 'paper', label: 'Paper texture', min: 0, max: 2, step: 0.01, value: 0.35 },
  { key: 'aberration', label: 'Lens fringing', min: 0, max: 3, step: 0.01, value: 0.4 },
  { key: 'vignette', label: 'Vignette', min: 0, max: 1, step: 0.01, value: 0.55 },
  { key: 'exposure', label: 'Exposure', min: 0.3, max: 2.5, step: 0.01, value: 1 },
  { key: 'quality', label: 'Render quality', min: 0.4, max: 1.5, step: 0.05, value: 1 },
];

const $ = (s, el = document) => el.querySelector(s);

class App {
  constructor() {
    this.canvas = $('#stage');
    this.settings = this._loadSettings();
    this.audio = new AudioEngine();
    this.palette = new PaletteStore();
    this.instances = new Map();
    // A ?viz=<id> link opens on that visualizer; otherwise resume the last one.
    const linked = new URLSearchParams(location.search).get('viz');
    this.vizIndex = Math.max(0, VISUALIZERS.findIndex((v) => v.id === (linked || this.settings.viz)));
    this.fade = 0;
    this.pendingIndex = null;
    this.frameTimes = [];

    try {
      this.core = new Core(this.canvas);
    } catch (e) {
      this._fatal(e.message);
      return;
    }
    this.post = new Post(this.core);
    this.spectrumTex = this.core.texture1D(SPECTRUM_SIZE, 'RG16F');
    this.paletteTex = new DataTexture(this.core, 256, 1, 'RGBA16F');

    this._buildUI();
    this.paletteUI = new PaletteUI($('#palette'), this.palette, (m) => this.toast(m));
    $('#palette').addEventListener('close', () => this.togglePalette(false));
    this.palette.on(() => this._renderPaletteChip());
    this._renderPaletteChip();

    window.addEventListener('resize', () => this._resize());
    this._resize();
    this._applyGlobal();

    this.last = performance.now();
    requestAnimationFrame((t) => this._loop(t));
    this._autoStart();
  }

  // ---------- settings ----------
  _loadSettings() {
    let s = {};
    try { s = JSON.parse(localStorage.getItem(SETTINGS_KEY)) || {}; } catch {}
    s.global = { ...Object.fromEntries(GLOBAL_PARAMS.map((p) => [p.key, p.value])), ...(s.global || {}) };
    s.params = s.params || {};
    for (const V of VISUALIZERS) {
      s.params[V.id] = { ...Object.fromEntries(V.params.map((p) => [p.key, p.value])), ...(s.params[V.id] || {}) };
    }
    return s;
  }

  _saveSettings() {
    clearTimeout(this._saveT);
    this._saveT = setTimeout(() => {
      try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(this.settings)); } catch {}
    }, 200);
  }

  _applyGlobal() {
    const g = this.settings.global;
    this.audio.sensitivity = g.sensitivity;
    this.audio.smoothing = g.smoothing;
    Object.assign(this.post.settings, {
      bloom: g.bloom, threshold: g.threshold, grain: g.grain, paper: g.paper,
      aberration: g.aberration, vignette: g.vignette, exposure: g.exposure,
    });
  }

  // ---------- sizing ----------
  _resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.floor(window.innerWidth * dpr);
    const h = Math.floor(window.innerHeight * dpr);
    this.canvas.width = w;
    this.canvas.height = h;
    this._sizeScene();
  }

  _sizeScene() {
    const V = VISUALIZERS[this.vizIndex];
    const q = this.settings.global.quality;
    // Scene resolution is capped near 1440p; grain and paper are drawn at full res on top.
    const cap = Math.min(1, 1440 / this.canvas.height);
    const sw = Math.max(64, Math.round(this.canvas.width * V.renderScale * q * cap));
    const sh = Math.max(64, Math.round(this.canvas.height * V.renderScale * q * cap));
    if (this.scene && this.scene.w === sw && this.scene.h === sh) return;
    this.scene?.dispose();
    this.scene = this.core.target(sw, sh, { format: 'RGBA16F' });
    this.post.resize(sw, sh);
    for (const inst of this.instances.values()) inst._sized = null;
  }

  _viz() {
    const V = VISUALIZERS[this.vizIndex];
    let inst = this.instances.get(V.id);
    if (!inst) {
      inst = new V(this.core);
      this.instances.set(V.id, inst);
    }
    const key = this.scene.w + 'x' + this.scene.h;
    if (inst._sized !== key) {
      inst.resize(this.scene.w, this.scene.h);
      inst._sized = key;
    }
    return inst;
  }

  setViz(i) {
    i = (i + VISUALIZERS.length) % VISUALIZERS.length;
    if (i === this.vizIndex && this.pendingIndex == null) return;
    this.pendingIndex = i;
    this._renderTabs(i);
  }

  // ---------- loop ----------
  _loop(now) {
    requestAnimationFrame((t) => this._loop(t));
    const dt = Math.min(0.1, (now - this.last) / 1000);
    this.last = now;

    // Fade through black when switching visualizers.
    if (this.pendingIndex != null) {
      this.fade = Math.max(0, this.fade - dt * 5);
      if (this.fade === 0) {
        this.vizIndex = this.pendingIndex;
        this.pendingIndex = null;
        this.settings.viz = VISUALIZERS[this.vizIndex].id;
        this._saveSettings();
        this._sizeScene();
        this._renderParams();
      }
    } else {
      this.fade = Math.min(1, this.fade + dt * 2.5);
    }

    this.audio.update(dt);
    this.spectrumTex.upload(this.audio.packed);
    if (this.palette.tick(dt) || !this._palUploaded) {
      this.paletteTex.upload(this.palette.ramp);
      this._palUploaded = true;
    }

    const a = this.audio;
    const b = a.bands;
    Object.assign(this.core.shared, {
      uTime: now / 1000,
      uRes: [this.scene.w, this.scene.h],
      uBass: b.bass, uLowMid: b.lowMid, uMid: b.mid, uHigh: b.high, uAir: b.air,
      uLevel: a.level, uBeat: a.beat, uCentroid: a.centroid,
      uSpectrum: this.spectrumTex,
      uPalette: this.paletteTex,
      uColors: this.palette.linearSwatches(),
      uColorCount: this.palette.colors.length,
    });

    const V = VISUALIZERS[this.vizIndex];
    try {
      this._viz().frame(this.scene, dt, a, this.settings.params[V.id], this.palette);
    } catch (e) {
      console.error(e);
      if (!this._vizErr) this.toast(`${V.label} failed: ${e.message}`);
      this._vizErr = true;
    }
    this.post.render(this.scene, this.fade);
    this._meter();
    this._fps(dt);
  }

  _fps(dt) {
    const f = this.frameTimes;
    f.push(dt);
    if (f.length > 60) f.shift();
    if (this.fpsEl && !this.fpsEl.hidden && (this._fpsTick = (this._fpsTick || 0) + 1) % 15 === 0) {
      const avg = f.reduce((x, y) => x + y, 0) / f.length;
      this.fpsEl.textContent = `${Math.round(1 / avg)} fps · ${this.scene.w}×${this.scene.h}`;
    }
  }

  // ---------- audio sources ----------
  async _autoStart() {
    const last = this.settings.source;
    if (last === 'demo') return this.startSource({ kind: 'demo' }, true);
    if (window.native?.isElectron && (!last || last === 'system')) return this.startSource({ kind: 'system' }, true);
    this._showWelcome(true);
  }

  async startSource(src, quiet = false) {
    try {
      if (src.kind === 'system') await this.audio.useSystemAudio();
      else if (src.kind === 'device') await this.audio.useDevice(src.id, src.label);
      else if (src.kind === 'file') await this.audio.useFile(src.file);
      else if (src.kind === 'demo') await this.audio.useDemo();
      if (src.kind !== 'file') this.settings.source = src.kind === 'device' ? 'device' : src.kind;
      this._saveSettings();
      this._showWelcome(false);
      if (!quiet) this.toast(`Listening to ${this.audio.label}`);
    } catch (e) {
      console.error(e);
      const msg = e.name === 'NotAllowedError' ? 'Permission was denied' : e.message;
      this.toast(`Could not start ${src.kind === 'system' ? 'system audio' : 'source'}: ${msg}`);
      if (!this.audio.active) this._showWelcome(true);
    }
    this._renderSourceButton();
  }

  // ---------- UI ----------
  _buildUI() {
    const tabs = $('#viz-tabs');
    tabs.innerHTML = VISUALIZERS.map((V, i) => `<button data-viz="${i}" title="${V.blurb}"><span class="k">${i + 1}</span>${V.label}</button>`).join('');
    tabs.addEventListener('click', (e) => {
      const b = e.target.closest('[data-viz]');
      if (b) this.setViz(Number(b.dataset.viz));
    });
    this._renderTabs(this.vizIndex);

    $('#btn-source').addEventListener('click', () => this._toggleSourceMenu());
    $('#btn-palette').addEventListener('click', () => this.togglePalette());
    $('#btn-settings').addEventListener('click', () => this.toggleSettings());
    $('#btn-full').addEventListener('click', () => this.toggleFullscreen());
    $('#btn-settings').innerHTML = icon('sliders');
    $('#btn-full').innerHTML = icon('expand');
    this.fpsEl = $('#fps');

    $('#file-input').addEventListener('change', (e) => {
      const f = e.target.files[0];
      if (f) this.startSource({ kind: 'file', file: f });
      e.target.value = '';
    });

    document.addEventListener('pointerdown', (e) => {
      const m = $('#source-menu');
      if (!m.hidden && !m.contains(e.target) && !e.target.closest('#btn-source')) m.hidden = true;
    });

    // In a browser, "system audio" goes through the screen-share picker, which
    // only sends sound when its audio box is ticked.
    if (!window.native?.isElectron) {
      $('#welcome [data-src="system"] span').textContent = 'Share a tab or your screen, and tick “Share audio”';
    }

    $('#welcome').addEventListener('click', (e) => {
      const b = e.target.closest('[data-src]');
      if (!b) return;
      const k = b.dataset.src;
      if (k === 'file') $('#file-input').click();
      else if (k === 'device') this._toggleSourceMenu(true);
      else this.startSource({ kind: k });
    });

    // Drop an audio file anywhere.
    window.addEventListener('dragover', (e) => e.preventDefault());
    window.addEventListener('drop', (e) => {
      e.preventDefault();
      const f = [...e.dataTransfer.files].find((x) => x.type.startsWith('audio') || /\.(mp3|wav|flac|ogg|m4a|aac)$/i.test(x.name));
      if (f) this.startSource({ kind: 'file', file: f });
    });

    // Auto-hide chrome when the mouse rests.
    const wake = () => {
      document.body.classList.remove('idle');
      clearTimeout(this._idleT);
      this._idleT = setTimeout(() => {
        if (!document.querySelector('.panel.open, #palette.open, #source-menu:not([hidden])')) document.body.classList.add('idle');
      }, 2800);
    };
    window.addEventListener('pointermove', wake);
    window.addEventListener('pointerdown', wake);
    wake();

    window.addEventListener('keydown', (e) => this._key(e));
    this._renderParams();
    this._renderSourceButton();
  }

  _key(e) {
    if (e.target.closest?.('input, select, textarea')) return;
    const k = e.key;
    if (k === ' ') {
      e.preventDefault();
      if (document.activeElement?.tagName === 'BUTTON') document.activeElement.blur();
      this.palette.generate();
      return;
    }
    if ((e.ctrlKey || e.metaKey) && k.toLowerCase() === 'z') { e.preventDefault(); e.shiftKey ? this.palette.redo() : this.palette.undo(); return; }
    if ((e.ctrlKey || e.metaKey) && k.toLowerCase() === 'y') { e.preventDefault(); this.palette.redo(); return; }
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (/^[1-9]$/.test(k) && Number(k) <= VISUALIZERS.length) this.setViz(Number(k) - 1);
    else if (k === 'ArrowRight') this.setViz((this.pendingIndex ?? this.vizIndex) + 1);
    else if (k === 'ArrowLeft') this.setViz((this.pendingIndex ?? this.vizIndex) - 1);
    else if (k === 'p' || k === 'P') this.togglePalette();
    else if (k === 's' || k === 'S') this.toggleSettings();
    else if (k === 'f' || k === 'F' || k === 'F11') { e.preventDefault(); this.toggleFullscreen(); }
    else if (k === 'h' || k === 'H') document.body.classList.toggle('hide-ui');
    else if (k === 'Escape') { this.togglePalette(false); this.toggleSettings(false); $('#source-menu').hidden = true; }
    else if (k === '`') this.fpsEl.hidden = !this.fpsEl.hidden;
  }

  _renderTabs(active) {
    document.querySelectorAll('#viz-tabs [data-viz]').forEach((b) => b.classList.toggle('on', Number(b.dataset.viz) === active));
  }

  togglePalette(force) {
    const el = $('#palette');
    const open = force ?? !el.classList.contains('open');
    el.classList.toggle('open', open);
    $('#btn-palette').classList.toggle('on', open);
    if (open) this.toggleSettings(false);
  }

  toggleSettings(force) {
    const el = $('#settings');
    const open = force ?? !el.classList.contains('open');
    el.classList.toggle('open', open);
    $('#btn-settings').classList.toggle('on', open);
    if (open) this.togglePalette(false);
  }

  async toggleFullscreen() {
    if (window.native?.toggleFullscreen) return window.native.toggleFullscreen();
    if (document.fullscreenElement) document.exitFullscreen();
    else document.documentElement.requestFullscreen();
  }

  _renderPaletteChip() {
    $('#btn-palette').innerHTML = `<span class="chip-strip">${this.palette.colors.map((c) => `<i style="background:#${c}"></i>`).join('')}</span>`;
  }

  _renderParams() {
    const V = VISUALIZERS[this.vizIndex];
    const host = $('#settings');
    const row = (p, values, scope) => {
      const v = values[p.key];
      if (p.type === 'select') {
        return `<label class="field"><span>${p.label}</span>
          <select data-scope="${scope}" data-key="${p.key}">${p.options.map((o, i) => `<option value="${i}" ${i === v ? 'selected' : ''}>${o}</option>`).join('')}</select></label>`;
      }
      return `<label class="field"><span>${p.label}<output>${fmt(v, p.step)}</output></span>
        <input type="range" min="${p.min}" max="${p.max}" step="${p.step}" value="${v}" data-scope="${scope}" data-key="${p.key}"></label>`;
    };
    host.innerHTML = `
      <section>
        <header><h3>${V.label}</h3><button class="text-btn" data-reset="viz">Reset</button></header>
        <p class="blurb">${V.blurb}</p>
        ${V.params.map((p) => row(p, this.settings.params[V.id], 'viz')).join('')}
      </section>
      <section>
        <header><h3>Look &amp; audio</h3><button class="text-btn" data-reset="global">Reset</button></header>
        ${GLOBAL_PARAMS.map((p) => row(p, this.settings.global, 'global')).join('')}
      </section>
      <section class="keys">
        <h3>Keys</h3>
        <dl>
          <dt>1–${VISUALIZERS.length}, ← →</dt><dd>Switch visualizer</dd>
          <dt>Space</dt><dd>New palette</dd>
          <dt>P</dt><dd>Palette editor</dd>
          <dt>S</dt><dd>This panel</dd>
          <dt>F</dt><dd>Fullscreen</dd>
          <dt>H</dt><dd>Hide interface</dd>
          <dt>Ctrl+Z</dt><dd>Undo palette change</dd>
        </dl>
      </section>`;

    host.oninput = (e) => {
      const el = e.target;
      if (!el.dataset.key) return;
      const scope = el.dataset.scope === 'viz' ? this.settings.params[V.id] : this.settings.global;
      const v = Number(el.value);
      scope[el.dataset.key] = v;
      const out = el.parentElement.querySelector('output');
      if (out) out.textContent = fmt(v, Number(el.step));
      if (el.dataset.scope === 'global') {
        this._applyGlobal();
        if (el.dataset.key === 'quality') this._sizeScene();
      }
      this._saveSettings();
    };
    host.onchange = host.oninput;
    host.onclick = (e) => {
      const r = e.target.closest('[data-reset]');
      if (!r) return;
      if (r.dataset.reset === 'viz') this.settings.params[V.id] = Object.fromEntries(V.params.map((p) => [p.key, p.value]));
      else {
        this.settings.global = Object.fromEntries(GLOBAL_PARAMS.map((p) => [p.key, p.value]));
        this._applyGlobal();
        this._sizeScene();
      }
      this._saveSettings();
      this._renderParams();
    };
  }

  _renderSourceButton() {
    const a = this.audio;
    const ic = a.kind === 'system' ? 'speaker' : a.kind.startsWith('device') ? 'mic' : a.kind === 'file' ? 'file' : a.kind === 'demo' ? 'wave' : 'speaker';
    $('#btn-source').innerHTML = `${icon(ic)}<span class="src-label">${escapeHtml(a.label)}</span><span class="meter">${'<i></i>'.repeat(5)}</span>`;
    this.meterBars = [...document.querySelectorAll('#btn-source .meter i')];
  }

  _meter() {
    if (!this.meterBars || document.body.classList.contains('idle')) return;
    const b = this.audio.bands;
    [b.bass, b.lowMid, b.mid, b.high, b.air].forEach((v, i) => {
      this.meterBars[i].style.transform = `scaleY(${0.12 + Math.min(1, v) * 0.88})`;
    });
  }

  async _toggleSourceMenu(force) {
    const m = $('#source-menu');
    const open = force ?? m.hidden;
    m.hidden = !open;
    if (!open) return;
    const cur = this.audio.kind;
    m.innerHTML = `<div class="menu-head">Listen to</div>
      <button data-k="system" class="${cur === 'system' ? 'on' : ''}">${icon('speaker')}<span><b>System audio</b><small>Everything playing on this computer</small></span></button>
      <div class="menu-head">Inputs</div>
      <div class="menu-devices"><p class="muted">Looking for devices…</p></div>
      <div class="menu-head">Other</div>
      <button data-k="file" class="${cur === 'file' ? 'on' : ''}">${icon('file')}<span><b>Audio file…</b><small>Or drop one onto the window</small></span></button>
      <button data-k="demo" class="${cur === 'demo' ? 'on' : ''}">${icon('wave')}<span><b>Demo synth</b><small>Built-in generative loop</small></span></button>
      ${this.audio.active ? `<button data-k="stop">${icon('x')}<span><b>Stop listening</b></span></button>` : ''}`;
    m.onclick = (e) => {
      const b = e.target.closest('[data-k]');
      if (!b) return;
      const k = b.dataset.k;
      m.hidden = true;
      if (k === 'file') $('#file-input').click();
      else if (k === 'stop') { this.audio.stop(); this._renderSourceButton(); }
      else if (k === 'device') this.startSource({ kind: 'device', id: b.dataset.id, label: b.dataset.label });
      else this.startSource({ kind: k });
    };
    const devices = await this.audio.listDevices();
    const host = m.querySelector('.menu-devices');
    if (!host) return;
    host.innerHTML = devices.length
      ? devices.map((d) => `<button data-k="device" data-id="${d.id}" data-label="${escapeHtml(d.label)}" class="${cur === 'device:' + d.id ? 'on' : ''}">${icon('mic')}<span><b>${escapeHtml(d.label.replace(/\s*\([0-9a-f]{4}:[0-9a-f]{4}\)$/i, ''))}</b></span></button>`).join('')
      : '<p class="muted">No input devices found</p>';
  }

  _showWelcome(show) {
    $('#welcome').hidden = !show;
  }

  toast(msg) {
    const t = document.createElement('div');
    t.className = 'toast';
    t.textContent = msg;
    $('#toasts').appendChild(t);
    requestAnimationFrame(() => t.classList.add('in'));
    setTimeout(() => {
      t.classList.remove('in');
      setTimeout(() => t.remove(), 300);
    }, 2600);
  }

  _fatal(msg) {
    document.body.innerHTML = `<div class="fatal"><h1>Resonance can't start</h1><p>${escapeHtml(msg)}</p></div>`;
  }
}

function fmt(v, step) {
  const d = step >= 1 ? 0 : step >= 0.1 ? 1 : step >= 0.01 ? 2 : 3;
  return Number(v).toFixed(d);
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

window.app = new App();
