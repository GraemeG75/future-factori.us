/** Minimal Three.js mock for unit tests (no WebGL required). */

export class Vector3 {
  x: number; y: number; z: number;
  constructor(x = 0, y = 0, z = 0) {
    this.x = x; this.y = y; this.z = z;
  }
  set(x: number, y: number, z: number) {
    this.x = x; this.y = y; this.z = z; return this;
  }
  copy(v: Vector3) {
    this.x = v.x; this.y = v.y; this.z = v.z; return this;
  }
  clone() {
    return new Vector3(this.x, this.y, this.z);
  }
  add(v: Vector3) {
    this.x += v.x; this.y += v.y; this.z += v.z; return this;
  }
  sub(v: Vector3) {
    this.x -= v.x; this.y -= v.y; this.z -= v.z; return this;
  }
  multiplyScalar(s: number) {
    this.x *= s; this.y *= s; this.z *= s; return this;
  }
  length() {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
  }
  normalize() {
    const l = this.length() || 1; this.x /= l; this.y /= l; this.z /= l; return this;
  }
  distanceTo(v: Vector3) {
    return new Vector3(this.x - v.x, this.y - v.y, this.z - v.z).length();
  }
  applyMatrix4() {
    return this;
  }
  unproject() {
    return this;
  }
}

export class Color {
  r: number; g: number; b: number;
  constructor(r = 0, g = 0, b = 0) {
    this.r = r; this.g = g; this.b = b;
  }
  set() {
    return this;
  }
  setHex() {
    return this;
  }
}

export class Euler {
  x: number; y: number; z: number;
  constructor(x = 0, y = 0, z = 0) {
    this.x = x; this.y = y; this.z = z;
  }
  set() {
    return this;
  }
}

export class Matrix4 {
  elements = new Float32Array(16);
  identity() {
    return this;
  }
  set() {
    return this;
  }
  multiply() {
    return this;
  }
  makeRotationY() {
    return this;
  }
  makeTranslation() {
    return this;
  }
}

export class Quaternion {
  x = 0; y = 0; z = 0; w = 1;
  setFromAxisAngle() {
    return this;
  }
  setFromEuler() {
    return this;
  }
}

export class Object3D {
  position = new Vector3();
  rotation = new Euler();
  scale = new Vector3(1, 1, 1);
  children: Object3D[] = [];
  name = '';
  visible = true;
  userData: Record<string, unknown> = {};
  add(...obj: Object3D[]) {
    this.children.push(...obj); return this;
  }
  remove(obj: Object3D) {
    this.children = this.children.filter(c => c !== obj); return this;
  }
  traverse(fn: (o: Object3D) => void) {
    fn(this); this.children.forEach(c => c.traverse(fn));
  }
  lookAt() {}
  updateMatrix() {}
  updateMatrixWorld() {}
  getWorldPosition(target: Vector3) {
    target.copy(this.position); return target;
  }
}

export class Group extends Object3D {}

export class Mesh extends Object3D {
  geometry: unknown;
  material: unknown;
  constructor(geometry?: unknown, material?: unknown) {
    super();
    this.geometry = geometry;
    this.material = material;
  }
}

export class Line extends Object3D {
  geometry: unknown;
  material: unknown;
  constructor(geometry?: unknown, material?: unknown) {
    super();
    this.geometry = geometry;
    this.material = material;
  }
}

export class LineSegments extends Object3D {
  geometry: unknown;
  material: unknown;
  constructor(geometry?: unknown, material?: unknown) {
    super();
    this.geometry = geometry;
    this.material = material;
  }
}

export class BufferGeometry {
  attributes: Record<string, unknown> = {};
  setAttribute() {
    return this;
  }
  setFromPoints() {
    return this;
  }
  dispose() {}
  setIndex() {
    return this;
  }
  computeVertexNormals() {}
}

export class BoxGeometry extends BufferGeometry {
  constructor(_w?: number, _h?: number, _d?: number) {
    super();
  }
}

export class CylinderGeometry extends BufferGeometry {
  constructor(_rt?: number, _rb?: number, _h?: number, _seg?: number) {
    super();
  }
}

export class ConeGeometry extends BufferGeometry {
  constructor(_r?: number, _h?: number, _seg?: number) {
    super();
  }
}

export class PlaneGeometry extends BufferGeometry {
  constructor(_w?: number, _h?: number) {
    super();
  }
}

export class TorusGeometry extends BufferGeometry {
  constructor(_r?: number, _t?: number, _rs?: number, _ts?: number) {
    super();
  }
}

export class SphereGeometry extends BufferGeometry {
  constructor(_r?: number, _ws?: number, _hs?: number) {
    super();
  }
}

export class Material {
  transparent = false;
  opacity = 1;
  dispose() {}
  clone() {
    return Object.assign(Object.create(Object.getPrototypeOf(this)), this);
  }
}

export class MeshStandardMaterial extends Material {
  color = new Color();
  emissive = new Color();
  metalness = 0;
  roughness = 1;
  constructor(params?: Record<string, unknown>) {
    super(); Object.assign(this, params);
  }
}

export class MeshBasicMaterial extends Material {
  color = new Color();
  constructor(params?: Record<string, unknown>) {
    super(); Object.assign(this, params);
  }
}

export class MeshLambertMaterial extends Material {
  color = new Color();
  emissive = new Color();
  constructor(params?: Record<string, unknown>) {
    super(); Object.assign(this, params);
  }
}

export class LineBasicMaterial extends Material {
  color = new Color();
  constructor(params?: Record<string, unknown>) {
    super(); Object.assign(this, params);
  }
}

export class AmbientLight extends Object3D {
  color: Color;
  intensity: number;
  constructor(color?: number | string, intensity = 1) {
    super();
    this.color = new Color();
    this.intensity = intensity;
    void color;
  }
}

export class DirectionalLight extends Object3D {
  color: Color;
  intensity: number;
  castShadow = false;
  shadow = { mapSize: { width: 0, height: 0 }, camera: { near: 0, far: 0, left: 0, right: 0, top: 0, bottom: 0 } };
  constructor(color?: number | string, intensity = 1) {
    super();
    this.color = new Color();
    this.intensity = intensity;
    void color;
  }
}

export class Scene extends Object3D {
  background: unknown = null;
  fog: unknown = null;
}

export class PerspectiveCamera extends Object3D {
  fov: number;
  aspect: number;
  near: number;
  far: number;
  projectionMatrix = new Matrix4();
  constructor(fov = 75, aspect = 1, near = 0.1, far = 1000) {
    super();
    this.fov = fov;
    this.aspect = aspect;
    this.near = near;
    this.far = far;
  }
  updateProjectionMatrix() {}
}

export class WebGLRenderer {
  domElement: HTMLCanvasElement;
  shadowMap = { enabled: false, type: 0 };
  constructor() {
    this.domElement = document.createElement('canvas');
  }
  setSize() {}
  setPixelRatio() {}
  render() {}
  dispose() {}
  setClearColor() {}
}

export class Fog {
  color: Color;
  near: number;
  far: number;
  constructor(color: unknown, near = 1, far = 1000) {
    this.color = new Color();
    this.near = near;
    this.far = far;
    void color;
  }
}

export class Raycaster {
  ray = { origin: new Vector3(), direction: new Vector3() };
  setFromCamera() {}
  intersectObjects(_objects: unknown[], _recursive?: boolean) {
    return [];
  }
}

export const MathUtils = {
  degToRad: (deg: number) => deg * (Math.PI / 180),
  radToDeg: (rad: number) => rad * (180 / Math.PI),
  clamp: (val: number, min: number, max: number) => Math.max(min, Math.min(max, val)),
  lerp: (x: number, y: number, t: number) => x + (y - x) * t,
  generateUUID: () => crypto.randomUUID(),
  smoothstep: (x: number, min: number, max: number) => {
    const t = Math.max(0, Math.min(1, (x - min) / (max - min)));
    return t * t * (3 - 2 * t);
  },
};

export const PCFSoftShadowMap = 2;
export const DoubleSide = 2;
export const FrontSide = 0;
export const BackSide = 1;
export const AdditiveBlending = 2;
export const NormalBlending = 1;
