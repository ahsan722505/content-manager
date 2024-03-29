import { app, BrowserWindow, globalShortcut, ipcMain } from "electron";
import path from "node:path";
import {
  assignHotkey,
  clipboardListener,
  deleteContent,
  getClipboardContents,
  latestContents,
  pasteContent,
  syncRemoteClipboard,
  unassignHotkey,
} from "./utils";
import { Sqlite } from "./sqlite";

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.js
// │
process.env.DIST = path.join(__dirname, "../dist");
process.env.VITE_PUBLIC = app.isPackaged
  ? process.env.DIST
  : path.join(process.env.DIST, "../public");

let win: BrowserWindow | null;
// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  clipboardListener((text) => {
    win?.webContents.send("clipboard-updated", text);
  });

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(process.env.DIST, "index.html"));
  }
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    win = null;
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app
  .whenReady()
  .then(async () => {
    const db = new Sqlite();
    await db.setupDatabase();
    for (let i = 1; i <= 9; i++) {
      globalShortcut.register(`CommandOrControl+${i}`, () =>
        pasteContent(latestContents.get(i - 1))
      );
    }
    const contents = await db.getContents();
    contents.forEach((content) => {
      if (!content.hotkey) return;
      globalShortcut.register(content.hotkey, () =>
        pasteContent(content.content)
      );
    });
  })
  .then(async () => {
    latestContents.initialize();
    ipcMain.handle("getContents", async () => await getClipboardContents());
    ipcMain.handle(
      "assignHotkey",
      async (_, content, hotkey) => await assignHotkey(content, hotkey)
    );
    ipcMain.handle("syncRemoteClipboard", async (_, text) => {
      const content = await syncRemoteClipboard(text);
      win?.webContents.send("clipboard-updated", content);
    });
    ipcMain.handle(
      "unassignHotkey",
      async (_, content) => await unassignHotkey(content)
    );
    ipcMain.on("deleteContent", (_, content) => deleteContent(content));
    createWindow();
  });
