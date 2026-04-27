import * as THREE from 'three';
import { RetroMaterials } from './RetroMaterials';
import { sampleTerrain, sampleTerrainHeight } from '../game/TerrainGeneration';

const GRID_HEIGHT_OFFSET = 0.08;

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
      wood_harvester: 0x3aa84f,
      coal_mine: 0x303236,
      iron_mine: 0xa35a34,
      water_pump: 0x2b87c9,
      silicon_extractor: 0xa5acc9,
      uranium_extractor: 0x72b843
    };
    const color = colorMap[buildingTypeId] ?? 0xffffff;
    const group = new THREE.Group();

    // Persistent terrain pad showing what resource belongs on this spot.
    const padMat = new THREE.MeshStandardMaterial({
      color,
      roughness: 0.95,
      metalness: 0.02,
      transparent: true,
      opacity: 0.85
    });

    let terrainPad: THREE.Mesh;
    switch (buildingTypeId) {
      case 'wood_harvester': {
        terrainPad = new THREE.Mesh(new THREE.CylinderGeometry(1.45, 1.75, 0.65, 12), padMat);
        terrainPad.position.y = 0.32;
        break;
      }
      case 'coal_mine': {
        terrainPad = new THREE.Mesh(new THREE.CylinderGeometry(1.55, 1.65, 0.3, 10), padMat);
        terrainPad.position.y = 0.15;
        break;
      }
      case 'iron_mine': {
        terrainPad = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.7, 0.45, 8), padMat);
        terrainPad.position.y = 0.22;
        break;
      }
      case 'water_pump': {
        terrainPad = new THREE.Mesh(new THREE.CylinderGeometry(1.65, 1.65, 0.16, 20), padMat);
        terrainPad.position.y = -0.08;
        break;
      }
      default: {
        terrainPad = new THREE.Mesh(new THREE.CylinderGeometry(1.45, 1.6, 0.35, 12), padMat);
        terrainPad.position.y = 0.17;
        break;
      }
    }
    terrainPad.name = 'spot_pad';
    terrainPad.receiveShadow = true;
    terrainPad.castShadow = true;

    // Static ground ring (non-emissive) to avoid pulse/flicker perception.
    const ringMat = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.85,
      depthWrite: false
    });
    const ring = new THREE.Mesh(new THREE.TorusGeometry(1.2, 0.1, 8, 24), ringMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.1;
    ring.name = 'spot_hint';

    // Small floating indicator above the ring
    const indicatorMat = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.9,
      depthWrite: false
    });
    const indicator = new THREE.Mesh(new THREE.OctahedronGeometry(0.22, 0), indicatorMat);
    indicator.position.y = 1.0;
    indicator.name = 'spot_hint';

    group.add(terrainPad, ring, indicator);
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

  static createSeaPlane(width: number, depth: number): THREE.Mesh {
    // Slightly rippled sea with vertex color variation for a less flat look
    const segs = 12;
    const geo = new THREE.PlaneGeometry(width, depth, segs, segs);
    geo.rotateX(-Math.PI / 2);
    const pos = geo.attributes['position'] as THREE.BufferAttribute | undefined;
    if (pos) {
      const count = pos.count;
      const colors = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) {
        const x = pos.getX(i);
        const z = pos.getZ(i);
        // Subtle depth gradient: deeper (darker) toward center-ish
        const dist = Math.sqrt((x / (width * 0.5)) ** 2 + (z / (depth * 0.5)) ** 2);
        const shallow = Math.max(0, 1 - dist * 0.7);
        const r = 0.02 + shallow * 0.02;
        const g = 0.1 + shallow * 0.06;
        const b = 0.2 + shallow * 0.08;
        colors[i * 3] = r;
        colors[i * 3 + 1] = g;
        colors[i * 3 + 2] = b;
      }
      geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    }
    const mat = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.25,
      metalness: 0.15
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.y = -0.35;
    mesh.receiveShadow = true;
    return mesh;
  }

  /**
   * World-space 1024×1024 terrain texture.  Every pixel is coloured by the actual
   * terrain biome at that world position — sandy shores, lush grass, rocky peaks, etc.
   * No tiling artefacts; the texture maps 1:1 across the whole terrain mesh.
   */
  private static buildTerrainDetailTexture(seed: number, width: number, depth: number): THREE.CanvasTexture {
    const TEX  = 1024;
    const GRID = 64;

    // Phase 1: sample terrain at GRID×GRID
    const heights   = new Float32Array(GRID * GRID);
    const moistures = new Float32Array(GRID * GRID);
    const slopes    = new Float32Array(GRID * GRID);
    const flows     = new Float32Array(GRID * GRID);
    for (let gi = 0; gi < GRID; gi++) {
      for (let gj = 0; gj < GRID; gj++) {
        const wx = (gj / (GRID - 1) - 0.5) * width;
        const wz = (gi / (GRID - 1) - 0.5) * depth;
        const sp = sampleTerrain(seed, wx, wz, width, depth);
        const id = gi * GRID + gj;
        heights[id]   = sp.height;
        moistures[id] = sp.moisture;
        slopes[id]    = sp.slope;
        flows[id]     = sp.flow;
      }
    }

    // Phase 2: per-pixel biome ImageData
    const canvas = document.createElement('canvas');
    canvas.width  = TEX;
    canvas.height = TEX;
    const ctx = canvas.getContext('2d');
    if (!ctx) return new THREE.CanvasTexture(canvas);

    const imgData = ctx.createImageData(TEX, TEX);
    const pxData  = imgData.data;

    const h2d = (ix: number, iz: number, sd: number): number => {
      let hv = Math.imul(ix, 374761393) ^ Math.imul(iz, 668265263) ^ Math.imul(sd, 700001);
      hv = Math.imul(hv ^ (hv >>> 13), 1274126177);
      hv ^= hv >>> 16;
      return (hv >>> 0) / 4294967295;
    };
    const vn = (x: number, z: number, sd: number): number => {
      const x0 = x | 0, z0 = z | 0;
      const xf = x - x0, zf = z - z0;
      const ux = xf * xf * (3 - 2 * xf);
      const uz = zf * zf * (3 - 2 * zf);
      const n00 = h2d(x0,     z0,     sd), n10 = h2d(x0 + 1, z0,     sd);
      const n01 = h2d(x0,     z0 + 1, sd), n11 = h2d(x0 + 1, z0 + 1, sd);
      return n00 + (n10 - n00) * ux + (n01 - n00) * uz + (n11 - n10 - n01 + n00) * ux * uz;
    };
    const clamp = (v: number, lo: number, hi: number) => (v < lo ? lo : v > hi ? hi : v);

    for (let py = 0; py < TEX; py++) {
      const v    = py / (TEX - 1);
      const gz   = v * (GRID - 1);
      const gz0  = Math.min(gz | 0, GRID - 2);
      const tz   = gz - gz0;
      const omtz = 1 - tz;
      for (let px = 0; px < TEX; px++) {
        const u    = px / (TEX - 1);
        const gx   = u * (GRID - 1);
        const gx0  = Math.min(gx | 0, GRID - 2);
        const tx   = gx - gx0;
        const omtx = 1 - tx;
        const i00  = gz0 * GRID + gx0;
        const w00 = omtx * omtz, w10 = tx * omtz, w01 = omtx * tz, w11 = tx * tz;
        const h  = heights[i00]   * w00 + heights[i00 + 1]        * w10 + heights[i00 + GRID]   * w01 + heights[i00 + GRID + 1]   * w11;
        const m  = moistures[i00] * w00 + moistures[i00 + 1]      * w10 + moistures[i00 + GRID] * w01 + moistures[i00 + GRID + 1] * w11;
        const sl = slopes[i00]    * w00 + slopes[i00 + 1]         * w10 + slopes[i00 + GRID]    * w01 + slopes[i00 + GRID + 1]    * w11;
        const fl = flows[i00]     * w00 + flows[i00 + 1]          * w10 + flows[i00 + GRID]     * w01 + flows[i00 + GRID + 1]     * w11;
        const wx  = u * width;
        const wz  = v * depth;
        const mc  = vn(wx * 0.22,      wz * 0.22,      seed);
        const mf  = vn(wx * 1.3 + 500, wz * 1.3 + 500, seed + 31);
        const micro = mc * 0.6 + mf * 0.4;
        let r: number, g: number, b: number;
        if (h < 0.0) {
          r = clamp( 62 + micro * 30, 0, 255);
          g = clamp( 82 + micro * 28, 0, 255);
          b = clamp( 72 + micro * 22, 0, 255);
        } else if (h < 0.08) {
          r = clamp(195 + micro * 50 - (1 - m) * 20, 0, 255);
          g = clamp(170 + micro * 38 - (1 - m) * 14, 0, 255);
          b = clamp(112 + micro * 28 - (1 - m) * 10, 0, 255);
        } else if (h < 0.55) {
          if (fl > 0.48) {
            r = clamp( 78 + micro * 30 + m * 12, 0, 255);
            g = clamp( 98 + micro * 28 + m * 18, 0, 255);
            b = clamp( 62 + micro * 18 + m *  8, 0, 255);
          } else if (m > 0.52) {
            r = clamp( 55 + micro * 30 + m * 10, 0, 255);
            g = clamp(128 + micro * 38 + m * 22, 0, 255);
            b = clamp( 42 + micro * 18 + m *  8, 0, 255);
          } else {
            r = clamp(152 + micro * 38, 0, 255);
            g = clamp(132 + micro * 30, 0, 255);
            b = clamp( 70 + micro * 22, 0, 255);
          }
        } else if (h < 1.1) {
          const t = (h - 0.55) / 0.55;
          r = clamp(108 + t * 52 + micro * 32, 0, 255);
          g = clamp( 98 + t * 30 + micro * 26, 0, 255);
          b = clamp( 68 + t * 38 + micro * 20, 0, 255);
        } else if (h < 1.7) {
          r = clamp(155 + micro * 42, 0, 255);
          g = clamp(145 + micro * 36, 0, 255);
          b = clamp(130 + micro * 30, 0, 255);
        } else {
          r = clamp(225 + micro * 25, 0, 255);
          g = clamp(230 + micro * 20, 0, 255);
          b = clamp(240 + micro * 14, 0, 255);
        }
        if (sl > 0.40) {
          const sr = clamp((sl - 0.40) / 0.45, 0, 1);
          r = r + (clamp(148 + micro * 38, 0, 255) - r) * sr;
          g = g + (clamp(138 + micro * 32, 0, 255) - g) * sr;
          b = b + (clamp(122 + micro * 26, 0, 255) - b) * sr;
        }
        const idx = (py * TEX + px) << 2;
        pxData[idx]     = r;
        pxData[idx + 1] = g;
        pxData[idx + 2] = b;
        pxData[idx + 3] = 255;
      }
    }
    ctx.putImageData(imgData, 0, 0);

    // Phase 3: multiply-blend pebble/grain overlay
    const rng = (i: number): number => {
      let hv = Math.imul(i, 374761393) ^ Math.imul(seed, 700001);
      hv = Math.imul(hv ^ (hv >>> 13), 1274126177);
      hv ^= hv >>> 16;
      return (hv >>> 0) / 4294967295;
    };
    ctx.globalCompositeOperation = 'multiply';
    for (let i = 0; i < 3000; i++) {
      const ppx = rng(i * 6 + 10000) * TEX;
      const ppy = rng(i * 6 + 10001) * TEX;
      const rx  = 1.0 + rng(i * 6 + 10002) * 4.5;
      const ry  = rx * (0.40 + rng(i * 6 + 10003) * 0.55);
      const ang = rng(i * 6 + 10004) * Math.PI;
      const lum = 0.72 + rng(i * 6 + 10005) * 0.25;
      const li  = Math.floor(lum * 255);
      ctx.fillStyle = `rgb(${li},${li},${li})`;
      ctx.beginPath();
      ctx.ellipse(ppx, ppy, rx, ry, ang, 0, Math.PI * 2);
      ctx.fill();
    }
    for (let i = 0; i < 18000; i++) {
      const ppx = rng(i * 3 + 60000) * TEX;
      const ppy = rng(i * 3 + 60001) * TEX;
      const lum = 0.82 + rng(i * 3 + 60002) * 0.18;
      const li  = Math.floor(lum * 255);
      ctx.fillStyle = `rgba(${li},${li},${li},0.45)`;
      ctx.fillRect(ppx, ppy, 1.2, 1.2);
    }
    ctx.globalCompositeOperation = 'source-over';
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.ClampToEdgeWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    return tex;
  }

  static createTerrain(width: number, depth: number, divisions: number, seed: number = 1337): THREE.Mesh {
    const geo = new THREE.PlaneGeometry(width, depth, divisions, divisions);
    geo.rotateX(-Math.PI / 2);
    const pos = geo.attributes['position'] as THREE.BufferAttribute | undefined;
    if (pos) {
      for (let i = 0; i < pos.count; i++) {
        pos.setY(i, sampleTerrainHeight(seed, pos.getX(i), pos.getZ(i), width, depth));
      }
      pos.needsUpdate = true;
      geo.computeVertexNormals();
    }
    const worldTex = ModelFactory.buildTerrainDetailTexture(seed, width, depth);
    const mat = new THREE.MeshStandardMaterial({
      map: worldTex,
      roughness: 0.88,
      metalness: 0.0
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.receiveShadow = true;
    return mesh;
  }

  static createGridOverlay(width: number, depth: number, step: number = 10, seed: number = 1337): THREE.LineSegments {
    const points: number[] = [];
    const hw = width / 2;
    const hd = depth / 2;
    const heightCache = new Map<string, number>();
    const getGridHeight = (x: number, z: number): number => {
      const key = `${x},${z}`;
      const cached = heightCache.get(key);
      if (cached !== undefined) return cached;
      const height = sampleTerrainHeight(seed, x, z, width, depth) + GRID_HEIGHT_OFFSET;
      heightCache.set(key, height);
      return height;
    };
    for (let x = -hw; x <= hw; x += step) {
      for (let z = -hd; z < hd; z += step) {
        const nextZ = Math.min(hd, z + step);
        points.push(x, getGridHeight(x, z), z, x, getGridHeight(x, nextZ), nextZ);
      }
    }
    for (let z = -hd; z <= hd; z += step) {
      for (let x = -hw; x < hw; x += step) {
        const nextX = Math.min(hw, x + step);
        points.push(x, getGridHeight(x, z), z, nextX, getGridHeight(nextX, z), z);
      }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
    const mat = new THREE.LineBasicMaterial({ color: 0x29412e, transparent: true, opacity: 0.28 });
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
