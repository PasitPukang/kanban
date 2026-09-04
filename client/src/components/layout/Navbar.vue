<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import NotificationDropdown from '../notification/NotificationDropdown.vue'
import {
  GraduationCap,
  Database,
  HardDrive,
  ChevronDown,
  LogOut
} from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const isUserMenuOpen = ref(false)
const userMenuRef = ref<HTMLElement | null>(null)

const handleClickOutside = (event: MouseEvent) => {
  if (userMenuRef.value && !userMenuRef.value.contains(event.target as Node)) {
    isUserMenuOpen.value = false
  }
}

const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    isUserMenuOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('keydown', handleKeyDown)
})

const toggleDataMode = () => {
  const newMode = authStore.dataMode === 'localStorage' ? 'api' : 'localStorage'
  authStore.setDataMode(newMode)
}

const handleLogout = () => {
  authStore.logout()
  isUserMenuOpen.value = false
  router.push('/login')
}
</script>

<template>
  <header class="bg-[#F7F5F0]/95 backdrop-blur border-b border-[#EAE6DC] sticky top-0 z-40 px-4 sm:px-8 py-3">
    <div class="max-w-[1720px] mx-auto flex items-center justify-between">
      <!-- Left: Logo & Navigation Breadcrumb -->
      <div class="flex items-center gap-4">
        <router-link to="/dashboard" class="flex items-center gap-2.5 group">
          <div class="w-9 h-9 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
            <GraduationCap class="w-4 h-4 text-white" />
          </div>
          <div>
            <span class="text-sm font-display font-extrabold tracking-tight text-neutral-900 flex items-center gap-1.5">
              Clicknext <span class="text-amber-800 font-bold text-[11px] bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-full">Homework Hub</span>
            </span>
          </div>
        </router-link>

        <div v-if="authStore.currentUser" class="h-4 w-px bg-neutral-300 hidden sm:block"></div>

        <!-- Super Admin Quick Access Pill -->
        <router-link
          v-if="authStore.isSuperAdmin"
          to="/admin/users"
          class="hidden sm:flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold text-neutral-900 bg-[#FEF0DC] hover:bg-[#FBE0B8] border border-[#F9D49B] transition-all shadow-2xs"
        >
          <span>👑 Super Admin</span>
        </router-link>
      </div>

      <!-- Right: Controls & User Profile -->
      <div class="flex items-center gap-3">
        <!-- Storage Engine Badge -->
        <div
          class="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FFF9EE] border border-[#FCE6BD] text-[#915B06] shadow-2xs"
          title="โหมดบันทึกข้อมูลในเครื่อง (LocalStorage)"
        >
          <HardDrive class="w-3.5 h-3.5 text-amber-700" />
          <span class="font-mono text-[10px] tracking-wide font-bold">LOCAL STORAGE</span>
        </div>

        <!-- Notification Bell -->
        <div>
          <NotificationDropdown />
        </div>

        <!-- User Profile & Session Controls -->
        <div v-if="authStore.currentUser" class="relative" ref="userMenuRef">
          <button
            @click="isUserMenuOpen = !isUserMenuOpen"
            class="flex items-center gap-2 p-1.5 pr-3 rounded-full bg-white hover:bg-neutral-50 border border-[#E5E0D5] shadow-2xs transition-all text-left"
          >
            <div class="relative">
              <img
                :src="authStore.currentUser?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces'"
                alt="Avatar"
                class="w-7 h-7 rounded-full object-cover ring-1 ring-neutral-200"
              />
              <span
                v-if="authStore.isSuperAdmin"
                class="absolute -top-1 -right-1 text-[10px] leading-none"
              >
                👑
              </span>
            </div>
            <div class="hidden sm:block leading-tight">
              <p class="text-xs font-bold text-neutral-900 flex items-center gap-1">
                {{ authStore.currentUser?.name }}
              </p>
              <p class="text-[10px] text-neutral-400 font-mono">
                {{ authStore.currentUser?.email }}
              </p>
            </div>
            <ChevronDown class="w-3.5 h-3.5 text-neutral-400 ml-0.5" />
          </button>

          <!-- User Menu Dropdown -->
          <div
            v-if="isUserMenuOpen"
            class="absolute right-0 mt-2 w-64 bg-white border border-[#E5E0D5] rounded-3xl shadow-xl z-50 p-3 overflow-hidden animate-in fade-in zoom-in-95 space-y-2.5"
          >
            <!-- User Profile Summary Card -->
            <div class="p-2.5 bg-[#FAF8F5] border border-[#E5E0D5] rounded-2xl">
              <div class="flex items-center gap-2.5 mb-1.5">
                <img
                  :src="authStore.currentUser?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces'"
                  class="w-8 h-8 rounded-full object-cover ring-1 ring-neutral-300"
                />
                <div class="min-w-0">
                  <p class="text-xs font-bold text-neutral-900 truncate">{{ authStore.currentUser?.name }}</p>
                  <p class="text-[10px] text-neutral-400 font-mono truncate">{{ authStore.currentUser?.email }}</p>
                </div>
              </div>
              <div class="flex items-center justify-between pt-1.5 border-t border-[#EAE6DC]">
                <span class="text-[10px] text-neutral-400 font-medium">สิทธิ์การใช้งาน:</span>
                <span
                  class="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  :class="authStore.isSuperAdmin ? 'bg-amber-100 text-[#8A5617] border border-amber-300' : 'bg-emerald-100 text-emerald-700 border border-emerald-300'"
                >
                  {{ authStore.isSuperAdmin ? '👑 SUPER_ADMIN' : '👤 USER' }}
                </span>
              </div>
            </div>

            <!-- Admin Panel Shortcut if Super Admin -->
            <div v-if="authStore.isSuperAdmin" class="p-2 bg-[#FEF0DC]/90 border border-[#FBE0B8] rounded-2xl">
              <router-link
                to="/admin/users"
                @click="isUserMenuOpen = false"
                class="flex items-center justify-between text-xs font-bold text-[#8A5617] hover:underline"
              >
                <span class="flex items-center gap-1.5">
                  <span>👑</span> Super Admin Control
                </span>
                <span class="text-[10px] bg-white px-2 py-0.5 rounded-full border border-[#FBE0B8]">เปิด</span>
              </router-link>
            </div>

            <!-- Logout Button -->
            <div>
              <button
                @click="handleLogout"
                class="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-left text-xs text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-colors font-bold"
              >
                <span>ออกจากระบบ (Logout)</span>
                <LogOut class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        <!-- If Logged Out: Show Login Button only if not already on /login -->
        <router-link
          v-else-if="route.path !== '/login'"
          to="/login"
          class="flex items-center gap-2 px-4 py-2 rounded-full bg-black text-white text-xs font-bold shadow-md hover:bg-neutral-800 transition-all hover:scale-105"
        >
          <span>เข้าสู่ระบบ (Sign In)</span>
        </router-link>
      </div>
    </div>
  </header>
</template>
