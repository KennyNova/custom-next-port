// Coolors-style palette editor: full-height colour columns with lock, shades,
// drag-to-reorder, copy and remove; space to generate; insert between
// columns; custom HSV picker; presets, saved palettes, import/export.

import { MODES, PRESETS, MAX_COLORS, MIN_COLORS, colorName, contrastText, shadesOf, hexToRgb, rgbToHex, hsvToRgb, rgbToHsv, isHex, parsePaletteText, toCoolorsUrl } from './palette.js';
import { icon } from './icons.js';

export class PaletteUI {
  constructor(root, store, toast) {
    this.root = root;
    this.store = store;
    this.toast = toast;
    this.shadesFor = -1;
    this.dragging = null;
    this._build();
    store.on(() => this.render());
    this.render();
  }

  _build() {
    const r = this.root;
    r.innerHTML = `
      <header class="pal-bar">
        <div class="pal-bar-left">
          <strong>Palette</strong>
          <span class="pal-hint">Press <kbd>Space</kbd> to generate</span>
        </div>
        <div class="pal-bar-right">
          <label class="pal-mode">Harmony
            <select data-mode>${Object.entries(MODES).map(([k, v]) => `<option value="${k}">${v.split(' (')[0]}</option>`).join('')}</select>
          </label>
          <span class="sep"></span>
          <button class="icon-btn" data-act="undo" title="Undo (Ctrl+Z)">${icon('undo')}</button>
          <button class="icon-btn" data-act="redo" title="Redo (Ctrl+Y)">${icon('redo')}</button>
          <button class="icon-btn" data-act="reverse" title="Reverse order">${icon('swap')}</button>
          <span class="sep"></span>
          <button class="text-btn" data-act="library">${icon('stack')}<span>Library</span></button>
          <button class="text-btn" data-act="save">${icon('bookmark')}<span>Save</span></button>
          <button class="text-btn" data-act="import">${icon('import')}<span>Import</span></button>
          <button class="text-btn" data-act="export">${icon('link')}<span>Copy link</span></button>
          <span class="sep"></span>
          <button class="icon-btn" data-act="close" title="Close (P)">${icon('chevronDown')}</button>
        </div>
      </header>
      <div class="pal-cols"></div>
      <div class="pal-pop pal-library" hidden></div>
      <div class="pal-pop pal-import" hidden>
        <p>Paste a coolors.co link or any list of hex codes.</p>
        <input type="text" spellcheck="false" placeholder="https://coolors.co/0a1724-0f3d4c-1f7a7a-7cc6b8-f2e6c9">
        <div class="row"><button class="text-btn" data-act="import-cancel">Cancel</button><button class="solid-btn" data-act="import-apply">Apply</button></div>
      </div>
      <div class="picker" hidden>
        <div class="picker-sv"><div class="picker-sv-knob"></div></div>
        <div class="picker-hue"><div class="picker-hue-knob"></div></div>
        <div class="picker-row">
          <span class="picker-preview"></span>
          <input class="picker-hex" maxlength="7" spellcheck="false">
        </div>
      </div>`;
    this.cols = r.querySelector('.pal-cols');
    this.modeSel = r.querySelector('[data-mode]');
    this.libPop = r.querySelector('.pal-library');
    this.importPop = r.querySelector('.pal-import');
    this.picker = r.querySelector('.picker');

    this.modeSel.value = this.store.mode;
    this.modeSel.addEventListener('change', () => this.store.setMode(this.modeSel.value));

    r.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-act]');
      if (!btn) return;
      const act = btn.dataset.act;
      const i = Number(btn.closest('[data-i]')?.dataset.i);
      this._action(act, i, btn, e);
    });

    document.addEventListener('pointerdown', (e) => {
      if (!this.picker.hidden && !this.picker.contains(e.target) && !e.target.closest('.hex')) this.closePicker();
      if (!this.libPop.hidden && !this.libPop.contains(e.target) && !e.target.closest('[data-act="library"]')) this.libPop.hidden = true;
      if (this.shadesFor >= 0 && !e.target.closest('.shades')) {
        this.shadesFor = -1;
        this.render();
      }
    });

    this._initPicker();
  }

  _action(act, i, btn) {
    const s = this.store;
    switch (act) {
      case 'undo': s.undo(); break;
      case 'redo': s.redo(); break;
      case 'reverse': s.reverse(); break;
      case 'close': this.root.dispatchEvent(new CustomEvent('close')); break;
      case 'save': s.saveToLibrary(this._autoName()); this.toast('Saved to library'); break;
      case 'export':
        navigator.clipboard.writeText(toCoolorsUrl(s.colors)).then(() => this.toast('Coolors link copied'));
        break;
      case 'import':
        this.importPop.hidden = !this.importPop.hidden;
        if (!this.importPop.hidden) this.importPop.querySelector('input').focus();
        break;
      case 'import-cancel': this.importPop.hidden = true; break;
      case 'import-apply': {
        const input = this.importPop.querySelector('input');
        const colors = parsePaletteText(input.value);
        if (!colors) { this.toast('No hex colours found in that text'); return; }
        s.setAll(colors);
        input.value = '';
        this.importPop.hidden = true;
        break;
      }
      case 'library': this._toggleLibrary(); break;
      case 'lib-apply': s.setAll(btn.dataset.src === 'preset' ? PRESETS[btn.dataset.idx].colors : s.library[btn.dataset.idx].colors); break;
      case 'lib-delete': s.removeFromLibrary(Number(btn.dataset.idx)); this._renderLibrary(); break;
      case 'lock': s.toggleLock(i); break;
      case 'remove': s.remove(i); break;
      case 'copy': navigator.clipboard.writeText('#' + s.colors[i]).then(() => this.toast(`#${s.colors[i]} copied`)); break;
      case 'shades': this.shadesFor = this.shadesFor === i ? -1 : i; this.render(); break;
      case 'shade-pick': s.set(i, btn.dataset.hex); this.shadesFor = -1; this.render(); break;
      case 'insert': s.insert(Number(btn.dataset.at)); break;
      case 'hex': this.openPicker(i, btn); break;
    }
  }

  _autoName() {
    return this.store.colors.slice(0, 2).map(colorName).join(' & ');
  }

  render() {
    const s = this.store;
    const n = s.colors.length;
    this.cols.innerHTML = s.colors.map((hex, i) => {
      const fg = contrastText(hex);
      const locked = s.locks[i];
      const shades = this.shadesFor === i
        ? `<div class="shades">${shadesOf(hex).map((h) => `<button data-act="shade-pick" data-hex="${h}" style="background:#${h};color:${contrastText(h)}" class="${h === hex ? 'cur' : ''}">${h}</button>`).join('')}</div>`
        : '';
      return `
        <div class="col${locked ? ' locked' : ''}" data-i="${i}" style="background:#${hex};color:${fg}">
          ${shades}
          <div class="col-tools">
            ${n > MIN_COLORS ? `<button class="icon-btn" data-act="remove" title="Remove">${icon('x')}</button>` : ''}
            <button class="icon-btn" data-act="shades" title="Shades">${icon('grid')}</button>
            <button class="icon-btn drag" data-act="drag" title="Drag to reorder">${icon('grip')}</button>
            <button class="icon-btn" data-act="copy" title="Copy hex">${icon('copy')}</button>
          </div>
          <button class="icon-btn lock" data-act="lock" title="${locked ? 'Unlock' : 'Lock'}">${icon(locked ? 'lock' : 'unlock')}</button>
          <button class="hex" data-act="hex" title="Edit colour">${hex}</button>
          <div class="name">${colorName(hex)}</div>
          ${i > 0 && n < MAX_COLORS ? `<button class="insert" data-act="insert" data-at="${i}" title="Add colour">${icon('plus')}</button>` : ''}
        </div>`;
    }).join('');

    this.cols.querySelectorAll('.drag').forEach((h) => h.addEventListener('pointerdown', (e) => this._startDrag(e)));
    if (this.picking != null && !this.picker.hidden) this._syncPicker(false);
    if (!this.libPop.hidden) this._renderLibrary();
  }

  _startDrag(e) {
    e.preventDefault();
    const col = e.target.closest('.col');
    let from = Number(col.dataset.i);
    this.store.beginEdit();
    const rect = this.cols.getBoundingClientRect();
    const move = (ev) => {
      const n = this.store.colors.length;
      const to = Math.max(0, Math.min(n - 1, Math.floor(((ev.clientX - rect.left) / rect.width) * n)));
      if (to !== from) {
        this.store.move(from, to, false);
        from = to;
      }
      this.cols.querySelector(`.col[data-i="${from}"]`)?.classList.add('dragging');
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      this.render();
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    move(e);
  }

  _toggleLibrary() {
    this.libPop.hidden = !this.libPop.hidden;
    if (!this.libPop.hidden) this._renderLibrary();
  }

  _renderLibrary() {
    const strip = (cs) => `<span class="strip">${cs.map((c) => `<i style="background:#${c}"></i>`).join('')}</span>`;
    const saved = this.store.library;
    this.libPop.innerHTML = `
      ${saved.length ? `<h4>Saved</h4>${saved.map((p, i) => `
        <div class="lib-row"><button data-act="lib-apply" data-src="saved" data-idx="${i}">${strip(p.colors)}<span>${p.name}</span></button>
        <button class="icon-btn" data-act="lib-delete" data-idx="${i}" title="Delete">${icon('x')}</button></div>`).join('')}` : ''}
      <h4>Presets</h4>
      ${PRESETS.map((p, i) => `<div class="lib-row"><button data-act="lib-apply" data-src="preset" data-idx="${i}">${strip(p.colors)}<span>${p.name}</span></button></div>`).join('')}`;
  }

  // ---------- picker ----------
  _initPicker() {
    const p = this.picker;
    this.sv = p.querySelector('.picker-sv');
    this.svKnob = p.querySelector('.picker-sv-knob');
    this.hue = p.querySelector('.picker-hue');
    this.hueKnob = p.querySelector('.picker-hue-knob');
    this.hexIn = p.querySelector('.picker-hex');
    this.preview = p.querySelector('.picker-preview');
    this.hsv = [0, 0, 0];

    const drag = (el, fn) => {
      el.addEventListener('pointerdown', (e) => {
        el.setPointerCapture(e.pointerId);
        const r = el.getBoundingClientRect();
        const go = (ev) => fn(Math.min(1, Math.max(0, (ev.clientX - r.left) / r.width)), Math.min(1, Math.max(0, (ev.clientY - r.top) / r.height)));
        go(e);
        const mv = (ev) => go(ev);
        const up = () => { el.removeEventListener('pointermove', mv); el.removeEventListener('pointerup', up); };
        el.addEventListener('pointermove', mv);
        el.addEventListener('pointerup', up);
      });
    };
    drag(this.sv, (x, y) => { this.hsv[1] = x; this.hsv[2] = 1 - y; this._applyPicker(); });
    drag(this.hue, (x) => { this.hsv[0] = x * 360; this._applyPicker(); });
    this.hexIn.addEventListener('input', () => {
      if (!isHex(this.hexIn.value)) return;
      const hex = rgbToHex(hexToRgb(this.hexIn.value));
      this.hsv = rgbToHsv(hexToRgb(hex));
      this.store.set(this.picking, hex, false);
      this._syncPicker(true);
    });
    this.hexIn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === 'Escape') this.closePicker();
      e.stopPropagation();
    });
  }

  openPicker(i, anchor) {
    this.picking = i;
    this.store.beginEdit();
    this.hsv = rgbToHsv(hexToRgb(this.store.colors[i]));
    this.picker.hidden = false;
    const a = anchor.getBoundingClientRect();
    const host = this.root.getBoundingClientRect();
    const w = 232;
    const left = Math.min(host.width - w - 12, Math.max(12, a.left - host.left + a.width / 2 - w / 2));
    this.picker.style.left = left + 'px';
    this.picker.style.bottom = host.bottom - a.top + 10 + 'px';
    this._syncPicker(true);
    this.hexIn.select();
  }

  closePicker() {
    this.picker.hidden = true;
    this.picking = null;
  }

  _applyPicker() {
    const hex = rgbToHex(hsvToRgb(...this.hsv));
    this.store.set(this.picking, hex, false);
    this._syncPicker(true);
  }

  _syncPicker(fromPicker) {
    const hex = this.store.colors[this.picking];
    if (!hex) return this.closePicker();
    if (!fromPicker) this.hsv = rgbToHsv(hexToRgb(hex));
    const [h, s, v] = this.hsv;
    this.sv.style.background = `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, hsl(${h} 100% 50%))`;
    this.svKnob.style.left = s * 100 + '%';
    this.svKnob.style.top = (1 - v) * 100 + '%';
    this.svKnob.style.background = '#' + hex;
    this.hueKnob.style.left = (h / 360) * 100 + '%';
    this.preview.style.background = '#' + hex;
    if (document.activeElement !== this.hexIn) this.hexIn.value = '#' + hex;
  }
}
