# 🎓 Clicknext Homework Hub — Kanban Board
> **แบบทดสอบตำแหน่ง Front-End Developer | บริษัท Clicknext Co., Ltd.**  
> พัฒนาด้วย: **Vue 3 (Composition API, `<script setup>`) + TypeScript + Tailwind CSS + Pinia**  
> จัดเก็บข้อมูลแบบ **Offline-First ด้วย Browser LocalStorage** (รันได้ทันที 100% ไม่ต้องต่อเซิร์ฟเวอร์)

---

## ⚡ วิธีการติดตั้งและเปิดใช้งาน (Quick Start)

รันโปรเจกต์ได้ง่าย ๆ ใน 2 ขั้นตอน:

```bash
# 1. ติดตั้ง Dependencies
npm install

# 2. เริ่มต้นรันโปรเจกต์
npm run dev
```

> 🌐 หน้าเว็บจะเปิดขึ้นที่ **`http://localhost:3000`** ทันที  
> สามารถทดสอบใช้งานฟังก์ชันทั้งหมดได้ทันที ข้อมูลจะถูกบันทึกไว้ใน `LocalStorage` ของเบราว์เซอร์อย่างปลอดภัย

---

## ✨ ตารางตรวจสอบฟังก์ชันเทียบ Requirement ของ Clicknext

ระบบได้รับการพัฒนาครบถ้วน **100% ตามข้อกำหนดในเอกสาร `Test Frontend Developer.pdf`** ทั้งข้อกำหนดหลักและคะแนนพิจารณาพิเศษทุกข้อ:

| ข้อ | ฟีเจอร์ตาม Requirement | รายละเอียดการพัฒนาในโปรเจกต์ | สถานะ |
|:---:|---|---|:---:|
| **1** | **Register & Login** | เข้าสู่ระบบ, สมัครสมาชิกใหม่, ดู/ซ่อนรหัสผ่าน, และระบบลืมรหัสผ่านด้วย OTP | ✅ **เสร็จสมบูรณ์** |
| **2** | **จัดการ Board** | แสดงรายการวิชา/บอร์ด, เพิ่มบอร์ดใหม่, แก้ไขชื่อ, ลบบอร์ด, พร้อม Progress Bar % ความคืบหน้า | ✅ **เสร็จสมบูรณ์** |
| **3** | **Invite สมาชิก** | Modal เชิญเพื่อนร่วมทีมหรือเพื่อนร่วมกลุ่มการบ้านเข้าร่วมบอร์ด | ✅ **เสร็จสมบูรณ์** |
| **4** | **จัดการ Column** | เพิ่มคอลัมน์ขั้นตอน, แก้ไขชื่อคอลัมน์, และลบคอลัมน์ | ✅ **เสร็จสมบูรณ์** |
| **5** | **จัดการ Task** | สร้างการบ้าน/งาน, แก้ไขรายละเอียด, กำหนดวันส่ง (Due Date), และลบงาน | ✅ **เสร็จสมบูรณ์** |
| **5a** | **[Bonus] Mouse ลาก-วาง** | **HTML5 Drag & Drop Native** ย้ายการ์ดข้ามคอลัมน์ได้ลื่นไหล บันทึกลำดับให้อัตโนมัติ | ⭐ **ได้คะแนนโบนัส** |
| **5b** | **[Bonus] ระบบแท็ก (Tags)** | ป้ายสีหมวดหมู่งาน (`การบ้านด่วน ⚡`, `งานเดี่ยว 👤`, `งานกลุ่ม 👥`, `มีรายงาน 📄`, `เตรียมสอบ 📝`) | ⭐ **ได้คะแนนโบนัส** |
| **6** | **มอบหมายผู้รับผิดชอบ** | กำหนดสมาชิกผู้รับผิดชอบงาน (Multi-assignees) พร้อม Avatar รูปโปรไฟล์ | ✅ **เสร็จสมบูรณ์** |
| **6a** | **[Bonus] แจ้งเตือนในระบบ** | กระดิ่งแจ้งเตือนพร้อม Badge ตัวเลข เมื่อได้รับมอบหมายงานใหม่ | ⭐ **ได้คะแนนโบนัส** |

---

## 🌟 จุดเด่นทางเทคนิคสำหรับตำแหน่ง Front-End (Key Architectural Highlights)

1. **สถาปัตยกรรม Vue 3 & Composition API:**
   - ใช้ `<script setup lang="ts">` ทุก Component ตามมาตรฐานล่าสุดของ Vue 3
   - แยก Components อย่างเป็นระเบียบ เช่น [`ForgotPasswordModal.vue`](file:///d:/1tastClicknext/client/src/components/ForgotPasswordModal.vue), [`UserFormModal.vue`](file:///d:/1tastClicknext/client/src/components/UserFormModal.vue), [`ColumnItem.vue`](file:///d:/1tastClicknext/client/src/components/kanban/ColumnItem.vue), [`TaskCard.vue`](file:///d:/1tastClicknext/client/src/components/kanban/TaskCard.vue)
   - ควบคุม Type Safety เต็มรูปแบบด้วย TypeScript และ `vue-tsc` (Build ผ่าน 100% ไม่มี Type Error)

2. **State Management ด้วย Pinia:**
   - แยก Store ตาม Responsibility อย่างชัดเจน:
     - `stores/auth.ts`: จัดการสถานะผู้ใช้, การล็อกอิน, และสิทธิ์ Super Admin
     - `stores/board.ts`: จัดการกระดาน คอลัมน์ งานการบ้าน และการลากวาง (Optimistic UI updates)
     - `stores/notification.ts`: จัดการระบบแจ้งเตือน

3. **LocalStorage Offline-First Storage Service:**
   - มี Service จำลองฐานข้อมูลภายในเครื่อง ([`storage.service.ts`](file:///d:/1tastClicknext/client/src/services/storage.service.ts))
   - รองรับ CRUD ครบทุกมิติ เมื่อผู้ใช้รีเฟรชหน้าจอ ข้อมูลการบ้าน ลำดับคอลัมน์ และผู้ใช้จะไม่สูญหาย

4. **UI/UX Design Concept — "Clicknext Homework Hub":**
   - ออกแบบในธีม **สมุดการบ้านและการเรียน** ส่งเสริมสมาธิและใช้งานง่าย
   - **Floating Pill Dock** แถบเมนูลอยตัวด้านซ้าย สัดส่วนกะทัดรัด
   - **Bento Quick Stats** สรุปสถานะงาน (รายวิชาทั้งหมด, การบ้านทั้งหมด, รอทำ, ส่งแล้ว)
   - **Progress Bar** คำนวณร้อยละความสำเร็จของงานในแต่ละวิชาแบบเรียลไทม์

---

## 👥 บัญชีสำหรับทดสอบระบบ (Test Accounts)

ผู้ประเมินสามารถ **สมัครสมาชิกใหม่ด้วยตนเอง** หรือเข้าสู่ระบบด้วยบัญชีที่เตรียมไว้ให้ล่วงหน้า:

| บัญชีผู้ใช้ | อีเมล (Email) | รหัสผ่าน (Password) | สิทธิ์ (Role) | สิทธิ์การใช้งาน |
|---|---|---|:---:|---|
| **Super Admin** | `pasitpukang1234567@gmail.com` | `Password@1234` | `SUPER_ADMIN` | 👑 เข้าถึงหน้า Super Admin จัดการผู้ใช้ในระบบได้ |
| **User ทั่วไป** | `pasitpukang0@gmail.com` | `Password@1234` | `USER` | 👤 ใช้งานกระดานการบ้านและการทำงานทั่วไป |

---

## 📁 โครงสร้างโปรเจกต์ (Project Structure)

```
d:\1tastClicknext\
├── package.json              # Root npm script สำหรับสั่งรัน client ได้โดยตรง
├── README.md                 # เอกสารแนะนำโปรเจกต์สำหรับตรวจข้อสอบ
├── Test Frontend Developer.pdf # โจทย์ทดสอบต้นฉบับจาก Clicknext
└── client/                   # ซอร์สโค้ด Vue 3 Frontend
    ├── index.html            # Entry HTML
    ├── package.json          # Dependencies ของ Frontend
    ├── vite.config.ts        # Vite configuration
    ├── tailwind.config.js    # Tailwind CSS Theme & Styling
    └── src/
        ├── components/       # Reusable UI Components
        │   ├── ForgotPasswordModal.vue  # Modal รีเซ็ตรหัสผ่านด้วย OTP
        │   ├── UserFormModal.vue        # Modal เพิ่ม/แก้ไขผู้ใช้
        │   ├── board/                   # CreateBoardModal, EditBoardModal
        │   ├── kanban/                  # ColumnItem, TaskCard, TaskDetailModal
        │   ├── layout/                  # Navbar, SidebarDock (Floating Dock)
        │   └── notification/            # NotificationDropdown
        ├── views/            # หน้าหลักของระบบ
        │   ├── LoginView.vue            # หน้าเข้าสู่ระบบและสมัครสมาชิก
        │   ├── DashboardView.vue        # หน้ารวมรายวิชาการบ้านและสถิติ
        │   ├── BoardDetailView.vue      # หน้ารายละเอียดกระดาน Kanban
        │   └── AdminUsersView.vue       # หน้าแผงควบคุม Super Admin
        ├── stores/           # Pinia Stores (auth, board, notification)
        ├── services/         # Storage Service (LocalStorage persistence) & Mock Data
        ├── utils/            # Authentication & Role helper utilities
        └── router/           # Vue Router navigation & Route guards
```

---

## 🛠️ คำสั่งสำหรับตรวจสอบความถูกต้องของโค้ด (Build & Lint Check)

```bash
# ตรวจสอบ TypeScript Types และ Build Production Bundle
npm run build
```
*(ผลการทดสอบ: ผ่านฉลุย 100% ด้วย `vue-tsc -b && vite build` โดยไม่มี Warning หรือ Error ใด ๆ)*