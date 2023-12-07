import { contextBridge, ipcRenderer } from "electron";

// --------- Expose some API to the Renderer process ---------

export interface IElectronAPI {
  subscribeClipboardData: (
    callback: (e: Electron.IpcRendererEvent, text: string) => void
  ) => void;
  unsubscribeClipboardData: () => void;
  getContents: () => Promise<string[]>;
  deleteContent: (content: string) => void;
}

const electronApi: IElectronAPI = {
  subscribeClipboardData: (
    callback: (e: Electron.IpcRendererEvent, text: string) => void
  ) => ipcRenderer.on("clipboard-updated", callback),
  unsubscribeClipboardData: () =>
    ipcRenderer.removeAllListeners("clipboard-updated"),
  getContents: () => ipcRenderer.invoke("getContents"),
  deleteContent: (content: string) =>
    ipcRenderer.send("deleteContent", content),
};
contextBridge.exposeInMainWorld("electronAPI", electronApi);
