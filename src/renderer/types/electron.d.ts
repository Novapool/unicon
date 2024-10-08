export {};

declare global {
  interface Window {
    electron: {
      ipcRenderer: {
        invoke(channel: string, ...args: any[]): Promise<any>;
        on(channel: string, func: (...args: any[]) => void): (() => void) | undefined;
        once(channel: string, func: (...args: any[]) => void): void;
      };
    };
  }
}