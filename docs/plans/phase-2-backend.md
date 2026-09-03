# Phase 2: Backend Layer Implementation Plan

> **ขอบเขต:** สร้าง Web API Server ด้วย Express + Pure TypeScript (Type-Safe Repositories)
> **เป้าหมาย:** สร้าง REST Endpoints ครบถ้วนตาม Requirement ของ Clicknext พร้อม JWT Auth

---

## 1. ไฟล์ที่จะสร้างใน Phase 2

### A. Repositories (Data Access Layer - Parameterized SQL)
- `server/src/repositories/user.repository.ts` - จัดการ User, Login, Register, ค้นหาด้วย Email
- `server/src/repositories/board.repository.ts` - CRUD Board, Invite สมาชิก, ดึงข้อมูล Board ซ้อน Columns & Tasks
- `server/src/repositories/column.repository.ts` - CRUD Column, เรียงลำดับ Column
- `server/src/repositories/task.repository.ts` - CRUD Task, ย้ายตำแหน่ง (Drag & Drop Transaction), มอบหมายงาน
- `server/src/repositories/notification.repository.ts` - ดึง Notification, อัปเดตสถานะการอ่าน

### B. Middlewares & Controllers
- `server/src/middlewares/auth.middleware.ts` - ตรวจสอบ JWT Token และแนบ `req.user`
- `server/src/middlewares/error.middleware.ts` - จัดการ Error Responses สากล
- `server/src/controllers/auth.controller.ts` - Login / Register / Get Profile
- `server/src/controllers/board.controller.ts` - Board Endpoints & Invite
- `server/src/controllers/column.controller.ts` - Column Endpoints
- `server/src/controllers/task.controller.ts` - Task Endpoints & Assignee
- `server/src/controllers/notification.controller.ts` - Notification Endpoints

### C. Routes & App Entry
- `server/src/routes/index.ts` - รวมทุก Route เข้าด้วยกัน
- `server/src/index.ts` - Start Express Server (Port 5000)

---

## 2. API Specifications

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| POST | `/api/auth/register` | สมัครสมาชิกใหม่ | No |
| POST | `/api/auth/login` | เข้าสู่ระบบ (รับ JWT) | No |
| GET | `/api/auth/me` | ดึงข้อมูลผู้ใช้ปัจจุบัน | Yes |
| GET | `/api/boards` | ดึง Board ทั้งหมดที่ตนเองเกี่ยวข้อง | Yes |
| POST | `/api/boards` | สร้าง Board ใหม่ (+ Default Columns) | Yes |
| GET | `/api/boards/:id` | ดึงรายละเอียด Board (Nested) | Yes |
| PATCH | `/api/boards/:id` | แก้ไขชื่อ/รายละเอียด Board | Yes |
| DELETE | `/api/boards/:id` | ลบ Board (Owner Only) | Yes |
| POST | `/api/boards/:id/invite` | เชิญสมาชิกเข้า Board ด้วยอีเมล | Yes |
| POST | `/api/boards/:boardId/columns` | เพิ่ม Column ใหม่ | Yes |
| PATCH | `/api/columns/:id` | เปลี่ยนชื่อ Column | Yes |
| DELETE | `/api/columns/:id` | ลบ Column | Yes |
| POST | `/api/columns/:columnId/tasks` | สร้าง Task ใหม่ | Yes |
| PATCH | `/api/tasks/:id` | แก้ไข Task (Title, Desc, Tags, Due) | Yes |
| PATCH | `/api/tasks/:id/move` | ย้ายตำแหน่ง Task (ข้าม Column หรือสลับที่) | Yes |
| DELETE | `/api/tasks/:id` | ลบ Task | Yes |
| POST | `/api/tasks/:id/assign` | มอบหมายงานให้สมาชิก + สร้าง Notification | Yes |
| GET | `/api/notifications` | ดึงรายการแจ้งเตือน | Yes |
| PATCH | `/api/notifications/:id/read` | ทำเครื่องหมายว่าอ่านแล้ว | Yes |

---

## 3. เกณฑ์การตรวจรับ Phase 2 (Checkpoint Verification)
- [ ] รัน Express Server ผ่าน `npm run dev` ได้ปกติที่พอร์ต 5000
- [ ] ทดสอบยิง API Auth (Register/Login) ได้รับ Token ถูกต้อง
- [ ] ทดสอบ CRUD Board, Columns, Tasks ผ่านครบทุกกรณี
- [ ] สอบถามผู้ใช้เพื่อตรวจรับผลงานก่อนไป Phase 3
