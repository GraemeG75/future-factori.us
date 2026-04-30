import * as THREE from 'three';
import type { RouteEffect, PulseEffect, ParticleEffect } from '../interfaces/effects';

export class Effects {
  private scene: THREE.Scene;
  private routeEffects: Map<string, RouteEffect> = new Map();
  private pulseEffects: PulseEffect[] = [];
  private particleEffects: ParticleEffect[] = [];

  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  createRouteEffect(from: THREE.Vector3, to: THREE.Vector3, color: THREE.Color): string {
    const id = crypto.randomUUID();
    const geo = new THREE.SphereGeometry(0.15, 6, 6);
    const mat = new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: 1.0
    });
    const sphere = new THREE.Mesh(geo, mat);
    sphere.position.copy(from);
    this.scene.add(sphere);
    this.routeEffects.set(id, { sphere, from: from.clone(), to: to.clone(), progress: 0, speed: 0.5 });
    return id;
  }

  removeRouteEffect(id: string): void {
    const effect = this.routeEffects.get(id);
    if (effect) {
      this.scene.remove(effect.sphere);
      effect.sphere.geometry.dispose();
      (effect.sphere.material as THREE.Material).dispose();
      this.routeEffects.delete(id);
    }
  }

  createBuildingPulse(position: THREE.Vector3, color: THREE.Color): void {
    const geo = new THREE.TorusGeometry(0.5, 0.05, 8, 32);
    const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.8 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.x = Math.PI / 2;
    mesh.position.copy(position);
    mesh.position.y += 0.1;
    this.scene.add(mesh);
    this.pulseEffects.push({ mesh, age: 0, maxAge: 0.8 });
  }

  createResearchBurst(position: THREE.Vector3): void {
    const count = 20;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = position.x;
      positions[i * 3 + 1] = position.y + 0.5;
      positions[i * 3 + 2] = position.z;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({ color: 0x8800ff, size: 0.2, transparent: true, opacity: 1.0 });
    const particles = new THREE.Points(geo, mat);
    this.scene.add(particles);

    const velocities: THREE.Vector3[] = [];
    for (let i = 0; i < count; i++) {
      const vel = new THREE.Vector3((Math.random() - 0.5) * 4, Math.random() * 3 + 1, (Math.random() - 0.5) * 4);
      velocities.push(vel);
    }
    this.particleEffects.push({ particles, velocities, age: 0, maxAge: 1.5 });
  }

  update(deltaTime: number): void {
    for (const effect of this.routeEffects.values()) {
      effect.progress += deltaTime * effect.speed;
      if (effect.progress > 1) effect.progress = 0;
      effect.sphere.position.lerpVectors(effect.from, effect.to, effect.progress);
    }

    for (let i = this.pulseEffects.length - 1; i >= 0; i--) {
      const pulse = this.pulseEffects[i]!;
      pulse.age += deltaTime;
      const t = pulse.age / pulse.maxAge;
      pulse.mesh.scale.setScalar(1 + t * 3);
      (pulse.mesh.material as THREE.MeshBasicMaterial).opacity = 0.8 * (1 - t);
      if (pulse.age >= pulse.maxAge) {
        this.scene.remove(pulse.mesh);
        pulse.mesh.geometry.dispose();
        (pulse.mesh.material as THREE.Material).dispose();
        this.pulseEffects.splice(i, 1);
      }
    }

    for (let i = this.particleEffects.length - 1; i >= 0; i--) {
      const pe = this.particleEffects[i]!;
      pe.age += deltaTime;
      const t = pe.age / pe.maxAge;
      const pos = pe.particles.geometry.attributes['position']!;
      for (let j = 0; j < pe.velocities.length; j++) {
        pe.velocities[j]!.y -= 9.8 * deltaTime;
        pos.setXYZ(
          j,
          pos.getX(j) + pe.velocities[j]!.x * deltaTime,
          pos.getY(j) + pe.velocities[j]!.y * deltaTime,
          pos.getZ(j) + pe.velocities[j]!.z * deltaTime
        );
      }
      pos.needsUpdate = true;
      (pe.particles.material as THREE.PointsMaterial).opacity = 1 - t;
      if (pe.age >= pe.maxAge) {
        this.scene.remove(pe.particles);
        pe.particles.geometry.dispose();
        (pe.particles.material as THREE.Material).dispose();
        this.particleEffects.splice(i, 1);
      }
    }
  }

  dispose(): void {
    for (const id of this.routeEffects.keys()) {
      this.removeRouteEffect(id);
    }
    for (const pulse of this.pulseEffects) {
      this.scene.remove(pulse.mesh);
      pulse.mesh.geometry.dispose();
      (pulse.mesh.material as THREE.Material).dispose();
    }
    this.pulseEffects.length = 0;
    for (const pe of this.particleEffects) {
      this.scene.remove(pe.particles);
      pe.particles.geometry.dispose();
      (pe.particles.material as THREE.Material).dispose();
    }
    this.particleEffects.length = 0;
  }
}
