import { describe, it, expect } from 'vitest';
import { getHeatPenalty, tick, HOT_BUILDING_IDS } from '../systems/HeatSystem';
import { createTestGameState, createTestBuilding } from './testHelpers';

describe('HeatSystem', () => {
  describe('getHeatPenalty', () => {
    it('returns 0 for heat at 0', () => {
      expect(getHeatPenalty(0)).toBe(0);
    });

    it('returns 0 for heat at the threshold (80)', () => {
      expect(getHeatPenalty(80)).toBe(0);
    });

    it('returns 0 for heat below threshold', () => {
      expect(getHeatPenalty(50)).toBe(0);
    });

    it('returns 0.5 for heat at 100', () => {
      expect(getHeatPenalty(100)).toBeCloseTo(0.5);
    });

    it('returns 0.25 for heat at 90 (midpoint)', () => {
      expect(getHeatPenalty(90)).toBeCloseTo(0.25);
    });
  });

  describe('tick', () => {
    it('increases heat on powered hot buildings', () => {
      const state = createTestGameState({
        buildings: [createTestBuilding('quantum_forge', { isPowered: true, heat: 0 })]
      });
      tick(state);
      expect(state.buildings[0]!.heat).toBeGreaterThan(0);
    });

    it('does not increase heat on unpowered hot buildings', () => {
      const state = createTestGameState({
        buildings: [createTestBuilding('quantum_forge', { isPowered: false, heat: 0 })]
      });
      tick(state);
      expect(state.buildings[0]!.heat).toBe(0);
    });

    it('does not increase heat on non-hot buildings', () => {
      const state = createTestGameState({
        buildings: [createTestBuilding('wood_harvester', { isPowered: true, heat: 0 })]
      });
      tick(state);
      expect(state.buildings[0]!.heat).toBe(0);
    });

    it('updates globalHeat from hot buildings', () => {
      const state = createTestGameState({
        buildings: [createTestBuilding('quantum_forge', { isPowered: true, heat: 60 })]
      });
      tick(state);
      expect(state.globalHeat).toBeGreaterThan(0);
    });

    it('globalHeat is 0 with no hot buildings', () => {
      const state = createTestGameState({
        buildings: [createTestBuilding('wood_harvester', { heat: 50 })]
      });
      tick(state);
      expect(state.globalHeat).toBe(0);
    });

    it('heat dissipates naturally each tick', () => {
      const state = createTestGameState({
        buildings: [createTestBuilding('quantum_forge', { isPowered: false, heat: 50 })]
      });
      tick(state);
      // heat decays by 2 naturally, no generation because unpowered
      expect(state.buildings[0]!.heat).toBeLessThan(50);
    });

    it('cooling building reduces nearby building heat', () => {
      const state = createTestGameState({
        buildings: [
          createTestBuilding('quantum_forge', { isPowered: true, heat: 80, position: { x: 0, y: 0, z: 0 } }),
          createTestBuilding('radiator', { isPowered: true, heat: 0, position: { x: 10, y: 0, z: 0 } })
        ]
      });
      const heatBefore = state.buildings[0]!.heat;
      tick(state);
      // With natural decay + cooling from radiator, heat should drop or be suppressed
      // Heat generated = 0.8, natural decay = 2, cooling = 5 => net change ~ -6.2
      const heatAfter = state.buildings[0]!.heat;
      expect(heatAfter).toBeLessThan(heatBefore);
    });

    it('increments heatCrisisTicks when globalHeat > 90', () => {
      const state = createTestGameState({
        buildings: [createTestBuilding('quantum_forge', { isPowered: true, heat: 95 })],
        globalHeat: 95,
        heatCrisisTicks: 5
      });
      tick(state);
      expect(state.heatCrisisTicks).toBeGreaterThan(5);
    });

    it('resets heatCrisisTicks when globalHeat drops to safe level', () => {
      const state = createTestGameState({
        buildings: [createTestBuilding('wood_harvester', { heat: 0 })],
        globalHeat: 10,
        heatCrisisTicks: 20
      });
      tick(state);
      expect(state.heatCrisisTicks).toBe(0);
    });
  });

  describe('HOT_BUILDING_IDS', () => {
    it('contains quantum_forge', () => {
      expect(HOT_BUILDING_IDS.has('quantum_forge')).toBe(true);
    });

    it('does not contain wood_harvester', () => {
      expect(HOT_BUILDING_IDS.has('wood_harvester')).toBe(false);
    });
  });
});
