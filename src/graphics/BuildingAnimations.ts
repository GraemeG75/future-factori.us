import * as THREE from 'three';

interface FanAnimation {
  object: THREE.Object3D;
  speed: number;
}

interface BlinkAnimation {
  material: THREE.MeshStandardMaterial;
  phase: number;
  speed: number;
  baseIntensity: number;
}

interface SmokeParticle {
  mesh: THREE.Mesh;
  velocity: THREE.Vector3;
  age: number;
  maxAge: number;
}

interface SmokeEmitter {
  marker: THREE.Object3D;
  timer: number;
  interval: number;
  particles: SmokeParticle[];
}

interface BuildingAnim {
  fans: FanAnimation[];
  blinks: BlinkAnimation[];
  smokeEmitters: SmokeEmitter[];
}

const SMOKE_COLOR = 0x999999;

export class BuildingAnimations {
  private scene: THREE.Scene;
  private registry: Map<string, BuildingAnim> = new Map();

  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  register(buildingId: string, group: THREE.Group): void {
    const anim: BuildingAnim = { fans: [], blinks: [], smokeEmitters: [] };

    group.traverse((child) => {
      if (child.name === 'fan_blade' || child.name === 'spinning_orb') {
        anim.fans.push({ object: child, speed: 3.0 + Math.random() * 2.0 });
      } else if (child.name === 'blink_light' && child instanceof THREE.Mesh) {
        const mat = (child as THREE.Mesh).material as THREE.MeshStandardMaterial;
        if (mat && typeof mat.emissiveIntensity === 'number') {
          anim.blinks.push({
            material: mat,
            phase: Math.random() * Math.PI * 2,
            speed: 1.5 + Math.random(),
            baseIntensity: mat.emissiveIntensity,
          });
        }
      } else if (child.name === 'smoke_point') {
        anim.smokeEmitters.push({
          marker: child,
          timer: Math.random() * 0.4,
          interval: 0.35 + Math.random() * 0.25,
          particles: [],
        });
      }
    });

    this.registry.set(buildingId, anim);
  }

  unregister(buildingId: string): void {
    const anim = this.registry.get(buildingId);
    if (!anim) return;
    for (const emitter of anim.smokeEmitters) {
      for (const p of emitter.particles) {
        this.scene.remove(p.mesh);
        p.mesh.geometry.dispose();
        (p.mesh.material as THREE.Material).dispose();
      }
      emitter.particles.length = 0;
    }
    this.registry.delete(buildingId);
  }

  update(deltaTime: number): void {
    for (const anim of this.registry.values()) {
      // Rotate fan blades
      for (const fan of anim.fans) {
        fan.object.rotation.y += fan.speed * deltaTime;
      }

      // Pulse blink lights
      for (const blink of anim.blinks) {
        blink.phase += blink.speed * deltaTime;
        const t = (Math.sin(blink.phase) + 1) / 2;
        blink.material.emissiveIntensity = blink.baseIntensity * (0.25 + t * 1.5);
      }

      // Smoke emitters
      for (const emitter of anim.smokeEmitters) {
        emitter.timer += deltaTime;
        if (emitter.timer >= emitter.interval) {
          emitter.timer = 0;
          const geo = new THREE.SphereGeometry(0.07, 4, 4);
          const mat = new THREE.MeshBasicMaterial({
            color: SMOKE_COLOR,
            transparent: true,
            opacity: 0.35,
          });
          const mesh = new THREE.Mesh(geo, mat);
          const worldPos = new THREE.Vector3();
          emitter.marker.getWorldPosition(worldPos);
          mesh.position.copy(worldPos);
          mesh.scale.setScalar(0.6 + Math.random() * 0.6);
          this.scene.add(mesh);
          emitter.particles.push({
            mesh,
            velocity: new THREE.Vector3(
              (Math.random() - 0.5) * 0.4,
              0.9 + Math.random() * 0.5,
              (Math.random() - 0.5) * 0.4,
            ),
            age: 0,
            maxAge: 1.2 + Math.random() * 0.8,
          });
        }

        for (let i = emitter.particles.length - 1; i >= 0; i--) {
          const p = emitter.particles[i]!;
          p.age += deltaTime;
          p.mesh.position.addScaledVector(p.velocity, deltaTime);
          p.mesh.scale.addScalar(deltaTime * 0.4);
          (p.mesh.material as THREE.MeshBasicMaterial).opacity =
            0.35 * (1 - p.age / p.maxAge);
          if (p.age >= p.maxAge) {
            this.scene.remove(p.mesh);
            p.mesh.geometry.dispose();
            (p.mesh.material as THREE.Material).dispose();
            emitter.particles.splice(i, 1);
          }
        }
      }
    }
  }

  dispose(): void {
    for (const id of [...this.registry.keys()]) {
      this.unregister(id);
    }
  }
}
