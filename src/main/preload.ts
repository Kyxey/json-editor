import { contextBridge, ipcRenderer } from 'electron';

export const IPC_CHANNELS = {
  FILE_OPEN: 'file:open',
  FILE_SAVE: 'file:save',
  FILE_SAVE_AS: 'file:save-as',
  FILE_NEW: 'file:new',
  FILE_CLOSE: 'file:close',
  FILE_READ: 'file:read',
  FILE_WRITE: 'file:write',
  FILE_EXISTS: 'file:exists',
  DIALOG_SAVE: 'dialog:save',
  DIALOG_OPEN: 'dialog:open',
  APP_CLOSE: 'app:close',
  APP_MINIMIZE: 'app:minimize',
  APP_MAXIMIZE: 'app:maximize',
  APP_BEFORE_CLOSE: 'app:before-close',
  MENU_NEW: 'menu:new',
  MENU_OPEN: 'menu:open',
  MENU_SAVE: 'menu:save',
  MENU_SAVE_AS: 'menu:save-as',
  CONTEXT_MENU: 'context:menu',
} as const;

type IpcChannel = (typeof IPC_CHANNELS)[keyof typeof IPC_CHANNELS];

contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    invoke: (channel: string, ...args: unknown[]) => {
      const validChannels = Object.values(IPC_CHANNELS);
      if (validChannels.includes(channel as IpcChannel)) {
        return ipcRenderer.invoke(channel, ...args);
      }
      return Promise.reject(new Error(`Invalid channel: ${channel}`));
    },
    on: (channel: string, listener: (...args: unknown[]) => void) => {
      const validChannels = Object.values(IPC_CHANNELS).filter(
        (ch) => ch.startsWith('app:') || ch.startsWith('menu:'),
      );
      if (validChannels.includes(channel as IpcChannel)) {
        ipcRenderer.on(channel, (_event, ...args) => listener(...args));
      }
    },
    removeListener: (channel: string, listener: (...args: unknown[]) => void) => {
      ipcRenderer.removeListener(channel, listener);
    },
  },
  platform: process.platform,
  isMac: process.platform === 'darwin',
});
