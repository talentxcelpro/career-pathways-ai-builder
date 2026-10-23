import { useEffect, useState, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';

export interface SqlQueryResult<T = unknown> {
  values: T[];
}

export interface SqlExecuteResult {
  changes?: number;
  lastId?: number;
}

interface SqliteConnection {
  open(): Promise<void>;
  close(): Promise<void>;
  execute(options: { statements: string }): Promise<SqlExecuteResult>;
  run(options: { statement: string; values?: unknown[] }): Promise<SqlExecuteResult>;
  query(options: { statement: string; values?: unknown[] }): Promise<SqlQueryResult>;
}

const DB_NAME = 'talentxcel_offline_db';
let dbInstance: SqliteConnection | null = null;
let isInitialized = false;

// Fallback in-memory / localStorage storage for Web development preview
class WebStorageFallback implements SqliteConnection {
  private prefix = 'tx_db_';

  async open(): Promise<void> {
    console.info('[NativeDB] Web platform detected. Using LocalStorage fallback layer.');
  }

  async close(): Promise<void> {}

  async execute(options: { statements: string }): Promise<SqlExecuteResult> {
    console.debug('[NativeDB-Web] Executed DDL:', options.statements);
    return { changes: 0 };
  }

  async run(options: { statement: string; values?: unknown[] }): Promise<SqlExecuteResult> {
    const { statement, values = [] } = options;
    if (statement.toLowerCase().includes('insert into career_cache') && values.length >= 2) {
      const [key, value] = values;
      localStorage.setItem(`${this.prefix}${key}`, String(value));
      return { changes: 1 };
    }
    return { changes: 0 };
  }

  async query(options: { statement: string; values?: unknown[] }): Promise<SqlQueryResult> {
    const { statement, values = [] } = options;
    if (statement.toLowerCase().includes('from career_cache') && values.length >= 1) {
      const key = values[0];
      const raw = localStorage.getItem(`${this.prefix}${key}`);
      if (raw) {
        return { values: [{ key, value: raw }] };
      }
    }
    return { values: [] };
  }
}

/**
 * Initializes the SQLite Database on native devices.
 * Creates local schema tables protected against mobile browser eviction.
 */
export async function initDatabase(): Promise<SqliteConnection> {
  if (dbInstance && isInitialized) {
    return dbInstance;
  }

  if (!Capacitor.isNativePlatform()) {
    dbInstance = new WebStorageFallback();
    await dbInstance.open();
    isInitialized = true;
    return dbInstance;
  }

  try {
    // Dynamic import to allow pure web build to bundle cleanly
    const sqliteModule = await import('@capacitor-community/sqlite');
    const sqlitePlugin = sqliteModule.CapacitorSQLite;

    const ret = await sqlitePlugin.createConnection({
      database: DB_NAME,
      version: 1,
      encrypted: false,
      mode: 'no-encryption',
    });

    dbInstance = ret as unknown as SqliteConnection;
    await dbInstance.open();

    // Create durable, eviction-proof tables
    const initSql = `
      CREATE TABLE IF NOT EXISTS career_cache (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        expires_at INTEGER,
        updated_at INTEGER DEFAULT (strftime('%s', 'now'))
      );

      CREATE TABLE IF NOT EXISTS offline_mutation_queue (
        id TEXT PRIMARY KEY,
        action TEXT NOT NULL,
        endpoint TEXT NOT NULL,
        payload TEXT NOT NULL,
        retry_count INTEGER DEFAULT 0,
        created_at INTEGER DEFAULT (strftime('%s', 'now'))
      );

      CREATE TABLE IF NOT EXISTS call_history_cache (
        call_id TEXT PRIMARY KEY,
        caller_name TEXT,
        call_type TEXT,
        duration_seconds INTEGER DEFAULT 0,
        timestamp INTEGER DEFAULT (strftime('%s', 'now'))
      );
    `;

    await dbInstance.execute({ statements: initSql });
    isInitialized = true;
    console.log('[NativeDB] SQLite Database initialized in native sandbox.');
    return dbInstance;
  } catch (err) {
    console.warn('[NativeDB] Native SQLite connection unavailable, using web fallback:', err);
    dbInstance = new WebStorageFallback();
    await dbInstance.open();
    isInitialized = true;
    return dbInstance;
  }
}

/**
 * Executes a parameterized SQL read query.
 */
export async function dbQuery<T = unknown>(statement: string, values: unknown[] = []): Promise<T[]> {
  const db = await initDatabase();
  const res = await db.query({ statement, values });
  return (res.values as T[]) || [];
}

/**
 * Executes a parameterized SQL write / mutation statement.
 */
export async function dbExecute(statement: string, values: unknown[] = []): Promise<SqlExecuteResult> {
  const db = await initDatabase();
  return db.run({ statement, values });
}

/**
 * Helper to cache JSON items with an expiration duration.
 */
export async function setCacheItem(key: string, data: unknown, ttlSeconds = 86400): Promise<void> {
  const serialized = JSON.stringify(data);
  const expiresAt = Math.floor(Date.now() / 1000) + ttlSeconds;
  await dbExecute(
    `INSERT OR REPLACE INTO career_cache (key, value, expires_at, updated_at) VALUES (?, ?, ?, strftime('%s', 'now'))`,
    [key, serialized, expiresAt]
  );
}

/**
 * Helper to retrieve a cached JSON item if unexpired.
 */
export async function getCacheItem<T = unknown>(key: string): Promise<T | null> {
  const now = Math.floor(Date.now() / 1000);
  const rows = await dbQuery<{ key: string; value: string; expires_at: number }>(
    `SELECT value FROM career_cache WHERE key = ? AND (expires_at IS NULL OR expires_at > ?) LIMIT 1`,
    [key, now]
  );
  if (!rows || rows.length === 0) return null;
  try {
    return JSON.parse(rows[0].value) as T;
  } catch {
    return null;
  }
}

/**
 * React hook to interact with native SQLite.
 */
export function useNativeDb() {
  const [ready, setReady] = useState(isInitialized);

  useEffect(() => {
    initDatabase()
      .then(() => setReady(true))
      .catch((e) => console.error('[useNativeDb] Init error:', e));
  }, []);

  const query = useCallback(<T>(sql: string, params: unknown[] = []) => dbQuery<T>(sql, params), []);
  const execute = useCallback((sql: string, params: unknown[] = []) => dbExecute(sql, params), []);
  const getCache = useCallback(<T>(key: string) => getCacheItem<T>(key), []);
  const setCache = useCallback((key: string, data: unknown, ttl?: number) => setCacheItem(key, data, ttl), []);

  return { ready, query, execute, getCache, setCache };
}
