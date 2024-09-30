const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow;
let selectedFile = null;
let selectedFolder = null;
let outputFolder = null;
let conversionType = null;
let outputFormat = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'src', 'preload.js')
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'src', 'index.html'));
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

ipcMain.on('select-file', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile']
  });
  if (!result.canceled) {
    selectedFile = result.filePaths[0];
    mainWindow.webContents.send('update-status', `Selected file: ${selectedFile}`);
  }
});

ipcMain.on('select-folder', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory']
  });
  if (!result.canceled) {
    selectedFolder = result.filePaths[0];
    mainWindow.webContents.send('update-status', `Selected folder: ${selectedFolder}`);
  }
});

ipcMain.on('select-output', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory']
  });
  if (!result.canceled) {
    outputFolder = result.filePaths[0];
    mainWindow.webContents.send('update-status', `Selected output folder: ${outputFolder}`);
  }
});

ipcMain.on('set-conversion-type', (event, type) => {
  conversionType = type;
  mainWindow.webContents.send('update-status', `Conversion type set to: ${conversionType}`);
});

ipcMain.on('set-output-format', (event, format) => {
  outputFormat = format;
  mainWindow.webContents.send('update-status', `Output format set to: ${outputFormat}`);
});

ipcMain.on('convert', () => {
  if ((!selectedFile && !selectedFolder) || !outputFolder || !conversionType || !outputFormat) {
    mainWindow.webContents.send('update-status', 'Please select all required options before converting.');
    return;
  }

  const pythonProcess = spawn('python', [
    path.join(__dirname, 'conversion_functions', 'media_conversions.py'),
    selectedFile || selectedFolder,
    outputFolder,
    conversionType,
    outputFormat
  ]);

  pythonProcess.stdout.on('data', (data) => {
    mainWindow.webContents.send('update-status', data.toString());
  });

  pythonProcess.stderr.on('data', (data) => {
    mainWindow.webContents.send('update-status', `Error: ${data}`);
  });

  pythonProcess.on('close', (code) => {
    mainWindow.webContents.send('update-status', `Conversion process exited with code ${code}`);
  });
});