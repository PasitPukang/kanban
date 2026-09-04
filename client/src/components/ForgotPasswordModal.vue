<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import {
  KeyRound,
  X,
  Mail,
  ArrowRight,
  Sparkles,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2
} from 'lucide-vue-next'
import { useAuthStore } from '../stores/auth'

const props = defineProps<{
  modelValue: boolean
  initialEmail?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'success', payload: { email: string; password: string }): void
}>()

const authStore = useAuthStore()

const forgotEmail = ref('')
const forgotOtp = ref('')
const forgotNewPassword = ref('')
const forgotConfirmPassword = ref('')
const forgotStep = ref<1 | 2>(1)
const forgotLoading = ref(false)
const forgotError = ref('')
const forgotSuccess = ref('')
const simulatedOtp = ref('')
const showForgotNewPassword = ref(false)
const showForgotConfirmPassword = ref(false)

const resetForm = () => {
  forgotEmail.value = (props.initialEmail || '').trim()
  forgotOtp.value = ''
  forgotNewPassword.value = ''
  forgotConfirmPassword.value = ''
  forgotStep.value = 1
  forgotError.value = ''
  forgotSuccess.value = ''
  simulatedOtp.value = ''
  showForgotNewPassword.value = false
  showForgotConfirmPassword.value = false
}

watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal) {
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

const handleRequestOtp = async () => {
  forgotError.value = ''
  forgotSuccess.value = ''
  if (!forgotEmail.value.trim()) {
    forgotError.value = 'กรุณาระบุอีเมลที่ใช้ในระบบ'
    return
  }

  forgotLoading.value = true
  const res = await authStore.requestPasswordReset(forgotEmail.value.trim())
  forgotLoading.value = false

  if (res.success) {
    simulatedOtp.value = res.otp || '123456'
    forgotOtp.value = simulatedOtp.value // Pre-fill for interview/demo convenience
    forgotStep.value = 2
    forgotSuccess.value = res.message
  } else {
    forgotError.value = res.message || 'ไม่พบอีเมลนี้ในระบบ'
  }
}

const handleConfirmReset = async () => {
  forgotError.value = ''
  forgotSuccess.value = ''

  if (!forgotOtp.value.trim()) {
    forgotError.value = 'กรุณากรอกรหัส OTP'
    return
  }

  if (forgotNewPassword.value.length < 6) {
    forgotError.value = 'รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร'
    return
  }

  if (forgotNewPassword.value !== forgotConfirmPassword.value) {
    forgotError.value = 'รหัสผ่านใหม่และยืนยันรหัสผ่านไม่ตรงกัน'
    return
  }

  forgotLoading.value = true
  const res = await authStore.confirmPasswordReset(
    forgotEmail.value.trim(),
    forgotOtp.value.trim(),
    forgotNewPassword.value
  )
  forgotLoading.value = false

  if (res.success) {
    forgotSuccess.value = res.message
    setTimeout(() => {
      emit('success', {
        email: forgotEmail.value.trim(),
        password: forgotNewPassword.value
      })
      closeModal()
    }, 1200)
  } else {
    forgotError.value = res.message || 'รีเซ็ตรหัสผ่านไม่สำเร็จ'
  }
}
</script>

<template>
  <div
    v-if="modelValue"
    @click.self="closeModal"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200"
  >
    <div
      class="bg-white rounded-[28px] border border-[#E5E0D5] p-6 sm:p-7 w-full max-w-md shadow-2xl space-y-5 animate-in zoom-in-95 duration-150"
    >
      <!-- Modal Header -->
      <div class="flex items-center justify-between pb-3 border-b border-[#F0ECE1]">
        <div class="flex items-center gap-2.5">
          <div class="w-9 h-9 rounded-2xl bg-neutral-100 flex items-center justify-center text-neutral-800">
            <KeyRound class="w-4 h-4" />
          </div>
          <div>
            <h3 class="font-display font-extrabold text-base sm:text-lg text-neutral-900 leading-tight">
              รีเซ็ตรหัสผ่าน (Reset Password)
            </h3>
            <p class="text-[11px] text-neutral-500 mt-0.5">
              {{ forgotStep === 1 ? 'ขั้นตอนที่ 1: ระบุอีเมลเพื่อรับรหัส OTP' : 'ขั้นตอนที่ 2: กรอกรหัส OTP และตั้งรหัสผ่านใหม่' }}
            </p>
          </div>
        </div>
        <button
          type="button"
          @click="closeModal"
          class="p-2 rounded-full text-neutral-400 hover:text-black hover:bg-neutral-100 transition-colors"
        >
          <X class="w-4 h-4" />
        </button>
      </div>

      <!-- Step 1 Form: Request OTP -->
      <div v-if="forgotStep === 1" class="space-y-4">
        <div>
          <label class="block text-xs font-bold text-neutral-700 mb-1.5 flex items-center gap-1.5">
            <Mail class="w-3.5 h-3.5 text-neutral-800" />
            อีเมลของคุณในระบบ <span class="text-rose-500">*</span>
          </label>
          <input
            v-model="forgotEmail"
            type="email"
            placeholder="เช่น oooas@gmail.com"
            required
            class="w-full px-4 py-3 bg-[#FAF8F5] border border-[#E5E0D5] rounded-2xl text-xs sm:text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-black transition-colors"
          />
        </div>

        <div v-if="forgotError" class="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 font-medium">
          ⚠️ {{ forgotError }}
        </div>

        <button
          type="button"
          @click="handleRequestOtp"
          :disabled="forgotLoading"
          class="w-full py-3 px-5 rounded-full bg-black hover:bg-neutral-800 text-white font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
        >
          <span>{{ forgotLoading ? 'กำลังส่งรหัส OTP...' : 'ส่งรหัส OTP ยืนยันตัวตน' }}</span>
          <ArrowRight class="w-4 h-4" />
        </button>
      </div>

      <!-- Step 2 Form: Enter OTP & New Password -->
      <div v-else class="space-y-4">
        <!-- Demo OTP Helper Alert -->
        <div v-if="simulatedOtp" class="p-3.5 bg-amber-50/80 border border-amber-200 rounded-2xl text-xs text-amber-900 space-y-1">
          <div class="font-bold flex items-center gap-1.5 text-amber-950">
            <Sparkles class="w-3.5 h-3.5 text-amber-600" />
            รหัส OTP สำหรับทดสอบของคุณ:
          </div>
          <div class="flex items-center justify-between">
            <span class="font-mono text-sm font-extrabold tracking-widest text-black bg-white/80 px-2.5 py-0.5 rounded-lg border border-amber-300">
              {{ simulatedOtp }}
            </span>
            <span class="text-[11px] text-neutral-500">(กรอกให้อัตโนมัติแล้ว)</span>
          </div>
        </div>

        <!-- OTP Input -->
        <div>
          <label class="block text-xs font-bold text-neutral-700 mb-1.5 flex items-center gap-1.5">
            <KeyRound class="w-3.5 h-3.5 text-neutral-800" />
            รหัสยืนยัน OTP (6 หลัก) <span class="text-rose-500">*</span>
          </label>
          <input
            v-model="forgotOtp"
            type="text"
            maxlength="6"
            placeholder="123456"
            required
            class="w-full px-4 py-3 bg-[#FAF8F5] border border-[#E5E0D5] rounded-2xl text-center text-base tracking-widest font-mono font-bold text-neutral-900 focus:outline-none focus:border-black transition-colors"
          />
        </div>

        <!-- New Password -->
        <div>
          <label class="block text-xs font-bold text-neutral-700 mb-1.5 flex items-center gap-1.5">
            <Lock class="w-3.5 h-3.5 text-neutral-800" />
            รหัสผ่านใหม่ <span class="text-rose-500">*</span>
          </label>
          <div class="relative flex items-center">
            <input
              v-model="forgotNewPassword"
              :type="showForgotNewPassword ? 'text' : 'password'"
              placeholder="อย่างน้อย 6 ตัวอักษร"
              required
              class="w-full pl-4 pr-11 py-3 bg-[#FAF8F5] border border-[#E5E0D5] rounded-2xl text-xs sm:text-sm text-neutral-900 focus:outline-none focus:border-black transition-colors font-mono"
            />
            <button
              type="button"
              @click="showForgotNewPassword = !showForgotNewPassword"
              class="absolute right-3.5 p-1 text-neutral-400 hover:text-neutral-700 transition-colors focus:outline-none"
              :title="showForgotNewPassword ? 'ซ่อนรหัสผ่าน' : 'ดูรหัสผ่าน'"
            >
              <EyeOff v-if="showForgotNewPassword" class="w-4 h-4 text-neutral-600" />
              <Eye v-else class="w-4 h-4" />
            </button>
          </div>
        </div>

        <!-- Confirm New Password -->
        <div>
          <label class="block text-xs font-bold text-neutral-700 mb-1.5 flex items-center gap-1.5">
            <Lock class="w-3.5 h-3.5 text-neutral-800" />
            ยืนยันรหัสผ่านใหม่ <span class="text-rose-500">*</span>
          </label>
          <div class="relative flex items-center">
            <input
              v-model="forgotConfirmPassword"
              :type="showForgotConfirmPassword ? 'text' : 'password'"
              placeholder="พิมพ์รหัสผ่านใหม่อีกครั้ง"
              required
              class="w-full pl-4 pr-11 py-3 bg-[#FAF8F5] border border-[#E5E0D5] rounded-2xl text-xs sm:text-sm text-neutral-900 focus:outline-none focus:border-black transition-colors font-mono"
            />
            <button
              type="button"
              @click="showForgotConfirmPassword = !showForgotConfirmPassword"
              class="absolute right-3.5 p-1 text-neutral-400 hover:text-neutral-700 transition-colors focus:outline-none"
              :title="showForgotConfirmPassword ? 'ซ่อนรหัสผ่าน' : 'ดูรหัสผ่าน'"
            >
              <EyeOff v-if="showForgotConfirmPassword" class="w-4 h-4 text-neutral-600" />
              <Eye v-else class="w-4 h-4" />
            </button>
          </div>
        </div>

        <!-- Error Alert -->
        <div v-if="forgotError" class="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 font-medium">
          ⚠️ {{ forgotError }}
        </div>

        <!-- Success Alert -->
        <div v-if="forgotSuccess" class="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-700 font-medium flex items-center gap-2">
          <CheckCircle2 class="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{{ forgotSuccess }}</span>
        </div>

        <!-- Action Buttons -->
        <div class="flex items-center gap-2 pt-2">
          <button
            type="button"
            @click="forgotStep = 1; forgotError = ''"
            class="px-4 py-2.5 rounded-full border border-[#E5E0D5] text-neutral-600 hover:text-black hover:bg-[#FAF8F5] text-xs font-bold transition-colors"
          >
            ย้อนกลับ
          </button>
          <button
            type="button"
            @click="handleConfirmReset"
            :disabled="forgotLoading"
            class="flex-1 py-2.5 px-4 rounded-full bg-black hover:bg-neutral-800 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
          >
            <span>{{ forgotLoading ? 'กำลังบันทึก...' : 'ยืนยันตั้งรหัสผ่านใหม่' }}</span>
            <ArrowRight class="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
