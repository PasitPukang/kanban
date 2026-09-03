import { query, queryOne, withTransaction } from '../db/pool'
import { TaskRow, TaskWithDetails, UserProfile } from '../types/database'

export class TaskRepository {
  /**
   * สร้าง Task ใหม่ พร้อมกำหนด order ต่อท้าย column และเพิ่ม assignees (ถ้ามี)
   */
  async create(data: {
    column_id: string
    title: string
    description?: string | null
    tags?: string[]
    due_date?: Date | null
    assignee_ids?: string[]
  }): Promise<TaskWithDetails> {
    return withTransaction(async (client) => {
      // 1. หา order ลำดับถัดไปใน column
      const maxOrderRes = await client.query<{ max_order: number | null }>(
        'SELECT MAX("order") as max_order FROM tasks WHERE column_id = $1',
        [data.column_id]
      )
      const nextOrder = (maxOrderRes.rows[0]?.max_order ?? -1) + 1

      // 2. สร้าง Task
      const taskRes = await client.query<TaskRow>(
        `INSERT INTO tasks (column_id, title, description, "order", tags, due_date)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [
          data.column_id,
          data.title.trim(),
          data.description || null,
          nextOrder,
          data.tags || [],
          data.due_date || null
        ]
      )
      const task = taskRes.rows[0]

      // 3. เพิ่ม Assignees (ถ้ามี)
      const assignees: UserProfile[] = []
      if (data.assignee_ids && data.assignee_ids.length > 0) {
        for (const userId of data.assignee_ids) {
          await client.query(
            `INSERT INTO task_assignees (task_id, user_id)
             VALUES ($1, $2)
             ON CONFLICT (task_id, user_id) DO NOTHING`,
            [task.id, userId]
          )
          const userRes = await client.query<UserProfile>(
            'SELECT id, email, name, avatar_url, created_at FROM users WHERE id = $1',
            [userId]
          )
          if (userRes.rows[0]) {
            assignees.push(userRes.rows[0])
          }
        }
      }

      return {
        ...task,
        assignees
      }
    })
  }

  /**
   * ดึงข้อมูล Task พร้อมรายละเอียดผู้รับมอบหมาย (Assignees)
   */
  async findById(taskId: string): Promise<TaskWithDetails | null> {
    const task = await queryOne<TaskRow>('SELECT * FROM tasks WHERE id = $1', [taskId])
    if (!task) return null

    const assignees = await query<UserProfile>(
      `SELECT u.id, u.email, u.name, u.avatar_url, u.created_at
       FROM task_assignees ta
       JOIN users u ON ta.user_id = u.id
       WHERE ta.task_id = $1
       ORDER BY u.name ASC`,
      [taskId]
    )

    return {
      ...task,
      assignees
    }
  }

  /**
   * หา Board ID ของ Task นั้นๆ เพื่อตรวจสอบสิทธิ์การเข้าถึง
   */
  async getBoardIdByTaskId(taskId: string): Promise<string | null> {
    const res = await queryOne<{ board_id: string }>(
      `SELECT c.board_id
       FROM tasks t
       JOIN columns c ON t.column_id = c.id
       WHERE t.id = $1`,
      [taskId]
    )
    return res?.board_id || null
  }

  /**
   * อัปเดตข้อมูล Task (Title, Description, Tags, Due Date)
   */
  async update(
    taskId: string,
    data: {
      title?: string
      description?: string | null
      tags?: string[]
      due_date?: Date | null
    }
  ): Promise<TaskWithDetails | null> {
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
    if (data.tags !== undefined) {
      updates.push(`tags = $${counter++}`)
      values.push(data.tags)
    }
    if (data.due_date !== undefined) {
      updates.push(`due_date = $${counter++}`)
      values.push(data.due_date)
    }

    if (updates.length > 0) {
      updates.push(`updated_at = NOW()`)
      values.push(taskId)

      await query(
        `UPDATE tasks
         SET ${updates.join(', ')}
         WHERE id = $${counter}`,
        values
      )
    }

    return this.findById(taskId)
  }

  /**
   * ย้าย Task (Move / Drag & Drop) รองรับทั้ง:
   * 1. ย้ายสลับลำดับภายใน Column เดียวกัน
   * 2. ย้ายข้ามไปยัง Column อื่น
   * ทำงานแบบ Transaction เพื่อจัดเรียง "order" ของการ์ดที่ได้รับผลกระทบอย่างแม่นยำ
   */
  async moveTask(
    taskId: string,
    targetColumnId: string,
    newOrder: number
  ): Promise<TaskWithDetails | null> {
    return withTransaction(async (client) => {
      // 1. ดึงข้อมูล Task ปัจจุบัน
      const currentTaskRes = await client.query<TaskRow>(
        'SELECT * FROM tasks WHERE id = $1',
        [taskId]
      )
      const currentTask = currentTaskRes.rows[0]
      if (!currentTask) return null

      const oldColumnId = currentTask.column_id
      const oldOrder = currentTask.order

      // กรณีที่ 1: ย้ายภายในคอลัมน์เดียวกัน
      if (oldColumnId === targetColumnId) {
        if (oldOrder < newOrder) {
          // ขยับการ์ดระหว่าง oldOrder กับ newOrder ขึ้นข้างบน (-1)
          await client.query(
            `UPDATE tasks
             SET "order" = "order" - 1
             WHERE column_id = $1 AND "order" > $2 AND "order" <= $3`,
            [targetColumnId, oldOrder, newOrder]
          )
        } else if (oldOrder > newOrder) {
          // ขยับการ์ดระหว่าง newOrder กับ oldOrder ลงข้างล่าง (+1)
          await client.query(
            `UPDATE tasks
             SET "order" = "order" + 1
             WHERE column_id = $1 AND "order" >= $2 AND "order" < $3`,
            [targetColumnId, newOrder, oldOrder]
          )
        }
      } else {
        // กรณีที่ 2: ย้ายข้ามคอลัมน์
        // 2.1 ลดช่องว่างในคอลัมน์เดิม
        await client.query(
          `UPDATE tasks
           SET "order" = "order" - 1
           WHERE column_id = $1 AND "order" > $2`,
          [oldColumnId, oldOrder]
        )

        // 2.2 ขยายช่องว่างในคอลัมน์ใหม่ เพื่อแทรกการ์ดลงใน newOrder
        await client.query(
          `UPDATE tasks
           SET "order" = "order" + 1
           WHERE column_id = $1 AND "order" >= $2`,
          [targetColumnId, newOrder]
        )
      }

      // 3. วาง Task ลงใน Column และตำแหน่งใหม่
      await client.query(
        `UPDATE tasks
         SET column_id = $1, "order" = $2, updated_at = NOW()
         WHERE id = $3`,
        [targetColumnId, newOrder, taskId]
      )

      // 4. ดึงข้อมูลกลับมา
      const assigneesRes = await client.query<UserProfile>(
        `SELECT u.id, u.email, u.name, u.avatar_url, u.created_at
         FROM task_assignees ta
         JOIN users u ON ta.user_id = u.id
         WHERE ta.task_id = $1`,
        [taskId]
      )

      const updatedTaskRes = await client.query<TaskRow>(
        'SELECT * FROM tasks WHERE id = $1',
        [taskId]
      )

      return {
        ...updatedTaskRes.rows[0],
        assignees: assigneesRes.rows
      }
    })
  }

  /**
   * ลบ Task
   */
  async delete(taskId: string): Promise<boolean> {
    await withTransaction(async (client) => {
      const taskRes = await client.query<TaskRow>(
        'SELECT column_id, "order" FROM tasks WHERE id = $1',
        [taskId]
      )
      const task = taskRes.rows[0]
      if (task) {
        await client.query('DELETE FROM tasks WHERE id = $1', [taskId])
        // ขยับ order ของการ์ดที่เหลือใน column ให้ชิดกัน
        await client.query(
          `UPDATE tasks
           SET "order" = "order" - 1
           WHERE column_id = $1 AND "order" > $2`,
          [task.column_id, task.order]
        )
      }
    })
    return true
  }

  /**
   * มอบหมายงาน (Assign) หรือเปลี่ยนรายชื่อผู้รับผิดชอบงาน
   */
  async setAssignees(taskId: string, userIds: string[]): Promise<UserProfile[]> {
    return withTransaction(async (client) => {
      // เคลียร์ assignees เดิม
      await client.query('DELETE FROM task_assignees WHERE task_id = $1', [taskId])

      // ใส่ assignees ใหม่
      for (const userId of userIds) {
        await client.query(
          `INSERT INTO task_assignees (task_id, user_id)
           VALUES ($1, $2)
           ON CONFLICT DO NOTHING`,
          [taskId, userId]
        )
      }

      // ดึงรายชื่อผู้รับมอบหมายล่าสุด
      const res = await client.query<UserProfile>(
        `SELECT u.id, u.email, u.name, u.avatar_url, u.created_at
         FROM task_assignees ta
         JOIN users u ON ta.user_id = u.id
         WHERE ta.task_id = $1
         ORDER BY u.name ASC`,
        [taskId]
      )
      return res.rows
    })
  }
}
