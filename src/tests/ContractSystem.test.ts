import { describe, it, expect, beforeEach } from 'vitest';
import * as ContractSystem from '../systems/ContractSystem';
import { createTestGameState } from './testHelpers';
import type { GameState, Contract } from '../game/GameState';

function makeActiveContract(overrides: Partial<Contract> = {}): Contract {
  return {
    id: 'contract-1',
    partnerId: 'industrial_corp',
    resourceId: 'wood',
    amountRequired: 50,
    amountDelivered: 0,
    rewardCash: 1000,
    penaltyCash: 500,
    deadlineAtTick: 9999,
    status: 'active',
    ...overrides,
  };
}

describe('ContractSystem', () => {
  let state: GameState;

  beforeEach(() => {
    state = createTestGameState({ tick: 100, cash: 5000 });
  });

  it('getActiveContracts returns only active contracts', () => {
    state.contracts = [
      makeActiveContract({ id: 'c1', status: 'active' }),
      makeActiveContract({ id: 'c2', status: 'completed' }),
      makeActiveContract({ id: 'c3', status: 'failed' }),
    ];
    const active = ContractSystem.getActiveContracts(state);
    expect(active).toHaveLength(1);
    expect(active[0]!.id).toBe('c1');
  });

  it('getContractTicksRemaining calculates remaining ticks correctly', () => {
    const contract = makeActiveContract({ deadlineAtTick: 200 });
    state.tick = 150;
    expect(ContractSystem.getContractTicksRemaining(state, contract)).toBe(50);
  });

  it('getContractTicksRemaining returns 0 when past deadline', () => {
    const contract = makeActiveContract({ deadlineAtTick: 100 });
    state.tick = 200;
    expect(ContractSystem.getContractTicksRemaining(state, contract)).toBe(0);
  });

  it('fulfillContract returns false for unknown contract', () => {
    const ok = ContractSystem.fulfillContract(state, 'nonexistent');
    expect(ok).toBe(false);
  });

  it('fulfillContract returns false for completed contract', () => {
    state.contracts = [makeActiveContract({ id: 'c1', status: 'completed' })];
    const ok = ContractSystem.fulfillContract(state, 'c1');
    expect(ok).toBe(false);
  });

  it('fulfillContract delivers available inventory toward requirement', () => {
    state.inventory['wood'] = 30;
    state.contracts = [makeActiveContract({ id: 'c1', amountRequired: 50, amountDelivered: 0 })];
    const ok = ContractSystem.fulfillContract(state, 'c1');
    expect(ok).toBe(false); // not fully completed yet
    expect(state.contracts[0]!.amountDelivered).toBe(30);
    expect(state.inventory['wood']).toBe(0);
  });

  it('fulfillContract completes contract and awards cash when fully satisfied', () => {
    state.inventory['wood'] = 100;
    state.contracts = [makeActiveContract({ id: 'c1', amountRequired: 50, amountDelivered: 0, rewardCash: 800 })];
    const ok = ContractSystem.fulfillContract(state, 'c1');
    expect(ok).toBe(true);
    expect(state.contracts[0]!.status).toBe('completed');
    expect(state.cash).toBe(5000 + 800);
    expect(state.alerts.some((a) => a.messageKey === 'alerts.contract_completed')).toBe(true);
  });

  it('fulfillContract returns false when inventory is empty', () => {
    state.inventory['wood'] = 0;
    state.contracts = [makeActiveContract({ id: 'c1' })];
    const ok = ContractSystem.fulfillContract(state, 'c1');
    expect(ok).toBe(false);
  });

  it('tick expires overdue contracts and applies penalty', () => {
    const contract = makeActiveContract({ id: 'c1', deadlineAtTick: 50, penaltyCash: 200 });
    state.tick = 51;
    state.contracts = [contract];
    state.cash = 1000;
    ContractSystem.tick(state);
    expect(state.contracts[0]!.status).toBe('failed');
    expect(state.cash).toBe(800);
    expect(state.alerts.some((a) => a.messageKey === 'alerts.contract_failed')).toBe(true);
  });

  it('tick does not expire contracts before their deadline', () => {
    const contract = makeActiveContract({ id: 'c1', deadlineAtTick: 200 });
    state.tick = 100;
    state.contracts = [contract];
    ContractSystem.tick(state);
    expect(state.contracts[0]!.status).toBe('active');
  });

  it('tick penalty does not drop cash below 0', () => {
    const contract = makeActiveContract({ deadlineAtTick: 50, penaltyCash: 9999 });
    state.tick = 51;
    state.contracts = [contract];
    state.cash = 100;
    ContractSystem.tick(state);
    expect(state.cash).toBe(0);
  });
});
