import * as THREE from "three";

export interface HeroPointer {
  x: number;
  y: number;
}

const vertex = /* glsl */ `
attribute vec3 scatter;
attribute vec2 data;
uniform float time;
uniform float progress;
uniform float scroll;
uniform float aspect;
uniform float fit;
uniform float pixel;
uniform vec2 mouse;
uniform vec2 tilt;
varying vec3 vColor;
varying float vAlpha;

void main() {
  float lum = data.x;
  float seed = data.y;
  float t = smoothstep(seed * 0.45, seed * 0.45 + 0.55, progress);
  t = t * t * (3.0 - 2.0 * t);
  vec3 p = mix(scatter, position, t);
  p += vec3(sin(time * 0.9 + seed * 40.0), cos(time * 0.7 + seed * 31.0), sin(time * 0.6 + seed * 17.0)) * 0.0035;

  float cy = cos(tilt.x), sy = sin(tilt.x);
  p.xz = mat2(cy, -sy, sy, cy) * p.xz;
  float cx = cos(tilt.y), sx = sin(tilt.y);
  p.yz = mat2(cx, -sx, sx, cx) * p.yz;

  vec2 d = p.xy - mouse;
  float force = exp(-dot(d, d) / 0.03);
  p.xy += normalize(d + 0.0001) * force * 0.11;
  p.z += force * 0.14;

  p += scatter * scroll * 1.5;

  float persp = 1.0 / max(0.25, 1.0 - p.z * 0.42);
  gl_Position = vec4(p.x / aspect * 2.0 * fit * persp, (p.y - 0.13) * 2.0 * fit * persp, 0.0, 1.0);
  gl_PointSize = (1.7 + lum * 2.4) * pixel * persp;

  vec3 cool = mix(vec3(0.62, 0.68, 0.82), vec3(1.0, 0.99, 0.97), smoothstep(0.15, 0.75, lum));
  vColor = mix(cool, vec3(1.0, 0.42, 0.24), clamp(force * 1.4 + (1.0 - t) * 0.5, 0.0, 1.0));
  vAlpha = (0.72 + lum * 0.28) * (1.0 - scroll * 0.8);
}`;

const fragment = /* glsl */ `
precision highp float;
varying vec3 vColor;
varying float vAlpha;
void main() {
  float d = length(gl_PointCoord - 0.5);
  float a = smoothstep(0.5, 0.2, d) * vAlpha;
  if (a < 0.01) discard;
  gl_FragColor = vec4(vColor * a, a);
}`;

export function canUseWebGL() {
  try {
    return Boolean(document.createElement("canvas").getContext("webgl2"));
  } catch {
    return false;
  }
}

async function pixels(url: string, width: number, height: number) {
  const bitmap = await createImageBitmap(await (await fetch(url)).blob());
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d", { willReadFrequently: true })!;
  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  return context.getImageData(0, 0, width, height).data;
}

/** The portrait as a 3D point cloud: bursts into place, parts around the cursor, blows apart on scroll. */
export async function createHeroScene(canvas: HTMLCanvasElement, pointer: HeroPointer, onReady: () => void, onFail: () => void) {
  const small = window.innerWidth < 768;
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: small ? "low-power" : "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, small ? 1.5 : 2));
  renderer.setClearColor(0x000000, 0);

  const W = small ? 200 : 320;
  const H = Math.round((W * 1280) / 854);
  const [color, depth] = await Promise.all([pixels("/media/hero/subject.webp", W, H), pixels("/media/hero/depth.webp", W, H)]);

  const home: number[] = [];
  const scatter: number[] = [];
  const data: number[] = [];
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4;
      if (color[i + 3] < 128) continue;
      // Lift the shadows so the suit reads as a cloud, not a void.
      const lum = Math.pow(color[i] / 255, 0.55);
      if (Math.random() > 0.34 + lum * 0.66) continue;
      home.push((x / W - 0.5) * (W / H) * 1.34, (0.5 - y / H) * 1.34, (depth[i] / 255 - 0.55) * 0.5);
      const a = Math.random() * 6.28;
      const b = Math.acos(Math.random() * 2 - 1);
      const r = 0.8 + Math.random() * 1.3;
      scatter.push(Math.sin(b) * Math.cos(a) * r * 1.5, Math.sin(b) * Math.sin(a) * r, Math.cos(b) * r);
      data.push(lum, Math.random());
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(home, 3));
  geometry.setAttribute("scatter", new THREE.Float32BufferAttribute(scatter, 3));
  geometry.setAttribute("data", new THREE.Float32BufferAttribute(data, 2));
  const uniforms = {
    time: { value: 0 },
    progress: { value: 0 },
    scroll: { value: 0 },
    aspect: { value: 1 },
    fit: { value: 0.8 },
    pixel: { value: renderer.getPixelRatio() },
    mouse: { value: new THREE.Vector2(9, 9) },
    tilt: { value: new THREE.Vector2() },
  };
  const material = new THREE.ShaderMaterial({ vertexShader: vertex, fragmentShader: fragment, uniforms, transparent: true, depthTest: false, blending: THREE.CustomBlending, blendSrc: THREE.OneFactor, blendDst: THREE.OneMinusSrcAlphaFactor });
  const points = new THREE.Points(geometry, material);
  points.frustumCulled = false;
  const scene = new THREE.Scene();
  scene.add(points);
  const camera = new THREE.Camera();

  const size = () => {
    renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
    uniforms.aspect.value = canvas.clientWidth / Math.max(1, canvas.clientHeight);
    uniforms.fit.value = Math.min(0.8, uniforms.aspect.value * 0.9);
  };
  size();
  const observer = new ResizeObserver(size);
  observer.observe(canvas);

  let visible = true;
  const io = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting));
  io.observe(canvas);

  let frame = 0;
  let last = performance.now();
  let started = 0;
  const onLost = (event: Event) => {
    event.preventDefault();
    onFail();
  };
  canvas.addEventListener("webglcontextlost", onLost);

  const tick = (now: number) => {
    frame = requestAnimationFrame(tick);
    if (!visible || document.hidden) return;
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    uniforms.time.value += dt;
    uniforms.tilt.value.x += (pointer.x * 0.7 - uniforms.tilt.value.x) * 0.06;
    uniforms.tilt.value.y += (pointer.y * 0.35 - uniforms.tilt.value.y) * 0.06;
    const fit = uniforms.fit.value;
    // Stay out of the cloud until a pointer has actually moved.
    if (pointer.x || pointer.y) {
      uniforms.mouse.value.x += (((pointer.x * uniforms.aspect.value) / fit) - uniforms.mouse.value.x) * 0.14;
      uniforms.mouse.value.y += ((-pointer.y / fit + 0.13) - uniforms.mouse.value.y) * 0.14;
    }
    uniforms.scroll.value = Math.min(1, window.scrollY / Math.max(1, canvas.clientHeight));
    if (document.documentElement.dataset.intro === "done") {
      started ||= now;
      uniforms.progress.value = Math.min(1, (now - started) / 2200);
    }
    renderer.render(scene, camera);
  };
  frame = requestAnimationFrame(tick);
  onReady();

  return () => {
    cancelAnimationFrame(frame);
    observer.disconnect();
    io.disconnect();
    canvas.removeEventListener("webglcontextlost", onLost);
    geometry.dispose();
    material.dispose();
    renderer.dispose();
  };
}
