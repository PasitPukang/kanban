import { defineStore } from 'pinia'
import { ref } from 'vue'
import { Board, Column, Task, User } from '../types'
import { storageService } from '../services/storage.service'
import { apiClient } from '../api/client'
import { useAuthStore } from './auth'
import { useNotificationStore } from './notification'

export const useBoardStore = defineStore('board', () => {
  const authStore = useAuthStore()
  const notiStore = useNotificationStore()

  const boards = ref<Board[]>([])
  const currentBoard = ref<Board | null>(null)
  const isLoading = ref<boolean>(false)
  const error = ref<string | null>(null)

  // Fetch all user boards
  const fetchBoards = async () => {
    isLoading.value = true
    error.value = null
    try {
      if (authStore.dataMode === 'api' && authStore.token) {
        const res = await apiClient.get('/boards')
        if (res.data.success) {
          boards.value = res.data.data
        }
      } else {
        boards.value = storageService.getBoards()
      }
    } catch (err: any) {
      console.error('Fetch boards error:', err)
      boards.value = storageService.getBoards()
    } finally {
      isLoading.value = false
    }
  }

  // Fetch single board with full nested columns and tasks
  const fetchBoardById = async (boardId: string) => {
    isLoading.value = true
    error.value = null
    try {
      if (authStore.dataMode === 'api' && authStore.token) {
        const res = await apiClient.get(`/boards/${boardId}`)
        if (res.data.success) {
          currentBoard.value = res.data.data
        }
      } else {
        currentBoard.value = storageService.getBoardById(boardId)
      }
    } catch (err: any) {
      console.error('Fetch board detail error:', err)
      currentBoard.value = storageService.getBoardById(boardId)
    } finally {
      isLoading.value = false
    }
  }

  // Create Board
  const createBoard = async (title: string, description?: string): Promise<Board | null> => {
    isLoading.value = true
    try {
      if (authStore.dataMode === 'api' && authStore.token) {
        const res = await apiClient.post('/boards', { title, description })
        if (res.data.success) {
          await fetchBoards()
          return res.data.data
        }
      } else {
        if (!authStore.currentUser) return null
        const newBoard = storageService.createBoard(title, description || null, authStore.currentUser)
        await fetchBoards()
        return newBoard
      }
      return null
    } catch (err: any) {
      error.value = err.message
      return null
    } finally {
      isLoading.value = false
    }
  }

  // Update Board Title / Description
  const updateBoard = async (boardId: string, data: { title?: string; description?: string | null }) => {
    try {
      if (authStore.dataMode === 'api' && authStore.token) {
        await apiClient.patch(`/boards/${boardId}`, data)
      } else {
        storageService.updateBoard(boardId, data)
      }
      if (currentBoard.value && currentBoard.value.id === boardId) {
        if (data.title !== undefined) currentBoard.value.title = data.title
        if (data.description !== undefined) currentBoard.value.description = data.description
      }
      await fetchBoards()
    } catch (err) {
      console.error('Update board error:', err)
    }
  }

  // Delete Board
  const deleteBoard = async (boardId: string) => {
    try {
      if (authStore.dataMode === 'api' && authStore.token) {
        await apiClient.delete(`/boards/${boardId}`)
      } else {
        storageService.deleteBoard(boardId)
      }
      if (currentBoard.value?.id === boardId) {
        currentBoard.value = null
      }
      await fetchBoards()
    } catch (err) {
      console.error('Delete board error:', err)
    }
  }

  // Invite Member to Board
  const inviteMember = async (boardId: string, email: string): Promise<boolean> => {
    try {
      if (authStore.dataMode === 'api' && authStore.token) {
        const res = await apiClient.post(`/boards/${boardId}/invite`, { email })
        if (res.data.success) {
          await fetchBoardById(boardId)
          return true
        }
      } else {
        const targetUser = authStore.users.find((u) => u.email.toLowerCase() === email.toLowerCase())
        if (targetUser) {
          storageService.inviteMember(boardId, targetUser)
          notiStore.addNotification(
            targetUser.id,
            'Board Invitation',
            `${authStore.currentUser?.name || 'A team member'} has invited you to join "${currentBoard.value?.title || 'Board'}"`,
            `/board/${boardId}`
          )
          await fetchBoardById(boardId)
          return true
        }
      }
      return false
    } catch (err) {
      console.error('Invite member error:', err)
      return false
    }
  }

  // --- Column Management ---
  const createColumn = async (boardId: string, title: string) => {
    try {
      if (authStore.dataMode === 'api' && authStore.token) {
        await apiClient.post(`/boards/${boardId}/columns`, { title })
      } else {
        storageService.createColumn(boardId, title)
      }
      await fetchBoardById(boardId)
    } catch (err) {
      console.error('Create column error:', err)
    }
  }

  const updateColumn = async (columnId: string, title: string) => {
    try {
      if (authStore.dataMode === 'api' && authStore.token) {
        await apiClient.patch(`/columns/${columnId}`, { title })
      } else {
        storageService.updateColumn(columnId, title)
      }
      if (currentBoard.value?.columns) {
        const col = currentBoard.value.columns.find((c) => c.id === columnId)
        if (col) col.title = title
      }
    } catch (err) {
      console.error('Update column error:', err)
    }
  }

  const deleteColumn = async (columnId: string) => {
    try {
      if (authStore.dataMode === 'api' && authStore.token) {
        await apiClient.delete(`/columns/${columnId}`)
      } else {
        storageService.deleteColumn(columnId)
      }
      if (currentBoard.value?.columns) {
        currentBoard.value.columns = currentBoard.value.columns.filter((c) => c.id !== columnId)
      }
    } catch (err) {
      console.error('Delete column error:', err)
    }
  }

  // --- Task Management ---
  const createTask = async (
    columnId: string,
    data: {
      title: string
      description?: string | null
      tags?: string[]
      due_date?: string | null
      assignees?: User[]
    }
  ) => {
    try {
      if (authStore.dataMode === 'api' && authStore.token) {
        await apiClient.post(`/columns/${columnId}/tasks`, {
          title: data.title,
          description: data.description,
          tags: data.tags,
          due_date: data.due_date,
          assignee_ids: data.assignees?.map((a) => a.id)
        })
      } else {
        storageService.createTask(columnId, data)
        // Send notification to assignees
        if (data.assignees) {
          for (const a of data.assignees) {
            if (a.id !== authStore.currentUser?.id) {
              notiStore.addNotification(
                a.id,
                'Task Assigned to You',
                `${authStore.currentUser?.name || 'Someone'} assigned you to "${data.title}"`,
                `/board/${currentBoard.value?.id}`
              )
            }
          }
        }
      }
      if (currentBoard.value) {
        await fetchBoardById(currentBoard.value.id)
      }
    } catch (err) {
      console.error('Create task error:', err)
    }
  }

  const updateTask = async (
    taskId: string,
    data: {
      title?: string
      description?: string | null
      tags?: string[]
      due_date?: string | null
      assignees?: User[]
    }
  ) => {
    try {
      if (authStore.dataMode === 'api' && authStore.token) {
        await apiClient.patch(`/tasks/${taskId}`, data)
        if (data.assignees) {
          await apiClient.post(`/tasks/${taskId}/assign`, {
            userIds: data.assignees.map((u) => u.id)
          })
        }
      } else {
        storageService.updateTask(taskId, data)
      }
      if (currentBoard.value) {
        await fetchBoardById(currentBoard.value.id)
      }
    } catch (err) {
      console.error('Update task error:', err)
    }
  }

  // Optimistic Drag & Drop Move Task
  const moveTask = async (taskId: string, targetColumnId: string, newOrder: number) => {
    if (!currentBoard.value?.columns) return

    // 1. Optimistic Update on UI
    let movedTask: Task | null = null
    for (const col of currentBoard.value.columns) {
      const idx = col.tasks.findIndex((t) => t.id === taskId)
      if (idx !== -1) {
        movedTask = col.tasks.splice(idx, 1)[0]
        col.tasks.forEach((t, i) => (t.order = i))
        break
      }
    }

    if (movedTask) {
      const targetCol = currentBoard.value.columns.find((c) => c.id === targetColumnId)
      if (targetCol) {
        movedTask.column_id = targetColumnId
        targetCol.tasks.splice(newOrder, 0, movedTask)
        targetCol.tasks.forEach((t, i) => (t.order = i))
      }
    }

    // 2. Sync with Backend / Storage
    try {
      if (authStore.dataMode === 'api' && authStore.token) {
        await apiClient.patch(`/tasks/${taskId}/move`, {
          targetColumnId,
          newOrder
        })
      } else {
        storageService.moveTask(taskId, targetColumnId, newOrder)
      }
    } catch (err) {
      console.error('Move task sync error:', err)
      if (currentBoard.value) {
        await fetchBoardById(currentBoard.value.id) // Revert on failure
      }
    }
  }

  const deleteTask = async (taskId: string) => {
    try {
      if (authStore.dataMode === 'api' && authStore.token) {
        await apiClient.delete(`/tasks/${taskId}`)
      } else {
        storageService.deleteTask(taskId)
      }
      if (currentBoard.value) {
        await fetchBoardById(currentBoard.value.id)
      }
    } catch (err) {
      console.error('Delete task error:', err)
    }
  }

  return {
    boards,
    currentBoard,
    isLoading,
    error,
    fetchBoards,
    fetchBoardById,
    createBoard,
    updateBoard,
    deleteBoard,
    inviteMember,
    createColumn,
    updateColumn,
    deleteColumn,
    createTask,
    updateTask,
    moveTask,
    deleteTask
  }
})
