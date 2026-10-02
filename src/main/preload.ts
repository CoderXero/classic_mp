import { createRequire } from 'node:module';
const electron = createRequire(__filename)('electron') as typeof import('electron');
const { contextBridge, ipcRenderer } = electron;
contextBridge.exposeInMainWorld('classicmp', { getLocalApiBootstrap: () => ipcRenderer.invoke('bootstrap'), chooseFiles: (multi = false) => ipcRenderer.invoke('choose-files', multi ? ['openFile', 'multiSelections'] : ['openFile']) });
