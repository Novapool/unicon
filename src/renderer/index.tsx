import { createRoot } from 'react-dom/client';
import App from './App';

const container = document.getElementById('root') as HTMLElement;
const root = createRoot(container);
root.render(<App />);

// Define types for the expected response and error
type IpcResponse = string;
type IpcError = Error;

// calling IPC exposed from preload script
window.electron.ipcRenderer.once('ipc-example', (arg: IpcResponse) => {
  console.log('IPC response:', arg);
});

// Use invoke and handle the response and error
window.electron.ipcRenderer.invoke('ipc-example', 'ping')
  .then((response: IpcResponse) => {
    console.log('IPC response:', response);
  })
  .catch((error: IpcError) => {
    console.error('IPC error:', error.message);
  });