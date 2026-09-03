# Phase 5: Docker & Final Delivery Implementation Plan

> **ขอบเขต:** จัดทำ Containerization ด้วย Docker Compose, รัน End-to-End System Test และจัดทำเอกสารคู่มือส่งมอบงาน
> **เป้าหมาย:** ให้ระบบสามารถรันขึ้นมาใช้งานได้ด้วยคำสั่งเดียว (`docker-compose up`) และมีเอกสาร `README.md` ครบถ้วนตามมาตรฐานวิศวกรรมซอฟต์แวร์

---

## 1. ไฟล์ที่จะสร้างใน Phase 5

- `docker-compose.yml` - จัดการ 3 Services: `postgres`, `server` (Express), และ `client` (Vue 3 Nginx)
- `server/Dockerfile` - Multi-stage build สำหรับ Node.js + TypeScript Backend
- `client/Dockerfile` - Multi-stage build สำหรับ Vue 3 (Vite build + Nginx production server)
- `client/nginx.conf` - ตั้งค่า Nginx สำหรับ SPA Routing (`try_files $uri /index.html`)
- `README.md` - เอกสารสรุปโครงการ, สถาปัตยกรรม, คู่มือการติดตั้ง & ใช้งาน, ข้อมูลบัญชีทดสอบ, และตารางตรวจสอบ Requirement ครบทุกข้อ

---

## 2. ขั้นตอนการทำงาน (Step-by-Step)

### Step 1: Dockerize Backend & Frontend
สร้าง Dockerfile ที่มีประสิทธิภาพ มี caching layer สำหรับ node_modules เพื่อให้ build เร็ว

### Step 2: Configure Docker Compose
กำหนด Network, Volumes และ Healthcheck เพื่อให้ Backend รอจนกว่า PostgreSQL จะพร้อมทำงานก่อนเริ่มรัน migration

### Step 3: Comprehensive End-to-End Test
ทดสอบทุก User Journey ตั้งแต่ Register, สร้าง Board, Invite, Drag & Drop, Notification ตลอดจนการสลับโหมด

### Step 4: Final Documentation in README.md
สรุปการทำงาน พร้อมภาพหรือคลิปอธิบาย (ถ้ามี) ให้ผู้ตรวจงานประทับใจ

---

## 3. เกณฑ์การตรวจรับ Phase 5 (Final Delivery Checkpoint)
- [ ] สั่ง `docker-compose up --build` แล้วทุก Service ขึ้นพร้อมกันโดยไม่มี Error
- [ ] หน้าเว็บเข้าใช้งานได้ที่ `http://localhost:3000` (หรือ port ที่กำหนด)
- [ ] เอกสาร `README.md` ชัดเจน ตรวจสอบครบตามเกณฑ์ของ Clicknext 100%
