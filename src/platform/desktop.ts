export interface DesktopStorageApi {
  isElectron: true;
  loadSave: () => string | null;
  save: (raw: string) => boolean;
  hasSave: () => boolean;
  deleteSave: () => boolean;
  getSavePath: () => string | null;
}

declare global {
  interface Window {
    desktopStorage?: DesktopStorageApi;
  }
}

export function getDesktopStorage(): DesktopStorageApi | null {
  if (typeof window === 'undefined') return null;
  const desktopStorage = window.desktopStorage;
  return desktopStorage?.isElectron ? desktopStorage : null;
}
