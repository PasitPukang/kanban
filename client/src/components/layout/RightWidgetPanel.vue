<script setup lang="ts">
import { ref } from 'vue'
import {
  Bell,
  Settings,
  ChevronRight,
  Database,
  HardDrive,
  Users,
  CheckCircle2,
  Sparkles
} from 'lucide-vue-next'
import { useAuthStore } from '../../stores/auth'
import { useBoardStore } from '../../stores/board'
import { useNotificationStore } from '../../stores/notification'
import NotificationDropdown from '../notification/NotificationDropdown.vue'

const authStore = useAuthStore()
const boardStore = useBoardStore()
const notiStore = useNotificationStore()

const toggleDataMode = () => {
  const newMode = authStore.dataMode === 'localStorage' ? 'api' : 'localStorage'
  authStore.setDataMode(newMode)
}
</script>

<template>
  <aside class="hidden xl:flex flex-col w-84 bg-white/95 rounded-[36px] my-5 mr-6 p-6 shadow-soft border border-[#EDE9DF] flex-shrink-0 space-y-6">
    <!-- Top Header: Notification & Settings -->
    <div class="flex items-center justify-between">
      <NotificationDropdown />
      <button class="p-2 text-neutral-400 hover:text-neutral-800 rounded-full hover:bg-neutral-100 transition-colors">
        <Settings class="w-5 h-5" />
      </button>
    </div>

    <!-- User Profile Hero (Centered like reference) -->
    <div v-if="authStore.currentUser" class="flex flex-col items-center text-center">
      <div class="relative mb-3">
        <img
          :src="authStore.currentUser?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces'"
          :alt="authStore.currentUser?.name"
          class="w-20 h-20 rounded-full object-cover ring-4 ring-[#F7F5F0] shadow-md"
        />
        <div class="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-emerald-500 ring-2 ring-white"></div>
      </div>

      <h3 class="font-display font-bold text-lg text-neutral-900 leading-tight">
        {{ authStore.currentUser?.name }}
      </h3>
      <p class="text-xs text-neutral-400 font-mono mt-0.5">
        {{ authStore.currentUser?.email }}
      </p>

      <!-- Team Members Pill Badge (like "274 Friends" in reference) -->
      <div class="mt-4 flex items-center justify-between w-full px-4 py-2.5 bg-[#FAF8F5] border border-[#EFECE4] rounded-2xl cursor-pointer hover:bg-[#F3EFE7] transition-colors">
        <div class="flex items-center gap-2">
          <Users class="w-4 h-4 text-neutral-600" />
          <span class="text-xs font-semibold text-neutral-700">
            {{ authStore.users.length }} เพื่อนร่วมทีม
          </span>
        </div>
        <div class="flex items-center -space-x-1.5">
          <img
            v-for="u in authStore.users.slice(0, 3)"
            :key="u.id"
            :src="u.avatar_url || ''"
            class="w-5 h-5 rounded-full ring-1 ring-white object-cover"
          />
          <ChevronRight class="w-3.5 h-3.5 text-neutral-400 ml-1" />
        </div>
      </div>
    </div>

    <!-- Guest State if not logged in -->
    <div v-else class="flex flex-col items-center text-center py-6 px-3 bg-[#FAF8F5] rounded-3xl border border-[#EFECE4] space-y-3">
      <div class="w-14 h-14 rounded-full bg-neutral-200 flex items-center justify-center text-neutral-400">
        <Users class="w-7 h-7" />
      </div>
      <div>
        <h4 class="font-bold text-sm text-neutral-900">ยังไม่ได้เข้าสู่ระบบ</h4>
        <p class="text-xs text-neutral-400 mt-0.5">กรุณาเข้าสู่ระบบเพื่อจัดการงาน</p>
      </div>
      <router-link
        to="/login"
        class="w-full py-2 px-4 rounded-full bg-black text-white text-xs font-bold shadow-sm hover:bg-neutral-800 transition-all text-center"
      >
        เข้าสู่ระบบ (Sign In)
      </router-link>
    </div>

    <!-- Activity Widget (like reference: "Activity 3.5h Great result!") -->
    <div class="bg-[#FAF8F5] border border-[#EFECE4] rounded-3xl p-4.5 space-y-3">
      <div class="flex items-center justify-between">
        <span class="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Activity</span>
        <span class="text-[11px] font-medium text-neutral-400 bg-white px-2 py-0.5 rounded-full border border-[#EBE7DD]">Sprint 1</span>
      </div>

      <div class="flex items-baseline gap-2">
        <span class="font-display font-extrabold text-2xl text-neutral-900">14.2h</span>
        <span class="text-xs text-neutral-600 flex items-center gap-1 font-medium">
          👍 Great progress!
        </span>
      </div>

      <!-- Colorful Rounded Stacked Bars (like reference) -->
      <div class="grid grid-cols-6 gap-2 pt-2 items-end h-20">
        <div class="flex flex-col items-center gap-1.5 h-full justify-end">
          <div class="w-full bg-[#DFF6EC] rounded-t-lg h-8"></div>
          <span class="text-[9px] text-neutral-400 font-mono">Mon</span>
        </div>
        <div class="flex flex-col items-center gap-1.5 h-full justify-end">
          <div class="w-full bg-[#FEF0DC] rounded-t-lg h-12"></div>
          <span class="text-[9px] text-neutral-400 font-mono">Tue</span>
        </div>
        <div class="flex flex-col items-center gap-1.5 h-full justify-end">
          <div class="w-full bg-[#FCE7E7] rounded-t-lg h-10"></div>
          <span class="text-[9px] text-neutral-400 font-mono">Wed</span>
        </div>
        <div class="flex flex-col items-center gap-1.5 h-full justify-end">
          <div class="w-full bg-[#E6EAFF] rounded-t-lg h-14"></div>
          <span class="text-[9px] text-neutral-400 font-mono">Thu</span>
        </div>
        <div class="flex flex-col items-center gap-1.5 h-full justify-end">
          <div class="w-full bg-[#DFF6EC] rounded-t-lg h-7"></div>
          <span class="text-[9px] text-neutral-400 font-mono">Fri</span>
        </div>
        <!-- Active highlighted bar like Dec in reference -->
        <div class="flex flex-col items-center gap-1.5 h-full justify-end p-0.5 bg-neutral-900 rounded-xl">
          <div class="w-full flex flex-col gap-0.5 rounded-t-lg overflow-hidden h-full">
            <div class="bg-[#FCE7E7] h-3 w-full"></div>
            <div class="bg-[#FEF0DC] h-4 w-full"></div>
            <div class="bg-[#DFF6EC] h-5 w-full"></div>
            <div class="bg-[#E6EAFF] flex-1 w-full"></div>
          </div>
          <span class="text-[9px] text-white font-mono font-bold pb-0.5">Sat</span>
        </div>
      </div>
    </div>

    <!-- Data Engine Mode Switcher (Visible only for Super Admin) -->
    <div v-if="authStore.isSuperAdmin" class="pt-2 border-t border-[#EFECE4]">
      <button
        @click="toggleDataMode"
        class="w-full flex items-center justify-between p-3 rounded-2xl border transition-all text-left group"
        :class="[
          authStore.dataMode === 'api'
            ? 'bg-[#EBFBF4] border-[#BCECD4] text-[#14663E]'
            : 'bg-[#FFF9EE] border-[#FCE6BD] text-[#915B06]'
        ]"
      >
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-xl flex items-center justify-center shadow-sm"
            :class="authStore.dataMode === 'api' ? 'bg-[#14663E] text-white' : 'bg-[#915B06] text-white'"
          >
            <Database v-if="authStore.dataMode === 'api'" class="w-4 h-4" />
            <HardDrive v-else class="w-4 h-4" />
          </div>
          <div>
            <p class="text-xs font-bold leading-tight">
              {{ authStore.dataMode === 'api' ? 'Live API Connected' : 'Local Storage Mode' }}
            </p>
            <p class="text-[10px] opacity-80 leading-tight">
              คลิกเพื่อสลับ Engine
            </p>
          </div>
        </div>
        <span class="text-[10px] font-bold px-2 py-0.5 rounded-md font-mono bg-white/70 shadow-2xs">
          {{ authStore.dataMode === 'api' ? 'POSTGRES' : 'OFFLINE' }}
        </span>
      </button>
    </div>
  </aside>
</template>
