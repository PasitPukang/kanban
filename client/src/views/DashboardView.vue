<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  Plus,
  Kanban,
  LayoutGrid,
  Laptop,
  Video,
  Briefcase,
  Box,
  Star,
  Settings2,
  Sparkles,
  ArrowUpRight,
  Search
} from 'lucide-vue-next'
import { useBoardStore } from '../stores/board'
import { useAuthStore } from '../stores/auth'
import { Board } from '../types'
import CreateBoardModal from '../components/board/CreateBoardModal.vue'
import EditBoardModal from '../components/board/EditBoardModal.vue'

const router = useRouter()
const boardStore = useBoardStore()
const authStore = useAuthStore()

const activeCategory = ref('All')
const searchQuery = ref('')
const isCreateModalOpen = ref(false)
const isEditModalOpen = ref(false)
const selectedBoard = ref<Board | null>(null)

onMounted(() => {
  boardStore.fetchBoards()
})

// Pastel Palette Array matching reference image
const cardThemes = [
  {
    bg: 'bg-[#FCE7E7]',
    border: 'border-[#F7CACA]',
    text: 'text-[#1E1E1E]',
    tagBg: 'bg-white/80',
    tagText: 'text-[#852C2C]',
    category: 'IT & Software',
    icon: Laptop,
    rating: '4.8'
  },
  {
    bg: 'bg-[#FEF0DC]',
    border: 'border-[#FBE0B8]',
    text: 'text-[#1E1E1E]',
    tagBg: 'bg-white/80',
    tagText: 'text-[#8A5617]',
    category: 'Business',
    icon: Briefcase,
    rating: '4.9'
  },
  {
    bg: 'bg-[#E6EAFF]',
    border: 'border-[#CAD2FD]',
    text: 'text-[#1E1E1E]',
    tagBg: 'bg-white/80',
    tagText: 'text-[#2D3E8D]',
    category: 'Development',
    icon: Video,
    rating: '4.9'
  },
  {
    bg: 'bg-[#DFF6EC]',
    border: 'border-[#B6EAD5]',
    text: 'text-[#1E1E1E]',
    tagBg: 'bg-white/80',
    tagText: 'text-[#1E734B]',
    category: 'Architecture',
    icon: Box,
    rating: '5.0'
  }
]

const getThemeForIndex = (index: number) => {
  return cardThemes[index % cardThemes.length]
}

const categories = [
  { name: 'All', icon: LayoutGrid },
  { name: 'IT & Software', icon: Laptop },
  { name: 'Media & Design', icon: Video },
  { name: 'Business', icon: Briefcase },
  { name: 'Interior & Systems', icon: Box }
]

const filteredBoards = computed(() => {
  let list = boardStore.boards
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

const countTotalTasks = (board: Board) => {
  if (!board.columns) return 0
  return board.columns.reduce((total, col) => total + (col.tasks?.length || 0), 0)
}
</script>

<template>
  <div class="space-y-8 max-w-6xl mx-auto">
    <!-- Hero Title matching reference "Invest in your education" -->
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 pt-2">
      <div>
        <h1 class="font-display font-extrabold text-4xl sm:text-5xl text-neutral-950 tracking-tight leading-[1.1]">
          Invest in your<br />productivity
        </h1>
        <p class="text-xs sm:text-sm text-neutral-500 mt-2 font-medium">
          ระบบจัดการงาน Kanban Board ประสิทธิภาพสูง ออกแบบอย่างประณีตสำหรับ Clicknext Assessment
        </p>
      </div>

      <!-- Action Button -->
      <button
        @click="isCreateModalOpen = true"
        class="flex items-center gap-2 px-6 py-3.5 rounded-full bg-black text-white hover:bg-neutral-800 text-xs sm:text-sm font-semibold shadow-md hover:scale-105 active:scale-95 transition-all flex-shrink-0"
      >
        <Plus class="w-4 h-4" />
        สร้างกระดานใหม่
      </button>
    </div>

    <!-- Category Pill Filter Bar (Identical to reference image) -->
    <div class="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
      <button
        v-for="cat in categories"
        :key="cat.name"
        @click="activeCategory = cat.name"
        :class="[
          'flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 border',
          activeCategory === cat.name
            ? 'bg-black text-white border-black shadow-sm'
            : 'bg-white/80 hover:bg-white text-neutral-700 border-[#E5E0D5] hover:border-neutral-300'
        ]"
      >
        <component :is="cat.icon" class="w-4 h-4" />
        <span>{{ cat.name }}</span>
      </button>
    </div>

    <!-- Section Title: "Most popular" -->
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <h3 class="font-display font-bold text-sm text-neutral-500 uppercase tracking-wider">
          Most popular boards ({{ filteredBoards.length }})
        </h3>
        
        <!-- Search bar inline -->
        <div class="relative w-64 hidden sm:block">
          <Search class="w-3.5 h-3.5 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="ค้นหากระดาน..."
            class="w-full pl-9 pr-3 py-1.5 bg-white border border-[#E5E0D5] rounded-full text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-black"
          />
        </div>
      </div>

      <!-- Bento Cards Grid (Pastel Palette from Reference Image) -->
      <div v-if="filteredBoards.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div
          v-for="(board, idx) in filteredBoards"
          :key="board.id"
          @click="router.push(`/board/${board.id}`)"
          :class="[
            'group relative rounded-[32px] p-6 sm:p-7 border transition-all duration-300 cursor-pointer flex flex-col justify-between min-h-[220px] shadow-sm hover:shadow-xl hover:-translate-y-1',
            getThemeForIndex(idx).bg,
            getThemeForIndex(idx).border
          ]"
        >
          <!-- Top Row: Category Pill Tag & Star Rating / Settings -->
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

            <div class="flex items-center gap-2">
              <!-- Rating Pill (like reference) -->
              <div class="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/90 text-neutral-800 text-[11px] font-bold shadow-2xs">
                <Star class="w-3 h-3 fill-amber-400 text-amber-400" />
                <span>{{ getThemeForIndex(idx).rating }}</span>
              </div>

              <!-- Settings gear -->
              <button
                @click="handleOpenEdit($event, board)"
                class="p-1 rounded-full hover:bg-black/10 text-neutral-600 transition-colors"
                title="ตั้งค่ากระดาน"
              >
                <Settings2 class="w-4 h-4" />
              </button>
            </div>
          </div>

          <!-- Middle: Large Bold Title & Description -->
          <div class="my-4">
            <h4 class="font-display font-bold text-xl sm:text-2xl text-neutral-900 group-hover:underline tracking-tight leading-snug">
              {{ board.title }}
            </h4>
            <p class="text-xs text-neutral-600 mt-1 line-clamp-2 leading-relaxed">
              {{ board.description || 'Sprint task tracker and collaborative workspace' }}
            </p>
          </div>

          <!-- Bottom Row: Task Count and Team Avatars (as in reference) -->
          <div class="pt-3 border-t border-black/5 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <span class="text-xs font-semibold text-neutral-600 font-mono">
                {{ countTotalTasks(board) }} tasks
              </span>
              <span class="text-neutral-300">•</span>
              <span class="text-xs text-neutral-500 font-medium">
                {{ board.columns?.length || 3 }} columns
              </span>
            </div>

            <!-- Team Avatars Grouped on Bottom Right -->
            <div class="flex items-center -space-x-2">
              <img
                v-for="u in authStore.users.slice(0, 3)"
                :key="u.id"
                :src="u.avatar_url || ''"
                :title="u.name"
                class="w-7 h-7 rounded-full ring-2 ring-white object-cover shadow-2xs"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div
        v-else
        class="py-16 text-center bg-white border border-[#E5E0D5] rounded-[36px] p-8 flex flex-col items-center justify-center shadow-soft"
      >
        <div class="w-16 h-16 rounded-3xl bg-[#FEF0DC] flex items-center justify-center text-[#8A5617] mb-4">
          <Kanban class="w-8 h-8" />
        </div>
        <h3 class="font-display font-bold text-lg text-neutral-900 mb-1">ยังไม่มีกระดานในระบบ</h3>
        <p class="text-xs text-neutral-500 max-w-sm mb-5">
          เริ่มต้นสร้างกระดาน Kanban แรกเพื่อเริ่มจัดการโปรเจกต์งาน
        </p>
        <button
          @click="isCreateModalOpen = true"
          class="flex items-center gap-2 px-5 py-2.5 rounded-full bg-black text-white text-xs font-semibold hover:bg-neutral-800 transition-colors shadow-sm"
        >
          <Plus class="w-4 h-4" />
          สร้างกระดานแรก
        </button>
      </div>
    </div>

    <!-- Modals -->
    <CreateBoardModal
      :isOpen="isCreateModalOpen"
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
