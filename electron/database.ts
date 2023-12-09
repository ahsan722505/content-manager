// import * as sqlite3 from "sqlite3";
var sqlite3 = require("sqlite3");
const dbPath = "./content.db";
export class Database {
  db: sqlite3.Database;

  constructor() {
    this.db = new sqlite3.Database(dbPath);
  }
}
