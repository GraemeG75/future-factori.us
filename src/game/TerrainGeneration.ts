import { TERRAIN_HEIGHT_SCALE } from '../consts/terrain';

export type { TerrainSample, HeightmapCell, TerrainHeightmap } from '../interfaces/terrain';
import type { TerrainSample, HeightmapCell, TerrainHeightmap } from '../interfaces/terrain';

function clamp01(v: number): number {
  return Math.min(1, Math.max(0, v));
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  if (edge0 === edge1) {
    return x < edge0 ? 0 : 1;
  }
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

function hash2D(ix: number, iz: number, seed: number): number {
  let h = (ix * 374761393) ^ (iz * 668265263) ^ (seed * 700001);
  h = (h ^ (h >>> 13)) * 1274126177;
  h ^= h >>> 16;
  return (h >>> 0) / 4294967295;
}

function valueNoise(x: number, z: number, seed: number): number {
  const x0 = Math.floor(x);
  const z0 = Math.floor(z);
  const xf = x - x0;
  const zf = z - z0;

  const u = xf * xf * (3 - 2 * xf);
  const v = zf * zf * (3 - 2 * zf);

  const n00 = hash2D(x0, z0, seed);
  const n10 = hash2D(x0 + 1, z0, seed);
  const n01 = hash2D(x0, z0 + 1, seed);
  const n11 = hash2D(x0 + 1, z0 + 1, seed);

  const nx0 = n00 + (n10 - n00) * u;
  const nx1 = n01 + (n11 - n01) * u;
  return nx0 + (nx1 - nx0) * v;
}

function fbm(x: number, z: number, octaves: number, seed: number): number {
  let sum = 0;
  let amp = 1;
  let freq = 1;
  let norm = 0;
  for (let i = 0; i < octaves; i++) {
    sum += valueNoise(x * freq, z * freq, seed + i * 17) * amp;
    norm += amp;
    amp *= 0.5;
    freq *= 2;
  }
  return norm > 0 ? sum / norm : 0;
}

export function quantizeTerrainHeight(height: number, voxelHeight: number): number {
  if (voxelHeight <= 0) {
    return height;
  }
  return Math.round(height / voxelHeight) * voxelHeight;
}

export function sampleTerrainHeight(seed: number, x: number, z: number, width: number = 200, depth: number = 200): number {
  const warpX = x + (fbm(x * 0.025, z * 0.025, 3, seed + 91) - 0.5) * 24;
  const warpZ = z + (fbm(x * 0.025 + 200, z * 0.025 + 200, 3, seed + 137) - 0.5) * 24;

  const continent = fbm(warpX * 0.008, warpZ * 0.008, 5, seed + 11);
  const detail = fbm(warpX * 0.055, warpZ * 0.055, 4, seed + 23);
  const erosionNoise = fbm(warpX * 0.028 + 400, warpZ * 0.028 + 400, 3, seed + 47);
  const ridge = 1 - Math.abs(fbm(warpX * 0.02 + 800, warpZ * 0.02 + 800, 4, seed + 71) * 2 - 1);

  const ridgeMask = smoothstep(0.42, 0.78, continent);
  const macro = (continent - 0.5) * 2.3;
  const micro = (detail - 0.5) * 0.68;
  const ridges = Math.pow(ridge, 1.7) * 1.35 * ridgeMask;
  const carved = (1 - erosionNoise) * 0.62 * ridgeMask;

  let h = macro + micro + ridges - carved;
  const dist = Math.sqrt((x / (width * 0.5)) ** 2 + (z / (depth * 0.5)) ** 2);
  const edgeFalloff = smoothstep(0.86, 1.0, dist);
  h *= 1 - edgeFalloff;
  return h * TERRAIN_HEIGHT_SCALE;
}

export function sampleTerrain(seed: number, x: number, z: number, width: number = 200, depth: number = 200): TerrainSample {
  const h = sampleTerrainHeight(seed, x, z, width, depth);
  const eps = 1.5;
  const hx0 = sampleTerrainHeight(seed, x - eps, z, width, depth);
  const hx1 = sampleTerrainHeight(seed, x + eps, z, width, depth);
  const hz0 = sampleTerrainHeight(seed, x, z - eps, width, depth);
  const hz1 = sampleTerrainHeight(seed, x, z + eps, width, depth);

  const dx = (hx1 - hx0) / (2 * eps);
  const dz = (hz1 - hz0) / (2 * eps);
  const slope = clamp01(Math.sqrt(dx * dx + dz * dz) * 1.35);

  const avgNeighbor = (hx0 + hx1 + hz0 + hz1) * 0.25;
  const concavity = avgNeighbor - h;
  const flow = clamp01(concavity * 1.8 + (1 - slope) * 0.25);

  const moisture = fbm(x * 0.03 + 1200, z * 0.03 + 1200, 3, seed + 211);
  const detail = fbm(x * 0.38 + 2000, z * 0.38 + 2000, 2, seed + 317);

  return {
    height: h,
    moisture,
    slope,
    flow,
    detail
  };
}

export function buildTerrainHeightmap(
  seed: number,
  width: number,
  depth: number,
  columns: number,
  rows: number = columns,
  voxelHeight: number = 0.08
): TerrainHeightmap {
  const safeColumns = Math.max(1, Math.floor(columns));
  const safeRows = Math.max(1, Math.floor(rows));
  const cellWidth = width / safeColumns;
  const cellDepth = depth / safeRows;
  const cells: HeightmapCell[] = [];

  for (let row = 0; row < safeRows; row++) {
    const z = -depth * 0.5 + cellDepth * 0.5 + row * cellDepth;
    for (let column = 0; column < safeColumns; column++) {
      const x = -width * 0.5 + cellWidth * 0.5 + column * cellWidth;
      const sample = sampleTerrain(seed, x, z, width, depth);
      cells.push({
        ...sample,
        column,
        row,
        x,
        z,
        quantizedHeight: quantizeTerrainHeight(sample.height, voxelHeight)
      });
    }
  }

  return {
    width,
    depth,
    columns: safeColumns,
    rows: safeRows,
    cellWidth,
    cellDepth,
    voxelHeight,
    cells
  };
}
