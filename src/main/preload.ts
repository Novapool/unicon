import { contextBridge, ipcRenderer } from 'electron';
import type { ElectronAPI } from '../types/ipc';

const electronAPI: ElectronAPI = {
  // File dialogs
  openFileDialog: () => ipcRenderer.invoke('dialog:openFile'),
  openFolderDialog: () => ipcRenderer.invoke('dialog:openFolder'),
  saveFileDialog: (defaultPath?: string) =>
    ipcRenderer.invoke('dialog:saveFile', defaultPath),

  // File type detection
  detectFileType: (filePath: string) =>
    ipcRenderer.invoke('detect-file-type', filePath),

  // Format information
  getFormats: () => ipcRenderer.invoke('get-formats'),

  // Conversion operations
  convertFile: (inputPath: string, outputPath: string, outputFormat: string) =>
    ipcRenderer.invoke('convert-file', inputPath, outputPath, outputFormat),

  batchConvert: (
    inputFolder: string,
    outputFolder: string,
    outputFormat: string,
  ) =>
    ipcRenderer.invoke(
      'batch-convert',
      inputFolder,
      outputFolder,
      outputFormat,
    ),

  // Job status
  getJobStatus: (jobId: string) => ipcRenderer.invoke('get-job-status', jobId),
};

contextBridge.exposeInMainWorld('electron', electronAPI);
