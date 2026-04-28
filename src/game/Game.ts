import * as THREE from 'three';
import type { GameState, BuildingInstance } from './GameState';
import { CameraController } from './CameraController';
import { SelectionManager } from './SelectionManager';
import { World } from './World';
import { Effects } from '../graphics/Effects';
import { AudioSystem } from '../systems/AudioSystem';
import { DayNightCycle } from '../graphics/DayNightCycle';
import * as ProductionSystem from '../systems/ProductionSystem';
import * as RouteSystem from '../systems/RouteSystem';
import * as EconomySystem from '../systems/EconomySystem';
import * as ResearchSystem from '../systems/ResearchSystem';
import * as BuildingSystem from '../systems/BuildingSystem';
import * as MaintenanceSystem from '../systems/MaintenanceSystem';
import * as AchievementSystem from '../systems/AchievementSystem';
import * as ContractSystem from '../systems/ContractSystem';
import * as LoanSystem from '../systems/LoanSystem';
import * as EventSystem from '../systems/EventSystem';
import * as SaveSystem from '../systems/SaveSystem';
import * as ScenarioSystem from '../systems/ScenarioSystem';
import * as HeatSystem from '../systems/HeatSystem';
import { TICK_RATE } from '../systems/EconomySystem';
import { BUILDINGS_MAP } from '../data/buildings';
import { ACHIEVEMENTS_MAP } from '../data/achievements';
import { LOAN_TIERS } from '../systems/LoanSystem';

const TICK_INTERVAL = 1 / TICK_RATE;

export class Game {
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private cameraController: CameraController;
  private selectionManager: SelectionManager;
  private world: World;
  private effects: Effects;
  private audio: AudioSystem;
  private dayNightCycle: DayNightCycle | null = null;
  private state: GameState;
  private lastTimestamp: number = 0;
  private tickAccumulator: number = 0;
  private running: boolean = false;
  private speed: 1 | 2 | 4 = 1;
  private onStateChange: ((state: GameState) => void) | null = null;
  private clickOverride: ((e: MouseEvent) => void) | null = null;
  private animFrameId: number = 0;
  private deltaTime: number = 0;
  private lastAutosaveTick: number = 0;

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
    const canvas = this.renderer.domElement;
    canvas.style.pointerEvents = 'none';

    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    this.scene.background = new THREE.Color(0x8db4da);
    this.scene.fog = new THREE.FogExp2(0x7ca5d0, 0.0033);

    this.camera.position.set(20, 30, 20);
    this.camera.lookAt(0, 0, 0);

    const ambient = new THREE.AmbientLight(0x6d78a8, 0.38);
    this.scene.add(ambient);

    const hemisphere = new THREE.HemisphereLight(0xa8d8ff, 0x22311e, 0.9);
    this.scene.add(hemisphere);

    const dirLight = new THREE.DirectionalLight(0xfff2d6, 2.15);
    dirLight.position.set(50, 80, 30);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 4096;
    dirLight.shadow.mapSize.height = 4096;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 600;
    dirLight.shadow.camera.left = -250;
    dirLight.shadow.camera.right = 250;
    dirLight.shadow.camera.top = 250;
    dirLight.shadow.camera.bottom = -250;
    dirLight.shadow.bias = -0.00015;
    dirLight.shadow.normalBias = 0.025;
    this.scene.add(dirLight);

    const rimLight = new THREE.DirectionalLight(0x8ed8ff, 0.5);
    rimLight.position.set(-90, 45, -30);
    this.scene.add(rimLight);

    const bloomLight = new THREE.PointLight(0x6dcbff, 1.1, 320, 2);
    bloomLight.position.set(0, 40, 0);
    this.scene.add(bloomLight);

    this.dayNightCycle = new DayNightCycle(ambient, dirLight, this.scene);

    this.applyState(this.state);
    this.render();

    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });

    canvas.addEventListener('mousemove', (e) => this.selectionManager.onMouseMove(e, canvas));
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    canvas.addEventListener('click', (e) => {
      if (this.clickOverride) {
        this.clickOverride(e);
      } else {
        this.selectionManager.onClick(e, canvas);
      }
    });

    canvas.style.pointerEvents = 'auto';

    this.running = true;
    this.animFrameId = requestAnimationFrame((ts) => this.gameLoop(ts));
  }

  newGame(): void {
    this.applyState(SaveSystem.createNewGame());
    if (this.onStateChange) this.onStateChange(this.state);
  }

  saveGame(): void {
    SaveSystem.save(this.state);
  }

  loadGame(): boolean {
    const loaded = SaveSystem.load();
    if (!loaded) return false;
    this.applyState(loaded);
    if (this.onStateChange) this.onStateChange(this.state);
    return true;
  }

  exportSave(): string {
    return SaveSystem.exportSave(this.state);
  }

  importSave(json: string): boolean {
    const loaded = SaveSystem.importSave(json);
    if (!loaded) return false;
    this.applyState(loaded);
    if (this.onStateChange) this.onStateChange(this.state);
    return true;
  }

  resetGame(): void {
    SaveSystem.deleteSave();
    this.applyState(SaveSystem.createNewGame());
    if (this.onStateChange) this.onStateChange(this.state);
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
    this.world.syncSpotMarkers(this.state.resourceSpots);
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

  startScenario(scenarioId: string): boolean {
    const ok = ScenarioSystem.startScenario(this.state, scenarioId);
    if (ok) {
      this.world.init(this.state);
      if (this.onStateChange) this.onStateChange(this.state);
    }
    return ok;
  }

  getSelectedBuilding(): BuildingInstance | undefined {
    const id = this.selectionManager.getSelected();
    if (!id) return undefined;
    return BuildingSystem.getBuildingById(this.state, id);
  }

  setOnStateChange(cb: (state: GameState) => void): void {
    this.onStateChange = cb;
  }

  private applyState(state: GameState): void {
    this.state = state;
    this.selectionManager.reset();
    this.world.init(this.state);

    for (const building of this.state.buildings) {
      const mesh = this.world.getBuildingMesh(building.id);
      if (mesh) this.selectionManager.registerBuilding(building.id, mesh);
    }
    this.world.syncSpotMarkers(this.state.resourceSpots);
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

  fulfillContract(contractId: string): boolean {
    const ok = ContractSystem.fulfillContract(this.state, contractId);
    if (ok && this.onStateChange) this.onStateChange(this.state);
    return ok;
  }

  takeLoan(tierIndex: number): boolean {
    const ok = LoanSystem.takeLoan(this.state, tierIndex);
    if (ok && this.onStateChange) this.onStateChange(this.state);
    return ok;
  }

  repayLoan(loanId: string): number {
    const amount = LoanSystem.repayLoan(this.state, loanId);
    if (amount > 0 && this.onStateChange) this.onStateChange(this.state);
    return amount;
  }

  setResearchSpecialization(spec: 'energy' | 'matter' | 'biology' | null): void {
    this.state.researchSpecialization = spec;
    if (this.onStateChange) this.onStateChange(this.state);
  }

  getLoanTiers() {
    return LOAN_TIERS;
  }

  getUpgradeCost(buildingId: string): number {
    const building = BuildingSystem.getBuildingById(this.state, buildingId);
    if (!building) return 0;
    const bt = BUILDINGS_MAP[building.typeId];
    if (!bt) return 0;
    return bt.baseCost * Math.pow(bt.upgradeCostMultiplier, building.level);
  }

  getRepairCost(buildingId: string): number {
    const building = BuildingSystem.getBuildingById(this.state, buildingId);
    if (!building) return 0;
    return MaintenanceSystem.getRepairCost(building);
  }

  repairBuilding(buildingId: string): boolean {
    const ok = MaintenanceSystem.repairBuilding(this.state, buildingId);
    if (ok) {
      // Unlock repair_crew achievement
      if (!this.state.unlockedAchievements.includes('repair_crew')) {
        this.state.unlockedAchievements.push('repair_crew');
        const ach = ACHIEVEMENTS_MAP['repair_crew'];
        this.state.alerts.push({
          id: crypto.randomUUID(),
          tick: this.state.tick,
          type: 'success',
          messageKey: 'alerts.achievement_unlocked',
          params: [ach?.nameKey ?? 'achievements.repair_crew.name', ach?.icon ?? '🔧']
        });
      }
      if (this.onStateChange) this.onStateChange(this.state);
    }
    return ok;
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
    let didTick = false;
    for (let i = 0; i < ticks; i++) {
      this.tick();
      didTick = true;
    }
    this.render();
    // Only notify the UI when the simulation state actually advanced —
    // avoids 60fps DOM rebuilds when no tick ran this frame.
    if (didTick && this.onStateChange) this.onStateChange(this.state);
    this.animFrameId = requestAnimationFrame((ts) => this.gameLoop(ts));
  }

  private tick(): void {
    if (this.state.settings.gamePaused) return;
    this.state.tick++;
    BuildingSystem.updatePowerState(this.state);
    ProductionSystem.tick(this.state, TICK_INTERVAL);
    RouteSystem.tick(this.state, TICK_INTERVAL);
    EconomySystem.tick(this.state, TICK_INTERVAL);
    ResearchSystem.tick(this.state, TICK_INTERVAL);
    MaintenanceSystem.tick(this.state, TICK_INTERVAL);
    ContractSystem.tick(this.state);
    LoanSystem.tick(this.state);
    EventSystem.tick(this.state);
    AchievementSystem.checkAchievements(this.state);
    ScenarioSystem.tick(this.state);
    HeatSystem.tick(this.state);
    if (this.state.settings.autosaveEnabled) {
      const intervalTicks = Math.floor(this.state.settings.autosaveIntervalMinutes * 60 * TICK_RATE);
      if (this.state.tick - this.lastAutosaveTick >= intervalTicks) {
        SaveSystem.autosave(this.state);
        this.lastAutosaveTick = this.state.tick;
      }
    }
    this.world.update(this.state, TICK_INTERVAL);
  }

  private render(): void {
    this.dayNightCycle?.update(this.deltaTime);
    this.cameraController.update(this.deltaTime);
    this.selectionManager.update();
    this.effects.update(this.deltaTime);
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
