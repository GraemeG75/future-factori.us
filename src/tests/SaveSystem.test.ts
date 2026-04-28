import { describe, it, expect, beforeEach, vi } from 'vitest';
import { save, load, hasSave, deleteSave, createNewGame, migrate, SAVE_KEY, SAVE_VERSION } from '../systems/SaveSystem';

// Simple localStorage mock
function makeLocalStorageMock() {
  const store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      for (const k of Object.keys(store)) delete store[k];
    }),
    _store: store
  };
}

function makeDesktopStorageMock() {
  let raw: string | null = null;
  return {
    isElectron: true as const,
    loadSave: vi.fn(() => raw),
    save: vi.fn((nextRaw: string) => {
      raw = nextRaw;
      return true;
    }),
    hasSave: vi.fn(() => raw !== null),
    deleteSave: vi.fn(() => {
      raw = null;
      return true;
    }),
    getSavePath: vi.fn(() => '/tmp/future-factorius-save.json'),
    _getRaw: () => raw
  };
}

describe('SaveSystem', () => {
  let mockStorage: ReturnType<typeof makeLocalStorageMock>;

  beforeEach(() => {
    mockStorage = makeLocalStorageMock();
    vi.stubGlobal('localStorage', mockStorage);
    delete window.desktopStorage;
  });

  it('createNewGame creates valid game state', () => {
    const state = createNewGame();
    expect(state).toBeDefined();
    expect(state.version).toBe(SAVE_VERSION);
  });

  it('createNewGame has starting cash', () => {
    const state = createNewGame();
    expect(state.cash).toBeGreaterThan(0);
  });

  it('createNewGame starts with no buildings but has resource spots', () => {
    const state = createNewGame();
    expect(state.buildings.length).toBe(0);
    expect(state.resourceSpots.length).toBeGreaterThan(0);
  });

  it('save serializes state to localStorage', () => {
    const state = createNewGame();
    save(state);
    expect(mockStorage.setItem).toHaveBeenCalledWith(SAVE_KEY, expect.any(String));
  });

  it('load deserializes state from localStorage', () => {
    const state = createNewGame();
    save(state);
    const loaded = load();
    expect(loaded).not.toBeNull();
    expect(loaded!.cash).toBe(state.cash);
    expect(loaded!.version).toBe(SAVE_VERSION);
  });

  it('load returns null when no save exists', () => {
    const result = load();
    expect(result).toBeNull();
  });

  it('load returns null for corrupted data', () => {
    mockStorage._store[SAVE_KEY] = 'not-valid-json{{{';
    const result = load();
    expect(result).toBeNull();
  });

  it('hasSave returns true after save', () => {
    expect(hasSave()).toBe(false);
    save(createNewGame());
    expect(hasSave()).toBe(true);
  });

  it('deleteSave removes from localStorage', () => {
    save(createNewGame());
    expect(hasSave()).toBe(true);
    deleteSave();
    expect(hasSave()).toBe(false);
  });

  it('save writes to desktop storage when Electron bridge is available', () => {
    const desktopStorage = makeDesktopStorageMock();
    window.desktopStorage = desktopStorage;

    save(createNewGame());

    expect(desktopStorage.save).toHaveBeenCalledWith(expect.any(String));
    expect(mockStorage.setItem).toHaveBeenCalledWith(SAVE_KEY, expect.any(String));
  });

  it('load prefers desktop storage when Electron bridge is available', () => {
    const desktopStorage = makeDesktopStorageMock();
    const desktopState = createNewGame();
    desktopState.cash = 4321;
    desktopStorage.save(JSON.stringify(desktopState));
    mockStorage._store[SAVE_KEY] = JSON.stringify(createNewGame());
    window.desktopStorage = desktopStorage;

    const loaded = load();

    expect(loaded).not.toBeNull();
    expect(loaded!.cash).toBe(4321);
  });

  it('deleteSave removes desktop saves when Electron bridge is available', () => {
    const desktopStorage = makeDesktopStorageMock();
    window.desktopStorage = desktopStorage;

    save(createNewGame());
    expect(hasSave()).toBe(true);

    deleteSave();

    expect(desktopStorage.deleteSave).toHaveBeenCalledTimes(1);
    expect(hasSave()).toBe(false);
  });

  it('migration: saved v0 data (no version field) is migrated to v1 with defaults', () => {
    const v0Data = { cash: 500, tick: 10 };
    const migrated = migrate(v0Data, 0);
    expect(migrated.version).toBe(SAVE_VERSION);
    expect(migrated.cash).toBe(500);
    expect(migrated.tick).toBe(10);
  });

  it('serialized state has correct version number', () => {
    const state = createNewGame();
    save(state);
    const raw = mockStorage._store[SAVE_KEY];
    const parsed = JSON.parse(raw) as { version: number };
    expect(parsed.version).toBe(SAVE_VERSION);
  });
});
