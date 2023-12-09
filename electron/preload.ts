import { contextBridge, ipcRenderer } from "electron";
import { Content } from "./utils";

// --------- Expose some API to the Renderer process ---------

export interface IElectronAPI {
  subscribeClipboardData: (
    callback: (e: Electron.IpcRendererEvent, content: Content) => void
  ) => void;
  unsubscribeClipboardData: () => void;
  getContents: () => Promise<Content[]>;
  deleteContent: (content: Content) => void;
}

const electronApi: IElectronAPI = {
  subscribeClipboardData: (
    callback: (e: Electron.IpcRendererEvent, content: Content) => void
  ) => ipcRenderer.on("clipboard-updated", callback),
  unsubscribeClipboardData: () =>
    ipcRenderer.removeAllListeners("clipboard-updated"),
  getContents: () => ipcRenderer.invoke("getContents"),
  deleteContent: (content: Content) =>
    ipcRenderer.send("deleteContent", content),
};
contextBridge.exposeInMainWorld("electronAPI", electronApi);
