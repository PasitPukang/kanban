<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  Kanban,
  ArrowRight,
  Lock,
  Mail,
  User as UserIcon,
  Shield,
  Sparkles,
  Eye,
  EyeOff,
  X,
  KeyRound,
  CheckCircle2,
  RotateCcw
} from 'lucide-vue-next'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const isRegisterMode = ref(false)
const email = ref('')
const name = ref('')
const password = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

// --- Forgot Password States ---
const isForgotModalOpen = ref(false)
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

const openForgotPasswordModal = () => {
  forgotEmail.value = email.value.trim()
  forgotOtp.value = ''
  forgotNewPassword.value = ''
  forgotConfirmPassword.value = ''
  forgotStep.value = 1
  forgotError.value = ''
  forgotSuccess.value = ''
  simulatedOtp.value = ''
  isForgotModalOpen.value = true
}

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
    email.value = forgotEmail.value.trim()
    password.value = forgotNewPassword.value
    setTimeout(() => {
      isForgotModalOpen.value = false
      successMessage.value = '🎉 รีเซ็ตรหัสผ่านสำเร็จ! เรากรอกรหัสผ่านใหม่ให้แล้ว กดเข้าสู่ระบบได้เลย'
    }, 1200)
  } else {
    forgotError.value = res.message || 'รีเซ็ตรหัสผ่านไม่สำเร็จ'
  }
}

const handleLogin = async () => {
  errorMessage.value = ''
  successMessage.value = ''

  if (!email.value.trim() || !password.value) {
    errorMessage.value = 'กรุณากรอกอีเมลและรหัสผ่าน'
    return
  }

  const res = await authStore.login(email.value.trim(), password.value)
  if (res.success) {
    router.push('/dashboard')
  } else {
    errorMessage.value = res.message || 'เข้าสู่ระบบไม่สำเร็จ กรุณาตรวจสอบข้อมูล'
  }
}

const handleRegister = async () => {
  errorMessage.value = ''
  successMessage.value = ''

  if (!email.value.trim() || !name.value.trim() || !password.value) {
    errorMessage.value = 'กรุณากรอกข้อมูลให้ครบทุกช่อง'
    return
  }

  if (password.value !== confirmPassword.value) {
    errorMessage.value = 'รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน'
    return
  }

  if (password.value.length < 6) {
    errorMessage.value = 'รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร'
    return
  }

  const res = await authStore.register(email.value.trim(), name.value.trim(), password.value)
  if (res.success) {
    successMessage.value = 'สมัครสมาชิกสำเร็จ! กำลังเข้าสู่ระบบ...'
    setTimeout(() => {
      router.push('/dashboard')
    }, 800)
  } else {
    errorMessage.value = res.message || 'สมัครสมาชิกไม่สำเร็จ'
  }
}
</script>

<template>
  <div class="min-h-[calc(100vh-6rem)] flex items-center justify-center p-4 sm:p-6">
    <div class="w-full max-w-lg bg-white border border-[#E5E0D5] rounded-[36px] p-7 sm:p-9 shadow-soft space-y-6">
      <!-- Brand & Header -->
      <div class="text-center space-y-2">
        <div class="w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center mx-auto shadow-md">
          <Kanban class="w-6 h-6 text-white" />
        </div>
        <h2 class="font-display font-extrabold text-2xl sm:text-3xl text-neutral-900 tracking-tight">
          {{ isRegisterMode ? 'สร้างบัญชีผู้ใช้ใหม่' : 'เข้าสู่ระบบ Clicknext Kanban' }}
        </h2>
        <p class="text-xs text-neutral-500 font-medium max-w-xs mx-auto">
          {{ isRegisterMode ? 'กรอกข้อมูลเพื่อสมัครสมาชิกและเริ่มจัดการบอร์ด' : 'พิมพ์อีเมลและรหัสผ่านเพื่อเข้าสู่ระบบงานของคุณ' }}
        </p>
      </div>

      <!-- Mode Switcher Tabs -->
      <div class="flex items-center p-1 bg-[#FAF8F5] border border-[#E5E0D5] rounded-full">
        <button
          type="button"
          @click="isRegisterMode = false; errorMessage = ''; successMessage = ''"
          :class="[
            'flex-1 py-2.5 rounded-full text-xs font-bold transition-all',
            !isRegisterMode
              ? 'bg-black text-white shadow-sm'
              : 'text-neutral-600 hover:text-black hover:bg-neutral-200/50'
          ]"
        >
          เข้าสู่ระบบ (Login)
        </button>
        <button
          type="button"
          @click="isRegisterMode = true; errorMessage = ''; successMessage = ''"
          :class="[
            'flex-1 py-2.5 rounded-full text-xs font-bold transition-all',
            isRegisterMode
              ? 'bg-black text-white shadow-sm'
              : 'text-neutral-600 hover:text-black hover:bg-neutral-200/50'
          ]"
        >
          สมัครสมาชิก (Register)
        </button>
      </div>

      <!-- Form -->
      <form @submit.prevent="isRegisterMode ? handleRegister() : handleLogin()" class="space-y-4">
        <!-- Name Field (Register Mode Only) -->
        <div v-if="isRegisterMode">
          <label class="block text-xs font-bold text-neutral-700 mb-1.5 flex items-center gap-1.5">
            <UserIcon class="w-3.5 h-3.5 text-neutral-800" />
            ชื่อ-นามสกุล <span class="text-rose-500">*</span>
          </label>
          <input
            v-model="name"
            type="text"
            placeholder="เช่น สมชาย สายลุย"
            required
            class="w-full px-4 py-3 bg-[#FAF8F5] border border-[#E5E0D5] rounded-2xl text-xs sm:text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-black transition-colors"
          />
        </div>

        <!-- Email Field -->
        <div>
          <label class="block text-xs font-bold text-neutral-700 mb-1.5 flex items-center gap-1.5">
            <Mail class="w-3.5 h-3.5 text-neutral-800" />
            อีเมล (Email) <span class="text-rose-500">*</span>
          </label>
          <input
            v-model="email"
            type="email"
            placeholder="เช่น psitpukang1234567@gmail.com หรือ pasitpukang0@gmail.com"
            required
            class="w-full px-4 py-3 bg-[#FAF8F5] border border-[#E5E0D5] rounded-2xl text-xs sm:text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-black transition-colors"
          />
        </div>

        <!-- Password Field -->
        <div>
          <label class="block text-xs font-bold text-neutral-700 mb-1.5 flex items-center gap-1.5">
            <Lock class="w-3.5 h-3.5 text-neutral-800" />
            รหัสผ่าน (Password) <span class="text-rose-500">*</span>
          </label>
          <div class="relative flex items-center">
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="••••••••"
              required
              class="w-full pl-4 pr-11 py-3 bg-[#FAF8F5] border border-[#E5E0D5] rounded-2xl text-xs sm:text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-black transition-colors font-mono"
            />
            <button
              type="button"
              @click="showPassword = !showPassword"
              class="absolute right-3.5 p-1 text-neutral-400 hover:text-neutral-700 focus:outline-none transition-colors"
              :title="showPassword ? 'ซ่อนรหัสผ่าน' : 'ดูรหัสผ่าน'"
            >
              <EyeOff v-if="showPassword" class="w-4 h-4 text-neutral-600" />
              <Eye v-else class="w-4 h-4" />
            </button>
          </div>

          <!-- Forgot Password Link (Login Mode Only) -->
          <div v-if="!isRegisterMode" class="flex justify-end pt-1">
            <button
              type="button"
              @click="openForgotPasswordModal"
              class="text-xs text-neutral-500 hover:text-black font-semibold transition-colors underline-offset-4 hover:underline"
            >
              ลืมรหัสผ่าน? (Forgot Password?)
            </button>
          </div>
        </div>

        <!-- Confirm Password Field (Register Mode Only) -->
        <div v-if="isRegisterMode">
          <label class="block text-xs font-bold text-neutral-700 mb-1.5 flex items-center gap-1.5">
            <Lock class="w-3.5 h-3.5 text-neutral-800" />
            ยืนยันรหัสผ่าน (Confirm Password) <span class="text-rose-500">*</span>
          </label>
          <div class="relative flex items-center">
            <input
              v-model="confirmPassword"
              :type="showConfirmPassword ? 'text' : 'password'"
              placeholder="••••••••"
              required
              class="w-full pl-4 pr-11 py-3 bg-[#FAF8F5] border border-[#E5E0D5] rounded-2xl text-xs sm:text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-black transition-colors font-mono"
            />
            <button
              type="button"
              @click="showConfirmPassword = !showConfirmPassword"
              class="absolute right-3.5 p-1 text-neutral-400 hover:text-neutral-700 focus:outline-none transition-colors"
              :title="showConfirmPassword ? 'ซ่อนรหัสผ่าน' : 'ดูรหัสผ่าน'"
            >
              <EyeOff v-if="showConfirmPassword" class="w-4 h-4 text-neutral-600" />
              <Eye v-else class="w-4 h-4" />
            </button>
          </div>
        </div>

        <!-- Alerts -->
        <div v-if="errorMessage" class="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 font-medium">
          ⚠️ {{ errorMessage }}
        </div>

        <div v-if="successMessage" class="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-700 font-medium">
          ✅ {{ successMessage }}
        </div>

        <!-- Submit Button -->
        <button
          type="submit"
          :disabled="authStore.isLoading"
          class="w-full py-3.5 px-5 rounded-full bg-black hover:bg-neutral-800 text-white font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-md hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
        >
          <span>{{ isRegisterMode ? 'ยืนยันการสมัครสมาชิก' : 'เข้าสู่ระบบ (Sign In)' }}</span>
          <ArrowRight class="w-4 h-4" />
        </button>
      </form>
    </div>

    <!-- Forgot Password Modal Dialog -->
    <div
      v-if="isForgotModalOpen"
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
            @click="isForgotModalOpen = false"
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
              placeholder="เช่น psitpukang1234567@gmail.com"
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
  </div>
</template>
