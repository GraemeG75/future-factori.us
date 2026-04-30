import type * as THREE from 'three';

export interface FanAnimation {
  object: THREE.Object3D;
  speed: number;
}

export interface BlinkAnimation {
  material: THREE.MeshStandardMaterial;
  phase: number;
  speed: number;
  baseIntensity: number;
}

export interface SmokeParticle {
  mesh: THREE.Mesh;
  velocity: THREE.Vector3;
  age: number;
  maxAge: number;
}

export interface SmokeEmitter {
  marker: THREE.Object3D;
  timer: number;
  interval: number;
  particles: SmokeParticle[];
}

export interface BuildingAnim {
  fans: FanAnimation[];
  blinks: BlinkAnimation[];
  smokeEmitters: SmokeEmitter[];
}
