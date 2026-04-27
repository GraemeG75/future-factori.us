import { describe, it, expect, beforeEach } from 'vitest';
import * as LoanSystem from '../systems/LoanSystem';
import { createTestGameState } from './testHelpers';
import type { GameState, Loan } from '../game/GameState';

function makeLoan(overrides: Partial<Loan> = {}): Loan {
  return {
    id: 'loan-1',
    principal: 1000,
    remainingBalance: 1000,
    annualInterestRate: 0.05,
    takenAtTick: 0,
    dueAtTick: 10000,
    ...overrides,
  };
}

describe('LoanSystem', () => {
  let state: GameState;

  beforeEach(() => {
    state = createTestGameState({ tick: 0, cash: 5000 });
  });

  it('LOAN_TIERS exports at least one tier', () => {
    expect(LoanSystem.LOAN_TIERS.length).toBeGreaterThan(0);
  });

  it('takeLoan adds cash and creates a loan record', () => {
    const ok = LoanSystem.takeLoan(state, 0);
    expect(ok).toBe(true);
    expect(state.loans).toHaveLength(1);
    const tier = LoanSystem.LOAN_TIERS[0]!;
    expect(state.cash).toBe(5000 + tier.principal);
    expect(state.loans[0]!.principal).toBe(tier.principal);
    expect(state.loans[0]!.remainingBalance).toBe(tier.principal);
    expect(state.alerts.some((a) => a.messageKey === 'alerts.loan_taken')).toBe(true);
  });

  it('takeLoan returns false for invalid tier index', () => {
    const ok = LoanSystem.takeLoan(state, 999);
    expect(ok).toBe(false);
    expect(state.loans).toHaveLength(0);
  });

  it('takeLoan allows up to 3 outstanding loans', () => {
    LoanSystem.takeLoan(state, 0);
    LoanSystem.takeLoan(state, 0);
    LoanSystem.takeLoan(state, 0);
    expect(state.loans).toHaveLength(3);
    const fourth = LoanSystem.takeLoan(state, 0);
    expect(fourth).toBe(false);
    expect(state.loans).toHaveLength(3);
  });

  it('canTakeLoan returns false when at maximum', () => {
    state.loans = [makeLoan({ id: 'l1' }), makeLoan({ id: 'l2' }), makeLoan({ id: 'l3' })];
    expect(LoanSystem.canTakeLoan(state)).toBe(false);
  });

  it('canTakeLoan returns true when under maximum', () => {
    state.loans = [makeLoan()];
    expect(LoanSystem.canTakeLoan(state)).toBe(true);
  });

  it('repayLoan reduces balance and deducts cash', () => {
    state.cash = 800;
    state.loans = [makeLoan({ remainingBalance: 600 })];
    const paid = LoanSystem.repayLoan(state, 'loan-1');
    expect(paid).toBe(600);
    expect(state.cash).toBe(200);
    expect(state.loans[0]!.remainingBalance).toBe(0);
    expect(state.alerts.some((a) => a.messageKey === 'alerts.loan_repaid')).toBe(true);
  });

  it('repayLoan is capped by available cash', () => {
    state.cash = 300;
    state.loans = [makeLoan({ remainingBalance: 1000 })];
    const paid = LoanSystem.repayLoan(state, 'loan-1');
    expect(paid).toBe(300);
    expect(state.cash).toBe(0);
    expect(state.loans[0]!.remainingBalance).toBeCloseTo(700, 0);
  });

  it('repayLoan returns 0 for unknown loan', () => {
    const paid = LoanSystem.repayLoan(state, 'unknown');
    expect(paid).toBe(0);
  });

  it('repayLoan returns 0 for already paid loan', () => {
    state.loans = [makeLoan({ remainingBalance: 0 })];
    const paid = LoanSystem.repayLoan(state, 'loan-1');
    expect(paid).toBe(0);
  });

  it('getTotalDebt sums all outstanding balances', () => {
    state.loans = [
      makeLoan({ id: 'l1', remainingBalance: 500 }),
      makeLoan({ id: 'l2', remainingBalance: 300 }),
      makeLoan({ id: 'l3', remainingBalance: 0 }),
    ];
    expect(LoanSystem.getTotalDebt(state)).toBe(800);
  });

  it('tick accrues interest at the correct interval', () => {
    state.loans = [makeLoan({ remainingBalance: 1000, annualInterestRate: 0.10 })];
    state.tick = 0;
    // Run enough ticks to trigger an interest application (INTEREST_INTERVAL = 100)
    for (let i = 0; i < 100; i++) {
      state.tick = i + 1;
      LoanSystem.tick(state);
    }
    // Balance should have grown slightly
    expect(state.loans[0]!.remainingBalance).toBeGreaterThan(1000);
  });

  it('tick fires overdue alert when past due date', () => {
    state.loans = [makeLoan({ remainingBalance: 500, dueAtTick: 50 })];
    state.tick = 100; // Multiple of 100 so interest fires
    LoanSystem.tick(state);
    expect(state.alerts.some((a) => a.messageKey === 'alerts.loan_overdue')).toBe(true);
  });
});
