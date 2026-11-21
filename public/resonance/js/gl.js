// Thin WebGL2 layer: programs with typed uniform setters, render targets,
// ping-pong pairs and a fullscreen triangle.

import { COMMON } from './shaders/common.js';

export const FULLSCREEN_VS = `#version 300 es
out vec2 vUv;
void main() {
  vec2 p = vec2((gl_VertexID << 1) & 2, gl_VertexID & 2);
  vUv = p;
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`;

export class Core {
  constructor(canvas) {
    const gl = canvas.getContext('webgl2', {
      antialias: false,
      alpha: false,
      depth: false,
      stencil: false,
      premultipliedAlpha: false,
      preserveDrawingBuffer: false,
      powerPreference: 'high-performance',
    });
    if (!gl) throw new Error('WebGL2 is not available on this machine.');
    this.gl = gl;
    this.canvas = canvas;
    this.floatRender = !!gl.getExtension('EXT_color_buffer_float');
    this.floatLinear = !!gl.getExtension('OES_texture_float_linear');
    gl.getExtension('EXT_float_blend');
    if (!this.floatRender) throw new Error('This GPU cannot render to float textures (EXT_color_buffer_float).');
    this.vao = gl.createVertexArray();
    this.programs = new Map();
    this.shared = {}; // uniforms every program gets (audio, palette, time)
  }

  program(fs, vs = FULLSCREEN_VS) {
    const key = vs + '\u0000' + fs;
    let p = this.programs.get(key);
    if (!p) {
      p = new Program(this.gl, vs.replace('#include common', COMMON), fs.replace('#include common', COMMON));
      this.programs.set(key, p);
    }
    return p;
  }

  target(w, h, opts = {}) {
    return new Target(this, w, h, opts);
  }

  pingpong(w, h, opts = {}) {
    return new PingPong(this, w, h, opts);
  }

  // Draw a fullscreen pass into `dst` (Target, or null for the canvas).
  pass(prog, uniforms, dst, { blend = null, clear = false } = {}) {
    const gl = this.gl;
    if (dst) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, dst.fbo);
      gl.viewport(0, 0, dst.w, dst.h);
    } else {
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    }
    if (clear) {
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
    }
    this._blend(blend);
    prog.use(this.shared, uniforms);
    gl.bindVertexArray(this.vao);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  // Draw `count` points with a custom vertex shader (positions come from textures).
  points(prog, uniforms, count, dst, { blend = 'add', clear = false } = {}) {
    const gl = this.gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, dst ? dst.fbo : null);
    gl.viewport(0, 0, dst ? dst.w : this.canvas.width, dst ? dst.h : this.canvas.height);
    if (clear) {
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
    }
    this._blend(blend);
    prog.use(this.shared, uniforms);
    gl.bindVertexArray(this.vao);
    gl.drawArrays(gl.POINTS, 0, count);
  }

  _blend(mode) {
    const gl = this.gl;
    if (!mode) {
      gl.disable(gl.BLEND);
      return;
    }
    gl.enable(gl.BLEND);
    if (mode === 'add') gl.blendFunc(gl.ONE, gl.ONE);
    else if (mode === 'alpha') gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    else if (mode === 'premult') gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  }

  texture1D(width, internal = 'RG16F') {
    return new DataTexture(this, width, 1, internal);
  }
}

const FORMATS = {
  RGBA8: ['RGBA8', 'RGBA', 'UNSIGNED_BYTE'],
  RGBA16F: ['RGBA16F', 'RGBA', 'HALF_FLOAT'],
  RGBA32F: ['RGBA32F', 'RGBA', 'FLOAT'],
  RG16F: ['RG16F', 'RG', 'HALF_FLOAT'],
  RG32F: ['RG32F', 'RG', 'FLOAT'],
  R16F: ['R16F', 'RED', 'HALF_FLOAT'],
  R32F: ['R32F', 'RED', 'FLOAT'],
};

function makeTexture(core, w, h, format, filter, wrap) {
  const gl = core.gl;
  const [internal, fmt, type] = FORMATS[format];
  let f = filter === 'nearest' ? gl.NEAREST : gl.LINEAR;
  if (type === 'FLOAT' && !core.floatLinear) f = gl.NEAREST;
  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, f);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, f);
  const wr = wrap === 'repeat' ? gl.REPEAT : gl.CLAMP_TO_EDGE;
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wr);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wr);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl[internal], w, h, 0, gl[fmt], gl[type], null);
  return tex;
}

export class Target {
  constructor(core, w, h, { format = 'RGBA16F', filter = 'linear', wrap = 'clamp' } = {}) {
    const gl = core.gl;
    this.core = core;
    this.w = Math.max(1, Math.floor(w));
    this.h = Math.max(1, Math.floor(h));
    this.format = format;
    this.tex = makeTexture(core, this.w, this.h, format, filter, wrap);
    this.fbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.tex, 0);
    const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    if (status !== gl.FRAMEBUFFER_COMPLETE) throw new Error(`Framebuffer incomplete (${format}): ${status}`);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
  }

  get texel() {
    return [1 / this.w, 1 / this.h];
  }

  dispose() {
    const gl = this.core.gl;
    gl.deleteTexture(this.tex);
    gl.deleteFramebuffer(this.fbo);
  }
}

export class PingPong {
  constructor(core, w, h, opts) {
    this.read = new Target(core, w, h, opts);
    this.write = new Target(core, w, h, opts);
  }
  get w() { return this.read.w; }
  get h() { return this.read.h; }
  get texel() { return this.read.texel; }
  swap() {
    const t = this.read;
    this.read = this.write;
    this.write = t;
  }
  dispose() {
    this.read.dispose();
    this.write.dispose();
  }
}

// CPU-updated texture (spectrum, palette ramp, history ring buffer).
export class DataTexture {
  constructor(core, w, h, format = 'RG16F', wrap = 'clamp') {
    this.core = core;
    this.w = w;
    this.h = h;
    this.format = format;
    this.tex = makeTexture(core, w, h, format, 'linear', wrap);
  }

  upload(data, row = 0, rows = this.h) {
    const gl = this.core.gl;
    const [, fmt] = FORMATS[this.format];
    gl.bindTexture(gl.TEXTURE_2D, this.tex);
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
    const type = data instanceof Uint8Array ? gl.UNSIGNED_BYTE : gl.FLOAT;
    gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, row, this.w, rows, gl[fmt], type, data);
  }

  dispose() {
    this.core.gl.deleteTexture(this.tex);
  }
}

class Program {
  constructor(gl, vsSrc, fsSrc) {
    this.gl = gl;
    const vs = compile(gl, gl.VERTEX_SHADER, vsSrc);
    const fs = compile(gl, gl.FRAGMENT_SHADER, fsSrc);
    const p = gl.createProgram();
    gl.attachShader(p, vs);
    gl.attachShader(p, fs);
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error('Link failed: ' + gl.getProgramInfoLog(p));
    this.p = p;
    this.uniforms = {};
    const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < n; i++) {
      const info = gl.getActiveUniform(p, i);
      const name = info.name.replace(/\[0\]$/, '');
      this.uniforms[name] = { loc: gl.getUniformLocation(p, info.name), type: info.type, size: info.size };
    }
  }

  use(shared, uniforms) {
    const gl = this.gl;
    gl.useProgram(this.p);
    this._unit = 0;
    for (const k in shared) if (!(k in uniforms)) this._set(k, shared[k]);
    for (const k in uniforms) this._set(k, uniforms[k]);
  }

  _set(name, v) {
    const u = this.uniforms[name];
    if (!u || v === undefined) return;
    const gl = this.gl;
    switch (u.type) {
      case gl.FLOAT: u.size > 1 ? gl.uniform1fv(u.loc, v) : gl.uniform1f(u.loc, v); break;
      case gl.FLOAT_VEC2: gl.uniform2fv(u.loc, v); break;
      case gl.FLOAT_VEC3: gl.uniform3fv(u.loc, v); break;
      case gl.FLOAT_VEC4: gl.uniform4fv(u.loc, v); break;
      case gl.INT:
      case gl.BOOL: gl.uniform1i(u.loc, v); break;
      case gl.SAMPLER_2D: {
        const tex = v.tex || v.read?.tex || v;
        gl.activeTexture(gl.TEXTURE0 + this._unit);
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.uniform1i(u.loc, this._unit);
        this._unit++;
        break;
      }
      case gl.FLOAT_MAT2: gl.uniformMatrix2fv(u.loc, false, v); break;
      default: break;
    }
  }
}

function compile(gl, type, src) {
  const s = gl.createShader(type);
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(s);
    const lines = src.split('\n').map((l, i) => `${String(i + 1).padStart(4)} ${l}`).join('\n');
    console.error(log + '\n' + lines);
    throw new Error('Shader compile failed: ' + log);
  }
  return s;
}
