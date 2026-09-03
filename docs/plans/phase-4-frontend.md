# Phase 4: Frontend UI Layer Implementation Plan

> **ขอบเขต:** พัฒนาส่วนติดต่อผู้ใช้งาน (UI/UX) ด้วย **Vue 3 (Composition API + `<script setup lang="ts">`)** และ **Tailwind CSS**
> **เป้าหมาย:** สร้าง Kanban Board ที่สวยงามระดับพรีเมียม (Figma-grade) ลื่นไหล ครบทุกฟีเจอร์ของ Clicknext

---

## 1. ไฟล์ที่จะสร้างใน Phase 4

### A. Core UI Design System Components
- `client/src/components/ui/BaseButton.vue` - ปุ่มพร้อม variants (primary, secondary, danger, ghost, loading state)
- `client/src/components/ui/BaseInput.vue` - ช่องกรอกข้อมูลพร้อม Label, Error Message, Icon
- `client/src/components/ui/BaseModal.vue` - Dialog Modal พร้อม Fade/Scale Animation
- `client/src/components/ui/BaseBadge.vue` - ป้าย Tag สีสำหรับประเภทงาน
- `client/src/components/ui/BaseAvatar.vue` - รูปโปรไฟล์ผู้ใช้พร้อมตัวอักษรย่อ

### B. Layout & Navigation
- `client/src/components/layout/Navbar.vue` - แถบนำทางด้านบน แสดงชื่อบอร์ด, Quick User Switcher, Notification Dropdown และ User Profile
- `client/src/components/notification/NotificationDropdown.vue` - Popover แจ้งเตือนพร้อมปุ่ม Mark as read

### C. Board & Member Modals
- `client/src/components/board/BoardCard.vue` - การ์ดแสดงข้อมูลบอร์ดใน Dashboard
- `client/src/components/board/CreateBoardModal.vue` - Modal สร้างบอร์ดใหม่
- `client/src/components/board/EditBoardModal.vue` - Modal แก้ไขชื่อ/รายละเอียดบอร์ด
- `client/src/components/board/InviteMemberModal.vue` - Modal เชิญสมาชิกด้วยอีเมล พร้อมแสดงรายชื่อสมาชิกปัจจุบัน

### D. Kanban Board Core Components
- `client/src/components/kanban/ColumnList.vue` - แถบแสดงรายการ Columns แนวนอน
- `client/src/components/kanban/ColumnItem.vue` - คอลัมน์เดี่ยว (Add Task button, Rename/Delete, Drag Target)
- `client/src/components/kanban/TaskCard.vue` - การ์ดงานเดี่ยว (Title, Tags, Assignees, Due Date, Drag Handle)
- `client/src/components/kanban/TaskDetailModal.vue` - Modal รายละเอียดงานครบครัน (Edit title, desc, tag picker, assignee selector, delete)

### E. Views & Router
- `client/src/views/LoginView.vue` - หน้า Login & Register พร้อมปุ่ม 1-Click Quick Login
- `client/src/views/DashboardView.vue` - หน้าหลักแสดงบอร์ดทั้งหมด (Owned / Shared)
- `client/src/views/BoardDetailView.vue` - หน้าหลัก Kanban Board (Interactive + Filter/Search)
- `client/src/router/index.ts` - Vue Router พร้อม Navigation Guards

---

## 2. ฟีเจอร์เด่นในฝั่ง UI (UX Highlights)
1. **Fluid Drag & Drop (Feature 5a - Bonus)**: ลากย้ายการ์ดข้ามคอลัมน์ได้อย่างลื่นไหล พร้อม Ghost preview และ Drop target highlight
2. **Tagging System (Feature 5b - Bonus)**: ใส่ Tag สีหลากหลาย ช่วยแยกประเภทงาน
3. **In-App Notification (Feature 6a - Bonus)**: กระดิ่งแจ้งเตือนพร้อม Badge สีแดง เมื่อมีการมอบหมายงาน
4. **1-Click User Switcher**: สลับเป็น User อื่นได้ทันทีจาก Navbar เพื่อทดสอบระบบ Invite และ Notification สะดวกที่สุด

---

## 3. เกณฑ์การตรวจรับ Phase 4 (Checkpoint Verification)
- [ ] UI แสดงผลสวยงาม ตรงตามมาตรฐาน Responsive & Dark Theme
- [ ] ทดสอบสร้าง/ลบ/แก้ไข Board, Column, Task ได้อย่างสมบูรณ์
- [ ] ทดสอบ Drag & Drop ลากย้ายงานได้ลื่นไหล
- [ ] ทดสอบ Assignee และมี Notification แสดงผลถูกต้อง
- [ ] สอบถามผู้ใช้เพื่อตรวจรับผลงานก่อนไป Phase 5
