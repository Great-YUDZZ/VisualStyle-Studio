const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true,
  openFolder: () => ipcRenderer.invoke('dialog:openFolder'),
  openFile: () => ipcRenderer.invoke('dialog:openFile'),
  readFile: (filePath) => ipcRenderer.invoke('file:read', filePath),
  readProjectTree: (dirPath) => ipcRenderer.invoke('project:getTree', dirPath),
  saveChanges: (data) => ipcRenderer.invoke('file:save', data),
  saveSandbox: (data) => ipcRenderer.invoke('file:saveSandbox', data)
});
