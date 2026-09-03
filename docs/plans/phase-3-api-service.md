# Phase 3: API & Service Layer (Frontend Data Engine)

> **ขอบเขต:** ออกแบบ Data Access Layer ฝั่งหน้าบ้าน (Vue 3) ให้รองรับ **Dual-Engine (API + Local Storage Fallback)** และ **Pinia Stores**
> **เป้าหมาย:** สร้างระบบจัดการข้อมูลและ State Management ที่ยืดหยุ่น ปลอดภัยด้วย TypeScript และทำงานได้ทั้ง Online/Offline

---

## 1. ไฟล์ที่จะสร้างใน Phase 3

- `client/src/types/index.ts` - นิยาม TypeScript Interfaces ฝั่ง Frontend ทั้งหมด
- `client/src/api/client.ts` - Axios Client พร้อม Request/Response Interceptors (ดัก JWT Token)
- `client/src/services/storage.service.ts` - Local Storage Engine (จำลอง Database บน Browser สำหรับโหมด Standalone/Mock)
- `client/src/services/data.service.ts` - Service Adapter กลาง (สลับระหว่าง Backend API กับ Local Storage ได้อย่างราบรื่น)
- `client/src/stores/auth.ts` - Pinia Auth Store (User State, Login, Register, Quick User Switcher)
- `client/src/stores/board.ts` - Pinia Board Store (Boards List, Current Board, Columns, Tasks, Optimistic Drag & Drop)
- `client/src/stores/notification.ts` - Pinia Notification Store (Notification List, Unread Counter)

---

## 2. จุดเด่นของ Dual-Engine Service Architecture

```
[ Vue 3 Components & Views ]
            │
            ▼
     [ Pinia Stores ]
            │
            ▼
   [ Data Service Layer ]
     /                 \
    ▼                   ▼
[ Backend API ]    [ Local Storage ]
 (PostgreSQL)       (Offline Engine)
```

1. **Seamless Mode Switching**: ผู้ใช้สามารถสลับโหมดระหว่างเชื่อมต่อ Backend กับรันบนเครื่อง (Local Storage) ได้ตลอดเวลา
2. **Optimistic Updates**: ฝั่ง Store จะอัปเดต UI ทันทีเมื่อผู้ใช้ลากวาง Task แล้วจึงส่งคำสั่ง Sync เบื้องหลัง ทำให้ UX ลื่นไหลไร้รอยต่อ

---

## 3. เกณฑ์การตรวจรับ Phase 3 (Checkpoint Verification)
- [ ] Data Services และ Pinia Stores คอมไพล์ผ่าน 100% ไม่มี TypeScript Type Error
- [ ] ทดสอบสร้าง/อ่าน/แก้ไข/ลบข้อมูลผ่าน Pinia Store ได้ทั้งสองโหมด
- [ ] สอบถามผู้ใช้เพื่อตรวจรับผลงานก่อนไป Phase 4
