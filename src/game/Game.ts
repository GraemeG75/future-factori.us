import * as THREE from 'three';
import type { GameState, BuildingInstance } from './GameState';
import { CameraController } from './CameraController';
import { SelectionManager } from './SelectionManager';
import { World } from './World';
import { Effects } from '../graphics/Effects';
import { DayNightCycle } from '../graphics/DayNightCycle';
import { AudioSystem } from '../systems/AudioSystem';
import * as ProductionSystem from '../systems/ProductionSystem';
import * as RouteSystem from '../systems/RouteSystem';
import * as EconomySystem from '../systems/EconomySystem';
import * as ResearchSystem from '../systems/ResearchSystem';
import * as BuildingSystem from '../systems/BuildingSystem';
import * as SaveSystem from '../systems/SaveSystem';
import { TICK_RATE, AUTOSAVE_TICKS } from '../systems/EconomySystem';
import { BUILDINGS_MAP } from '../data/buildings';

const TICK_INTERVAL = 1 / TICK_RATE;

export class Game {
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private cameraController: CameraController;
  private selectionManager: SelectionManager;
  private world: World;
  private effects: Effects;
  private dayNightCycle: DayNightCycle | null = null;
  private audio: AudioSystem;
  private state: GameState;
  private lastTimestamp: number = 0;
  private tickAccumulator: number = 0;
  private running: boolean = false;
  private speed: 1 | 2 | 4 = 1;
  private onStateChange: ((state: GameState) => void) | null = null;
  private clickOverride: ((e: MouseEvent) => void) | null = null;
  private animFrameId: number = 0;
  private deltaTime: number = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(60, canvas.width / canvas.height, 0.1, 1000);
    this.world = new World(this.scene);
    this.effects = new Effects(this.scene);
    this.audio = new AudioSystem();
    this.cameraController = new CameraController(this.camera, canvas);
    this.selectionManager = new SelectionManager(this.scene, this.camera);
    this.state = SaveSystem.load() ?? SaveSystem.createNewGame();
  }

  async init(): Promise<void> {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.scene.background = new THREE.Color(0x0a0a0f);
    this.scene.fog = new THREE.FogExp2(0x0a0a0f, 0.008);

    this.camera.position.set(20, 30, 20);
    this.camera.lookAt(0, 0, 0);

    const ambient = new THREE.AmbientLight(0x404060, 0.5);
    this.scene.add(ambient);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
    dirLight.position.set(50, 80, 50);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 300;
    dirLight.shadow.camera.left = -100;
    dirLight.shadow.camera.right = 100;
    dirLight.shadow.camera.top = 100;
    dirLight.shadow.camera.bottom = -100;
    this.scene.add(dirLight);

    this.dayNightCycle = new DayNightCycle(ambient, dirLight, this.scene);

    this.world.init(this.state);

    for (const building of this.state.buildings) {
      const mesh = this.world.getBuildingMesh(building.id);
      if (mesh) this.selectionManager.registerBuilding(building.id, mesh);
    }

    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });

    const canvas = this.renderer.domElement;
    canvas.addEventListener('mousemove', (e) => this.selectionManager.onMouseMove(e, canvas));
    canvas.addEventListener('click', (e) => {
      if (this.clickOverride) {
        this.clickOverride(e);
      } else {
        this.selectionManager.onClick(e, canvas);
      }
    });

    this.running = true;
    this.animFrameId = requestAnimationFrame((ts) => this.gameLoop(ts));
  }

  newGame(): void {
    this.state = SaveSystem.createNewGame();
    this.world.init(this.state);
  }

  saveGame(): void {
    SaveSystem.save(this.state);
  }

  loadGame(): boolean {
    const loaded = SaveSystem.load();
    if (!loaded) return false;
    this.state = loaded;
    return true;
  }

  resetGame(): void {
    SaveSystem.deleteSave();
    this.state = SaveSystem.createNewGame();
  }

  pause(): void {
    this.state.settings.gamePaused = true;
  }

  resume(): void {
    this.state.settings.gamePaused = false;
  }

  setSpeed(speed: 1 | 2 | 4): void {
    this.speed = speed;
    this.state.settings.gameSpeed = speed;
  }

  placeBuilding(typeId: string, position: { x: number; z: number }): boolean {
    const fullPos = { x: position.x, y: 0, z: position.z };
    const building = BuildingSystem.placeBuilding(this.state, typeId, fullPos);
    if (!building) return false;
    const mesh = this.world.addBuildingMesh(building);
    this.selectionManager.registerBuilding(building.id, mesh);
    this.audio.playBuild();
    if (this.onStateChange) this.onStateChange(this.state);
    return true;
  }

  createRoute(fromId: string, toId: string, resourceId: string): boolean {
    const route = RouteSystem.createRoute(this.state, fromId, toId, resourceId, 10);
    if (!route) return false;
    const from = this.world.getBuildingPosition(fromId);
    const to = this.world.getBuildingPosition(toId);
    if (from && to) {
      this.world.addRouteLine(route, from, to);
    }
    if (this.onStateChange) this.onStateChange(this.state);
    return true;
  }

  sell(resourceId: string, amount: number, partnerId: string): boolean {
    const result = EconomySystem.sellResource(this.state, resourceId, amount, partnerId);
    if (result) {
      this.audio.playTradeComplete();
      if (this.onStateChange) this.onStateChange(this.state);
    }
    return result;
  }

  startResearch(techId: string): boolean {
    const result = ResearchSystem.startResearch(this.state, techId);
    if (result && this.onStateChange) this.onStateChange(this.state);
    return result;
  }

  getState(): GameState {
    return this.state;
  }

  getSelectedBuilding(): BuildingInstance | undefined {
    const id = this.selectionManager.getSelected();
    if (!id) return undefined;
    return BuildingSystem.getBuildingById(this.state, id);
  }

  setOnStateChange(cb: (state: GameState) => void): void {
    this.onStateChange = cb;
  }

  setClickOverride(handler: ((e: MouseEvent) => void) | null): void {
    this.clickOverride = handler;
  }

  setOnSelect(cb: (buildingId: string | null) => void): void {
    this.selectionManager.setOnSelect(cb);
  }

  getWorldPositionFromEvent(e: MouseEvent): { x: number; z: number } | null {
    const canvas = this.renderer.domElement;
    const rect = canvas.getBoundingClientRect();
    const mx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const my = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(mx, my), this.camera);
    const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const target = new THREE.Vector3();
    const hit = raycaster.ray.intersectPlane(groundPlane, target);
    if (!hit) return null;
    return { x: Math.round(target.x), z: Math.round(target.z) };
  }

  upgradeBuilding(buildingId: string): boolean {
    const result = BuildingSystem.upgradeBuilding(this.state, buildingId);
    if (result) {
      const building = BuildingSystem.getBuildingById(this.state, buildingId);
      if (building) this.world.updateBuildingMesh(building);
      if (this.onStateChange) this.onStateChange(this.state);
    }
    return result;
  }

  demolishBuilding(buildingId: string): void {
    this.world.removeBuildingMesh(buildingId);
    this.selectionManager.unregisterBuilding(buildingId);
    BuildingSystem.removeBuilding(this.state, buildingId);
    if (this.onStateChange) this.onStateChange(this.state);
  }

  setRecipe(buildingId: string, recipeId: string | null): void {
    const building = BuildingSystem.getBuildingById(this.state, buildingId);
    if (building) {
      building.activeRecipeId = recipeId;
      building.productionProgress = 0;
      if (this.onStateChange) this.onStateChange(this.state);
    }
  }

  removeRoute(routeId: string): void {
    this.world.removeRouteLine(routeId);
    RouteSystem.removeRoute(this.state, routeId);
    if (this.onStateChange) this.onStateChange(this.state);
  }

  cancelResearch(): void {
    ResearchSystem.cancelResearch(this.state);
    if (this.onStateChange) this.onStateChange(this.state);
  }

  getUpgradeCost(buildingId: string): number {
    const building = BuildingSystem.getBuildingById(this.state, buildingId);
    if (!building) return 0;
    const bt = BUILDINGS_MAP[building.typeId];
    if (!bt) return 0;
    return bt.baseCost * Math.pow(bt.upgradeCostMultiplier, building.level);
  }

  private gameLoop(timestamp: number): void {
    if (!this.running) return;
    this.deltaTime = (timestamp - this.lastTimestamp) / 1000;
    this.lastTimestamp = timestamp;
    const realDelta = Math.min(this.deltaTime, 0.1);
    const scaledDelta = realDelta * this.speed;
    this.tickAccumulator += scaledDelta;
    const ticks = Math.min(Math.floor(this.tickAccumulator / TICK_INTERVAL), 5);
    this.tickAccumulator -= ticks * TICK_INTERVAL;
    for (let i = 0; i < ticks; i++) {
      this.tick();
    }
    this.render();
    if (this.onStateChange) this.onStateChange(this.state);
    this.animFrameId = requestAnimationFrame((ts) => this.gameLoop(ts));
  }

  private tick(): void {
    if (this.state.settings.gamePaused) return;
    this.state.tick++;
    ProductionSystem.tick(this.state, TICK_INTERVAL);
    RouteSystem.tick(this.state, TICK_INTERVAL);
    EconomySystem.tick(this.state, TICK_INTERVAL);
    ResearchSystem.tick(this.state, TICK_INTERVAL);
    if (this.state.tick % AUTOSAVE_TICKS === 0 && this.state.settings.autosaveEnabled) {
      SaveSystem.autosave(this.state);
    }
    this.world.update(this.state, TICK_INTERVAL);
  }

  private render(): void {
    this.cameraController.update(this.deltaTime);
    this.selectionManager.update();
    this.effects.update(this.deltaTime);
    if (this.dayNightCycle) this.dayNightCycle.update(this.deltaTime);
    this.renderer.render(this.scene, this.camera);
  }

  dispose(): void {
    this.running = false;
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
    this.cameraController.dispose();
    this.effects.dispose();
    this.world.dispose();
    this.renderer.dispose();
  }
}
