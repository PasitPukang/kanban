import { query, queryOne, withTransaction } from '../db/pool'
import { ColumnRow } from '../types/database'

export class ColumnRepository {
  /**
   * สร้าง Column ใหม่ โดยหา max order ตัวล่าสุดเพื่อต่อท้ายอัตโนมัติ
   */
  async create(boardId: string, title: string): Promise<ColumnRow> {
    const maxOrderRes = await queryOne<{ max_order: number | null }>(
      'SELECT MAX("order") as max_order FROM columns WHERE board_id = $1',
      [boardId]
    )
    const nextOrder = (maxOrderRes?.max_order ?? -1) + 1

    const row = await queryOne<ColumnRow>(
      `INSERT INTO columns (board_id, title, "order")
       VALUES ($1, $2, $3)
       RETURNING *`,
      [boardId, title.trim(), nextOrder]
    )
    return row!
  }

  /**
   * ค้นหา Column จาก ID
   */
  async findById(columnId: string): Promise<ColumnRow | null> {
    return queryOne<ColumnRow>('SELECT * FROM columns WHERE id = $1', [columnId])
  }

  /**
   * ดึงทุก Column ใน Board เรียงตาม order
   */
  async findByBoardId(boardId: string): Promise<ColumnRow[]> {
    return query<ColumnRow>(
      'SELECT * FROM columns WHERE board_id = $1 ORDER BY "order" ASC',
      [boardId]
    )
  }

  /**
   * แก้ไขชื่อ Column
   */
  async updateTitle(columnId: string, title: string): Promise<ColumnRow | null> {
    return queryOne<ColumnRow>(
      `UPDATE columns
       SET title = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [title.trim(), columnId]
    )
  }

  /**
   * ลบ Column (Tasks ภายใต้ Column จะถูกลบตาม CASCADE)
   */
  async delete(columnId: string): Promise<boolean> {
    await query('DELETE FROM columns WHERE id = $1', [columnId])
    return true
  }

  /**
   * จัดลำดับ Columns ใหม่ในบอร์ด
   */
  async reorder(boardId: string, orderedIds: string[]): Promise<void> {
    await withTransaction(async (client) => {
      for (let i = 0; i < orderedIds.length; i++) {
        await client.query(
          `UPDATE columns SET "order" = $1, updated_at = NOW() WHERE id = $2 AND board_id = $3`,
          [i, orderedIds[i], boardId]
        )
      }
    })
  }
}
