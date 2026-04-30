/**
 * VoxLoader.ts
 * Loads a MagicaVoxel .vox file (version 150) and returns a THREE.Group.
 *
 * Coordinate mapping
 * ------------------
 * .vox axes  →  three.js axes
 *   X        →  X   (right)
 *   Y        →  -Z  (depth, flipped so +Y in .vox = "forward" screen-depth)
 *   Z        →  Y   (up)
 *
 * Reserved colour indices (must match scripts/gen-vox.mjs)
 * ---------------------------------------------------------
 *   1  CI_FAN   – voxels belonging to the first rotating fan group
 *   2  CI_BLINK – single marker → small glowing sphere with blink animation
 *   3  CI_SMOKE – single marker → smoke emitter Object3D
 *   4  CI_ORB   – single marker → larger spinning orb sphere
 *   5+ regular geometry – rendered as voxel cubes
 *
 * Glow detection
 * --------------
 * Colour index 7 (CI_GLOW) and index 4 (CI_ORB palette colour) are flagged
 * emissive.  You can extend the EMISSIVE_INDICES set below for more.
 *
 * Scale
 * -----
 * Each voxel is VOX_WORLD_SIZE world-units wide.  Default 0.125 matches the
 * 8-voxels-per-unit grid used in gen-vox.mjs.
 */

import * as THREE from 'three';
import { RetroMaterials } from './RetroMaterials';

// One voxel = this many world units (8 voxels = 1 world unit).
const VOX_WORLD_SIZE = 0.125;

// Reserved animation marker indices (sync with gen-vox.mjs).
const CI_FAN = 1;
const CI_BLINK = 2;
const CI_SMOKE = 3;
const CI_ORB = 4;

// Colour indices that should be rendered as emissive (glowing).
const EMISSIVE_INDICES = new Set([7]);

// Cache: url → loaded ArrayBuffer
const rawCache = new Map<string, ArrayBuffer>();

// Cache: url → built group (shared geometry, each caller gets a clone)
const groupCache = new Map<string, THREE.Group>();

interface VoxData {
  sx: number;
  sy: number;
  sz: number;
  voxels: { x: number; y: number; z: number; ci: number }[];
  palette: THREE.Color[]; // index 0 = unused
  emissivePalette: boolean[]; // true → emissive
}

// ─── Binary parser ────────────────────────────────────────────────────────────

function parseVox(buffer: ArrayBuffer): VoxData {
  const view = new DataView(buffer);
  let off = 0;

  function readId(): string {
    const id = String.fromCharCode(
      view.getUint8(off),
      view.getUint8(off + 1),
      view.getUint8(off + 2),
      view.getUint8(off + 3)
    );
    off += 4;
    return id;
  }
  function readU32(): number {
    const v = view.getUint32(off, true);
    off += 4;
    return v;
  }

  // Header
  const magic = readId();
  if (magic !== 'VOX ') {
    throw new Error('Not a .vox file');
  }
  readU32(); // version

  let sx = 0,
    sy = 0,
    sz = 0;
  const voxels: VoxData['voxels'] = [];
  const rawPalette = new Uint8Array(256 * 4);
  let hasPalette = false;

  // Walk chunks
  const mainId = readId();
  if (mainId !== 'MAIN') {
    throw new Error('.vox missing MAIN chunk');
  }
  readU32(); // numBytes (main content, always 0)
  const childrenBytes = readU32();
  const childrenEnd = off + childrenBytes;

  while (off < childrenEnd) {
    const chunkId = readId();
    const numBytes = readU32();
    readU32(); // numChildBytes (unused)
    const chunkEnd = off + numBytes;

    if (chunkId === 'SIZE') {
      sx = readU32();
      sy = readU32();
      sz = readU32();
    } else if (chunkId === 'XYZI') {
      const count = readU32();
      for (let i = 0; i < count; i++) {
        const x = view.getUint8(off++);
        const y = view.getUint8(off++);
        const z = view.getUint8(off++);
        const ci = view.getUint8(off++);
        voxels.push({ x, y, z, ci });
      }
    } else if (chunkId === 'RGBA') {
      for (let i = 0; i < 256 * 4; i++) {
        rawPalette[i] = view.getUint8(off++);
      }
      hasPalette = true;
    }

    off = chunkEnd;
  }

  // Build THREE.Color palette (index 0 = unused placeholder)
  const palette: THREE.Color[] = [];
  const emissivePalette: boolean[] = [];
  for (let i = 0; i < 256; i++) {
    const r = (rawPalette[i * 4] ?? 0) / 255;
    const g = (rawPalette[i * 4 + 1] ?? 0) / 255;
    const b = (rawPalette[i * 4 + 2] ?? 0) / 255;
    palette.push(new THREE.Color(r, g, b));
    emissivePalette.push(hasPalette && EMISSIVE_INDICES.has(i));
  }

  return { sx, sy, sz, voxels, palette, emissivePalette };
}

// ─── Geometry builder ─────────────────────────────────────────────────────────

/**
 * Build a Three.js Group from parsed vox data.
 * Returns a group containing:
 *   - one merged BufferGeometry mesh per unique colour (geometry voxels)
 *   - one Object3D named 'fan_blade' per CI_FAN voxel
 *   - one Mesh named 'blink_light' per CI_BLINK marker
 *   - one Object3D named 'smoke_point' per CI_SMOKE marker
 *   - one Mesh named 'spinning_orb' per CI_ORB marker
 */
function buildGroup(data: VoxData): THREE.Group {
  const { sx, sy, sz, voxels, palette, emissivePalette } = data;

  // Occupied-voxel set for face-culling
  const occupied = new Set<number>();
  for (const { x, y, z } of voxels) {
    if (x >= 0 && y >= 0 && z >= 0 && x < sx && y < sy && z < sz) {
      occupied.add(x + y * sx + z * sx * sy);
    }
  }
  const isOccupied = (x: number, y: number, z: number): boolean =>
    occupied.has(x + y * sx + z * sx * sy);

  // Per-colour geometry accumulators
  const posMap = new Map<number, number[]>();
  const norMap = new Map<number, number[]>();
  const colMap = new Map<number, number[]>();

  // Axis helpers
  const S = VOX_WORLD_SIZE;

  function pushFace(
    ci: number,
    ax: number,
    ay: number,
    az: number,
    bx: number,
    by: number,
    bz: number,
    cx_: number,
    cy_: number,
    cz_: number,
    dx: number,
    dy_: number,
    dz: number,
    nx: number,
    ny: number,
    nz: number,
    color: THREE.Color
  ) {
    if (!posMap.has(ci)) {
      posMap.set(ci, []);
      norMap.set(ci, []);
      colMap.set(ci, []);
    }
    const pos = posMap.get(ci)!;
    const nor = norMap.get(ci)!;
    const col = colMap.get(ci)!;
    const verts = [
      ax,
      ay,
      az,
      bx,
      by,
      bz,
      cx_,
      cy_,
      cz_,
      ax,
      ay,
      az,
      cx_,
      cy_,
      cz_,
      dx,
      dy_,
      dz,
    ];
    pos.push(...verts);
    for (let i = 0; i < 6; i++) {
      nor.push(nx, ny, nz);
    }
    for (let i = 0; i < 6; i++) {
      col.push(color.r, color.g, color.b);
    }
  }

  for (const { x, y, z, ci } of voxels) {
    // .vox → three.js coordinate map: vox(x,y,z) → world(x*S, z*S, -y*S)
    // Centre the model on the floor: subtract half-extents in X and Y.
    const wx = (x - sx / 2) * S;
    const wy = z * S; // vox Z = height
    const wz = -(y - sy / 2) * S;

    // Skip reserved markers — handled separately below
    if (ci === CI_FAN || ci === CI_BLINK || ci === CI_SMOKE || ci === CI_ORB) {
      continue;
    }

    const color = palette[ci] ?? new THREE.Color(1, 0, 1);

    // Six faces, each emitted only when the adjacent voxel is empty
    const x0 = wx,
      x1 = wx + S,
      y0 = wy,
      y1 = wy + S,
      z0 = wz - S,
      z1 = wz;

    // +Y top
    if (!isOccupied(x, y, z + 1)) {
      pushFace(
        ci,
        x0,
        y1,
        z1,
        x0,
        y1,
        z0,
        x1,
        y1,
        z0,
        x1,
        y1,
        z1,
        0,
        1,
        0,
        color
      );
    }
    // -Y bottom
    if (!isOccupied(x, y, z - 1)) {
      pushFace(
        ci,
        x0,
        y0,
        z0,
        x0,
        y0,
        z1,
        x1,
        y0,
        z1,
        x1,
        y0,
        z0,
        0,
        -1,
        0,
        color
      );
    }
    // +X right
    if (!isOccupied(x + 1, y, z)) {
      pushFace(
        ci,
        x1,
        y0,
        z0,
        x1,
        y1,
        z0,
        x1,
        y1,
        z1,
        x1,
        y0,
        z1,
        1,
        0,
        0,
        color
      );
    }
    // -X left
    if (!isOccupied(x - 1, y, z)) {
      pushFace(
        ci,
        x0,
        y0,
        z1,
        x0,
        y1,
        z1,
        x0,
        y1,
        z0,
        x0,
        y0,
        z0,
        -1,
        0,
        0,
        color
      );
    }
    // +Z front (vox -Y → three.js +Z)
    if (!isOccupied(x, y - 1, z)) {
      pushFace(
        ci,
        x0,
        y0,
        z1,
        x0,
        y1,
        z1,
        x1,
        y1,
        z1,
        x1,
        y0,
        z1,
        0,
        0,
        1,
        color
      );
    }
    // -Z back (vox +Y → three.js -Z)
    if (!isOccupied(x, y + 1, z)) {
      pushFace(
        ci,
        x1,
        y0,
        z0,
        x1,
        y1,
        z0,
        x0,
        y1,
        z0,
        x0,
        y0,
        z0,
        0,
        0,
        -1,
        color
      );
    }
  }

  const group = new THREE.Group();

  // Build one mesh per colour index
  for (const [ci, positions] of posMap) {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(positions, 3)
    );
    geo.setAttribute(
      'normal',
      new THREE.Float32BufferAttribute(norMap.get(ci)!, 3)
    );
    geo.setAttribute(
      'color',
      new THREE.Float32BufferAttribute(colMap.get(ci)!, 3)
    );

    const isEmissive = emissivePalette[ci] ?? false;
    const mat = isEmissive
      ? new THREE.MeshStandardMaterial({
        vertexColors: true,
        emissive: palette[ci],
        emissiveIntensity: 2.0,
        roughness: 0.4,
        metalness: 0.3,
      })
      : new THREE.MeshStandardMaterial({
        vertexColors: true,
        roughness: 0.7,
        metalness: 0.2,
      });

    const mesh = new THREE.Mesh(geo, mat);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);
  }

  // Marker voxels → special objects
  for (const { x, y, z, ci } of voxels) {
    const wx = (x - sx / 2 + 0.5) * S;
    const wy = (z + 0.5) * S;
    const wz = -(y - sy / 2 + 0.5) * S;

    if (ci === CI_FAN) {
      const obj = new THREE.Object3D();
      obj.name = 'fan_blade';
      obj.position.set(wx, wy, wz);
      // Attach a thin box as the visual blade
      const bladeGeo = new THREE.BoxGeometry(S * 1.5, S * 0.3, S * 0.6);
      const bladeMesh = new THREE.Mesh(
        bladeGeo,
        RetroMaterials.neonGlow(0xffdd00)
      );
      obj.add(bladeMesh);
      group.add(obj);
    } else if (ci === CI_BLINK) {
      const blinkMat = RetroMaterials.glowing(0x00ff88, 1.8);
      const blink = new THREE.Mesh(
        new THREE.SphereGeometry(S * 0.6, 6, 6),
        blinkMat
      );
      blink.name = 'blink_light';
      blink.position.set(wx, wy, wz);
      group.add(blink);
    } else if (ci === CI_SMOKE) {
      const pt = new THREE.Object3D();
      pt.name = 'smoke_point';
      pt.position.set(wx, wy, wz);
      group.add(pt);
    } else if (ci === CI_ORB) {
      const orbMat = RetroMaterials.glowing(0xff00ff, 2.0);
      const orb = new THREE.Mesh(
        new THREE.SphereGeometry(S * 1.8, 12, 12),
        orbMat
      );
      orb.name = 'spinning_orb';
      orb.position.set(wx, wy, wz);
      group.add(orb);
    }
  }

  return group;
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Asynchronously load a .vox file and return a cloned THREE.Group.
 * Results are cached; subsequent calls for the same URL are instant.
 */
export async function loadVox(url: string): Promise<THREE.Group> {
  if (!groupCache.has(url)) {
    let raw = rawCache.get(url);
    if (!raw) {
      const resp = await fetch(url);
      if (!resp.ok) {
        throw new Error(`VoxLoader: fetch failed for ${url} (${resp.status})`);
      }
      raw = await resp.arrayBuffer();
      rawCache.set(url, raw);
    }
    const data = parseVox(raw);
    groupCache.set(url, buildGroup(data));
  }
  return groupCache.get(url)!.clone();
}

/**
 * Synchronously load from an already-fetched ArrayBuffer.
 * Useful for bundled/inline assets or tests.
 */
export function loadVoxSync(buffer: ArrayBuffer): THREE.Group {
  return buildGroup(parseVox(buffer));
}
