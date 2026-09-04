<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  Plus,
  BookOpen,
  GraduationCap,
  LayoutGrid,
  Compass,
  Code2,
  Users,
  Palette,
  Settings2,
  Search,
  CheckCircle2,
  Clock,
  ListTodo,
  ArrowRight
} from 'lucide-vue-next'
import { useBoardStore } from '../stores/board'
import { useAuthStore } from '../stores/auth'
import { Board } from '../types'
import CreateBoardModal from '../components/board/CreateBoardModal.vue'
import EditBoardModal from '../components/board/EditBoardModal.vue'

const router = useRouter()
const boardStore = useBoardStore()
const authStore = useAuthStore()

const activeCategory = ref('ทั้งหมด')
const searchQuery = ref('')
const isCreateModalOpen = ref(false)
const isEditModalOpen = ref(false)
const selectedBoard = ref<Board | null>(null)

onMounted(() => {
  boardStore.fetchBoards()
})

// Palette & Category Theme for Subjects & Homework Boards
const homeworkThemes = [
  {
    bg: 'bg-[#EBF1FF]',
    border: 'border-[#D4E2FF]',
    text: 'text-[#1E293B]',
    tagBg: 'bg-white/90',
    tagText: 'text-[#2563EB]',
    category: 'คณิตศาสตร์ & วิทย์',
    icon: Compass,
    progressColor: 'bg-blue-600'
  },
  {
    bg: 'bg-[#FEF6E9]',
    border: 'border-[#FDE3B8]',
    text: 'text-[#1E293B]',
    tagBg: 'bg-white/90',
    tagText: 'text-[#D97706]',
    category: 'ภาษา & สังคม',
    icon: BookOpen,
    progressColor: 'bg-amber-600'
  },
  {
    bg: 'bg-[#EAFBF3]',
    border: 'border-[#C1F2DC]',
    text: 'text-[#1E293B]',
    tagBg: 'bg-white/90',
    tagText: 'text-[#059669]',
    category: 'เทคโนโลยี & โค้ดดิ้ง',
    icon: Code2,
    progressColor: 'bg-emerald-600'
  },
  {
    bg: 'bg-[#FBEBF6]',
    border: 'border-[#F5CAEB]',
    text: 'text-[#1E293B]',
    tagBg: 'bg-white/90',
    tagText: 'text-[#C026D3]',
    category: 'โครงงาน & งานกลุ่ม',
    icon: Users,
    progressColor: 'bg-purple-600'
  },
  {
    bg: 'bg-[#FFF0ED]',
    border: 'border-[#FFD2C8]',
    text: 'text-[#1E293B]',
    tagBg: 'bg-white/90',
    tagText: 'text-[#E11D48]',
    category: 'ศิลปะ & ทั่วไป',
    icon: Palette,
    progressColor: 'bg-rose-600'
  }
]

const getThemeForIndex = (index: number) => {
  return homeworkThemes[index % homeworkThemes.length]
}

const categories = [
  { name: 'ทั้งหมด', icon: LayoutGrid },
  { name: 'คณิตศาสตร์ & วิทย์', icon: Compass },
  { name: 'ภาษา & สังคม', icon: BookOpen },
  { name: 'เทคโนโลยี & โค้ดดิ้ง', icon: Code2 },
  { name: 'โครงงาน & งานกลุ่ม', icon: Users },
  { name: 'ศิลปะ & ทั่วไป', icon: Palette }
]

// คำนวณสถิติการบ้านจริงในแต่ละบอร์ด
const getBoardStats = (board: Board) => {
  if (!board.columns || board.columns.length === 0) {
    return { total: 0, completed: 0, inProgress: 0, pending: 0, percent: 0 }
  }
  let total = 0
  let completed = 0
  let inProgress = 0
  let pending = 0

  board.columns.forEach((col, idx) => {
    const count = col.tasks?.length || 0
    total += count
    const t = col.title.toLowerCase()
    if (t.includes('done') || t.includes('เสร็จ') || t.includes('ส่ง') || idx === board.columns!.length - 1) {
      completed += count
    } else if (t.includes('progress') || t.includes('ทำ') || t.includes('ตรวจ') || idx === 1) {
      inProgress += count
    } else {
      pending += count
    }
  })

  const percent = total > 0 ? Math.round((completed / total) * 100) : 0
  return { total, completed, inProgress, pending, percent }
}

// สถิติรวมทั้งระบบ
const overallStats = computed(() => {
  let totalTasks = 0
  let completedTasks = 0
  let pendingTasks = 0

  boardStore.boards.forEach((b) => {
    const s = getBoardStats(b)
    totalTasks += s.total
    completedTasks += s.completed
    pendingTasks += (s.pending + s.inProgress)
  })

  return {
    totalBoards: boardStore.boards.length,
    totalTasks,
    completedTasks,
    pendingTasks
  }
})

const filteredBoards = computed(() => {
  let list = boardStore.boards

  if (activeCategory.value !== 'ทั้งหมด') {
    list = list.filter((b, idx) => {
      const theme = getThemeForIndex(idx)
      return theme.category === activeCategory.value
    })
  }

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(
      (b) => b.title.toLowerCase().includes(q) || (b.description && b.description.toLowerCase().includes(q))
    )
  }
  return list
})

const handleCreateBoard = async (data: { title: string; description: string }) => {
  const newBoard = await boardStore.createBoard(data.title, data.description)
  isCreateModalOpen.value = false
  if (newBoard) {
    router.push(`/board/${newBoard.id}`)
  }
}

const handleOpenEdit = (event: Event, board: Board) => {
  event.stopPropagation()
  selectedBoard.value = board
  isEditModalOpen.value = true
}

const handleUpdateBoard = async (data: { title: string; description: string }) => {
  if (selectedBoard.value) {
    await boardStore.updateBoard(selectedBoard.value.id, data)
  }
  isEditModalOpen.value = false
  selectedBoard.value = null
}

const handleDeleteBoard = async (boardId: string) => {
  await boardStore.deleteBoard(boardId)
  isEditModalOpen.value = false
  selectedBoard.value = null
}
</script>

<template>
  <div class="space-y-8 max-w-6xl mx-auto pb-10">
    <!-- Hero Header: Homework & Study Hub -->
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 pt-2">
      <div class="space-y-2">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100/80 border border-amber-200 text-amber-900 text-xs font-bold shadow-2xs">
          <GraduationCap class="w-3.5 h-3.5 text-amber-700" />
          <span>Clicknext Homework & Study Hub</span>
        </div>
        <h1 class="font-display font-extrabold text-3xl sm:text-4xl text-neutral-900 tracking-tight leading-tight">
          สมุดการบ้าน & งานที่ต้องส่ง
        </h1>
        <p class="text-xs sm:text-sm text-neutral-600 font-medium max-w-xl leading-relaxed">
          จัดตารางการบ้าน วางแผนทำรายงาน โครงงานกลุ่ม และติดตามกำหนดส่งแต่ละวิชาอย่างมีประสิทธิภาพ
        </p>
      </div>

      <!-- Action Button -->
      <button
        @click="isCreateModalOpen = true"
        class="flex items-center gap-2 px-5 py-3 rounded-full bg-neutral-900 hover:bg-black text-white text-xs sm:text-sm font-semibold shadow-md hover:scale-102 active:scale-98 transition-all flex-shrink-0 cursor-pointer"
      >
        <Plus class="w-4 h-4" />
        <span>+ เพิ่มวิชา / การบ้านใหม่</span>
      </button>
    </div>

    <!-- Quick Homework Stats Bar -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3.5 sm:gap-4">
      <div class="bg-white/90 border border-[#E8E4D9] rounded-2xl p-4 shadow-2xs">
        <div class="flex items-center justify-between text-neutral-500 mb-1">
          <span class="text-xs font-semibold">รายวิชาทั้งหมด</span>
          <BookOpen class="w-4 h-4 text-neutral-400" />
        </div>
        <div class="font-display font-bold text-2xl text-neutral-900">
          {{ overallStats.totalBoards }}
          <span class="text-xs font-normal text-neutral-500">วิชา</span>
        </div>
      </div>

      <div class="bg-white/90 border border-[#E8E4D9] rounded-2xl p-4 shadow-2xs">
        <div class="flex items-center justify-between text-neutral-500 mb-1">
          <span class="text-xs font-semibold">การบ้านทั้งหมด</span>
          <ListTodo class="w-4 h-4 text-blue-500" />
        </div>
        <div class="font-display font-bold text-2xl text-blue-700">
          {{ overallStats.totalTasks }}
          <span class="text-xs font-normal text-neutral-500">ชิ้นงาน</span>
        </div>
      </div>

      <div class="bg-white/90 border border-[#E8E4D9] rounded-2xl p-4 shadow-2xs">
        <div class="flex items-center justify-between text-neutral-500 mb-1">
          <span class="text-xs font-semibold">รอทำ / กำลังทำ</span>
          <Clock class="w-4 h-4 text-amber-500" />
        </div>
        <div class="font-display font-bold text-2xl text-amber-700">
          {{ overallStats.pendingTasks }}
          <span class="text-xs font-normal text-neutral-500">ชิ้น</span>
        </div>
      </div>

      <div class="bg-white/90 border border-[#E8E4D9] rounded-2xl p-4 shadow-2xs">
        <div class="flex items-center justify-between text-neutral-500 mb-1">
          <span class="text-xs font-semibold">ส่งแล้วสำเร็จ</span>
          <CheckCircle2 class="w-4 h-4 text-emerald-500" />
        </div>
        <div class="font-display font-bold text-2xl text-emerald-700">
          {{ overallStats.completedTasks }}
          <span class="text-xs font-normal text-neutral-500">ชิ้น</span>
        </div>
      </div>
    </div>

    <!-- Category Pill Filter Bar -->
    <div class="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
      <button
        v-for="cat in categories"
        :key="cat.name"
        @click="activeCategory = cat.name"
        :class="[
          'flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-150 border cursor-pointer',
          activeCategory === cat.name
            ? 'bg-neutral-900 text-white border-neutral-900 shadow-2xs'
            : 'bg-white/80 hover:bg-white text-neutral-700 border-[#E8E4D9] hover:border-neutral-400'
        ]"
      >
        <component :is="cat.icon" class="w-3.5 h-3.5" />
        <span>{{ cat.name }}</span>
      </button>
    </div>

    <!-- Section Title: Homework Subjects List & Search -->
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <h3 class="font-display font-bold text-xs uppercase tracking-wider text-neutral-500">
          กระดานการบ้านของฉัน ({{ filteredBoards.length }} วิชา)
        </h3>

        <!-- Search input -->
        <div class="relative w-64">
          <Search class="w-3.5 h-3.5 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="ค้นหาวิชา หรือการบ้าน..."
            class="w-full pl-9 pr-3 py-1.5 bg-white border border-[#E5E0D5] rounded-full text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-neutral-900 transition-colors"
          />
        </div>
      </div>

      <!-- Homework Board Cards Grid -->
      <div v-if="filteredBoards.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div
          v-for="(board, idx) in filteredBoards"
          :key="board.id"
          @click="router.push(`/board/${board.id}`)"
          :class="[
            'group relative rounded-[28px] p-6 border transition-all duration-200 cursor-pointer flex flex-col justify-between min-h-[220px] shadow-2xs hover:shadow-md hover:-translate-y-0.5',
            getThemeForIndex(idx).bg,
            getThemeForIndex(idx).border
          ]"
        >
          <!-- Top Row: Subject Tag & Status / Action -->
          <div class="flex items-center justify-between gap-2">
            <div
              :class="[
                'flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold shadow-2xs',
                getThemeForIndex(idx).tagBg,
                getThemeForIndex(idx).tagText
              ]"
            >
              <component :is="getThemeForIndex(idx).icon" class="w-3.5 h-3.5" />
              <span>{{ getThemeForIndex(idx).category }}</span>
            </div>

            <div class="flex items-center gap-1.5">
              <!-- Homework completion badge -->
              <span
                class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white/90 text-neutral-800 shadow-2xs font-mono"
              >
                {{ getBoardStats(board).percent }}% เสร็จแล้ว
              </span>

              <!-- Settings menu button -->
              <button
                @click="handleOpenEdit($event, board)"
                class="p-1.5 rounded-full hover:bg-black/10 text-neutral-600 transition-colors"
                title="แก้ไขข้อมูลวิชา"
              >
                <Settings2 class="w-4 h-4" />
              </button>
            </div>
          </div>

          <!-- Middle: Large Board / Subject Title & Homework Details -->
          <div class="my-4">
            <h4 class="font-display font-bold text-xl sm:text-2xl text-neutral-900 group-hover:text-blue-900 tracking-tight leading-snug flex items-center gap-2">
              <span>{{ board.title }}</span>
              <ArrowRight class="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-blue-600 -translate-x-1 group-hover:translate-x-0" />
            </h4>
            <p class="text-xs text-neutral-600 mt-1 line-clamp-2 leading-relaxed">
              {{ board.description || 'กระดานติดตามการบ้าน รายงาน และความคืบหน้าของวิชานี้' }}
            </p>

            <!-- Real Homework Progress Bar -->
            <div class="mt-3.5 space-y-1.5">
              <div class="w-full h-2 bg-black/10 rounded-full overflow-hidden">
                <div
                  :class="['h-full rounded-full transition-all duration-300', getThemeForIndex(idx).progressColor]"
                  :style="{ width: `${getBoardStats(board).percent}%` }"
                ></div>
              </div>
              <div class="flex items-center justify-between text-[11px] text-neutral-600 font-medium">
                <span>รอทำ: {{ getBoardStats(board).pending }} งาน</span>
                <span>กำลังทำ: {{ getBoardStats(board).inProgress }} งาน</span>
                <span class="text-emerald-700 font-bold">ส่งแล้ว: {{ getBoardStats(board).completed }} งาน</span>
              </div>
            </div>
          </div>

          <!-- Bottom Row: Total Tasks & Study Group Members -->
          <div class="pt-3 border-t border-black/5 flex items-center justify-between text-xs text-neutral-600">
            <div class="flex items-center gap-2 font-mono">
              <span class="font-bold text-neutral-800">{{ getBoardStats(board).total }}</span> การบ้านทั้งหมด
              <span class="text-neutral-300">•</span>
              <span>{{ board.columns?.length || 3 }} ขั้นตอน</span>
            </div>

            <!-- Team / Classmates Avatars -->
            <div class="flex items-center -space-x-1.5">
              <img
                v-for="u in authStore.users.slice(0, 3)"
                :key="u.id"
                :src="u.avatar_url || ''"
                :title="u.name"
                class="w-6 h-6 rounded-full ring-2 ring-white object-cover shadow-2xs"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State if no boards match -->
      <div
        v-else
        class="text-center py-16 px-4 bg-white/70 border border-dashed border-[#E0DBD0] rounded-3xl space-y-3"
      >
        <div class="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto shadow-2xs">
          <BookOpen class="w-6 h-6" />
        </div>
        <h4 class="font-display font-bold text-base text-neutral-900">ยังไม่พบกระดานการบ้านในหมวดนี้</h4>
        <p class="text-xs text-neutral-500 max-w-sm mx-auto">
          เริ่มต้นสร้างสมุดการบ้านหรือรายวิชาใหม่ เพื่อเริ่มติดตามและบันทึกงานที่ได้รับมอบหมาย
        </p>
        <button
          @click="isCreateModalOpen = true"
          class="px-5 py-2 rounded-full bg-neutral-900 text-white text-xs font-semibold hover:bg-black transition-colors"
        >
          + สร้างสมุดการบ้านใหม่
        </button>
      </div>
    </div>

    <!-- Modals -->
    <CreateBoardModal
      :is-open="isCreateModalOpen"
      @close="isCreateModalOpen = false"
      @submit="handleCreateBoard"
    />

    <EditBoardModal
      :isOpen="isEditModalOpen"
      :board="selectedBoard"
      @close="isEditModalOpen = false"
      @submit="handleUpdateBoard"
      @delete="handleDeleteBoard"
    />
  </div>
</template>
