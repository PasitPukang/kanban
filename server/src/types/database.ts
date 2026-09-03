/**
 * Database Row Types for PostgreSQL Tables
 * All interfaces map 1:1 with PostgreSQL Schema columns
 */

export interface UserRow {
  id: string
  email: string
  password: string
  name: string
  avatar_url: string | null
  role: 'SUPER_ADMIN' | 'USER'
  created_at: Date
  updated_at: Date
}

export type BoardMemberRole = 'OWNER' | 'MEMBER'

export interface BoardRow {
  id: string
  title: string
  description: string | null
  owner_id: string
  created_at: Date
  updated_at: Date
}

export interface BoardMemberRow {
  id: string
  board_id: string
  user_id: string
  role: BoardMemberRole
  joined_at: Date
}

export interface ColumnRow {
  id: string
  board_id: string
  title: string
  order: number
  created_at: Date
  updated_at: Date
}

export interface TaskRow {
  id: string
  column_id: string
  title: string
  description: string | null
  order: number
  tags: string[]
  due_date: Date | null
  created_at: Date
  updated_at: Date
}

export interface TaskAssigneeRow {
  id: string
  task_id: string
  user_id: string
  assigned_at: Date
}

export interface NotificationRow {
  id: string
  user_id: string
  title: string
  message: string
  is_read: boolean
  link: string | null
  created_at: Date
}

// Composite & Joined Types for Application Logic
export interface UserProfile {
  id: string
  email: string
  name: string
  avatar_url: string | null
  role: 'SUPER_ADMIN' | 'USER'
  created_at: Date
}

export interface TaskWithDetails extends TaskRow {
  assignees: UserProfile[]
}

export interface ColumnWithTasks extends ColumnRow {
  tasks: TaskWithDetails[]
}

export interface BoardMemberWithUser extends BoardMemberRow {
  user: UserProfile
}

export interface BoardDetails extends BoardRow {
  owner: UserProfile
  members: BoardMemberWithUser[]
  columns: ColumnWithTasks[]
}
