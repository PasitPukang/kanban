import { query, queryOne } from '../db/pool'
import { NotificationRow } from '../types/database'

export class NotificationRepository {
  /**
   * สร้าง Notification แจ้งเตือนผู้ใช้ (เช่น มีคนมอบหมายงานให้ หรือเชิญเข้าบอร์ด)
   */
  async create(data: {
    user_id: string
    title: string
    message: string
    link?: string | null
  }): Promise<NotificationRow> {
    const row = await queryOne<NotificationRow>(
      `INSERT INTO notifications (user_id, title, message, link)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [data.user_id, data.title.trim(), data.message.trim(), data.link || null]
    )
    return row!
  }

  /**
   * ดึงรายการ Notification ของผู้ใช้ เรียงจากล่าสุด
   */
  async findByUserId(userId: string, limit: number = 30): Promise<NotificationRow[]> {
    return query<NotificationRow>(
      `SELECT * FROM notifications
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2`,
      [userId, limit]
    )
  }

  /**
   * นับจำนวน Notification ที่ยังไม่ได้อ่าน (สำหรับ Badge สีแดงบน Navbar)
   */
  async countUnread(userId: string): Promise<number> {
    const res = await queryOne<{ count: string }>(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = $1 AND is_read = false',
      [userId]
    )
    return Number(res?.count || 0)
  }

  /**
   * ทำเครื่องหมายว่าอ่านแล้ว (เฉพาะของตนเอง)
   */
  async markAsRead(id: string, userId: string): Promise<NotificationRow | null> {
    return queryOne<NotificationRow>(
      `UPDATE notifications
       SET is_read = true
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [id, userId]
    )
  }

  /**
   * ทำเครื่องหมายอ่านแล้วทั้งหมด
   */
  async markAllAsRead(userId: string): Promise<void> {
    await query(
      'UPDATE notifications SET is_read = true WHERE user_id = $1 AND is_read = false',
      [userId]
    )
  }
}
