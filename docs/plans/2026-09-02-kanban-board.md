# Master Roadmap: ระบบ Kanban Board (Clicknext)

> **โครงสร้างระบบ:** แบ่งแยกสัดส่วน 4 เลเยอร์ชัดเจน (Database ➔ หลังบ้าน Express ➔ API & Service ➔ หน้าบ้าน Vue 3)
> **รูปแบบการทำงาน:** พัฒนาทีละเฟส (Phased Delivery) โดยมี Checkpoint ขออนุมัติและตรวจรับงานจากคุณก่อนเริ่มเฟสถัดไปเสมอ

---

## สารบัญไฟล์แผนงานแยกตามเฟส (Phase Plans)

| เฟส | ขอบเขตงาน (Layer) | ไฟล์แผนงานละเอียด | วัตถุประสงค์หลัก | สถานะ |
|---|---|---|---|---|
| **Phase 1** | **Database Layer** | [`phase-1-database.md`](file:///d:/1tastClicknext/docs/plans/phase-1-database.md) | PostgreSQL DDL, Connection Pool, Type-Safe SQL, Migration & Seed Data |  **พร้อมเริ่มทำ** |
| **Phase 2** | **Backend Layer** | [`phase-2-backend.md`](file:///d:/1tastClicknext/docs/plans/phase-2-backend.md) | Express + Pure TypeScript, Repositories, JWT Auth, Board/Task/Noti APIs | ✅ **เสร็จสมบูรณ์** |
| **Phase 3** | **API & Service Layer** | [`phase-3-api-service.md`](file:///d:/1tastClicknext/docs/plans/phase-3-api-service.md) | Dual-Engine Data Adapter (API + LocalStorage Fallback), Pinia Stores | ✅ **เสร็จสมบูรณ์** |
| **Phase 4** | **Frontend Layer** | [`phase-4-frontend.md`](file:///d:/1tastClicknext/docs/plans/phase-4-frontend.md) | Vue 3 UI, Kanban Board, Drag & Drop, Tagging, In-app Notifications | ✅ **เสร็จสมบูรณ์** |
| **Phase 5** | **Docker & Final Delivery** | [`phase-5-docker-delivery.md`](file:///d:/1tastClicknext/docs/plans/phase-5-docker-delivery.md) | Docker Compose (1-Click Run), Full-flow Verification, README | ✅ **เสร็จสมบูรณ์** |

---

## กฎเหล็กในการดำเนินงาน (Interactive Gate Protocol)
1. **Focus ทีละเฟส**: ทำงานเฉพาะในขอบเขตของเฟสนั้นๆ เพื่อประหยัด Token และป้องกันโค้ดตีกัน
2. **Review Checkpoint ทุกเฟส**: เมื่อทำเฟสใดเสร็จ จะสรุปผลการทำงาน วิธีทดสอบ และ **หยุดถามคุณเพื่อขอตรวจรับงาน**
3. **ได้รับไฟเขียวจึงไปต่อ**: เมื่อคุณตอบว่า **"ผ่าน / พอใจแล้ว / ไปต่อได้"** จึงจะเริ่มทำเฟสถัดไปทันที
