const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    selectFile: () => ipcRenderer.send('select-file'),
    selectFolder: () => ipcRenderer.send('select-folder'),
    selectOutput: () => ipcRenderer.send('select-output'),
    setConversionType: (type) => ipcRenderer.send('set-conversion-type', type),
    setOutputFormat: (format) => ipcRenderer.send('set-output-format', format),
    convert: () => ipcRenderer.send('convert'),
    onUpdateStatus: (callback) => ipcRenderer.on('update-status', callback)
});