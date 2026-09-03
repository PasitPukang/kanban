import { query, queryOne } from '../db/pool'
import { UserRow, UserProfile } from '../types/database'

export class UserRepository {
  /**
   * ค้นหา User จาก Email (คืนค่า UserRow รวม hash password สำหรับตรวจสอบการล็อกอิน)
   */
  async findByEmail(email: string): Promise<UserRow | null> {
    return queryOne<UserRow>(
      'SELECT * FROM users WHERE LOWER(email) = LOWER($1)',
      [email.trim()]
    )
  }

  /**
   * ค้นหา User จาก ID (คืนค่า UserProfile ที่ตัด password ทิ้งเพื่อความปลอดภัย)
   */
  async findById(id: string): Promise<UserProfile | null> {
    return queryOne<UserProfile>(
      'SELECT id, email, name, avatar_url, role, created_at FROM users WHERE id = $1',
      [id]
    )
  }

  /**
   * สร้าง User ใหม่
   */
  async create(data: {
    email: string
    password: string
    name: string
    avatar_url?: string | null
    role?: 'SUPER_ADMIN' | 'USER'
  }): Promise<UserProfile> {
    const cleanEmail = data.email.trim().toLowerCase()
    const isSuper = cleanEmail === 'pasitpukang1234567@gmail.com' 
    const role = data.role || (isSuper ? 'SUPER_ADMIN' : 'USER')

    const row = await queryOne<UserProfile>(
      `INSERT INTO users (email, password, name, avatar_url, role)
       VALUES (LOWER($1), $2, $3, $4, $5)
       RETURNING id, email, name, avatar_url, role, created_at`,
      [data.email.trim(), data.password, data.name.trim(), data.avatar_url || null, role]
    )

    if (!row) {
      throw new Error('Failed to create user')
    }
    return row
  }

  /**
   * แก้ไขข้อมูล User (สำหรับ Super Admin หรือ Profile Update)
   */
  async update(id: string, data: {
    name?: string
    email?: string
    avatar_url?: string | null
    role?: 'SUPER_ADMIN' | 'USER'
    password?: string
  }): Promise<UserProfile | null> {
    const fields: string[] = []
    const params: any[] = []
    let idx = 1

    if (data.name !== undefined) {
      fields.push(`name = $${idx++}`)
      params.push(data.name.trim())
    }
    if (data.email !== undefined) {
      fields.push(`email = LOWER($${idx++})`)
      params.push(data.email.trim())
    }
    if (data.avatar_url !== undefined) {
      fields.push(`avatar_url = $${idx++}`)
      params.push(data.avatar_url)
    }
    if (data.role !== undefined) {
      fields.push(`role = $${idx++}`)
      params.push(data.role)
    }
    if (data.password !== undefined) {
      fields.push(`password = $${idx++}`)
      params.push(data.password)
    }

    if (fields.length === 0) return this.findById(id)

    fields.push(`updated_at = NOW()`)
    params.push(id)

    const sql = `
      UPDATE users
      SET ${fields.join(', ')}
      WHERE id = $${idx}
      RETURNING id, email, name, avatar_url, role, created_at
    `
    return queryOne<UserProfile>(sql, params)
  }

  /**
   * ลบ User ออกจากระบบ (Super Admin Only)
   */
  async delete(id: string): Promise<boolean> {
    const result = await query('DELETE FROM users WHERE id = $1', [id])
    return (result.length ?? 0) >= 0
  }

  /**
   * ค้นหาผู้ใช้ด้วย Email หรือ Name สำหรับฟีเจอร์ Invite สมาชิกเข้าบอร์ด
   */
  async searchUsers(keyword: string, excludeUserId?: string): Promise<UserProfile[]> {
    const params: any[] = [`%${keyword.toLowerCase()}%`]
    let sql = `
      SELECT id, email, name, avatar_url, role, created_at
      FROM users
      WHERE (LOWER(email) LIKE $1 OR LOWER(name) LIKE $1)
    `
    if (excludeUserId) {
      sql += ' AND id != $2'
      params.push(excludeUserId)
    }
    sql += ' LIMIT 10'

    return query<UserProfile>(sql, params)
  }

  /**
   * ดึงรายชื่อ Users ทั้งหมด (สำหรับ Super Admin Management & User Switcher)
   */
  async findAll(): Promise<UserProfile[]> {
    return query<UserProfile>(
      'SELECT id, email, name, avatar_url, role, created_at FROM users ORDER BY created_at ASC'
    )
  }

  /**
   * นับจำนวน User ทั้งหมด
   */
  async count(): Promise<number> {
    const res = await queryOne<{ count: string }>('SELECT COUNT(*) as count FROM users')
    return parseInt(res?.count || '0', 10)
  }
}
