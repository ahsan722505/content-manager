import { contextBridge, ipcRenderer } from "electron";
import { Content } from "./utils";

// --------- Expose some API to the Renderer process ---------

export interface IElectronAPI {
  subscribeClipboardData: (
    callback: (e: Electron.IpcRendererEvent, content: Content) => void
  ) => void;
  unsubscribeClipboardData: () => void;
  getContents: () => Promise<Content[]>;
  assignHotkey: (content: Content, hotkey: string) => Promise<string>;
  unassignHotkey: (content: Content) => Promise<string>;
  deleteContent: (content: Content) => void;
}

const electronApi: IElectronAPI = {
  subscribeClipboardData: (
    callback: (e: Electron.IpcRendererEvent, content: Content) => void
  ) => ipcRenderer.on("clipboard-updated", callback),
  unsubscribeClipboardData: () =>
    ipcRenderer.removeAllListeners("clipboard-updated"),
  getContents: () => ipcRenderer.invoke("getContents"),
  assignHotkey: (content: Content, hotkey: string) =>
    ipcRenderer.invoke("assignHotkey", content, hotkey),
  unassignHotkey: (content: Content) =>
    ipcRenderer.invoke("unassignHotkey", content),
  deleteContent: (content: Content) =>
    ipcRenderer.send("deleteContent", content),
};
contextBridge.exposeInMainWorld("electronAPI", electronApi);
