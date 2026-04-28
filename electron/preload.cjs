const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('desktopStorage', {
  isElectron: true,
  loadSave: () => ipcRenderer.sendSync('desktop-storage:load'),
  save: (raw) => ipcRenderer.sendSync('desktop-storage:save', raw) === true,
  hasSave: () => ipcRenderer.sendSync('desktop-storage:has-save') === true,
  deleteSave: () => ipcRenderer.sendSync('desktop-storage:delete') === true,
  getSavePath: () => ipcRenderer.sendSync('desktop-storage:path')
});
