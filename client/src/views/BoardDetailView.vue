<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  ArrowLeft,
  Plus,
  UserPlus,
  Settings2,
  Kanban,
  CheckCircle2,
  ListTodo
} from 'lucide-vue-next'
import { useBoardStore } from '../stores/board'
import { useAuthStore } from '../stores/auth'
import { Task, User } from '../types'
import ColumnItem from '../components/kanban/ColumnItem.vue'
import TaskDetailModal from '../components/kanban/TaskDetailModal.vue'
import InviteMemberModal from '../components/board/InviteMemberModal.vue'
import EditBoardModal from '../components/board/EditBoardModal.vue'

const route = useRoute()
const router = useRouter()
const boardStore = useBoardStore()
const authStore = useAuthStore()

const boardId = computed(() => route.params.id as string)

// Modals State
const isInviteModalOpen = ref(false)
const isEditBoardModalOpen = ref(false)
const isTaskDetailModalOpen = ref(false)
const selectedTask = ref<Task | null>(null)

// Add Column Form
const isAddingColumn = ref(false)
const newColumnTitle = ref('')

// Add Task Modal State
const isAddTaskModalOpen = ref(false)
const targetColumnIdForNewTask = ref<string | null>(null)
const newTaskTitle = ref('')
const newTaskDesc = ref('')
const newTaskTag = ref('')

const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    if (isAddTaskModalOpen.value) isAddTaskModalOpen.value = false
    if (isAddingColumn.value) isAddingColumn.value = false
  }
}

onMounted(async () => {
  document.addEventListener('keydown', handleKeyDown)
  if (boardId.value) {
    await boardStore.fetchBoardById(boardId.value)
  }
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown)
})

const currentBoard = computed(() => boardStore.currentBoard)

const boardMembersList = computed<User[]>(() => {
  if (!currentBoard.value?.members) return []
  return currentBoard.value.members.map((m) => m.user)
})

// Column Actions
const handleCreateColumn = async () => {
  if (!newColumnTitle.value.trim() || !boardId.value) return
  await boardStore.createColumn(boardId.value, newColumnTitle.value.trim())
  newColumnTitle.value = ''
  isAddingColumn.value = false
}

const handleUpdateColumnTitle = async (columnId: string, newTitle: string) => {
  await boardStore.updateColumn(columnId, newTitle)
}

const handleDeleteColumn = async (columnId: string) => {
  const col = currentBoard.value?.columns?.find((c) => c.id === columnId)
  const count = col?.tasks?.length || 0
  const confirmMsg = count > 0
    ? `คุณแน่ใจหรือไม่ว่าต้องการลบคอลัมน์ "${col?.title || ''}"? (${count} การ์ดงานในคอลัมน์นี้จะถูกลบไปด้วย)`
    : `คุณแน่ใจหรือไม่ว่าต้องการลบคอลัมน์ "${col?.title || ''}"?`
  if (!confirm(confirmMsg)) return
  await boardStore.deleteColumn(columnId)
}

// Task Actions
const openAddTask = (columnId: string) => {
  targetColumnIdForNewTask.value = columnId
  newTaskTitle.value = ''
  newTaskDesc.value = ''
  newTaskTag.value = ''
  isAddTaskModalOpen.value = true
}

const submitNewTask = async () => {
  if (!newTaskTitle.value.trim() || !targetColumnIdForNewTask.value) return

  await boardStore.createTask(targetColumnIdForNewTask.value, {
    title: newTaskTitle.value.trim(),
    description: newTaskDesc.value.trim() || null,
    tags: newTaskTag.value.trim() ? [newTaskTag.value.trim()] : [],
    assignees: authStore.currentUser ? [authStore.currentUser] : []
  })

  isAddTaskModalOpen.value = false
  newTaskTitle.value = ''
  newTaskDesc.value = ''
  newTaskTag.value = ''
}

const handleOpenTaskDetail = (task: Task) => {
  selectedTask.value = task
  isTaskDetailModalOpen.value = true
}

const handleSaveTaskDetail = async (taskData: {
  title: string
  description: string
  tags: string[]
  due_date: string | null
  assignees: User[]
}) => {
  if (!selectedTask.value) return
  await boardStore.updateTask(selectedTask.value.id, taskData)
  isTaskDetailModalOpen.value = false
  selectedTask.value = null
}

const handleDeleteTask = async (taskId: string) => {
  await boardStore.deleteTask(taskId)
  isTaskDetailModalOpen.value = false
  selectedTask.value = null
}

// Drag & Drop Task (Bonus 5a)
const handleDropTask = async (taskId: string, targetColumnId: string, newOrder: number) => {
  await boardStore.moveTask(taskId, targetColumnId, newOrder)
}

// Invite Member
const handleInviteMember = async (email: string) => {
  if (boardId.value) {
    await boardStore.inviteMember(boardId.value, email)
  }
}
</script>

<template>
  <div class="h-[calc(100vh-6.5rem)] flex flex-col overflow-hidden bg-white/70 border border-[#E5E0D5] rounded-[36px] shadow-soft">
    <!-- Sub-Header / Board Title Toolbar -->
    <div class="bg-white/80 backdrop-blur border-b border-[#E5E0D5] px-6 py-4 flex-shrink-0 flex items-center justify-between gap-4">
      <!-- Left: Back button & Title -->
      <div class="flex items-center gap-3 min-w-0">
        <router-link
          to="/dashboard"
          class="w-10 h-10 rounded-full bg-[#FAF8F5] border border-[#E5E0D5] text-neutral-600 hover:text-black hover:bg-neutral-100 transition-colors flex items-center justify-center flex-shrink-0"
          title="กลับไปหน้ากระดานทั้งหมด"
        >
          <ArrowLeft class="w-4 h-4" />
        </router-link>

        <div class="min-w-0">
          <div class="flex items-center gap-2">
            <h1 class="font-display font-extrabold text-lg sm:text-xl text-neutral-900 truncate">
              {{ currentBoard?.title || 'กำลังโหลดกระดาน...' }}
            </h1>
            <button
              @click="isEditBoardModalOpen = true"
              class="p-1 rounded-full text-neutral-400 hover:text-neutral-800 transition-colors"
              title="แก้ไขชื่อกระดาน"
            >
              <Settings2 class="w-4 h-4" />
            </button>
          </div>
          <p v-if="currentBoard?.description" class="text-xs text-neutral-500 truncate hidden sm:block">
            {{ currentBoard.description }}
          </p>
        </div>
      </div>

      <!-- Right: Team Members & Invite Button -->
      <div class="flex items-center gap-3 flex-shrink-0">
        <!-- Members Avatars -->
        <div class="hidden md:flex items-center -space-x-2 overflow-hidden mr-1">
          <img
            v-for="member in currentBoard?.members || []"
            :key="member.id"
            :src="member.user.avatar_url || ''"
            :title="member.user.name + ' (' + member.role + ')'"
            class="w-8 h-8 rounded-full ring-2 ring-white object-cover shadow-2xs"
          />
        </div>

        <!-- Invite Button (Requirement 3) -->
        <button
          @click="isInviteModalOpen = true"
          class="flex items-center gap-1.5 px-4 py-2 rounded-full bg-neutral-900 text-white hover:bg-black text-xs font-semibold shadow-sm transition-all hover:scale-102 active:scale-98"
        >
          <UserPlus class="w-3.5 h-3.5" />
          <span>+ ชวนเพื่อนร่วมกลุ่ม</span>
        </button>
      </div>
    </div>

    <!-- Kanban Board Horizontal Scroll Container -->
    <div class="flex-1 overflow-x-auto overflow-y-hidden p-6 flex items-start gap-5">
      <!-- Columns Rendering -->
      <ColumnItem
        v-for="(column, idx) in currentBoard?.columns || []"
        :key="column.id"
        :column="column"
        :columnIndex="idx"
        @add-task="openAddTask"
        @click-task="handleOpenTaskDetail"
        @update-title="handleUpdateColumnTitle"
        @delete-column="handleDeleteColumn"
        @drop-task="handleDropTask"
      />

      <!-- Add New Column Card -->
      <div class="w-72 sm:w-80 flex-shrink-0">
        <!-- Input Form when open -->
        <div
          v-if="isAddingColumn"
          class="bg-white border border-neutral-900 rounded-[28px] p-4 space-y-2.5 shadow-xl animate-in fade-in"
        >
          <input
            v-model="newColumnTitle"
            type="text"
            @keyup.enter="handleCreateColumn"
            @keyup.esc="isAddingColumn = false"
            placeholder="เช่น ตรวจทาน, ส่งแล้ว..."
            class="w-full px-3 py-2 bg-[#FAF8F5] border border-[#E5E0D5] rounded-xl text-xs text-neutral-900 focus:outline-none focus:border-black"
            autofocus
          />
          <div class="flex items-center gap-2 justify-end">
            <button
              @click="isAddingColumn = false"
              class="px-3 py-1 text-xs text-neutral-500 hover:text-black font-medium"
            >
              ยกเลิก
            </button>
            <button
              @click="handleCreateColumn"
              class="px-4 py-1.5 bg-neutral-900 text-white text-xs font-semibold rounded-full hover:bg-black transition-colors"
            >
              เพิ่มขั้นตอน
            </button>
          </div>
        </div>

        <!-- Add Column Button Trigger -->
        <button
          v-else
          @click="isAddingColumn = true"
          class="w-full py-4 px-4 rounded-[28px] border-2 border-dashed border-[#E0DBD0] hover:border-black hover:bg-white text-neutral-500 hover:text-black text-xs font-bold flex items-center justify-center gap-2 transition-all"
        >
          <Plus class="w-4 h-4 text-black" />
          <span>+ เพิ่มขั้นตอนการบ้าน</span>
        </button>
      </div>
    </div>

    <!-- Quick Add Task Modal -->
    <div
      v-if="isAddTaskModalOpen"
      @click.self="isAddTaskModalOpen = false"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in"
    >
      <div class="bg-white border border-[#E5E0D5] rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
        <h3 class="font-display font-bold text-neutral-900 text-sm flex items-center gap-2">
          <ListTodo class="w-4 h-4 text-amber-600" />
          เพิ่มการบ้าน / งานที่ต้องส่ง (New Assignment)
        </h3>

        <div>
          <label class="block text-xs font-semibold text-neutral-600 mb-1">ชื่อการบ้าน / หัวข้องาน *</label>
          <input
            v-model="newTaskTitle"
            type="text"
            placeholder="เช่น แบบฝึกหัดบทที่ 3, เขียนสรุปรายงาน, ทำสไลด์นำเสนอ..."
            class="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E5E0D5] rounded-2xl text-xs text-neutral-900 focus:outline-none focus:border-black"
            autofocus
            @keyup.enter="submitNewTask"
          />
        </div>

        <div>
          <label class="block text-xs font-semibold text-neutral-600 mb-1">รายละเอียดคำสั่ง / หน้าหนังสือ (Optional)</label>
          <textarea
            v-model="newTaskDesc"
            rows="2"
            placeholder="ระบุหน้าที่ทำ คำสั่งอาจารย์ หรือเกณฑ์การให้คะแนน..."
            class="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E5E0D5] rounded-2xl text-xs text-neutral-900 focus:outline-none focus:border-black"
          ></textarea>
        </div>

        <div>
          <label class="block text-xs font-semibold text-neutral-600 mb-1">แท็ก (Tag)</label>
          <input
            v-model="newTaskTag"
            type="text"
            placeholder="เช่น การบ้านด่วน ⚡, งานกลุ่ม 👥, มีรายงาน 📄"
            class="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E5E0D5] rounded-2xl text-xs text-neutral-900 focus:outline-none focus:border-black"
          />
        </div>

        <div class="pt-2 flex items-center justify-end gap-2">
          <button
            @click="isAddTaskModalOpen = false"
            class="px-4 py-2 rounded-full text-xs text-neutral-500 hover:text-black font-medium"
          >
            ยกเลิก
          </button>
          <button
            @click="submitNewTask"
            class="px-5 py-2 rounded-full text-xs font-semibold text-white bg-black hover:bg-neutral-800 transition-colors"
          >
            บันทึกการ์ด
          </button>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <TaskDetailModal
      :isOpen="isTaskDetailModalOpen"
      :task="selectedTask"
      :boardMembers="boardMembersList"
      @close="isTaskDetailModalOpen = false"
      @save="handleSaveTaskDetail"
      @delete="handleDeleteTask"
    />

    <InviteMemberModal
      :isOpen="isInviteModalOpen"
      :board="currentBoard"
      @close="isInviteModalOpen = false"
      @invite="handleInviteMember"
    />

    <EditBoardModal
      :isOpen="isEditBoardModalOpen"
      :board="currentBoard"
      @close="isEditBoardModalOpen = false"
      @submit="(data) => { if (currentBoard) boardStore.updateBoard(currentBoard.id, data); isEditBoardModalOpen = false; }"
      @delete="(id) => { boardStore.deleteBoard(id); router.push('/dashboard'); }"
    />
  </div>
</template>
