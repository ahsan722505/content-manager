import { clipboard } from "electron";
import { readFile, writeFile } from "fs/promises";
import path from "node:path";
import { spawn } from "child_process";

const dbPath = path.join(__dirname, "../contents.json");

export async function clipboardListener(callback: (text: string) => void) {
  let latestClipboardContent = (await getClipboardContents())[0];

  setInterval(() => {
    const text = clipboard.readText().trim();
    if (text !== latestClipboardContent && text !== "") {
      latestClipboardContent = text;
      callback(text);
      storeClipboardContent(text);
    }
  }, 1000);
}

export async function getClipboardContents(): Promise<string[]> {
  const json = await readFile(dbPath, { encoding: "utf-8" });
  const contents: string[] = JSON.parse(json).contents;
  return contents;
}

export async function storeClipboardContent(text: string) {
  const json = await readFile(dbPath, { encoding: "utf-8" });
  const data: { contents: string[] } = JSON.parse(json);
  data.contents.unshift(text);
  const uniqueData = [...new Set(data.contents)];
  latestContents = uniqueData.slice(0, 9);
  writeFile("./contents.json", JSON.stringify({ contents: uniqueData }));
}

export function pasteContent(content: string | undefined) {
  if (!content) return;
  clipboard.writeText(content);
  spawn("/usr/bin/python3", ["./python/keyboard.py", content]);
}

export let latestContents: string[] = [];

export async function initializeLatestContents() {
  const contents = await getClipboardContents();
  for (let i = 0; i < 9; i++) {
    latestContents[i] = contents[i];
  }
}
