import * as THREE from "three";

export interface HeroPointer {
  x: number;
  y: number;
  /** Bumped by a click; the head spins once for each. */
  spins: number;
}

const WIDTH = 1274 / 1234;

// Shared by the mesh and the particles so both share one 3D space.
const place = /* glsl */ `
uniform float time;
uniform float scroll;
uniform float aspect;
uniform float fit;
uniform float spin;
uniform vec2 mouse;
uniform vec2 tilt;
varying float vForce;

vec4 place(vec3 p, out float persp) {
  float cy = cos(tilt.x + spin), sy = sin(tilt.x + spin);
  p.xz = mat2(cy, -sy, sy, cy) * p.xz;
  float cx = cos(tilt.y), sx = sin(tilt.y);
  p.yz = mat2(cx, -sx, sx, cx) * p.yz;
  p.y += sin(time * 0.8) * 0.012;

  vec2 d = p.xy - mouse;
  vForce = exp(-dot(d, d) / 0.022);
  p.z += vForce * 0.1;

  persp = 1.0 / max(0.25, 1.0 - p.z * 0.5);
  return vec4(p.x / aspect * 2.0 * fit * persp, (p.y + 0.07) * 2.0 * fit * persp, 0.0, 1.0);
}`;

const pointsVertex = /* glsl */ `
attribute vec3 scatter;
attribute vec3 tint;
attribute float seed;
uniform float progress;
uniform float pixel;
varying vec3 vColor;
varying float vAlpha;
${place}

void main() {
  float t = smoothstep(seed * 0.45, seed * 0.45 + 0.55, progress);
  t = t * t * (3.0 - 2.0 * t);
  vec3 p = mix(scatter, position, t);
  p += vec3(sin(time * 0.9 + seed * 40.0), cos(time * 0.7 + seed * 31.0), sin(time * 0.6 + seed * 17.0)) * 0.003;
  p += scatter * scroll * 1.5;

  vec2 d = p.xy - mouse;
  p.xy += normalize(d + 0.0001) * exp(-dot(d, d) / 0.03) * 0.13;

  float persp;
  gl_Position = place(p, persp);
  gl_PointSize = 2.2 * pixel * persp;
  vColor = mix(tint, vec3(1.0, 0.42, 0.24), clamp(vForce * 0.9 + (1.0 - t) * 0.6, 0.0, 1.0));
  vAlpha = (1.0 - scroll * 0.8);
}`;

const pointsFragment = /* glsl */ `
precision highp float;
varying vec3 vColor;
varying float vAlpha;
void main() {
  float a = smoothstep(0.5, 0.2, length(gl_PointCoord - 0.5)) * vAlpha;
  if (a < 0.01) discard;
  gl_FragColor = vec4(vColor * a, a);
}`;

const meshVertex = /* glsl */ `
uniform sampler2D depth;
varying vec2 vUv;
${place}

void main() {
  vUv = uv;
  float d = texture2D(depth, uv).r;
  float persp;
  gl_Position = place(vec3(position.xy, (d - 0.55) * 0.5), persp);
}`;

const meshFragment = /* glsl */ `
precision highp float;
uniform sampler2D map;
uniform float reveal;
uniform float blink;
uniform float scroll;
uniform vec2 gaze;
varying vec2 vUv;
varying float vForce;

// Eye openings, measured on the artwork.
const vec2 EYE_A = vec2(0.402, 0.455);
const vec2 EYE_B = vec2(0.626, 0.455);
const vec2 EYE_SIZE = vec2(0.064, 0.034);

float eye(vec2 uv, vec2 c) {
  return 1.0 - smoothstep(0.7, 1.0, length((uv - c) / EYE_SIZE));
}

void main() {
  float mask = max(eye(vUv, EYE_A), eye(vUv, EYE_B));
  vec4 tex = texture2D(map, vUv - gaze * vec2(0.017, 0.009) * mask);
  vec3 color = mix(tex.rgb, vec3(0.86, 0.66, 0.5), mask * blink);
  // The cursor melts the surface away, showing the particles beneath.
  float a = tex.a * reveal * (1.0 - smoothstep(0.35, 0.95, vForce)) * (1.0 - smoothstep(0.0, 0.42, scroll));
  if (a < 0.01) discard;
  gl_FragColor = vec4(color * a, a);
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

/** The avatar as a real 3D mesh over a particle twin: it forms, watches the cursor, blinks and blows apart on scroll. */
export async function createHeroScene(canvas: HTMLCanvasElement, pointer: HeroPointer, onReady: () => void, onFail: () => void) {
  const small = window.innerWidth < 768;
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: !small, powerPreference: small ? "low-power" : "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, small ? 1.5 : 1.75));
  renderer.setClearColor(0x000000, 0);

  const W = small ? 150 : 230;
  const H = Math.round(W / WIDTH);
  const [color, depthData] = await Promise.all([pixels("/media/hero/avatar.webp", W, H), pixels("/media/hero/avatar-depth.webp", W, H)]);

  const home: number[] = [];
  const scatter: number[] = [];
  const tint: number[] = [];
  const seeds: number[] = [];
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4;
      if (color[i + 3] < 128) continue;
      home.push((x / W - 0.5) * WIDTH, 0.5 - y / H, (depthData[i] / 255 - 0.55) * 0.5);
      const a = Math.random() * 6.28;
      const b = Math.acos(Math.random() * 2 - 1);
      const r = 0.8 + Math.random() * 1.3;
      scatter.push(Math.sin(b) * Math.cos(a) * r * 1.5, Math.sin(b) * Math.sin(a) * r, Math.cos(b) * r);
      tint.push(color[i] / 255, color[i + 1] / 255, color[i + 2] / 255);
      seeds.push(Math.random());
    }
  }

  const uniforms = {
    time: { value: 0 },
    progress: { value: 0 },
    reveal: { value: 0 },
    scroll: { value: 0 },
    aspect: { value: 1 },
    fit: { value: 0.7 },
    spin: { value: 0 },
    blink: { value: 0 },
    pixel: { value: renderer.getPixelRatio() },
    mouse: { value: new THREE.Vector2(9, 9) },
    tilt: { value: new THREE.Vector2() },
    gaze: { value: new THREE.Vector2() },
    map: { value: null as THREE.Texture | null },
    depth: { value: null as THREE.Texture | null },
  };
  const loader = new THREE.TextureLoader();
  const [map, depth] = await Promise.all([loader.loadAsync("/media/hero/avatar.webp"), loader.loadAsync("/media/hero/avatar-depth.webp")]);
  map.colorSpace = THREE.NoColorSpace;
  uniforms.map.value = map;
  uniforms.depth.value = depth;

  const blend = { transparent: true, depthTest: false, blending: THREE.CustomBlending, blendSrc: THREE.OneFactor, blendDst: THREE.OneMinusSrcAlphaFactor } as const;

  const pointGeometry = new THREE.BufferGeometry();
  pointGeometry.setAttribute("position", new THREE.Float32BufferAttribute(home, 3));
  pointGeometry.setAttribute("scatter", new THREE.Float32BufferAttribute(scatter, 3));
  pointGeometry.setAttribute("tint", new THREE.Float32BufferAttribute(tint, 3));
  pointGeometry.setAttribute("seed", new THREE.Float32BufferAttribute(seeds, 1));
  const pointMaterial = new THREE.ShaderMaterial({ vertexShader: pointsVertex, fragmentShader: pointsFragment, uniforms, ...blend });
  const points = new THREE.Points(pointGeometry, pointMaterial);
  points.frustumCulled = false;

  const meshGeometry = new THREE.PlaneGeometry(WIDTH, 1, small ? 64 : 128, small ? 64 : 128);
  const meshMaterial = new THREE.ShaderMaterial({ vertexShader: meshVertex, fragmentShader: meshFragment, uniforms, side: THREE.DoubleSide, ...blend });
  const mesh = new THREE.Mesh(meshGeometry, meshMaterial);
  mesh.frustumCulled = false;

  const scene = new THREE.Scene();
  scene.add(points, mesh);
  const camera = new THREE.Camera();

  const size = () => {
    renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
    uniforms.aspect.value = canvas.clientWidth / Math.max(1, canvas.clientHeight);
    uniforms.fit.value = Math.min(0.68, uniforms.aspect.value * 0.8);
  };
  size();
  // Compile and upload now, not on the first frame anyone can see.
  renderer.compile(scene, camera);
  renderer.render(scene, camera);
  const observer = new ResizeObserver(size);
  observer.observe(canvas);

  let visible = true;
  const io = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting));
  io.observe(canvas);

  let frame = 0;
  let last = performance.now();
  let started = 0;
  let nextBlink = 3;
  let spinTarget = 0;
  let frames = 0;
  let slowFrames = 0;
  const onLost = (event: Event) => {
    event.preventDefault();
    onFail();
  };
  canvas.addEventListener("webglcontextlost", onLost);

  const tick = (now: number) => {
    frame = requestAnimationFrame(tick);
    const raw = now - last;
    last = now;
    if (!visible || document.hidden || document.documentElement.dataset.intro !== "done") return;
    const dt = Math.min(0.05, raw / 1000);
    frames += 1;
    if (raw > 28) slowFrames += 1;
    if (frames === 90) {
      if (slowFrames > 45 && renderer.getPixelRatio() > 1) {
        renderer.setPixelRatio(1);
        uniforms.pixel.value = 1;
        size();
      }
      frames = slowFrames = 0;
    }
    const time = (uniforms.time.value += dt);
    uniforms.tilt.value.x += (pointer.x * 0.85 - uniforms.tilt.value.x) * 0.07;
    uniforms.tilt.value.y += (pointer.y * 0.5 - uniforms.tilt.value.y) * 0.07;
    uniforms.gaze.value.x += (pointer.x * 2 - uniforms.gaze.value.x) * 0.18;
    uniforms.gaze.value.y += (pointer.y * 2 - uniforms.gaze.value.y) * 0.18;
    spinTarget = pointer.spins * Math.PI * 2;
    uniforms.spin.value += (spinTarget - uniforms.spin.value) * 0.075;
    if (time > nextBlink) nextBlink = time + 2.6 + Math.random() * 3;
    const sinceBlink = nextBlink - time;
    uniforms.blink.value = sinceBlink < 0.14 ? Math.sin((sinceBlink / 0.14) * Math.PI) : 0;

    const fit = uniforms.fit.value;
    if (pointer.x || pointer.y) {
      uniforms.mouse.value.x += ((pointer.x * uniforms.aspect.value) / fit - uniforms.mouse.value.x) * 0.18;
      uniforms.mouse.value.y += (-pointer.y / fit - 0.07 - uniforms.mouse.value.y) * 0.18;
    }
    uniforms.scroll.value = Math.min(1, window.scrollY / Math.max(1, canvas.clientHeight));
    started ||= now;
    const elapsed = (now - started) / 2200;
    uniforms.progress.value = Math.min(1, elapsed);
    uniforms.reveal.value = Math.min(1, Math.max(0, (elapsed - 0.8) / 0.4));
    renderer.render(scene, camera);
  };
  frame = requestAnimationFrame(tick);
  onReady();

  return () => {
    cancelAnimationFrame(frame);
    observer.disconnect();
    io.disconnect();
    canvas.removeEventListener("webglcontextlost", onLost);
    pointGeometry.dispose();
    pointMaterial.dispose();
    meshGeometry.dispose();
    meshMaterial.dispose();
    map.dispose();
    depth.dispose();
    renderer.dispose();
  };
}
