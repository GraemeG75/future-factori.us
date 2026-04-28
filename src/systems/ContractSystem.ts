import { RESOURCES_MAP } from '../data/resources';
import { TRADE_PARTNERS, TRADE_PARTNERS_MAP } from '../data/tradePartners';
import type { Contract, GameState } from '../game/GameState';

/** How often (in ticks) to attempt generating a new contract. */
const CONTRACT_GENERATION_INTERVAL = 600; // every 30 s at 20 tps
/** Maximum number of simultaneously active contracts. */
const MAX_ACTIVE_CONTRACTS = 5;
/** Contract duration in ticks. */
const CONTRACT_DURATION_TICKS = 6000; // 5 minutes at 20 tps
/** Reward multiplier relative to sell price * amount. */
const REWARD_MULTIPLIER = 1.4;
/** Penalty as a fraction of the reward. */
const PENALTY_FRACTION = 0.5;
/** Minimum amount to demand per contract. */
const CONTRACT_MIN_AMOUNT = 10;
/** Maximum amount to demand per contract. */
const CONTRACT_MAX_AMOUNT = 80;

/**
 * Advances contract logic: checks for expired contracts and attempts to
 * generate new ones periodically.
 */
export function tick(state: GameState): void {
  // Expire contracts that have passed their deadline
  for (const contract of state.contracts) {
    if (contract.status !== 'active' && contract.status !== 'offered') continue;
    if (state.tick >= contract.deadlineAtTick) {
      if (contract.status === 'active') {
        // Only penalise contracts the player explicitly accepted
        contract.status = 'failed';
        state.cash = Math.max(0, state.cash - contract.penaltyCash);
        state.alerts.push({
          id: crypto.randomUUID(),
          tick: state.tick,
          type: 'error',
          messageKey: 'alerts.contract_failed',
          params: [contract.resourceId, String(contract.rewardCash)]
        });
      } else {
        // Offered but not accepted — quietly expire
        contract.status = 'expired';
      }
    }
  }

  // Periodically try to generate a new contract
  if (state.tick % CONTRACT_GENERATION_INTERVAL === 0) {
    generateContract(state);
  }
}

/**
 * Attempts to fulfil a specific contract by consuming resources from inventory.
 * Returns true if the contract was fully satisfied.
 */
export function fulfillContract(state: GameState, contractId: string): boolean {
  const contract = state.contracts.find((c) => c.id === contractId);
  if (!contract || contract.status !== 'active') return false;

  const available = state.inventory[contract.resourceId] ?? 0;
  const needed = contract.amountRequired - contract.amountDelivered;
  if (available <= 0 || needed <= 0) return false;

  const toDeliver = Math.min(available, needed);
  state.inventory[contract.resourceId] = available - toDeliver;
  contract.amountDelivered += toDeliver;

  if (contract.amountDelivered >= contract.amountRequired) {
    contract.status = 'completed';
    state.cash += contract.rewardCash;
    state.alerts.push({
      id: crypto.randomUUID(),
      tick: state.tick,
      type: 'success',
      messageKey: 'alerts.contract_completed',
      params: [contract.resourceId, String(contract.rewardCash)]
    });
    return true;
  }

  return false;
}

/** Accepts an offered contract, making it active and enforceable. */
export function acceptContract(state: GameState, contractId: string): boolean {
  const contract = state.contracts.find((c) => c.id === contractId);
  if (!contract || contract.status !== 'offered') return false;
  contract.status = 'active';
  contract.acceptedAtTick = state.tick;
  return true;
}

/** Returns all currently active contracts. */
export function getActiveContracts(state: GameState): Contract[] {
  return state.contracts.filter((c) => c.status === 'active');
}

/** Returns all offered (not yet accepted) contracts. */
export function getOfferedContracts(state: GameState): Contract[] {
  return state.contracts.filter((c) => c.status === 'offered');
}

/** Returns the number of ticks remaining before a contract expires. */
export function getContractTicksRemaining(state: GameState, contract: Contract): number {
  return Math.max(0, contract.deadlineAtTick - state.tick);
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function generateContract(state: GameState): void {
  const active = getActiveContracts(state);
  if (active.length >= MAX_ACTIVE_CONTRACTS) return;

  // Pick an unlocked partner at random
  const availablePartners = TRADE_PARTNERS.filter((p) => !p.unlockRequirement || state.completedResearch.includes(p.unlockRequirement));
  if (availablePartners.length === 0) return;
  const partner = availablePartners[Math.floor(Math.random() * availablePartners.length)]!;

  // Pick a preferred resource that the partner wants
  const candidateResources = [...partner.preferredResources, ...Object.keys(RESOURCES_MAP)].filter((rId) => {
    const r = RESOURCES_MAP[rId];
    if (!r) return false;
    if (r.unlockRequirement && !state.completedResearch.includes(r.unlockRequirement)) return false;
    return true;
  });

  if (candidateResources.length === 0) return;
  const resourceId = candidateResources[Math.floor(Math.random() * candidateResources.length)]!;
  const resource = RESOURCES_MAP[resourceId];
  if (!resource) return;

  const amount = Math.round(CONTRACT_MIN_AMOUNT + Math.random() * (CONTRACT_MAX_AMOUNT - CONTRACT_MIN_AMOUNT));
  const partnerData = TRADE_PARTNERS_MAP[partner.id];
  const basePrice = partnerData ? resource.basePrice * partnerData.priceModifier : resource.basePrice;
  const rewardCash = Math.round(basePrice * amount * REWARD_MULTIPLIER);
  const penaltyCash = Math.round(rewardCash * PENALTY_FRACTION);

  const contract: Contract = {
    id: crypto.randomUUID(),
    partnerId: partner.id,
    resourceId,
    amountRequired: amount,
    amountDelivered: 0,
    rewardCash,
    penaltyCash,
    deadlineAtTick: state.tick + CONTRACT_DURATION_TICKS,
    status: 'offered'
  };

  state.contracts.push(contract);
  state.alerts.push({
    id: crypto.randomUUID(),
    tick: state.tick,
    type: 'info',
    messageKey: 'alerts.contract_new',
    params: [resourceId, String(amount), String(rewardCash)]
  });
}
