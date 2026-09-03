<script setup lang="ts">
import { ref } from 'vue'
import { X, UserPlus, Mail, Check, Shield } from 'lucide-vue-next'
import { Board, User } from '../../types'
import { useAuthStore } from '../../stores/auth'

const props = defineProps<{
  isOpen: boolean
  board: Board | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'invite', email: string): void
}>()

const authStore = useAuthStore()
const email = ref('')
const feedbackMessage = ref('')

const handleInvite = (targetEmail?: string) => {
  const mailToInvite = targetEmail || email.value.trim()
  if (!mailToInvite) return

  emit('invite', mailToInvite)
  feedbackMessage.value = `ส่งคำเชิญไปยัง ${mailToInvite} เรียบร้อยแล้ว!`
  email.value = ''
  setTimeout(() => {
    feedbackMessage.value = ''
  }, 3000)
}

const isAlreadyMember = (userId: string) => {
  return props.board?.members?.some((m) => m.user_id === userId)
}
</script>

<template>
  <div
    v-if="isOpen && board"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in"
  >
    <div
      class="bg-white border border-[#E5E0D5] rounded-[32px] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95"
    >
      <!-- Header -->
      <div class="px-7 py-5 border-b border-[#F0ECE1] flex items-center justify-between">
        <div class="flex items-center gap-2 text-neutral-900 font-display font-bold text-base">
          <UserPlus class="w-4 h-4 text-black" />
          <span>เชิญสมาชิกเข้าร่วมกระดาน (Invite Members)</span>
        </div>
        <button
          @click="$emit('close')"
          class="p-1 rounded-full text-neutral-400 hover:text-black hover:bg-neutral-100 transition-colors"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <div class="p-7 space-y-6">
        <!-- Invite by Email Form -->
        <form @submit.prevent="handleInvite()" class="space-y-2.5">
          <label class="block text-xs font-bold text-neutral-700">
            เชิญด้วยอีเมล (Invite via Email)
          </label>
          <div class="flex items-center gap-2">
            <div class="relative flex-1">
              <Mail class="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                v-model="email"
                type="email"
                placeholder="เช่น sarah@clicknext.com"
                class="w-full pl-10 pr-4 py-2.5 bg-[#FAF8F5] border border-[#E5E0D5] rounded-full text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-black transition-colors"
              />
            </div>
            <button
              type="submit"
              class="px-5 py-2.5 rounded-full text-xs font-bold text-white bg-black hover:bg-neutral-800 transition-colors flex-shrink-0 shadow-sm"
            >
              ส่งคำเชิญ
            </button>
          </div>
          <p v-if="feedbackMessage" class="text-xs text-emerald-700 font-medium flex items-center gap-1.5 animate-in fade-in">
            <Check class="w-3.5 h-3.5" />
            {{ feedbackMessage }}
          </p>
        </form>

        <!-- Quick 1-Click Invite Team Members -->
        <div>
          <p class="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2.5">
            คลิกเชิญเพื่อนร่วมทีมทันที (Quick Invite):
          </p>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div
              v-for="user in authStore.users"
              :key="user.id"
              class="p-3 bg-[#FAF8F5] border border-[#E5E0D5] rounded-2xl flex items-center justify-between hover:bg-[#F3EFE7] transition-colors"
            >
              <div class="flex items-center gap-2.5 min-w-0">
                <img :src="user.avatar_url || ''" class="w-8 h-8 rounded-full object-cover flex-shrink-0 ring-1 ring-white" />
                <div class="min-w-0">
                  <p class="text-xs font-bold text-neutral-900 truncate">{{ user.name }}</p>
                  <p class="text-[10px] text-neutral-400 font-mono truncate">{{ user.email }}</p>
                </div>
              </div>

              <span
                v-if="isAlreadyMember(user.id)"
                class="text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2.5 py-0.5 rounded-full flex-shrink-0"
              >
                อยู่ในบอร์ด
              </span>
              <button
                v-else
                @click="handleInvite(user.email)"
                type="button"
                class="text-[11px] font-bold text-black hover:text-white bg-white hover:bg-black border border-[#E5E0D5] px-3 py-1 rounded-full transition-all flex-shrink-0 shadow-2xs"
              >
                + เชิญ
              </button>
            </div>
          </div>
        </div>

        <!-- Current Members List -->
        <div class="pt-3 border-t border-[#F0ECE1]">
          <p class="text-xs font-bold text-neutral-700 mb-2.5">
            สมาชิกในบอร์ดปัจจุบัน ({{ board.members?.length || 0 }} คน)
          </p>
          <div class="max-h-40 overflow-y-auto space-y-2 pr-1">
            <div
              v-for="member in board.members"
              :key="member.id"
              class="flex items-center justify-between p-2.5 rounded-xl bg-[#FAF8F5] text-xs"
            >
              <div class="flex items-center gap-2.5">
                <img :src="member.user.avatar_url || ''" class="w-7 h-7 rounded-full object-cover" />
                <span class="font-semibold text-neutral-900">{{ member.user.name }}</span>
                <span class="text-[10px] text-neutral-400 font-mono">({{ member.user.email }})</span>
              </div>
              <span
                :class="[
                  'text-[10px] px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1',
                  member.role === 'OWNER'
                    ? 'bg-[#FEF0DC] text-[#8A5617] border border-[#FBE0B8]'
                    : 'bg-white text-neutral-600 border border-[#E5E0D5]'
                ]"
              >
                <Shield v-if="member.role === 'OWNER'" class="w-3 h-3 text-[#8A5617]" />
                {{ member.role }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
