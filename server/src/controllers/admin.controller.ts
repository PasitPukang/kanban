import { Response } from 'express'
import bcrypt from 'bcryptjs'
import { AuthenticatedRequest } from '../Middlewares/auth.middleware'
import { UserRepository } from '../repositories/user.repository'
import { queryOne } from '../db/pool'

const userRepo = new UserRepository()

export class AdminController {
  /**
   * ดึงรายชื่อ User ทั้งหมดในระบบ (Super Admin Only)
   */
  async getUsers(_req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const users = await userRepo.findAll()
      res.json({
        success: true,
        data: users
      })
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message })
    }
  }

  /**
   * สร้าง User ใหม่ในฐานะ Super Admin
   */
  async createUser(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { name, email, password, role, avatar_url } = req.body

      if (!name || !email || !password) {
        res.status(400).json({
          success: false,
          message: 'Name, email, and password are required'
        })
        return
      }

      // Check existing email
      const existing = await userRepo.findByEmail(email)
      if (existing) {
        res.status(400).json({
          success: false,
          message: 'Email is already registered'
        })
        return
      }

      const salt = await bcrypt.genSalt(12)
      const hashedPassword = await bcrypt.hash(password, salt)

      const newUser = await userRepo.create({
        name,
        email,
        password: hashedPassword,
        avatar_url: avatar_url || null,
        role: role === 'SUPER_ADMIN' ? 'SUPER_ADMIN' : 'USER'
      })

      res.status(201).json({
        success: true,
        data: newUser,
        message: 'User created successfully'
      })
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message })
    }
  }

  /**
   * แก้ไขข้อมูล User (ชื่อ, อีเมล, สิทธิ์)
   */
  async updateUser(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params
      const { name, email, role, avatar_url, password } = req.body

      const updateData: any = {}
      if (name !== undefined) updateData.name = name
      if (email !== undefined) updateData.email = email
      if (avatar_url !== undefined) updateData.avatar_url = avatar_url
      if (role !== undefined) {
        updateData.role = role === 'SUPER_ADMIN' ? 'SUPER_ADMIN' : 'USER'
      }
      if (password) {
        const salt = await bcrypt.genSalt(12)
        updateData.password = await bcrypt.hash(password, salt)
      }

      const updated = await userRepo.update(id, updateData)
      if (!updated) {
        res.status(404).json({ success: false, message: 'User not found' })
        return
      }

      res.json({
        success: true,
        data: updated,
        message: 'User updated successfully'
      })
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message })
    }
  }

  /**
   * ลบ User ออกจากระบบ (ป้องกันการลบตัวเอง)
   */
  async deleteUser(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params

      // ป้องกัน Super Admin เผลอลบบัญชีตัวเอง
      const target = await userRepo.findById(id)
      if (!target) {
        res.status(404).json({ success: false, message: 'User not found' })
        return
      }

      const targetEmail = target.email.toLowerCase()
      if (targetEmail === 'pasitpukang1234567@gmail.com') {
        res.status(400).json({
          success: false,
          message: 'Cannot delete primary Super Admin account'
        })
        return
      }

      const success = await userRepo.delete(id)
      res.json({
        success,
        message: 'User deleted successfully'
      })
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message })
    }
  }

  /**
   * ข้อมูลสถิติรวมของระบบ (System Stats)
   */
  async getStats(_req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const totalUsers = await userRepo.count()
      const boardCount = await queryOne<{ count: string }>('SELECT COUNT(*) as count FROM boards')
      const taskCount = await queryOne<{ count: string }>('SELECT COUNT(*) as count FROM tasks')
      const superAdminCount = await queryOne<{ count: string }>(
        "SELECT COUNT(*) as count FROM users WHERE role = 'SUPER_ADMIN'"
      )

      res.json({
        success: true,
        data: {
          totalUsers,
          superAdmins: parseInt(superAdminCount?.count || '0', 10),
          totalBoards: parseInt(boardCount?.count || '0', 10),
          totalTasks: parseInt(taskCount?.count || '0', 10)
        }
      })
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message })
    }
  }
}
