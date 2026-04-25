import * as THREE from 'three';
import type { GameState, BuildingInstance, RouteInstance } from './GameState';
import { ModelFactory } from '../graphics/ModelFactory';
import { RetroMaterials } from '../graphics/RetroMaterials';

export class World {
  private scene: THREE.Scene;
  private buildingMeshes: Map<string, THREE.Group> = new Map();
  private routeLines: Map<string, THREE.Line> = new Map();
  private cargoMeshes: Map<string, THREE.Mesh> = new Map();

  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  init(gameState: GameState): void {
    const terrain = ModelFactory.createTerrain(200, 200, 20);
    this.scene.add(terrain);

    const grid = ModelFactory.createGridOverlay(200, 200);
    this.scene.add(grid);

    for (const building of gameState.buildings) {
      this.addBuildingMesh(building);
    }

    for (const route of gameState.routes) {
      const from = this.getBuildingPosition(route.fromBuildingId);
      const to = this.getBuildingPosition(route.toBuildingId);
      if (from && to) {
        this.addRouteLine(route, from, to);
      }
    }
  }

  addBuildingMesh(instance: BuildingInstance): THREE.Group {
    const group = ModelFactory.createBuilding(instance.typeId, instance.level);
    group.position.set(instance.position.x, instance.position.y, instance.position.z);
    group.rotation.y = instance.rotation;
    this.scene.add(group);
    this.buildingMeshes.set(instance.id, group);
    return group;
  }

  removeBuildingMesh(buildingId: string): void {
    const mesh = this.buildingMeshes.get(buildingId);
    if (mesh) {
      this.scene.remove(mesh);
      this.buildingMeshes.delete(buildingId);
    }
  }

  updateBuildingMesh(instance: BuildingInstance): void {
    const mesh = this.buildingMeshes.get(instance.id);
    if (mesh) {
      mesh.position.set(instance.position.x, instance.position.y, instance.position.z);
      mesh.rotation.y = instance.rotation;
    }
  }

  addRouteLine(route: RouteInstance, fromPos: THREE.Vector3, toPos: THREE.Vector3): void {
    const points = [fromPos.clone(), toPos.clone()];
    points[0]!.y += 0.1;
    points[1]!.y += 0.1;
    const geo = new THREE.BufferGeometry().setFromPoints(points);
    const mat = RetroMaterials.forRoute(route.resourceId);
    const line = new THREE.Line(geo, mat);
    this.scene.add(line);
    this.routeLines.set(route.id, line);

    const cargo = ModelFactory.createCargoCapsule(route.resourceId);
    cargo.position.copy(fromPos);
    cargo.position.y += 0.2;
    this.scene.add(cargo);
    this.cargoMeshes.set(route.id, cargo);
  }

  removeRouteLine(routeId: string): void {
    const line = this.routeLines.get(routeId);
    if (line) {
      this.scene.remove(line);
      line.geometry.dispose();
      (line.material as THREE.Material).dispose();
      this.routeLines.delete(routeId);
    }
    const cargo = this.cargoMeshes.get(routeId);
    if (cargo) {
      this.scene.remove(cargo);
      cargo.geometry.dispose();
      (cargo.material as THREE.Material).dispose();
      this.cargoMeshes.delete(routeId);
    }
  }

  updateCargoPosition(route: RouteInstance): void {
    const cargo = this.cargoMeshes.get(route.id);
    if (!cargo) return;
    const from = this.getBuildingPosition(route.fromBuildingId);
    const to = this.getBuildingPosition(route.toBuildingId);
    if (from && to) {
      cargo.position.lerpVectors(from, to, route.progress);
      cargo.position.y += 0.2;
    }
  }

  update(gameState: GameState, _deltaTime: number): void {
    for (const route of gameState.routes) {
      this.updateCargoPosition(route);
    }
  }

  getBuildingMesh(buildingId: string): THREE.Group | undefined {
    return this.buildingMeshes.get(buildingId);
  }

  getBuildingPosition(buildingId: string): THREE.Vector3 | undefined {
    const mesh = this.buildingMeshes.get(buildingId);
    if (mesh) return mesh.position.clone();
    return undefined;
  }

  getScene(): THREE.Scene {
    return this.scene;
  }
}
