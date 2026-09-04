<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { X, Save, Trash2 } from 'lucide-vue-next'
import { Board } from '../../types'

const props = defineProps<{
  isOpen: boolean
  board: Board | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'submit', data: { title: string; description: string }): void
  (e: 'delete', boardId: string): void
}>()

const title = ref('')
const description = ref('')

const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && props.isOpen) {
    emit('close')
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown)
})

watch(
  () => props.board,
  (newBoard) => {
    if (newBoard) {
      title.value = newBoard.title
      description.value = newBoard.description || ''
    }
  },
  { immediate: true }
)

const handleSubmit = () => {
  if (!title.value.trim()) return
  emit('submit', {
    title: title.value.trim(),
    description: description.value.trim()
  })
}

const handleDelete = () => {
  if (!props.board) return
  if (confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบวิชา "${props.board.title}"? (การบ้านทั้งหมดในวิชานี้จะถูกลบไปด้วย)`)) {
    emit('delete', props.board.id)
  }
}
</script>

<template>
  <div
    v-if="isOpen && board"
    @click.self="$emit('close')"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in"
  >
    <div
      class="bg-white border border-[#E5E0D5] rounded-[32px] w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95"
    >
      <!-- Header -->
      <div class="px-7 py-5 border-b border-[#F0ECE1] flex items-center justify-between">
        <h3 class="text-neutral-900 font-display font-bold text-base">แก้ไขข้อมูลวิชา (Edit Subject)</h3>
        <button
          @click="$emit('close')"
          class="p-1 rounded-full text-neutral-400 hover:text-black hover:bg-neutral-100 transition-colors"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="p-7 space-y-4">
        <div>
          <label class="block text-xs font-bold text-neutral-700 mb-1.5">ชื่อวิชา / การบ้าน</label>
          <input
            v-model="title"
            type="text"
            required
            class="w-full px-4 py-3 bg-[#FAF8F5] border border-[#E5E0D5] rounded-2xl text-xs sm:text-sm text-neutral-900 focus:outline-none focus:border-black transition-colors"
          />
        </div>

        <div>
          <label class="block text-xs font-bold text-neutral-700 mb-1.5">คำอธิบาย / รหัสวิชา / อาจารย์ผู้สอน</label>
          <textarea
            v-model="description"
            rows="3"
            class="w-full px-4 py-3 bg-[#FAF8F5] border border-[#E5E0D5] rounded-2xl text-xs text-neutral-900 focus:outline-none focus:border-black transition-colors"
          ></textarea>
        </div>

        <!-- Footer Actions -->
        <div class="pt-4 border-t border-[#F0ECE1] flex items-center justify-between">
          <button
            type="button"
            @click="handleDelete"
            class="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <Trash2 class="w-4 h-4" />
            ลบวิชานี้
          </button>

          <div class="flex items-center gap-2">
            <button
              type="button"
              @click="$emit('close')"
              class="px-4 py-2 rounded-full text-xs font-semibold text-neutral-500 hover:text-black hover:bg-neutral-100 transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              class="flex items-center gap-1.5 px-6 py-2 rounded-full text-xs font-bold text-white bg-black hover:bg-neutral-800 transition-all shadow-sm"
            >
              <Save class="w-4 h-4" />
              บันทึก
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>
