import pg from 'pg';
import { config } from '../config/index.js';
import { memoryDb } from './memoryStore.js';

const { Pool } = pg;

export interface QueryResult<T = unknown> {
  rows: T[];
  rowCount: number;
}

export class DatabaseService {
  private pool: pg.Pool | null = null;
  private useMemory = false;

  constructor() {
    if (process.env.USE_MEMORY_DB === 'true' || process.env.NODE_ENV === 'test') {
      this.useMemory = true;
    } else {
      try {
        this.pool = new Pool({
          connectionString: config.db.connectionString,
          max: config.db.maxConnections,
          connectionTimeoutMillis: 3000,
        });
        this.pool.on('error', err => {
          console.warn('PostgreSQL pool error, falling back to memory database:', err.message);
          this.useMemory = true;
        });
      } catch {
        this.useMemory = true;
      }
    }
  }

  isMemoryMode(): boolean {
    return this.useMemory;
  }

  setMemoryMode(enable: boolean): void {
    this.useMemory = enable;
  }

  getMemoryDb() {
    return memoryDb;
  }

  async query<T = unknown>(text: string, params: unknown[] = []): Promise<QueryResult<T>> {
    if (this.useMemory || !this.pool) {
      return { rows: [], rowCount: 0 };
    }
    try {
      const result = await this.pool.query(text, params);
      return {
        rows: result.rows as T[],
        rowCount: result.rowCount || 0,
      };
    } catch (error) {
      console.warn('DB query failed, using memory fallback:', (error as Error).message);
      return { rows: [], rowCount: 0 };
    }
  }

  async close(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
    }
  }
}

export const db = new DatabaseService();
export { memoryDb };
