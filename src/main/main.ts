import { app, BrowserWindow, ipcMain, dialog, Menu, nativeTheme } from 'electron';
import * as path from 'path';
import * as fs from 'fs/promises';
import { IPC_CHANNELS, IpcChannel } from '../shared/ipc';

class JsonEditorApp {
  private mainWindow: BrowserWindow | null = null;

  public async initialize(): Promise<void> {
    await app.whenReady();
    this.createWindow();
    this.setupIpcHandlers();
    this.setupMenu();

    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit();
      }
    });

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        this.createWindow();
      }
    });
  }

  private createWindow(): void {
    const isMac = process.platform === 'darwin';

    this.mainWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      minWidth: 800,
      minHeight: 600,
      title: 'JSON Editor',
      backgroundColor: nativeTheme.shouldUseDarkColors ? '#1E1E1E' : '#FFFFFF',
      titleBarStyle: isMac ? 'hiddenInset' : 'default',
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, 'preload.js'),
      },
    });

    this.mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));

    if (process.env.NODE_ENV === 'development') {
      this.mainWindow.webContents.openDevTools();
    }

    this.mainWindow.on('close', (event) => {
      event.preventDefault();
      this.mainWindow?.webContents.send('app:before-close');
    });
  }

  private setupIpcHandlers(): void {
    ipcMain.handle(IPC_CHANNELS.DIALOG_OPEN, async () => {
      const result = await dialog.showOpenDialog(this.mainWindow!, {
        properties: ['openFile'],
        filters: [
          { name: 'JSON Files', extensions: ['json'] },
          { name: 'All Files', extensions: ['*'] },
        ],
      });

      if (result.canceled || result.filePaths.length === 0) {
        return null;
      }

      return result.filePaths[0];
    });

    ipcMain.handle(IPC_CHANNELS.DIALOG_SAVE, async () => {
      const result = await dialog.showSaveDialog(this.mainWindow!, {
        filters: [
          { name: 'JSON Files', extensions: ['json'] },
          { name: 'All Files', extensions: ['*'] },
        ],
      });

      if (result.canceled) {
        return null;
      }

      return result.filePath;
    });

    ipcMain.handle(IPC_CHANNELS.FILE_READ, async (_event, filePath: string) => {
      try {
        const content = await fs.readFile(filePath, 'utf-8');
        return { success: true, content };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    });

    ipcMain.handle(IPC_CHANNELS.FILE_WRITE, async (_event, filePath: string, content: string) => {
      try {
        await fs.writeFile(filePath, content, 'utf-8');
        return { success: true };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    });

    ipcMain.handle(IPC_CHANNELS.FILE_EXISTS, async (_event, filePath: string) => {
      try {
        await fs.access(filePath);
        return true;
      } catch {
        return false;
      }
    });

    ipcMain.handle(IPC_CHANNELS.APP_MINIMIZE, () => {
      this.mainWindow?.minimize();
    });

    ipcMain.handle(IPC_CHANNELS.APP_MAXIMIZE, () => {
      if (this.mainWindow?.isMaximized()) {
        this.mainWindow.unmaximize();
      } else {
        this.mainWindow?.maximize();
      }
    });

    ipcMain.handle(IPC_CHANNELS.APP_CLOSE, () => {
      this.mainWindow?.close();
    });
  }

  private setupMenu(): void {
    const isMac = process.platform === 'darwin';

    const template: Electron.MenuItemConstructorOptions[] = [
      ...(isMac
        ? [
            {
              label: app.name,
              submenu: [
                { role: 'about' as const },
                { type: 'separator' as const },
                { role: 'quit' as const },
              ],
            },
          ]
        : []),
      {
        label: 'File',
        submenu: [
          {
            label: 'New',
            accelerator: isMac ? 'Cmd+N' : 'Ctrl+N',
            click: () => this.mainWindow?.webContents.send('menu:new'),
          },
          {
            label: 'Open',
            accelerator: isMac ? 'Cmd+O' : 'Ctrl+O',
            click: () => this.mainWindow?.webContents.send('menu:open'),
          },
          {
            label: 'Save',
            accelerator: isMac ? 'Cmd+S' : 'Ctrl+S',
            click: () => this.mainWindow?.webContents.send('menu:save'),
          },
          {
            label: 'Save As',
            accelerator: isMac ? 'Cmd+Shift+S' : 'Ctrl+Shift+S',
            click: () => this.mainWindow?.webContents.send('menu:save-as'),
          },
          { type: 'separator' },
          isMac ? { role: 'close' } : { role: 'quit' },
        ],
      },
      {
        label: 'Edit',
        submenu: [
          { role: 'undo' },
          { role: 'redo' },
          { type: 'separator' },
          { role: 'cut' },
          { role: 'copy' },
          { role: 'paste' },
          { role: 'delete' },
          { role: 'selectAll' },
        ],
      },
      {
        label: 'View',
        submenu: [
          { role: 'toggleDevTools' },
          { type: 'separator' },
          { role: 'zoomIn' },
          { role: 'zoomOut' },
          { role: 'resetZoom' },
        ],
      },
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
  }
}

const appInstance = new JsonEditorApp();
appInstance.initialize().catch(console.error);
