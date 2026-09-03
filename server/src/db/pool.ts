import { Pool, PoolClient, QueryResultRow } from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const connectionString =
  process.env.DATABASE_URL ||
  'postgresql://postgres:postgres@localhost:5432/kanban_db?sslmode=disable'

export const pool = new Pool({
  connectionString,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
})

pool.on('error', (err) => {
  console.error('[DB] Unexpected error on idle client:', err)
})

/**
 * Execute a Type-Safe SQL query returning an array of rows of type T
 */
export async function query<T extends QueryResultRow = any>(
  sql: string,
  params: any[] = []
): Promise<T[]> {
  const start = Date.now()
  try {
    const res = await pool.query<T>(sql, params)
    const duration = Date.now() - start
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DB Query] ${sql.substring(0, 50)}... (${duration}ms, rows: ${res.rowCount})`)
    }
    return res.rows
  } catch (error) {
    console.error('[DB Query Error]', { sql, params, error })
    throw error
  }
}

/**
 * Execute a single query expecting at most one row, or null if not found
 */
export async function queryOne<T extends QueryResultRow = any>(
  sql: string,
  params: any[] = []
): Promise<T | null> {
  const rows = await query<T>(sql, params)
  return rows.length > 0 ? rows[0] : null
}

/**
 * Transaction Helper: executes queries within a BEGIN ... COMMIT block.
 * Automatically performs ROLLBACK on error.
 */
export async function withTransaction<T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const result = await callback(client)
    await client.query('COMMIT')
    return result
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('[DB Transaction Error] Rolled back transaction:', error)
    throw error
  } finally {
    client.release()
  }
}
