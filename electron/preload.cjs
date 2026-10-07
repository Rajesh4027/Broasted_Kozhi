const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true,
  platform: process.platform,
  getAppDataPath: () => ipcRenderer.invoke('get-app-data-path'),
  readFileData: (filename) => ipcRenderer.invoke('read-file-data', filename),
  writeFileData: (filename, data) => ipcRenderer.invoke('write-file-data', filename, data),
  exportBackup: (dataJson) => ipcRenderer.invoke('export-data-backup', dataJson),
  importBackup: () => ipcRenderer.invoke('import-data-backup'),

  // Auto Updater APIs
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
  startDownloadUpdate: () => ipcRenderer.invoke('start-download-update'),
  restartAndInstall: () => ipcRenderer.invoke('restart-and-install'),
  onUpdateProgress: (callback) => {
    const handler = (event, data) => callback(data);
    ipcRenderer.on('update-progress', handler);
    return () => ipcRenderer.removeListener('update-progress', handler);
  },
  onUpdateDownloaded: (callback) => {
    const handler = (event, data) => callback(data);
    ipcRenderer.on('update-downloaded', handler);
    return () => ipcRenderer.removeListener('update-downloaded', handler);
  },
  onUpdateError: (callback) => {
    const handler = (event, data) => callback(data);
    ipcRenderer.on('update-error', handler);
    return () => ipcRenderer.removeListener('update-error', handler);
  }
});
