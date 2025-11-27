/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import path from 'path';
import { app, BrowserWindow, shell, ipcMain, dialog } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import { spawn, ChildProcess } from 'child_process';
import fs from 'fs';
import axios from 'axios';
import { resolveHtmlPath } from './util';
import MenuBuilder from './menu';

class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;
let pythonServerProcess: ChildProcess | null = null;
const SERVER_PORT = 5000;
const SERVER_URL = `http://127.0.0.1:${SERVER_PORT}`;

// Helper to get bundled resource path
function getResourcePath(...paths: string[]): string {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, ...paths);
  }
  // In development, __dirname is .erb/dll, so go up 2 levels to reach project root
  return path.join(__dirname, '..', '..', ...paths);
}

// Start Python Flask server
async function startPythonServer(): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      // Determine Python server executable path
      let serverPath: string;

      if (app.isPackaged) {
        // Production: use bundled PyInstaller executable
        if (process.platform === 'win32') {
          serverPath = getResourcePath(
            'python',
            'unicon-server',
            'unicon-server.exe',
          );
        } else {
          serverPath = getResourcePath(
            'python',
            'unicon-server',
            'unicon-server',
          );
        }
      } else {
        // Development: run Python script directly
        serverPath = getResourcePath('conversion_functions', 'server.py');
      }

      log.info(`Starting Python server from: ${serverPath}`);

      // Set FFmpeg path environment variable
      const ffmpegPath = getResourcePath(
        'ffmpeg',
        process.platform === 'win32' ? 'ffmpeg.exe' : 'ffmpeg',
      );

      const env = {
        ...process.env,
        FFMPEG_PATH: ffmpegPath,
        UNICON_PORT: SERVER_PORT.toString(),
      };

      // Spawn Python server
      if (app.isPackaged) {
        // Run bundled executable
        pythonServerProcess = spawn(serverPath, [], { env });
      } else {
        // Run Python script
        const pythonCmd = process.platform === 'win32' ? 'python' : 'python3';
        pythonServerProcess = spawn(pythonCmd, [serverPath], { env });
      }

      pythonServerProcess.stdout?.on('data', (data) => {
        log.info(`Python Server: ${data.toString()}`);
      });

      pythonServerProcess.stderr?.on('data', (data) => {
        log.error(`Python Server Error: ${data.toString()}`);
      });

      pythonServerProcess.on('close', (code) => {
        log.info(`Python server exited with code ${code}`);
        pythonServerProcess = null;
      });

      // Wait for server to be ready
      const maxRetries = 30;
      let retries = 0;

      const checkServer = setInterval(async () => {
        try {
          const response = await axios.get(`${SERVER_URL}/health`, {
            timeout: 1000,
          });
          if (response.data.status === 'healthy') {
            clearInterval(checkServer);
            log.info('Python server is ready');
            resolve(true);
          }
        } catch (error) {
          retries++;
          if (retries >= maxRetries) {
            clearInterval(checkServer);
            log.error('Python server failed to start');
            resolve(false);
          }
        }
      }, 1000);
    } catch (error) {
      log.error('Error starting Python server:', error);
      resolve(false);
    }
  });
}

// Stop Python Flask server
function stopPythonServer(): void {
  if (pythonServerProcess) {
    log.info('Stopping Python server');
    pythonServerProcess.kill();
    pythonServerProcess = null;
  }
}

ipcMain.on('ipc-example', async (event, arg) => {
  const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`;
  console.log(msgTemplate(arg));
  event.reply('ipc-example', msgTemplate('pong'));
});

ipcMain.handle('ipc-example', async (event, arg) => {
  const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`;
  console.log(msgTemplate(arg));
  return msgTemplate('pong');
});

// IPC handler for opening file dialog
ipcMain.handle('dialog:openFile', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ['openFile', 'multiSelections'],
  });
  if (canceled) {
    return { canceled, filePaths: [] };
  }
  return { canceled, filePaths };
});

// IPC handler for opening folder dialog
ipcMain.handle('dialog:openFolder', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ['openDirectory'],
    buttonLabel: 'Convert',
    title: 'Select Output Folder',
  });
  if (canceled) {
    return { canceled, filePaths: [] };
  }
  return { canceled, folderPath: filePaths[0] };
});

// IPC handler for save file dialog
ipcMain.handle('dialog:saveFile', async (event, defaultPath?: string) => {
  const { canceled, filePath } = await dialog.showSaveDialog({
    defaultPath: defaultPath || 'converted_file',
    buttonLabel: 'Convert',
    title: 'Select Output Location',
  });
  if (canceled || !filePath) {
    return { canceled: true, filePath: null };
  }
  return { canceled: false, filePath };
});

// IPC handler for detecting file type
ipcMain.handle('detect-file-type', async (event, filePath: string) => {
  try {
    const response = await axios.post(`${SERVER_URL}/detect-type`, {
      file_path: filePath,
    });

    // Map backend response to fileType string
    let fileType = 'application/octet-stream';
    const { data } = response;

    if (data.type === 'media') {
      fileType = `${data.subtype}/unknown`;
    } else if (data.type === 'document') {
      fileType = `document/${data.subtype}`;
    }

    return {
      success: true,
      fileType,
      data: response.data,
    };
  } catch (error) {
    log.error('Error detecting file type:', error);
    return { success: false, error: 'Failed to detect file type' };
  }
});

// IPC handler for getting supported formats
ipcMain.handle('get-formats', async () => {
  try {
    const response = await axios.get(`${SERVER_URL}/formats`);
    return { success: true, formats: response.data };
  } catch (error) {
    log.error('Error getting formats:', error);
    return { success: false, error: 'Failed to get formats' };
  }
});

// IPC handler for file conversion
ipcMain.handle(
  'convert-file',
  async (
    event,
    inputPath: string,
    outputPath: string,
    outputFormat: string,
  ) => {
    try {
      const response = await axios.post(`${SERVER_URL}/convert`, {
        input_path: inputPath,
        output_path: outputPath,
        output_format: outputFormat,
      });
      return { success: true, jobId: response.data.job_id };
    } catch (error) {
      log.error('Conversion error:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'An unknown error occurred';
      return { success: false, error: errorMessage };
    }
  },
);

// IPC handler for batch conversion
ipcMain.handle(
  'batch-convert',
  async (
    event,
    inputFolder: string,
    outputFolder: string,
    outputFormat: string,
  ) => {
    try {
      const response = await axios.post(`${SERVER_URL}/batch-convert`, {
        input_folder: inputFolder,
        output_folder: outputFolder,
        output_format: outputFormat,
      });
      return { success: true, jobId: response.data.job_id };
    } catch (error) {
      log.error('Batch conversion error:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'An unknown error occurred';
      return { success: false, error: errorMessage };
    }
  },
);

// IPC handler for getting job status
ipcMain.handle('get-job-status', async (event, jobId: string) => {
  try {
    const response = await axios.get(`${SERVER_URL}/job/${jobId}`);
    return { success: true, job: response.data };
  } catch (error) {
    log.error('Error getting job status:', error);
    return { success: false, error: 'Failed to get job status' };
  }
});

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload,
    )
    .catch(console.log);
};

const createWindow = async () => {
  if (isDebug) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      sandbox: true,
      contextIsolation: true,
      nodeIntegration: false,
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
  });

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Stop Python server when app closes
  stopPythonServer();

  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('will-quit', () => {
  // Ensure Python server is stopped before quit
  stopPythonServer();
});

app
  .whenReady()
  .then(async () => {
    // Start Python server first
    const serverStarted = await startPythonServer();

    if (!serverStarted) {
      log.error(
        'Failed to start Python server. Application may not function correctly.',
      );
      dialog.showErrorBox(
        'Server Error',
        'Failed to start the conversion server. Please check the logs and try again.',
      );
    }

    // Then create window
    await createWindow();

    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });
  })
  .catch(console.log);
