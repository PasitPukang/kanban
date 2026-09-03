import bcrypt from 'bcryptjs'
import { withTransaction, pool } from './pool'
import { UserRow, BoardRow, ColumnRow, TaskRow } from '../types/database'

async function runSeed() {
  console.log('🌱 [DB Seed] Starting database seeding with requested real accounts...')

  await withTransaction(async (client) => {
    // 1. Clean existing data
    await client.query('TRUNCATE TABLE users CASCADE')

    // 2. Hash default secure password (Salt 12)
    const salt = await bcrypt.genSalt(12)
    const defaultPassword = await bcrypt.hash('Password@1234', salt)

    // 3. Create Super Admin & User Accounts
    // Account 1: Super Admin
    const superAdminRes = await client.query<UserRow>(
      `INSERT INTO users (email, password, name, avatar_url, role)
       VALUES ($1, $2, $3, $4, 'SUPER_ADMIN')
       RETURNING *`,
      [
        'pasitpukang1234567@gmail.com',
        defaultPassword,
        'Super Admin Pasit',
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces'
      ]
    )
    const superAdmin = superAdminRes.rows[0]

    // Account 2: Pasit Pukang (Board Owner)
    const user1Res = await client.query<UserRow>(
      `INSERT INTO users (email, password, name, avatar_url, role)
       VALUES ($1, $2, $3, $4, 'USER')
       RETURNING *`,
      [
        'pasitpukang0@gmail.com',
        defaultPassword,
        'Pasit Pukang',
        'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&h=100&fit=crop&crop=faces'
      ]
    )
    const user1 = user1Res.rows[0]

    // Account 3: Best Pasit (Team Member)
    const user2Res = await client.query<UserRow>(
      `INSERT INTO users (email, password, name, avatar_url, role)
       VALUES ($1, $2, $3, $4, 'USER')
       RETURNING *`,
      [
        'bestpasit2547@gmail.com',
        defaultPassword,
        'Best Pasit',
        'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop&crop=faces'
      ]
    )
    const user2 = user2Res.rows[0]

    // Account 4: Bgee Developer (Team Member)
    const user3Res = await client.query<UserRow>(
      `INSERT INTO users (email, password, name, avatar_url, role)
       VALUES ($1, $2, $3, $4, 'USER')
       RETURNING *`,
      [
        'bgee7242@gmail.com',
        defaultPassword,
        'Bgee Developer',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces'
      ]
    )
    const user3 = user3Res.rows[0]

    console.log('  -> Created 4 Accounts:')
    console.log('     👑 Super Admin: pasitpukang1234567@gmail.com')
    console.log('     💻 User Owner:  pasitpukang0@gmail.com')
    console.log('     🎨 User Member: bestpasit2547@gmail.com')
    console.log('     ⚙️ User Member: bgee7242@gmail.com')

    // 4. Create Sample Kanban Board owned by pasitpukang0@gmail.com
    const boardRes = await client.query<BoardRow>(
      `INSERT INTO boards (title, description, owner_id)
       VALUES ($1, $2, $3)
       RETURNING *`,
      ['Clicknext Kanban Board', 'Sprint Backlog and Task Tracker for Clicknext Assessment', user1.id]
    )
    const board = boardRes.rows[0]

    // Add board members (Pasit, Best, Bgee)
    await client.query(
      `INSERT INTO board_members (board_id, user_id, role)
       VALUES ($1, $2, 'OWNER'), ($1, $3, 'MEMBER'), ($1, $4, 'MEMBER')`,
      [board.id, user1.id, user2.id, user3.id]
    )
    console.log('  -> Created Board and added 3 Active Members')

    // 5. Create Columns: TO DO, IN PROGRESS, DONE
    const col1Res = await client.query<ColumnRow>(
      `INSERT INTO columns (board_id, title, "order") VALUES ($1, $2, 0) RETURNING *`,
      [board.id, 'TO DO']
    )
    const col2Res = await client.query<ColumnRow>(
      `INSERT INTO columns (board_id, title, "order") VALUES ($1, $2, 1) RETURNING *`,
      [board.id, 'IN PROGRESS']
    )
    const col3Res = await client.query<ColumnRow>(
      `INSERT INTO columns (board_id, title, "order") VALUES ($1, $2, 2) RETURNING *`,
      [board.id, 'DONE']
    )

    const col1 = col1Res.rows[0]
    const col2 = col2Res.rows[0]
    const col3 = col3Res.rows[0]

    // 6. Create Tasks with Tags and Due Dates (Requirement 5, 5a, 5b)
    const task1Res = await client.query<TaskRow>(
      `INSERT INTO tasks (column_id, title, description, "order", tags, due_date)
       VALUES ($1, $2, $3, 0, $4, NOW() + INTERVAL '2 days')
       RETURNING *`,
      [col1.id, 'Design System & UI Components', 'สร้าง BaseButton, BaseModal, BaseInput และตั้งค่า Tailwind Theme', ['UI', 'Design']]
    )
    const task1 = task1Res.rows[0]

    const task2Res = await client.query<TaskRow>(
      `INSERT INTO tasks (column_id, title, description, "order", tags, due_date)
       VALUES ($1, $2, $3, 0, $4, NOW() + INTERVAL '1 days')
       RETURNING *`,
      [col2.id, 'Fluid Drag & Drop Task Movement', 'รองรับการใช้เมาส์ลากย้ายการ์ดข้าม Column และสลับตำแหน่ง (Bonus 5a)', ['Feature', 'Urgent']]
    )
    const task2 = task2Res.rows[0]

    const task3Res = await client.query<TaskRow>(
      `INSERT INTO tasks (column_id, title, description, "order", tags, due_date)
       VALUES ($1, $2, $3, 1, $4, NOW() + INTERVAL '2 days')
       RETURNING *`,
      [col2.id, 'In-app Notification Dropdown', 'แจ้งเตือนเมื่อมีการ Assign งานให้สมาชิกในบอร์ด (Bonus 6a)', ['Feature']]
    )
    const task3 = task3Res.rows[0]

    const task4Res = await client.query<TaskRow>(
      `INSERT INTO tasks (column_id, title, description, "order", tags, due_date)
       VALUES ($1, $2, $3, 2, $4, NOW() + INTERVAL '3 days')
       RETURNING *`,
      [col2.id, 'PostgreSQL Database & Types', 'สร้าง Schema ครบ 7 ตารางพร้อม Type-safe Query Pool', ['Backend', 'Postgres']]
    )
    const task4 = task4Res.rows[0]

    const task5Res = await client.query<TaskRow>(
      `INSERT INTO tasks (column_id, title, description, "order", tags, due_date)
       VALUES ($1, $2, $3, 0, $4, NOW() - INTERVAL '1 days')
       RETURNING *`,
      [col3.id, 'Project Initialization & Plan', 'วิเคราะห์เอกสาร Clicknext Requirement และออกแบบสถาปัตยกรรม', ['Setup']]
    )
    const task5 = task5Res.rows[0]

    // 7. Assign Members to Tasks (Requirement 6)
    await client.query(
      `INSERT INTO task_assignees (task_id, user_id)
       VALUES ($1, $2), ($3, $4), ($5, $6), ($7, $8), ($9, $10)`,
      [task1.id, user2.id, task2.id, user1.id, task3.id, user3.id, task4.id, user1.id, task5.id, superAdmin.id]
    )

    // 8. Notifications for Best & Bgee (Bonus 6a)
    await client.query(
      `INSERT INTO notifications (user_id, title, message, link)
       VALUES ($1, $2, $3, $4), ($5, $6, $7, $8)`,
      [
        user2.id,
        'มอบหมายงานใหม่',
        `คุณได้รับการมอบหมายงาน "${task1.title}" โดย ${user1.name}`,
        `/board/${board.id}`,
        user3.id,
        'มอบหมายงานใหม่',
        `คุณได้รับการมอบหมายงาน "${task3.title}" โดย ${user1.name}`,
        `/board/${board.id}`
      ]
    )

    console.log('  -> Created Initial Tasks, Assignees, and Notifications')
  })

  console.log('✅ [DB Seed] Database seeded successfully with Super Admin and Real Users!')
  await pool.end()
}

runSeed().catch((err) => {
  console.error('❌ [DB Seed] Failed:', err)
  process.exit(1)
})
