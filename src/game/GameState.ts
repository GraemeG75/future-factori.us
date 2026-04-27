/** Central game state types used by all systems. */

export interface ResourceSpot {
  id: string;
  /** The harvester building type that can be placed here. */
  buildingTypeId: string;
  position: { x: number; y: number; z: number };
  /** null when empty; set to the placed building's id when occupied. */
  occupiedByBuildingId: string | null;
  /** Remaining units in this deposit. Undefined on legacy saves (treated as infinite). */
  remaining: number;
  /** Maximum deposit size (units at world-gen time). */
  maxRemaining: number;
}

/** A timed delivery contract issued by a trade partner. */
export interface Contract {
  id: string;
  partnerId: string;
  resourceId: string;
  /** Total amount to deliver. */
  amountRequired: number;
  /** Amount fulfilled so far. */
  amountDelivered: number;
  /** Cash reward on successful completion. */
  rewardCash: number;
  /** Cash penalty if contract expires unfulfilled. */
  penaltyCash: number;
  /** Tick at which the contract expires. */
  deadlineAtTick: number;
  /** offered: generated but not accepted | active: accepted and enforceable */
  status: 'offered' | 'active' | 'completed' | 'failed' | 'expired';
  /** Tick when the player accepted the contract (undefined for unaccepted offers). */
  acceptedAtTick?: number;
}

/** A cash loan taken by the player. */
export interface Loan {
  id: string;
  /** Original amount borrowed. */
  principal: number;
  /** Remaining balance including accrued interest. */
  remainingBalance: number;
  /** Annual interest rate as a fraction (e.g. 0.10 = 10%). */
  annualInterestRate: number;
  /** Tick when the loan was taken. */
  takenAtTick: number;
  /** Tick when the full balance is due (hard deadline). */
  dueAtTick: number;
}

/** A market/regulation event that temporarily shifts prices or demand. */
export interface MarketEvent {
  id: string;
  /** i18n key for display. */
  messageKey: string;
  /** Tick when the event started. */
  startTick: number;
  /** Duration in ticks. */
  durationTicks: number;
  /** Optional: only affects this trade partner. */
  affectedPartnerId?: string;
  /** Optional: only affects this resource. */
  affectedResourceId?: string;
  /** Price/demand multiplier (e.g. 1.5 = +50%, 0.7 = −30%). */
  modifier: number;
}

export interface GameState {
  /** Save format version for migration. */
  version: number;
  /** Game tick counter (incremented at TICK_RATE per second). */
  tick: number;
  cash: number;
  researchPoints: number;
  /** resourceId -> current amount held in global inventory. */
  inventory: Record<string, number>;
  buildings: BuildingInstance[];
  routes: RouteInstance[];
  activeResearch: ActiveResearch | null;
  /** Technology ids that have been fully researched. */
  completedResearch: string[];
  tradeHistory: TradeRecord[];
  alerts: GameAlert[];
  settings: GameSettings;
  locale: string;
  worldSeed: number;
  /** Trade partner demand: partnerId -> resourceId -> 0-1 factor. */
  demand: Record<string, Record<string, number>>;
  /** World spots where harvesters can be built. */
  resourceSpots: ResourceSpot[];
  /** Global pollution level 0–100 produced by running factories. */
  pollution: number;
  /** Achievement ids that have been unlocked. */
  unlockedAchievements: string[];
  /** Active and historical delivery contracts. */
  contracts: Contract[];
  /** Outstanding loans taken by the player. */
  loans: Loan[];
  /**
   * Recent sell-price history: partnerId -> resourceId -> array of recent prices
   * (most recent at the end, capped at PRICE_HISTORY_LENGTH).
   */
  priceHistory: Record<string, Record<string, number[]>>;
  /** Currently active market/regulation events. */
  activeMarketEvents: MarketEvent[];
  /** Which research specialization the player is pursuing (chosen freely). */
  researchSpecialization: 'energy' | 'matter' | 'biology' | null;
  /** Id of the active scenario, or null in freeplay */
  activeScenarioId: string | null;
  /** Current scenario status */
  scenarioStatus: 'active' | 'won' | 'lost' | null;
  /** Current scenario score */
  scenarioScore: number;
  /** If true, resource deposits never deplete */
  sandboxMode: boolean;
}

export interface BuildingInstance {
  /** Unique uuid. */
  id: string;
  /** References BuildingType.id. */
  typeId: string;
  level: number;
  position: { x: number; y: number; z: number };
  rotation: number;
  health: number;
  activeRecipeId: string | null;
  /** Production cycle progress 0-1. */
  productionProgress: number;
  inputBuffer: Record<string, number>;
  outputBuffer: Record<string, number>;
  isPowered: boolean;
  assignedRouteIds: string[];
}

export interface RouteInstance {
  id: string;
  fromBuildingId: string;
  toBuildingId: string;
  resourceId: string;
  /** Max amount per trip. */
  capacity: number;
  /** World units per second travel speed. */
  speed: number;
  currentLoad: number;
  /** Trip progress 0-1. */
  progress: number;
  isActive: boolean;
  costPerTrip: number;
}

export interface ActiveResearch {
  technologyId: string;
  /** Accumulated research points toward the technology cost. */
  progress: number;
  /** Tick when research was started. */
  startedAt: number;
}

export interface TradeRecord {
  tick: number;
  partnerId: string;
  resourceId: string;
  amount: number;
  price: number;
  totalValue: number;
}

export interface GameAlert {
  id: string;
  tick: number;
  type: 'info' | 'warning' | 'success' | 'error';
  messageKey: string;
  params?: string[];
}

export interface GameSettings {
  soundEnabled: boolean;
  musicEnabled: boolean;
  gamePaused: boolean;
  gameSpeed: 1 | 2 | 4;
  autosaveEnabled: boolean;
  autosaveIntervalMinutes: number;
}
