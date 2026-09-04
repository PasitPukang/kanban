<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import {
  GraduationCap,
  BookOpen,
  Layers,
  Crown,
  User as UserIcon
} from 'lucide-vue-next'
import { useAuthStore } from '../../stores/auth'

const route = useRoute()
const authStore = useAuthStore()

const currentPath = computed(() => route.path)
</script>

<template>
  <aside class="hidden lg:flex flex-col items-center w-18 py-5 px-2.5 bg-white/90 backdrop-blur-md rounded-[28px] my-6 ml-6 shadow-soft border border-[#E8E4D9] flex-shrink-0 z-30 self-start gap-5 transition-all">
    <!-- Brand Homework Logo Top -->
    <router-link
      to="/dashboard"
      class="w-11 h-11 rounded-2xl bg-amber-500 text-white flex items-center justify-center hover:scale-105 transition-all shadow-sm hover:bg-amber-600"
      title="สมุดการบ้าน (Clicknext Homework Hub)"
    >
      <GraduationCap class="w-5 h-5 text-white" />
    </router-link>

    <div class="w-8 h-px bg-[#EAE6DC]"></div>

    <!-- Navigation Icons Stack -->
    <nav class="flex flex-col items-center gap-2.5">
      <!-- Homework Boards / Subjects -->
      <router-link
        to="/dashboard"
        :class="[
          'w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-200',
          currentPath === '/dashboard' || currentPath === '/'
            ? 'bg-neutral-900 text-white shadow-sm'
            : 'text-neutral-500 hover:text-black hover:bg-[#F5F2EB]'
        ]"
        title="สมุดการบ้านทั้งหมด (All Homework Boards)"
      >
        <BookOpen class="w-4 h-4" />
      </router-link>

      <!-- Active Homework Board Icon (if in a board) -->
      <router-link
        v-if="currentPath.startsWith('/board/')"
        :to="currentPath"
        class="w-10 h-10 rounded-2xl flex items-center justify-center bg-indigo-600 text-white shadow-sm hover:bg-indigo-700 transition-all"
        title="การบ้านวิชาปัจจุบัน (Current Subject Board)"
      >
        <Layers class="w-4 h-4" />
      </router-link>

      <!-- Super Admin Control Center Icon -->
      <router-link
        v-if="authStore.isSuperAdmin"
        to="/admin/users"
        :class="[
          'w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-200',
          currentPath === '/admin/users'
            ? 'bg-amber-400 text-neutral-900 shadow-sm font-bold'
            : 'text-amber-600 hover:text-black hover:bg-amber-100/70'
        ]"
        title="จัดการระบบ & รายชื่อนักเรียน/อาจารย์ (Super Admin)"
      >
        <Crown class="w-4 h-4" />
      </router-link>
    </nav>

    <div class="w-8 h-px bg-[#EAE6DC]"></div>

    <!-- Bottom Actions: Profile Avatar -->
    <div class="flex flex-col items-center">
      <img
        v-if="authStore.currentUser?.avatar_url"
        :src="authStore.currentUser.avatar_url"
        :alt="authStore.currentUser.name"
        class="w-9 h-9 rounded-full object-cover ring-2 ring-white shadow-xs"
        :title="authStore.currentUser.name"
      />
      <div
        v-else
        class="w-9 h-9 rounded-full bg-[#E5E0D5] border border-neutral-300 flex items-center justify-center text-neutral-600 shadow-xs"
        title="ยังไม่ได้เข้าสู่ระบบ"
      >
        <UserIcon class="w-4 h-4 text-neutral-600" />
      </div>
    </div>
  </aside>
</template>
