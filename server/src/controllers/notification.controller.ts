import { Response, NextFunction } from 'express'
import { NotificationRepository } from '../repositories/notification.repository'
import { AuthenticatedRequest } from '../Middlewares/auth.middleware'
import { AppError } from '../Middlewares/error.middleware'

const notiRepo = new NotificationRepository()

/**
 * GET /api/notifications
 * ดึงรายการแจ้งเตือนทั้งหมดของผู้ใช้
 */
export const getMyNotifications = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.userId
    const limit = req.query.limit ? Number(req.query.limit) : 30

    const notifications = await notiRepo.findByUserId(userId, limit)
    const unreadCount = await notiRepo.countUnread(userId)

    res.status(200).json({
      success: true,
      data: {
        notifications,
        unreadCount
      }
    })
  } catch (error) {
    next(error)
  }
}

/**
 * GET /api/notifications/unread-count
 * ดึงเฉพาะจำนวนที่ยังไม่ได้อ่าน
 */
export const getUnreadCount = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.userId
    const count = await notiRepo.countUnread(userId)
    res.status(200).json({ success: true, count })
  } catch (error) {
    next(error)
  }
}

/**
 * PATCH /api/notifications/:id/read
 * ทำเครื่องหมายการแจ้งเตือนว่าอ่านแล้ว
 */
export const markAsRead = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.userId
    const notiId = req.params.id

    const updated = await notiRepo.markAsRead(notiId, userId)
    if (!updated) {
      throw new AppError('Notification not found', 404)
    }

    res.status(200).json({
      success: true,
      message: 'Marked as read',
      data: updated
    })
  } catch (error) {
    next(error)
  }
}

/**
 * POST /api/notifications/read-all
 * ทำเครื่องหมายอ่านแล้วทั้งหมด
 */
export const markAllAsRead = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.userId
    await notiRepo.markAllAsRead(userId)

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read'
    })
  } catch (error) {
    next(error)
  }
}
