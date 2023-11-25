import { contextBridge, ipcRenderer } from "electron";

// --------- Expose some API to the Renderer process ---------

contextBridge.exposeInMainWorld("electronAPI", {
  getOsName: () => ipcRenderer.invoke("getOsName"),
});
