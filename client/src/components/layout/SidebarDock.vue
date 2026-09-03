<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  LayoutGrid,
  Kanban,
  Calendar,
  Layers,
  Settings,
  Bell,
  Sparkles,
  User as UserIcon
} from 'lucide-vue-next'
import { useAuthStore } from '../../stores/auth'
import { useNotificationStore } from '../../stores/notification'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const notiStore = useNotificationStore()

const currentPath = computed(() => route.path)
</script>

<template>
  <aside class="hidden lg:flex flex-col items-center justify-between w-20 py-7 px-3 bg-[#EFECE4]/80 backdrop-blur-md rounded-[36px] my-5 ml-6 shadow-sm border border-[#E5E0D5] flex-shrink-0 z-30">
    <!-- Brand Logo Top -->
    <div class="flex flex-col items-center gap-6">
      <router-link
        to="/dashboard"
        class="w-11 h-11 rounded-2xl bg-black text-white flex items-center justify-center hover:scale-105 transition-transform shadow-md"
        title="Clicknext Kanban"
      >
        <Kanban class="w-5 h-5 text-white" />
      </router-link>

      <!-- Navigation Icons Stack -->
      <nav class="flex flex-col items-center gap-3">
        <!-- Dashboard Button -->
        <router-link
          to="/dashboard"
          :class="[
            'w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200',
            currentPath === '/dashboard' || currentPath === '/'
              ? 'bg-black text-white shadow-md'
              : 'text-neutral-500 hover:text-black hover:bg-white/60'
          ]"
          title="Dashboard"
        >
          <LayoutGrid class="w-5 h-5" />
        </router-link>

        <!-- Kanban Board Icon (if in a board) -->
        <router-link
          v-if="currentPath.startsWith('/board/')"
          :to="currentPath"
          class="w-11 h-11 rounded-full flex items-center justify-center bg-black text-white shadow-md"
          title="Current Board"
        >
          <Layers class="w-5 h-5" />
        </router-link>

        <!-- Super Admin Control Center Icon -->
        <router-link
          v-if="authStore.isSuperAdmin"
          to="/admin/users"
          :class="[
            'w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200',
            currentPath === '/admin/users'
              ? 'bg-amber-400 text-black shadow-md font-bold'
              : 'text-amber-600 hover:text-black hover:bg-amber-100/60'
          ]"
          title="Super Admin Control Center"
        >
          <span class="text-base">👑</span>
        </router-link>

        <!-- Dummy Cal / Schedule icon for reference feel -->
        <button
          class="w-11 h-11 rounded-full flex items-center justify-center text-neutral-400 hover:text-black hover:bg-white/60 transition-colors"
          title="Calendar (Upcoming)"
        >
          <Calendar class="w-5 h-5" />
        </button>
      </nav>
    </div>

    <!-- Bottom Actions: Settings & Profile Avatar -->
    <div class="flex flex-col items-center gap-4">
      <div class="w-10 h-10 rounded-full bg-white/80 border border-[#E5E0D5] flex items-center justify-center text-neutral-500 hover:text-black cursor-pointer shadow-sm hover:scale-105 transition-all">
        <Settings class="w-4 h-4" />
      </div>

      <img
        v-if="authStore.currentUser?.avatar_url"
        :src="authStore.currentUser.avatar_url"
        :alt="authStore.currentUser.name"
        class="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow-sm"
      />
      <div
        v-else
        class="w-10 h-10 rounded-full bg-[#E5E0D5] border border-neutral-300 flex items-center justify-center text-neutral-600 shadow-sm"
        title="ยังไม่ได้เข้าสู่ระบบ"
      >
        <UserIcon class="w-4 h-4 text-neutral-600" />
      </div>
    </div>
  </aside>
</template>
