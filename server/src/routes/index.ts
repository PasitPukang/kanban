import { Router } from 'express'
import authRoutes from './auth.routes'
import boardRoutes from './board.routes'
import columnRoutes from './column.routes'
import taskRoutes from './task.routes'
import notificationRoutes from './notification.routes'
import adminRoutes from './admin.routes'

const apiRouter = Router()

apiRouter.use('/auth', authRoutes)
apiRouter.use('/boards', boardRoutes)
apiRouter.use('/columns', columnRoutes)
apiRouter.use('/tasks', taskRoutes)
apiRouter.use('/notifications', notificationRoutes)
apiRouter.use('/admin', adminRoutes)

export default apiRouter
