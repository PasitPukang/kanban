import { Router } from 'express'
import {
  getMyBoards,
  createBoard,
  getBoardDetails,
  updateBoard,
  deleteBoard,
  inviteMember,
  removeMember
} from '../controllers/board.controller'
import {
  createColumn,
  reorderColumns
} from '../controllers/column.controller'
import { authenticateToken } from '../Middlewares/auth.middleware'

const router = Router()

// ทุก Route ใน Board ต้องผ่าน Authentication ก่อนเสมอ
router.use(authenticateToken)

// Board CRUD
router.get('/', getMyBoards)
router.post('/', createBoard)
router.get('/:id', getBoardDetails)
router.patch('/:id', updateBoard)
router.delete('/:id', deleteBoard)

// Board Members & Invite
router.post('/:id/invite', inviteMember)
router.delete('/:id/members/:userId', removeMember)

// Nested Columns inside Board
router.post('/:boardId/columns', createColumn)
router.patch('/:boardId/columns/reorder', reorderColumns)

export default router
