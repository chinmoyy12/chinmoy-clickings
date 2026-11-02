import * as THREE from "three";

export interface HeroPointer {
  x: number;
  y: number;
}

const vertex = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}`;

const fragment = /* glsl */ `
precision highp float;
uniform sampler2D map;
uniform sampler2D depth;
uniform vec2 pointer;
uniform vec2 spot;
uniform float time;
uniform float reveal;
uniform float strength;
varying vec2 vUv;

void main() {
  float breath = sin(time * 0.7) * 0.0025;
  float d = texture2D(depth, vUv, 2.0).r;
  vec2 shift = (pointer * strength + vec2(breath, breath * 0.6)) * (d - 0.35);
  vec2 uv = vUv + shift;
  vec4 tex = texture2D(map, uv);
  if (tex.a < 0.004) discard;

  // Rim light: alpha falls away on the side facing the light.
  vec2 lightDir = normalize(spot - uv + 0.0001);
  float occluded = texture2D(map, uv + lightDir * 0.012).a;
  float rim = tex.a * (1.0 - occluded);
  float wide = tex.a * (1.0 - texture2D(map, uv + lightDir * 0.04).a);

  float dist = distance(uv * vec2(0.667, 1.0), spot * vec2(0.667, 1.0));
  float glow = exp(-dist * dist * 9.0);
  float luma = tex.r;

  vec3 red = vec3(0.91, 0.15, 0.18);
  vec3 color = vec3(luma);
  color += red * luma * glow * 1.1;
  color += red * (rim * (1.1 + glow * 2.0) + wide * 0.28);

  // Intro light sweep travels up the figure as it arrives.
  float band = smoothstep(0.1, 0.0, abs(uv.y - (reveal * 1.4 - 0.2)));
  color += vec3(1.0, 0.45, 0.45) * band * (1.0 - reveal) * tex.a;

  float alpha = tex.a * smoothstep(0.0, 0.25, reveal);
  gl_FragColor = vec4(color * alpha, alpha);
}`;

const dustVertex = /* glsl */ `
attribute float seed;
uniform float time;
uniform vec2 pointer;
uniform float pixel;
varying float vFade;
void main() {
  vec3 p = position;
  p.y = mod(p.y + time * (0.012 + seed * 0.02) + 1.0, 2.0) - 1.0;
  p.x += sin(time * 0.3 + seed * 6.28) * 0.03 + pointer.x * (0.02 + seed * 0.05);
  vFade = (0.25 + seed * 0.75) * (0.6 + 0.4 * sin(time * (0.5 + seed) + seed * 40.0));
  gl_Position = vec4(p.xy, 0.0, 1.0);
  gl_PointSize = (1.2 + seed * 2.4) * pixel;
}`;

const dustFragment = /* glsl */ `
precision highp float;
varying float vFade;
void main() {
  float d = length(gl_PointCoord - 0.5);
  float a = smoothstep(0.5, 0.1, d) * vFade * 0.55;
  gl_FragColor = vec4(vec3(1.0, 0.72, 0.68) * a, a);
}`;

export function canUseWebGL() {
  try {
    return Boolean(document.createElement("canvas").getContext("webgl2"));
  } catch {
    return false;
  }
}

/** Depth-displaced cutout with a cursor light and dust. Returns its own teardown. */
export async function createHeroScene(canvas: HTMLCanvasElement, pointer: HeroPointer, onReady: () => void, onFail: () => void) {
  const small = window.innerWidth < 768;
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: small ? "low-power" : "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, small ? 1.5 : 2));
  renderer.setClearColor(0x000000, 0);

  const loader = new THREE.TextureLoader();
  const [map, depth] = await Promise.all([loader.loadAsync("/media/hero/subject.webp"), loader.loadAsync("/media/hero/depth.webp")]);
  map.colorSpace = THREE.NoColorSpace;
  depth.generateMipmaps = true;
  depth.minFilter = THREE.LinearMipmapLinearFilter;

  const uniforms = {
    map: { value: map },
    depth: { value: depth },
    pointer: { value: new THREE.Vector2() },
    spot: { value: new THREE.Vector2(0.72, 0.7) },
    time: { value: 0 },
    reveal: { value: 0 },
    strength: { value: small ? 0.022 : 0.034 },
  };
  const material = new THREE.ShaderMaterial({
    vertexShader: vertex,
    fragmentShader: fragment,
    uniforms,
    transparent: true,
    depthTest: false,
    premultipliedAlpha: true,
    blending: THREE.CustomBlending,
    blendSrc: THREE.OneFactor,
    blendDst: THREE.OneMinusSrcAlphaFactor,
  });
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
  quad.frustumCulled = false;

  const count = small ? 36 : 90;
  const positions = new Float32Array(count * 3);
  const seeds = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = Math.random() * 2 - 1;
    positions[i * 3 + 1] = Math.random() * 2 - 1;
    seeds[i] = Math.random();
  }
  const dustGeometry = new THREE.BufferGeometry();
  dustGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  dustGeometry.setAttribute("seed", new THREE.BufferAttribute(seeds, 1));
  const dustUniforms = { time: uniforms.time, pointer: uniforms.pointer, pixel: { value: renderer.getPixelRatio() } };
  const dustMaterial = new THREE.ShaderMaterial({ vertexShader: dustVertex, fragmentShader: dustFragment, uniforms: dustUniforms, transparent: true, depthTest: false, blending: THREE.AdditiveBlending });
  const dust = new THREE.Points(dustGeometry, dustMaterial);
  dust.frustumCulled = false;

  const scene = new THREE.Scene();
  scene.add(quad, dust);
  const camera = new THREE.Camera();

  const size = () => renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
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
    uniforms.pointer.value.x += (pointer.x - uniforms.pointer.value.x) * 0.07;
    uniforms.pointer.value.y += (pointer.y - uniforms.pointer.value.y) * 0.07;
    uniforms.spot.value.x += (0.5 + pointer.x * 1.1 - uniforms.spot.value.x) * 0.05;
    uniforms.spot.value.y += (0.62 - pointer.y * 1.1 - uniforms.spot.value.y) * 0.05;
    if (document.documentElement.dataset.intro === "done") {
      started ||= now;
      uniforms.reveal.value = Math.min(1, (now - started) / 1500);
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
    quad.geometry.dispose();
    material.dispose();
    dustGeometry.dispose();
    dustMaterial.dispose();
    map.dispose();
    depth.dispose();
    renderer.dispose();
  };
}
