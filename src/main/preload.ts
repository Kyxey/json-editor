import { contextBridge, ipcRenderer } from 'electron';
import { IPC_CHANNELS, IpcChannel } from '../shared/ipc';

contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    invoke: (channel: IpcChannel, ...args: unknown[]) => {
      const validChannels = Object.values(IPC_CHANNELS);
      if (validChannels.includes(channel)) {
        return ipcRenderer.invoke(channel, ...args);
      }
      return Promise.reject(new Error(`Invalid channel: ${channel}`));
    },
    on: (channel: IpcChannel, listener: (...args: unknown[]) => void) => {
      const validChannels = Object.values(IPC_CHANNELS).filter(
        (ch) => ch.startsWith('app:') || ch.startsWith('menu:'),
      );
      if (validChannels.includes(channel)) {
        ipcRenderer.on(channel, (_event, ...args) => listener(...args));
      }
    },
    removeListener: (channel: IpcChannel, listener: (...args: unknown[]) => void) => {
      ipcRenderer.removeListener(channel, listener);
    },
  },
  platform: process.platform,
  isMac: process.platform === 'darwin',
});
