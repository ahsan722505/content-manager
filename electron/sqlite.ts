import { Database } from "sqlite3";
import { Content } from "./utils";
var sqlite3 = require("sqlite3");
const dbPath = "./content.db";
export class Sqlite {
  private db: Database;

  constructor() {
    this.db = new sqlite3.Database(dbPath);
  }

  setupDatabase(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.exec(
        `
        CREATE TABLE IF NOT EXISTS contents
  (
      ID INTEGER PRIMARY KEY AUTOINCREMENT,
      content TEXT UNIQUE NOT NULL,
      hotkey TEXT UNIQUE
  );
  `,
        (error) => {
          if (error) {
            reject(error);
          } else resolve();
        }
      );
    });
  }

  getContents(): Promise<Content[]> {
    return new Promise((resolve, reject) => {
      this.db.all(
        `SELECT * FROM contents
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

  getContentById(contentId: number): Promise<Content | null> {
    return new Promise((resolve, reject) => {
      this.db.get(
        `SELECT * FROM contents
      WHERE id = ?`,
        [contentId],
        (error, row: Content) => {
          if (error) {
            reject(error);
          } else {
            resolve(row);
          }
        }
      );
    });
  }

  getContentByText(content: string): Promise<Content | null> {
    return new Promise((resolve, reject) => {
      this.db.get(
        `SELECT * FROM contents
      WHERE content = ?`,
        [content],
        (error, row: Content) => {
          if (error) {
            reject(error);
          } else {
            resolve(row);
          }
        }
      );
    });
  }

  getContentByHotkey(hotkey: string): Promise<Content | null> {
    return new Promise((resolve, reject) => {
      this.db.get(
        `SELECT * FROM contents
      WHERE hotkey = ?`,
        [hotkey],
        (error, row: Content) => {
          if (error) {
            reject(error);
          } else {
            resolve(row);
          }
        }
      );
    });
  }

  addContent(content: Omit<Content, "ID">): Promise<Content> {
    return new Promise((resolve) => {
      this.db.run(
        `INSERT OR REPLACE INTO contents (content, hotkey) VALUES (?, ?)`,
        [content.content, content.hotkey],
        function () {
          resolve({
            ID: this.lastID,
            content: content.content,
            hotkey: content.hotkey,
          });
        }
      );
    });
  }

  deleteContent(contentId: number): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.run(`DELETE FROM contents WHERE id = ?`, [contentId], (error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }

  updateHotkey(contentId: number, hotkey: Content["hotkey"]): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.run(
        `UPDATE contents SET hotkey = ? WHERE id = ?`,
        [hotkey, contentId],
        (error) => {
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        }
      );
    });
  }
}
