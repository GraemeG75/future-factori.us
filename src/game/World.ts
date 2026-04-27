import * as THREE from 'three';
import type { GameState, BuildingInstance, RouteInstance, ResourceSpot } from './GameState';
import { ModelFactory } from '../graphics/ModelFactory';
import { RetroMaterials } from '../graphics/RetroMaterials';
import { BuildingAnimations } from '../graphics/BuildingAnimations';

/** Number of cargo capsules spread across each route. */
const CARGO_COUNT = 3;

export class World {
  private scene: THREE.Scene;
  private buildingMeshes: Map<string, THREE.Group> = new Map();
  private routeLines: Map<string, THREE.Line> = new Map();
  private cargoMeshes: Map<string, THREE.Mesh[]> = new Map();
  /** Pre-cached endpoint positions so updateCargoPosition never needs to look up or clone. */
  private routeEndpoints: Map<string, { from: THREE.Vector3; to: THREE.Vector3 }> = new Map();
  private buildingAnimations: BuildingAnimations;
  private spotMarkers: Map<string, THREE.Group> = new Map();
  private terrain: THREE.Object3D | null = null;
  private grid: THREE.Object3D | null = null;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.buildingAnimations = new BuildingAnimations(scene);
  }

  init(gameState: GameState): void {
    this.clearDynamicContent();

    this.terrain = ModelFactory.createTerrain(200, 200, 20);
    this.scene.add(this.terrain);

    this.grid = ModelFactory.createGridOverlay(200, 200);
    this.scene.add(this.grid);

    this.initSpotMarkers(gameState.resourceSpots);

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

  private clearDynamicContent(): void {
    for (const buildingId of this.buildingMeshes.keys()) {
      this.removeBuildingMesh(buildingId);
    }
    for (const routeId of this.routeLines.keys()) {
      this.removeRouteLine(routeId);
    }
    for (const marker of this.spotMarkers.values()) {
      this.scene.remove(marker);
    }
    this.spotMarkers.clear();

    if (this.terrain) {
      this.scene.remove(this.terrain);
      this.terrain = null;
    }
    if (this.grid) {
      this.scene.remove(this.grid);
      this.grid = null;
    }
  }

  addBuildingMesh(instance: BuildingInstance): THREE.Group {
    const group = ModelFactory.createBuilding(instance.typeId, instance.level);
    group.position.set(instance.position.x, instance.position.y, instance.position.z);
    group.rotation.y = instance.rotation;
    this.scene.add(group);
    this.buildingMeshes.set(instance.id, group);
    this.buildingAnimations.register(instance.id, group);
    return group;
  }

  /** Creates and places a marker for every resource spot. */
  initSpotMarkers(spots: ResourceSpot[]): void {
    this.spotMarkers.forEach((m) => this.scene.remove(m));
    this.spotMarkers.clear();
    for (const spot of spots) {
      const group = ModelFactory.createResourceSpot(spot.buildingTypeId);
      group.position.set(spot.position.x, spot.position.y, spot.position.z);
      group.visible = spot.occupiedByBuildingId === null;
      this.scene.add(group);
      this.spotMarkers.set(spot.id, group);
    }
  }

  /** Shows/hides spot markers depending on whether each spot is occupied. */
  syncSpotMarkers(spots: ResourceSpot[]): void {
    for (const spot of spots) {
      const marker = this.spotMarkers.get(spot.id);
      if (marker) marker.visible = spot.occupiedByBuildingId === null;
    }
  }

  removeBuildingMesh(buildingId: string): void {
    this.buildingAnimations.unregister(buildingId);
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

    // Cache endpoints once so updateCargoPosition never needs getBuildingPosition()
    this.routeEndpoints.set(route.id, { from: fromPos.clone(), to: toPos.clone() });

    // Spawn multiple capsules spread evenly along the route
    const capsules: THREE.Mesh[] = [];
    for (let i = 0; i < CARGO_COUNT; i++) {
      const cargo = ModelFactory.createCargoCapsule(route.resourceId);
      const progress = (route.progress + i / CARGO_COUNT) % 1;
      cargo.position.lerpVectors(fromPos, toPos, progress);
      cargo.position.y += 0.2;
      this.scene.add(cargo);
      capsules.push(cargo);
    }
    this.cargoMeshes.set(route.id, capsules);
  }

  removeRouteLine(routeId: string): void {
    const line = this.routeLines.get(routeId);
    if (line) {
      this.scene.remove(line);
      line.geometry.dispose();
      (line.material as THREE.Material).dispose();
      this.routeLines.delete(routeId);
    }
    this.routeEndpoints.delete(routeId);
    const capsules = this.cargoMeshes.get(routeId);
    if (capsules) {
      for (const cargo of capsules) {
        this.scene.remove(cargo);
        cargo.geometry.dispose();
        (cargo.material as THREE.Material).dispose();
      }
      this.cargoMeshes.delete(routeId);
    }
  }

  updateCargoPosition(route: RouteInstance): void {
    const capsules = this.cargoMeshes.get(route.id);
    if (!capsules) return;
    const endpoints = this.routeEndpoints.get(route.id);
    if (!endpoints) return;
    for (let i = 0; i < capsules.length; i++) {
      const progress = (route.progress + i / CARGO_COUNT) % 1;
      capsules[i]!.position.lerpVectors(endpoints.from, endpoints.to, progress);
      capsules[i]!.position.y += 0.2;
    }
  }

  update(gameState: GameState, deltaTime: number): void {
    for (const route of gameState.routes) {
      this.updateCargoPosition(route);
    }
    this.buildingAnimations.update(deltaTime);
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

  dispose(): void {
    this.clearDynamicContent();
    this.buildingAnimations.dispose();
  }
}
