"use client";

import { useEffect, useRef, useState } from "react";
import { devicePower, prefersReducedMotion } from "@/utils/device";

const CELLS = 34;

const VERTEX = `attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }`;

// Shared preamble: hashed value noise, a six-octave fbm and a two-level domain warp.
const PREAMBLE = `
precision highp float;
float hash(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  mat2 r = mat2(0.8, -0.6, 0.6, 0.8);
  for (int i = 0; i < 6; i++) { v += a * noise(p); p = r * p * 2.02 + 7.3; a *= 0.5; }
  return v;
}
float warp(vec2 p, float t) {
  vec2 q = vec2(fbm(p + vec2(0.0, t)), fbm(p + vec2(5.2, 1.3 - t)));
  vec2 r = vec2(fbm(p + 3.0 * q + vec2(1.7, 9.2) + t * 0.6), fbm(p + 3.0 * q + vec2(8.3, 2.8) - t * 0.4));
  return fbm(p + 3.0 * r);
}
`;

// Pass one runs once per lattice cell: one fragment is one cell, sampled at its centre.
const FIELD = `${PREAMBLE}
uniform float time;
uniform vec2 pointer;
uniform float intensity;
void main() {
  vec2 uv = gl_FragCoord.xy / ${CELLS.toFixed(1)};
  float near = (1.0 - smoothstep(0.0, 0.32, distance(uv, pointer))) * intensity;
  float field = clamp(warp(uv * 2.4, time * 0.06) * 1.25 - 0.18 + near * 0.55, 0.0, 1.0);
  gl_FragColor = vec4(field, near, 0.0, 1.0);
}`;

// Pass two draws every pixel: the cell's stored value sets the dot radius for the whole cell.
const DOTS = `
precision highp float;
uniform sampler2D cellsField;
uniform vec2 size;
uniform vec2 grid;
uniform vec3 ground;
uniform vec3 ink;
uniform vec3 shade;
void main() {
  float cell = size.x / ${CELLS.toFixed(1)};
  vec2 id = floor(gl_FragCoord.xy / cell);
  vec4 value = texture2D(cellsField, (id + 0.5) / grid);
  float radius = value.r * cell * 0.42;
  float d = distance(gl_FragCoord.xy, (id + 0.5) * cell);
  float dot = 1.0 - smoothstep(radius - 1.2, radius + 0.6, d);
  // Quiet at rest; the pointer brings the light up to full.
  float light = mix(0.38, 1.0, value.g);
  gl_FragColor = vec4(mix(ground, mix(shade, ink, smoothstep(0.15, 0.85, value.r)), dot * light), 1.0);
}`;

const rgb = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);

/** A halftone of drifting light: dots grow with a warped noise field and swell under the pointer. */
export function Halftone({ className = "" }: { className?: string }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const element = canvas.current;
    if (!element) return;
    const gl = element.getContext("webgl", { antialias: false, alpha: false, powerPreference: "low-power" });
    if (!gl) return setFailed(true);

    const build = (fragment: string) => {
      const program = gl.createProgram()!;
      for (const [type, source] of [
        [gl.VERTEX_SHADER, VERTEX],
        [gl.FRAGMENT_SHADER, fragment],
      ] as const) {
        const shader = gl.createShader(type)!;
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        gl.attachShader(program, shader);
      }
      gl.bindAttribLocation(program, 0, "p");
      gl.linkProgram(program);
      return gl.getProgramParameter(program, gl.LINK_STATUS) ? program : null;
    };
    const fieldProgram = build(FIELD);
    const dotsProgram = build(DOTS);
    if (!fieldProgram || !dotsProgram) return setFailed(true);

    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    // The per-cell field lives in a texture no bigger than the lattice.
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    for (const [key, value] of [
      [gl.TEXTURE_MIN_FILTER, gl.NEAREST],
      [gl.TEXTURE_MAG_FILTER, gl.NEAREST],
      [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE],
      [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE],
    ] as const)
      gl.texParameteri(gl.TEXTURE_2D, key, value);
    const buffer = gl.createFramebuffer();

    const field = (name: string) => gl.getUniformLocation(fieldProgram, name);
    const dots = (name: string) => gl.getUniformLocation(dotsProgram, name);
    gl.useProgram(dotsProgram);
    gl.uniform3fv(dots("ground"), rgb("#08090D"));
    gl.uniform3fv(dots("ink"), rgb("#DBE0EB"));
    gl.uniform3fv(dots("shade"), rgb("#2a2d36"));
    gl.uniform1i(dots("cellsField"), 0);

    const still = prefersReducedMotion();
    const power = devicePower();
    const scale = Math.min(window.devicePixelRatio, power === "high" ? 1.5 : 1);
    const pointer = { x: -9, y: -9, target: 0, value: 0 };
    let rows = 1;

    const size = () => {
      element.width = Math.max(2, Math.round(element.clientWidth * scale));
      element.height = Math.max(2, Math.round(element.clientHeight * scale));
      rows = Math.ceil(element.height / (element.width / CELLS));
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, CELLS, rows, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      gl.bindFramebuffer(gl.FRAMEBUFFER, buffer);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
      gl.useProgram(dotsProgram);
      gl.uniform2f(dots("size"), element.width, element.height);
      gl.uniform2f(dots("grid"), CELLS, rows);
    };
    const draw = (now: number) => {
      pointer.value += (pointer.target - pointer.value) * 0.06;
      gl.bindFramebuffer(gl.FRAMEBUFFER, buffer);
      gl.viewport(0, 0, CELLS, rows);
      gl.useProgram(fieldProgram);
      gl.uniform1f(field("time"), now / 1000);
      gl.uniform2f(field("pointer"), pointer.x, pointer.y);
      gl.uniform1f(field("intensity"), pointer.value);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, element.width, element.height);
      gl.useProgram(dotsProgram);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    size();
    draw(12000);

    // About 30 frames a second is plenty for a field this slow.
    let frame = 0;
    let last = 0;
    const loop = (now: number) => {
      frame = requestAnimationFrame(loop);
      if (document.documentElement.dataset.intro !== "done" || now - last < 32) return;
      last = now;
      draw(now);
    };
    const io = new IntersectionObserver(([entry]) => {
      cancelAnimationFrame(frame);
      if (entry.isIntersecting && !still) frame = requestAnimationFrame(loop);
    });
    io.observe(element);
    const resize = new ResizeObserver(() => {
      size();
      draw(performance.now());
    });
    resize.observe(element);

    // The effect strengthens under the pointer and relaxes when it leaves.
    const host = element.closest("section") ?? element.parentElement!;
    const onMove = (event: PointerEvent) => {
      const box = element.getBoundingClientRect();
      // In lattice units: the width spans 0 to 1.
      pointer.x = (event.clientX - box.left) / box.width;
      pointer.y = (box.bottom - event.clientY) / box.width;
      pointer.target = 1;
      if (still) draw(performance.now());
    };
    const onLeave = () => {
      pointer.target = 0;
    };
    host.addEventListener("pointermove", onMove, { passive: true });
    host.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(frame);
      io.disconnect();
      resize.disconnect();
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerleave", onLeave);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, []);

  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden bg-[#08090D] ${className}`} aria-hidden>
      {failed ? <div className="halftone-fallback absolute inset-0" /> : <canvas ref={canvas} className="absolute inset-0 h-full w-full" />}
    </div>
  );
}
