const { app, BrowserWindow, Menu, ipcMain, shell } = require('electron');
const fs = require('node:fs');
const path = require('node:path');

const SAVE_FILE_NAME = 'future-factorius-save.json';

function getSaveFilePath() {
  return path.join(app.getPath('userData'), SAVE_FILE_NAME);
}

function loadSaveFile() {
  try {
    return fs.readFileSync(getSaveFilePath(), 'utf8');
  } catch {
    return null;
  }
}

function saveFile(raw) {
  try {
    const saveFilePath = getSaveFilePath();
    fs.mkdirSync(path.dirname(saveFilePath), { recursive: true });
    fs.writeFileSync(saveFilePath, raw, 'utf8');
    return true;
  } catch {
    return false;
  }
}

function deleteSaveFile() {
  try {
    fs.rmSync(getSaveFilePath(), { force: true });
    return true;
  } catch {
    return false;
  }
}

function createMainWindow() {
  const mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 640,
    backgroundColor: '#08131f',
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, 'preload.cjs')
    }
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  if (app.isPackaged) {
    mainWindow.loadFile(path.join(app.getAppPath(), 'dist', 'index.html'));
  } else {
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL ?? 'http://localhost:5173');
  }

  return mainWindow;
}

ipcMain.on('desktop-storage:load', (event) => {
  event.returnValue = loadSaveFile();
});

ipcMain.on('desktop-storage:save', (event, raw) => {
  event.returnValue = saveFile(raw);
});

ipcMain.on('desktop-storage:has-save', (event) => {
  event.returnValue = fs.existsSync(getSaveFilePath());
});

ipcMain.on('desktop-storage:delete', (event) => {
  event.returnValue = deleteSaveFile();
});

ipcMain.on('desktop-storage:path', (event) => {
  event.returnValue = getSaveFilePath();
});

app.whenReady().then(() => {
  Menu.setApplicationMenu(null);
  createMainWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
