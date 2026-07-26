import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_PATH = path.join(__dirname, '..', 'data.db');

export function getConnection(timeoutMs = 0): Database.Database {
  return new Database(DB_PATH, { timeout: timeoutMs });
}

export function initDb(): void {
  // repart d'une base propre à chaque démarrage (contexte de formation)
  if (fs.existsSync(DB_PATH)) fs.unlinkSync(DB_PATH);

  const db = getConnection();
  db.exec(`
    CREATE TABLE IF NOT EXISTS accounts (
      id INTEGER PRIMARY KEY,
      owner TEXT NOT NULL,
      balance INTEGER NOT NULL
    );
  `);
  db.prepare('INSERT INTO accounts (id, owner, balance) VALUES (?, ?, ?)').run(1, 'Alice', 1000);
  db.prepare('INSERT INTO accounts (id, owner, balance) VALUES (?, ?, ?)').run(2, 'Bob', 1000);
  db.close();
}
