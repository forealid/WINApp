const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
    // File system operations
    writeFile: (filePath, data) => ipcRenderer.invoke('write-file', filePath, data),
    readFile: (filePath) => ipcRenderer.invoke('read-file', filePath),
    getUserDataPath: () => ipcRenderer.invoke('get-user-data-path'),
    
    // Menu operations
    onExportStatistics: (callback) => ipcRenderer.on('export-statistics', callback),
    onImportStatistics: (callback) => ipcRenderer.on('import-statistics', callback),
    
    // Remove listeners
    removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel)
});
