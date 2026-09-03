<script setup lang="ts">
import { computed } from 'vue'
import { Calendar, GripVertical, User } from 'lucide-vue-next'
import { Task } from '../../types'

const props = defineProps<{
  task: Task
  columnIndex: number
}>()

const emit = defineEmits<{
  (e: 'click', task: Task): void
  (e: 'dragstart', event: DragEvent, task: Task): void
  (e: 'dragend', event: DragEvent): void
}>()

// Pastel Tag Colors matching the reference
const tagStyles: Record<string, string> = {
  UI: 'bg-[#FCE7E7] text-[#852C2C] border-[#F7CACA]',
  Design: 'bg-[#FCE7E7] text-[#852C2C] border-[#F7CACA]',
  Feature: 'bg-[#DFF6EC] text-[#1E734B] border-[#B6EAD5]',
  Bug: 'bg-[#FEF0DC] text-[#8A5617] border-[#FBE0B8]',
  Urgent: 'bg-[#FCE7E7] text-[#9C1C1C] border-[#F7AAAA] font-bold',
  DevOps: 'bg-[#E6EAFF] text-[#2D3E8D] border-[#CAD2FD]',
  Docker: 'bg-[#E6EAFF] text-[#2D3E8D] border-[#CAD2FD]',
  Backend: 'bg-[#E6EAFF] text-[#2D3E8D] border-[#CAD2FD]',
  Postgres: 'bg-[#DFF6EC] text-[#1E734B] border-[#B6EAD5]'
}

const getTagClass = (tag: string) => {
  return tagStyles[tag] || 'bg-[#FAF8F5] text-neutral-700 border-[#EFECE4]'
}

const isOverdue = computed(() => {
  if (!props.task.due_date) return false
  const due = new Date(props.task.due_date)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return due < today
})

const handleDragStart = (e: DragEvent) => {
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', JSON.stringify({
      taskId: props.task.id,
      fromColumnId: props.task.column_id
    }))
  }
  emit('dragstart', e, props.task)
}
</script>

<template>
  <div
    draggable="true"
    @dragstart="handleDragStart"
    @dragend="$emit('dragend', $event)"
    @click="$emit('click', task)"
    class="group relative bg-white hover:bg-[#FAF9F5] border border-[#EAE6DC] hover:border-neutral-400 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer active:cursor-grabbing hover:-translate-y-0.5"
  >
    <!-- Grip Drag Indicator -->
    <div class="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity text-neutral-400 hover:text-neutral-700">
      <GripVertical class="w-4 h-4" />
    </div>

    <!-- Tags Row (Bonus 5b) -->
    <div v-if="task.tags && task.tags.length > 0" class="flex flex-wrap gap-1.5 mb-2.5 pr-5">
      <span
        v-for="tag in task.tags"
        :key="tag"
        :class="['text-[10px] font-semibold px-2.5 py-0.5 rounded-full border', getTagClass(tag)]"
      >
        {{ tag }}
      </span>
    </div>

    <!-- Title -->
    <h4 class="text-xs sm:text-sm font-bold text-neutral-900 leading-snug">
      {{ task.title }}
    </h4>

    <!-- Description Excerpt (if any) -->
    <p v-if="task.description" class="text-xs text-neutral-500 mt-1 line-clamp-2 leading-relaxed">
      {{ task.description }}
    </p>

    <!-- Footer: Due Date & Assignees -->
    <div class="mt-3.5 pt-2.5 border-t border-[#F2EFE9] flex items-center justify-between gap-2">
      <!-- Due Date -->
      <div
        v-if="task.due_date"
        :class="[
          'flex items-center gap-1 text-[11px] font-mono',
          isOverdue ? 'text-rose-600 font-bold' : 'text-neutral-400'
        ]"
      >
        <Calendar class="w-3.5 h-3.5" />
        <span>{{ new Date(task.due_date).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' }) }}</span>
      </div>
      <div v-else></div>

      <!-- Assignees Avatars (Requirement 6) -->
      <div class="flex items-center -space-x-1.5 overflow-hidden">
        <div
          v-for="assignee in task.assignees"
          :key="assignee.id"
          class="relative group/avatar"
          :title="assignee.name"
        >
          <img
            :src="assignee.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + assignee.name"
            :alt="assignee.name"
            class="w-5 h-5 rounded-full ring-2 ring-white object-cover"
          />
        </div>
        <span
          v-if="!task.assignees || task.assignees.length === 0"
          class="text-[10px] text-neutral-400 italic flex items-center gap-0.5"
        >
          <User class="w-3 h-3" />
        </span>
      </div>
    </div>
  </div>
</template>
