import { User, Board, NotificationItem } from '../types'

export const MOCK_USERS: User[] = [
  {
    id: 'user_super_admin',
    email: 'pasitpukang1234567@gmail.com',
    name: 'Super Admin Pasit',
    password: 'Password@1234',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces',
    role: 'SUPER_ADMIN',
    created_at: new Date().toISOString()
  },
  {
    id: 'user_pasit',
    email: 'pasitpukang0@gmail.com',
    name: 'Pasit Pukang',
    password: 'Password@1234',
    avatar_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&h=100&fit=crop&crop=faces',
    role: 'USER',
    created_at: new Date().toISOString()
  },
  {
    id: 'user_best',
    email: 'bestpasit2547@gmail.com',
    name: 'Best Pasit',
    password: 'Password@1234',
    avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop&crop=faces',
    role: 'USER',
    created_at: new Date().toISOString()
  },
  {
    id: 'user_bgee',
    email: 'bgee7242@gmail.com',
    name: 'Bgee Developer',
    password: 'Password@1234',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces',
    role: 'USER',
    created_at: new Date().toISOString()
  }
]

export const MOCK_BOARDS: Board[] = [
  {
    id: 'board_clicknext_demo',
    title: 'Clicknext Kanban Board',
    description: 'Sprint Backlog and Task Tracker for Clicknext Assessment',
    owner_id: 'user_pasit',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    owner: MOCK_USERS[1],
    members: [
      {
        id: 'member_1',
        board_id: 'board_clicknext_demo',
        user_id: 'user_pasit',
        role: 'OWNER',
        joined_at: new Date().toISOString(),
        user: MOCK_USERS[1]
      },
      {
        id: 'member_2',
        board_id: 'board_clicknext_demo',
        user_id: 'user_best',
        role: 'MEMBER',
        joined_at: new Date().toISOString(),
        user: MOCK_USERS[2]
      },
      {
        id: 'member_3',
        board_id: 'board_clicknext_demo',
        user_id: 'user_bgee',
        role: 'MEMBER',
        joined_at: new Date().toISOString(),
        user: MOCK_USERS[3]
      },
      {
        id: 'member_4',
        board_id: 'board_clicknext_demo',
        user_id: 'user_super_admin',
        role: 'MEMBER',
        joined_at: new Date().toISOString(),
        user: MOCK_USERS[0]
      }
    ],
    columns: [
      {
        id: 'col_todo',
        board_id: 'board_clicknext_demo',
        title: 'TO DO',
        order: 0,
        tasks: [
          {
            id: 'task_1',
            column_id: 'col_todo',
            title: 'Design System & UI Components',
            description: 'สร้าง BaseButton, BaseModal, BaseInput และตั้งค่า Tailwind Theme',
            order: 0,
            tags: ['UI', 'Design'],
            due_date: '2026-09-04',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            assignees: [MOCK_USERS[2], MOCK_USERS[1]]
          },
          {
            id: 'task_2',
            column_id: 'col_todo',
            title: 'Setup Docker Compose for Evaluation',
            description: 'เตรียม Dockerfile สำหรับ 1-Click Run ส่งงาน Clicknext',
            order: 1,
            tags: ['DevOps', 'Docker'],
            due_date: '2026-09-05',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            assignees: [MOCK_USERS[3]]
          }
        ]
      },
      {
        id: 'col_in_progress',
        board_id: 'board_clicknext_demo',
        title: 'IN PROGRESS',
        order: 1,
        tasks: [
          {
            id: 'task_3',
            column_id: 'col_in_progress',
            title: 'Fluid Drag & Drop Task Movement',
            description: 'รองรับการใช้เมาส์ลากย้ายการ์ดข้าม Column และสลับตำแหน่ง (Bonus 5a)',
            order: 0,
            tags: ['Feature', 'Urgent'],
            due_date: '2026-09-04',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            assignees: [MOCK_USERS[1], MOCK_USERS[2]]
          },
          {
            id: 'task_4',
            column_id: 'col_in_progress',
            title: 'In-app Notification Dropdown',
            description: 'แจ้งเตือนเมื่อมีการ Assign งานให้สมาชิกในบอร์ด (Bonus 6a)',
            order: 1,
            tags: ['Feature'],
            due_date: '2026-09-04',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            assignees: [MOCK_USERS[0]]
          },
          {
            id: 'task_5',
            column_id: 'col_in_progress',
            title: 'PostgreSQL Database & Types',
            description: 'สร้าง Schema ครบ 7 ตารางพร้อม Type-safe Query Pool',
            order: 2,
            tags: ['Backend', 'Postgres'],
            due_date: '2026-09-03',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            assignees: [MOCK_USERS[3]]
          }
        ]
      },
      {
        id: 'col_done',
        board_id: 'board_clicknext_demo',
        title: 'DONE',
        order: 2,
        tasks: [
          {
            id: 'task_6',
            column_id: 'col_done',
            title: 'Project Initialization & Planning',
            description: 'วิเคราะห์เอกสาร Clicknext Requirement และวางโร้ดแมป 5 เฟส',
            order: 0,
            tags: ['Planning'],
            due_date: '2026-09-02',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            assignees: [MOCK_USERS[0], MOCK_USERS[1]]
          }
        ]
      }
    ]
  }
]

export const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif_1',
    user_id: 'user_super_admin',
    title: 'Super Admin Access Granted',
    message: 'ยินดีต้อนรับสู่ระบบ Super Admin Control Center สิทธิ์เข้าถึงและจัดการ User ทั้งหมดในระบบ',
    is_read: false,
    link: '/admin/users',
    created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString()
  },
  {
    id: 'notif_2',
    user_id: 'user_best',
    title: 'มอบหมายงานใหม่',
    message: 'คุณได้รับการมอบหมายงาน "Design System & UI Components" โดย Pasit Pukang',
    is_read: false,
    link: '/board/board_clicknext_demo',
    created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString()
  },
  {
    id: 'notif_3',
    user_id: 'user_bgee',
    title: 'มอบหมายงานใหม่',
    message: 'คุณได้รับการมอบหมายงาน "Setup Docker Compose for Evaluation" โดย Pasit Pukang',
    is_read: false,
    link: '/board/board_clicknext_demo',
    created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString()
  }
]

export const INITIAL_BOARDS = MOCK_BOARDS
export const INITIAL_NOTIFICATIONS = MOCK_NOTIFICATIONS

