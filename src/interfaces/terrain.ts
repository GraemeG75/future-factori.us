export interface TerrainSample {
  height: number;
  moisture: number;
  slope: number;
  flow: number;
  /** High-frequency micro noise [0,1] — used for per-vertex color variation. */
  detail: number;
}

export interface HeightmapCell extends TerrainSample {
  column: number;
  row: number;
  x: number;
  z: number;
  quantizedHeight: number;
}

export interface TerrainHeightmap {
  width: number;
  depth: number;
  columns: number;
  rows: number;
  cellWidth: number;
  cellDepth: number;
  voxelHeight: number;
  cells: HeightmapCell[];
}
