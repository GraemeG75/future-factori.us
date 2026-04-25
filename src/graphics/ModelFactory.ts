import * as THREE from 'three';
import { RetroMaterials } from './RetroMaterials';

export class ModelFactory {
  static createBuilding(typeId: string, level: number = 1): THREE.Group {
    const group = new THREE.Group();
    const mat = RetroMaterials.forBuilding(typeId);
    const scaleFactor = 1 + (level - 1) * 0.1;

    switch (typeId) {
      case 'wood_harvester': {
        const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.6, 8), mat);
        trunk.position.y = 0.3;
        const cone = new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.5, 8), mat);
        cone.position.y = 0.85;
        group.add(trunk, cone);
        break;
      }
      case 'coal_mine': {
        const base = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.5, 0.8), mat);
        base.position.y = 0.25;
        const chimney = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.4, 6), mat);
        chimney.position.set(0.25, 0.65, 0.25);
        group.add(base, chimney);
        break;
      }
      case 'iron_mine': {
        const base = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.6, 0.9), mat);
        base.position.y = 0.3;
        const top = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.3, 0.6), mat);
        top.position.set(0, 0.75, 0);
        top.rotation.y = Math.PI / 4;
        group.add(base, top);
        break;
      }
      case 'water_pump': {
        const base = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.3, 8), mat);
        base.position.y = 0.15;
        const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.8, 6), mat);
        pipe.position.y = 0.7;
        group.add(base, pipe);
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
        group.add(base);
        break;
      }
      case 'smelter': {
        const main = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 1.0, 8), mat);
        main.position.y = 0.5;
        const stack1 = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.4, 6), mat);
        stack1.position.set(0.2, 1.2, 0);
        const stack2 = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.4, 6), mat);
        stack2.position.set(-0.2, 1.2, 0);
        group.add(main, stack1, stack2);
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
        group.add(base);
        break;
      }
      case 'refinery': {
        const main = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.8, 8), mat);
        main.position.y = 0.4;
        const pipe = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.1, 0.1), mat);
        pipe.position.set(0.2, 0.5, 0);
        group.add(main, pipe);
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
        group.add(dome, antenna);
        break;
      }
      case 'trading_terminal': {
        const cone = new THREE.Mesh(new THREE.ConeGeometry(0.5, 0.8, 4), mat);
        cone.position.y = 0.4;
        group.add(cone);
        break;
      }
      case 'power_plant': {
        const base = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.5, 0.9), mat);
        base.position.y = 0.25;
        const fanMat = RetroMaterials.neonGlow(0xffdd00);
        for (let i = 0; i < 4; i++) {
          const fan = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.05, 0.1), fanMat);
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
        group.add(base);
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
        group.add(base);
        break;
      }
      case 'exotic_lab': {
        const base = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.3, 0.8), mat);
        base.position.y = 0.15;
        const sideMat = RetroMaterials.neonGlow(0xff44ff);
        const offsets = [[-0.4, 0, 0], [0.4, 0, 0], [0, 0, -0.4], [0, 0, 0.4]] as [number, number, number][];
        for (const [ox, oy, oz] of offsets) {
          const side = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.4, 0.15), sideMat);
          side.position.set(ox, 0.5 + oy, oz);
          group.add(side);
        }
        const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.2, 12, 12), RetroMaterials.glowing(0xff00ff, 2.0));
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

    group.scale.setScalar(scaleFactor);
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
    const pos = geo.attributes['position'];
    if (pos) {
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const z = pos.getZ(i);
        const isEdge = Math.abs(x) > width * 0.48 || Math.abs(z) > depth * 0.48;
        if (!isEdge) {
          pos.setY(i, (Math.random() - 0.5) * 0.3);
        }
      }
      pos.needsUpdate = true;
      geo.computeVertexNormals();
    }
    const mat = new THREE.MeshStandardMaterial({ color: 0x1a2a1a, roughness: 0.9, metalness: 0.0 });
    return new THREE.Mesh(geo, mat);
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
