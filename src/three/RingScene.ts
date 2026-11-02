import * as THREE from "three";
import { optimizedUrl } from "@/utils/media";

interface Item {
  src: string;
  width: number;
  height: number;
}

/** Photographs hung on a slowly turning cylinder, driven by scroll. Returns a teardown. */
export function createRingScene(canvas: HTMLCanvasElement, items: Item[], progress: { value: number }, onSelect: (index: number) => void, onHover: (index: number | null) => void, onFail: () => void) {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: window.innerWidth >= 768 });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 40);
  camera.position.set(0, 0.25, 9.4);
  const group = new THREE.Group();
  group.rotation.x = 0.05;
  scene.add(group);

  const radius = 4.1;
  const pending: { bitmap: ImageBitmap; material: THREE.MeshBasicMaterial }[] = [];
  const loader = new THREE.ImageBitmapLoader();
  loader.setOptions({ imageOrientation: "flipY", resizeWidth: 640, resizeQuality: "medium" });
  const meshes = items.map((item, i) => {
    const aspect = item.width / item.height;
    const height = aspect > 1 ? 1.5 : 2.1;
    const geometry = new THREE.PlaneGeometry(height * aspect, height);
    const material = new THREE.MeshBasicMaterial({ color: 0x151515, side: THREE.DoubleSide, transparent: true });
    loader.load(optimizedUrl(item.src, 640), (bitmap) => pending.push({ bitmap, material }));
    const mesh = new THREE.Mesh(geometry, material);
    const angle = (i / items.length) * Math.PI * 2;
    mesh.position.set(Math.sin(angle) * radius, (i % 2 ? 0.34 : -0.34), Math.cos(angle) * radius);
    mesh.rotation.y = angle;
    mesh.userData.index = i;
    group.add(mesh);
    return mesh;
  });

  const size = () => {
    renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
    camera.aspect = canvas.clientWidth / Math.max(1, canvas.clientHeight);
    camera.position.z = camera.aspect < 1 ? 13.5 : 9.4;
    camera.updateProjectionMatrix();
  };
  size();
  const resize = new ResizeObserver(size);
  resize.observe(canvas);

  let visible = false;
  const io = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting));
  io.observe(canvas);

  const ray = new THREE.Raycaster();
  const point = new THREE.Vector2(9, 9);
  const pick = () => {
    ray.setFromCamera(point, camera);
    const hit = ray.intersectObjects(meshes)[0];
    return hit && hit.point.z > 0 ? (hit.object.userData.index as number) : null;
  };
  const locate = (event: PointerEvent) => {
    const box = canvas.getBoundingClientRect();
    point.set(((event.clientX - box.left) / box.width) * 2 - 1, -((event.clientY - box.top) / box.height) * 2 + 1);
  };
  const onMove = (event: PointerEvent) => {
    locate(event);
    onHover(pick());
  };
  const onClick = (event: MouseEvent) => {
    locate(event as PointerEvent);
    const index = pick();
    if (index !== null) onSelect(index);
  };
  canvas.addEventListener("pointermove", onMove);
  canvas.addEventListener("click", onClick);
  const onLost = (event: Event) => {
    event.preventDefault();
    onFail();
  };
  canvas.addEventListener("webglcontextlost", onLost);

  let frame = 0;
  let turn = 0;
  const world = new THREE.Vector3();
  const tick = () => {
    frame = requestAnimationFrame(tick);
    if (!visible) return;
    const next = pending.shift();
    if (next) {
      const texture = new THREE.Texture(next.bitmap);
      texture.flipY = false;
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.needsUpdate = true;
      next.material.map = texture;
      next.material.color.set(0xffffff);
      next.material.needsUpdate = true;
    }
    turn += 0.0009;
    const target = progress.value * Math.PI * 2.4 + turn;
    group.rotation.y += (target - group.rotation.y) * 0.08;
    for (const mesh of meshes) {
      mesh.getWorldPosition(world);
      (mesh.material as THREE.MeshBasicMaterial).opacity = THREE.MathUtils.clamp(0.14 + (world.z + radius) / (radius * 2), 0.14, 1);
    }
    renderer.render(scene, camera);
  };
  frame = requestAnimationFrame(tick);

  return () => {
    cancelAnimationFrame(frame);
    resize.disconnect();
    io.disconnect();
    canvas.removeEventListener("pointermove", onMove);
    canvas.removeEventListener("click", onClick);
    canvas.removeEventListener("webglcontextlost", onLost);
    for (const mesh of meshes) {
      mesh.geometry.dispose();
      const material = mesh.material as THREE.MeshBasicMaterial;
      material.map?.dispose();
      material.dispose();
    }
    renderer.dispose();
  };
}
