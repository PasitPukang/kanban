import { User, Board, Column, Task, NotificationItem } from '../types'
import { MOCK_USERS, INITIAL_BOARDS, INITIAL_NOTIFICATIONS } from './mockData'
import { isSuperAdminEmail } from '../utils/auth'

const STORAGE_KEYS = {
  USERS: 'clicknext_kanban_users',
  BOARDS: 'clicknext_kanban_boards',
  NOTIFICATIONS: 'clicknext_kanban_notifications',
  CURRENT_USER: 'clicknext_kanban_current_user',
  DATA_MODE: 'clicknext_kanban_data_mode'
}

export class LocalStorageService {
  constructor() {
    this.initDefaults()
  }

  private isSuperAdminEmail(email?: string): boolean {
    return isSuperAdminEmail(email)
  }

  private initDefaults(): void {
    const rawUsers = localStorage.getItem(STORAGE_KEYS.USERS)
    if (!rawUsers || (!rawUsers.includes('pasitpukang1234567@gmail.com') && !rawUsers.includes('psitpukang1234567@gmail.com'))) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(MOCK_USERS))
      localStorage.setItem(STORAGE_KEYS.BOARDS, JSON.stringify(INITIAL_BOARDS))
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(INITIAL_NOTIFICATIONS))
    }
  }

  // --- Users ---
  getUsers(): User[] {
    const raw = localStorage.getItem(STORAGE_KEYS.USERS)
    const list: User[] = raw ? JSON.parse(raw) : MOCK_USERS
    let changed = false
    list.forEach((u) => {
      if (this.isSuperAdminEmail(u.email) && u.role !== 'SUPER_ADMIN') {
        u.role = 'SUPER_ADMIN'
        changed = true
      }
    })
    if (changed) {
      this.saveUsers(list)
    }
    return list
  }

  saveUsers(users: User[]): void {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users))
  }

  resetPassword(email: string, newPassword: string): boolean {
    const users = this.getUsers()
    const index = users.findIndex((u) => u.email.toLowerCase() === email.trim().toLowerCase())
    if (index === -1) return false

    users[index] = { ...users[index], password: newPassword }
    this.saveUsers(users)
    return true
  }

  getCurrentUser(): User | null {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER)
    if (!raw) return null
    const user: User = JSON.parse(raw)
    if (this.isSuperAdminEmail(user.email) && user.role !== 'SUPER_ADMIN') {
      user.role = 'SUPER_ADMIN'
      this.setCurrentUser(user)
    }
    return user
  }

  setCurrentUser(user: User | null): void {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user))
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER)
    }
  }

  // --- Super Admin User Management ---
  createAdminUser(userData: { name: string; email: string; role?: 'SUPER_ADMIN' | 'USER'; avatar_url?: string }): User {
    const users = this.getUsers()
    const newUser: User = {
      id: 'user_' + Date.now(),
      name: userData.name.trim(),
      email: userData.email.trim().toLowerCase(),
      avatar_url: userData.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(userData.name)}`,
      role: userData.role || 'USER',
      created_at: new Date().toISOString()
    }
    users.push(newUser)
    this.saveUsers(users)
    return newUser
  }

  updateAdminUser(userId: string, data: Partial<User>): User | null {
    const users = this.getUsers()
    const index = users.findIndex((u) => u.id === userId)
    if (index === -1) return null

    users[index] = { ...users[index], ...data }
    this.saveUsers(users)

    // If updating current user, update current user too
    const current = this.getCurrentUser()
    if (current?.id === userId) {
      this.setCurrentUser(users[index])
    }

    return users[index]
  }

  deleteAdminUser(userId: string): boolean {
    const users = this.getUsers()
    const target = users.find((u) => u.id === userId)
    if (this.isSuperAdminEmail(target?.email)) {
      return false // Cannot delete primary Super Admin
    }

    const filtered = users.filter((u) => u.id !== userId)
    this.saveUsers(filtered)
    return true
  }

  getAdminStats() {
    const users = this.getUsers()
    const boards = this.getBoards()
    const totalTasks = boards.reduce(
      (acc, b) => acc + (b.columns?.reduce((cAcc, c) => cAcc + (c.tasks?.length || 0), 0) || 0),
      0
    )
    const superAdmins = users.filter((u) => u.role === 'SUPER_ADMIN').length

    return {
      totalUsers: users.length,
      superAdmins,
      totalBoards: boards.length,
      totalTasks
    }
  }

  // --- Boards ---
  getBoards(): Board[] {//ดึงข้อมูลบอร์ด
    const raw = localStorage.getItem(STORAGE_KEYS.BOARDS)
    return raw ? JSON.parse(raw) : INITIAL_BOARDS
  }

  saveBoards(boards: Board[]): void {//บันทึกข้อมูลบอร์ด
    localStorage.setItem(STORAGE_KEYS.BOARDS, JSON.stringify(boards))
  }

  getBoardById(id: string): Board | null {  //ดึงข้อมูลบอร์ดตาม id
    const boards = this.getBoards()
    return boards.find((b) => b.id === id) || null
  }

  createBoard(title: string, description: string | null, owner: User): Board {//สร้างบอร์ดใหม่
    const boards = this.getBoards()
    const newBoardId = 'board_' + Date.now()

    const newBoard: Board = {//สร้างบอร์ดใหม่
      id: newBoardId,
      title: title.trim(),
      description: description || null,
      owner_id: owner.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      owner,
      members: [
        {
          id: 'bm_' + Date.now(), //
          board_id: newBoardId,
          user_id: owner.id,
          role: 'OWNER',
          joined_at: new Date().toISOString(),
          user: owner
        }
      ],
      columns: [
        { id: 'col_' + Date.now() + '_1', board_id: newBoardId, title: 'To Do', order: 0, tasks: [] },
        { id: 'col_' + Date.now() + '_2', board_id: newBoardId, title: 'In Progress', order: 1, tasks: [] },
        { id: 'col_' + Date.now() + '_3', board_id: newBoardId, title: 'Done', order: 2, tasks: [] }
      ]
    }

    boards.unshift(newBoard)
    this.saveBoards(boards)
    return newBoard
  }

  updateBoard(boardId: string, data: { title?: string; description?: string | null }): Board | null {
    const boards = this.getBoards()
    const idx = boards.findIndex((b) => b.id === boardId)
    if (idx === -1) return null

    if (data.title !== undefined) boards[idx].title = data.title.trim()
    if (data.description !== undefined) boards[idx].description = data.description
    boards[idx].updated_at = new Date().toISOString()

    this.saveBoards(boards)
    return boards[idx]
  }

  deleteBoard(boardId: string): boolean {
    const boards = this.getBoards().filter((b) => b.id !== boardId)
    this.saveBoards(boards)
    return true
  }

  inviteMember(boardId: string, user: User): Board | null {
    const boards = this.getBoards()
    const board = boards.find((b) => b.id === boardId)
    if (!board) return null

    if (!board.members) board.members = []
    const alreadyMember = board.members.some((m) => m.user_id === user.id)
    if (!alreadyMember) {
      board.members.push({
        id: 'bm_' + Date.now(),
        board_id: boardId,
        user_id: user.id,
        role: 'MEMBER',
        joined_at: new Date().toISOString(),
        user
      })
      this.saveBoards(boards)
    }
    return board
  }

  // --- Columns ---
  createColumn(boardId: string, title: string): Column | null {
    const boards = this.getBoards()
    const board = boards.find((b) => b.id === boardId)
    if (!board) return null

    if (!board.columns) board.columns = []
    const nextOrder = board.columns.length
    const newCol: Column = {
      id: 'col_' + Date.now(),
      board_id: boardId,
      title: title.trim(),
      order: nextOrder,
      tasks: []
    }

    board.columns.push(newCol)
    this.saveBoards(boards)
    return newCol
  }

  updateColumn(columnId: string, title: string): Column | null {
    const boards = this.getBoards()
    for (const board of boards) {
      if (board.columns) {
        const col = board.columns.find((c) => c.id === columnId)
        if (col) {
          col.title = title.trim()
          this.saveBoards(boards)
          return col
        }
      }
    }
    return null
  }

  deleteColumn(columnId: string): boolean {
    const boards = this.getBoards()
    for (const board of boards) {
      if (board.columns) {
        const idx = board.columns.findIndex((c) => c.id === columnId)
        if (idx !== -1) {
          board.columns.splice(idx, 1)
          // Re-order
          board.columns.forEach((c, i) => (c.order = i))
          this.saveBoards(boards)
          return true
        }
      }
    }
    return false
  }

  // --- Tasks ---
  createTask(
    columnId: string,
    data: {
      title: string
      description?: string | null
      tags?: string[]
      due_date?: string | null
      assignees?: User[]
    }
  ): Task | null {
    const boards = this.getBoards()
    for (const board of boards) {
      if (board.columns) {
        const col = board.columns.find((c) => c.id === columnId)
        if (col) {
          const newTask: Task = {
            id: 'task_' + Date.now(),
            column_id: columnId,
            title: data.title.trim(),
            description: data.description || null,
            order: col.tasks.length,
            tags: data.tags || [],
            due_date: data.due_date || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            assignees: data.assignees || []
          }
          col.tasks.push(newTask)
          this.saveBoards(boards)
          return newTask
        }
      }
    }
    return null
  }

  updateTask(
    taskId: string,
    data: {
      title?: string
      description?: string | null
      tags?: string[]
      due_date?: string | null
      assignees?: User[]
    }
  ): Task | null {
    const boards = this.getBoards()
    for (const board of boards) {
      if (board.columns) {
        for (const col of board.columns) {
          const task = col.tasks.find((t) => t.id === taskId)
          if (task) {
            if (data.title !== undefined) task.title = data.title.trim()
            if (data.description !== undefined) task.description = data.description
            if (data.tags !== undefined) task.tags = data.tags
            if (data.due_date !== undefined) task.due_date = data.due_date
            if (data.assignees !== undefined) task.assignees = data.assignees
            task.updated_at = new Date().toISOString()
            this.saveBoards(boards)
            return task
          }
        }
      }
    }
    return null
  }

  moveTask(taskId: string, targetColumnId: string, newOrder: number): boolean {
    const boards = this.getBoards()
    let foundTask: Task | null = null

    // 1. Remove task from old column
    for (const board of boards) {
      if (board.columns) {
        for (const col of board.columns) {
          const idx = col.tasks.findIndex((t) => t.id === taskId)
          if (idx !== -1) {
            foundTask = col.tasks.splice(idx, 1)[0]
            col.tasks.forEach((t, i) => (t.order = i))
            break
          }
        }
        if (foundTask) {
          // 2. Insert into target column
          const targetCol = board.columns.find((c) => c.id === targetColumnId)
          if (targetCol) {
            foundTask.column_id = targetColumnId
            targetCol.tasks.splice(newOrder, 0, foundTask)
            targetCol.tasks.forEach((t, i) => (t.order = i))
            this.saveBoards(boards)
            return true
          }
        }
      }
    }
    return false
  }

  deleteTask(taskId: string): boolean {
    const boards = this.getBoards()
    for (const board of boards) {
      if (board.columns) {
        for (const col of board.columns) {
          const idx = col.tasks.findIndex((t) => t.id === taskId)
          if (idx !== -1) {
            col.tasks.splice(idx, 1)
            col.tasks.forEach((t, i) => (t.order = i))
            this.saveBoards(boards)
            return true
          }
        }
      }
    }
    return false
  }

  // --- Notifications ---
  getNotifications(userId: string): NotificationItem[] {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)
    const list: NotificationItem[] = raw ? JSON.parse(raw) : INITIAL_NOTIFICATIONS
    return list.filter((n) => n.user_id === userId)
  }

  addNotification(userId: string, title: string, message: string, link?: string): NotificationItem {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)
    const list: NotificationItem[] = raw ? JSON.parse(raw) : []
    const newNoti: NotificationItem = {
      id: 'noti_' + Date.now(),
      user_id: userId,
      title,
      message,
      is_read: false,
      link: link || null,
      created_at: new Date().toISOString()
    }
    list.unshift(newNoti)
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(list))
    return newNoti
  }

  markNotificationAsRead(id: string): void {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)
    if (!raw) return
    const list: NotificationItem[] = JSON.parse(raw)
    const item = list.find((n) => n.id === id)
    if (item) {
      item.is_read = true
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(list))
    }
  }

  markAllNotificationsAsRead(userId: string): void {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)
    if (!raw) return
    const list: NotificationItem[] = JSON.parse(raw)
    list.forEach((n) => {
      if (n.user_id === userId) n.is_read = true
    })
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(list))
  }
}

export const storageService = new LocalStorageService()
