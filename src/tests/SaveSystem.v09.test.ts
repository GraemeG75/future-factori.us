import { describe, it, expect } from 'vitest';
import { exportSave, importSave, createNewGame } from '../systems/SaveSystem';

describe('SaveSystem — v0.9.0 export/import', () => {
  it('exportSave returns valid JSON string', () => {
    const state = createNewGame();
    const json = exportSave(state);
    expect(() => JSON.parse(json)).not.toThrow();
  });

  it('exportSave includes version and tick fields', () => {
    const state = createNewGame();
    const json = exportSave(state);
    const parsed = JSON.parse(json) as { version: number; tick: number };
    expect(typeof parsed.version).toBe('number');
    expect(typeof parsed.tick).toBe('number');
  });

  it('importSave returns migrated GameState for valid input', () => {
    const state = createNewGame();
    const json = exportSave(state);
    const imported = importSave(json);
    expect(imported).not.toBeNull();
    expect(imported!.tick).toBe(state.tick);
  });

  it('importSave returns null for empty string', () => {
    expect(importSave('')).toBeNull();
  });

  it('importSave returns null for non-save JSON', () => {
    expect(importSave('{"foo": "bar"}')).toBeNull();
  });
});
