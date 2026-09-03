# Phase 1: Database Layer Implementation Plan

> **ขอบเขต:** ออกแบบและสร้างฐานข้อมูล PostgreSQL ด้วย Pure TypeScript (ไม่ใช้ Prisma)
> **เป้าหมาย:** สร้าง Schema, Connection Pool, Database Migration, Seed Data และ TypeScript Row Interfaces ให้พร้อมใช้งาน

---

## 1. ไฟล์ที่จะสร้างใน Phase 1

- `server/package.json` - กำหนด dependencies สำหรับ TypeScript และ PostgreSQL (`pg`)
- `server/tsconfig.json` - ตั้งค่า TypeScript Compiler สำหรับ Backend
- `server/src/types/database.ts` - นิยาม TypeScript Interfaces ทุกตารางใน DB
- `server/src/db/schema.sql` - SQL DDL สร้างตาราง: `users`, `boards`, `board_members`, `columns`, `tasks`, `task_assignees`, `notifications`
- `server/src/db/pool.ts` - Connection Pool Wrapper + Generic `query<T>()` + `withTransaction()`
- `server/src/db/migrate.ts` - สคริปต์รัน SQL DDL Migration
- `server/src/db/seed.ts` - สคริปต์เพิ่ม Mock Users, Mock Boards & Tasks ทดสอบ
- `server/.env` - ไฟล์ตั้งค่า Database URL (PostgreSQL)

---

## 2. ขั้นตอนการทำงาน (Step-by-Step)

### Step 1: Initialize Server Folder & Dependencies
ติดตั้ง `pg`, `dotenv`, `bcryptjs`, `jsonwebtoken` และ `@types/pg`, `typescript`, `ts-node-dev`

### Step 2: Write SQL Schema DDL (`schema.sql`)
สร้าง Tables ครบถ้วนพร้อม Foreign Keys, CASCADE deletes, และ Indexes ที่จำเป็น:
- `users`: id, email, password, name, avatar_url, timestamps
- `boards`: id, title, description, owner_id, timestamps
- `board_members`: id, board_id, user_id, role (OWNER/MEMBER), joined_at
- `columns`: id, board_id, title, order, timestamps
- `tasks`: id, column_id, title, description, order, tags, due_date, timestamps
- `task_assignees`: id, task_id, user_id, assigned_at
- `notifications`: id, user_id, title, message, is_read, link, created_at

### Step 3: Implement Type-Safe Pool & Migration Script
เขียน `pool.ts` และ `migrate.ts` ให้สามารถสั่ง `npm run db:migrate` เพื่อสร้างตารางได้ทันที

### Step 4: Implement Seed Data Script
เขียน `seed.ts` สร้างบัญชีทดสอบ:
1. `owner@clicknext.com` (Alex Johnson)
2. `member1@clicknext.com` (Sarah Connor)
3. `member2@clicknext.com` (David Kim)
พร้อมบอร์ดตัวอย่าง "Clicknext Project Kanban" ที่มี Columns (To Do, In Progress, Done) และ Tasks ตัวอย่าง

---

## 3. เกณฑ์การตรวจรับ Phase 1 (Checkpoint Verification)
- [ ] รัน `npm run db:migrate` ผ่านสำเร็จ ตารางถูกสร้างครบถ้วน
- [ ] รัน `npm run db:seed` ผ่านสำเร็จ มีข้อมูล Mock Data พร้อมใช้งาน
- [ ] `database.ts` มี Types ครบถ้วน 100% ไม่มี TypeScript Error
- [ ] สอบถามผู้ใช้เพื่อตรวจรับผลงานก่อนไป Phase 2
