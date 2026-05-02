import * as THREE from 'three';
import { RetroMaterials } from './RetroMaterials';
import { loadVox } from './VoxLoader';
import { buildTerrainHeightmap, sampleTerrainHeight, type HeightmapCell, type TerrainHeightmap } from '../game/TerrainGeneration';
import {
  GRID_HEIGHT_OFFSET,
  TERRAIN_COAST,
  TERRAIN_SEA_LEVEL,
  TERRAIN_BASE_HEIGHT,
  TERRAIN_TEXTURE_REPEAT,
  MIN_TERRAIN_COLUMNS,
  MIN_TERRAIN_ROWS,
  TERRAIN_SIDE_COLOR_BRIGHTNESS,
  TERRAIN_SIDE_SATURATION_OFFSET,
  TERRAIN_SIDE_LIGHTNESS_OFFSET,
  TERRAIN_SIDE_ALT_STRIPE,
  TERRAIN_SIDE_ALT_DARKEN,
  TERRAIN_VOXEL_TOP_VARIATION,
  TERRAIN_VOXEL_TOP_GRID_STRENGTH,
  TERRAIN_VOXEL_BAND_HEIGHT,
  TERRAIN_VOXEL_BAND_SATURATION,
  TERRAIN_VOXEL_BAND_LIGHTNESS,
  TERRAIN_TOP_BEVEL_STRENGTH,
  TERRAIN_TOP_BEVEL_DIRECTION_X,
  TERRAIN_TOP_BEVEL_DIRECTION_Z,
  WATER_STYLE
} from '../consts/terrain';

export class ModelFactory {
  private static terrainTexture: THREE.CanvasTexture | null = null;
  private static waterTexture: THREE.CanvasTexture | null = null;

  private static colorFromRgb(r: number, g: number, b: number): THREE.Color {
    return new THREE.Color(r / 255, g / 255, b / 255);
  }

  private static mixColor(a: THREE.Color, b: THREE.Color, t: number): THREE.Color {
    return a.clone().lerp(b, THREE.MathUtils.clamp(t, 0, 1));
  }

  // ---------------------------------------------------------------------------
  // Biome palette tables — each zone has a list of [r,g,b] stops that are
  // indexed by voxel step within that zone, giving distinct stepped colour bands.
  // ---------------------------------------------------------------------------
  private static readonly BIOME_BEACH: Array<[number, number, number]> = [
    [238, 214, 158], // wet wash
    [228, 202, 142], // dry sand
    [218, 190, 126], // shadow hollow
    [242, 220, 168], // bright crest
    [230, 208, 148], // mid tone
    [210, 184, 118]  // compact sand
  ];
  private static readonly BIOME_LOWLAND: Array<[number, number, number]> = [
    [148, 136, 80],  // dry straw
    [118, 152, 80],  // scrub green
    [96,  148, 68],  // grass
    [76,  132, 64],  // lush grass
    [108, 158, 82],  // bright meadow
    [132, 142, 76]   // olive flat
  ];
  private static readonly BIOME_MIDLAND: Array<[number, number, number]> = [
    [110, 130, 78],  // dark olive
    [92,  118, 62],  // deep moss
    [128, 148, 88],  // bright moss
    [86,  112, 56],  // dense canopy
    [104, 126, 72],  // mixed green
    [118, 138, 82]   // light canopy
  ];
  private static readonly BIOME_HIGHLAND: Array<[number, number, number]> = [
    [132, 114, 94],  // warm stone
    [118, 102, 82],  // dark rock
    [148, 130, 108], // light slate
    [106, 94,  76],  // shadow rock
    [142, 124, 100], // mid cliff
    [158, 138, 114]  // sun-bleached rock
  ];
  private static readonly BIOME_ALPINE: Array<[number, number, number]> = [
    [194, 202, 218], // blue shadow snow
    [220, 228, 240], // bright snow
    [206, 210, 228], // grey-white
    [232, 236, 248], // glare crest
    [188, 196, 214], // icy shade
    [216, 222, 238]  // soft snow
  ];

  private static sampleBiomePalette(
    palette: Array<[number, number, number]>,
    step: number
  ): THREE.Color {
    // step is a float — must floor before using as index
    const safeStep = isFinite(step) ? step : 0;
    const floored = Math.floor(safeStep);
    const idx = ((floored % palette.length) + palette.length) % palette.length;
    const next = (idx + 1) % palette.length;
    const frac = safeStep - floored;
    const a = palette[idx] ?? palette[0]!;
    const b = palette[next] ?? palette[0]!;
    return ModelFactory.colorFromRgb(
      a[0] + (b[0] - a[0]) * frac,
      a[1] + (b[1] - a[1]) * frac,
      a[2] + (b[2] - a[2]) * frac
    );
  }

  private static getTerrainTopColor(cell: HeightmapCell): THREE.Color {
    const rock       = ModelFactory.colorFromRgb(126, 110, 94);
    const wetland    = ModelFactory.colorFromRgb(82,  120, 76);
    const moistureBlend = cell.moisture * 0.55 + cell.flow * 0.45;
    const h = cell.quantizedHeight;

    let color: THREE.Color;

    if (h < -0.14) {
      // Shallow submerged shelf — dark slate, no stepped palette needed
      color = ModelFactory.mixColor(
        ModelFactory.colorFromRgb(52, 68, 94),
        ModelFactory.colorFromRgb(80, 104, 120),
        moistureBlend
      );
    } else if (h < TERRAIN_SEA_LEVEL + TERRAIN_COAST.blendHeightRange) {
      // ---- BEACH ZONE ----
      const coastDelta = h - TERRAIN_SEA_LEVEL;
      const bandStep   = coastDelta / Math.max(0.01, TERRAIN_VOXEL_BAND_HEIGHT);
      color = ModelFactory.sampleBiomePalette(ModelFactory.BIOME_BEACH, bandStep * 1.5);
      if (cell.slope >= TERRAIN_COAST.rockySlopeStart) {
        const shoreRock    = ModelFactory.colorFromRgb(112, 106, 98);
        const rockyStrength = ModelFactory.clamp01(
          (cell.slope - TERRAIN_COAST.rockySlopeStart) / TERRAIN_COAST.rockySlopeRange
        );
        const shoreBlend = ModelFactory.smoothstep(0.0, TERRAIN_COAST.blendHeightRange, Math.max(0, coastDelta));
        color.lerp(shoreRock, rockyStrength * (1 - shoreBlend * TERRAIN_COAST.rockyFadeByHeight));
      }
    } else if (h < 1.4) {
      // ---- LOWLAND ZONE ----
      const bandStep = (h - (TERRAIN_SEA_LEVEL + TERRAIN_COAST.blendHeightRange)) / Math.max(0.01, TERRAIN_VOXEL_BAND_HEIGHT);
      if (cell.flow > 0.48) {
        color = ModelFactory.mixColor(
          wetland,
          ModelFactory.sampleBiomePalette(ModelFactory.BIOME_LOWLAND, bandStep + 3),
          0.55
        );
      } else {
        color = ModelFactory.sampleBiomePalette(ModelFactory.BIOME_LOWLAND, bandStep * moistureBlend * 2.0);
      }
    } else if (h < 3.4) {
      // ---- MIDLAND ZONE ----
      const bandStep = (h - 1.4) / Math.max(0.01, TERRAIN_VOXEL_BAND_HEIGHT);
      color = ModelFactory.sampleBiomePalette(ModelFactory.BIOME_MIDLAND, bandStep);
      if (cell.flow > 0.55 && h < 3.2) {
        color.lerp(ModelFactory.colorFromRgb(72, 118, 80), 0.22);
      }
    } else if (h < 6.2) {
      // ---- HIGHLAND / CLIFF ZONE ----
      const bandStep = (h - 3.4) / Math.max(0.01, TERRAIN_VOXEL_BAND_HEIGHT);
      color = ModelFactory.sampleBiomePalette(ModelFactory.BIOME_HIGHLAND, bandStep);
    } else {
      // ---- ALPINE / SNOW ZONE ----
      const bandStep = (h - 6.2) / Math.max(0.01, TERRAIN_VOXEL_BAND_HEIGHT);
      color = ModelFactory.sampleBiomePalette(ModelFactory.BIOME_ALPINE, bandStep);
    }

    // Slope-rock overlay applies to all zones except beach/shelf
    if (h > TERRAIN_SEA_LEVEL + TERRAIN_COAST.blendHeightRange && cell.slope > 0.30) {
      color.lerp(rock, Math.min(0.85, (cell.slope - 0.30) / 0.40));
    }

    return color.offsetHSL(0, 0, (cell.detail - 0.5) * 0.10);
  }

  private static clamp01(v: number): number {
    return Math.min(1, Math.max(0, v));
  }

  private static smoothstep(edge0: number, edge1: number, x: number): number {
    if (edge0 === edge1) {
      return x < edge0 ? 0 : 1;
    }
    const t = ModelFactory.clamp01((x - edge0) / (edge1 - edge0));
    return t * t * (3 - 2 * t);
  }

  private static applyVoxelHeightBanding(color: THREE.Color, height: number): THREE.Color {
    // Now that getTerrainTopColor already returns biome-palette stepped colours,
    // this pass only adds a subtle lightness pulse per voxel row so the stair-step
    // faces read clearly even in flat zones, without overriding the palette hues.
    const safeBandHeight = Math.max(TERRAIN_VOXEL_BAND_HEIGHT, 0.001);
    const step = Math.floor((height - TERRAIN_SEA_LEVEL) / safeBandHeight);
    const even = (step & 1) === 0;
    const stepFrac = (height - TERRAIN_SEA_LEVEL) / safeBandHeight - step;
    // Ramp within the step: bright at top, darker toward base
    const intraRamp = ModelFactory.smoothstep(0.0, 1.0, stepFrac);
    const lightPulse = (even ? 1 : -1) * (intraRamp - 0.5) * TERRAIN_VOXEL_BAND_LIGHTNESS;
    const satPulse   = (even ? 1 : -1) * TERRAIN_VOXEL_BAND_SATURATION * 0.4;
    return color.offsetHSL(0, satPulse, lightPulse);
  }

  private static buildNoiseTexture(base: number, range: number, accentChance: number = 0): THREE.CanvasTexture {
    const size = 128;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return new THREE.CanvasTexture(canvas);
    }

    const image = ctx.createImageData(size, size);
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const idx = (y * size + x) * 4;
        const wave = Math.sin((x + y) * 0.18) * 0.5 + Math.cos((x - y) * 0.11) * 0.5;
        const grain = ((x * 13 + y * 17 + x * y * 3) % 97) / 96;
        const sparkle = ((x * 7 + y * 19) % 31) / 30;
        let value = base + wave * range * 0.35 + grain * range * 0.65;
        if (accentChance > 0 && sparkle > 1 - accentChance) {
          value += range * 0.8;
        }
        const channel = Math.max(0, Math.min(255, Math.round(value)));
        image.data[idx] = channel;
        image.data[idx + 1] = channel;
        image.data[idx + 2] = channel;
        image.data[idx + 3] = 255;
      }
    }

    ctx.putImageData(image, 0, 0);
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }

  private static buildTerrainDetailTexture(): THREE.CanvasTexture {
    const size = 128;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return new THREE.CanvasTexture(canvas);
    }

    const image = ctx.createImageData(size, size);
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const idx = (y * size + x) * 4;
        // Multi-frequency wave interference for organic patching
        const coarse = Math.sin(x * 0.072 + y * 0.053) * 0.5 + Math.cos(x * 0.041 - y * 0.088) * 0.5;
        const medium = Math.sin(x * 0.19 + y * 0.14 ) * 0.5 + Math.cos(x * 0.11 - y * 0.17 ) * 0.5;
        const fine = ((x * 17 + y * 31 + x * y * 7) % 97) / 96;
        const t = Math.max(0, Math.min(1, coarse * 0.4 + medium * 0.35 + fine * 0.25));

        // Warm sandy-ochre palette: bright enough so multiplication doesn't over-darken
        // t=0 → sandy warm (214, 192, 144), t=1 → earthy olive-brown (162, 152, 96)
        const r = Math.round(214 - t * 52 + (fine - 0.5) * 22);
        const g = Math.round(192 - t * 40 + (fine - 0.5) * 22);
        const b = Math.round(144 - t * 48 + (fine - 0.5) * 14);
        image.data[idx] = Math.max(130, Math.min(245, r));
        image.data[idx + 1] = Math.max(118, Math.min(228, g));
        image.data[idx + 2] = Math.max(72, Math.min(175, b));
        image.data[idx + 3] = 255;
      }
    }

    ctx.putImageData(image, 0, 0);
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }

  private static getTerrainTexture(): THREE.CanvasTexture {
    if (!ModelFactory.terrainTexture) {
      ModelFactory.terrainTexture = ModelFactory.buildTerrainDetailTexture();
    }
    return ModelFactory.terrainTexture;
  }

  private static getWaterTexture(): THREE.CanvasTexture {
    if (!ModelFactory.waterTexture) {
      ModelFactory.waterTexture = ModelFactory.buildNoiseTexture(WATER_STYLE.textureBase, WATER_STYLE.textureRange, 0);
    }
    return ModelFactory.waterTexture;
  }

  private static pushQuad(
    positions: number[],
    normals: number[],
    colors: number[],
    uvs: number[],
    a: THREE.Vector3,
    b: THREE.Vector3,
    c: THREE.Vector3,
    d: THREE.Vector3,
    normal: THREE.Vector3,
    color: THREE.Color | [THREE.Color, THREE.Color, THREE.Color, THREE.Color],
    uvScaleX: number,
    uvScaleY: number
  ): void {
    const vertices = [a, b, c, a, c, d];
    const quadUvs = [
      [0, 0],
      [uvScaleX, 0],
      [uvScaleX, uvScaleY],
      [0, 0],
      [uvScaleX, uvScaleY],
      [0, uvScaleY]
    ] as const;
    const quadColorIndices = [0, 1, 2, 0, 2, 3] as const;

    for (let i = 0; i < vertices.length; i++) {
      const vertex = vertices[i]!;
      positions.push(vertex.x, vertex.y, vertex.z);
      normals.push(normal.x, normal.y, normal.z);
      const vertexColor = Array.isArray(color) ? color[quadColorIndices[i]!]! : color;
      colors.push(vertexColor.r, vertexColor.g, vertexColor.b);
      uvs.push(quadUvs[i]![0], quadUvs[i]![1]);
    }
  }

  private static buildGeometryFromHeightmap(heightmap: TerrainHeightmap): THREE.BufferGeometry {
    const positions: number[] = [];
    const normals: number[] = [];
    const colors: number[] = [];
    const uvs: number[] = [];
    const normalUp = new THREE.Vector3(0, 1, 0);
    const normalNorth = new THREE.Vector3(0, 0, -1);
    const normalSouth = new THREE.Vector3(0, 0, 1);
    const normalEast = new THREE.Vector3(1, 0, 0);
    const normalWest = new THREE.Vector3(-1, 0, 0);
    const getCell = (column: number, row: number): HeightmapCell | null => {
      if (column < 0 || row < 0 || column >= heightmap.columns || row >= heightmap.rows) {
        return null;
      }
      const index = row * heightmap.columns + column;
      if (index < 0 || index >= heightmap.cells.length) {
        return null;
      }
      return heightmap.cells[index] ?? null;
    };

    for (const cell of heightmap.cells) {
      const topBaseColor = ModelFactory.getTerrainTopColor(cell);
      const topColor = ModelFactory.applyVoxelHeightBanding(topBaseColor.clone(), cell.quantizedHeight);
      const steppedBand = Math.abs((cell.quantizedHeight / Math.max(0.001, heightmap.voxelHeight)) % 2);
      const sideBandShade = steppedBand > 1 ? 1 : steppedBand;
      const sideColor = topColor
        .clone()
        .multiplyScalar(TERRAIN_SIDE_COLOR_BRIGHTNESS)
        .offsetHSL(
          0,
          TERRAIN_SIDE_SATURATION_OFFSET,
          TERRAIN_SIDE_LIGHTNESS_OFFSET - TERRAIN_SIDE_ALT_DARKEN * sideBandShade
        );
      const topGrid = ((cell.column + cell.row) & 1) === 0 ? 1 : -1;
      const topStepNoise = Math.sin((cell.column + cell.detail * 8) * 0.85) * Math.cos((cell.row + cell.moisture * 8) * 0.9);
      const topColorAccented = topColor
        .clone()
        .offsetHSL(
          0,
          TERRAIN_SIDE_ALT_STRIPE * topGrid,
          TERRAIN_VOXEL_TOP_VARIATION * topStepNoise + TERRAIN_VOXEL_TOP_GRID_STRENGTH * topGrid * 0.5
        );
      const x0 = cell.x - heightmap.cellWidth * 0.5;
      const x1 = cell.x + heightmap.cellWidth * 0.5;
      const z0 = cell.z - heightmap.cellDepth * 0.5;
      const z1 = cell.z + heightmap.cellDepth * 0.5;
      const topY = cell.quantizedHeight;

      const topLightDir = new THREE.Vector2(TERRAIN_TOP_BEVEL_DIRECTION_X, TERRAIN_TOP_BEVEL_DIRECTION_Z).normalize();
      const bevelCorners = [
        new THREE.Vector2(-1, -1),
        new THREE.Vector2(-1, 1),
        new THREE.Vector2(1, 1),
        new THREE.Vector2(1, -1)
      ];
      const topCornerColors: [THREE.Color, THREE.Color, THREE.Color, THREE.Color] = [
        topColorAccented.clone(),
        topColorAccented.clone(),
        topColorAccented.clone(),
        topColorAccented.clone()
      ];
      for (let i = 0; i < bevelCorners.length; i++) {
        const corner = bevelCorners[i]!;
        const bevelDot = corner.dot(topLightDir) * 0.7071;
        topCornerColors[i]!.offsetHSL(0, 0, bevelDot * TERRAIN_TOP_BEVEL_STRENGTH);
      }

      ModelFactory.pushQuad(
        positions,
        normals,
        colors,
        uvs,
        new THREE.Vector3(x0, topY, z0),
        new THREE.Vector3(x0, topY, z1),
        new THREE.Vector3(x1, topY, z1),
        new THREE.Vector3(x1, topY, z0),
        normalUp,
        topCornerColors,
        heightmap.cellWidth / TERRAIN_TEXTURE_REPEAT,
        heightmap.cellDepth / TERRAIN_TEXTURE_REPEAT
      );

      // North wall (faces -Z): a→b goes up, a→d goes +X → cross product = -Z ✓
      const northHeight = getCell(cell.column, cell.row - 1)?.quantizedHeight ?? TERRAIN_BASE_HEIGHT;
      if (topY > northHeight) {
        ModelFactory.pushQuad(
          positions,
          normals,
          colors,
          uvs,
          new THREE.Vector3(x0, TERRAIN_BASE_HEIGHT, z0),
          new THREE.Vector3(x0, topY, z0),
          new THREE.Vector3(x1, topY, z0),
          new THREE.Vector3(x1, TERRAIN_BASE_HEIGHT, z0),
          normalNorth,
          sideColor,
          (topY - TERRAIN_BASE_HEIGHT) / TERRAIN_TEXTURE_REPEAT,
          heightmap.cellWidth / TERRAIN_TEXTURE_REPEAT
        );
      }

      // South wall (faces +Z): a→b goes up, a→d goes -X → cross product = +Z ✓
      const southHeight = getCell(cell.column, cell.row + 1)?.quantizedHeight ?? TERRAIN_BASE_HEIGHT;
      if (topY > southHeight) {
        ModelFactory.pushQuad(
          positions,
          normals,
          colors,
          uvs,
          new THREE.Vector3(x1, TERRAIN_BASE_HEIGHT, z1),
          new THREE.Vector3(x1, topY, z1),
          new THREE.Vector3(x0, topY, z1),
          new THREE.Vector3(x0, TERRAIN_BASE_HEIGHT, z1),
          normalSouth,
          sideColor,
          (topY - TERRAIN_BASE_HEIGHT) / TERRAIN_TEXTURE_REPEAT,
          heightmap.cellWidth / TERRAIN_TEXTURE_REPEAT
        );
      }

      // East wall (faces +X): a→b goes up, a→d goes +Z → cross product = +X ✓
      const eastHeight = getCell(cell.column + 1, cell.row)?.quantizedHeight ?? TERRAIN_BASE_HEIGHT;
      if (topY > eastHeight) {
        ModelFactory.pushQuad(
          positions,
          normals,
          colors,
          uvs,
          new THREE.Vector3(x1, TERRAIN_BASE_HEIGHT, z0),
          new THREE.Vector3(x1, topY, z0),
          new THREE.Vector3(x1, topY, z1),
          new THREE.Vector3(x1, TERRAIN_BASE_HEIGHT, z1),
          normalEast,
          sideColor,
          (topY - TERRAIN_BASE_HEIGHT) / TERRAIN_TEXTURE_REPEAT,
          heightmap.cellDepth / TERRAIN_TEXTURE_REPEAT
        );
      }

      // West wall (faces -X): a→b goes up, a→d goes -Z → cross product = -X ✓
      const westHeight = getCell(cell.column - 1, cell.row)?.quantizedHeight ?? TERRAIN_BASE_HEIGHT;
      if (topY > westHeight) {
        ModelFactory.pushQuad(
          positions,
          normals,
          colors,
          uvs,
          new THREE.Vector3(x0, TERRAIN_BASE_HEIGHT, z1),
          new THREE.Vector3(x0, topY, z1),
          new THREE.Vector3(x0, topY, z0),
          new THREE.Vector3(x0, TERRAIN_BASE_HEIGHT, z0),
          normalWest,
          sideColor,
          (topY - TERRAIN_BASE_HEIGHT) / TERRAIN_TEXTURE_REPEAT,
          heightmap.cellDepth / TERRAIN_TEXTURE_REPEAT
        );
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geometry.computeBoundingBox();
    geometry.computeBoundingSphere();
    return geometry;
  }

  /**
   * Loads the building model from its .vox file and applies level-up effects.
   * Returns a Promise so the caller can place the group once the asset is ready.
   */
  static async createBuilding(typeId: string, level: number = 1): Promise<THREE.Group> {
    const url = `/models/buildings/${typeId}.vox`;
    let group: THREE.Group;
    try {
      group = await loadVox(url);
    } catch {
      // Fallback: plain box so the game still runs if the file is missing.
      group = new THREE.Group();
      const fallback = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.5, 0.8), RetroMaterials.forBuilding(typeId));
      fallback.position.y = 0.25;
      group.add(fallback);
    }

    const scaleFactor = 1 + (level - 1) * 0.15;

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
    const segments = 72;
    const geo = new THREE.PlaneGeometry(width, depth, segments, segments);
    geo.rotateX(-Math.PI / 2);
    const pos = geo.attributes['position'] as THREE.BufferAttribute | undefined;
    if (pos) {
      const count = pos.count;
      const colors = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) {
        const x = pos.getX(i);
        const z = pos.getZ(i);
        const radial = Math.min(1, Math.sqrt((x / (width * 0.5)) ** 2 + (z / (depth * 0.5)) ** 2));
        pos.setY(i, -0.42);
        const deep = 1 - radial * 0.75;
        colors[i * 3] = 0.04 + deep * 0.06;
        colors[i * 3 + 1] = 0.18 + deep * 0.14;
        colors[i * 3 + 2] = 0.28 + deep * 0.24;
      }
      pos.needsUpdate = true;
      geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      geo.computeVertexNormals();
    }

    const waterTexture = ModelFactory.getWaterTexture();
    waterTexture.repeat.set(WATER_STYLE.textureRepeat, WATER_STYLE.textureRepeat);
    const mat = new THREE.MeshStandardMaterial({
      color: 0x2a6f8f,
      vertexColors: true,
      map: waterTexture,
      transparent: true,
      opacity: 0.95,
      emissive: new THREE.Color(0x0f4a63),
      emissiveIntensity: 0.14,
      roughness: 0.52,
      metalness: 0.1
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.y = TERRAIN_SEA_LEVEL;
    mesh.receiveShadow = true;
    return mesh;
  }

  static createTerrainClutter(heightmap: TerrainHeightmap, seed: number = 1337): THREE.Group {
    const group = new THREE.Group();
    group.name = 'clutter';
    const rng = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };
    
    // Tree instances
    const treeCount = Math.floor((heightmap.columns * heightmap.rows) / 12);
    const treeGeo = new THREE.ConeGeometry(0.3, 1.2, 5);
    treeGeo.translate(0, 0.6, 0);
    const treeMat = new THREE.MeshStandardMaterial({ color: 0x3e8446, roughness: 0.9, flatShading: true });
    const treeInstanced = new THREE.InstancedMesh(treeGeo, treeMat, treeCount);
    treeInstanced.castShadow = true;
    treeInstanced.receiveShadow = true;
    
    // Snow instances
    const snowCount = Math.floor((heightmap.columns * heightmap.rows) / 10);
    const snowGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.05, 6);
    const snowMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9, flatShading: true });
    const snowInstanced = new THREE.InstancedMesh(snowGeo, snowMat, snowCount);
    snowInstanced.castShadow = true;
    snowInstanced.receiveShadow = true;

    // Rock instances
    const rockCount = Math.floor((heightmap.columns * heightmap.rows) / 18);
    const rockGeo = new THREE.DodecahedronGeometry(0.25, 0);
    rockGeo.translate(0, 0.2, 0);
    const rockMat = new THREE.MeshStandardMaterial({ color: 0x8a8a8a, roughness: 0.8, flatShading: true });
    const rockInstanced = new THREE.InstancedMesh(rockGeo, rockMat, rockCount);
    rockInstanced.castShadow = true;
    rockInstanced.receiveShadow = true;
    
    let treeIndex = 0;
    let rockIndex = 0;
    let snowIndex = 0;
    const dummy = new THREE.Object3D();
    
    for (const cell of heightmap.cells) {
      if (cell.quantizedHeight < 0.5 || cell.slope > 0.4) continue;
      
      if (cell.moisture > 0.6 && rng() > 0.6 && treeIndex < treeCount) {
        dummy.position.set(cell.x + (rng() - 0.5) * heightmap.cellWidth, cell.quantizedHeight, cell.z + (rng() - 0.5) * heightmap.cellDepth);
        dummy.scale.setScalar(0.7 + rng() * 0.6);
        dummy.updateMatrix();
        treeInstanced.setMatrixAt(treeIndex++, dummy.matrix);
      } else if (cell.quantizedHeight > 4.0 && rng() > 0.7 && snowIndex < snowCount) {
        dummy.position.set(cell.x + (rng() - 0.5) * heightmap.cellWidth, cell.quantizedHeight + 0.02, cell.z + (rng() - 0.5) * heightmap.cellDepth);
        dummy.scale.set(1.0 + rng() * 1.0, 1.0, 1.0 + rng() * 1.0);
        dummy.rotation.y = rng() * Math.PI * 2;
        dummy.updateMatrix();
        snowInstanced.setMatrixAt(snowIndex++, dummy.matrix);
      } else if (rng() > 0.95 && rockIndex < rockCount) {
        dummy.position.set(cell.x + (rng() - 0.5) * heightmap.cellWidth, cell.quantizedHeight, cell.z + (rng() - 0.5) * heightmap.cellDepth);
        dummy.scale.setScalar(0.5 + rng() * 1.5);
        dummy.rotation.y = rng() * Math.PI * 2;
        dummy.updateMatrix();
        rockInstanced.setMatrixAt(rockIndex++, dummy.matrix);
      }
    }
    treeInstanced.count = treeIndex;
    rockInstanced.count = rockIndex;
    treeInstanced.instanceMatrix.needsUpdate = true;
    rockInstanced.instanceMatrix.needsUpdate = true;
    snowInstanced.instanceMatrix.needsUpdate = true;
    snowInstanced.count = snowIndex;
    
    group.add(treeInstanced);
    group.add(rockInstanced);
    group.add(snowInstanced);
    return group;
  }

  static createTerrain(width: number, depth: number, divisions: number, seed: number = 1337, voxelHeight: number = 0.10): THREE.Mesh {
    const columns = Math.max(divisions * 2, MIN_TERRAIN_COLUMNS);
    const rows = Math.max(Math.round((depth / width) * columns), MIN_TERRAIN_ROWS);
    const heightmap = buildTerrainHeightmap(seed, width, depth, columns, rows, voxelHeight);
    const geo = ModelFactory.buildGeometryFromHeightmap(heightmap);
    const terrainTexture = ModelFactory.getTerrainTexture();
    terrainTexture.repeat.set(22, 22);
    const mat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      vertexColors: true,
      map: terrainTexture,
      flatShading: true,
      emissive: new THREE.Color(0x1c1008), // warm dark amber
      emissiveIntensity: 0.22,
      roughness: 0.88,
      metalness: 0.04
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData['heightmap'] = heightmap;
    return mesh;
  }

  static flattenTerrainAt(terrainMesh: THREE.Mesh, worldX: number, worldZ: number, radius: number = 5): void {
    const heightmap = terrainMesh.userData['heightmap'] as TerrainHeightmap | undefined;
    if (!heightmap) {
      return;
    }

    const centerCol = Math.min(heightmap.columns - 1, Math.max(0, Math.floor((worldX + heightmap.width * 0.5) / heightmap.cellWidth)));
    const centerRow = Math.min(heightmap.rows - 1, Math.max(0, Math.floor((worldZ + heightmap.depth * 0.5) / heightmap.cellDepth)));
    const centerCell = heightmap.cells[centerRow * heightmap.columns + centerCol];
    if (!centerCell) {
      return;
    }
    const targetHeight = centerCell.quantizedHeight;

    const colRadius = Math.ceil(radius / heightmap.cellWidth);
    const rowRadius = Math.ceil(radius / heightmap.cellDepth);
    for (let dr = -rowRadius; dr <= rowRadius; dr++) {
      for (let dc = -colRadius; dc <= colRadius; dc++) {
        const col = centerCol + dc;
        const row = centerRow + dr;
        if (col < 0 || row < 0 || col >= heightmap.columns || row >= heightmap.rows) {
          continue;
        }
        const cell = heightmap.cells[row * heightmap.columns + col];
        if (!cell) {
          continue;
        }
        const dist = Math.sqrt((cell.x - worldX) ** 2 + (cell.z - worldZ) ** 2);
        if (dist <= radius) {
          cell.quantizedHeight = targetHeight;
        }
      }
    }

    const newGeo = ModelFactory.buildGeometryFromHeightmap(heightmap);
    terrainMesh.geometry.dispose();
    terrainMesh.geometry = newGeo;
  }

  static createGridOverlay(width: number, depth: number, step: number = 10, seed: number = 1337): THREE.LineSegments {
    const points: number[] = [];
    const hw = width / 2;
    const hd = depth / 2;
    const heightCache = new Map<string, number>();
    const getGridHeight = (x: number, z: number): number => {
      const key = `${x},${z}`;
      const cached = heightCache.get(key);
      if (cached !== undefined) {
        return cached;
      }
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
