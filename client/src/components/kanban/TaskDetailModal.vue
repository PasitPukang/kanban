<script setup lang="ts">
import { ref, watch } from 'vue'
import {
  X,
  Trash2,
  Calendar,
  Tag as TagIcon,
  Users,
  Check,
  Save,
  Plus
} from 'lucide-vue-next'
import { Task, User } from '../../types'
import { useAuthStore } from '../../stores/auth'

const props = defineProps<{
  isOpen: boolean
  task: Task | null
  boardMembers: User[]
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save', taskData: {
    title: string
    description: string
    tags: string[]
    due_date: string | null
    assignees: User[]
  }): void
  (e: 'delete', taskId: string): void
}>()

const authStore = useAuthStore()

const title = ref('')
const description = ref('')
const tags = ref<string[]>([])
const newTagInput = ref('')
const dueDate = ref('')
const selectedAssignees = ref<User[]>([])

const PRESET_TAGS = ['UI', 'Design', 'Feature', 'Bug', 'Urgent', 'DevOps', 'Backend']

watch(
  () => props.task,
  (newTask) => {
    if (newTask) {
      title.value = newTask.title
      description.value = newTask.description || ''
      tags.value = [...(newTask.tags || [])]
      dueDate.value = newTask.due_date ? newTask.due_date.split('T')[0] : ''
      selectedAssignees.value = [...(newTask.assignees || [])]
    }
  },
  { immediate: true }
)

const addTag = (tagToAdd?: string) => {
  const val = (tagToAdd || newTagInput.value).trim()
  if (val && !tags.value.includes(val)) {
    tags.value.push(val)
  }
  newTagInput.value = ''
}

const removeTag = (tagToRemove: string) => {
  tags.value = tags.value.filter((t) => t !== tagToRemove)
}

const toggleAssignee = (user: User) => {
  const idx = selectedAssignees.value.findIndex((u) => u.id === user.id)
  if (idx !== -1) {
    selectedAssignees.value.splice(idx, 1)
  } else {
    selectedAssignees.value.push(user)
  }
}

const isAssigneeSelected = (userId: string) => {
  return selectedAssignees.value.some((u) => u.id === userId)
}

const handleSave = () => {
  if (!title.value.trim()) return
  emit('save', {
    title: title.value.trim(),
    description: description.value.trim(),
    tags: tags.value,
    due_date: dueDate.value || null,
    assignees: selectedAssignees.value
  })
}

const handleDelete = () => {
  if (!props.task) return
  if (confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบการ์ดงาน "${props.task.title}"?`)) {
    emit('delete', props.task.id)
  }
}
</script>

<template>
  <div
    v-if="isOpen && task"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in"
  >
    <div
      class="bg-white border border-[#E5E0D5] rounded-[36px] w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in-95 flex flex-col max-h-[90vh]"
    >
      <!-- Modal Header -->
      <div class="px-7 py-5 border-b border-[#F0ECE1] flex items-center justify-between">
        <span class="text-xs font-mono font-bold text-neutral-400 uppercase tracking-wider">รายละเอียดงาน (Task Details)</span>
        <button
          @click="$emit('close')"
          class="p-1 rounded-full text-neutral-400 hover:text-black hover:bg-neutral-100 transition-colors"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Scrollable Body -->
      <div class="p-7 overflow-y-auto space-y-6 flex-1">
        <!-- Title Input -->
        <div>
          <label class="block text-xs font-bold text-neutral-700 mb-1.5">ชื่องาน</label>
          <input
            v-model="title"
            type="text"
            required
            class="w-full px-4 py-3 bg-[#FAF8F5] border border-[#E5E0D5] rounded-2xl text-sm font-bold text-neutral-900 focus:outline-none focus:border-black transition-colors"
          />
        </div>

        <!-- Description Textarea -->
        <div>
          <label class="block text-xs font-bold text-neutral-700 mb-1.5">คำอธิบายงาน (Description)</label>
          <textarea
            v-model="description"
            rows="3"
            placeholder="เพิ่มรายละเอียดของงานหรือขั้นตอนการทำงาน..."
            class="w-full px-4 py-3 bg-[#FAF8F5] border border-[#E5E0D5] rounded-2xl text-xs text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-black transition-colors leading-relaxed"
          ></textarea>
        </div>

        <!-- Tags Management (Bonus 5b) -->
        <div>
          <label class="block text-xs font-bold text-neutral-700 mb-1.5 flex items-center gap-1.5">
            <TagIcon class="w-3.5 h-3.5 text-neutral-900" />
            แท็กหมวดหมู่งาน (Tags)
          </label>

          <!-- Selected Tags -->
          <div class="flex flex-wrap gap-2 mb-3">
            <span
              v-for="tag in tags"
              :key="tag"
              class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FAF8F5] border border-[#E5E0D5] text-neutral-800 shadow-2xs"
            >
              {{ tag }}
              <button @click="removeTag(tag)" class="text-neutral-400 hover:text-rose-500">
                <X class="w-3 h-3" />
              </button>
            </span>
            <span v-if="tags.length === 0" class="text-xs text-neutral-400 italic">ยังไม่มีแท็ก</span>
          </div>

          <!-- Add Tag Input & Presets -->
          <div class="flex items-center gap-2 mb-2.5">
            <input
              v-model="newTagInput"
              type="text"
              @keyup.enter="addTag()"
              placeholder="พิมพ์แท็กใหม่แล้วกด Enter..."
              class="flex-1 px-3.5 py-2 bg-[#FAF8F5] border border-[#E5E0D5] rounded-full text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-black"
            />
            <button
              type="button"
              @click="addTag()"
              class="px-4 py-2 bg-neutral-900 hover:bg-black text-white rounded-full text-xs font-bold transition-colors"
            >
              + เพิ่ม
            </button>
          </div>

          <!-- Preset Quick Pick -->
          <div class="flex flex-wrap items-center gap-1.5">
            <span class="text-[10px] text-neutral-400 font-bold uppercase mr-1">แท็กแนะนำ:</span>
            <button
              v-for="preset in PRESET_TAGS"
              :key="preset"
              type="button"
              @click="addTag(preset)"
              class="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-white hover:bg-neutral-100 text-neutral-700 border border-[#E5E0D5] transition-colors"
            >
              + {{ preset }}
            </button>
          </div>
        </div>

        <!-- Assignees Multi-Select (Requirement 6 & Bonus 6a) -->
        <div>
          <label class="block text-xs font-bold text-neutral-700 mb-1.5 flex items-center gap-1.5">
            <Users class="w-3.5 h-3.5 text-neutral-900" />
            ผู้รับผิดชอบงาน (Assignees)
          </label>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div
              v-for="user in (boardMembers.length > 0 ? boardMembers : authStore.users)"
              :key="user.id"
              @click="toggleAssignee(user)"
              :class="[
                'p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between',
                isAssigneeSelected(user.id)
                  ? 'bg-neutral-900 border-neutral-900 text-white shadow-sm'
                  : 'bg-[#FAF8F5] border-[#E5E0D5] text-neutral-800 hover:bg-[#F3EFE7]'
              ]"
            >
              <div class="flex items-center gap-2.5 min-w-0">
                <img :src="user.avatar_url || ''" class="w-7 h-7 rounded-full object-cover ring-1 ring-white" />
                <span class="text-xs truncate font-bold">{{ user.name }}</span>
              </div>
              <Check v-if="isAssigneeSelected(user.id)" class="w-4 h-4 text-white flex-shrink-0" />
            </div>
          </div>
        </div>

        <!-- Due Date -->
        <div>
          <label class="block text-xs font-bold text-neutral-700 mb-1.5 flex items-center gap-1.5">
            <Calendar class="w-3.5 h-3.5 text-neutral-900" />
            กำหนดส่ง (Due Date)
          </label>
          <input
            v-model="dueDate"
            type="date"
            class="px-4 py-2 bg-[#FAF8F5] border border-[#E5E0D5] rounded-full text-xs text-neutral-900 focus:outline-none focus:border-black font-mono font-medium"
          />
        </div>
      </div>

      <!-- Footer Actions -->
      <div class="p-5 px-7 border-t border-[#F0ECE1] flex items-center justify-between bg-[#FAF8F5]">
        <button
          type="button"
          @click="handleDelete"
          class="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
        >
          <Trash2 class="w-4 h-4" />
          ลบการ์ดนี้
        </button>

        <div class="flex items-center gap-2.5">
          <button
            type="button"
            @click="$emit('close')"
            class="px-5 py-2.5 rounded-full text-xs font-semibold text-neutral-500 hover:text-black hover:bg-neutral-200 transition-colors"
          >
            ยกเลิก
          </button>
          <button
            type="button"
            @click="handleSave"
            class="flex items-center gap-1.5 px-6 py-2.5 rounded-full text-xs font-bold text-white bg-black hover:bg-neutral-800 transition-all shadow-sm hover:scale-105 active:scale-95"
          >
            <Save class="w-4 h-4" />
            บันทึกการเปลี่ยนแปลง
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
