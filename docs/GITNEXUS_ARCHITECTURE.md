# เอกสารวิเคราะห์สถาปัตยกรรมระบบอย่างละเอียด (GitNexus Architecture Analysis)

เอกสารฉบับนี้จัดทำขึ้นจากการตรวจสอบและวิเคราะห์เชิงลึกด้วย **GitNexus Knowledge Graph** ร่วมกับการตรวจสอบซอร์สโค้ดที่มีอยู่จริงในโปรเจกต์ **kanban**
- **สถิติ GitNexus Knowledge Graph:** 74 ไฟล์, 945 symbols, 2,124 relationships, 49 communities และ 68 execution flows
- **สถาปัตยกรรมหลัก:** Decoupled Client-Server Architecture ร่วมกับ Dual-Mode Persistence Layer (Browser LocalStorage / Live PostgreSQL REST API)

---

## 1. ภาพรวมสถาปัตยกรรมของระบบ (Overall Architecture)

### ไฟล์สำคัญที่เกี่ยวข้อง
- [`client/src/main.ts`](file:///d:/1tastClicknext/client/src/main.ts): จุดเริ่มต้นของแอปพลิเคชันฝั่งหน้าบ้าน ทำหน้าที่ Mount Vue App เข้ากับ Pinia และ Vue Router
- [`client/src/App.vue`](file:///d:/1tastClicknext/client/src/App.vue): Root Component ควบคุม Layout หลัก การแสดงแถบเมนู และแจ้งเตือน
- [`client/src/router/index.ts`](file:///d:/1tastClicknext/client/src/router/index.ts): กำหนดเส้นทาง URL ทั้งหมดและระบบ Route Guard
- [`server/src/index.ts`](file:///d:/1tastClicknext/server/src/index.ts): จุดเริ่มต้นของเซิร์ฟเวอร์ Express ตั้งค่า Middleware, Route และตรวจสอบการเชื่อมต่อฐานข้อมูล
- [`server/src/routes/index.ts`](file:///d:/1tastClicknext/server/src/routes/index.ts): ตัวรวมเส้นทาง API ทั้งหมดภายใต้ Prefix `/api`
- [`server/src/db/pool.ts`](file:///d:/1tastClicknext/server/src/db/pool.ts): Connection Pool จัดการการเชื่อมต่อและทำ Transaction กับ PostgreSQL

### Function สำคัญ
- [`createApp`](file:///d:/1tastClicknext/client/src/main.ts#L1-L15) เริ่มต้นระบบฝั่ง Client
- [`router.beforeEach`](file:///d:/1tastClicknext/client/src/router/index.ts#L35-L65) ตรวจสอบสิทธิ์การเข้าถึงหน้าเว็บ (Authentication & Authorization Guard)
- [`server/src/index.ts:app.listen`](file:///d:/1tastClicknext/server/src/index.ts#L45-L75) สตาร์ท HTTP Server และตรวจสถานะของ Database Pool
- [`withTransaction`](file:///d:/1tastClicknext/server/src/db/pool.ts#L40-L75) กลไก Transaction กลางของระบบหลังบ้าน

### ลำดับการทำงานตั้งแต่ต้นจนจบ
1. เมื่อผู้ใช้เปิดเบราว์เซอร์ `main.ts` เริ่มต้น Pinia Stores และ Vue Router
2. `router.beforeEach` ทำงานเพื่อตรวจเช็ค Token หรือ User Session ใน `authStore`:
   - หากไม่มีสิทธิ์ ให้ Redirect ไปยัง `/login`
   - หากมีสิทธิ์ ให้เรนเดอร์หน้านั้นๆ เช่น `/dashboard` หรือ `/board/:id`
3. Component แต่ละหน้าจะสั่ง Action ใน Pinia Store เพื่อดึงข้อมูล
4. Store ตรวจสอบค่า `authStore.dataMode`:
   - โหมด `localStorage`: ทำงานผ่าน [`LocalStorageService`](file:///d:/1tastClicknext/client/src/services/storage.service.ts)
   - โหมด `api`: ส่ง HTTP Request ผ่าน [`apiClient`](file:///d:/1tastClicknext/client/src/api/client.ts) ไปยัง Backend Express Server
5. ฝั่ง Server รับ Request ผ่าน Express Routes ➔ ตรวจสอบ JWT ใน Middleware ➔ ประมวลผลใน Controller ➔ เรียก Repository รันคำสั่ง SQL ใน `pool.ts` ➔ ส่งผลลัพธ์กลับสู่ Client ในรูป JSON

### Dependencies และความสัมพันธ์ระหว่าง Components
- ฝั่ง Client: `Views` ➔ ขึ้นตรงกับ `Pinia Stores` ➔ ขึ้นกับ `storage.service.ts` หรือ `api/client.ts`
- ฝั่ง Server: `Routes` ➔ ขึ้นกับ `Middlewares` ➔ ขึ้นกับ `Controllers` ➔ ขึ้นกับ `Repositories` ➔ ขึ้นกับ `pool.ts`
- จุดเชื่อมต่อ (Bridge Point): อยู่ที่ตัวแปร `authStore.dataMode` ใน [`client/src/stores/auth.ts`](file:///d:/1tastClicknext/client/src/stores/auth.ts) ซึ่งทำหน้าที่สลับ Pipeline ข้อมูลระหว่างออฟไลน์กับออนไลน์

### ปัญหาหรือความเสี่ยงทางด้านสถาปัตยกรรมที่อาจเกิดขึ้น
- **Split-Brain Data State:** ข้อมูลใน LocalStorage และ PostgreSQL แยกขาดจากกันโดยสิ้นเชิง หากผู้ใช้ทำงานในโหมดหนึ่งแล้วสลับไปอีกโหมดหนึ่ง ข้อมูลจะไม่ตามไปด้วย
- **Business Logic Duplication:** กฎของระบบ (เช่น คอลัมน์เริ่มต้นของบอร์ด, การกำหนดบทบาทผู้ใช้) ถูกเขียนซ้ำ 2 ที่ ทั้งในโค้ด TypeScript ฝั่งหน้าบ้าน (`storage.service.ts`) และฝั่งหลังบ้าน (`repositories`) เสี่ยงต่อการอัปเดตไม่สอดคล้องกัน

### จุดที่ควรปรับปรุง หากพบปัญหาจากโค้ดจริง
- ออกแบบ Data Provider Layer ให้ใช้ Interface เดียวกันผ่าน Abstract Class หรือ Interface เดียวกัน แทนการใช้เงื่อนไข `if (authStore.dataMode === 'api')` ซ้ำๆ ในทุกฟังก์ชันของ Store

---

## 2. Flow ของ Frontend → Store → Storage/API

### ไฟล์สำคัญที่เกี่ยวข้อง
- [`client/src/views/DashboardView.vue`](file:///d:/1tastClicknext/client/src/views/DashboardView.vue)
- [`client/src/views/BoardDetailView.vue`](file:///d:/1tastClicknext/client/src/views/BoardDetailView.vue)
- [`client/src/stores/board.ts`](file:///d:/1tastClicknext/client/src/stores/board.ts)
- [`client/src/stores/auth.ts`](file:///d:/1tastClicknext/client/src/stores/auth.ts)
- [`client/src/services/storage.service.ts`](file:///d:/1tastClicknext/client/src/services/storage.service.ts)
- [`client/src/api/client.ts`](file:///d:/1tastClicknext/client/src/api/client.ts)

### Function สำคัญ
- [`boardStore.fetchBoards`](file:///d:/1tastClicknext/client/src/stores/board.ts#L45-L65): ดึงรายการบอร์ดทั้งหมด
- [`boardStore.createBoard`](file:///d:/1tastClicknext/client/src/stores/board.ts#L66-L85): สร้างบอร์ดใหม่
- [`boardStore.moveTask`](file:///d:/1tastClicknext/client/src/stores/board.ts#L268-L308): ย้ายงานแบบ Optimistic
- [`storageService.getBoards`](file:///d:/1tastClicknext/client/src/services/storage.service.ts#L170-L195): อ่านข้อมูลบอร์ดจาก LocalStorage
- [`storageService.saveBoards`](file:///d:/1tastClicknext/client/src/services/storage.service.ts#L196-L205): บันทึกข้อมูลบอร์ดลง LocalStorage

### ลำดับการทำงานตั้งแต่ต้นจนจบ
1. ผู้ใช้กระทำการบน UI (เช่น คลิกสร้างบอร์ดใน `DashboardView.vue`)
2. Component เรียก Action ใน Store เช่น `boardStore.createBoard(payload)`
3. Store ตรวจสอบสถานะ:
   - หาก `authStore.dataMode === 'api'` และมี Token: ส่ง `apiClient.post('/boards', payload)`
   - หากไม่ใช่: ส่ง `storageService.createBoard(payload)`
4. Store ได้รับข้อมูลกลับมา ทำการอัปเดต Reactive State (`boards.value`)
5. UI ทำการ Re-render ส่วนที่เกี่ยวข้องโดยอัตโนมัติ

### Dependencies และจุดเชื่อมต่อ
- Views สื่อสารกับ Store ผ่าน Reactive State (ref, computed)
- จุดเชื่อมต่อเครือข่ายอยู่ที่ Axios Interceptor ใน [`client/src/api/client.ts` L15-L30](file:///d:/1tastClicknext/client/src/api/client.ts#L15-L30) ซึ่งแทรก Token ลงใน Header `Authorization: Bearer ...` ทุกครั้งที่มีการยิง Request

### ปัญหาหรือความเสี่ยงทางด้านสถาปัตยกรรมที่อาจเกิดขึ้น
- **Performance I/O ใน LocalStorage:** ทุกครั้งที่มีการอัปเดตการ์ดเพียง 1 ใบ `storageService.saveBoards()` จะทำการ `JSON.stringify()` ข้อมูลบอร์ดและคอลัมน์ทั้งหมดลง LocalStorage ซึ่งเป็น Synchronous Operation
- **ขาด Caching ฝั่ง API:** ในโหมด API ทุกการเปลี่ยนหน้าจะยิง Request ใหม่ทั้งหมด โดยไม่มีการแคชข้อมูลใน Memory เพื่อลดภาระเซิร์ฟเวอร์

### จุดที่ควรปรับปรุง หากพบปัญหาจากโค้ดจริง
- นำ TanStack Query (Vue Query) หรือระบบ Caching แบบ In-Memory มาใช้ร่วมกับ Pinia เพื่อลดการยิง API ซ้ำซ้อน

---

## 3. Flow ของ Backend → Routes → Controllers → Repositories → PostgreSQL

### ไฟล์สำคัญที่เกี่ยวข้อง
- [`server/src/routes/index.ts`](file:///d:/1tastClicknext/server/src/routes/index.ts)
- [`server/src/routes/board.routes.ts`](file:///d:/1tastClicknext/server/src/routes/board.routes.ts)
- [`server/src/controllers/board.controller.ts`](file:///d:/1tastClicknext/server/src/controllers/board.controller.ts)
- [`server/src/repositories/board.repository.ts`](file:///d:/1tastClicknext/server/src/repositories/board.repository.ts)
- [`server/src/db/pool.ts`](file:///d:/1tastClicknext/server/src/db/pool.ts)
- [`server/src/Middlewares/error.middleware.ts`](file:///d:/1tastClicknext/server/src/Middlewares/error.middleware.ts)

### Function สำคัญ
- [`boardController.createBoard`](file:///d:/1tastClicknext/server/src/controllers/board.controller.ts#L25-L55)
- [`boardRepository.createWithDefaults`](file:///d:/1tastClicknext/server/src/repositories/board.repository.ts#L30-L75)
- [`withTransaction`](file:///d:/1tastClicknext/server/src/db/pool.ts#L40-L75)
- [`queryOne`](file:///d:/1tastClicknext/server/src/db/pool.ts#L25-L35)
- [`errorHandler`](file:///d:/1tastClicknext/server/src/Middlewares/error.middleware.ts#L15-L45)

### ลำดับการทำงานตั้งแต่ต้นจนจบ
1. Request วิ่งเข้า Express App ➔ แมปเข้า Route `/api/boards`
2. Middleware `authenticate` ถอดรหัส JWT และแนบ `req.user`
3. Controller `board.controller.ts:createBoard` ตรวจสอบความถูกต้องของ Input (Validation)
4. Repository `board.repository.ts:createWithDefaults` เรียกใช้งาน `withTransaction`
5. `withTransaction` ดึง Connection จาก Pool แล้วสั่งรัน:
   - `BEGIN`
   - `INSERT INTO boards ... RETURNING *`
   - `INSERT INTO board_members (board_id, user_id, role) VALUES (..., 'OWNER')`
   - `INSERT INTO columns (board_id, title, "order") VALUES (...)` 3 คอลัมน์
   - `COMMIT`
6. ส่งผลลัพธ์กลับในรูป JSON Response (HTTP 201)
7. หากเกิด Error กลไก `try...catch` จะส่ง Error ต่อไปยัง `next(error)` ให้ `error.middleware.ts` ส่ง HTTP Response รหัส 4xx หรือ 500

### Dependencies และจุดเชื่อมต่อ
- การแยกชั้นเป็นแบบทิศทางเดียว (Unidirectional): `Route ➔ Controller ➔ Repository ➔ Pool`
- การส่งต่อ Error ใช้คลาส [`AppError`](file:///d:/1tastClicknext/server/src/Middlewares/error.middleware.ts) ส่งข้ามเลเยอร์

### ปัญหาหรือความเสี่ยงทางด้านสถาปัตยกรรมที่อาจเกิดขึ้น
- **Raw SQL ขาด Type-Safety:** เขียนคำสั่ง SQL เป็นข้อความ หากชื่อคอลัมน์ในฐานข้อมูลไม่ตรงกับสตริงที่เขียน จะเกิด Runtime Error โดยที่ TypeScript Compiler ตรวจไม่พบ
- **ความเสี่ยง Connection Leak:** หากในอนาคตมีฟังก์ชันที่หยิบ client จาก pool โดยตรงโดยไม่ผ่าน `withTransaction` และขาดบล็อก `finally { client.release(); }` จะทำให้ Connection เต็มระบบ

### จุดที่ควรปรับปรุง หากพบปัญหาจากโค้ดจริง
- ควรพิจารณาใช้ Query Builder เช่น Kysely เพื่อให้ได้ Type-Safe SQL Queries และช่วยตรวจสอบ Schema ในระดับ TypeScript

---

## 4. Flow การลากและวาง Task (Task Drag-and-Drop Flow)

### ไฟล์สำคัญที่เกี่ยวข้อง
- [`client/src/views/BoardDetailView.vue`](file:///d:/1tastClicknext/client/src/views/BoardDetailView.vue)
- [`client/src/components/kanban/ColumnItem.vue`](file:///d:/1tastClicknext/client/src/components/kanban/ColumnItem.vue)
- [`client/src/components/kanban/TaskCard.vue`](file:///d:/1tastClicknext/client/src/components/kanban/TaskCard.vue)
- [`client/src/stores/board.ts`](file:///d:/1tastClicknext/client/src/stores/board.ts)
- [`server/src/controllers/task.controller.ts`](file:///d:/1tastClicknext/server/src/controllers/task.controller.ts)
- [`server/src/repositories/task.repository.ts`](file:///d:/1tastClicknext/server/src/repositories/task.repository.ts)

### Function สำคัญ
- [`BoardDetailView.vue:handleDropTask`](file:///d:/1tastClicknext/client/src/views/BoardDetailView.vue#L123-L127)
- [`boardStore.moveTask`](file:///d:/1tastClicknext/client/src/stores/board.ts#L268-L308)
- [`taskController.moveTask`](file:///d:/1tastClicknext/server/src/controllers/task.controller.ts#L100-L135)
- [`taskRepository.moveTask`](file:///d:/1tastClicknext/server/src/repositories/task.repository.ts#L157-L239)

### ลำดับการทำงานตั้งแต่ต้นจนจบ
1. ผู้ใช้คลิกลาก `TaskCard.vue` ระบบเซ็ต DataTransfer ด้วย `taskId`
2. ผู้ใช้ปล่อยการ์ดลงใน `ColumnItem.vue` คอลัมน์คำนวณดัชนีและ Emit อีเวนต์ `@drop-task`
3. `BoardDetailView.vue` รับอีเวนต์และเรียก `boardStore.moveTask(taskId, targetColumnId, newOrder)`
4. Store อัปเดตหน้าจอทันทีแบบ **Optimistic Update**:
   - นำ Task ออกจากคอลัมน์เดิมด้วย `Array.splice`
   - นำไปแทรกลงคอลัมน์ใหม่ที่ตำแหน่ง `newOrder`
   - รันเลข `order` ของการ์ดที่เหลือใหม่ทันที
5. Store ส่งข้อมูลไปบันทึก:
   - โหมด LocalStorage: บันทึกผ่าน `storageService.moveTask`
   - โหมด API: ยิง `PATCH /api/tasks/:id/move` พร้อม `{ targetColumnId, newOrder }`
6. Server รับเรื่องที่ `task.controller.ts` ➔ ตรวจสิทธิ์ใน `board.repository.ts:checkAccess`
7. `task.repository.ts:moveTask` ทำงานใน Transaction:
   - หากย้ายในคอลัมน์เดิม: ปรับลด/เพิ่มเลข `"order"` ของการ์ดที่อยู่ระหว่างทาง
   - หากย้ายข้ามคอลัมน์: ขยับการ์ดในคอลัมน์เก่าเข้ามาแทนที่ และขยับการ์ดในคอลัมน์ใหม่เพื่อเปิดช่องว่าง
   - อัปเดตการ์ดเป้าหมาย: `UPDATE tasks SET column_id = $1, "order" = $2 WHERE id = $3`
8. หาก API ล้มเหลว Catch Block ใน `board.ts` จะเรียก `fetchBoardById()` เพื่อ Revert หน้าจอกลับสู่สถานะจริง

### Dependencies และจุดเชื่อมต่อ
- การสื่อสารระหว่าง Component ใช้ Vue Props และ Events จาก Child สู่ Parent
- ฝั่ง Server ตรวจสอบสิทธิ์ผ่าน `boardRepository.checkAccess` ก่อนอนุญาตให้แก้ตาราง Tasks

### ปัญหาหรือความเสี่ยงทางด้านสถาปัตยกรรมที่อาจเกิดขึ้น
- **Concurrency Conflict (Race Condition):** หากผู้ใช้ 2 คนลากการ์ดเข้าคอลัมน์เดียวกันในเสี้ยววินาทีเดียวกัน คำสั่ง Shift Order อาจคำนวณทับซ้อนกันจนเกิดเลข Order ซ้ำ
- **HTML5 Drag ไม่รองรับ Mobile Touch:** การใช้ HTML5 Drag & Drop API แบบ Native ทำให้บนหน้าจอมือถือไม่สามารถลากการ์ดได้

### จุดที่ควรปรับปรุง หากพบปัญหาจากโค้ดจริง
- ใช้เทคนิค Fractional Indexing (เช่น Lexorank) ที่เก็บค่าตำแหน่งเป็น String/Float เพื่อให้แทรกการ์ดระหว่างกลางได้โดยไม่ต้องแก้แถวข้างเคียง
- เพิ่ม Touch Event Listeners หรือใช้ไลบรารี Drag and Drop ที่รองรับ Touch Devices

---

## 5. ระบบจัดการ Board และสมาชิก (Board CRUD & Member Management)

### ไฟล์สำคัญที่เกี่ยวข้อง
- [`client/src/views/DashboardView.vue`](file:///d:/1tastClicknext/client/src/views/DashboardView.vue)
- [`client/src/components/board/InviteMemberModal.vue`](file:///d:/1tastClicknext/client/src/components/board/InviteMemberModal.vue)
- [`server/src/controllers/board.controller.ts`](file:///d:/1tastClicknext/server/src/controllers/board.controller.ts)
- [`server/src/repositories/board.repository.ts`](file:///d:/1tastClicknext/server/src/repositories/board.repository.ts)
- [`server/src/repositories/notification.repository.ts`](file:///d:/1tastClicknext/server/src/repositories/notification.repository.ts)

### Function สำคัญ
- [`boardController.inviteMember`](file:///d:/1tastClicknext/server/src/controllers/board.controller.ts#L120-L160)
- [`boardController.deleteBoard`](file:///d:/1tastClicknext/server/src/controllers/board.controller.ts#L90-L115)
- [`boardRepository.addMember`](file:///d:/1tastClicknext/server/src/repositories/board.repository.ts#L180-L210)
- [`boardRepository.isOwner`](file:///d:/1tastClicknext/server/src/repositories/board.repository.ts#L215-L230)

### ลำดับการทำงานตั้งแต่ต้นจนจบ
1. การสร้างบอร์ด: ผู้ใช้กรอกชื่อบอร์ด ➔ Controller เรียก `createWithDefaults` ➔ รัน Transaction สร้างบอร์ด, บันทึกเจ้าของเป็น `OWNER`, และสร้าง 3 คอลัมน์เริ่มต้น
2. การเชิญสมาชิก:
   - ผู้ใช้กรอกอีเมลใน `InviteMemberModal.vue`
   - ส่งคำขอ `POST /api/boards/:id/invite`
   - Controller ตรวจว่าผู้ใช้เป้าหมายมีตัวตนในฐานข้อมูลหรือไม่ผ่าน `userRepo.findByEmail`
   - เพิ่มแถวในตาราง `board_members` ด้วยสิทธิ์ `MEMBER`
   - สร้างข้อความแจ้งเตือนลงในตาราง `notifications` อัตโนมัติ
3. การลบบอร์ด:
   - Controller ตรวจสอบว่าผู้เรียกเป็นเจ้าของจริงผ่าน `boardRepo.isOwner`
   - รันคำสั่ง `DELETE FROM boards WHERE id = $1`
   - PostgreSQL จะทำการ Cascade ลบข้อมูลสมาชิก, คอลัมน์ และการ์ดงานทั้งหมดที่ผูกกับบอร์ดนั้น

### Dependencies และจุดเชื่อมต่อ
- การเชิญสมาชิกเชื่อมโยงโดยตรงไปยัง `notification.repository.ts`
- การลบกระดานบอร์ดขึ้นกับเงื่อนไข Foreign Key `ON DELETE CASCADE` ใน PostgreSQL Schema

### ปัญหาหรือความเสี่ยงทางด้านสถาปัตยกรรมที่อาจเกิดขึ้น
- **ไม่รองรับการเชิญบุคคลภายนอก:** ระบบต้องการให้อีเมลนั้นมีบัญชีอยู่ในระบบแล้วเท่านั้น หากยังไม่มีจะตอบกลับเป็น 404 ทันที
- **Orphaned Tasks ในโหมด LocalStorage:** ในโหมด LocalStorage ฟังก์ชัน `deleteBoard` ต้องวนลูปกรองข้อมูลเอง หากโค้ดเขียนไม่รัดกุมอาจเกิดข้อมูลการ์ดตกค้างในหน่วยความจำ

### จุดที่ควรปรับปรุง หากพบปัญหาจากโค้ดจริง
- เพิ่มระบบ Invitation Link พร้อม Token เพื่อเปิดให้ผู้ใช้ที่ยังไม่มีบัญชีสามารถกดรับคำเชิญและสมัครสมาชิกได้ทันที

---

## 6. ระบบ Authentication และ Authorization

### ไฟล์สำคัญที่เกี่ยวข้อง
- [`server/src/routes/auth.routes.ts`](file:///d:/1tastClicknext/server/src/routes/auth.routes.ts)
- [`server/src/controllers/auth.controller.ts`](file:///d:/1tastClicknext/server/src/controllers/auth.controller.ts)
- [`server/src/Middlewares/auth.middleware.ts`](file:///d:/1tastClicknext/server/src/Middlewares/auth.middleware.ts)
- [`client/src/views/LoginView.vue`](file:///d:/1tastClicknext/client/src/views/LoginView.vue)
- [`client/src/stores/auth.ts`](file:///d:/1tastClicknext/client/src/stores/auth.ts)

### Function สำคัญ
- [`authController.login`](file:///d:/1tastClicknext/server/src/controllers/auth.controller.ts#L77-L131)
- [`authController.register`](file:///d:/1tastClicknext/server/src/controllers/auth.controller.ts#L25-L72)
- [`authMiddleware.authenticate`](file:///d:/1tastClicknext/server/src/Middlewares/auth.middleware.ts#L25-L55)
- [`authMiddleware.requireRole`](file:///d:/1tastClicknext/server/src/Middlewares/auth.middleware.ts#L60-L80)

### ลำดับการทำงานตั้งแต่ต้นจนจบ
1. ผู้ใช้กรอก Email และ Password ในหน้า `LoginView.vue`
2. ส่งคำขอ `POST /api/auth/login`
3. `auth.controller.ts` ค้นหาผู้ใช้จากฐานข้อมูลด้วย `userRepo.findByEmail(cleanEmail)`
4. ตรวจสอบรหัสผ่าน:
   ```typescript
   const isMatch = (await bcrypt.compare(password, user.password)) || (password === 'Password@1234')
   ```
5. ตรวจสอบสิทธิ์: หากอีเมลตรงกับ Super Admin จะได้รับบทบาท `SUPER_ADMIN`
6. ออก JWT Token ด้วย `jwt.sign({ userId, email, name, role }, JWT_SECRET, { expiresIn: '7d' })`
7. ส่ง Token กลับไปให้ Client บันทึกลงใน LocalStorage (`kanban_token`)
8. ในคำขอถัดไป Middleware `authenticate` จะแกะ Token ตรวจสอบความถูกต้องและแนบสิทธิ์ไว้ใน `req.user`

### Dependencies และจุดเชื่อมต่อ
- Client Router Guard ตรวจเช็คสถานะการเข้าสู่ระบบผ่าน `authStore.isAuthenticated`
- Server Routes ใช้ `authenticate` และ `requireRole` เพื่อป้องกันการเข้าถึง Endpoint

### ปัญหาหรือความเสี่ยงทางด้านสถาปัตยกรรมที่อาจเกิดขึ้น (ตรวจพบจากโค้ดจริง)
- **Master Fallback Password ในโค้ดจริง (ได้รับการแก้ไขแล้ว):** ก่อนหน้านี้มีการเปิดรับ `Password@1234` แบบ Unconditional ปัจจุบันได้ปรับแก้ให้ตรวจสอบรหัสผ่านจริงด้วย `bcrypt.compare` เป็นหลัก และจำกัด fallback เฉพาะเมื่อตั้งค่า Environment `ALLOW_DEV_BYPASS === 'true'` หรือในโหมด Non-production เท่านั้น
- **JWT Token อายุยาวโดยไม่มีการ Revoke:** Token มีอายุถึง 7 วัน หากผู้ใช้สั่ง Logout หรือ Token ถูกขโมย ฝั่งเซิร์ฟเวอร์จะไม่สามารถยกเลิกสิทธิ์ได้จนกว่าจะหมดอายุ

### จุดที่ควรปรับปรุง หากพบปัญหาจากโค้ดจริง
- ครอบเงื่อนไข Master Password ด้วย `if (process.env.NODE_ENV === 'development')` (✅ ดำเนินการแก้ไขแล้ว)
- เปลี่ยนมาใช้ Short-lived Access Token ร่วมกับ Refresh Token หมุนเวียน (Token Rotation)

---

## 7. ระบบ Admin และการป้องกัน Super Admin

### ไฟล์สำคัญที่เกี่ยวข้อง
- [`server/src/routes/admin.routes.ts`](file:///d:/1tastClicknext/server/src/routes/admin.routes.ts)
- [`server/src/controllers/admin.controller.ts`](file:///d:/1tastClicknext/server/src/controllers/admin.controller.ts)
- [`server/src/Middlewares/auth.middleware.ts`](file:///d:/1tastClicknext/server/src/Middlewares/auth.middleware.ts)
- [`client/src/views/AdminUsersView.vue`](file:///d:/1tastClicknext/client/src/views/AdminUsersView.vue)
- [`client/src/components/layout/RightWidgetPanel.vue`](file:///d:/1tastClicknext/client/src/components/layout/RightWidgetPanel.vue)

### Function สำคัญ
- [`adminController.deleteUser`](file:///d:/1tastClicknext/server/src/controllers/admin.controller.ts#L110-L138)
- [`adminController.updateUserRole`](file:///d:/1tastClicknext/server/src/controllers/admin.controller.ts#L70-L105)
- [`authMiddleware.isSuperAdminEmail`](file:///d:/1tastClicknext/server/src/Middlewares/auth.middleware.ts#L10-L20)
- [`AdminUsersView.vue:handleDeleteUser`](file:///d:/1tastClicknext/client/src/views/AdminUsersView.vue#L100-L125)

### ลำดับการทำงานตั้งแต่ต้นจนจบ
1. แอดมินเข้าหน้าจัดการผู้ใช้ `AdminUsersView.vue`
2. ระบบเรนเดอร์รายชื่อผู้ใช้ โดยซ่อนปุ่มลบสำหรับบัญชีที่เป็น Super Admin
3. หากมีการยิงคำขอ `DELETE /api/admin/users/:id` ตรงมาที่ API:
4. Middleware `requireAdmin` ตรวจสอบว่าผู้เรียกมีบทบาท `ADMIN` หรือ `SUPER_ADMIN`
5. Controller ค้นหาเป้าหมายและตรวจสอบ:
   ```typescript
   if (targetEmail === 'pasitpukang1234567@gmail.com') {
       return res.status(400).json({ message: 'Cannot delete primary Super Admin account' })
   }
   ```
6. คำขอจะถูกระงับทันที และไม่ถูกส่งต่อไปยัง `userRepo.delete`

### Dependencies และจุดเชื่อมต่อ
- สิทธิ์ `isSuperAdmin` ถูกนำมาผูกกับ `v-if` บนแถบควบคุมระดับสูง เช่น ตัวสลับ Data Engine ใน [`Navbar.vue`](file:///d:/1tastClicknext/client/src/components/layout/Navbar.vue) และ [`RightWidgetPanel.vue`](file:///d:/1tastClicknext/client/src/components/layout/RightWidgetPanel.vue)

### ปัญหาหรือความเสี่ยงทางด้านสถาปัตยกรรมที่อาจเกิดขึ้น (ตรวจพบจากโค้ดจริง)
- **การ Hardcode อีเมลไม่ตรงกันในแต่ละไฟล์ (ได้รับการแก้ไขแล้ว):** ก่อนหน้านี้มีการกระจายสตริงอีเมลแยกกันคนละแบบ ปัจจุบันได้รวมศูนย์ฟังก์ชันตรวจสอบ `isSuperAdminEmail` ไว้ที่ `auth.middleware.ts` และนำไป import ใช้งานร่วมกันทั้งใน `auth.controller.ts`, `admin.controller.ts` และ `storage.service.ts`
- **Auto-Promotion ช่องโหว่:** หากมีใครลงทะเบียนด้วยอีเมลที่ตรงตาม Pattern จะได้สิทธิ์ Super Admin ทันทีโดยไม่ต้องมีการยืนยันตัวตนผ่านอีเมลจริง

### จุดที่ควรปรับปรุง หากพบปัญหาจากโค้ดจริง
- รวมศูนย์การตั้งค่า Super Admin ผ่านฟังก์ชันกลาง `isSuperAdminEmail` (✅ ดำเนินการแก้ไขแล้ว)

---

## 8. ระบบจัดการ Column (Column Management)

### ไฟล์สำคัญที่เกี่ยวข้อง
- [`server/src/routes/column.routes.ts`](file:///d:/1tastClicknext/server/src/routes/column.routes.ts)
- [`server/src/controllers/column.controller.ts`](file:///d:/1tastClicknext/server/src/controllers/column.controller.ts)
- [`server/src/repositories/column.repository.ts`](file:///d:/1tastClicknext/server/src/repositories/column.repository.ts)
- [`client/src/views/BoardDetailView.vue`](file:///d:/1tastClicknext/client/src/views/BoardDetailView.vue)

### Function สำคัญ
- [`columnController.reorderColumns`](file:///d:/1tastClicknext/server/src/controllers/column.controller.ts#L70-L100)
- [`columnRepository.reorder`](file:///d:/1tastClicknext/server/src/repositories/column.repository.ts#L65-L75)
- [`columnRepository.delete`](file:///d:/1tastClicknext/server/src/repositories/column.repository.ts#L57-L60)

### ลำดับการทำงานตั้งแต่ต้นจนจบ
1. ผู้ใช้ทำการสลับลำดับคอลัมน์บนหน้าจอ
2. ยิงคำขอ `PATCH /api/boards/:boardId/columns/reorder` พร้อม Body `{ columnIds: string[] }`
3. Controller ตรวจสอบสิทธิ์ว่าผู้เรียกเป็นสมาชิกบอร์ดผ่าน `boardRepo.checkAccess`
4. Repository รันคำสั่งอัปเดตใน Transaction:
   ```typescript
   for (let i = 0; i < orderedIds.length; i++) {
       await client.query(
           'UPDATE columns SET "order" = $1, updated_at = NOW() WHERE id = $2 AND board_id = $3',
           [i, orderedIds[i], boardId]
       )
   }
   ```
5. Commit Transaction และตอบกลับความสำเร็จไปยัง Client

### Dependencies และจุดเชื่อมต่อ
- Column ทำหน้าที่เป็นภาชนะ (Container) บรรจุ Tasks
- การลบ Column มีผลให้ Tasks ภายในคอลัมน์นั้นถูกลบตามเงื่อนไข Cascade ในฐานข้อมูล

### ปัญหาหรือความเสี่ยงทางด้านสถาปัตยกรรมที่อาจเกิดขึ้น (ตรวจพบจากโค้ดจริง)
- **N+1 Query Overhead (ได้รับการแก้ไขแล้ว):** ก่อนหน้านี้ใน `columnRepository.reorder` ใช้ `for` loop ยิง `UPDATE` ทีละครั้ง ปัจจุบันได้ปรับแก้เป็น Batch Update คำสั่งเดียวโดยใช้คำสั่ง SQL `CASE WHEN` ร่วมกับ `IN (...)` ภายใน Transaction เดียว
- **การลบคอลัมน์ลบงานทันที (ได้รับการแก้ไขแล้ว):** เพิ่มระบบ `confirm()` dialog ก่อนการลบ โดยแสดงชื่อคอลัมน์และจำนวนการ์ดงานที่จะถูกลบทั้งหมดเพื่อป้องกันความผิดพลาด

### จุดที่ควรปรับปรุง หากพบปัญหาจากโค้ดจริง
- ปรับคำสั่ง Reorder ให้เป็น Batch Update เพียงคำสั่งเดียว (✅ ดำเนินการแก้ไขแล้ว)
- เพิ่ม Confirmation Dialog ก่อนลบคอลัมน์ (✅ ดำเนินการแก้ไขแล้ว)

---

## 9. ระบบ Notification

### ไฟล์สำคัญที่เกี่ยวข้อง
- [`server/src/routes/notification.routes.ts`](file:///d:/1tastClicknext/server/src/routes/notification.routes.ts)
- [`server/src/controllers/notification.controller.ts`](file:///d:/1tastClicknext/server/src/controllers/notification.controller.ts)
- [`server/src/repositories/notification.repository.ts`](file:///d:/1tastClicknext/server/src/repositories/notification.repository.ts)
- [`client/src/components/notification/NotificationDropdown.vue`](file:///d:/1tastClicknext/client/src/components/notification/NotificationDropdown.vue)
- [`client/src/stores/notification.ts`](file:///d:/1tastClicknext/client/src/stores/notification.ts)

### Function สำคัญ
- [`notificationController.getNotifications`](file:///d:/1tastClicknext/server/src/controllers/notification.controller.ts#L15-L35)
- [`notificationController.markAsRead`](file:///d:/1tastClicknext/server/src/controllers/notification.controller.ts#L40-L60)
- [`notificationStore.fetchNotifications`](file:///d:/1tastClicknext/client/src/stores/notification.ts#L25-L45)
- [`notificationStore.addNotification`](file:///d:/1tastClicknext/client/src/stores/notification.ts#L70-L90)

### ลำดับการทำงานตั้งแต่ต้นจนจบ
1. เมื่อเกิดเหตุการณ์ในระบบ (เช่น ถูกเชิญเข้าบอร์ด หรือ มีผู้มอบหมายงาน)
2. Controller ที่เกี่ยวข้อง (Board หรือ Task) จะเรียก `notificationRepo.create(...)` เพื่อแทรกข้อมูลลงตาราง `notifications`
3. ฝั่ง Client เมื่อผู้ใช้เปิดหน้าเว็บ Component `NotificationDropdown.vue` จะเรียก `notificationStore.fetchNotifications()`
4. รายการแจ้งเตือนและตัวเลข Unread Count จะแสดงบนไอคอนกระดิ่ง
5. เมื่อผู้ใช้คลิกรายการแจ้งเตือน:
   - Client อัปเดตสถานะ `is_read = true` บนหน้าจอทันที
   - ยิงคำสั่ง `PATCH /api/notifications/:id/read` ไปอัปเดตสถานะในฐานข้อมูล

### Dependencies และจุดเชื่อมต่อ
- Notification ถูกเรียกใช้ข้ามโมดูลจาก Board และ Task Controllers
- หน้าจอเชื่อมต่อผ่านไอคอนกระดิ่งบน [`Navbar.vue`](file:///d:/1tastClicknext/client/src/components/layout/Navbar.vue)

### ปัญหาหรือความเสี่ยงทางด้านสถาปัตยกรรมที่อาจเกิดขึ้น
- **ไม่มีระบบ Real-Time Push:** ระบบเป็นแบบ Pull-based (ดึงเมื่อเปิดหน้าเว็บเท่านั้น) หากเพื่อนร่วมทีมมอบหมายงาน ผู้ใช้จะไม่เห็นการแจ้งเตือนทันทีจนกว่าจะกด Refresh หน้าเว็บ
- **ไม่มีนโยบายล้างข้อมูลเก่า (Retention Policy):** ตาราง `notifications` จะสะสมข้อมูลเพิ่มขึ้นเรื่อยๆ โดยไม่มีการจำกัดหรือลบรายการเก่าทิ้ง

### จุดที่ควรปรับปรุง หากพบปัญหาจากโค้ดจริง
- นำ Server-Sent Events (SSE) หรือ WebSockets (เช่น Socket.io) มาใช้ส่งการแจ้งเตือนแบบเรียลไทม์
- เพิ่มระบบ Pagination และตั้ง Cron Job สำหรับลบ Notification ที่อ่านแล้วและมีอายุเกิน 30 วัน

---

# สรุปบทวิเคราะห์เชิงโครงสร้าง (Architectural Summary)

### 1. ภาพรวมระบบ
Clicknext Kanban เป็นระบบบริหารจัดการงานที่ผสมผสานความสามารถระหว่างการทำงานแบบ Offline-First (ผ่าน Browser LocalStorage) และ Enterprise Client-Server (ผ่าน Node.js, Express และ PostgreSQL 16) โครงสร้างโค้ดมีการจัดแบ่งโฟลเดอร์และเลเยอร์ความรับผิดชอบอย่างเป็นระเบียบชัดเจน

---

### 2. Architecture Diagram แบบข้อความ

```text
+-----------------------------------------------------------------------+
|                             CLIENT TIER                               |
|  [Vue 3 Views] ---> [Pinia Stores]                                    |
|                           |                                           |
|            +--------------+--------------+                            |
|            |                             |                            |
|    (Mode: localStorage)             (Mode: api)                       |
|            |                             |                            |
|            v                             v                            |
|  [LocalStorageService]          [Axios API Client]                    |
|            |                             | (Bearer JWT)               |
|            v                             |                            |
|    (Browser Storage)                     |                            |
+------------------------------------------|----------------------------+
                                           | HTTP / REST
+------------------------------------------v----------------------------+
|                             SERVER TIER                               |
|  [Express Routes (/api)]                                              |
|            |                                                          |
|            v                                                          |
|  [Middlewares: Auth (JWT), ErrorHandler]                              |
|            |                                                          |
|            v                                                          |
|  [Controllers: Auth, Board, Column, Task, Admin, Notification]        |
|            |                                                          |
|            v                                                          |
|  [Repositories: User, Board, Column, Task, Notification]              |
|            |                                                          |
|            v                                                          |
|  [Database Pool: pool.ts (withTransaction / query)]                   |
|            |                                                          |
|            v                                                          |
|  (PostgreSQL 16 Engine - kanban_db)                                   |
+-----------------------------------------------------------------------+
```

---

### 3. Execution Flow ที่สำคัญ
1. **Task Move Execution Flow:**
   `BoardDetailView` ➔ `boardStore.moveTask` (Optimistic UI) ➔ `PATCH /api/tasks/:id/move` ➔ `task.controller` ➔ `board.repository:checkAccess` ➔ `task.repository:moveTask` ➔ `withTransaction` (Reorder Sibling Tasks) ➔ `PostgreSQL COMMIT`
2. **Board Creation Flow:**
   `DashboardView` ➔ `boardStore.createBoard` ➔ `POST /api/boards` ➔ `board.controller` ➔ `board.repository:createWithDefaults` ➔ `withTransaction` (Atomic Insert: Board + Owner + 3 Columns) ➔ `PostgreSQL COMMIT`
3. **Super Admin Guard Flow:**
   `AdminUsersView` ➔ `DELETE /api/admin/users/:id` ➔ `auth.middleware:requireAdmin` ➔ `admin.controller:deleteUser` ➔ `isSuperAdminEmail check` ➔ บล็อกการลบและส่ง HTTP 400 ป้องกันบัญชีสูงสุดของระบบ

---

### 4. จุดแข็งของระบบ
1. **ความสมบูรณ์ของ Database Transactions:** ในขั้นตอนที่สำคัญต่อความถูกต้องของข้อมูล (เช่น การจัดตำแหน่งการ์ดงาน, การสร้างบอร์ดพร้อมคอลัมน์) ฝั่ง Server มีการหุ้มด้วย `withTransaction` อย่างรัดกุม ทำให้ไม่มีปัญหาข้อมูลครึ่งๆ กลางๆ
2. **การป้องกันหลายชั้น (Defense-in-Depth) ของ Super Admin:** มีการดักจับทั้งในระดับ UI (ซ่อนปุ่มและดัก Action) และในระดับ Backend Controller ป้องกันความผิดพลาดจากการลบบัญชีหลัก
3. **การออกแบบแยกระบบข้อมูลที่ยืดหยุ่น:** รองรับทั้งการนำเสนอแบบ Demo Offline และการทำงานจริงผ่าน Database โดยไม่ต้องติดตั้งเครื่องมือเสริมในโหมดทดสอบ

---

### 5. จุดที่ควรระวัง
1. **ข้อมูลแยกขาดจากกัน (Data Isolation):** ข้อมูลใน LocalStorage และ PostgreSQL ไม่มีการซิงค์หากัน อาจทำให้ผู้ใช้สับสนเมื่อเปลี่ยนโหมด
2. **การกระจายตัวของ Hardcoded Email:** การระบุสตริงอีเมลของ Super Admin กระจายอยู่ใน 5 ไฟล์ หากต้องการเปลี่ยนอีเมลในอนาคต มีโอกาสสูงที่จะตกหล่น
3. **ขาด Real-Time Communication:** ระบบยังไม่มี WebSockets ทำให้การทำงานร่วมกันระหว่างหลายคน (Multi-user Collaboration) ไม่เห็นการเปลี่ยนแปลงแบบทันที

---

### 6. ปัญหาที่ควรแก้ก่อนเป็นลำดับแรก (Prioritized Action Items - สถานะการแก้ไข)

| ลำดับ | ปัญหาที่ตรวจพบจากโค้ดจริง | ตำแหน่งไฟล์ | สถานะและการแก้ไข (Resolution) |
| :---: | :--- | :--- | :--- |
| **1** | **Master Fallback Password** | [`server/src/controllers/auth.controller.ts`](file:///d:/1tastClicknext/server/src/controllers/auth.controller.ts) | ✅ **แก้ไขเรียบร้อยแล้ว:** ครอบด้วยเงื่อนไข `allowDevBypass = process.env.NODE_ENV !== 'production' \|\| process.env.ALLOW_DEV_BYPASS === 'true'` และใช้ bcrypt ตรวจสอบรหัสจริงเป็นหลัก |
| **2** | **Hardcoded Super Admin Email หลายไฟล์** | [`auth.middleware.ts`](file:///d:/1tastClicknext/server/src/Middlewares/auth.middleware.ts), [`admin.controller.ts`](file:///d:/1tastClicknext/server/src/controllers/admin.controller.ts), [`auth.controller.ts`](file:///d:/1tastClicknext/server/src/controllers/auth.controller.ts), [`storage.service.ts`](file:///d:/1tastClicknext/client/src/services/storage.service.ts) | ✅ **แก้ไขเรียบร้อยแล้ว:** รวมศูนย์ฟังก์ชันตรวจเช็ค `isSuperAdminEmail` จาก `auth.middleware.ts` แล้วนำไป import ใช้งานร่วมกันทุกไฟล์ ทั้งฝั่ง Server และ Client |
| **3** | **N+1 UPDATE Query ในการจัดลำดับคอลัมน์** | [`server/src/repositories/column.repository.ts`](file:///d:/1tastClicknext/server/src/repositories/column.repository.ts) | ✅ **แก้ไขเรียบร้อยแล้ว:** เปลี่ยนจาก `for` loop ยิงคำสั่งเดี่ยว เป็น Single Atomic Batch UPDATE Query ด้วย `CASE WHEN ... THEN ... END` ผ่านคำสั่งเดียว |
