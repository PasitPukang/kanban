import fs from 'fs'
import path from 'path'
import { pool } from './pool'

async function runMigration() {
  console.log('🚀 [DB Migrate] Starting database migration...')
  const schemaPath = path.resolve(__dirname, 'schema.sql')
  
  if (!fs.existsSync(schemaPath)) {
    throw new Error(`Schema file not found at: ${schemaPath}`)
  }

  const sql = fs.readFileSync(schemaPath, 'utf8')

  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    await client.query(sql)
    await client.query('COMMIT')
    console.log('✅ [DB Migrate] Migration completed successfully!')
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('❌ [DB Migrate] Migration failed:', error)
    process.exit(1)
  } finally {
    client.release()
    await pool.end()
  }
}

// Run directly when executed
runMigration()
