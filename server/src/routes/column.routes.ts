import { Router } from 'express'
import {
  updateColumn,
  deleteColumn
} from '../controllers/column.controller'
import { createTask } from '../controllers/task.controller'
import { authenticateToken } from '../Middlewares/auth.middleware'

const router = Router()

router.use(authenticateToken)

// Column Operations
router.patch('/:id', updateColumn)
router.delete('/:id', deleteColumn)

// Nested Task creation inside Column
router.post('/:columnId/tasks', createTask)

export default router
