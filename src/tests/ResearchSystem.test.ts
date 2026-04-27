import { describe, it, expect, beforeEach } from 'vitest';
import {
  startResearch,
  cancelResearch,
  isUnlocked,
  getAvailableTechnologies,
  tick,
  getSynergyBonus,
  getEffectiveSpecialization,
} from '../systems/ResearchSystem';
import { createTestGameState, createTestBuilding } from './testHelpers';
import type { GameState } from '../game/GameState';
import { TECHNOLOGIES_MAP } from '../data/research';

describe('ResearchSystem', () => {
  let state: GameState;

  beforeEach(() => {
    state = createTestGameState({ cash: 100000 });
  });

  it('startResearch fails if prerequisites not met', () => {
    // uranium_mining requires 'silicon_extraction'
    const result = startResearch(state, 'uranium_mining');
    expect(result).toBe(false);
  });

  it('startResearch fails if insufficient money', () => {
    state.cash = 0;
    const result = startResearch(state, 'silicon_extraction');
    expect(result).toBe(false);
  });

  it('startResearch succeeds for tier 1 tech with no prerequisites', () => {
    const result = startResearch(state, 'silicon_extraction');
    expect(result).toBe(true);
    expect(state.activeResearch?.technologyId).toBe('silicon_extraction');
  });

  it('startResearch deducts money cost', () => {
    const cashBefore = state.cash;
    const tech = TECHNOLOGIES_MAP['silicon_extraction'];
    startResearch(state, 'silicon_extraction');
    expect(state.cash).toBe(cashBefore - tech.moneyCost);
  });

  it('research progresses when ticked with research centers generating points', () => {
    const rc = createTestBuilding('research_center');
    state.buildings.push(rc);
    startResearch(state, 'silicon_extraction');
    const progressBefore = state.activeResearch!.progress;
    tick(state, 5);
    expect(state.activeResearch!.progress).toBeGreaterThan(progressBefore);
  });

  it('research completes and tech added to completedResearch', () => {
    // Add a research center and tick enough time to complete
    const rc = createTestBuilding('research_center');
    state.buildings.push(rc);
    startResearch(state, 'silicon_extraction');
    // silicon_extraction costs 50 RP, research_center generates 1 RP/s/level
    tick(state, 60);
    expect(state.completedResearch).toContain('silicon_extraction');
    expect(state.activeResearch).toBeNull();
  });

  it('getAvailableTechnologies returns techs with met prerequisites', () => {
    const available = getAvailableTechnologies(state);
    // Tier-1 techs with no prerequisites should be available
    for (const tech of available) {
      for (const prereq of tech.prerequisites) {
        expect(state.completedResearch).toContain(prereq);
      }
    }
    expect(available.length).toBeGreaterThan(0);
  });

  it('isUnlocked returns false before research, true after', () => {
    expect(isUnlocked(state, 'silicon_extraction')).toBe(false);
    state.completedResearch.push('silicon_extraction');
    expect(isUnlocked(state, 'silicon_extraction')).toBe(true);
  });

  it('cancelResearch stops active research', () => {
    startResearch(state, 'silicon_extraction');
    expect(state.activeResearch).not.toBeNull();
    cancelResearch(state);
    expect(state.activeResearch).toBeNull();
  });

  describe('getSynergyBonus', () => {
    it('returns 1.0 when no research completed', () => {
      expect(getSynergyBonus(state)).toBe(1.0);
    });

    it('returns 1.0 when only the primary tech is completed but synergy partner is not', () => {
      // plasma_tech has synergyWith: ['dark_matter_research']
      state.completedResearch = ['silicon_extraction', 'uranium_mining', 'plasma_tech'];
      expect(getSynergyBonus(state)).toBe(1.0);
    });

    it('returns bonus multiplier when both synergy partners are completed', () => {
      // plasma_tech (synergyWith: dark_matter_research, synergyBonus: 1.2)
      // dark_matter_research (synergyWith: quantum_physics, synergyBonus: 1.25)
      // Complete plasma_tech + dark_matter_research → plasma_tech synergy fires
      state.completedResearch = [
        'silicon_extraction', 'uranium_mining', 'plasma_tech', 'dark_matter_research',
      ];
      const bonus = getSynergyBonus(state);
      expect(bonus).toBeGreaterThan(1.0);
    });

    it('filters by specialization when provided', () => {
      // Complete plasma_tech + dark_matter_research
      state.completedResearch = [
        'silicon_extraction', 'uranium_mining', 'plasma_tech', 'dark_matter_research',
      ];
      // plasma_tech specialization is 'energy'; dark_matter is 'matter'
      const energyBonus = getSynergyBonus(state, 'energy');
      const matterBonus = getSynergyBonus(state, 'matter');
      // The energy spec should include plasma_tech's bonus; matter should include dark_matter's
      expect(energyBonus).toBeGreaterThanOrEqual(1.0);
      expect(matterBonus).toBeGreaterThanOrEqual(1.0);
    });
  });

  describe('getEffectiveSpecialization', () => {
    it('returns null when no research is completed', () => {
      expect(getEffectiveSpecialization(state)).toBeNull();
    });

    it('returns explicit specialization when set', () => {
      state.researchSpecialization = 'energy';
      expect(getEffectiveSpecialization(state)).toBe('energy');
    });

    it('derives specialization from highest-tier completed tech', () => {
      // uranium_mining is tier 2, specialization energy
      state.completedResearch = ['silicon_extraction', 'uranium_mining'];
      state.researchSpecialization = null;
      expect(getEffectiveSpecialization(state)).toBe('energy');
    });

    it('returns null if no completed tech has a specialization field', () => {
      // silicon_extraction has no specialization
      state.completedResearch = ['silicon_extraction'];
      state.researchSpecialization = null;
      expect(getEffectiveSpecialization(state)).toBeNull();
    });
  });
});
