<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { UserPlus, Edit2, X } from 'lucide-vue-next'
import { useAuthStore } from '../stores/auth'
import { User } from '../types'
import { isSuperAdminEmail } from '../utils/auth'

const props = defineProps<{
  modelValue: boolean
  user?: User | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'saved'): void
}>()

const authStore = useAuthStore()

const formName = ref('')
const formEmail = ref('')
const formRole = ref<'SUPER_ADMIN' | 'USER'>('USER')
const formPassword = ref('Password@1234')
const formError = ref('')
const isSubmitting = ref(false)

const isEditMode = computed(() => !!props.user)
const isPrimarySuperAdmin = computed(() => isSuperAdminEmail(props.user?.email))

const resetForm = () => {
  if (props.user) {
    formName.value = props.user.name || ''
    formEmail.value = props.user.email || ''
    formRole.value = props.user.role || 'USER'
    formPassword.value = ''
    formError.value = ''
  } else {
    formName.value = ''
    formEmail.value = ''
    formRole.value = 'USER'
    formPassword.value = 'Password@1234'
    formError.value = ''
  }
}

watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal) {
      resetForm()
    }
  }
)

watch(
  () => props.user,
  () => {
    if (props.modelValue) {
      resetForm()
    }
  }
)

const closeModal = () => {
  emit('update:modelValue', false)
}

const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && props.modelValue) {
    closeModal()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown)
})

const handleSubmit = async () => {
  formError.value = ''

  if (!formName.value.trim() || !formEmail.value.trim()) {
    formError.value = 'กรุณากรอกชื่อและอีเมลให้ครบถ้วน'
    return
  }

  isSubmitting.value = true
  try {
    if (isEditMode.value && props.user) {
      await authStore.updateAdminUser(props.user.id, {
        name: formName.value.trim(),
        email: formEmail.value.trim(),
        role: formRole.value
      })
    } else {
      await authStore.createAdminUser({
        name: formName.value.trim(),
        email: formEmail.value.trim(),
        role: formRole.value
      })
    }

    emit('saved')
    closeModal()
  } catch (err: any) {
    formError.value = err?.response?.data?.message || err?.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div
    v-if="modelValue"
    @click.self="closeModal"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in"
  >
    <div
      class="bg-white border border-[#E5E0D5] rounded-[32px] w-full max-w-md p-7 shadow-2xl space-y-4 animate-in zoom-in-95"
    >
      <!-- Modal Header -->
      <div class="flex items-center justify-between pb-3 border-b border-[#F0ECE1]">
        <h3 class="font-display font-bold text-base text-neutral-900 flex items-center gap-2">
          <Edit2 v-if="isEditMode" class="w-4 h-4 text-black" />
          <UserPlus v-else class="w-4 h-4 text-black" />
          <span>{{ isEditMode ? 'แก้ไขข้อมูลผู้ใช้ (Edit User)' : 'เพิ่มผู้ใช้ใหม่ (New User)' }}</span>
        </h3>
        <button
          type="button"
          @click="closeModal"
          class="p-1 rounded-full text-neutral-400 hover:text-black transition-colors"
        >
          <X class="w-4 h-4" />
        </button>
      </div>

      <!-- Form Content -->
      <form @submit.prevent="handleSubmit" class="space-y-3">
        <!-- Name Field -->
        <div>
          <label class="block text-xs font-bold text-neutral-700 mb-1">
            ชื่อ-นามสกุล <span v-if="!isEditMode">*</span>
          </label>
          <input
            v-model="formName"
            type="text"
            placeholder="เช่น นายสมชาย สายลุย"
            required
            class="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E5E0D5] rounded-2xl text-xs text-neutral-900 focus:outline-none focus:border-black transition-colors"
          />
        </div>

        <!-- Email Field -->
        <div>
          <label class="block text-xs font-bold text-neutral-700 mb-1">
            อีเมล <span v-if="!isEditMode">*</span>
          </label>
          <input
            v-model="formEmail"
            type="email"
            placeholder="user@clicknext.com"
            required
            class="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E5E0D5] rounded-2xl text-xs text-neutral-900 focus:outline-none focus:border-black transition-colors"
          />
        </div>

        <!-- Role Select -->
        <div>
          <label class="block text-xs font-bold text-neutral-700 mb-1">
            {{ isEditMode ? 'สิทธิ์ (Role)' : 'กำหนดสิทธิ์ (Role)' }}
          </label>
          <select
            v-model="formRole"
            :disabled="isEditMode && isPrimarySuperAdmin"
            class="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E5E0D5] rounded-2xl text-xs text-neutral-900 focus:outline-none focus:border-black transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <option value="USER">USER (ผู้ใช้งานทั่วไป)</option>
            <option value="SUPER_ADMIN">SUPER_ADMIN (ผู้ดูแลระบบสูงสุด)</option>
          </select>
          <p
            v-if="isEditMode && isPrimarySuperAdmin"
            class="text-[10px] text-amber-600 font-medium mt-1"
          >
            ★ บัญชี Primary Super Admin ไม่สามารถลดสิทธิ์ได้
          </p>
        </div>

        <!-- Initial Password (Create Mode Only) -->
        <div v-if="!isEditMode">
          <label class="block text-xs font-bold text-neutral-700 mb-1">รหัสผ่านเริ่มต้น</label>
          <input
            v-model="formPassword"
            type="text"
            class="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E5E0D5] rounded-2xl text-xs text-neutral-900 font-mono"
          />
        </div>

        <!-- Error Message -->
        <p v-if="formError" class="text-xs text-rose-500 font-medium">
          ⚠️ {{ formError }}
        </p>

        <!-- Actions -->
        <div class="pt-3 flex items-center justify-end gap-2 border-t border-[#F0ECE1]">
          <button
            type="button"
            @click="closeModal"
            class="px-4 py-2 rounded-full text-xs font-medium text-neutral-500 hover:text-black transition-colors"
          >
            ยกเลิก
          </button>
          <button
            type="submit"
            :disabled="isSubmitting"
            class="px-5 py-2 rounded-full text-xs font-bold text-white bg-black hover:bg-neutral-800 transition-colors shadow-sm disabled:opacity-50"
          >
            <span>{{ isSubmitting ? 'กำลังบันทึก...' : (isEditMode ? 'บันทึกการแก้ไข' : 'บันทึกผู้ใช้') }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
