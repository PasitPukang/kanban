import { Response, NextFunction } from 'express'
import { BoardRepository } from '../repositories/board.repository'
import { UserRepository } from '../repositories/user.repository'
import { NotificationRepository } from '../repositories/notification.repository'
import { AuthenticatedRequest } from '../Middlewares/auth.middleware'
import { AppError } from '../Middlewares/error.middleware'

const boardRepo = new BoardRepository()
const userRepo = new UserRepository()
const notiRepo = new NotificationRepository()

/**
 * GET /api/boards
 * ดึง Board ทั้งหมดที่เกี่ยวข้องกับผู้ใช้ที่ Login อยู่
 */
export const getMyBoards = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.userId
    const boards = await boardRepo.findUserBoards(userId)
    res.status(200).json({ success: true, data: boards })
  } catch (error) {
    next(error)
  }
}

/**
 * POST /api/boards
 * สร้าง Board ใหม่ (พร้อม 3 คอลัมน์มาตรฐาน และสิทธิ์ OWNER อัตโนมัติ)
 */
export const createBoard = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.userId
    const { title, description } = req.body

    if (!title || !title.trim()) {
      throw new AppError('Board title is required', 400)
    }

    const board = await boardRepo.createWithDefaults({
      title,
      description: description || null,
      owner_id: userId
    })

    // ดึงโครงสร้างเต็มกลับไปแสดง
    const boardDetails = await boardRepo.getBoardDetails(board.id)

    res.status(201).json({
      success: true,
      message: 'Board created successfully with default columns',
      data: boardDetails
    })
  } catch (error) {
    next(error)
  }
}

/**
 * GET /api/boards/:id
 * ดึงข้อมูลบอร์ดแบบครบถ้วน (Nested Columns, Tasks, Assignees, Members)
 */
export const getBoardDetails = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.userId
    const boardId = req.params.id

    // ตรวจสอบสิทธิ์การเข้าถึง
    const hasAccess = await boardRepo.checkAccess(boardId, userId)
    if (!hasAccess) {
      throw new AppError('You do not have access to this board', 403)
    }

    const board = await boardRepo.getBoardDetails(boardId)
    if (!board) {
      throw new AppError('Board not found', 404)
    }

    res.status(200).json({ success: true, data: board })
  } catch (error) {
    next(error)
  }
}

/**
 * PATCH /api/boards/:id
 * แก้ไขชื่อหรือคำอธิบายบอร์ด
 */
export const updateBoard = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.userId
    const boardId = req.params.id
    const { title, description } = req.body

    const hasAccess = await boardRepo.checkAccess(boardId, userId)
    if (!hasAccess) {
      throw new AppError('Forbidden: You are not a member of this board', 403)
    }

    const updated = await boardRepo.update(boardId, { title, description })
    res.status(200).json({
      success: true,
      message: 'Board updated successfully',
      data: updated
    })
  } catch (error) {
    next(error)
  }
}

/**
 * DELETE /api/boards/:id
 * ลบบอร์ด (อนุญาตเฉพาะ OWNER เท่านั้น)
 */
export const deleteBoard = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.userId
    const boardId = req.params.id

    const isOwner = await boardRepo.isOwner(boardId, userId)
    if (!isOwner) {
      throw new AppError('Forbidden: Only the board owner can delete this board', 403)
    }

    await boardRepo.delete(boardId)
    res.status(200).json({
      success: true,
      message: 'Board deleted successfully'
    })
  } catch (error) {
    next(error)
  }
}

/**
 * POST /api/boards/:id/invite
 * เชิญสมาชิกเข้าบอร์ดด้วย Email
 */
export const inviteMember = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const inviterId = req.user!.userId
    const inviterName = req.user!.name || 'A team member'
    const boardId = req.params.id
    const { email } = req.body

    if (!email) {
      throw new AppError('Member email is required', 400)
    }

    // 1. ตรวจสอบว่าผู้เชิญมีสิทธิ์ในบอร์ดนี้ไหม
    const hasAccess = await boardRepo.checkAccess(boardId, inviterId)
    if (!hasAccess) {
      throw new AppError('Forbidden: You do not have permission to invite members to this board', 403)
    }

    // 2. หาผู้ใช้ที่ต้องการเชิญ
    const targetUser = await userRepo.findByEmail(email)
    if (!targetUser) {
      throw new AppError(`User with email "${email}" not found in system`, 404)
    }

    // 3. เพิ่มเข้าเป็น Member
    const membership = await boardRepo.addMember(boardId, targetUser.id, 'MEMBER')

    // 4. ดึงชื่อบอร์ดมาสร้างข้อความแจ้งเตือน
    const board = await boardRepo.findById(boardId)
    const boardTitle = board?.title || 'a Kanban board'

    // 5. ส่ง Notification ไปยังผู้ถูกเชิญ
    await notiRepo.create({
      user_id: targetUser.id,
      title: 'Board Invitation',
      message: `${inviterName} has invited you to join the board "${boardTitle}"`,
      link: `/boards/${boardId}`
    })

    res.status(200).json({
      success: true,
      message: `User ${targetUser.email} has been added to board successfully`,
      data: {
        membership,
        user: {
          id: targetUser.id,
          email: targetUser.email,
          name: targetUser.name,
          avatar_url: targetUser.avatar_url
        }
      }
    })
  } catch (error) {
    next(error)
  }
}

/**
 * DELETE /api/boards/:id/members/:userId
 * ลบสมาชิกออกจากบอร์ด
 */
export const removeMember = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const currentUserId = req.user!.userId
    const boardId = req.params.id
    const targetUserId = req.params.userId

    // เจ้าของบอร์ดสามารถเตะสมาชิกออกได้ หรือตัวสมาชิกเองขอกด Leave บอร์ดได้
    const isOwner = await boardRepo.isOwner(boardId, currentUserId)
    const isSelf = currentUserId === targetUserId

    if (!isOwner && !isSelf) {
      throw new AppError('Forbidden: You do not have permission to remove this member', 403)
    }

    await boardRepo.removeMember(boardId, targetUserId)
    res.status(200).json({
      success: true,
      message: 'Member removed from board'
    })
  } catch (error) {
    next(error)
  }
}
