/**
 * gen-vox.mjs
 * Generates initial MagicaVoxel .vox files for every building type.
 * Run with:  node scripts/gen-vox.mjs
 *
 * Output:  public/models/buildings/<id>.vox
 *
 * Coordinate system
 * -----------------
 * All building definitions below use voxel (vox) coordinates:
 *   vox X = right   (→ three.js X)
 *   vox Y = depth   (→ three.js -Z)
 *   vox Z = up      (→ three.js Y)
 *
 * Grid size: 16 × 16 × 24 (X × Y × Z).  Centre of floor = (8, 8, 0).
 * Scale: 8 voxels per one in-game world unit (1 vox = 0.125 world units).
 *
 * Reserved color indices
 * ----------------------
 * These indices have special meaning and are handled by VoxLoader.ts:
 *   1  CI_FAN   – fan-blade voxels (given spin animation)
 *   2  CI_BLINK – single-voxel marker → replaced with a glowing blink sphere
 *   3  CI_SMOKE – single-voxel marker → replaced with a smoke emitter
 *   4  CI_ORB   – single-voxel marker → replaced with a spinning orb sphere
 *   5+ CI_BODY / CI_ACCENT / CI_GLOW / ... – regular geometry voxels
 */

import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, '../public/models/buildings');
mkdirSync(OUT_DIR, { recursive: true });

// ── Reserved colour indices ──────────────────────────────────────────────────
const CI_FAN = 1;
const CI_BLINK = 2;
const CI_SMOKE = 3;
const CI_ORB = 4;

// ── Palette colour indices for geometry ─────────────────────────────────────
// Free slots: 5–255 (the palette is defined at the bottom of this file).
const CI_BODY = 5; // main structure colour (overridden per-building)
const CI_ACCENT = 6; // lighter / secondary colour
const CI_GLOW = 7; // neon accent (rendered emissive by VoxLoader)
const CI_DARK = 8; // dark detail colour
const CI_RUST = 9; // rust / worn metal
const CI_STRIPE = 10; // warning stripe

// ── Grid dimensions ──────────────────────────────────────────────────────────
const WX = 16,
  WY = 16,
  WZ = 24;

// ── VoxGrid class ────────────────────────────────────────────────────────────
class VoxGrid {
  constructor(wx = WX, wy = WY, wz = WZ) {
    this.wx = wx;
    this.wy = wy;
    this.wz = wz;
    this.data = new Uint8Array(wx * wy * wz);
  }

  _idx(x, y, z) {
    return x + y * this.wx + z * this.wx * this.wy;
  }

  /** Set a single voxel (silently clamps out-of-bounds). */
  set(x, y, z, ci) {
    x = Math.round(x);
    y = Math.round(y);
    z = Math.round(z);
    if (x < 0 || x >= this.wx || y < 0 || y >= this.wy || z < 0 || z >= this.wz) return;
    this.data[this._idx(x, y, z)] = ci;
  }

  /** Fill an axis-aligned box [x0..x1] × [y0..y1] × [z0..z1] inclusive. */
  box(x0, y0, z0, x1, y1, z1, ci) {
    for (let x = x0; x <= x1; x++) for (let y = y0; y <= y1; y++) for (let z = z0; z <= z1; z++) this.set(x, y, z, ci);
  }

  /**
   * Fill a vertical cylinder centred at (cx, cy) with radius r,
   * from z0 to z1 inclusive.
   */
  cyl(cx, cy, r, z0, z1, ci) {
    const r2 = r * r;
    for (let x = Math.ceil(cx - r); x <= Math.floor(cx + r); x++)
      for (let y = Math.ceil(cy - r); y <= Math.floor(cy + r); y++)
        if ((x - cx) ** 2 + (y - cy) ** 2 <= r2) for (let z = z0; z <= z1; z++) this.set(x, y, z, ci);
  }

  /**
   * Fill an approximate upright cone tip at (cx, cy, zTip), base radius rBase,
   * growing downward over height h.
   */
  cone(cx, cy, zTip, h, rBase, ci) {
    for (let dz = 0; dz < h; dz++) {
      const r = rBase * (dz / h);
      this.cyl(cx, cy, r, zTip - dz, zTip - dz, ci);
    }
  }

  /** Place a single marker voxel (used for blink / smoke / orb). */
  mark(x, y, z, ci) {
    this.set(x, y, z, ci);
  }

  /** Encode the grid as a MagicaVoxel .vox binary Buffer. */
  toVox(paletteOverride) {
    const voxels = [];
    for (let z = 0; z < this.wz; z++)
      for (let y = 0; y < this.wy; y++)
        for (let x = 0; x < this.wx; x++) {
          const ci = this.data[this._idx(x, y, z)];
          if (ci !== 0) voxels.push(x, y, z, ci);
        }

    // Chunk helper: [id(4)] [numBytes(4)] [numChildBytes(4)] [content] [children]
    const chunk = (id, content, children = Buffer.alloc(0)) => {
      const buf = Buffer.allocUnsafe(12 + content.length + children.length);
      buf.write(id, 0, 'ascii');
      buf.writeUInt32LE(content.length, 4);
      buf.writeUInt32LE(children.length, 8);
      content.copy(buf, 12);
      children.copy(buf, 12 + content.length);
      return buf;
    };

    // SIZE chunk
    const sizeData = Buffer.alloc(12);
    sizeData.writeUInt32LE(this.wx, 0);
    sizeData.writeUInt32LE(this.wy, 4);
    sizeData.writeUInt32LE(this.wz, 8);

    // XYZI chunk
    const xyziData = Buffer.allocUnsafe(4 + voxels.length); // voxels already flat
    xyziData.writeUInt32LE(voxels.length / 4, 0);
    for (let i = 0; i < voxels.length; i++) xyziData[4 + i] = voxels[i];

    // RGBA chunk (256 colours × 4 bytes)
    const pal = paletteOverride ?? PALETTE;
    const rgbaData = Buffer.alloc(256 * 4);
    for (let i = 0; i < 256; i++) {
      const c = pal[i] ?? [0, 0, 0, 255];
      rgbaData[i * 4] = c[0];
      rgbaData[i * 4 + 1] = c[1];
      rgbaData[i * 4 + 2] = c[2];
      rgbaData[i * 4 + 3] = c[3] ?? 255;
    }

    const mainChildren = Buffer.concat([chunk('SIZE', sizeData), chunk('XYZI', xyziData), chunk('RGBA', rgbaData)]);
    const mainChunk = chunk('MAIN', Buffer.alloc(0), mainChildren);

    const header = Buffer.alloc(8);
    header.write('VOX ', 0, 'ascii');
    header.writeUInt32LE(150, 4);

    return Buffer.concat([header, mainChunk]);
  }
}

// ── Shared palette ───────────────────────────────────────────────────────────
// Index 0 = unused (transparent / empty in .vox convention).
// Indices 1–4 = reserved animation markers (see top of file).
// Indices 5–255 = geometry colours.
// Format: [R, G, B, A]  (A=255 = fully opaque)
const PALETTE = new Array(256).fill([0, 0, 0, 255]);
// Animation markers (non-geometry, rendered as meshes by VoxLoader)
PALETTE[CI_FAN] = [255, 160, 0, 255]; // orange  – fan blade
PALETTE[CI_BLINK] = [255, 255, 255, 255]; // white   – blink light marker
PALETTE[CI_SMOKE] = [180, 180, 180, 255]; // grey    – smoke point marker
PALETTE[CI_ORB] = [255, 0, 255, 255]; // magenta – spinning orb marker
// Geometry
PALETTE[CI_BODY] = [120, 120, 120, 255]; // default mid-grey body (overridden)
PALETTE[CI_ACCENT] = [200, 200, 200, 255]; // lighter accent
PALETTE[CI_GLOW] = [0, 220, 150, 255]; // teal glow
PALETTE[CI_DARK] = [50, 50, 50, 255]; // dark detail
PALETTE[CI_RUST] = [140, 80, 40, 255]; // rust
PALETTE[CI_STRIPE] = [220, 200, 0, 255]; // warning yellow

// Additional named colour slots for specific buildings:
const CI_BROWN = 11;
PALETTE[CI_BROWN] = [139, 94, 60, 255]; // wood/earth
const CI_COAL = 12;
PALETTE[CI_COAL] = [44, 44, 44, 255]; // coal black
const CI_IRON = 13;
PALETTE[CI_IRON] = [139, 69, 19, 255]; // iron ore
const CI_BLUE = 14;
PALETTE[CI_BLUE] = [30, 100, 220, 255]; // water blue
const CI_GOLD = 15;
PALETTE[CI_GOLD] = [218, 165, 32, 255]; // gold factory
const CI_COPPER = 16;
PALETTE[CI_COPPER] = [184, 115, 51, 255]; // copper/smelter
const CI_CYAN = 17;
PALETTE[CI_CYAN] = [0, 200, 210, 255]; // circuit cyan
const CI_ORANGE = 18;
PALETTE[CI_ORANGE] = [220, 90, 20, 255]; // refinery orange
const CI_SILVER = 19;
PALETTE[CI_SILVER] = [180, 185, 190, 255]; // storage silver
const CI_PURPLE = 20;
PALETTE[CI_PURPLE] = [130, 60, 200, 255]; // research purple
const CI_GREEN = 21;
PALETTE[CI_GREEN] = [40, 180, 80, 255]; // power green
const CI_LIME = 22;
PALETTE[CI_LIME] = [150, 220, 40, 255]; // silicon lime
const CI_YELLOW = 23;
PALETTE[CI_YELLOW] = [220, 200, 20, 255]; // uranium yellow
const CI_PINK = 24;
PALETTE[CI_PINK] = [220, 50, 180, 255]; // exotic pink
const CI_TEAL = 25;
PALETTE[CI_TEAL] = [20, 180, 160, 255]; // quantum teal
const CI_RED = 26;
PALETTE[CI_RED] = [200, 30, 30, 255]; // fusion red
const CI_BIOGRN = 27;
PALETTE[CI_BIOGRN] = [60, 160, 60, 255]; // bio green
const CI_VOID = 28;
PALETTE[CI_VOID] = [10, 10, 40, 255]; // singularity dark
const CI_NEURAL = 29;
PALETTE[CI_NEURAL] = [80, 140, 220, 255]; // mind matrix
const CI_REALFG = 30;
PALETTE[CI_REALFG] = [140, 80, 200, 255]; // reality forge
const CI_RAD = 31;
PALETTE[CI_RAD] = [180, 60, 60, 255]; // radiator red
const CI_COOL = 32;
PALETTE[CI_COOL] = [100, 180, 220, 255]; // cooling tower blue

// ── Building definitions ─────────────────────────────────────────────────────
// Each function returns a VoxGrid.  cx/cy = 7.5 (centre of 16×16 floor).
// Helpers: cyl, box, cone, mark  (all vox-space coordinates).

const cx = 7.5,
  cy = 7.5; // floor centre

function wood_harvester() {
  const g = new VoxGrid();
  g.cyl(cx, cy, 2.5, 0, 4, CI_BROWN); // trunk
  g.cyl(cx, cy, 3.5, 5, 7, CI_BIOGRN); // lower canopy
  g.cyl(cx, cy, 2.5, 8, 9, CI_BIOGRN); // mid canopy
  g.cyl(cx, cy, 1.5, 10, 11, CI_BIOGRN); // upper canopy
  g.mark(8, 8, 13, CI_BLINK); // indicator light
  return g;
}

function coal_mine() {
  const g = new VoxGrid();
  g.box(4, 4, 0, 11, 11, 4, CI_COAL); // main body
  g.box(6, 6, 4, 9, 9, 5, CI_DARK); // roof detail
  g.cyl(10, 10, 1, 4, 8, CI_COAL); // chimney
  g.mark(10, 10, 9, CI_SMOKE); // smoke point
  return g;
}

function iron_mine() {
  const g = new VoxGrid();
  g.box(4, 4, 0, 11, 11, 5, CI_IRON); // base
  g.box(5, 5, 5, 10, 10, 7, CI_RUST); // mid section
  g.box(6, 6, 7, 9, 9, 9, CI_DARK); // top cabin
  g.mark(8, 8, 10, CI_BLINK);
  return g;
}

function water_pump() {
  const g = new VoxGrid();
  g.cyl(cx, cy, 3, 0, 2, CI_BLUE); // wide base
  g.cyl(cx, cy, 1, 3, 11, CI_SILVER); // pipe shaft
  g.cyl(cx, cy, 2, 11, 12, CI_BLUE); // pump head
  g.mark(8, 8, 13, CI_BLINK);
  return g;
}

function basic_factory() {
  const g = new VoxGrid();
  g.box(3, 3, 0, 12, 12, 5, CI_GOLD); // main hall
  g.box(4, 4, 5, 11, 11, 6, CI_DARK); // roof edge
  // three vent bumps along the top
  g.box(4, 7, 6, 5, 9, 9, CI_COPPER);
  g.box(7, 7, 6, 8, 9, 9, CI_COPPER);
  g.box(10, 7, 6, 11, 9, 9, CI_COPPER);
  g.mark(8, 8, 10, CI_BLINK);
  return g;
}

function smelter() {
  const g = new VoxGrid();
  g.cyl(cx, cy, 3, 0, 8, CI_COPPER); // main furnace
  g.cyl(cx, cy, 4, 0, 1, CI_DARK); // base ring
  g.cyl(10, 8, 1, 8, 12, CI_DARK); // left stack
  g.cyl(5, 8, 1, 8, 12, CI_DARK); // right stack
  g.mark(10, 8, 13, CI_SMOKE);
  g.mark(5, 8, 13, CI_SMOKE);
  return g;
}

function circuit_fab() {
  const g = new VoxGrid();
  g.box(3, 3, 0, 12, 12, 2, CI_CYAN); // flat PCB base
  g.box(4, 4, 2, 11, 11, 3, CI_DARK); // recess border
  // 3×3 bump grid
  for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) g.box(4 + c * 3, 4 + r * 3, 3, 5 + c * 3, 5 + r * 3, 4, CI_CYAN);
  g.mark(8, 8, 5, CI_BLINK);
  return g;
}

function refinery() {
  const g = new VoxGrid();
  g.cyl(cx, cy, 2, 0, 7, CI_ORANGE); // main tower
  g.box(5, 7, 4, 11, 9, 5, CI_DARK); // side pipe
  g.cyl(cx, cy, 1, 7, 9, CI_RUST); // stack
  g.mark(8, 8, 10, CI_SMOKE);
  g.mark(8, 8, 11, CI_BLINK);
  return g;
}

function storage_depot() {
  const g = new VoxGrid();
  g.box(2, 2, 0, 13, 13, 3, CI_SILVER); // wide warehouse
  g.box(3, 3, 3, 12, 12, 4, CI_DARK); // roof lip
  g.box(6, 6, 3, 9, 9, 5, CI_ACCENT); // ventilation dome
  return g;
}

function research_center() {
  const g = new VoxGrid();
  // dome: stacked shrinking cylinders
  for (let z = 0; z < 5; z++) g.cyl(cx, cy, 4 - z * 0.75, z, z, CI_PURPLE);
  g.cyl(cx, cy, 0.5, 4, 12, CI_SILVER); // antenna shaft
  g.mark(8, 8, 13, CI_BLINK);
  return g;
}

function trading_terminal() {
  const g = new VoxGrid();
  // squat cone base (wide bottom, narrow top)
  for (let z = 0; z < 6; z++) g.cyl(cx, cy, 4 - z * 0.6, z, z, CI_TEAL);
  // ring of fan-blade voxels (the rotating ring)
  for (let i = 0; i < 16; i++) {
    const angle = (i / 16) * Math.PI * 2;
    const rx = cx + Math.cos(angle) * 3.5;
    const ry = cy + Math.sin(angle) * 3.5;
    g.set(Math.round(rx), Math.round(ry), 5, CI_FAN);
  }
  g.mark(8, 8, 7, CI_BLINK);
  return g;
}

function power_plant() {
  const g = new VoxGrid();
  g.box(3, 3, 0, 12, 12, 4, CI_GREEN); // main building
  g.box(4, 4, 4, 11, 11, 5, CI_DARK); // roof
  // 4 fan blades radiating from centre at z=5
  g.box(3, 7, 5, 7, 8, 5, CI_FAN); // west blade
  g.box(8, 7, 5, 12, 8, 5, CI_FAN); // east blade
  g.box(7, 3, 5, 8, 7, 5, CI_FAN); // north blade
  g.box(7, 8, 5, 8, 12, 5, CI_FAN); // south blade
  return g;
}

function silicon_extractor() {
  const g = new VoxGrid();
  g.box(4, 4, 0, 11, 11, 3, CI_LIME); // base
  g.box(4, 4, 0, 11, 11, 0, CI_DARK); // base ring
  // 3 crystal spires
  g.box(5, 7, 3, 6, 8, 9, CI_CYAN);
  g.box(7, 7, 3, 8, 8, 11, CI_CYAN);
  g.box(9, 7, 3, 10, 8, 9, CI_CYAN);
  g.mark(8, 8, 12, CI_BLINK);
  return g;
}

function uranium_extractor() {
  const g = new VoxGrid();
  g.box(3, 3, 0, 12, 12, 5, CI_YELLOW); // main block
  // warning stripes
  g.box(3, 3, 1, 12, 12, 1, CI_STRIPE);
  g.box(3, 3, 3, 12, 12, 3, CI_STRIPE);
  g.mark(8, 8, 7, CI_BLINK);
  return g;
}

function exotic_lab() {
  const g = new VoxGrid();
  g.box(4, 4, 0, 11, 11, 2, CI_PINK); // base platform
  // 4 corner pillars
  g.box(4, 4, 2, 5, 5, 7, CI_PINK);
  g.box(10, 4, 2, 11, 5, 7, CI_PINK);
  g.box(4, 10, 2, 5, 11, 7, CI_PINK);
  g.box(10, 10, 2, 11, 11, 7, CI_PINK);
  g.mark(8, 8, 8, CI_ORB); // spinning orb
  return g;
}

function quantum_forge() {
  const g = new VoxGrid();
  g.cyl(cx, cy, 4, 0, 6, CI_TEAL); // main cylinder
  g.cyl(cx, cy, 5, 0, 1, CI_DARK); // base ring
  // 4 corner emitters
  for (const [ex, ey] of [
    [4, 4],
    [4, 11],
    [11, 4],
    [11, 11]
  ])
    g.cyl(ex, ey, 1, 6, 10, CI_CYAN);
  g.mark(8, 8, 11, CI_ORB);
  return g;
}

function fusion_plant() {
  const g = new VoxGrid();
  g.cyl(cx, cy, 5, 0, 8, CI_RED); // reactor
  g.cyl(cx, cy, 6, 0, 1, CI_DARK); // base plate
  g.cyl(cx, cy, 2, 8, 14, CI_DARK); // exhaust stack
  g.mark(8, 8, 8, CI_SMOKE);
  g.mark(8, 8, 8, CI_BLINK);
  return g;
}

function bio_reactor() {
  const g = new VoxGrid();
  g.box(3, 3, 0, 12, 12, 2, CI_BIOGRN); // base pad
  g.cyl(cx, cy, 3.5, 2, 9, CI_BIOGRN); // bio dome
  g.box(7, 7, 2, 8, 8, 9, CI_CYAN); // internal shaft (visible through dome – accent)
  g.mark(8, 8, 10, CI_BLINK);
  return g;
}

function singularity_tap() {
  const g = new VoxGrid();
  // Ring structure
  for (let i = 0; i < 24; i++) {
    const angle = (i / 24) * Math.PI * 2;
    const rx = cx + Math.cos(angle) * 5;
    const ry = cy + Math.sin(angle) * 5;
    for (let z = 0; z < 4; z++) g.set(Math.round(rx), Math.round(ry), z, CI_VOID);
  }
  g.mark(8, 8, 5, CI_ORB);
  return g;
}

function mind_matrix() {
  const g = new VoxGrid();
  g.box(3, 3, 0, 12, 12, 2, CI_NEURAL);
  // neural network pillars at grid positions
  for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) g.box(4 + c * 3, 4 + r * 3, 2, 5 + c * 3, 5 + r * 3, 7, CI_NEURAL);
  // connector strands (thin rows)
  g.box(4, 7, 4, 11, 8, 4, CI_CYAN);
  g.box(7, 4, 4, 8, 11, 4, CI_CYAN);
  g.mark(8, 8, 9, CI_BLINK);
  return g;
}

function reality_forge() {
  const g = new VoxGrid();
  g.cyl(cx, cy, 4, 0, 5, CI_REALFG); // main body
  // orbit ring of fan voxels
  for (let i = 0; i < 16; i++) {
    const angle = (i / 16) * Math.PI * 2;
    const rx = cx + Math.cos(angle) * 5;
    const ry = cy + Math.sin(angle) * 5;
    g.set(Math.round(rx), Math.round(ry), 4, CI_FAN);
  }
  g.mark(8, 8, 7, CI_ORB);
  return g;
}

function radiator() {
  const g = new VoxGrid();
  g.box(3, 6, 0, 12, 9, 8, CI_RAD); // main panel (thin slab, faces forward)
  g.box(5, 6, 8, 10, 9, 10, CI_DARK); // top cap
  // rib stripes
  for (let z = 1; z <= 7; z += 2) g.box(3, 5, z, 12, 6, z, CI_ACCENT);
  return g;
}

function cooling_tower() {
  const g = new VoxGrid();
  // Hyperboloid silhouette: wide base, narrow middle, flared top
  const profile = [5, 4.5, 4, 3.5, 3.5, 4, 4.5, 5];
  for (let z = 0; z < profile.length; z++) g.cyl(cx, cy, profile[z], z * 2, z * 2 + 1, CI_COOL);
  g.mark(8, 8, 17, CI_SMOKE);
  return g;
}

// ── Fallback (generic box) ───────────────────────────────────────────────────
function generic_building() {
  const g = new VoxGrid();
  g.box(4, 4, 0, 11, 11, 5, CI_BODY);
  g.mark(8, 8, 7, CI_BLINK);
  return g;
}

// ── Write all buildings ──────────────────────────────────────────────────────
const BUILDERS = {
  wood_harvester,
  coal_mine,
  iron_mine,
  water_pump,
  basic_factory,
  smelter,
  circuit_fab,
  refinery,
  storage_depot,
  research_center,
  trading_terminal,
  power_plant,
  silicon_extractor,
  uranium_extractor,
  exotic_lab,
  quantum_forge,
  fusion_plant,
  bio_reactor,
  singularity_tap,
  mind_matrix,
  reality_forge,
  radiator,
  cooling_tower
};

let count = 0;
for (const [id, build] of Object.entries(BUILDERS)) {
  const grid = build();
  const outPath = join(OUT_DIR, `${id}.vox`);
  writeFileSync(outPath, grid.toVox());
  console.log(`  ✓  ${id}.vox`);
  count++;
}
console.log(`\nGenerated ${count} .vox files → ${OUT_DIR}`);
