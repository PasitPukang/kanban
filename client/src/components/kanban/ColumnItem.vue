<script setup lang="ts">
import { ref } from 'vue'
import { Plus, MoreVertical, Trash2, Edit2, Check, X } from 'lucide-vue-next'
import { Column, Task } from '../../types'
import TaskCard from './TaskCard.vue'

const props = defineProps<{
  column: Column
  columnIndex: number
}>()

const emit = defineEmits<{
  (e: 'add-task', columnId: string): void
  (e: 'click-task', task: Task): void
  (e: 'update-title', columnId: string, newTitle: string): void
  (e: 'delete-column', columnId: string): void
  (e: 'drop-task', taskId: string, targetColumnId: string, newOrder: number): void
}>()

const isEditingTitle = ref(false)
const editedTitle = ref(props.column.title)
const isMenuOpen = ref(false)
const isDragOver = ref(false)

const startEdit = () => {
  editedTitle.value = props.column.title
  isEditingTitle.value = true
  isMenuOpen.value = false
}

const saveTitle = () => {
  if (editedTitle.value.trim() && editedTitle.value.trim() !== props.column.title) {
    emit('update-title', props.column.id, editedTitle.value.trim())
  }
  isEditingTitle.value = false
}

const cancelEdit = () => {
  editedTitle.value = props.column.title
  isEditingTitle.value = false
}

const handleDelete = () => {
  isMenuOpen.value = false
  if (confirm(`คุณต้องการลบคอลัมน์ "${props.column.title}" ใช่หรือไม่?`)) {
    emit('delete-column', props.column.id)
  }
}

// Drag & Drop Handlers
const handleDragOver = (e: DragEvent) => {
  e.preventDefault()
  isDragOver.value = true
}

const handleDragLeave = () => {
  isDragOver.value = false
}

const handleDrop = (e: DragEvent) => {
  e.preventDefault()
  isDragOver.value = false
  const raw = e.dataTransfer?.getData('text/plain')
  if (!raw) return

  try {
    const data = JSON.parse(raw)
    if (data.taskId) {
      const newOrder = props.column.tasks ? props.column.tasks.length : 0
      emit('drop-task', data.taskId, props.column.id, newOrder)
    }
  } catch (err) {
    console.error('Drop parse error:', err)
  }
}
</script>

<template>
  <div
    class="w-72 sm:w-80 flex-shrink-0 flex flex-col max-h-full bg-[#EFECE4]/70 border rounded-[28px] transition-all duration-150"
    :class="[
      isDragOver
        ? 'border-neutral-900 bg-white/90 ring-4 ring-black/5 shadow-md'
        : 'border-[#E5E0D5]'
    ]"
    @dragover="handleDragOver"
    @dragleave="handleDragLeave"
    @drop="handleDrop"
  >
    <!-- Column Header -->
    <div class="p-3.5 px-4 flex items-center justify-between border-b border-[#E5E0D5]/80">
      <div class="flex items-center gap-2 flex-1 min-w-0">
        <!-- Title Editing Mode -->
        <div v-if="isEditingTitle" class="flex items-center gap-1.5 flex-1">
          <input
            v-model="editedTitle"
            type="text"
            @keyup.enter="saveTitle"
            @keyup.esc="cancelEdit"
            class="w-full px-2.5 py-1 bg-white border border-black rounded-xl text-xs text-neutral-900 focus:outline-none"
            autofocus
          />
          <button @click="saveTitle" class="p-1 text-emerald-600 hover:bg-white rounded">
            <Check class="w-3.5 h-3.5" />
          </button>
          <button @click="cancelEdit" class="p-1 text-rose-500 hover:bg-white rounded">
            <X class="w-3.5 h-3.5" />
          </button>
        </div>

        <!-- Normal Title Display -->
        <div v-else class="flex items-center gap-2 flex-1 min-w-0">
          <h3 class="font-display font-extrabold text-neutral-800 text-xs tracking-wider uppercase truncate">
            {{ column.title }}
          </h3>
          <span class="text-[11px] font-mono font-bold text-neutral-600 bg-white px-2 py-0.5 rounded-full border border-[#E5E0D5]">
            {{ column.tasks?.length || 0 }}
          </span>
        </div>
      </div>

      <!-- Column Action Menu -->
      <div class="relative ml-2">
        <button
          @click="isMenuOpen = !isMenuOpen"
          class="p-1 rounded-lg text-neutral-400 hover:text-neutral-800 hover:bg-white/80 transition-colors"
        >
          <MoreVertical class="w-4 h-4" />
        </button>

        <!-- Dropdown -->
        <div
          v-if="isMenuOpen"
          class="absolute right-0 mt-1 w-36 bg-white border border-[#E5E0D5] rounded-2xl shadow-xl z-30 py-1 text-xs"
        >
          <button
            @click="startEdit"
            class="w-full px-3 py-1.5 flex items-center gap-2 text-neutral-700 hover:text-black hover:bg-neutral-50"
          >
            <Edit2 class="w-3.5 h-3.5 text-neutral-600" />
            แก้ไขชื่อ
          </button>
          <button
            @click="handleDelete"
            class="w-full px-3 py-1.5 flex items-center gap-2 text-rose-600 hover:bg-rose-50"
          >
            <Trash2 class="w-3.5 h-3.5" />
            ลบคอลัมน์
          </button>
        </div>
      </div>
    </div>

    <!-- Tasks List (Scrollable Area) -->
    <div class="flex-1 overflow-y-auto p-3 space-y-3 min-h-[140px]">
      <TaskCard
        v-for="task in column.tasks"
        :key="task.id"
        :task="task"
        :columnIndex="columnIndex"
        @click="$emit('click-task', task)"
      />

      <!-- Empty Drop Placeholder -->
      <div
        v-if="!column.tasks || column.tasks.length === 0"
        class="h-24 border-2 border-dashed border-[#E0DBD0] rounded-2xl flex items-center justify-center text-neutral-400 text-xs font-medium"
      >
        <span>ยังไม่มีการบ้าน (ลากมาวางที่นี่)</span>
      </div>
    </div>

    <!-- Add Task Button Footer -->
    <div class="p-3 pt-1 border-t border-[#E5E0D5]/50">
      <button
        @click="$emit('add-task', column.id)"
        class="w-full py-2 px-3 rounded-2xl bg-white/70 hover:bg-white border border-[#E0DBD0] hover:border-neutral-400 text-neutral-600 hover:text-black text-xs font-semibold flex items-center justify-center gap-1.5 transition-all group shadow-2xs"
      >
        <Plus class="w-4 h-4 group-hover:scale-110 transition-transform text-neutral-800" />
        <span>+ เพิ่มการบ้าน</span>
      </button>
    </div>
  </div>
</template>
