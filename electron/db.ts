import { Database } from "sqlite3";
import * as fs from "fs";
const filepath = "./content.db";

function createDbConnection() {
  if (fs.existsSync(filepath)) {
    return new Database(filepath);
  } else {
    const db = new Database(filepath, (error) => {
      if (error) {
        return console.error(error.message);
      }
      createTable(db);
    });
    return db;
  }
}

function createTable(db: Database) {
  db.exec(`
  CREATE TABLE contents
  (
    ID INTEGER PRIMARY KEY AUTOINCREMENT,
    content TEXT NOT NULL,
  );
`);
}

export default createDbConnection();
