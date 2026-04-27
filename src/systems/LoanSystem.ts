import type { Loan, GameState } from '../game/GameState';

/** Ticks per "year" for interest calculation (at 20 tps × 60 s × 20 min). */
const TICKS_PER_YEAR = 20 * 60 * 20; // ~24 000 ticks ≈ 20 real minutes

/** Available loan tiers: principal → { annualRate, durationTicks }. */
export const LOAN_TIERS = [
  { principal: 1000, annualInterestRate: 0.05, durationTicks: TICKS_PER_YEAR / 4, label: '1k — 5% p.a. (5 min)' },
  { principal: 5000, annualInterestRate: 0.08, durationTicks: TICKS_PER_YEAR / 2, label: '5k — 8% p.a. (10 min)' },
  { principal: 20000, annualInterestRate: 0.12, durationTicks: TICKS_PER_YEAR, label: '20k — 12% p.a. (20 min)' },
  { principal: 100000, annualInterestRate: 0.20, durationTicks: TICKS_PER_YEAR * 2, label: '100k — 20% p.a. (40 min)' },
] as const;

/** Maximum number of outstanding loans. */
const MAX_LOANS = 3;

/** How often (in ticks) interest is applied (~every 5 real-seconds). */
const INTEREST_INTERVAL = 100;

/**
 * Applies periodic interest to all outstanding loans and alerts the player
 * about any loans that are past due.
 */
export function tick(state: GameState): void {
  if (state.tick % INTEREST_INTERVAL !== 0) return;

  const intervalFraction = INTEREST_INTERVAL / TICKS_PER_YEAR;

  for (const loan of state.loans) {
    if (loan.remainingBalance <= 0) continue;

    // Accrue interest for this interval
    const interest = loan.remainingBalance * loan.annualInterestRate * intervalFraction;
    loan.remainingBalance = Math.round((loan.remainingBalance + interest) * 100) / 100;

    // Alert if past due
    if (state.tick > loan.dueAtTick) {
      // Apply a 2× late payment penalty surge every interval
      loan.remainingBalance = Math.round(loan.remainingBalance * 1.02 * 100) / 100;
      state.alerts.push({
        id: crypto.randomUUID(),
        tick: state.tick,
        type: 'error',
        messageKey: 'alerts.loan_overdue',
        params: [String(Math.ceil(loan.remainingBalance))],
      });
    }
  }
}

/**
 * Issues a new loan to the player.
 * Returns false if the player already has too many loans.
 */
export function takeLoan(state: GameState, tierIndex: number): boolean {
  const outstandingCount = state.loans.filter((l) => l.remainingBalance > 0).length;
  if (outstandingCount >= MAX_LOANS) return false;

  const tier = LOAN_TIERS[tierIndex];
  if (!tier) return false;

  const loan: Loan = {
    id: crypto.randomUUID(),
    principal: tier.principal,
    remainingBalance: tier.principal,
    annualInterestRate: tier.annualInterestRate,
    takenAtTick: state.tick,
    dueAtTick: state.tick + tier.durationTicks,
  };

  state.loans.push(loan);
  state.cash += tier.principal;

  state.alerts.push({
    id: crypto.randomUUID(),
    tick: state.tick,
    type: 'info',
    messageKey: 'alerts.loan_taken',
    params: [String(tier.principal)],
  });

  return true;
}

/**
 * Repays as much of a loan as possible from the player's current cash.
 * Returns the amount repaid.
 */
export function repayLoan(state: GameState, loanId: string): number {
  const loan = state.loans.find((l) => l.id === loanId);
  if (!loan || loan.remainingBalance <= 0) return 0;

  const payment = Math.min(state.cash, loan.remainingBalance);
  state.cash -= payment;
  loan.remainingBalance = Math.round((loan.remainingBalance - payment) * 100) / 100;

  if (loan.remainingBalance <= 0) {
    loan.remainingBalance = 0;
    state.alerts.push({
      id: crypto.randomUUID(),
      tick: state.tick,
      type: 'success',
      messageKey: 'alerts.loan_repaid',
      params: [String(loan.principal)],
    });
  }

  return payment;
}

/** Returns the total outstanding debt across all active loans. */
export function getTotalDebt(state: GameState): number {
  return state.loans.reduce((sum, l) => sum + Math.max(0, l.remainingBalance), 0);
}

/** Returns true if the player can take another loan. */
export function canTakeLoan(state: GameState): boolean {
  return state.loans.filter((l) => l.remainingBalance > 0).length < MAX_LOANS;
}
