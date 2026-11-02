"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/utils/device";

const VERTEX = `#version 300 es
in vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }`;

const FRAGMENT = `#version 300 es
precision highp float;
uniform vec2 size; uniform float time; out vec4 color;
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.-2.*f);
  return mix(mix(hash(i), hash(i+vec2(1,0)), f.x), mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), f.x), f.y); }
float fbm(vec2 p){ float v = 0., a = .5; for(int i = 0; i < 5; i++){ v += a*noise(p); p = p*2.02 + 3.1; a *= .5; } return v; }
void main(){
  vec2 uv = gl_FragCoord.xy / size.y;
  float t = time * .06;
  vec2 q = vec2(fbm(uv*1.6 + t), fbm(uv*1.6 - t + 4.));
  vec2 r = vec2(fbm(uv*1.6 + 3.*q + t*1.5), fbm(uv*1.6 + 3.*q + 7.));
  float f = fbm(uv*1.6 + 3.*r);
  float band = smoothstep(.34, .78, f) * smoothstep(.0, .5, length(r));
  vec3 c = mix(vec3(.012), vec3(.15, .012, .02), band);
  c += vec3(.05, .012, .014) * pow(band, 3.);
  color = vec4(c, 1.);
}`;

/** Domain-warped smoke, drawn at half resolution and only while on screen. */
export function FlowBackground() {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const element = canvas.current;
    const gl = element?.getContext("webgl2", { antialias: false, alpha: false });
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
    const sizeAt = gl.getUniformLocation(program, "size");
    const timeAt = gl.getUniformLocation(program, "time");

    const size = () => {
      element.width = element.clientWidth >> 1;
      element.height = element.clientHeight >> 1;
      gl.viewport(0, 0, element.width, element.height);
      gl.uniform2f(sizeAt, element.width, element.height);
    };
    const draw = (now: number) => {
      gl.uniform1f(timeAt, now / 1000);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    size();
    draw(9000);
    const reduced = prefersReducedMotion();
    let frame = 0;
    const loop = (now: number) => {
      frame = requestAnimationFrame(loop);
      draw(now);
    };
    const io = new IntersectionObserver(([entry]) => {
      cancelAnimationFrame(frame);
      if (entry.isIntersecting && !reduced) frame = requestAnimationFrame(loop);
    });
    io.observe(element);
    const resize = new ResizeObserver(() => {
      size();
      draw(performance.now());
    });
    resize.observe(element);
    return () => {
      cancelAnimationFrame(frame);
      io.disconnect();
      resize.disconnect();
    };
  }, []);

  return <canvas ref={canvas} aria-hidden className="absolute inset-0 h-full w-full" />;
}
