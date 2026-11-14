/**
 * database.ts — MySQL connection singleton (GoF Singleton).
 *
 * Encapsulates the mysql2/promise connection pool behind ONE shared
 * instance. Every other module must go through `DatabaseManager.instance()`
 * — there is no exported bare pool to misuse.
 */
import mysql, { type Pool } from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

/** Uniform result of running one query. */
export interface QueryResult {
  rows: Record<string, unknown>[];
  insertId: number;
  affectedRows: number;
  fields: unknown;
}

/** Values for the `?` placeholders of a query. */
export type SqlParams = Array<string | number | null | undefined>;

/** MySQL driver error as it arrives on a rejected promise. */
export interface DriverError extends Error {
  code?: string;
}

/** Normalized HTTP error shape used by routes. */
export interface ErrorMapping {
  status: number;
  error: string;
}

// Module-private token: only `instance()` can construct the singleton.
const CONSTRUCTION_TOKEN = Symbol('DatabaseManager');

/**
 * Singleton: DatabaseManager — the one shared database connection.
 *
 * The pool itself is private state; callers only ever see this object.
 */
export class DatabaseManager {
  // Private field holding the single instance.
  static #instance: DatabaseManager | null = null;

  // Private field holding the single connection pool.
  #pool: Pool;

  // Construction is blocked from outside (token guard).
  private constructor(token: symbol) {
    if (token !== CONSTRUCTION_TOKEN) {
      throw new Error('DatabaseManager is a singleton — use DatabaseManager.instance()');
    }
    this.#pool = this.#createPool();
  }

  /** @returns The single shared instance. */
  static instance(): DatabaseManager {
    if (DatabaseManager.#instance === null) {
      DatabaseManager.#instance = new DatabaseManager(CONSTRUCTION_TOKEN);
    }
    return DatabaseManager.#instance;
  }

  /** The raw pool, for driver-level operations (e.g. transactions). */
  getPool(): Pool {
    return this.#pool;
  }

  /**
   * Run one parameterized query.
   *
   * SECURITY: `sql` identifiers (table/column names) must be internal
   * constants — never user input. All user values go through `params`.
   */
  async query(sql: string, params: SqlParams = []): Promise<QueryResult> {
    const [rows, fields] = (await this.#pool.query(sql, params)) as [unknown, unknown];
    // SELECT -> rows is an array; INSERT/UPDATE/DELETE -> OkPacket.
    if (Array.isArray(rows)) {
      return { rows: rows as Record<string, unknown>[], insertId: 0, affectedRows: rows.length, fields };
    }
    const packet = rows as { insertId?: number; affectedRows?: number } | undefined;
    return {
      rows: [],
      insertId: packet?.insertId ?? 0,
      affectedRows: packet?.affectedRows ?? 0,
      fields,
    };
  }

  /**
   * Find one row by primary key, or null.
   *
   * @param table Internal constant table name.
   * @param idColumn Internal constant id column name.
   * @param id Primary-key value (parameterized).
   */
  async findById(
    table: string,
    idColumn: string,
    id: number | string,
  ): Promise<Record<string, unknown> | null> {
    const result = await this.query(`SELECT * FROM ${table} WHERE ${idColumn} = ?`, [id]);
    return (result.rows[0] as Record<string, unknown> | undefined) ?? null;
  }

  /** Create the connection pool from environment configuration. */
  #createPool(): Pool {
    return mysql.createPool({
      host: process.env.DB_HOST ?? 'localhost',
      port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
      user: process.env.DB_USER ?? 'root',
      password: process.env.DB_PASSWORD ?? '',
      database: process.env.DB_NAME ?? 'hospital_management',
      waitForConnections: true,
      connectionLimit: 10,
      dateStrings: true, // DATE/TIME come back as strings -> stable JSON
    });
  }
}

/** Map a MySQL driver error to an HTTP-friendly mapping. */
export function dbError(err: DriverError): ErrorMapping {
  if (err.code === 'ER_DUP_ENTRY') {
    return { status: 409, error: 'Duplicate entry: a record with the same unique value already exists.' };
  }
  if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    return { status: 400, error: 'Referenced record does not exist (foreign key constraint).' };
  }
  if (err.code === 'ER_ROW_IS_REFERENCED_2') {
    return { status: 409, error: 'Cannot delete: other records reference this record.' };
  }
  if (err.code === 'ER_CHECK_CONSTRAINT_VIOLATED') {
    return { status: 400, error: 'Value violates a CHECK constraint.' };
  }
  return { status: 500, error: err.message };
}
