import { clipboard } from "electron";
import { readFile, writeFile } from "fs/promises";
import path from "node:path";
import { exec } from "child_process";
import db from "./db";

export type Content = {
  id: number;
  content: string;
};

let latestClipboardContent: string;

let customPasting = false;

export async function clipboardListener(callback: (text: string) => void) {
  latestClipboardContent = (await getClipboardContents())[0];
  setInterval(() => {
    const text = clipboard.readText().trim();
    if (text !== latestClipboardContent && text !== "" && !customPasting) {
      latestClipboardContent = text;
      callback(text);
      storeClipboardContent(text);
    }
  }, 1000);
}

export async function getClipboardContents(): Promise<Content[]> {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT content, MAX(ID) AS id
    FROM contents
    GROUP BY content
    ORDER BY id DESC;`,
      (error, rows: Content[]) => {
        if (error) {
          reject(error);
        } else {
          resolve(rows);
        }
      }
    );
  });
}

export async function storeClipboardContent(text: string) {
  db.run(`INSERT INTO contents(content) VALUES(?)`, [text]);
  latestContents.addContent(text);
}

export function pasteContent(content: string | undefined) {
  if (!content) return;
  customPasting = true;
  clipboard.writeText(content);
  const childProcess = exec("./cpp/keyboard");
  childProcess.on("exit", () => {
    clipboard.writeText(latestClipboardContent);
    customPasting = false;
  });
}

export async function deleteContent(content: string) {
  // const contents = await getClipboardContents();
  // const newContents = contents.filter((c) => c !== content);
  // latestContents = newContents.slice(0, 9);
  // if (latestClipboardContent === content) {
  //   latestClipboardContent = latestContents[0];
  //   clipboard.writeText(latestClipboardContent);
  // }
  // writeFile("./contents.json", JSON.stringify({ contents: newContents }));
}

class LatestContentsCache {
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

  public get(): string[] {
    return this.contents.slice(0, this.cacheSize);
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

export const latestContents = new LatestContentsCache(9).initialize();
