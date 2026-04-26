import * as THREE from 'three';
import { RetroMaterials } from './RetroMaterials';

export class ModelFactory {
  static createBuilding(typeId: string, level: number = 1): THREE.Group {
    const group = new THREE.Group();
    const mat = RetroMaterials.forBuilding(typeId);
    const scaleFactor = 1 + (level - 1) * 0.15;

    switch (typeId) {
      case 'wood_harvester': {
        const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.6, 8), mat);
        trunk.position.y = 0.3;
        const cone = new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.5, 8), mat);
        cone.position.y = 0.85;
        // Blinking indicator light
        const blinkMat = RetroMaterials.glowing(0x00ff88, 1.8);
        const blink = new THREE.Mesh(new THREE.SphereGeometry(0.05, 6, 6), blinkMat);
        blink.name = 'blink_light';
        blink.position.set(0, 1.15, 0);
        group.add(trunk, cone, blink);
        break;
      }
      case 'coal_mine': {
        const base = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.5, 0.8), mat);
        base.position.y = 0.25;
        const chimney = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.4, 6), mat);
        chimney.position.set(0.25, 0.65, 0.25);
        // Smoke emission point at chimney top
        const smokePoint = new THREE.Object3D();
        smokePoint.name = 'smoke_point';
        smokePoint.position.set(0.25, 0.88, 0.25);
        group.add(base, chimney, smokePoint);
        break;
      }
      case 'iron_mine': {
        const base = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.6, 0.9), mat);
        base.position.y = 0.3;
        const top = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.3, 0.6), mat);
        top.position.set(0, 0.75, 0);
        top.rotation.y = Math.PI / 4;
        const blinkMat = RetroMaterials.glowing(0xff8c00, 1.8);
        const blink = new THREE.Mesh(new THREE.SphereGeometry(0.05, 6, 6), blinkMat);
        blink.name = 'blink_light';
        blink.position.set(0, 1.0, 0);
        group.add(base, top, blink);
        break;
      }
      case 'water_pump': {
        const base = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.3, 8), mat);
        base.position.y = 0.15;
        const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.8, 6), mat);
        pipe.position.y = 0.7;
        const blinkMat = RetroMaterials.glowing(0x0077ff, 2.0);
        const blink = new THREE.Mesh(new THREE.SphereGeometry(0.05, 6, 6), blinkMat);
        blink.name = 'blink_light';
        blink.position.y = 1.15;
        group.add(base, pipe, blink);
        break;
      }
      case 'basic_factory': {
        const base = new THREE.Mesh(new THREE.BoxGeometry(1, 0.6, 1), mat);
        base.position.y = 0.3;
        for (let i = 0; i < 3; i++) {
          const bump = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.3, 0.2), mat);
          bump.position.set(-0.3 + i * 0.3, 0.75, 0);
          group.add(bump);
        }
        const blinkMat = RetroMaterials.glowing(0x0088ff, 1.6);
        const blink = new THREE.Mesh(new THREE.SphereGeometry(0.06, 6, 6), blinkMat);
        blink.name = 'blink_light';
        blink.position.set(0, 1.1, 0);
        group.add(base, blink);
        break;
      }
      case 'smelter': {
        const main = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 1.0, 8), mat);
        main.position.y = 0.5;
        const stack1 = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.4, 6), mat);
        stack1.position.set(0.2, 1.2, 0);
        const stack2 = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.4, 6), mat);
        stack2.position.set(-0.2, 1.2, 0);
        // Smoke emission points at stack tops
        const smoke1 = new THREE.Object3D();
        smoke1.name = 'smoke_point';
        smoke1.position.set(0.2, 1.45, 0);
        const smoke2 = new THREE.Object3D();
        smoke2.name = 'smoke_point';
        smoke2.position.set(-0.2, 1.45, 0);
        group.add(main, stack1, stack2, smoke1, smoke2);
        break;
      }
      case 'circuit_fab': {
        const base = new THREE.Mesh(new THREE.BoxGeometry(1, 0.2, 1), mat);
        base.position.y = 0.1;
        const bumpMat = RetroMaterials.neonGlow(0x00ffff);
        for (let r = 0; r < 3; r++) {
          for (let c = 0; c < 3; c++) {
            const bump = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.05, 0.1), bumpMat);
            bump.position.set(-0.3 + c * 0.3, 0.225, -0.3 + r * 0.3);
            group.add(bump);
          }
        }
        // Blinking status light
        const blinkMat = RetroMaterials.glowing(0x00ffff, 2.0);
        const blink = new THREE.Mesh(new THREE.SphereGeometry(0.06, 6, 6), blinkMat);
        blink.name = 'blink_light';
        blink.position.set(0, 0.38, 0);
        group.add(base, blink);
        break;
      }
      case 'refinery': {
        const main = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.8, 8), mat);
        main.position.y = 0.4;
        const pipe = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.1, 0.1), mat);
        pipe.position.set(0.2, 0.5, 0);
        // Smoke from main stack top
        const smokePoint = new THREE.Object3D();
        smokePoint.name = 'smoke_point';
        smokePoint.position.set(0, 0.85, 0);
        const blinkMat = RetroMaterials.glowing(0xff6600, 1.8);
        const blink = new THREE.Mesh(new THREE.SphereGeometry(0.05, 6, 6), blinkMat);
        blink.name = 'blink_light';
        blink.position.set(0, 1.0, 0);
        group.add(main, pipe, smokePoint, blink);
        break;
      }
      case 'storage_depot': {
        const base = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.3, 1.2), mat);
        base.position.y = 0.15;
        group.add(base);
        break;
      }
      case 'research_center': {
        const dome = new THREE.Mesh(new THREE.SphereGeometry(0.4, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), mat);
        dome.position.y = 0;
        const antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.8, 6), mat);
        antenna.position.y = 0.8;
        // Blinking beacon at antenna tip
        const beaconMat = RetroMaterials.glowing(0xff00ff, 2.5);
        const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.05, 6, 6), beaconMat);
        beacon.name = 'blink_light';
        beacon.position.y = 1.25;
        group.add(dome, antenna, beacon);
        break;
      }
      case 'trading_terminal': {
        const cone = new THREE.Mesh(new THREE.ConeGeometry(0.5, 0.8, 4), mat);
        cone.position.y = 0.4;
        // Rotating ring
        const ringMat = RetroMaterials.neonGlow(0x00ff88);
        const ring = new THREE.Mesh(new THREE.TorusGeometry(0.38, 0.04, 8, 32), ringMat);
        ring.name = 'fan_blade';
        ring.position.y = 0.6;
        group.add(cone, ring);
        break;
      }
      case 'power_plant': {
        const base = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.5, 0.9), mat);
        base.position.y = 0.25;
        const fanMat = RetroMaterials.neonGlow(0xffdd00);
        for (let i = 0; i < 4; i++) {
          const fan = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.05, 0.1), fanMat);
          fan.name = 'fan_blade';
          fan.position.set(0, 0.55, 0);
          fan.rotation.y = (i * Math.PI) / 2;
          group.add(fan);
        }
        group.add(base);
        break;
      }
      case 'silicon_extractor': {
        const base = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.4, 0.7), mat);
        base.position.y = 0.2;
        base.rotation.y = Math.PI / 6;
        const crystalMat = RetroMaterials.glowing(0xaaaaff, 1.5);
        for (let i = 0; i < 3; i++) {
          const spire = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.5, 0.08), crystalMat);
          spire.position.set(-0.2 + i * 0.2, 0.65, 0);
          group.add(spire);
        }
        const blinkMat = RetroMaterials.glowing(0xaaaaff, 2.2);
        const blink = new THREE.Mesh(new THREE.SphereGeometry(0.05, 6, 6), blinkMat);
        blink.name = 'blink_light';
        blink.position.set(0, 1.0, 0);
        group.add(base, blink);
        break;
      }
      case 'uranium_extractor': {
        const base = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.6, 0.8), mat);
        base.position.y = 0.3;
        const stripeMat = RetroMaterials.neonGlow(0xffcc00);
        for (let i = 0; i < 3; i++) {
          const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.82, 0.06, 0.82), stripeMat);
          stripe.position.y = 0.1 + i * 0.2;
          group.add(stripe);
        }
        const blinkMat = RetroMaterials.glowing(0x00ff44, 2.5);
        const blink = new THREE.Mesh(new THREE.SphereGeometry(0.06, 6, 6), blinkMat);
        blink.name = 'blink_light';
        blink.position.y = 0.95;
        group.add(base, blink);
        break;
      }
      case 'exotic_lab': {
        const base = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.3, 0.8), mat);
        base.position.y = 0.15;
        const sideMat = RetroMaterials.neonGlow(0xff44ff);
        const offsets = [
          [-0.4, 0, 0],
          [0.4, 0, 0],
          [0, 0, -0.4],
          [0, 0, 0.4]
        ] as [number, number, number][];
        for (const [ox, oy, oz] of offsets) {
          const side = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.4, 0.15), sideMat);
          side.position.set(ox, 0.5 + oy, oz);
          group.add(side);
        }
        const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.2, 12, 12), RetroMaterials.glowing(0xff00ff, 2.0));
        sphere.name = 'spinning_orb';
        sphere.position.y = 0.85;
        group.add(base, sphere);
        break;
      }
      default: {
        const fallback = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.5, 0.8), mat);
        fallback.position.y = 0.25;
        group.add(fallback);
      }
    }

    // Level 2+: glowing base ring
    if (level >= 2) {
      const ringMat = RetroMaterials.glowing(0x00ffcc, 0.7 + level * 0.2);
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.04, 8, 32), ringMat);
      ring.rotation.x = Math.PI / 2;
      ring.position.y = 0.07;
      group.add(ring);
    }

    // Level 3+: elevated status beacon
    if (level >= 3) {
      const beaconMat = RetroMaterials.glowing(0xffff00, 2.0 + level * 0.3);
      const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.07, 6, 6), beaconMat);
      beacon.name = 'blink_light';
      beacon.position.y = 1.9;
      group.add(beacon);
    }

    // Enhance emissive at higher levels
    if (level > 1) {
      group.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          const m = (child as THREE.Mesh).material as THREE.MeshStandardMaterial;
          if (m && typeof m.emissiveIntensity === 'number') {
            m.emissiveIntensity = Math.min(m.emissiveIntensity * (1 + (level - 1) * 0.25), 3.5);
          }
        }
      });
    }

    // Enable shadow casting/receiving on all sub-meshes
    group.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    group.scale.setScalar(scaleFactor);
    return group;
  }

  static createResourceSpot(buildingTypeId: string): THREE.Group {
    const colorMap: Record<string, number> = {
      wood_harvester: 0x33cc55,
      coal_mine: 0x888888,
      iron_mine: 0xcc5533,
      water_pump: 0x3399ff
    };
    const color = colorMap[buildingTypeId] ?? 0xffffff;
    const group = new THREE.Group();

    // Glowing ground ring
    const ringMat = RetroMaterials.neonGlow(color);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(1.2, 0.1, 8, 24), ringMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.05;

    // Small floating indicator above the ring
    const indicatorMat = RetroMaterials.neonGlow(color);
    const indicator = new THREE.Mesh(new THREE.OctahedronGeometry(0.22, 0), indicatorMat);
    indicator.position.y = 1.0;

    group.add(ring, indicator);
    return group;
  }

  static createResourceNode(resourceId: string): THREE.Group {
    const group = new THREE.Group();
    const mat = RetroMaterials.forResource(resourceId);
    const geo = new THREE.OctahedronGeometry(0.3, 0);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.y = 0.4;
    group.add(mesh);
    return group;
  }

  static createCargoCapsule(resourceId: string): THREE.Mesh {
    const mat = RetroMaterials.forResource(resourceId);
    const geo = new THREE.SphereGeometry(0.15, 6, 6);
    return new THREE.Mesh(geo, mat);
  }

  static createTerrain(width: number, depth: number, divisions: number): THREE.Mesh {
    const geo = new THREE.PlaneGeometry(width, depth, divisions, divisions);
    geo.rotateX(-Math.PI / 2);
    const pos = geo.attributes['position'] as THREE.BufferAttribute | undefined;
    if (pos) {
      const vertexCount = pos.count;
      const colors = new Float32Array(vertexCount * 3);

      for (let i = 0; i < vertexCount; i++) {
        const x = pos.getX(i);
        const z = pos.getZ(i);
        const isEdge = Math.abs(x) > width * 0.48 || Math.abs(z) > depth * 0.48;

        if (!isEdge) {
          // Layered height using sine waves for smoother biome-like hills
          const h =
            Math.sin(x * 0.07) * 0.45 +
            Math.sin(z * 0.055) * 0.35 +
            Math.sin(x * 0.13 + z * 0.09) * 0.2 +
            (Math.random() - 0.5) * 0.12;
          pos.setY(i, h);
        }

        // Biome vertex colours based on distance from centre
        const dist = Math.sqrt(x * x + z * z) / (Math.max(width, depth) * 0.5);
        const ci = i * 3;
        if (dist > 0.72) {
          // Outer rim: rocky grey
          colors[ci] = 0.22;
          colors[ci + 1] = 0.20;
          colors[ci + 2] = 0.17;
        } else if (dist > 0.42) {
          // Mid ring: earthy dark green
          colors[ci] = 0.09;
          colors[ci + 1] = 0.16;
          colors[ci + 2] = 0.09;
        } else {
          // Central industrial zone: very dark with a slight teal tint
          colors[ci] = 0.06;
          colors[ci + 1] = 0.10;
          colors[ci + 2] = 0.09;
        }
      }

      geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      pos.needsUpdate = true;
      geo.computeVertexNormals();
    }

    const mat = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.92,
      metalness: 0.0,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.receiveShadow = true;
    return mesh;
  }

  static createGridOverlay(width: number, depth: number): THREE.LineSegments {
    const points: number[] = [];
    const step = 10;
    const hw = width / 2;
    const hd = depth / 2;
    for (let x = -hw; x <= hw; x += step) {
      points.push(x, 0.01, -hd, x, 0.01, hd);
    }
    for (let z = -hd; z <= hd; z += step) {
      points.push(-hw, 0.01, z, hw, 0.01, z);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
    const mat = new THREE.LineBasicMaterial({ color: 0x223322, transparent: true, opacity: 0.4 });
    return new THREE.LineSegments(geo, mat);
  }

  static createRouteArrow(): THREE.Mesh {
    const geo = new THREE.ConeGeometry(0.15, 0.4, 4);
    const mat = new THREE.MeshBasicMaterial({ color: 0x00ffff });
    return new THREE.Mesh(geo, mat);
  }

  static createSelectionRing(radius: number = 0.7): THREE.Mesh {
    const geo = new THREE.TorusGeometry(radius, 0.05, 8, 32);
    const mat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.x = Math.PI / 2;
    return mesh;
  }
}
