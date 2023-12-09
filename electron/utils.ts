import { clipboard } from "electron";
import { exec } from "child_process";
import { Database } from "./database";

export type Content = {
  ID: number;
  content: string;
};

let customPasting = false;

export async function clipboardListener(callback: (content: Content) => void) {
  setInterval(async () => {
    const text = clipboard.readText().trim();
    if (text !== latestContents.get(0) && text !== "" && !customPasting) {
      const id = await storeClipboardContent(text);
      callback({ ID: id, content: text });
    }
  }, 1000);
}

export async function getClipboardContents(): Promise<Content[]> {
  const { db } = new Database();
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT * FROM contents
    ORDER BY id DESC;`,
      (error, rows: Content[]) => {
        if (error) {
          reject(error);
        } else {
          console.log(rows);
          resolve(rows);
        }
      }
    );
  });
}

export async function storeClipboardContent(text: string): Promise<number> {
  return new Promise((resolve, reject) => {
    const { db } = new Database();
    db.run(
      `INSERT OR REPLACE INTO contents (content) VALUES (?)`,
      [text],
      function (error) {
        if (error) {
          reject(error);
        } else {
          resolve(this.lastID);
        }
      }
    );
    latestContents.addContent(text);
  });
}

export function pasteContent(content: string | undefined) {
  if (!content) return;
  customPasting = true;
  clipboard.writeText(content);
  const childProcess = exec("./cpp/keyboard");
  childProcess.on("exit", () => {
    clipboard.writeText(latestContents.get(0));
    customPasting = false;
  });
}

export async function deleteContent(content: Content) {
  const { db } = new Database();
  db.run(`DELETE FROM contents WHERE id = ?`, [content.id]);
  if (latestContents.get(0) === content.content) {
    clipboard.writeText(latestContents.get(1));
  }
  latestContents.deleteContent(content.content);
}

export function setupDatabase(): Promise<void> {
  const { db } = new Database();
  return new Promise((resolve) => {
    db.exec(
      `
      CREATE TABLE IF NOT EXISTS contents
(
    ID INTEGER PRIMARY KEY AUTOINCREMENT,
    content TEXT UNIQUE NOT NULL
);
`,
      (error) => {
        console.log(error);
        resolve();
      }
    );
  });
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
