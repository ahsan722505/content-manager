import { Database } from "sqlite3";
var sqlite3 = require("sqlite3");
const dbPath = "./content.db";
export class sqlite {
  db: Database;

  constructor() {
    this.db = new sqlite3.Database(dbPath);
  }
}
