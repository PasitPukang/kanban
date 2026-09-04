# บันทึกประวัติการพูดคุยและบริบทโปรเจกต์ทั้งหมด (Clicknext Kanban / Homework Hub)
> **สำหรับส่งต่อให้ AI Agent ตัวถัดไป (Comprehensive Context & Handoff Document)**  
> **วันที่บันทึก:** 4 กันยายน 2026  
> **Repository:** `d:\1tastClicknext` (Corpus: `PasitPukang/kanban`)  
> **สถานะปัจจุบัน:** ผ่าน Phase 1, Phase 2, Phase 3, Quality Audit, Phase 4A (Security Hardening) และ Phase 4B (Performance Optimization) เรียบร้อยแล้ว (Build ผ่าน 100%, GitNexus Zero Broken Edges)

---

## 📌 สรุปภาพรวมโปรเจกต์ (Project Executive Summary)

โปรเจกต์นี้เริ่มต้นจากโจทย์การทดสอบ **Frontend Developer ของบริษัท Clicknext Co., Ltd.** (ตามเอกสาร [`Test Frontend Developer.pdf`](file:///d:/1tastClicknext/Test%20Frontend%20Developer.pdf)) โดยผู้ใช้งานได้สั่งการให้พัฒนาเป็นระบบ Full-Stack Web Application ที่สมบูรณ์แบบ มีทั้งหน้าบ้าน (Frontend), หลังบ้าน (Backend), ฐานข้อมูล (Database), และระบบความปลอดภัยระดับสูง พร้อมรองรับการทำงานแบบ **Dual-Mode** (LocalStorage โหมดออฟไลน์ + PostgreSQL ผ่าน REST API)

ต่อมา ผู้ใช้งานได้สั่งการให้รีดีไซน์ UI/UX ให้เข้ากับบริบท **"Clicknext Homework Hub: สมุดการบ้านและงานที่ต้องส่ง"** เพื่อให้นักเรียน/ผู้ใช้งานสามารถติดตามวิชาเรียน การบ้าน และงานกลุ่มได้อย่างมีประสิทธิภาพ และผ่านกระบวนการ **Production-Grade Refactoring** ภายใต้การควบคุมของเครื่องมือวิเคราะห์โค้ด **GitNexus** อย่างเข้มงวด

---

## 🎯 กฎเหล็กและข้อกำหนดสำคัญ (User Golden Rules & Constraints)

ผู้ใช้งานได้กำหนดกฎเกณฑ์ที่เข้มงวดมาก (Strict Constraints) สำหรับการพัฒนาและ Refactor ซึ่ง Agent ทุกตัวที่จะมาทำต่อ **ต้องปฏิบัติตามอย่างเคร่งครัด ห้ามฝ่าฝืนโดยเด็ดขาด**:

1. **ห้ามแก้ไข Business Logic** ของระบบเดิม
2. **ห้ามเปลี่ยน API Contract** (ห้ามเปลี่ยน URL, HTTP Methods, Request Body หรือ Response Format ใด ๆ)
3. **ห้ามเปลี่ยน Database Schema** (ห้ามแก้ Columns, Tables, หรือ Foreign Keys)
4. **ห้ามเปลี่ยนพฤติกรรมของ Dual-Mode** (ระบบต้องสามารถทำงานได้ทั้งบน LocalStorage และ API เสมอ)
5. **ห้ามเปลี่ยนระบบ Authentication / Authorization** (Role มีเพียง `SUPER_ADMIN` และ `USER` เท่านั้น)
6. **ห้ามเพิ่มหรือ Hardcode Credentials, Passwords, Emails หรือ Secrets ใด ๆ ลงใน Source Code**
7. **ห้ามลบโค้ดที่ยังมีการใช้งานอยู่** โดยไม่ได้ตรวจสอบ GitNexus Dependency ก่อน
8. **ต้องรัน GitNexus Impact Analysis ก่อนแก้โค้ดทุกครั้ง** (`node .gitnexus/run.cjs impact <symbol> --direction upstream --repo .`) หากพบความเสี่ยงระดับ HIGH หรือ CRITICAL ต้องแจ้งผู้ใช้ก่อน
9. **ห้ามมีปุ่มจำลอง Quick Login หรือบัญชีทดสอบในหน้า UI** ให้ผู้ใช้กรอกสมัครสมาชิกและล็อกอินด้วยตนเองเท่านั้น
10. **Super Admin หลักของระบบคือ:** `pasitpukang1234567@gmail.com` (และ alias: `psitpukang1234567@gmail.com`, `apsitpukang1234567@gmail.com`)

---

## 🛠️ รายละเอียดสแตกเทคโนโลยี (Tech Stack Architecture)

### 1. Frontend Client (`client/`)
- **Framework:** Vue 3 (Composition API, `<script setup>`, TypeScript)
- **Bundler / Tooling:** Vite, `vue-tsc`
- **State Management:** Pinia (`stores/auth.ts`, `stores/board.ts`, `stores/notification.ts`)
- **Routing:** Vue Router 4 (พร้อม Navigation Guards สำหรับตรวจสอบสิทธิ์ Super Admin และ Login)
- **Styling:** Tailwind CSS + Vanilla CSS (Neo-Bento warmth palette, Floating Pill Dock)
- **Icons:** Lucide Vue Next
- **Drag & Drop:** `@vueuse/integrations/useSortable` (Sortable.js)
- **Storage Layer:** Dual-mode architecture ใน `services/api.ts` และ `services/storage.ts`

### 2. Backend Server (`server/`)
- **Runtime / Framework:** Node.js, Express, TypeScript (`tsc`)
- **Database:** PostgreSQL (เข้าถึงผ่านไลบรารี `pg` พร้อม Transaction Wrapper `withTransaction`)
- **Security:**
  - รหัสผ่านเข้ารหัสด้วย `bcryptjs`
  - ตรวจสอบสิทธิ์ด้วย JWT (`jsonwebtoken`) กำหนดอายุ 7 วัน
  - Strict Fail-Fast JWT Configuration ใน [`server/src/config/jwt.ts`](file:///d:/1tastClicknext/server/src/config/jwt.ts)
  - CORS, Rate Limiting
- **Architecture Pattern:** Controller - Repository - Database Driver Layered Pattern

### 3. Code Intelligence & Analysis
- **GitNexus:** ดัชนีกราฟความสัมพันธ์ของโค้ด (1,089 Nodes, 2,375 Edges, 51 Clusters, 83 Flows) มีเอกสารวิเคราะห์โครงสร้างโดยละเอียดที่ [`docs/GITNEXUS_ARCHITECTURE.md`](file:///d:/1tastClicknext/docs/GITNEXUS_ARCHITECTURE.md)

---

## 📜 ลำดับไทม์ไลน์การพูดคุยและงานที่ทำทั้งหมด (Detailed Chat Timeline & Milestones)

### ลำดับที่ 1: วิเคราะห์โจทย์และเริ่มงาน Frontend (Steps 1 – 260)
- **User Request:** นำเข้าไฟล์ `Test Frontend Developer.pdf` สอบถามบทบาทของ Front End, การใช้งาน Pinia และเหตุผลที่ใช้ Vite ร่วมกับ Vue
- **สิ่งที่ทำ:** 
  - สรุป Requirement: Kanban Board 3 คอลัมน์ (To Do, Doing, Done), Task Card ลากวางได้, เพิ่ม/แก้ไข/ลบ Task และ Board, LocalStorage fallback
  - วางโครงสร้างโปรเจกต์ Client ด้วย Vue 3 + TypeScript + Vite + Tailwind CSS

### ลำดับที่ 2: พัฒนาเป็นระบบ Full-Stack พร้อม Authentication (Steps 260 – 630)
- **User Request:** 
  - `/senior-fullstack` พัฒนาเป็นเว็บที่ใช้งานจริง มีระบบ Login / Register และความปลอดภัยขั้นสูง
  - ไม่เอาปุ่ม Quick Login หรือบัญชีทดสอบในหน้าจอ ต้องการให้ลองสมัครและล็อกอินเอง
  - สิทธิ์ระบบ: "admin ไม่ต้องมี มีแค่ superadmin พอ"
  - มีปัญหาการดูฐานข้อมูล -> แนะนำการใช้ PostgreSQL CLI และ SQL Tools
- **สิ่งที่ทำ:**
  - สร้าง Express Backend พร้อม Controller & Repository (`auth`, `board`, `task`, `column`, `admin`, `notification`)
  - สร้าง Database Migration & Seed Script
  - ลบปุ่ม Quick Login ออกจาก [`LoginView.vue`](file:///d:/1tastClicknext/client/src/views/LoginView.vue)

### ลำดับที่ 3: ระบุตัวตน Super Admin และฟังก์ชัน Password/OTP (Steps 630 – 970)
- **User Request:**
  - กำหนด Super Admin ชัดเจน: `psitpukang1234567@gmail.com` และ `pasitpukang1234567@gmail.com`
  - เพิ่มปุ่มดู/ซ่อนรหัสผ่าน (Password Visibility Toggle: ไอคอนลูกตา)
  - เพิ่มระบบ "ลืมรหัสผ่าน" (Forgot Password ด้วย OTP Verification)
  - ถามเหตุผลการมี Role USER ทั่วไป -> ปรับโครงสร้าง Role ให้มีเพียง `SUPER_ADMIN` และ `USER`
- **สิ่งที่ทำ:**
  - เพิ่ม Password Visibility Toggle บนฟอร์ม Login และ Register
  - สร้าง [`ForgotPasswordModal.vue`](file:///d:/1tastClicknext/client/src/components/ForgotPasswordModal.vue) มีขั้นตอน: กรอกอีเมล -> รับ OTP -> ยืนยัน OTP -> ตั้งรหัสผ่านใหม่
  - ปรับปรุง Backend Auth Controller ให้จัดการ OTP และ Role Mapping

### ลำดับที่ 4: ตรวจสอบระบบด้วย GitNexus & เอกสารสถาปัตยกรรม (Steps 970 – 1500)
- **User Request:**
  - ใช้ GitNexus ค้นหาและวิเคราะห์ Execution Flows ทั้งหมดของโปรเจกต์เป็นภาษาไทย
  - บันทึกการวิเคราะห์ลงใน [`docs/GITNEXUS_ARCHITECTURE.md`](file:///d:/1tastClicknext/docs/GITNEXUS_ARCHITECTURE.md)
  - ใช้ Browser Subagent ทดสอบระบบหน้าบ้าน ตรวจสอบความถูกต้องและจุดบกพร่อง
- **สิ่งที่ทำ:**
  - วิเคราะห์ 68 Execution Flows ของระบบ และสร้างรายงานสถาปัตยกรรม 49KB
  - ทดสอบ E2E flows ผ่านเบราว์เซอร์อัตโนมัติ

### ลำดับที่ 5: รีดีไซน์เป็น "เว็บสมุดการบ้านและการเรียน" (Steps 1500 – 1700)
- **User Request:** 
  - `/ui-ux-pro-max /ui-ux-designer รีดีไซด์ให้เหมือนเว็บการบ้าน สำหรับการทำการบ้าน`
- **สิ่งที่ทำ:**
  - เปลี่ยนชื่อเป็น **"Clicknext Homework Hub"**
  - ปรับ Sidebar ซ้ายเดิมที่เป็นแถบยาว 900px ให้เป็น **Compact Floating Pill Dock** พร้อมไอคอนการเรียน (หมวกบัณฑิต, สมุดการบ้าน, Super Admin)
  - Header: `"สมุดการบ้าน & งานที่ต้องส่ง"`
  - เพิ่มแถบสถิติการบ้าน 4 การ์ด (รายวิชาทั้งหมด, การบ้านทั้งหมด, รอทำ/กำลังทำ, ส่งแล้วสำเร็จ)
  - เพิ่มตัวกรองหมวดหมู่วิชาเรียนจริง (คณิต-วิทย์, ภาษา-สังคม, เทคโนโลยี, โครงงาน, ศิลปะ)
  - การ์ดวิชาแสดง Progress Bar % ความสำเร็จ
  - แท็กสำหรับงานการบ้าน: `การบ้านด่วน ⚡`, `งานเดี่ยว 👤`, `งานกลุ่ม 👥`, `มีรายงาน 📄`, `เตรียมสอบ 📝`, `เก็บคะแนน 💯`

---

## 🚀 รายละเอียดการ Refactor แบบแบ่ง Phase (Phased Refactoring Summary)

หลังจากรีดีไซน์เสร็จ ผู้ใช้งานได้สั่งการให้ทำ Production Refactor ภายใต้กฎเหล็ก 9 ข้อ โดยแบ่งทำทีละ Phase:

```
[Phase 1: Planning & Setup] ➔ [Phase 2: Auth Centralization] ➔ [Phase 3: Vue Component Decomposition]
                                                                        ↓
[Phase 4B: DB/API Optimization] 🠔 [Phase 4A: Security Hardening] 🠔 [Project Quality Audit]
```

---

### 🔹 Phase 1: การวางแผนและการตั้งค่าความปลอดภัย
- กำหนด Golden Rules 9 ข้อ
- ใช้ GitNexus สร้างกราฟเริ่มต้นและตั้งเกณฑ์การตรวจสอบ Impact

---

### 🔹 Phase 2: Centralize `isSuperAdminEmail` & Cleanup Board Store
- **เป้าหมาย:** กำจัดโค้ดตรวจสอบอีเมลแอดมินที่กระจัดกระจาย และลด data-mode branching ใน `board.ts`
- **สิ่งที่ทำ:**
  1. สร้าง [`client/src/utils/auth.ts`](file:///d:/1tastClicknext/client/src/utils/auth.ts):
     - รวม `SUPER_ADMIN_EMAILS` ไว้ที่เดียว: `pasitpukang1234567@gmail.com`, `psitpukang1234567@gmail.com`, `apsitpukang1234567@gmail.com`
     - ประกาศฟังก์ชัน `isSuperAdminEmail(email?: string | null): boolean` พร้อม `.trim().toLowerCase()`
  2. ปรับปรุงจุดเรียกใช้งานทั้งหมดใน Client:
     - [`client/src/stores/auth.ts`](file:///d:/1tastClicknext/client/src/stores/auth.ts)
     - [`client/src/views/AdminUsersView.vue`](file:///d:/1tastClicknext/client/src/views/AdminUsersView.vue)
     - [`client/src/router/index.ts`](file:///d:/1tastClicknext/client/src/router/index.ts)
     - [`client/src/components/layout/Navbar.vue`](file:///d:/1tastClicknext/client/src/components/layout/Navbar.vue)
  3. ปรับปรุง [`client/src/stores/board.ts`](file:///d:/1tastClicknext/client/src/stores/board.ts) ให้ logic ชัดเจน ไม่กระทบ fallback
- **ผลลัพธ์:** Client & Server build ผ่าน 100%, Dual-mode ทำงานปกติ

---

### 🔹 Phase 3: Vue Component Decomposition
- **เป้าหมาย:** แยก View ขนาดใหญ่ที่แบกรับ Responsibility มากเกินไปออกเป็น Sub-components โดยไม่เปลี่ยน Behavior
- **สิ่งที่ทำ:**
  1. แยก [`client/src/components/ForgotPasswordModal.vue`](file:///d:/1tastClicknext/client/src/components/ForgotPasswordModal.vue) ออกจาก [`LoginView.vue`](file:///d:/1tastClicknext/client/src/views/LoginView.vue)
     - จัดการ State ของการขอ OTP, นับเวลาถอยหลัง (Timer 60s), Validation, และการตั้งรหัสผ่านใหม่
  2. แยก [`client/src/components/UserFormModal.vue`](file:///d:/1tastClicknext/client/src/components/UserFormModal.vue) ออกจาก [`AdminUsersView.vue`](file:///d:/1tastClicknext/client/src/views/AdminUsersView.vue)
     - รองรับทั้งโหมด Create User และ Edit User
  3. รัน **Browser E2E Functional Verification** ครบทุก Flow:
     - Login / Logout / Register
     - Forgot Password (ขอ OTP -> กรอก OTP -> รีเซ็ตรหัสผ่าน -> ปิดด้วย Backdrop/Esc)
     - Super Admin Panel (เปิดดูสถิติ, ค้นหาผู้ใช้, เปิด Modal เพิ่มผู้ใช้, Validation)
     - ผลการทดสอบ: **PASS 100% ทุกรายการ**

---

### 🔹 Project Quality Audit (Read-Only Inspection)
ทำการ Audit ทั้งโปรเจกต์อย่างละเอียด และพบจุดสำคัญที่ต้องนำไปแก้ใน Phase 4:
1. **Critical Security (P0):**
   - พบ Hardcoded Universal Dev Password Bypass ใน `auth.controller.ts`
   - พบ Fallback Secret `'secret'` ในกรณีที่ไม่ได้กำหนด `JWT_SECRET` ใน `.env`
2. **Database Performance (P1):**
   - การบันทึก Assignee ของ Task เป็น N+1 Loop (Sequential INSERT ทีละคน)
   - Correlated Subquery ใน `getBoardDetails` ทำงานช้าเมื่อมี Task จำนวนมาก
   - `getStats` ใน Admin Controller ยิงคำสั่งนับแยกกันถึง 4 ครั้งติดกัน

---

### 🔹 Phase 4A: Security Hardening (4A.1 & 4A.2)
- **เป้าหมาย:** ขจัดช่องโหว่ความปลอดภัยระดับวิกฤต โดยไม่แตะต้อง Business Logic
- **สิ่งที่ทำ:**
  1. **4A.1 ลบ Password Bypass:**
     - แก้ไข [`server/src/controllers/auth.controller.ts`](file:///d:/1tastClicknext/server/src/controllers/auth.controller.ts)
     - ลบเงื่อนไข Dev Bypass (`password === 'dev_bypass_...'`) ออกจากการล็อกอินทั้งหมด
     - บังคับตรวจสอบรหัสผ่านด้วย `bcrypt.compare()` กับรหัสผ่านแฮชจริงในฐานข้อมูลเท่านั้น
  2. **4A.2 Centralize & Secure JWT Config:**
     - สร้าง [`server/src/config/jwt.ts`](file:///d:/1tastClicknext/server/src/config/jwt.ts)
     - นำ fallback secret เช่น `'secret'` ออก
     - บังคับใช้ **Fail-Fast**: หากไม่มีตัวแปร `JWT_SECRET` หรือเป็นค่าว่าง เซิร์ฟเวอร์จะโยนข้อยกเว้นหยุดการทำงานทันที
     - นำเข้า `JWT_SECRET` ไปใช้งานใน `auth.controller.ts` และ `auth.middleware.ts`
- **ผลลัพธ์:** ความปลอดภัยได้รับการยกระดับเทียบเท่า Production, ระบบทดสอบ Authorization และ Role สิทธิ์ Super Admin ทำงานถูกต้อง

---

### 🔹 Phase 4B: Database & API Performance Optimization
- **เป้าหมาย:** แก้ไขปัญหา N+1 Query และลด DB Round Trips ในระดับ Database/API layer
- **สิ่งที่ทำ:**
  1. **Batch UNNEST Assignee Operations (`task.repository.ts`):**
     - แทนที่ Sequential for-loop insert ด้วยคำสั่ง SQL Batch:
       ```sql
       INSERT INTO task_assignees (task_id, user_id)
       SELECT $1, unnest($2::uuid[])
       ON CONFLICT (task_id, user_id) DO NOTHING
       ```
     - ลด DB Round trips จาก `N+2` เหลือเพียง `3-4` queries ต่อการ assign/create task
  2. **LEFT JOIN LATERAL Pre-aggregation (`board.repository.ts`):**
     - ปรับปรุง `getBoardDetails()` จาก Correlated Subquery ที่ evaluate ต่อแถว ให้เป็น `LEFT JOIN LATERAL` พร้อม `json_agg`
     - คงโครงสร้าง JSON Response เดิมครบถ้วน 100%
  3. **Consolidated Admin Stats Query (`admin.controller.ts`):**
     - รวมคำสั่ง `COUNT(*)` 4 รายการ (Users, Super Admins, Boards, Tasks) จาก 4 Round trips ให้เหลือเพียง **1 Single Round trip**:
       ```sql
       SELECT
         (SELECT COUNT(*) FROM users) as total_users,
         (SELECT COUNT(*) FROM users WHERE role = 'SUPER_ADMIN') as super_admins,
         (SELECT COUNT(*) FROM boards) as total_boards,
         (SELECT COUNT(*) FROM tasks) as total_tasks
       ```
  4. **Parallel Notification Dispatch (`task.controller.ts`):**
     - ใช้ `Promise.all()` ในการสร้างการแจ้งเตือนแบบขนาน
- **ผลลัพธ์:**
  - Build: Server ผ่าน ✅, Client ผ่าน ✅
  - Transaction safety: ยังคงทำงานภายใต้ `withTransaction()` ครบถ้วน ไม่มีความเสี่ยงข้อมูลไม่สอดคล้องกัน
  - GitNexus: 1,089 Nodes, 2,375 Edges, Zero Broken Edges

---

## 📁 โครงสร้างไฟล์และหน้าที่ของแต่ละโมดูล (Project Directory Structure)

```
d:\1tastClicknext\
├── AGENTS.md                  # คำสั่งและกฎ GitNexus สำหรับ AI Agent
├── CLAUDE.md                  # กฎเฉพาะสำหรับ Claude Code / Antigravity
├── README.md                  # คู่มือโปรเจกต์เดิม
├── Test Frontend Developer.pdf # เอกสารโจทย์ต้นฉบับจาก Clicknext
├── docker-compose.yml         # คอนฟิก Docker สำหรับ PostgreSQL Database
├── docs/
│   ├── GITNEXUS_ARCHITECTURE.md # รายงานวิเคราะห์สถาปัตยกรรมและ Execution Flows 68 รายการ
│   └── plans/                 # แผนงานในแต่ละ Phase
├── client/                    # Frontend (Vue 3 + Vite + TypeScript)
│   ├── src/
│   │   ├── components/
│   │   │   ├── ForgotPasswordModal.vue # [Phase 3] Modal รีเซ็ตรหัสผ่านด้วย OTP
│   │   │   ├── UserFormModal.vue       # [Phase 3] Modal เพิ่ม/แก้ไขผู้ใช้ของ Super Admin
│   │   │   ├── board/                  # CreateBoardModal, EditBoardModal
│   │   │   ├── kanban/                 # ColumnItem, TaskItem, TaskDetailModal
│   │   │   ├── layout/                 # Navbar, SidebarDock (Floating Pill Dock)
│   │   │   └── notification/           # NotificationDropdown
│   │   ├── views/
│   │   │   ├── LoginView.vue           # [Phase 3] หน้า Login & Register สไตล์ Homework Hub
│   │   │   ├── DashboardView.vue       # หน้ารายวิชาการบ้าน พร้อม Progress Bar & สถิติ
│   │   │   ├── BoardDetailView.vue     # หน้ารายละเอียดคอลัมน์การบ้าน (Kanban board)
│   │   │   └── AdminUsersView.vue      # [Phase 3] หน้า Super Admin จัดการผู้ใช้
│   │   ├── stores/
│   │   │   ├── auth.ts                 # จัดการ State ผู้ใช้, สิทธิ์ Super Admin, OTP
│   │   │   ├── board.ts                # จัดการ Board, Column, Task พร้อม Dual-mode fallback
│   │   │   └── notification.ts         # จัดการการแจ้งเตือน
│   │   ├── utils/
│   │   │   └── auth.ts                 # [Phase 2] Single source of truth: isSuperAdminEmail
│   │   ├── services/
│   │   │   ├── api.ts                  # Axios client ติดต่อกับ Backend REST API
│   │   │   ├── storage.ts              # LocalStorage helper & persistence
│   │   │   └── mockData.ts             # Initial mock data สำหรับ LocalStorage mode
│   │   └── router/index.ts             # Route definitions & Role-based guards
└── server/                    # Backend (Node.js + Express + PostgreSQL)
    ├── src/
    │   ├── config/
    │   │   ├── database.ts             # PostgreSQL Pool Connection & Transaction helper
    │   │   └── jwt.ts                  # [Phase 4A] Fail-Fast JWT Secret Configuration
    │   ├── controllers/
    │   │   ├── auth.controller.ts      # [Phase 4A] Login (ลบ bypass), Register, OTP flow
    │   │   ├── admin.controller.ts     # [Phase 4B] Combined single-query getStats(), Users CRUD
    │   │   ├── board.controller.ts     # Board CRUD
    │   │   └── task.controller.ts      # [Phase 4B] Task CRUD, Move, Promise.all notifications
    │   ├── repositories/
    │   │   ├── task.repository.ts      # [Phase 4B] Batch UNNEST insert ใน create() & setAssignees()
    │   │   ├── board.repository.ts     # [Phase 4B] LEFT JOIN LATERAL getBoardDetails()
    │   │   ├── user.repository.ts      # User DB operations
    │   │   ├── column.repository.ts    # Column operations
    │   │   └── notification.repository.ts # Notification operations
    │   ├── middlewares/
    │   │   ├── auth.middleware.ts      # ตรวจสอบ JWT token
    │   │   └── admin.middleware.ts     # ตรวจสอบสิทธิ์ Super Admin
    │   └── db/
    │       ├── migrate.ts              # Database Schema migration script
    │       └── seed.ts                 # Database Seeder script
```

---

## 💻 คู่มือคำสั่งการรันและทดสอบระบบ (Operational Runbook)

### 1. การเปิดใช้งานฐานข้อมูล (PostgreSQL via Docker)
```powershell
docker-compose up -d
```
*ฐานข้อมูลจะรันที่พอร์ต 5432 (User: `postgres`, Password: `postgrespassword`, DB: `kanban_db`)*

### 2. รัน Database Migration & Seed
```powershell
cd d:\1tastClicknext\server
npm run db:migrate
npm run db:seed
```

### 3. รัน Server Backend (พอร์ต 5000)
```powershell
cd d:\1tastClicknext\server
npm run dev
```

### 4. รัน Client Frontend (พอร์ต 3000)
```powershell
cd d:\1tastClicknext\client
npm run dev
```

### 5. การตรวจสอบความสมบูรณ์ของโค้ด (Build Check)
```powershell
# ตรวจสอบ Server TypeScript
cd d:\1tastClicknext\server
npm run build

# ตรวจสอบ Client Vue TypeScript
cd d:\1tastClicknext\client
npm run build
```

### 6. การใช้งาน GitNexus สำหรับวิเคราะห์ก่อนแก้โค้ด
```powershell
# ทำ Impact Analysis ย้อนกลับหากำลังจะแก้ฟังก์ชัน
node .gitnexus/run.cjs impact "<SymbolName>" --direction upstream --repo .

# อัปเดตและสร้างดัชนี GitNexus ใหม่
node .gitnexus/run.cjs analyze --index-only

# ตรวจสอบการเปลี่ยนแปลงของ Graph
node .gitnexus/run.cjs detect-changes --scope all --repo .
```

---

## 🔍 ประเด็นคงเหลือและแนวทางต่อยอด (Remaining Backlog for Next Agent)

หากต้องการทำ Phase ต่อไป หรือมีงานปรับปรุงเพิ่มเติม ข้อมูลจาก Audit ระบุรายการดังต่อไปนี้:

1. **ระบบ OTP ส่งอีเมลจริง (Production OTP Delivery):**
   - ปัจจุบัน OTP ถูกเก็บไว้ใน Memory (`Map<string, { otp, expiresAt }>`) และส่งกลับใน Response เพื่อการทดสอบ หากต้องการ Production-grade ให้เชื่อมต่อบริการส่งอีเมล (เช่น Nodemailer, Resend, SendGrid) และย้าย OTP ไปเก็บใน Redis
2. **LocalStorage Serialization Debounce:**
   - ปัจจุบันในฝั่ง Client เวลาบอร์ดมีการอัปเดต จะมีการสั่ง `JSON.stringify(allBoards)` ลง LocalStorage แบบ synchronous หากมีข้อมูลขนาดใหญ่มาก แนะนำให้ทำ Debounce สั้น ๆ
3. **Automated E2E / Unit Tests:**
   - ปัจจุบันผ่านการทดสอบด้วย Browser Subagent และ Manual Verification แต่ยังไม่มีการเขียน Jest/Vitest/Playwright Script ไว้ใน Repository อย่างเป็นทางการ

---

> **หมายเหตุสำหรับ AI Agent:**  
> โค้ดทั้งหมดในปัจจุบันอยู่ในสถานะที่มีเสถียรภาพสูงสุด (Stable & Clean) หากได้รับคำสั่งให้ทำสิ่งใดเพิ่มเติม **โปรดอ่าน [AGENTS.md](file:///d:/1tastClicknext/AGENTS.md) และรัน GitNexus Impact ทุกครั้งก่อนแก้ไขไฟล์** เพื่อป้องกันไม่ให้เกิด Regression ต่องานที่ทำสำเร็จไปแล้วครับ
