import type * as THREE from 'three';

export interface RouteEffect {
  sphere: THREE.Mesh;
  from: THREE.Vector3;
  to: THREE.Vector3;
  progress: number;
  speed: number;
}

export interface PulseEffect {
  mesh: THREE.Mesh;
  age: number;
  maxAge: number;
}

export interface ParticleEffect {
  particles: THREE.Points;
  velocities: THREE.Vector3[];
  age: number;
  maxAge: number;
}
