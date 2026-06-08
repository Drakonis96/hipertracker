import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { config } from '../config.js';
import * as schema from './schema.js';

const sqlite = new Database(config.dbPath);
sqlite.pragma('journal_mode = WAL');
sqlite.pragma('foreign_keys = ON');

// Creación idempotente de tablas (evita depender de drizzle-kit en producción/Docker).
function initSchema() {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS profiles (
      id           TEXT PRIMARY KEY,
      name         TEXT NOT NULL,
      avatar       TEXT,
      color        TEXT NOT NULL DEFAULT '#10b981',
      pin_hash     TEXT,
      is_admin     INTEGER NOT NULL DEFAULT 0,
      accent_color TEXT NOT NULL DEFAULT '#10b981',
      theme        TEXT NOT NULL DEFAULT 'system',
      created_at   INTEGER NOT NULL,
      updated_at   INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS lists (
      id         TEXT PRIMARY KEY,
      name       TEXT NOT NULL,
      type       TEXT NOT NULL DEFAULT 'personal',
      owner_id   TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS items (
      id         TEXT PRIMARY KEY,
      name       TEXT NOT NULL,
      icon       TEXT,
      icon_type  TEXT NOT NULL DEFAULT 'none',
      list_id    TEXT NOT NULL REFERENCES lists(id) ON DELETE CASCADE,
      checked    INTEGER NOT NULL DEFAULT 0,
      position   INTEGER NOT NULL DEFAULT 0,
      notes      TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS custom_stores (
      id         TEXT PRIMARY KEY,
      name       TEXT NOT NULL,
      color      TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS item_stores (
      item_id  TEXT NOT NULL REFERENCES items(id) ON DELETE CASCADE,
      store_id TEXT NOT NULL,
      PRIMARY KEY (item_id, store_id)
    );

    CREATE TABLE IF NOT EXISTS list_members (
      list_id    TEXT NOT NULL REFERENCES lists(id) ON DELETE CASCADE,
      profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
      PRIMARY KEY (list_id, profile_id)
    );

    CREATE INDEX IF NOT EXISTS idx_lists_owner ON lists(owner_id);
    CREATE INDEX IF NOT EXISTS idx_items_list ON items(list_id);
    CREATE INDEX IF NOT EXISTS idx_item_stores_item ON item_stores(item_id);
    CREATE INDEX IF NOT EXISTS idx_list_members_list ON list_members(list_id);
    CREATE INDEX IF NOT EXISTS idx_list_members_profile ON list_members(profile_id);
  `);
}

initSchema();

export const db = drizzle(sqlite, { schema });
export { sqlite };
