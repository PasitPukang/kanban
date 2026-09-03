import { Router } from 'express'
import {
  getMyNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead
} from '../controllers/notification.controller'
import { authenticateToken } from '../Middlewares/auth.middleware'

const router = Router()

router.use(authenticateToken)

router.get('/', getMyNotifications)
router.get('/unread-count', getUnreadCount)
router.patch('/:id/read', markAsRead)
router.post('/read-all', markAllAsRead)

export default router
