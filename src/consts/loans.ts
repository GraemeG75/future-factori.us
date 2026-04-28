/** Ticks per "year" for interest calculation (at 20 tps × 60 s × 20 min). */
export const TICKS_PER_YEAR = 20 * 60 * 20; // ~24 000 ticks ≈ 20 real minutes

/** Available loan tiers: principal → { annualRate, durationTicks }. */
export const LOAN_TIERS = [
  { principal: 1000, annualInterestRate: 0.05, durationTicks: TICKS_PER_YEAR / 4, label: '1k — 5% p.a. (5 min)' },
  { principal: 5000, annualInterestRate: 0.08, durationTicks: TICKS_PER_YEAR / 2, label: '5k — 8% p.a. (10 min)' },
  { principal: 20000, annualInterestRate: 0.12, durationTicks: TICKS_PER_YEAR, label: '20k — 12% p.a. (20 min)' },
  { principal: 100000, annualInterestRate: 0.2, durationTicks: TICKS_PER_YEAR * 2, label: '100k — 20% p.a. (40 min)' }
] as const;

/** Maximum number of outstanding loans. */
export const MAX_LOANS = 3;

/** How often (in ticks) interest is applied (~every 5 real-seconds). */
export const INTEREST_INTERVAL = 100;
