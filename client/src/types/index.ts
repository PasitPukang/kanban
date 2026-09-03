export interface User {
  id: string
  email: string
  name: string
  password?: string
  avatar_url?: string | null
  role?: 'SUPER_ADMIN' | 'USER'
  created_at?: string
}

export type BoardRole = 'OWNER' | 'MEMBER'

export interface BoardMember {
  id: string
  board_id: string
  user_id: string
  role: BoardRole
  joined_at: string
  user: User
}

export interface Task {
  id: string
  column_id: string
  title: string
  description?: string | null
  order: number
  tags: string[]
  due_date?: string | null
  created_at?: string
  updated_at?: string
  assignees: User[]
}

export interface Column {
  id: string
  board_id: string
  title: string
  order: number
  created_at?: string
  updated_at?: string
  tasks: Task[]
}

export interface Board {
  id: string
  title: string
  description?: string | null
  owner_id: string
  created_at: string
  updated_at: string
  owner?: User
  members?: BoardMember[]
  columns?: Column[]
}

export interface NotificationItem {
  id: string
  user_id: string
  title: string
  message: string
  is_read: boolean
  link?: string | null
  created_at: string
}

export type DataSourceMode = 'localStorage' | 'api'
