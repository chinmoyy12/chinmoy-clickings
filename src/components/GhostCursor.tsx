"use client";

import { useEffect, useRef } from "react";

const POINTS = 10;

const VERTEX = `#version 300 es
in vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }`;

// One noise field shared by the whole trail keeps this far lighter than a blob per point.
const FRAGMENT = `#version 300 es
precision highp float;
uniform vec2 size;
uniform float time;
uniform float fade;
uniform vec2 trail[${POINTS}];
out vec4 color;
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.-2.*f);
  return mix(mix(hash(i), hash(i+vec2(1,0)), f.x), mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), f.x), f.y); }
float fbm(vec2 p){ float v = 0., a = .5; for(int i = 0; i < 4; i++){ v += a*noise(p); p = p*2.03 + 7.1; a *= .5; } return v; }
void main(){
  float ratio = size.x / size.y;
  vec2 uv = gl_FragCoord.xy / size;
  vec2 st = uv * vec2(ratio, 1.0);
  float field = 0.0;
  for (int i = 0; i < ${POINTS}; i++) {
    vec2 d = st - trail[i] * vec2(ratio, 1.0);
    float k = 1.0 - float(i) / float(${POINTS});
    field += k * exp(-dot(d, d) / (0.012 + float(i) * 0.0016));
  }
  float smoke = fbm(st * 4.0 + vec2(fbm(st * 3.0 + time * 0.14), time * 0.1));
  float a = clamp(field * smoke * smoke * 2.2, 0.0, 1.0) * fade;
  color = vec4(mix(vec3(1.0, 0.36, 0.18), vec3(1.0, 0.78, 0.62), smoke) * a, 1.0);
}`;

/** Warm smoke behind the cursor. Low resolution, and it stops drawing entirely when the mouse rests. */
export function GhostCursor() {
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
    const trailAt = at("trail");
    const sizeAt = at("size");
    const timeAt = at("time");
    const fadeAt = at("fade");

    const trail = new Float32Array(POINTS * 2);
    const head = { x: 0.5, y: 0.5 };
    let frame = 0;
    let running = false;
    let moved = 0;
    let fade = 0;
    let last = 0;
    let slow = 0;

    const size = () => {
      element.width = Math.round(window.innerWidth * 0.3);
      element.height = Math.round(window.innerHeight * 0.3);
      gl.viewport(0, 0, element.width, element.height);
      gl.uniform2f(sizeAt, element.width, element.height);
    };

    const draw = (now: number) => {
      slow = last && now - last > 48 ? slow + 1 : Math.max(0, slow - 1);
      last = now;
      if (slow > 40) {
        // A struggling GPU loses the smoke, never the page.
        stop();
        element.style.display = "none";
        return;
      }
      const idle = now - moved;
      fade += ((idle < 500 ? 1 : 0) - fade) * 0.07;
      trail[0] += (head.x - trail[0]) * 0.5;
      trail[1] += (head.y - trail[1]) * 0.5;
      for (let i = 2; i < POINTS * 2; i += 2) {
        trail[i] += (trail[i - 2] - trail[i]) * 0.42;
        trail[i + 1] += (trail[i - 1] - trail[i + 1]) * 0.42;
      }
      gl.uniform2fv(trailAt, trail);
      gl.uniform1f(timeAt, now / 1000);
      gl.uniform1f(fadeAt, fade);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      if (idle > 500 && fade < 0.01) {
        running = false;
        last = 0;
        return;
      }
      frame = requestAnimationFrame(draw);
    };

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      head.x = event.clientX / window.innerWidth;
      head.y = 1 - event.clientY / window.innerHeight;
      moved = performance.now();
      if (!running) {
        running = true;
        frame = requestAnimationFrame(draw);
      }
    };
    const stop = () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("resize", size);
    };

    size();
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("resize", size);
    return stop;
  }, []);

  return <canvas ref={canvas} data-ghost aria-hidden className="pointer-events-none fixed inset-0 z-[115] h-full w-full mix-blend-screen" />;
}
