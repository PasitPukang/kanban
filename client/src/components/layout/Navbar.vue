<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import NotificationDropdown from '../notification/NotificationDropdown.vue'
import {
  Kanban,
  Database,
  HardDrive,
  Users,
  ChevronDown,
  LayoutDashboard,
  Check,
  Shield,
  ShieldAlert,
  LogOut
} from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const isUserMenuOpen = ref(false)

const handleSwitchUser = (user: any) => {
  authStore.switchUser(user)
  isUserMenuOpen.value = false
}

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
          <div class="w-9 h-9 rounded-2xl bg-black text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
            <Kanban class="w-4 h-4 text-white" />
          </div>
          <div>
            <span class="text-sm font-display font-extrabold tracking-tight text-neutral-900 flex items-center gap-1">
              Clicknext <span class="text-neutral-500 font-medium">Kanban</span>
            </span>
          </div>
        </router-link>

        <div v-if="authStore.currentUser" class="h-4 w-px bg-neutral-300 hidden sm:block"></div>

        <!-- Dashboard Link -->
        <router-link
          v-if="authStore.currentUser"
          to="/dashboard"
          class="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-neutral-600 hover:text-black hover:bg-white/80 transition-all border border-transparent hover:border-[#E5E0D5]"
        >
          <LayoutDashboard class="w-3.5 h-3.5 text-neutral-500" />
          กระดานทั้งหมด
        </router-link>

        <!-- Super Admin Quick Access Pill -->
        <router-link
          v-if="authStore.isSuperAdmin"
          to="/admin/users"
          class="hidden sm:flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold text-neutral-900 bg-[#FEF0DC] hover:bg-[#FBE0B8] border border-[#F9D49B] transition-all shadow-2xs"
        >
          <span>👑 Super Admin</span>
        </router-link>
      </div>

      <!-- Right: User Switcher & Controls -->
      <div class="flex items-center gap-3">
        <!-- Dual-Engine Switcher Badge (Mobile / Tablet - Super Admin Only) -->
        <button
          v-if="authStore.isSuperAdmin"
          @click="toggleDataMode"
          class="xl:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all"
          :class="[
            authStore.dataMode === 'api'
              ? 'bg-[#EBFBF4] border-[#BCECD4] text-[#14663E]'
              : 'bg-[#FFF9EE] border-[#FCE6BD] text-[#915B06]'
          ]"
        >
          <Database v-if="authStore.dataMode === 'api'" class="w-3.5 h-3.5" />
          <HardDrive v-else class="w-3.5 h-3.5" />
          <span class="font-mono text-[10px]">
            {{ authStore.dataMode === 'api' ? 'API' : 'LOCAL' }}
          </span>
        </button>

        <!-- Notification Bell (Mobile / Tablet) -->
        <div class="xl:hidden">
          <NotificationDropdown />
        </div>

        <!-- User Profile & Session Controls -->
        <div v-if="authStore.currentUser" class="relative">
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
