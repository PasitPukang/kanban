import { Response, NextFunction } from 'express'
import { ColumnRepository } from '../repositories/column.repository'
import { BoardRepository } from '../repositories/board.repository'
import { AuthenticatedRequest } from '../Middlewares/auth.middleware'
import { AppError } from '../Middlewares/error.middleware'

const columnRepo = new ColumnRepository()
const boardRepo = new BoardRepository()

/**
 * POST /api/boards/:boardId/columns
 * สร้าง Column ใหม่ในบอร์ด
 */
export const createColumn = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.userId
    const boardId = req.params.boardId
    const { title } = req.body

    if (!title || !title.trim()) {
      throw new AppError('Column title is required', 400)
    }

    const hasAccess = await boardRepo.checkAccess(boardId, userId)
    if (!hasAccess) {
      throw new AppError('Forbidden: You do not have access to this board', 403)
    }

    const column = await columnRepo.create(boardId, title)
    res.status(201).json({
      success: true,
      message: 'Column created successfully',
      data: { ...column, tasks: [] }
    })
  } catch (error) {
    next(error)
  }
}

/**
 * PATCH /api/columns/:id
 * เปลี่ยนชื่อ Column
 */
export const updateColumn = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.userId
    const columnId = req.params.id
    const { title } = req.body

    if (!title || !title.trim()) {
      throw new AppError('Column title is required', 400)
    }

    const column = await columnRepo.findById(columnId)
    if (!column) {
      throw new AppError('Column not found', 404)
    }

    const hasAccess = await boardRepo.checkAccess(column.board_id, userId)
    if (!hasAccess) {
      throw new AppError('Forbidden: You do not have access to this board', 403)
    }

    const updated = await columnRepo.updateTitle(columnId, title)
    res.status(200).json({
      success: true,
      message: 'Column updated successfully',
      data: updated
    })
  } catch (error) {
    next(error)
  }
}

/**
 * DELETE /api/columns/:id
 * ลบ Column
 */
export const deleteColumn = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.userId
    const columnId = req.params.id

    const column = await columnRepo.findById(columnId)
    if (!column) {
      throw new AppError('Column not found', 404)
    }

    const hasAccess = await boardRepo.checkAccess(column.board_id, userId)
    if (!hasAccess) {
      throw new AppError('Forbidden: You do not have access to this board', 403)
    }

    await columnRepo.delete(columnId)
    res.status(200).json({
      success: true,
      message: 'Column deleted successfully'
    })
  } catch (error) {
    next(error)
  }
}

/**
 * PATCH /api/boards/:boardId/columns/reorder
 * จัดลำดับ Columns ในบอร์ดใหม่
 */
export const reorderColumns = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.userId
    const boardId = req.params.boardId
    const { orderedIds } = req.body

    if (!Array.isArray(orderedIds)) {
      throw new AppError('orderedIds must be an array of column IDs', 400)
    }

    const hasAccess = await boardRepo.checkAccess(boardId, userId)
    if (!hasAccess) {
      throw new AppError('Forbidden: You do not have access to this board', 403)
    }

    await columnRepo.reorder(boardId, orderedIds)
    res.status(200).json({
      success: true,
      message: 'Columns reordered successfully'
    })
  } catch (error) {
    next(error)
  }
}
