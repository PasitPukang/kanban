import { Router } from 'express'
import { AdminController } from '../controllers/admin.controller'
import { authenticateToken, requireSuperAdmin } from '../Middlewares/auth.middleware'

const router = Router()
const adminController = new AdminController()

// ทุก Endpoint ใน Admin Router ต้องผ่าน JWT Authenticate และมีสิทธิ์ SUPER_ADMIN เท่านั้น
router.use(authenticateToken, requireSuperAdmin)

router.get('/users', (req, res) => adminController.getUsers(req, res))
router.post('/users', (req, res) => adminController.createUser(req, res))
router.patch('/users/:id', (req, res) => adminController.updateUser(req, res))
router.delete('/users/:id', (req, res) => adminController.deleteUser(req, res))
router.get('/stats', (req, res) => adminController.getStats(req, res))

export default router
