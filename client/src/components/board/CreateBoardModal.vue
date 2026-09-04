<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { X, Plus, Sparkles } from 'lucide-vue-next'

const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'submit', data: { title: string; description: string }): void
}>()

const title = ref('')
const description = ref('')
const error = ref('')

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

const handleSubmit = () => {
  if (!title.value.trim()) {
    error.value = 'กรุณาระบุชื่อกระดาน (Board Title)'
    return
  }
  emit('submit', {
    title: title.value.trim(),
    description: description.value.trim()
  })
  title.value = ''
  description.value = ''
  error.value = ''
}
</script>

<template>
  <div
    v-if="isOpen"
    @click.self="$emit('close')"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in"
  >
    <div
      class="bg-white border border-[#E5E0D5] rounded-[32px] w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95"
    >
      <!-- Header -->
      <div class="px-7 py-5 border-b border-[#F0ECE1] flex items-center justify-between">
        <div class="flex items-center gap-2 text-neutral-900 font-display font-bold text-base">
          <Sparkles class="w-4 h-4 text-amber-500" />
          <span>สร้างสมุดวิชา / การบ้านใหม่</span>
        </div>
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
          <label class="block text-xs font-bold text-neutral-700 mb-1.5">
            ชื่อวิชา / การบ้าน <span class="text-rose-500">*</span>
          </label>
          <input
            v-model="title"
            type="text"
            placeholder="เช่น คณิตศาสตร์ ม.ปลาย, โครงงานวิทยาศาสตร์, ภาษาอังกฤษเพื่อการสื่อสาร"
            class="w-full px-4 py-3 bg-[#FAF8F5] border border-[#E5E0D5] rounded-2xl text-xs sm:text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-black transition-colors"
            autofocus
          />
          <p v-if="error" class="text-xs text-rose-500 mt-1">{{ error }}</p>
        </div>

        <div>
          <label class="block text-xs font-bold text-neutral-700 mb-1.5">
            คำอธิบาย / รหัสวิชา / ครูผู้สอน (Optional)
          </label>
          <textarea
            v-model="description"
            rows="3"
            placeholder="เช่น รหัสวิชา ว30201 ครูผู้สอน อ.สมชาย หรือเป้าหมายคะแนนเก็บ..."
            class="w-full px-4 py-3 bg-[#FAF8F5] border border-[#E5E0D5] rounded-2xl text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-black transition-colors"
          ></textarea>
        </div>

        <div class="bg-[#FEF0DC]/80 border border-[#FBE0B8] rounded-2xl p-3.5 text-xs text-[#8A5617] flex items-center gap-2">
          <span>💡 ระบบจะสร้าง 3 ขั้นตอนการบ้านให้ทันที: <strong>การบ้านที่ได้รับ</strong>, <strong>กำลังทำ</strong>, <strong>ตรวจทาน/ส่งแล้ว</strong></span>
        </div>

        <!-- Footer Actions -->
        <div class="pt-3 flex items-center justify-end gap-2.5">
          <button
            type="button"
            @click="$emit('close')"
            class="px-5 py-2.5 rounded-full text-xs font-semibold text-neutral-500 hover:text-black hover:bg-neutral-100 transition-colors"
          >
            ยกเลิก
          </button>
          <button
            type="submit"
            class="flex items-center gap-1.5 px-6 py-2.5 rounded-full text-xs font-bold text-white bg-neutral-900 hover:bg-black transition-all shadow-sm hover:scale-102 active:scale-98"
          >
            <Plus class="w-4 h-4" />
            + สร้างสมุดการบ้าน
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
