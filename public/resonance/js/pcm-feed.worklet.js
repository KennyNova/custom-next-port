// Plays mono PCM pushed from the main thread (native loopback capture) into the
// audio graph. Resamples linearly when the capture rate differs from the
// context's, and drops backlog so the visuals stay within ~40 ms of the audio.

class PcmFeed extends AudioWorkletProcessor {
  constructor() {
    super();
    this.buf = new Float32Array(sampleRate); // 1 s ring
    this.write = 0;
    this.read = 0; // fractional read head, in input samples
    this.step = 1;
    this.port.onmessage = (e) => {
      const d = e.data;
      if (d.rate) { this.step = d.rate / sampleRate; return; }
      const n = this.buf.length;
      for (let i = 0; i < d.length; i++) this.buf[(this.write + i) % n] = d[i];
      this.write += d.length;
    };
  }

  process(_inputs, outputs) {
    const out = outputs[0][0];
    const n = this.buf.length;
    const target = sampleRate * 0.03 * this.step;
    if (this.write - this.read > sampleRate * 0.1 * this.step) this.read = this.write - target;
    for (let i = 0; i < out.length; i++) {
      if (this.read + 1 >= this.write) { out[i] = 0; continue; }
      const j = Math.floor(this.read);
      const t = this.read - j;
      out[i] = this.buf[j % n] * (1 - t) + this.buf[(j + 1) % n] * t;
      this.read += this.step;
    }
    return true;
  }
}

registerProcessor('pcm-feed', PcmFeed);
