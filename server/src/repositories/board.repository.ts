import { query, queryOne, withTransaction } from '../db/pool'
import {
  BoardRow,
  BoardMemberRow,
  BoardDetails,
  BoardMemberWithUser,
  UserProfile,
  ColumnWithTasks,
  TaskWithDetails
} from '../types/database'

export class BoardRepository {
  /**
   * สร้าง Board ใหม่ พร้อมเพิ่ม Owner ใน board_members และสร้าง 3 Columns ตั้งต้นแบบ Atomic Transaction
   */
  async createWithDefaults(data: {
    title: string
    description?: string | null
    owner_id: string
  }): Promise<BoardRow> {
    return withTransaction(async (client) => {
      // 1. สร้าง Board
      const boardRes = await client.query<BoardRow>(
        `INSERT INTO boards (title, description, owner_id)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [data.title.trim(), data.description || null, data.owner_id]
      )
      const board = boardRes.rows[0]

      // 2. เพิ่มผู้สร้างลงใน board_members ในฐานะ OWNER
      await client.query(
        `INSERT INTO board_members (board_id, user_id, role)
         VALUES ($1, $2, 'OWNER')`,
        [board.id, data.owner_id]
      )

      // 3. สร้าง Default Columns 3 อัน (To Do, In Progress, Done)
      const defaultColumns = ['To Do', 'In Progress', 'Done']
      for (let i = 0; i < defaultColumns.length; i++) {
        await client.query(
          `INSERT INTO columns (board_id, title, "order")
           VALUES ($1, $2, $3)`,
          [board.id, defaultColumns[i], i]
        )
      }

      return board
    })
  }

  /**
   * ดึง Board ทั้งหมดที่ผู้ใช้เป็นเจ้าของ หรือเป็นสมาชิกอยู่
   */
  async findUserBoards(userId: string): Promise<BoardRow[]> {
    return query<BoardRow>(
      `SELECT DISTINCT b.*
       FROM boards b
       LEFT JOIN board_members bm ON b.id = bm.board_id
       WHERE b.owner_id = $1 OR bm.user_id = $1
       ORDER BY b.updated_at DESC`,
      [userId]
    )
  }

  /**
   * ค้นหาบอร์ดเดี่ยวด้วย ID
   */
  async findById(boardId: string): Promise<BoardRow | null> {
    return queryOne<BoardRow>('SELECT * FROM boards WHERE id = $1', [boardId])
  }

  /**
   * ตรวจสอบว่าผู้ใช้มีสิทธิ์เข้าถึงบอร์ดหรือไม่ (เป็นเจ้าของหรือสมาชิก)
   */
  async checkAccess(boardId: string, userId: string): Promise<boolean> {
    const res = await queryOne<{ count: string }>(
      `SELECT COUNT(*) as count
       FROM boards b
       LEFT JOIN board_members bm ON b.id = bm.board_id
       WHERE b.id = $1 AND (b.owner_id = $2 OR bm.user_id = $2)`,
      [boardId, userId]
    )
    return Number(res?.count || 0) > 0
  }

  /**
   * ตรวจสอบว่าผู้ใช้เป็น OWNER ของบอร์ดหรือไม่
   */
  async isOwner(boardId: string, userId: string): Promise<boolean> {
    const board = await queryOne<BoardRow>(
      'SELECT id FROM boards WHERE id = $1 AND owner_id = $2',
      [boardId, userId]
    )
    return !!board
  }

  /**
   * ดึงข้อมูลโครงสร้างบอร์ดแบบ Nested เต็มรูปแบบ (Board + Owner + Members + Columns + Tasks + Assignees)
   */
  async getBoardDetails(boardId: string): Promise<BoardDetails | null> {
    // 1. ข้อมูลบอร์ด
    const board = await this.findById(boardId)
    if (!board) return null

    // 2. ข้อมูลเจ้าของ
    const owner = await queryOne<UserProfile>(
      'SELECT id, email, name, avatar_url, created_at FROM users WHERE id = $1',
      [board.owner_id]
    )
    if (!owner) return null

    // 3. ข้อมูลสมาชิก
    const memberRows = await query<BoardMemberWithUser>(
      `SELECT bm.id, bm.board_id, bm.user_id, bm.role, bm.joined_at,
              json_build_object(
                'id', u.id,
                'email', u.email,
                'name', u.name,
                'avatar_url', u.avatar_url,
                'created_at', u.created_at
              ) as user
       FROM board_members bm
       JOIN users u ON bm.user_id = u.id
       WHERE bm.board_id = $1
       ORDER BY bm.joined_at ASC`,
      [boardId]
    )

    // 4. ข้อมูล Columns พร้อม Tasks และ Assignees
    const columnRows = await query<any>(
      `SELECT c.id, c.board_id, c.title, c."order", c.created_at, c.updated_at,
              COALESCE(
                json_agg(
                  json_build_object(
                    'id', t.id,
                    'column_id', t.column_id,
                    'title', t.title,
                    'description', t.description,
                    'order', t."order",
                    'tags', t.tags,
                    'due_date', t.due_date,
                    'created_at', t.created_at,
                    'updated_at', t.updated_at,
                    'assignees', COALESCE(
                      (
                        SELECT json_agg(
                          json_build_object(
                            'id', u.id,
                            'email', u.email,
                            'name', u.name,
                            'avatar_url', u.avatar_url,
                            'created_at', u.created_at
                          )
                        )
                        FROM task_assignees ta
                        JOIN users u ON ta.user_id = u.id
                        WHERE ta.task_id = t.id
                      ),
                      '[]'::json
                    )
                  ) ORDER BY t."order" ASC
                ) FILTER (WHERE t.id IS NOT NULL),
                '[]'::json
              ) as tasks
       FROM columns c
       LEFT JOIN tasks t ON c.id = t.column_id
       WHERE c.board_id = $1
       GROUP BY c.id
       ORDER BY c."order" ASC`,
      [boardId]
    )

    const columns: ColumnWithTasks[] = columnRows.map((col) => ({
      id: col.id,
      board_id: col.board_id,
      title: col.title,
      order: col.order,
      created_at: col.created_at,
      updated_at: col.updated_at,
      tasks: col.tasks as TaskWithDetails[]
    }))

    return {
      ...board,
      owner,
      members: memberRows,
      columns
    }
  }

  /**
   * อัปเดตข้อมูลบอร์ด (ชื่อ, คำอธิบาย)
   */
  async update(boardId: string, data: { title?: string; description?: string | null }): Promise<BoardRow | null> {
    const updates: string[] = []
    const values: any[] = []
    let counter = 1

    if (data.title !== undefined) {
      updates.push(`title = $${counter++}`)
      values.push(data.title.trim())
    }
    if (data.description !== undefined) {
      updates.push(`description = $${counter++}`)
      values.push(data.description)
    }

    if (updates.length === 0) return this.findById(boardId)

    updates.push(`updated_at = NOW()`)
    values.push(boardId)

    return queryOne<BoardRow>(
      `UPDATE boards
       SET ${updates.join(', ')}
       WHERE id = $${counter}
       RETURNING *`,
      values
    )
  }

  /**
   * ลบบอร์ด (จะ cascade ลบ columns, tasks, members ทั้งหมดโดยอัตโนมัติตาม DDL)
   */
  async delete(boardId: string): Promise<boolean> {
    const res = await query('DELETE FROM boards WHERE id = $1', [boardId])
    return (res as any).rowCount > 0 || true
  }

  /**
   * เพิ่มสมาชิกเข้าบอร์ด
   */
  async addMember(boardId: string, userId: string, role: 'OWNER' | 'MEMBER' = 'MEMBER'): Promise<BoardMemberRow> {
    const row = await queryOne<BoardMemberRow>(
      `INSERT INTO board_members (board_id, user_id, role)
       VALUES ($1, $2, $3)
       ON CONFLICT (board_id, user_id) DO UPDATE SET role = EXCLUDED.role
       RETURNING *`,
      [boardId, userId, role]
    )
    return row!
  }

  /**
   * นำสมาชิกออกจากบอร์ด
   */
  async removeMember(boardId: string, userId: string): Promise<boolean> {
    await query('DELETE FROM board_members WHERE board_id = $1 AND user_id = $2', [boardId, userId])
    return true
  }
}
