<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  GraduationCap,
  ArrowRight,
  Lock,
  Mail,
  User as UserIcon,
  Shield,
  Eye,
  EyeOff
} from 'lucide-vue-next'
import { useAuthStore } from '../stores/auth'
import ForgotPasswordModal from '../components/ForgotPasswordModal.vue'

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

// --- Forgot Password Modal State & Handler ---
const isForgotModalOpen = ref(false)

const openForgotPasswordModal = () => {
  isForgotModalOpen.value = true
}

const onResetPasswordSuccess = (payload: { email: string; password: string }) => {
  email.value = payload.email
  password.value = payload.password
  successMessage.value = '🎉 รีเซ็ตรหัสผ่านสำเร็จ! เรากรอกรหัสผ่านใหม่ให้แล้ว กดเข้าสู่ระบบได้เลย'
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
        <div class="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center mx-auto shadow-md">
          <GraduationCap class="w-6 h-6 text-white" />
        </div>
        <h2 class="font-display font-extrabold text-2xl sm:text-3xl text-neutral-900 tracking-tight">
          {{ isRegisterMode ? 'สร้างบัญชีนักเรียน / สมาชิกใหม่' : 'เข้าสู่ระบบ สมุดการบ้าน (Homework Hub)' }}
        </h2>
        <p class="text-xs text-neutral-500 font-medium max-w-xs mx-auto">
          {{ isRegisterMode ? 'กรอกข้อมูลเพื่อสมัครสมาชิกและเริ่มติดตามการบ้านของคุณ' : 'พิมพ์อีเมลและรหัสผ่านเพื่อเข้าสู่กระดานการบ้านและการเรียน' }}
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
            placeholder="เช่น oooas@gmail.com"
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

    <!-- Forgot Password Modal Dialog Component -->
    <ForgotPasswordModal
      v-model="isForgotModalOpen"
      :initial-email="email"
      @success="onResetPasswordSuccess"
    />
  </div>
</template>
