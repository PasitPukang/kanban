import { Response, NextFunction } from 'express'
import { TaskRepository } from '../repositories/task.repository'
import { ColumnRepository } from '../repositories/column.repository'
import { BoardRepository } from '../repositories/board.repository'
import { NotificationRepository } from '../repositories/notification.repository'
import { AuthenticatedRequest } from '../Middlewares/auth.middleware'
import { AppError } from '../Middlewares/error.middleware'

const taskRepo = new TaskRepository()
const columnRepo = new ColumnRepository()
const boardRepo = new BoardRepository()
const notiRepo = new NotificationRepository()

/**
 * POST /api/columns/:columnId/tasks
 * สร้าง Task ใหม่ภายใต้ Column
 */
export const createTask = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.userId
    const columnId = req.params.columnId
    const { title, description, tags, due_date, assignee_ids } = req.body

    if (!title || !title.trim()) {
      throw new AppError('Task title is required', 400)
    }

    // 1. หา column เพื่อนำ board_id มาเช็คสิทธิ์
    const column = await columnRepo.findById(columnId)
    if (!column) {
      throw new AppError('Column not found', 404)
    }

    const hasAccess = await boardRepo.checkAccess(column.board_id, userId)
    if (!hasAccess) {
      throw new AppError('Forbidden: You do not have access to this board', 403)
    }

    // 2. สร้าง Task
    const task = await taskRepo.create({
      column_id: columnId,
      title,
      description,
      tags,
      due_date: due_date ? new Date(due_date) : null,
      assignee_ids
    })

    // 3. แจ้งเตือน Assignees ที่ถูกมอบหมายงาน (ยกเว้นตัวเอง)
    if (assignee_ids && Array.isArray(assignee_ids)) {
      const senderName = req.user!.name || 'A team member'
      for (const assigneeId of assignee_ids) {
        if (assigneeId !== userId) {
          await notiRepo.create({
            user_id: assigneeId,
            title: 'New Task Assigned',
            message: `${senderName} assigned you to task "${task.title}"`,
            link: `/boards/${column.board_id}`
          })
        }
      }
    }

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: task
    })
  } catch (error) {
    next(error)
  }
}

/**
 * GET /api/tasks/:id
 * ดึงข้อมูล Task เดี่ยวพร้อม Assignees
 */
export const getTaskById = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.userId
    const taskId = req.params.id

    const task = await taskRepo.findById(taskId)
    if (!task) {
      throw new AppError('Task not found', 404)
    }

    const boardId = await taskRepo.getBoardIdByTaskId(taskId)
    if (!boardId || !(await boardRepo.checkAccess(boardId, userId))) {
      throw new AppError('Forbidden: You do not have access to this task', 403)
    }

    res.status(200).json({ success: true, data: task })
  } catch (error) {
    next(error)
  }
}

/**
 * PATCH /api/tasks/:id
 * แก้ไขรายละเอียด Task (Title, Description, Tags, Due Date)
 */
export const updateTask = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.userId
    const taskId = req.params.id
    const { title, description, tags, due_date } = req.body

    const boardId = await taskRepo.getBoardIdByTaskId(taskId)
    if (!boardId || !(await boardRepo.checkAccess(boardId, userId))) {
      throw new AppError('Forbidden: You do not have access to edit this task', 403)
    }

    const updated = await taskRepo.update(taskId, {
      title,
      description,
      tags,
      due_date: due_date !== undefined ? (due_date ? new Date(due_date) : null) : undefined
    })

    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: updated
    })
  } catch (error) {
    next(error)
  }
}

/**
 * PATCH /api/tasks/:id/move
 * ย้ายตำแหน่ง Task (Drag & Drop ระหว่างคอลัมน์ หรือสลับตำแหน่ง)
 */
export const moveTask = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.userId
    const taskId = req.params.id
    const { targetColumnId, newOrder } = req.body

    if (!targetColumnId || typeof newOrder !== 'number') {
      throw new AppError('targetColumnId and numeric newOrder are required', 400)
    }

    // ตรวจสอบว่า target column อยู่ใน board เดียวกันและมีสิทธิ์เข้าถึง
    const targetColumn = await columnRepo.findById(targetColumnId)
    if (!targetColumn) {
      throw new AppError('Target column not found', 404)
    }

    const hasAccess = await boardRepo.checkAccess(targetColumn.board_id, userId)
    if (!hasAccess) {
      throw new AppError('Forbidden: You do not have access to this board', 403)
    }

    const movedTask = await taskRepo.moveTask(taskId, targetColumnId, newOrder)
    if (!movedTask) {
      throw new AppError('Task not found to move', 404)
    }

    res.status(200).json({
      success: true,
      message: 'Task moved successfully',
      data: movedTask
    })
  } catch (error) {
    next(error)
  }
}

/**
 * DELETE /api/tasks/:id
 * ลบ Task
 */
export const deleteTask = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.userId
    const taskId = req.params.id

    const boardId = await taskRepo.getBoardIdByTaskId(taskId)
    if (!boardId || !(await boardRepo.checkAccess(boardId, userId))) {
      throw new AppError('Forbidden: You do not have access to delete this task', 403)
    }

    await taskRepo.delete(taskId)
    res.status(200).json({
      success: true,
      message: 'Task deleted successfully'
    })
  } catch (error) {
    next(error)
  }
}

/**
 * POST /api/tasks/:id/assign
 * มอบหมายผู้รับผิดชอบงาน (Assignees) + ส่งแจ้งเตือนอัตโนมัติ
 */
export const assignTask = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const senderId = req.user!.userId
    const senderName = req.user!.name || 'A team member'
    const taskId = req.params.id
    const { userIds } = req.body

    if (!Array.isArray(userIds)) {
      throw new AppError('userIds must be an array of user IDs', 400)
    }

    const boardId = await taskRepo.getBoardIdByTaskId(taskId)
    if (!boardId || !(await boardRepo.checkAccess(boardId, senderId))) {
      throw new AppError('Forbidden: You do not have access to this task', 403)
    }

    const task = await taskRepo.findById(taskId)
    if (!task) {
      throw new AppError('Task not found', 404)
    }

    const updatedAssignees = await taskRepo.setAssignees(taskId, userIds)

    // ส่ง notification ให้คนที่ถูก assign ใหม่
    for (const assignedUserId of userIds) {
      if (assignedUserId !== senderId) {
        await notiRepo.create({
          user_id: assignedUserId,
          title: 'Task Assigned to You',
          message: `${senderName} assigned you to the task "${task.title}"`,
          link: `/boards/${boardId}`
        })
      }
    }

    res.status(200).json({
      success: true,
      message: 'Task assignees updated successfully',
      data: updatedAssignees
    })
  } catch (error) {
    next(error)
  }
}
