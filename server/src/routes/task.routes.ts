import { Router } from 'express'
import {
  getTaskById,
  updateTask,
  moveTask,
  deleteTask,
  assignTask
} from '../controllers/task.controller'
import { authenticateToken } from '../Middlewares/auth.middleware'

const router = Router()

router.use(authenticateToken)

router.get('/:id', getTaskById)
router.patch('/:id', updateTask)
router.patch('/:id/move', moveTask)
router.delete('/:id', deleteTask)
router.post('/:id/assign', assignTask)

export default router
