import express, { Request, Response } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { pool } from './db/pool'
import apiRouter from './routes'
import { errorHandler } from './Middlewares/error.middleware'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Middlewares
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true
  })
)
app.use(express.json())

// Health check endpoint
app.get('/health', async (_req: Request, res: Response) => {
  try {
    const dbRes = await pool.query('SELECT NOW()')
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: 'connected',
      dbTime: dbRes.rows[0].now
    })
  } catch (error) {
    res.status(503).json({
      status: 'degraded',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: (error as Error).message
    })
  }
})

// Root route (API Directory)
app.get('/', (_req: Request, res: Response) => {
  res.json({
    name: 'Clicknext Kanban Board API',
    version: '1.0.0',
    status: 'online',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      boards: '/api/boards',
      columns: '/api/columns',
      tasks: '/api/tasks',
      notifications: '/api/notifications'
    }
  })
})

// Main API Router Mounting
app.use('/api', apiRouter)

// Global Error Handler Middleware (ต้องอยู่ล่างสุดเสมอ)
app.use(errorHandler)

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 [Server] Backend running on http://localhost:${PORT}`)
  })
}

export default app
