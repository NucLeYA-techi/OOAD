// MySQL connection pool (mysql2/promise).
// Wraps pool.query so routes can use the report's style: `result.rows`, `result.insertId`.
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'hospital_management',
  waitForConnections: true,
  connectionLimit: 10,
  dateStrings: true, // return DATE/TIME as strings -> stable JSON for the frontend
});

const originalQuery = pool.query.bind(pool);

pool.query = async (sql, params) => {
  const [rows, fields] = await originalQuery(sql, params);
  // SELECT -> rows is an array; INSERT/UPDATE/DELETE -> OkPacket has insertId/affectedRows
  if (Array.isArray(rows)) return { rows, insertId: 0, affectedRows: rows.length, fields };
  return { rows: [], insertId: rows?.insertId ?? 0, affectedRows: rows?.affectedRows ?? 0, fields };
};

/** Return one row by id, or null. Safe: table/column are internal constants, value is parameterized. */
export async function findById(table, idColumn, id) {
  const result = await pool.query(`SELECT * FROM ${table} WHERE ${idColumn} = ?`, [id]);
  return result.rows[0] ?? null;
}

/** Map MySQL constraint errors to HTTP-friendly messages. */
export function dbError(err) {
  if (err.code === 'ER_DUP_ENTRY') return { status: 409, error: 'Duplicate entry: a record with the same unique value already exists.' };
  if (err.code === 'ER_NO_REFERENCED_ROW_2') return { status: 400, error: 'Referenced record does not exist (foreign key constraint).' };
  if (err.code === 'ER_ROW_IS_REFERENCED_2') return { status: 409, error: 'Cannot delete: other records reference this record.' };
  if (err.code === 'ER_CHECK_CONSTRAINT_VIOLATED') return { status: 400, error: 'Value violates a CHECK constraint.' };
  return { status: 500, error: err.message };
}

export default pool;
