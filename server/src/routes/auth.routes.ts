import { Router } from 'express'
import {
  register,
  login,
  getMe,
  getAllUsers,
  searchUsers,
  forgotPassword,
  resetPassword
} from '../controllers/auth.controller'
import { authenticateToken } from '../Middlewares/auth.middleware'

const router = Router()

// Public Routes
router.post('/register', register)
router.post('/login', login)
router.post('/forgot-password', forgotPassword)
router.post('/reset-password', resetPassword)
router.get('/users', getAllUsers) // Public for quick demo switcher

// Protected Routes (Required JWT Token)
router.get('/me', authenticateToken, getMe)
router.get('/search', authenticateToken, searchUsers)

export default router
