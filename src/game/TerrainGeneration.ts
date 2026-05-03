import { TERRAIN_GEN, TERRAIN_HEIGHT_SCALE } from '../consts/terrain';

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
  const warpX = x + (fbm(x * TERRAIN_GEN.warp.frequency, z * TERRAIN_GEN.warp.frequency, TERRAIN_GEN.warp.octaves, seed + TERRAIN_GEN.warp.seedOffsetA) - 0.5) * TERRAIN_GEN.warp.strength;
  const warpZ = z + (fbm(
    x * TERRAIN_GEN.warp.frequency + TERRAIN_GEN.warp.domainOffsetB,
    z * TERRAIN_GEN.warp.frequency + TERRAIN_GEN.warp.domainOffsetB,
    TERRAIN_GEN.warp.octaves,
    seed + TERRAIN_GEN.warp.seedOffsetB
  ) - 0.5) * TERRAIN_GEN.warp.strength;

  const continent = fbm(warpX * TERRAIN_GEN.continent.frequency, warpZ * TERRAIN_GEN.continent.frequency, TERRAIN_GEN.continent.octaves, seed + TERRAIN_GEN.continent.seedOffset);
  const detail = fbm(warpX * TERRAIN_GEN.detail.frequency, warpZ * TERRAIN_GEN.detail.frequency, TERRAIN_GEN.detail.octaves, seed + TERRAIN_GEN.detail.seedOffset);
  const erosionNoise = fbm(
    warpX * TERRAIN_GEN.erosion.frequency + TERRAIN_GEN.erosion.domainOffset,
    warpZ * TERRAIN_GEN.erosion.frequency + TERRAIN_GEN.erosion.domainOffset,
    TERRAIN_GEN.erosion.octaves,
    seed + TERRAIN_GEN.erosion.seedOffset
  );
  const ridge = 1 - Math.abs(fbm(
    warpX * TERRAIN_GEN.ridge.frequency + TERRAIN_GEN.ridge.domainOffset,
    warpZ * TERRAIN_GEN.ridge.frequency + TERRAIN_GEN.ridge.domainOffset,
    TERRAIN_GEN.ridge.octaves,
    seed + TERRAIN_GEN.ridge.seedOffset
  ) * 2 - 1);

  const ridgeMask = smoothstep(TERRAIN_GEN.ridge.maskStart, TERRAIN_GEN.ridge.maskEnd, continent);
  const macro = (continent - 0.5) * TERRAIN_GEN.macroScale;
  const micro = (detail - 0.5) * TERRAIN_GEN.detail.amplitude;
  const ridges = Math.pow(ridge, TERRAIN_GEN.ridge.power) * TERRAIN_GEN.ridge.strength * ridgeMask;
  const carved = (1 - erosionNoise) * TERRAIN_GEN.erosion.strength * ridgeMask;

  let h = macro + micro + ridges - carved;

  // Build a less uniform coastline by perturbing radial distance with broad noise.
  const dist = Math.sqrt((warpX / (width * 0.5)) ** 2 + (warpZ / (depth * 0.5)) ** 2);
  const angle = Math.atan2(warpZ, warpX);
  const coastRadiusNoise = fbm(
    Math.cos(angle) * TERRAIN_GEN.coastRadius.angularScale + TERRAIN_GEN.coastRadius.domainOffset,
    Math.sin(angle) * TERRAIN_GEN.coastRadius.angularScale + TERRAIN_GEN.coastRadius.domainOffset,
    TERRAIN_GEN.coastRadius.octaves,
    seed + TERRAIN_GEN.coastRadius.seedOffset
  );
  const targetCoastRadius = TERRAIN_GEN.coastRadius.base + (coastRadiusNoise - 0.5) * TERRAIN_GEN.coastRadius.variation;
  const coastNoise = (fbm(
    warpX * TERRAIN_GEN.coastNoise.frequency + TERRAIN_GEN.coastNoise.domainOffset,
    warpZ * TERRAIN_GEN.coastNoise.frequency + TERRAIN_GEN.coastNoise.domainOffset,
    TERRAIN_GEN.coastNoise.octaves,
    seed + TERRAIN_GEN.coastNoise.seedOffset
  ) - 0.5) * TERRAIN_GEN.coastNoise.strength;
  const coastDist = dist + coastNoise;
  const edgeFalloff = smoothstep(
    targetCoastRadius + TERRAIN_GEN.edgeFalloff.innerOffset,
    targetCoastRadius + TERRAIN_GEN.edgeFalloff.outerOffset,
    coastDist
  );
  h *= 1 - Math.pow(edgeFalloff, TERRAIN_GEN.edgeFalloff.power);

  // Hard coastal cutoff: outside the coastline, blend toward ocean floor below sea level.
  // Sea plane is around y=-3.5 in world space, so the normalized ocean floor target must be lower.
  const oceanFloor = TERRAIN_GEN.oceanCutoff.floorHeight;
  const oceanBlend = smoothstep(
    targetCoastRadius + TERRAIN_GEN.oceanCutoff.innerOffset,
    targetCoastRadius + TERRAIN_GEN.oceanCutoff.outerOffset,
    coastDist
  );
  h = h * (1 - oceanBlend) + oceanFloor * oceanBlend;

  // Scatter land into clusters so the map feels like an island chain, not one round blob.
  const islandField = fbm(
    warpX * TERRAIN_GEN.islandScatter.frequency + TERRAIN_GEN.islandScatter.domainOffset,
    warpZ * TERRAIN_GEN.islandScatter.frequency + TERRAIN_GEN.islandScatter.domainOffset,
    TERRAIN_GEN.islandScatter.octaves,
    seed + TERRAIN_GEN.islandScatter.seedOffset
  );
  const islandMask = smoothstep(
    TERRAIN_GEN.islandScatter.maskStart,
    TERRAIN_GEN.islandScatter.maskEnd,
    islandField + (1 - dist) * TERRAIN_GEN.islandScatter.centerBias
  );
  h *= TERRAIN_GEN.islandScatter.baseScale + islandMask * TERRAIN_GEN.islandScatter.maskScale;

  // Carve narrow mid-distance sea channels to break up continuous coastlines.
  const channelRidge = 1 - Math.abs(fbm(
    warpX * TERRAIN_GEN.channels.frequency + TERRAIN_GEN.channels.domainOffset,
    warpZ * TERRAIN_GEN.channels.frequency + TERRAIN_GEN.channels.domainOffset,
    TERRAIN_GEN.channels.octaves,
    seed + TERRAIN_GEN.channels.seedOffset
  ) * 2 - 1);
  const channelBand = smoothstep(TERRAIN_GEN.channels.bandInnerStart, TERRAIN_GEN.channels.bandInnerEnd, dist) *
    (1 - smoothstep(TERRAIN_GEN.channels.bandOuterStart, TERRAIN_GEN.channels.bandOuterEnd, dist));
  h -= Math.pow(channelRidge, TERRAIN_GEN.channels.ridgePower) * TERRAIN_GEN.channels.strength * channelBand;

  // Keep the center land-connected, but with variation so it does not become a flat plateau.
  const coreMask = 1 - smoothstep(TERRAIN_GEN.core.maskStart, TERRAIN_GEN.core.maskEnd, dist);
  const coreRelief = (fbm(
    warpX * TERRAIN_GEN.core.reliefFrequency + TERRAIN_GEN.core.reliefDomainOffset,
    warpZ * TERRAIN_GEN.core.reliefFrequency + TERRAIN_GEN.core.reliefDomainOffset,
    TERRAIN_GEN.core.reliefOctaves,
    seed + TERRAIN_GEN.core.reliefSeedOffset
  ) - 0.5) * TERRAIN_GEN.core.reliefStrength;
  h += coreMask * (TERRAIN_GEN.core.baseLift + coreRelief);

  // Prevent giant inland seas by gently lifting deep basins near the island core.
  const inlandMask = 1 - smoothstep(TERRAIN_GEN.inland.maskStart, TERRAIN_GEN.inland.maskEnd, dist);
  const minInlandHeight = TERRAIN_GEN.inland.minHeight;
  const inlandLift = minInlandHeight - h;
  if (inlandLift > 0) {
    h += inlandLift * inlandMask * TERRAIN_GEN.inland.liftStrength;
  }

  // Final island envelope: guarantees open ocean toward map bounds so the
  // playable landmass remains island-shaped instead of touching square edges.
  const islandEnvelopeDist = Math.sqrt((x / (width * 0.5)) ** 2 + (z / (depth * 0.5)) ** 2);
  const islandEnvelopeBlend = smoothstep(0.76, 0.96, islandEnvelopeDist);
  h = h * (1 - islandEnvelopeBlend) + oceanFloor * islandEnvelopeBlend;

  return h * TERRAIN_HEIGHT_SCALE;
}

export function sampleTerrain(seed: number, x: number, z: number, width: number = 200, depth: number = 200): TerrainSample {
  const h = sampleTerrainHeight(seed, x, z, width, depth);
  const eps = TERRAIN_GEN.sample.normalEpsilon;
  const hx0 = sampleTerrainHeight(seed, x - eps, z, width, depth);
  const hx1 = sampleTerrainHeight(seed, x + eps, z, width, depth);
  const hz0 = sampleTerrainHeight(seed, x, z - eps, width, depth);
  const hz1 = sampleTerrainHeight(seed, x, z + eps, width, depth);

  const dx = (hx1 - hx0) / (2 * eps);
  const dz = (hz1 - hz0) / (2 * eps);
  const slope = clamp01(Math.sqrt(dx * dx + dz * dz) * TERRAIN_GEN.sample.slopeScale);

  const avgNeighbor = (hx0 + hx1 + hz0 + hz1) * 0.25;
  const concavity = avgNeighbor - h;
  const flow = clamp01(concavity * TERRAIN_GEN.sample.flowConcavityScale + (1 - slope) * TERRAIN_GEN.sample.flowFlatBias);

  const moisture = fbm(
    x * TERRAIN_GEN.sample.moistureFrequency + TERRAIN_GEN.sample.moistureDomainOffset,
    z * TERRAIN_GEN.sample.moistureFrequency + TERRAIN_GEN.sample.moistureDomainOffset,
    TERRAIN_GEN.sample.moistureOctaves,
    seed + TERRAIN_GEN.sample.moistureSeedOffset
  );
  const detail = fbm(
    x * TERRAIN_GEN.sample.detailFrequency + TERRAIN_GEN.sample.detailDomainOffset,
    z * TERRAIN_GEN.sample.detailFrequency + TERRAIN_GEN.sample.detailDomainOffset,
    TERRAIN_GEN.sample.detailOctaves,
    seed + TERRAIN_GEN.sample.detailSeedOffset
  );

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
