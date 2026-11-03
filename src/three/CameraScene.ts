import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

export interface CameraInput {
  /** Pointer position across the window, -0.5 to 0.5. */
  x: number;
  y: number;
  /** Progress of the section through the viewport, 0 to 1. */
  scroll: number;
}

const smooth = (a: number, b: number, v: number) => {
  const t = Math.min(1, Math.max(0, (v - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

function canvasTexture(width: number, height: number, draw: (c: CanvasRenderingContext2D) => void, srgb = true) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  draw(canvas.getContext("2d")!);
  const texture = new THREE.CanvasTexture(canvas);
  if (srgb) texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

/** Fine ribs that run around a ring, used as a bump map. */
const ribs = (count: number) => {
  const texture = canvasTexture(64, 8, (c) => {
    c.fillStyle = "#000";
    c.fillRect(0, 0, 64, 8);
    c.fillStyle = "#fff";
    c.fillRect(0, 0, 30, 8);
  }, false);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(count, 1);
  return texture;
};

/** Leatherette grain. */
const grain = () => {
  const texture = canvasTexture(256, 256, (c) => {
    const image = c.createImageData(256, 256);
    for (let i = 0; i < image.data.length; i += 4) {
      const v = 110 + Math.random() * 145;
      image.data[i] = image.data[i + 1] = image.data[i + 2] = v;
      image.data[i + 3] = 255;
    }
    c.putImageData(image, 0, 0);
    c.filter = "blur(1.2px)";
    c.drawImage(c.canvas, 0, 0);
  }, false);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(3, 3);
  return texture;
};

/**
 * A Sony α6400 with the 18–135mm kit lens, built from primitives so it costs no download.
 * It drifts, leans toward the pointer, turns when dragged, zooms and flips its screen
 * as the section scrolls, and fires its shutter on click. Returns a teardown.
 */
export async function createCameraScene(canvas: HTMLCanvasElement, input: CameraInput, photos: string[], options: { animate: boolean; font: string }) {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, window.innerWidth < 768 ? 1.5 : 1.75));
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const environment = pmrem.fromScene(new RoomEnvironment(), 0.04, 0.1, 100, { size: 128 }).texture;
  scene.environment = environment;
  pmrem.dispose();

  const view = new THREE.PerspectiveCamera(26, 1, 0.1, 200);
  view.position.set(0, 0, 46);

  scene.add(new THREE.HemisphereLight(0xffffff, 0x221410, 0.35));
  const key = new THREE.DirectionalLight(0xfff1e6, 1.6);
  key.position.set(-8, 10, 14);
  scene.add(key);
  const rim = new THREE.PointLight(0xff6a3d, 140, 60, 1.6);
  rim.position.set(12, 4, -10);
  scene.add(rim);
  const flash = new THREE.PointLight(0xffffff, 0, 50, 1.4);
  flash.position.set(3, 6, 10);
  scene.add(flash);

  const disposables: { dispose: () => void }[] = [environment];
  const track = <T extends { dispose: () => void }>(item: T) => (disposables.push(item), item);

  const leather = track(grain());
  const fineRibs = track(ribs(90));
  const wideRibs = track(ribs(46));
  const body = track(new THREE.MeshStandardMaterial({ color: 0x18181a, roughness: 0.5, metalness: 0.1, bumpMap: leather, bumpScale: 0.35 }));
  const grip = track(new THREE.MeshStandardMaterial({ color: 0x111112, roughness: 0.82, metalness: 0, bumpMap: leather, bumpScale: 1.4 }));
  const plastic = track(new THREE.MeshStandardMaterial({ color: 0x0e0e10, roughness: 0.28, metalness: 0.15 }));
  const rubberZoom = track(new THREE.MeshStandardMaterial({ color: 0x0b0b0c, roughness: 0.88, bumpMap: wideRibs, bumpScale: 3 }));
  const rubberFocus = track(new THREE.MeshStandardMaterial({ color: 0x0b0b0c, roughness: 0.85, bumpMap: fineRibs, bumpScale: 2.2 }));
  const metal = track(new THREE.MeshStandardMaterial({ color: 0xd0d3d8, roughness: 0.26, metalness: 1 }));
  const glass = track(new THREE.MeshPhysicalMaterial({ color: 0x0a1424, roughness: 0.03, metalness: 0.15, clearcoat: 1, clearcoatRoughness: 0, iridescence: 1, iridescenceIOR: 1.7, iridescenceThicknessRange: [180, 520], envMapIntensity: 1.6 }));
  const deep = track(new THREE.MeshStandardMaterial({ color: 0x020203, roughness: 0.4 }));

  const lettering = (text: string, width: number, height: number, size: number, align: CanvasTextAlign = "center") =>
    track(
      canvasTexture(width, height, (c) => {
        c.fillStyle = "rgba(0,0,0,0)";
        c.fillRect(0, 0, width, height);
        c.fillStyle = "#e9e9ea";
        c.font = `600 ${size}px ${options.font}`;
        c.textAlign = align;
        c.textBaseline = "middle";
        c.fillText(text, align === "center" ? width / 2 : 8, height / 2);
      }),
    );
  const decal = (texture: THREE.Texture, w: number, h: number) => new THREE.Mesh(track(new THREE.PlaneGeometry(w, h)), track(new THREE.MeshBasicMaterial({ map: texture, transparent: true, toneMapped: false })));

  const rig = new THREE.Group();
  scene.add(rig);
  const model = new THREE.Group();
  rig.add(model);
  const add = (geometry: THREE.BufferGeometry, material: THREE.Material, x: number, y: number, z: number, parent: THREE.Object3D = model) => {
    const mesh = new THREE.Mesh(track(geometry), material);
    mesh.position.set(x, y, z);
    parent.add(mesh);
    return mesh;
  };

  // Body: 120 × 67 × 36 mm, front facing +z, grip on the viewer's left.
  add(new RoundedBoxGeometry(12, 6.7, 3.6, 5, 0.55), body, 0, 0, 0);
  add(new RoundedBoxGeometry(3.3, 6.5, 3.2, 5, 0.9), grip, -4.35, -0.05, 1.15);
  add(new RoundedBoxGeometry(4.8, 0.55, 3.1, 4, 0.22), body, 3.4, 3.55, -0.1); // flash housing
  add(new THREE.BoxGeometry(1.9, 0.16, 1.9), metal, 0.7, 3.42, -0.2); // hot shoe
  add(new THREE.BoxGeometry(1.6, 0.1, 1.6), deep, 0.7, 3.52, -0.2);

  // Top controls.
  const dial = add(new THREE.CylinderGeometry(0.95, 0.95, 0.62, 48), rubberFocus, -2.6, 3.62, -0.6);
  const dialTop = decal(lettering("AUTO  P  A  S  M", 256, 64, 30), 1.7, 0.42);
  dialTop.rotation.x = -Math.PI / 2;
  dialTop.position.set(-2.6, 3.94, -0.6);
  model.add(dialTop);
  add(new THREE.CylinderGeometry(0.9, 0.9, 0.42, 48), rubberFocus, -3.6, 3.52, -1.5); // rear control dial
  const shutterRing = add(new THREE.TorusGeometry(0.62, 0.14, 12, 40), plastic, -4.55, 3.35, 1.7);
  shutterRing.rotation.x = Math.PI / 2;
  const shutter = add(new THREE.CylinderGeometry(0.46, 0.46, 0.3, 32), metal, -4.55, 3.47, 1.7);
  add(new THREE.CylinderGeometry(0.3, 0.3, 0.2, 24), plastic, -3.45, 3.43, 1.35); // C1

  // Front details.
  const name = decal(lettering("α6400", 256, 72, 52), 1.9, 0.53);
  name.position.set(-1.65, 2.55, 1.81);
  model.add(name);
  add(new THREE.CylinderGeometry(0.22, 0.22, 0.08, 24), track(new THREE.MeshStandardMaterial({ color: 0x3a1a10, roughness: 0.2, metalness: 0.2 })), -2.95, 2.35, 1.82).rotation.x = Math.PI / 2;
  add(new THREE.CylinderGeometry(0.3, 0.3, 0.14, 24), metal, 4.1, -1.2, 1.82).rotation.x = Math.PI / 2; // lens release
  for (const side of [-1, 1]) {
    const lug = add(new THREE.TorusGeometry(0.32, 0.1, 10, 24), metal, side * 6.08, 2.55, 0.4);
    lug.rotation.y = Math.PI / 2;
  }
  const mountRing = add(new THREE.TorusGeometry(2.72, 0.2, 18, 72), metal, 1, -0.35, 1.84);
  mountRing.rotation.set(0, 0, 0);

  // Back: viewfinder, buttons and the tilting screen.
  add(new RoundedBoxGeometry(2.9, 2.1, 1.0, 4, 0.3), body, 4.35, 2.25, -2.15);
  add(new RoundedBoxGeometry(2.5, 1.7, 0.5, 4, 0.22), grip, 4.35, 2.25, -2.75);
  add(new THREE.PlaneGeometry(1.5, 1.0), glass, 4.35, 2.25, -3.01).rotation.y = Math.PI;
  const wheel = add(new THREE.TorusGeometry(0.8, 0.16, 14, 40), metal, -4.25, -0.9, -1.86);
  wheel.rotation.y = Math.PI;
  add(new THREE.CylinderGeometry(0.42, 0.42, 0.14, 24), plastic, -4.25, -0.9, -1.86).rotation.x = Math.PI / 2;
  for (const [x, y] of [[-4.25, 1.55], [-3.1, 2.25], [-4.25, 0.55], [-4.25, -2.35]] as const) add(new THREE.CylinderGeometry(0.3, 0.3, 0.12, 24), plastic, x, y, -1.86).rotation.x = Math.PI / 2;

  const hinge = new THREE.Group();
  hinge.position.set(0.15, 1.75, -1.86);
  model.add(hinge);
  add(new RoundedBoxGeometry(7.6, 4.7, 0.36, 4, 0.14), plastic, 0, -2.35, -0.18, hinge);
  const lcd = track(new THREE.MeshBasicMaterial({ color: 0x111111, toneMapped: false }));
  const screen = add(new THREE.PlaneGeometry(6.9, 4.1), lcd, 0, -2.35, -0.37, hinge);
  screen.rotation.y = Math.PI;

  // The 18–135mm lens, mounted on the body's optical axis.
  const lens = new THREE.Group();
  lens.position.set(1, -0.35, 1.8);
  model.add(lens);
  const cylinder = (radius: number, length: number, material: THREE.Material, z: number, parent: THREE.Object3D = lens, segments = 72) => {
    const mesh = add(new THREE.CylinderGeometry(radius, radius, length, segments, 1, false), material, 0, 0, z + length / 2, parent);
    mesh.rotation.x = Math.PI / 2;
    return mesh;
  };
  cylinder(3.02, 0.55, plastic, 0);
  cylinder(3.36, 3.2, rubberZoom, 0.55);
  const label = track(
    canvasTexture(1024, 64, (c) => {
      c.fillStyle = "#0e0e10";
      c.fillRect(0, 0, 1024, 64);
      c.fillStyle = "#d9d9db";
      c.font = `600 30px ${options.font}`;
      c.textBaseline = "middle";
      c.fillText("E 3.5-5.6 / 18-135 OSS        18   24   35   50   70   135", 40, 34);
    }),
  );
  label.wrapS = THREE.RepeatWrapping;
  cylinder(3.2, 0.9, track(new THREE.MeshStandardMaterial({ map: label, roughness: 0.35 })), 3.75);

  // The inner barrel slides out as the lens zooms.
  const barrel = new THREE.Group();
  lens.add(barrel);
  cylinder(3.0, 2.2, plastic, 3.4, barrel);
  cylinder(3.24, 1.45, rubberFocus, 4.65, barrel);
  cylinder(3.34, 0.7, plastic, 6.1, barrel);
  const ringText = track(
    canvasTexture(1024, 1024, (c) => {
      c.translate(512, 512);
      c.fillStyle = "#cfcfd1";
      c.font = `600 44px ${options.font}`;
      const text = "SONY  E  18-135mm  1:3.5-5.6  OSS  ø55";
      [...text].forEach((ch, i) => {
        c.save();
        c.rotate(-Math.PI * 0.62 + i * 0.058);
        c.fillText(ch, 0, -440);
        c.restore();
      });
    }),
  );
  const face = add(new THREE.RingGeometry(2.25, 3.3, 96), track(new THREE.MeshStandardMaterial({ color: 0x0d0d0f, roughness: 0.5 })), 0, 0, 6.81, barrel);
  const faceText = add(new THREE.RingGeometry(2.25, 3.3, 96), track(new THREE.MeshBasicMaterial({ map: ringText, transparent: true, toneMapped: false })), 0, 0, 6.815, barrel);
  face.rotation.z = faceText.rotation.z = 0;
  add(new THREE.CircleGeometry(2.3, 64), deep, 0, 0, 6.2, barrel);
  const dome = add(new THREE.SphereGeometry(5.2, 64, 20, 0, Math.PI * 2, 0, 0.46), glass, 0, 0, 6.85 - 5.2 * Math.cos(0.46) - 0.05, barrel);
  dome.rotation.x = Math.PI / 2;
  add(new THREE.TorusGeometry(2.28, 0.06, 8, 72), metal, 0, 0, 6.82, barrel);

  // Frame the whole camera: roughly 14 units wide, plus the lens in depth.
  model.position.set(-0.6, 0, -3);

  // The screen shows Chinmoy's own photographs; each shot moves to the next.
  const loader = new THREE.TextureLoader();
  let shot = 0;
  const showPhoto = (index: number) => {
    loader.load(photos[index % photos.length], (texture) => {
      texture.colorSpace = THREE.SRGBColorSpace;
      const image = texture.image as HTMLImageElement;
      const aspect = image.width / image.height;
      const target = 6.9 / 4.1;
      if (aspect > target) texture.repeat.set(target / aspect, 1);
      else texture.repeat.set(1, aspect / target);
      texture.offset.set((1 - texture.repeat.x) / 2, (1 - texture.repeat.y) / 2);
      lcd.map?.dispose();
      lcd.map = texture;
      lcd.color.set(0xffffff);
      lcd.needsUpdate = true;
      dirty = true;
    });
  };
  if (photos.length) showPhoto(0);

  // Interaction state.
  const drag = { active: false, x: 0, y: 0, yaw: 0, pitch: 0, velocity: 0 };
  let kick = 0;
  let dirty = true;
  const onDown = (event: PointerEvent) => {
    drag.active = true;
    drag.x = event.clientX;
    drag.y = event.clientY;
    drag.velocity = 0;
    canvas.setPointerCapture?.(event.pointerId);
  };
  let travelled = 0;
  const onMove = (event: PointerEvent) => {
    if (!drag.active) return;
    const dx = event.clientX - drag.x;
    const dy = event.clientY - drag.y;
    travelled += Math.abs(dx) + Math.abs(dy);
    drag.x = event.clientX;
    drag.y = event.clientY;
    drag.yaw += dx * 0.012;
    drag.pitch = Math.max(-0.5, Math.min(0.5, drag.pitch + dy * 0.006));
    drag.velocity = dx * 0.012;
    dirty = true;
  };
  const onUp = () => {
    drag.active = false;
  };
  const onClick = () => {
    if (travelled > 8) {
      travelled = 0;
      return;
    }
    travelled = 0;
    kick = 1;
    shot += 1;
    showPhoto(shot);
    canvas.dispatchEvent(new CustomEvent("cc:shutter", { bubbles: true }));
  };
  const onDownReset = () => (travelled = 0);
  canvas.addEventListener("pointerdown", onDownReset);
  canvas.addEventListener("pointerdown", onDown);
  window.addEventListener("pointermove", onMove, { passive: true });
  window.addEventListener("pointerup", onUp);
  window.addEventListener("pointercancel", onUp);
  canvas.addEventListener("click", onClick);

  const size = () => {
    const width = canvas.clientWidth;
    const height = Math.max(1, canvas.clientHeight);
    renderer.setSize(width, height, false);
    view.aspect = width / height;
    // Keep about 19 units of camera in view across whichever side is shorter.
    const fit = 19 / Math.min(1, view.aspect * 0.9);
    view.position.z = fit / (2 * Math.tan(THREE.MathUtils.degToRad(view.fov / 2)));
    view.updateProjectionMatrix();
    dirty = true;
  };
  size();
  // Compile shaders off the main thread where the browser allows it, so nothing stalls.
  await renderer.compileAsync(scene, view);
  const resize = new ResizeObserver(size);
  resize.observe(canvas);

  let visible = false;
  const io = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    dirty = true;
  });
  io.observe(canvas);

  const onLost = (event: Event) => event.preventDefault();
  canvas.addEventListener("webglcontextlost", onLost);

  let frame = 0;
  let last = performance.now();
  let time = 0;
  let lastScroll = -1;
  let lastX = 0;
  let lastY = 0;
  const tick = (now: number) => {
    frame = requestAnimationFrame(tick);
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (!visible || document.hidden || document.documentElement.dataset.intro !== "done") return;

    const moving = options.animate || drag.active || Math.abs(drag.velocity) > 0.0005 || kick > 0.001 || input.scroll !== lastScroll || input.x !== lastX || input.y !== lastY;
    if (!moving && !dirty) return;
    lastScroll = input.scroll;
    lastX = input.x;
    lastY = input.y;
    dirty = false;
    if (options.animate) time += dt;

    if (!drag.active) {
      drag.yaw += drag.velocity;
      drag.velocity *= 0.94;
      drag.pitch *= 0.96;
    }
    const idle = options.animate ? Math.sin(time * 0.35) * 0.45 : 0;
    const targetYaw = -0.62 + idle + drag.yaw + input.x * 0.5 + (input.scroll - 0.5) * 0.9;
    const targetPitch = 0.22 + drag.pitch + input.y * 0.3;
    rig.rotation.y += (targetYaw - rig.rotation.y) * 0.08;
    rig.rotation.x += (targetPitch - rig.rotation.x) * 0.08;
    rig.position.y = options.animate ? Math.sin(time * 0.8) * 0.18 : 0;

    // Scroll zooms the lens out, then flips the screen up into selfie mode.
    kick = Math.max(0, kick - dt * 3.2);
    barrel.position.z = smooth(0.15, 0.55, input.scroll) * 1.6 + Math.sin(kick * Math.PI) * 0.35;
    const flip = smooth(0.45, 0.85, input.scroll);
    hinge.rotation.x = flip * Math.PI;
    hinge.position.z = -1.86 - flip * 0.95;
    hinge.position.y = 1.75 + flip * 0.9;
    shutter.position.y = 3.47 - Math.sin(kick * Math.PI) * 0.12;
    flash.intensity = kick > 0.7 ? 900 * (kick - 0.7) / 0.3 : 0;
    dial.rotation.y += dt * 0.15;

    renderer.render(scene, view);
  };
  frame = requestAnimationFrame(tick);

  return () => {
    cancelAnimationFrame(frame);
    resize.disconnect();
    io.disconnect();
    canvas.removeEventListener("pointerdown", onDownReset);
    canvas.removeEventListener("pointerdown", onDown);
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("pointerup", onUp);
    window.removeEventListener("pointercancel", onUp);
    canvas.removeEventListener("click", onClick);
    canvas.removeEventListener("webglcontextlost", onLost);
    lcd.map?.dispose();
    disposables.forEach((item) => item.dispose());
    renderer.dispose();
  };
}
