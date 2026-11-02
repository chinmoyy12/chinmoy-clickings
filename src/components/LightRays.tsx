"use client";

import { useEffect, useRef } from "react";
import { devicePower } from "@/utils/device";

const VERTEX = `#version 300 es
in vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }`;

const FRAGMENT = `#version 300 es
precision highp float;
uniform float time;
uniform vec2 size;
uniform vec2 origin;
uniform vec2 mouse;
uniform vec3 tint;
uniform float spread;
uniform float reach;
out vec4 color;

float ray(vec2 coord, vec2 dir, float seedA, float seedB, float speed) {
  vec2 toCoord = coord - origin;
  float angle = dot(normalize(toCoord), dir) + 0.05 * sin(time * 1.5 + length(toCoord) * 0.005);
  float cone = pow(max(angle, 0.0), 1.0 / spread);
  float dist = length(toCoord);
  float far = max(size.x, size.y);
  float fall = clamp((far * reach - dist) / (far * reach), 0.0, 1.0) * clamp((far - dist) / far, 0.0, 1.0);
  float beam = clamp((0.5 + 0.2 * sin(angle * seedA + time * speed)) + (0.3 + 0.2 * cos(-angle * seedB + time * speed * 0.8)), 0.0, 1.0);
  return beam * fall * cone;
}

void main() {
  vec2 coord = gl_FragCoord.xy;
  vec2 dir = normalize(mix(vec2(0.0, -1.0), normalize(mouse * size - origin), 0.3));
  float glow = ray(coord, dir, 45.2, 31.4, 0.8) * 0.4 + ray(coord, dir, 28.5, 19.8, 1.2) * 0.4 + ray(coord, dir, 12.1, 56.2, 0.5) * 0.2;
  glow = pow(glow, 0.7) * 1.25;
  color = vec4(tint * glow, 1.0);
}`;

const rgb = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);

/** Cinematic beams from above. Half resolution, paused off screen, a single still frame on low-power devices. */
export function LightRays({ color = "#ff8a5c", spread = 0.9, reach = 1.7, className = "" }: { color?: string; spread?: number; reach?: number; className?: string }) {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const element = canvas.current;
    const gl = element?.getContext("webgl2", { antialias: false, alpha: false, powerPreference: "low-power" });
    if (!element || !gl) return;
    const compile = (type: number, source: string) => {
      const shader = gl.createShader(type)!;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      return shader;
    };
    const program = gl.createProgram()!;
    gl.attachShader(program, compile(gl.VERTEX_SHADER, VERTEX));
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAGMENT));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    const at = (name: string) => gl.getUniformLocation(program, name);
    gl.uniform3fv(at("tint"), rgb(color));
    gl.uniform1f(at("spread"), spread);
    gl.uniform1f(at("reach"), reach);

    const power = devicePower();
    const scale = power === "high" ? 0.5 : 0.34;
    const pointer = { x: 0.5, y: 0.5 };
    const eased = { x: 0.5, y: 0.5 };

    const size = () => {
      element.width = Math.max(2, Math.round(element.clientWidth * scale));
      element.height = Math.max(2, Math.round(element.clientHeight * scale));
      gl.viewport(0, 0, element.width, element.height);
      gl.uniform2f(at("size"), element.width, element.height);
      gl.uniform2f(at("origin"), element.width / 2, element.height * 1.2);
    };
    const draw = (now: number) => {
      eased.x += (pointer.x - eased.x) * 0.05;
      eased.y += (pointer.y - eased.y) * 0.05;
      gl.uniform1f(at("time"), now / 1000);
      gl.uniform2f(at("mouse"), eased.x, 1 - eased.y);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    size();
    draw(4000);

    let frame = 0;
    const loop = (now: number) => {
      frame = requestAnimationFrame(loop);
      draw(now);
    };
    const io = new IntersectionObserver(([entry]) => {
      cancelAnimationFrame(frame);
      if (entry.isIntersecting && power !== "low") frame = requestAnimationFrame(loop);
    });
    io.observe(element);
    const resize = new ResizeObserver(() => {
      size();
      draw(performance.now());
    });
    resize.observe(element);
    const onPointer = (event: PointerEvent) => {
      const box = element.getBoundingClientRect();
      pointer.x = (event.clientX - box.left) / box.width;
      pointer.y = (event.clientY - box.top) / box.height;
    };
    if (power === "high") window.addEventListener("pointermove", onPointer, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      io.disconnect();
      resize.disconnect();
      window.removeEventListener("pointermove", onPointer);
    };
  }, [color, spread, reach]);

  return <canvas ref={canvas} aria-hidden className={`pointer-events-none absolute inset-0 h-full w-full ${className}`} />;
}
