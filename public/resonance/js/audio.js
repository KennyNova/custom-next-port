// Audio capture + analysis. Produces a log-frequency spectrum, a stabilised
// waveform, band energies and a beat pulse every frame.

export const SPECTRUM_SIZE = 512;
const F_MIN = 28;
const F_MAX = 16000;

// Band edges in Hz; names are what the shaders see.
const BANDS = [
  ['bass', 20, 140],
  ['lowMid', 140, 500],
  ['mid', 500, 2000],
  ['high', 2000, 7000],
  ['air', 7000, 16000],
];

export class AudioEngine {
  constructor() {
    this.ctx = null;
    this.analyser = null;
    this.input = null;
    this.sourceNode = null;
    this.stream = null;
    this.mediaEl = null;
    this.demo = null;
    this.kind = 'none';
    this.label = 'No source';

    this.sensitivity = 1;
    this.smoothing = 0.5;

    this.spectrum = new Float32Array(SPECTRUM_SIZE);
    this.waveform = new Float32Array(SPECTRUM_SIZE);
    this.packed = new Float32Array(SPECTRUM_SIZE * 2); // RG texture payload
    this.bands = { bass: 0, lowMid: 0, mid: 0, high: 0, air: 0 };
    this.level = 0;
    this.beat = 0;
    this.beatCount = 0;
    this.centroid = 0;
    this.active = false;

    this._ceil = -30; // running loudest dB (auto gain)
    this._prevBass = 0;
    this._flux = new Float32Array(64);
    this._fluxIdx = 0;
    this._sinceBeat = 1;
  }

  async _ensureContext() {
    if (!this.ctx) {
      this.ctx = new AudioContext({ latencyHint: 'interactive' });
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 8192;
      this.analyser.smoothingTimeConstant = 0.35;
      this.analyser.minDecibels = -110;
      this.analyser.maxDecibels = -10;
      this.input = this.ctx.createGain();
      this.input.connect(this.analyser);
      this._fft = new Float32Array(this.analyser.frequencyBinCount);
      this._time = new Float32Array(this.analyser.fftSize);
      this._buildBinMap();
    }
    if (this.ctx.state === 'suspended') await this.ctx.resume();
  }

  _buildBinMap() {
    const hzPerBin = this.ctx.sampleRate / this.analyser.fftSize;
    this._lo = new Float32Array(SPECTRUM_SIZE);
    this._hi = new Float32Array(SPECTRUM_SIZE);
    this._freq = new Float32Array(SPECTRUM_SIZE);
    for (let i = 0; i < SPECTRUM_SIZE; i++) {
      const f0 = F_MIN * Math.pow(F_MAX / F_MIN, i / SPECTRUM_SIZE);
      const f1 = F_MIN * Math.pow(F_MAX / F_MIN, (i + 1) / SPECTRUM_SIZE);
      this._lo[i] = f0 / hzPerBin;
      this._hi[i] = f1 / hzPerBin;
      this._freq[i] = Math.sqrt(f0 * f1);
    }
    this._bandIdx = BANDS.map(([name, lo, hi]) => {
      const a = Math.max(0, Math.floor(SPECTRUM_SIZE * Math.log(lo / F_MIN) / Math.log(F_MAX / F_MIN)));
      const b = Math.min(SPECTRUM_SIZE, Math.ceil(SPECTRUM_SIZE * Math.log(hi / F_MIN) / Math.log(F_MAX / F_MIN)));
      return [name, a, Math.max(a + 1, b)];
    });
  }

  stop() {
    if (this.sourceNode) {
      try { this.sourceNode.disconnect(); } catch {}
      this.sourceNode = null;
    }
    if (this._native) {
      window.native.loopback.stop();
      this._native = false;
    }
    if (this.stream) {
      this.stream.getTracks().forEach((t) => t.stop());
      this.stream = null;
    }
    if (this.mediaEl) {
      this.mediaEl.pause();
      URL.revokeObjectURL(this.mediaEl.src);
      this.mediaEl = null;
    }
    if (this.demo) {
      this.demo.stop();
      this.demo = null;
    }
    this.active = false;
    this.kind = 'none';
    this.label = 'No source';
  }

  async useSystemAudio() {
    await this._ensureContext();
    const lb = window.native?.loopback;
    if (lb) {
      this.stop();
      if (!this._feedReady) {
        this._feedReady = this.ctx.audioWorklet.addModule(new URL('./pcm-feed.worklet.js', import.meta.url));
      }
      await this._feedReady;
      const node = new AudioWorkletNode(this.ctx, 'pcm-feed', { numberOfInputs: 0, outputChannelCount: [1] });
      lb.onRate((hz) => node.port.postMessage({ rate: hz }));
      lb.onData((bytes) => {
        // IPC hands over a Uint8Array that may not be 4-byte aligned; copy into floats.
        const f = new Float32Array(bytes.byteLength >> 2);
        new Uint8Array(f.buffer).set(bytes.subarray(0, f.length * 4));
        node.port.postMessage(f, [f.buffer]);
      });
      if (!(await lb.start())) throw new Error('The native capture helper is missing. Run "npm run build:native".');
      this.sourceNode = node;
      this.sourceNode.connect(this.input);
      this._native = true;
      this._started('system', 'System audio');
      return;
    }
    const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
    stream.getVideoTracks().forEach((t) => t.stop());
    if (!stream.getAudioTracks().length) throw new Error('The capture did not include an audio track.');
    this.stop();
    this.stream = stream;
    this.sourceNode = this.ctx.createMediaStreamSource(stream);
    this.sourceNode.connect(this.input);
    this._started('system', 'System audio');
  }

  async useDevice(deviceId, label) {
    await this._ensureContext();
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        deviceId: deviceId ? { exact: deviceId } : undefined,
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
      },
    });
    this.stop();
    this.stream = stream;
    this.sourceNode = this.ctx.createMediaStreamSource(stream);
    this.sourceNode.connect(this.input);
    const track = stream.getAudioTracks()[0];
    this._started('device:' + (deviceId || 'default'), label || track?.label || 'Input device');
  }

  async useFile(file) {
    await this._ensureContext();
    this.stop();
    const el = new Audio();
    el.src = URL.createObjectURL(file);
    el.loop = true;
    el.crossOrigin = 'anonymous';
    this.mediaEl = el;
    this.sourceNode = this.ctx.createMediaElementSource(el);
    this.sourceNode.connect(this.input);
    this.sourceNode.connect(this.ctx.destination);
    await el.play();
    this._started('file', file.name.replace(/\.[^.]+$/, ''));
  }

  async useDemo() {
    await this._ensureContext();
    this.stop();
    this.demo = new DemoSynth(this.ctx);
    this.sourceNode = this.demo.output;
    this.sourceNode.connect(this.input);
    this.sourceNode.connect(this.ctx.destination);
    this.demo.start();
    this._started('demo', 'Demo synth');
  }

  _started(kind, label) {
    this.kind = kind;
    this.label = label;
    this.active = true;
    this._ceil = -30;
  }

  async listDevices() {
    if (!navigator.mediaDevices?.enumerateDevices) return [];
    let devices = await navigator.mediaDevices.enumerateDevices();
    // Labels stay empty until the page has had mic permission once.
    if (devices.some((d) => d.kind === 'audioinput' && !d.label)) {
      try {
        const s = await navigator.mediaDevices.getUserMedia({ audio: true });
        s.getTracks().forEach((t) => t.stop());
        devices = await navigator.mediaDevices.enumerateDevices();
      } catch {}
    }
    return devices
      .filter((d) => d.kind === 'audioinput' && d.deviceId !== 'communications')
      .map((d) => ({ id: d.deviceId, label: d.label || 'Input device' }));
  }

  update(dt) {
    const S = SPECTRUM_SIZE;
    if (!this.active || !this.analyser) {
      // Let everything relax to silence.
      for (let i = 0; i < S; i++) {
        this.spectrum[i] *= 0.9;
        this.waveform[i] *= 0.9;
      }
      for (const k in this.bands) this.bands[k] *= 0.9;
      this.level *= 0.9;
      this.beat *= Math.exp(-dt * 5);
      this._pack();
      return;
    }

    const fft = this._fft;
    this.analyser.getFloatFrequencyData(fft);

    // Log-frequency resample with a +3 dB/octave tilt so highs read as loud as lows.
    let frameMax = -200;
    const raw = this._raw || (this._raw = new Float32Array(S));
    for (let i = 0; i < S; i++) {
      const lo = this._lo[i];
      const hi = this._hi[i];
      let db;
      if (hi - lo < 1) {
        const x = (lo + hi) * 0.5;
        const j = Math.floor(x);
        const t = x - j;
        db = fft[j] * (1 - t) + fft[Math.min(j + 1, fft.length - 1)] * t;
      } else {
        db = -200;
        for (let j = Math.floor(lo); j < Math.ceil(hi) && j < fft.length; j++) if (fft[j] > db) db = fft[j];
      }
      if (!isFinite(db)) db = -200;
      db += 3 * Math.log2(this._freq[i] / 1000);
      raw[i] = db;
      if (db > frameMax) frameMax = db;
    }

    // Auto gain: follow the loudest bin quickly up and slowly down.
    if (frameMax > this._ceil) this._ceil += (frameMax - this._ceil) * Math.min(1, dt * 8);
    else this._ceil += (frameMax - this._ceil) * Math.min(1, dt * 0.25);
    const ceil = Math.max(this._ceil, -75);
    const range = 52 / this.sensitivity;
    const floor = ceil - range;

    const attack = 1 - Math.exp(-dt * 40);
    const release = 1 - Math.exp(-dt * (4 + 22 * (1 - this.smoothing)));
    let sum = 0;
    let wsum = 0;
    for (let i = 0; i < S; i++) {
      let v = (raw[i] - floor) / range;
      v = v < 0 ? 0 : v > 1.25 ? 1.25 : v;
      v = v * v * (1.2 - 0.2 * v); // soften the floor
      const cur = this.spectrum[i];
      this.spectrum[i] = cur + (v - cur) * (v > cur ? attack : release);
      sum += this.spectrum[i] * i;
      wsum += this.spectrum[i];
    }
    this.centroid += ((wsum > 1e-3 ? sum / wsum / S : 0) - this.centroid) * Math.min(1, dt * 4);

    let total = 0;
    for (const [name, a, b] of this._bandIdx) {
      let s = 0;
      for (let i = a; i < b; i++) s += this.spectrum[i];
      const v = Math.min(1, (s / (b - a)) * 1.25);
      this.bands[name] += (v - this.bands[name]) * Math.min(1, dt * (v > this.bands[name] ? 30 : 8));
      total += this.bands[name];
    }
    this.level = total / BANDS.length;

    // Onset detection on low-end flux with an adaptive threshold.
    const bassNow = raw.slice(0, this._bandIdx[1][2]).reduce((a, d) => a + Math.max(0, d - floor), 0);
    const flux = Math.max(0, bassNow - this._prevBass);
    this._prevBass = bassNow;
    const hist = this._flux;
    let mean = 0;
    for (let i = 0; i < hist.length; i++) mean += hist[i];
    mean /= hist.length;
    let varc = 0;
    for (let i = 0; i < hist.length; i++) varc += (hist[i] - mean) ** 2;
    const std = Math.sqrt(varc / hist.length);
    hist[this._fluxIdx] = flux;
    this._fluxIdx = (this._fluxIdx + 1) % hist.length;
    this._sinceBeat += dt;
    if (flux > mean + std * 1.6 && flux > 8 && this._sinceBeat > 0.22 && this.bands.bass > 0.15) {
      this.beat = 1;
      this.beatCount++;
      this._sinceBeat = 0;
    } else {
      this.beat *= Math.exp(-dt * 5);
    }

    // Waveform, aligned to a rising zero crossing so it doesn't jitter.
    const td = this._time;
    this.analyser.getFloatTimeDomainData(td);
    let start = 0;
    for (let i = 1; i < td.length / 2; i++) {
      if (td[i - 1] < 0 && td[i] >= 0) { start = i; break; }
    }
    const span = 2048;
    let peak = 0.05;
    for (let i = 0; i < span; i++) peak = Math.max(peak, Math.abs(td[start + i] || 0));
    for (let i = 0; i < S; i++) {
      const v = (td[start + Math.floor((i / S) * span)] || 0) / peak;
      this.waveform[i] += (v - this.waveform[i]) * 0.5;
    }

    this._pack();
  }

  _pack() {
    const p = this.packed;
    for (let i = 0; i < SPECTRUM_SIZE; i++) {
      p[i * 2] = this.spectrum[i];
      p[i * 2 + 1] = this.waveform[i];
    }
  }
}

// A small generative track so the app has something to show without a source.
class DemoSynth {
  constructor(ctx) {
    this.ctx = ctx;
    this.output = ctx.createGain();
    this.output.gain.value = 0.55;
    this.comp = ctx.createDynamicsCompressor();
    this.comp.threshold.value = -14;
    this.comp.ratio.value = 4;
    this.bus = ctx.createGain();
    this.bus.connect(this.comp);
    this.comp.connect(this.output);

    this.verb = ctx.createConvolver();
    this.verb.buffer = this._impulse(2.6);
    const verbGain = ctx.createGain();
    verbGain.gain.value = 0.35;
    this.verb.connect(verbGain);
    verbGain.connect(this.bus);

    this.noise = this._noiseBuffer();
    this.bpm = 118;
    this.step = 0;
    this.nextTime = 0;
    // Am - F - C - G, written as semitone offsets from A2.
    this.chords = [[0, 3, 7, 12], [-4, 0, 3, 8], [3, 7, 10, 15], [-2, 2, 5, 10]];
  }

  _noiseBuffer() {
    const b = this.ctx.createBuffer(1, this.ctx.sampleRate, this.ctx.sampleRate);
    const d = b.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return b;
  }

  _impulse(seconds) {
    const rate = this.ctx.sampleRate;
    const b = this.ctx.createBuffer(2, rate * seconds, rate);
    for (let c = 0; c < 2; c++) {
      const d = b.getChannelData(c);
      for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 3);
    }
    return b;
  }

  start() {
    this.nextTime = this.ctx.currentTime + 0.1;
    this.timer = setInterval(() => this._schedule(), 25);
  }

  stop() {
    clearInterval(this.timer);
    try { this.output.disconnect(); } catch {}
  }

  _schedule() {
    const stepDur = 60 / this.bpm / 4;
    while (this.nextTime < this.ctx.currentTime + 0.12) {
      this._playStep(this.step, this.nextTime, stepDur);
      this.nextTime += stepDur;
      this.step++;
    }
  }

  _playStep(step, t, dur) {
    const s16 = step % 16;
    const bar = Math.floor(step / 16);
    const chord = this.chords[bar % 4];
    const section = Math.floor(bar / 8) % 2; // breakdown every other 8 bars drops the kick

    if (s16 % 4 === 0 && !(section === 1 && bar % 8 < 2)) this._kick(t);
    if (s16 === 4 || s16 === 12) this._snare(t);
    if (s16 % 2 === 1 || (section === 0 && s16 % 4 === 2)) this._hat(t, s16 % 4 === 2 ? 0.05 : 0.11);

    const bassPattern = [0, null, 0, 12, null, 0, null, 7, 0, null, 0, 12, null, 7, 5, null];
    const bn = bassPattern[s16];
    if (bn !== null) this._bass(t, 45 + chord[0] + bn - 12, dur * 1.6);

    if (s16 === 0) this._pad(t, chord.map((n) => 57 + n), dur * 16);

    const arp = [0, 1, 2, 3, 2, 1, 3, 2];
    if (s16 % 2 === 0 && section === 1) this._pluck(t, 69 + chord[arp[(s16 / 2) % 8]], dur * 2);
    if (s16 % 3 === 0 && section === 0 && bar % 2 === 1) this._pluck(t, 81 + chord[(s16 / 3) % 4], dur * 1.5);
  }

  _hz(midi) {
    return 440 * Math.pow(2, (midi - 69) / 12);
  }

  _env(gainNode, t, a, peak, d) {
    const g = gainNode.gain;
    g.setValueAtTime(0.0001, t);
    g.exponentialRampToValueAtTime(peak, t + a);
    g.exponentialRampToValueAtTime(0.0001, t + a + d);
  }

  _kick(t) {
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.frequency.setValueAtTime(150, t);
    o.frequency.exponentialRampToValueAtTime(42, t + 0.12);
    this._env(g, t, 0.002, 1.0, 0.42);
    o.connect(g).connect(this.bus);
    o.start(t);
    o.stop(t + 0.5);
  }

  _snare(t) {
    const n = this.ctx.createBufferSource();
    n.buffer = this.noise;
    const f = this.ctx.createBiquadFilter();
    f.type = 'bandpass';
    f.frequency.value = 1800;
    f.Q.value = 0.7;
    const g = this.ctx.createGain();
    this._env(g, t, 0.001, 0.5, 0.2);
    n.connect(f).connect(g);
    g.connect(this.bus);
    g.connect(this.verb);
    n.start(t);
    n.stop(t + 0.3);
  }

  _hat(t, level) {
    const n = this.ctx.createBufferSource();
    n.buffer = this.noise;
    const f = this.ctx.createBiquadFilter();
    f.type = 'highpass';
    f.frequency.value = 8000;
    const g = this.ctx.createGain();
    this._env(g, t, 0.001, level, 0.05);
    n.connect(f).connect(g).connect(this.bus);
    n.start(t, Math.random() * 0.5);
    n.stop(t + 0.08);
  }

  _bass(t, midi, dur) {
    const o = this.ctx.createOscillator();
    o.type = 'sawtooth';
    o.frequency.value = this._hz(midi);
    const f = this.ctx.createBiquadFilter();
    f.type = 'lowpass';
    f.Q.value = 6;
    f.frequency.setValueAtTime(900, t);
    f.frequency.exponentialRampToValueAtTime(140, t + dur);
    const g = this.ctx.createGain();
    this._env(g, t, 0.005, 0.32, dur);
    o.connect(f).connect(g).connect(this.bus);
    o.start(t);
    o.stop(t + dur + 0.05);
  }

  _pad(t, notes, dur) {
    for (const n of notes) {
      for (const det of [-8, 7]) {
        const o = this.ctx.createOscillator();
        o.type = 'sawtooth';
        o.frequency.value = this._hz(n);
        o.detune.value = det;
        const f = this.ctx.createBiquadFilter();
        f.type = 'lowpass';
        f.frequency.setValueAtTime(400, t);
        f.frequency.linearRampToValueAtTime(2400, t + dur * 0.5);
        f.frequency.linearRampToValueAtTime(500, t + dur);
        const g = this.ctx.createGain();
        g.gain.setValueAtTime(0.0001, t);
        g.gain.linearRampToValueAtTime(0.025, t + dur * 0.3);
        g.gain.linearRampToValueAtTime(0.0001, t + dur);
        o.connect(f).connect(g);
        g.connect(this.bus);
        g.connect(this.verb);
        o.start(t);
        o.stop(t + dur + 0.1);
      }
    }
  }

  _pluck(t, midi, dur) {
    const o = this.ctx.createOscillator();
    o.type = 'square';
    o.frequency.value = this._hz(midi);
    const f = this.ctx.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.setValueAtTime(5000, t);
    f.frequency.exponentialRampToValueAtTime(600, t + dur);
    const g = this.ctx.createGain();
    this._env(g, t, 0.003, 0.08, dur);
    o.connect(f).connect(g);
    g.connect(this.bus);
    g.connect(this.verb);
    o.start(t);
    o.stop(t + dur + 0.05);
  }
}
