import Database from 'better-sqlite3';
import { randomUUID } from 'node:crypto';
import { resolve } from 'node:path';
import { mkdirSync } from 'node:fs';

const DB_DIR = resolve(process.cwd(), 'data');
mkdirSync(DB_DIR, { recursive: true });

const db = new Database(resolve(DB_DIR, 'terrier-taste.db'));

db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS preferences (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL UNIQUE,
    dietary_prefs TEXT DEFAULT '[]',
    favorite_cuisines TEXT DEFAULT '[]',
    home_location TEXT DEFAULT '',
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS restaurants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    cuisine TEXT DEFAULT '',
    price TEXT DEFAULT '',
    location TEXT DEFAULT '',
    address TEXT DEFAULT '',
    lat REAL,
    lng REAL,
    google_place_id TEXT DEFAULT NULL,
    created_by INTEGER,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(created_by) REFERENCES users(id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    restaurant_id INTEGER NOT NULL,
    rating INTEGER NOT NULL,
    comment TEXT DEFAULT '',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY(restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
  );

  CREATE UNIQUE INDEX IF NOT EXISTS idx_reviews_user_restaurant
  ON reviews(user_id, restaurant_id);

`);

export function createSession(userId) {
  const token = randomUUID();
  db.prepare('INSERT INTO sessions (id, user_id) VALUES (?, ?)').run(token, userId);
  return token;
}

export function getUserByToken(token) {
  if (!token) return null;
  const row = db
    .prepare(
      `
      SELECT u.id, u.name, u.email
      FROM sessions s
      JOIN users u ON u.id = s.user_id
      WHERE s.id = ?
    `
    )
    .get(token);
  return row ?? null;
}

export function revokeSession(token) {
  if (!token) return;
  db.prepare('DELETE FROM sessions WHERE id = ?').run(token);
}

export function ensureDefaultPreferences(userId) {
  db.prepare(
    `
    INSERT INTO preferences (user_id)
    VALUES (?) ON CONFLICT(user_id) DO NOTHING
  `
  ).run(userId);
}

export default db;
