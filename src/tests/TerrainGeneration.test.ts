import { describe, expect, it } from 'vitest';
import { buildTerrainHeightmap, quantizeTerrainHeight, sampleTerrainHeight } from '../game/TerrainGeneration';

describe('TerrainGeneration', () => {
  it('quantizes voxel heights to the configured step size', () => {
    expect(quantizeTerrainHeight(1.03, 0.16)).toBeCloseTo(0.96);
    expect(quantizeTerrainHeight(-0.23, 0.16)).toBeCloseTo(-0.16);
  });

  it('builds a deterministic heightmap grid from sampled terrain', () => {
    const mapA = buildTerrainHeightmap(42, 120, 80, 12, 8, 0.2);
    const mapB = buildTerrainHeightmap(42, 120, 80, 12, 8, 0.2);

    expect(mapA.columns).toBe(12);
    expect(mapA.rows).toBe(8);
    expect(mapA.cells).toHaveLength(96);
    expect(mapA.cells).toEqual(mapB.cells);

    const centerCell = mapA.cells[Math.floor(mapA.cells.length / 2)]!;
    expect(centerCell.height).toBeCloseTo(sampleTerrainHeight(42, centerCell.x, centerCell.z, 120, 80), 8);
    expect(centerCell.quantizedHeight / mapA.voxelHeight).toBeCloseTo(Math.round(centerCell.quantizedHeight / mapA.voxelHeight), 8);
  });
});
