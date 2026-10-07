const { app, BrowserWindow, shell, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const { autoUpdater } = require('electron-updater');

let mainWindow;

autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = true;

function getDbDir() {
  const dataDir = path.join(app.getPath('userData'), 'Data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  return dataDir;
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1366,
    height: 850,
    minWidth: 1024,
    minHeight: 700,
    title: 'Brosted Kozhi Billing Web App',
    icon: path.join(__dirname, '../public/favicon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
      preload: path.join(__dirname, 'preload.cjs')
    },
    autoHideMenuBar: false,
    show: false
  });

  const isDev = !app.isPackaged && process.env.NODE_ENV === 'development';

  if (isDev && process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    mainWindow.maximize();
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http:') || url.startsWith('https:')) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// ── IPC Handlers for Windows Safe File System Data Storage ──
ipcMain.handle('get-app-data-path', () => {
  return getDbDir();
});

ipcMain.handle('read-file-data', async (event, filename) => {
  try {
    const filePath = path.join(getDbDir(), filename);
    if (!fs.existsSync(filePath)) return null;
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (err) {
    console.error(`Error reading data file ${filename}:`, err);
    return null;
  }
});

ipcMain.handle('write-file-data', async (event, filename, data) => {
  try {
    const filePath = path.join(getDbDir(), filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error(`Error writing data file ${filename}:`, err);
    return false;
  }
});

ipcMain.handle('export-data-backup', async (event, dataJson) => {
  try {
    const defaultName = `BrostedKozhi_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
      title: 'Export Backup Data',
      defaultPath: path.join(app.getPath('documents'), defaultName),
      filters: [{ name: 'JSON Backup Files', extensions: ['json'] }]
    });

    if (canceled || !filePath) return { success: false, reason: 'canceled' };

    fs.writeFileSync(filePath, JSON.stringify(dataJson, null, 2), 'utf8');
    return { success: true, filePath };
  } catch (err) {
    console.error('Error exporting backup:', err);
    return { success: false, reason: err.message };
  }
});

ipcMain.handle('import-data-backup', async () => {
  try {
    const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
      title: 'Import Backup Data',
      defaultPath: app.getPath('documents'),
      filters: [{ name: 'JSON Backup Files', extensions: ['json'] }],
      properties: ['openFile']
    });

    if (canceled || !filePaths || filePaths.length === 0) return null;

    const content = fs.readFileSync(filePaths[0], 'utf8');
    return JSON.parse(content);
  } catch (err) {
    console.error('Error importing backup:', err);
    return null;
  }
});

// ── Auto Updater Handlers ──
ipcMain.handle('get-app-version', () => app.getVersion());

ipcMain.handle('check-for-updates', async () => {
  try {
    if (!app.isPackaged) {
      return {
        available: false,
        version: '1.2.0',
        releaseNotes: 'Running in development mode.'
      };
    }
    const result = await autoUpdater.checkForUpdates();
    const currentVersion = app.getVersion();
    const remoteVersion = result?.updateInfo?.version;
    const available = !!remoteVersion && remoteVersion !== currentVersion;
    return {
      available,
      version: remoteVersion || currentVersion,
      releaseNotes: result?.updateInfo?.releaseNotes || 'Performance improvements and security updates.'
    };
  } catch (err) {
    console.log('Update check error:', err.message);
    return { available: false, error: err.message };
  }
});

ipcMain.handle('start-download-update', (event) => {
  if (!app.isPackaged) {
    // Simulated smooth progress for dev / demonstration
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        if (mainWindow) mainWindow.webContents.send('update-downloaded', { version: '1.1.0' });
      } else {
        if (mainWindow) mainWindow.webContents.send('update-progress', { percent: progress, bytesPerSecond: 2097152 });
      }
    }, 400);
    return { success: true };
  }

  try {
    autoUpdater.downloadUpdate();
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('restart-and-install', () => {
  if (!app.isPackaged) {
    app.relaunch();
    app.exit(0);
    return;
  }
  autoUpdater.quitAndInstall(false, true);
});

autoUpdater.on('download-progress', (progressObj) => {
  if (mainWindow) {
    mainWindow.webContents.send('update-progress', progressObj);
  }
});

autoUpdater.on('update-downloaded', (info) => {
  if (mainWindow) {
    mainWindow.webContents.send('update-downloaded', info);
  }
});

autoUpdater.on('error', (err) => {
  if (mainWindow) {
    mainWindow.webContents.send('update-error', err ? err.message : 'Update failed');
  }
});

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
