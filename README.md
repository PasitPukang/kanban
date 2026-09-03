# 🚀 Clicknext Kanban Board

> **ระบบบริหารจัดการงานแบบ Kanban Board (Clicknext Full-Stack Developer Assessment)**  
> พัฒนาด้วยสถาปัตยกรรมระดับ Enterprise: **Vue 3 (Composition API + TypeScript) + Tailwind CSS + Pinia** เชื่อมต่อกับ **Express (Pure TypeScript) + PostgreSQL (Raw SQL)** พร้อมสถาปัตยกรรม **Dual-Engine (Offline LocalStorage & Live Backend API)** และ **Docker Compose 1-Click Run**

---

## 📑 สารบัญ (Table of Contents)
- [✨ ตารางสรุปการพัฒนาเทียบ Requirement](#-ตารางสรุปการพัฒนาเทียบ-requirement)
- [🏛️ สถาปัตยกรรมระบบ (System Architecture)](#️-สถาปัตยกรรมระบบ-system-architecture)
- [⚡ วิธีการติดตั้งและรันระบบ (Quick Start)](#-วิธีการติดตั้งและรันระบบ-quick-start)
- [👥 บัญชีผู้ใช้สำหรับทดสอบ (Test Accounts)](#-บัญชีผู้ใช้สำหรับทดสอบ-test-accounts)
- [📡 รายละเอียด API Endpoints](#-รายละเอียด-api-endpoints)
- [🎓 คู่มือตอบคำถามสัมภาษณ์ (Interview Defense Guide)](#-คู่มือตอบคำถามสัมภาษณ์-interview-defense-guide)

---

## ✨ ตารางสรุปการพัฒนาเทียบ Requirement

ระบบพัฒนาครบถ้วน **100% ตามข้อกำหนดในเอกสาร `Test Frontend Developer.pdf`** ทั้งข้อกำหนดหลักและคะแนนพิจารณาพิเศษทุกข้อ:

| ข้อ | ฟีเจอร์ตาม Requirement | รายละเอียดการพัฒนา | สถานะ |
|---|---|---|---|
| **1** | **Register & Login** | รองรับการเข้าสู่ระบบ, สมัครสมาชิก พร้อมปุ่ม **1-Click Quick Login** |  **เสร็จสมบูรณ์** |
| **2** | **จัดการ Board** | สร้าง, ลบ, แก้ไขชื่อ และคำอธิบาย Board ได้อย่างอิสระ |  **เสร็จสมบูรณ์** |
| **3** | **Invite สมาชิก** | เชิญสมาชิกเข้าร่วม Board ด้วย Email หรือคลิกเลือกจากรายชื่อทีม |  **เสร็จสมบูรณ์** |
| **4** | **จัดการ Column** | สร้าง, ลบ, แก้ไขชื่อ Column พร้อมระบบ Auto-create 3 คอลัมน์ตั้งต้น |  **เสร็จสมบูรณ์** |
| **5** | **จัดการ Task** | สร้าง, ลบ, แก้ไขชื่อ, คำอธิบาย และย้ายตำแหน่งการ์ดงาน |  **เสร็จสมบูรณ์** |
| **5a** | **[Bonus] Mouse ลาก-วาง** | **HTML5 Drag & Drop Native** ย้ายข้ามคอลัมน์และสลับตำแหน่งลื่นไหล | ⭐ **ได้คะแนนโบนัส** |
| **5b** | **[Bonus] ระบบแท็ก (Tags)** | ป้ายสีหมวดหมู่งาน (`UI`, `Design`, `Feature`, `Bug`, `Urgent`, `DevOps`) | ⭐ **ได้คะแนนโบนัส** |
| **6** | **มอบหมายผู้รับผิดชอบ** | กำหนดสมาชิกในทีมรับผิดชอบงาน (Multi-assignees) พร้อม Avatar |  **เสร็จสมบูรณ์** |
| **6a** | **[Bonus] แจ้งเตือนในระบบ** | กระดิ่งแจ้งเตือนพร้อม Badge แดง เมื่อถูกมอบหมายงานหรือเชิญเข้าบอร์ด | ⭐ **ได้คะแนนโบนัส** |

### 🌟 เกณฑ์พิจารณาพิเศษสำหรับตำแหน่ง Frontend Developer:
*  **Mockup สมาชิกเพื่อ Login:** มีระบบสลับบัญชีทดสอบ 3 คนบน Navbar ใน 1 คลิก
*  **บันทึกข้อมูลใน Local Storage:** ทำงานแบบ Standalone Offline ได้ 100%
*  **พัฒนาด้วย TypeScript:** ใช้ TypeScript ทั้งฝั่ง Frontend (`<script setup lang="ts">`) และ Backend
*  **ใช้ Vue 3 + Tailwind CSS:** ดีไซน์ระดับ Figma-grade สวยงาม โมเดิร์น Responsive
*  **Docker & Docker Compose:** รองรับคำสั่งเดียวรันทั้งระบบ (`docker-compose up`)

---

## 🏛️ สถาปัตยกรรมระบบ (System Architecture)

ระบบถูกออกแบบด้วยสถาปัตยกรรม **Dual-Engine Architecture** เพื่อให้กรรมการสามารถตรวจงานได้ทั้ง 2 รูปแบบตามต้องการ:

```
                  ┌─────────────────────────────────────┐
                  │    Vue 3 Single Page Application    │
                  │   (Tailwind CSS v4 + Lucide Icons)  │
                  └──────────────────┬──────────────────┘
                                     │
                                     ▼
                  ┌─────────────────────────────────────┐
                  │     Pinia Central State Stores      │
                  │    (auth.ts, board.ts, noti.ts)     │
                  └──────────────────┬──────────────────┘
                                     │
                                     ▼
                  ┌─────────────────────────────────────┐
                  │      Data Service Adapter Layer     │
                  └──────────────┬───────────────┬──────┘
                                 │               │
            [Mode: LocalStorage] │               │ [Mode: Live API]
                                 ▼               ▼
                      ┌──────────────────┐  ┌──────────────────┐
                      │ Browser Storage  │  │ Express Backend  │
                      │  (Offline-First) │  │  (TypeScript)    │
                      └──────────────────┘  └────────┬─────────┘
                                                     │
                                                     ▼
                                            ┌──────────────────┐
                                            │ PostgreSQL 16 DB │
                                            │ (Raw SQL + ACID) │
                                            └──────────────────┘
```

---

## ⚡ วิธีการติดตั้งและรันระบบ (Quick Start)

### ทางเลือกที่ 1: รันด้วย Docker Compose (แนะนำที่สุด - คำสั่งเดียว)

```bash
docker-compose up --build
```
* **Frontend (Vue 3 Nginx):** เข้าใช้งานได้ที่ `http://localhost:3000`
* **Backend (Express API):** เข้าใช้งานได้ที่ `http://localhost:5000`
* **Database (PostgreSQL):** พอร์ต `5432`

---

### ทางเลือกที่ 2: รันแยกเครื่องสำหรับพัฒนา (Local Development)

#### 1. ฝั่ง Frontend (`client`)
```bash
cd client
npm install
npm run dev
```
> หน้าเว็บจะเปิดขึ้นที่ **`http://localhost:3000`** ทันทีในโหมด Local Storage

#### 2. ฝั่ง Backend (`server`)
```bash
cd server
npm install
npm run db:migrate   # สร้างตารางใน PostgreSQL
npm run db:seed      # นำเข้าข้อมูลทดสอบตั้งต้น
npm run dev          # สตาร์ท Express Server พอร์ต 5000
```

---

## 👥 บัญชีผู้ใช้สำหรับทดสอบ (Test Accounts)

สามารถใช้ปุ่ม **Quick User Switcher** ที่มุมขวาบนของ Navbar หรือไอคอนบน Left Dock เพื่อสลับบัญชีได้ทันทีในคลิกเดียว:

| ชื่อ-นามสกุล | อีเมล | รหัสผ่านเริ่มต้น | สิทธิ์ (Role) | บทบาทในระบบ |
|---|---|---|---|---|
| **Super Admin Psit** | `psitpukang1234567@gmail.com` | `Password@1234` | `SUPER_ADMIN` | 👑 **ผู้ดูแลระบบสูงสุด** (จัดการ-แก้ไข-เพิ่ม-ลบ User ทั้งหมด) |
| **Pasit Pukang** | `pasitpukang0@gmail.com` | `Password@1234` | `USER` | 💻 **เจ้าของบอร์ด (Board Owner)** สมาชิกทีมพัฒนา |
| **Best Pasit** | `bestpasit2547@gmail.com` | `Password@1234` | `USER` | 🎨 **สมาชิกทีม (Board Member)** ได้รับมอบหมายงาน UI/Frontend |
| **Bgee Developer** | `bgee7242@gmail.com` | `Password@1234` | `USER` | ⚙️ **สมาชิกทีม (Board Member)** ได้รับมอบหมายงาน DevOps/Docker |

---

## 📡 รายละเอียด API Endpoints

### สิทธิ์ทั่วไป (Public / Authenticated User)
| Method | Endpoint | คำอธิบาย | สิทธิ์ (Auth) |
|---|---|---|---|
| `POST` | `/api/auth/register` | สมัครสมาชิกใหม่ (Bcrypt Salt 12 Rounds) | Public |
| `POST` | `/api/auth/login` | เข้าสู่ระบบ (รับ JWT Token) | Public |
| `GET` | `/api/auth/me` | ดึงข้อมูลผู้ใช้ปัจจุบัน | Bearer Token |
| `GET` | `/api/boards` | ดึงกระดานทั้งหมดที่ตนเองเกี่ยวข้อง | Bearer Token |
| `POST` | `/api/boards` | สร้างกระดานใหม่ (+ 3 คอลัมน์ตั้งต้น) | Bearer Token |
| `GET` | `/api/boards/:id` | ดึงข้อมูลกระดานเต็มรูปแบบ (Nested) | Bearer Token |
| `PATCH` | `/api/boards/:id` | แก้ไขชื่อและคำอธิบายกระดาน | Bearer Token |
| `DELETE` | `/api/boards/:id` | ลบกระดาน (เฉพาะ Owner) | Bearer Token |
| `POST` | `/api/boards/:id/invite` | เชิญสมาชิกเข้ากระดาน + ส่ง Notification | Bearer Token |
| `POST` | `/api/boards/:id/columns` | เพิ่มคอลัมน์ใหม่ | Bearer Token |
| `PATCH` | `/api/columns/:id` | เปลี่ยนชื่อคอลัมน์ | Bearer Token |
| `DELETE` | `/api/columns/:id` | ลบคอลัมน์ | Bearer Token |
| `POST` | `/api/columns/:id/tasks` | สร้างการ์ดงานใหม่ | Bearer Token |
| `PATCH` | `/api/tasks/:id` | แก้ไขงาน (Title, Tags, Due Date) | Bearer Token |
| `PATCH` | `/api/tasks/:id/move` | ย้ายตำแหน่งการ์ด (Drag & Drop Transaction) | Bearer Token |
| `DELETE` | `/api/tasks/:id` | ลบการ์ดงาน | Bearer Token |
| `POST` | `/api/tasks/:id/assign` | มอบหมายงาน + สร้าง Notification แจ้งเตือน | Bearer Token |
| `GET` | `/api/notifications` | ดึงรายการแจ้งเตือนทั้งหมด | Bearer Token |
| `PATCH` | `/api/notifications/:id/read` | ทำเครื่องหมายว่าอ่านแล้ว | Bearer Token |

### สิทธิ์ผู้ดูแลระบบสูงสุด (Super Admin Only)
| Method | Endpoint | คำอธิบาย | สิทธิ์ (Auth) |
|---|---|---|---|
| `GET` | `/api/admin/users` | ดึงรายชื่อ User ทั้งหมดในระบบ | `SUPER_ADMIN` Only |
| `POST` | `/api/admin/users` | สร้าง User ใหม่พร้อมกำหนด Role | `SUPER_ADMIN` Only |
| `PATCH` | `/api/admin/users/:id` | แก้ไขชื่อ, อีเมล หรือปรับ Role ผู้ใช้ | `SUPER_ADMIN` Only |
| `DELETE` | `/api/admin/users/:id` | ลบผู้ใช้ออกจากระบบ (ป้องกันลบ Primary Admin) | `SUPER_ADMIN` Only |
| `GET` | `/api/admin/stats` | สถิติภาพรวมระบบ (Users, Super Admins, Boards, Tasks) | `SUPER_ADMIN` Only |

---

## 🎓 คู่มือตอบคำถามสัมภาษณ์ (Interview Defense Guide)

### 1. ทำไมถึงเลือกสถาปัตยกรรม Dual-Engine (LocalStorage + Live API)?
> *"เนื่องจากโจทย์ของ Clicknext ระบุว่า 'สามารถเก็บข้อมูลไว้ใน Local Storage ได้' และ 'แนะนำเป็น PostgreSQL' ผมจึงออกแบบเป็น **Dual-Engine** โดยใช้ Service Pattern คั่นกลาง ทำให้ระบบสามารถทำงานแบบ Standalone ไม่ต้องต่อเน็ตก็ได้ หรือจะเปิดสวิตช์เชื่อมต่อกับ Real Database หลังบ้านก็ได้ในคลิกเดียวครับ"*

### 2. ทำไมถึงเลือกใช้ Pinia แทน Vuex?
> *"Pinia เป็นมาตรฐานใหม่ของ Vue 3 ที่ตัดกระบวนการ Mutation ที่ซ้ำซ้อนออกไป, รองรับ TypeScript แบบ 100% Out-of-the-box, ขนาดไฟล์เบาเพียง ~1KB และทำงานร่วมกับ Composition API ได้อย่างไร้รอยต่อครับ"*

### 3. การจัดการ Drag & Drop ในฐานข้อมูลทำอย่างไรให้ลำดับไม่เพี้ยน?
> *"ผมใช้เทคนิค **Relative Index Shifting** ร่วมกับ **PostgreSQL ACID Transactions (`withTransaction`)** ครับ เมื่อมีการย้ายการ์ดข้ามคอลัมน์ การ์ดต้นทางจะถูกขยับอุดช่องโหว่ (-1) และการ์ดปลายทางจะถูกขยับเปิดช่องว่าง (+1) ภายใต้ `BEGIN ... COMMIT` ก้อนเดียวกัน เพื่อป้องกัน Race Condition ครับ"*
#   k a n b a n  
 