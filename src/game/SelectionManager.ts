import * as THREE from 'three';
import { ModelFactory } from '../graphics/ModelFactory';

export class SelectionManager {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private selected: string | null = null;
  private hovered: string | null = null;
  private buildingMeshMap: Map<string, THREE.Object3D> = new Map();
  private selectionRing: THREE.Mesh | null = null;
  private onSelectCallback: ((buildingId: string | null) => void) | null = null;
  private raycaster: THREE.Raycaster;
  private mouse: THREE.Vector2;

  constructor(scene: THREE.Scene, camera: THREE.PerspectiveCamera) {
    this.scene = scene;
    this.camera = camera;
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    this.selectionRing = ModelFactory.createSelectionRing();
    this.selectionRing.visible = false;
    this.scene.add(this.selectionRing);
  }

  registerBuilding(buildingId: string, mesh: THREE.Object3D): void {
    this.buildingMeshMap.set(buildingId, mesh);
  }

  unregisterBuilding(buildingId: string): void {
    if (this.selected === buildingId) {
      this.clearSelection();
    }
    if (this.hovered === buildingId) {
      this.hovered = null;
    }
    this.buildingMeshMap.delete(buildingId);
  }

  private getNormalizedMouseCoords(e: MouseEvent, canvas: HTMLCanvasElement): THREE.Vector2 {
    const rect = canvas.getBoundingClientRect();
    return new THREE.Vector2(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
  }

  private pickBuilding(mouseCoords: THREE.Vector2): string | null {
    this.raycaster.setFromCamera(mouseCoords, this.camera);
    const meshes: THREE.Object3D[] = [];
    for (const mesh of this.buildingMeshMap.values()) {
      meshes.push(mesh);
    }
    const intersects = this.raycaster.intersectObjects(meshes, true);
    if (intersects.length === 0) {
      return null;
    }
    const hit = intersects[0]!.object;
    for (const [id, mesh] of this.buildingMeshMap) {
      if (mesh === hit || (mesh as THREE.Group).children?.includes(hit) || hit.parent === mesh) {
        return id;
      }
    }
    // Walk up the parent chain
    let obj: THREE.Object3D | null = hit;
    while (obj) {
      for (const [id, mesh] of this.buildingMeshMap) {
        if (mesh === obj) {
          return id;
        }
      }
      obj = obj.parent;
    }
    return null;
  }

  onMouseMove(e: MouseEvent, canvas: HTMLCanvasElement): void {
    this.mouse = this.getNormalizedMouseCoords(e, canvas);
    this.hovered = this.pickBuilding(this.mouse);
  }

  onClick(e: MouseEvent, canvas: HTMLCanvasElement): void {
    const coords = this.getNormalizedMouseCoords(e, canvas);
    const picked = this.pickBuilding(coords);
    if (picked === this.selected) {
      this.clearSelection();
      return;
    }
    this.selected = picked;
    if (this.onSelectCallback) {
      this.onSelectCallback(this.selected);
    }
  }

  getSelected(): string | null {
    return this.selected;
  }

  getHovered(): string | null {
    return this.hovered;
  }

  setOnSelect(callback: (id: string | null) => void): void {
    this.onSelectCallback = callback;
  }

  clearSelection(): void {
    this.selected = null;
    if (this.selectionRing) {
      this.selectionRing.visible = false;
    }
    if (this.onSelectCallback) {
      this.onSelectCallback(null);
    }
  }

  reset(): void {
    this.clearSelection();
    this.hovered = null;
    this.buildingMeshMap.clear();
  }

  update(): void {
    if (!this.selectionRing) {
      return;
    }
    if (this.selected) {
      const mesh = this.buildingMeshMap.get(this.selected);
      if (mesh) {
        this.selectionRing.visible = true;
        this.selectionRing.position.set(mesh.position.x, mesh.position.y + 0.05, mesh.position.z);
      }
    } else {
      this.selectionRing.visible = false;
    }
  }
}
