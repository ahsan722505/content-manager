import { clipboard, globalShortcut } from "electron";
import { exec } from "child_process";
import { Sqlite } from "./sqlite";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY;

const client = createClient(SUPABASE_URL, SUPABASE_KEY);

const channel = client.channel("clipboard");

export type Content = {
  ID: number;
  content: string;
  hotkey: string | null;
};

let customPasting = false;

export async function clipboardListener(callback: (content: Content) => void) {
  setInterval(async () => {
    const text = clipboard.readText().trim();
    if (text !== latestContents.get(0) && text !== "" && !customPasting) {
      channel.send({
        type: "broadcast",
        event: "clipboard-updated",
        payload: { content: text },
      });
      const content = await storeClipboardContent(text);
      callback(content);
    }
  }, 1000);
}

export async function syncRemoteClipboard(text: string) {
  customPasting = true;
  clipboard.writeText(text);
  const content = await storeClipboardContent(text);
  customPasting = false;
  return content;
}

export async function getClipboardContents(): Promise<Content[]> {
  const db = new Sqlite();
  const contents = await db.getContents();
  return contents;
}

export async function storeClipboardContent(text: string): Promise<Content> {
  const db = new Sqlite();
  const existingContent = await db.getContentByText(text);
  const content = await db.addContent({
    content: text,
    hotkey: existingContent ? existingContent.hotkey : null,
  });
  latestContents.addContent(text);
  return content;
}

export function pasteContent(content: string | undefined) {
  if (!content) return;
  customPasting = true;
  clipboard.writeText(content);
  const childProcess = exec("./cpp/keyboard");
  childProcess.on("exit", () => {
    setTimeout(() => {
      clipboard.writeText(latestContents.get(0));
      customPasting = false;
    }, 100);
  });
}

export async function deleteContent(content: Content) {
  const db = new Sqlite();
  await db.deleteContent(content.ID);
  if (latestContents.get(0) === content.content) {
    clipboard.writeText(latestContents.get(1));
  }
  latestContents.deleteContent(content.content);
  if (content.hotkey) {
    globalShortcut.unregister(content.hotkey);
  }
}

export async function assignHotkey(
  content: Content,
  hotkey: string
): Promise<string> {
  const db = new Sqlite();
  const existingContent = await db.getContentByHotkey(hotkey);
  if (existingContent) {
    throw new Error("Hotkey is already assigned.");
  }
  if (content.hotkey) {
    globalShortcut.unregister(content.hotkey);
  }
  await db.updateHotkey(content.ID, hotkey);
  globalShortcut.register(hotkey, () => pasteContent(content.content));
  return "Hotkey assigned successfully.";
}

export async function unassignHotkey(content: Content): Promise<string> {
  const db = new Sqlite();
  await db.updateHotkey(content.ID, null);
  globalShortcut.unregister(content.hotkey!);
  return "Hotkey unassigned successfully.";
}

export class LatestContentsCache {
  private contents: string[] = [];
  private cacheSize: number;
  constructor(cacheSize: number) {
    this.cacheSize = cacheSize;
  }

  public initialize() {
    // asynchronously initializes the cache
    getClipboardContents().then((contents) => {
      this.contents = contents.map((c) => c.content).slice(0, this.cacheSize);
    });
    return this;
  }

  public get(index: number): string {
    return this.contents[index];
  }

  public addContent(content: string) {
    this.contents = [
      content,
      ...this.contents.filter((c) => c !== content),
    ].slice(0, this.cacheSize);
  }

  public deleteContent(content: string) {
    this.contents = this.contents.filter((c) => c !== content);
  }
}

export const latestContents = new LatestContentsCache(9);
