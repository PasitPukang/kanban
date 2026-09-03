<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import SidebarDock from './components/layout/SidebarDock.vue'
import RightWidgetPanel from './components/layout/RightWidgetPanel.vue'
import Navbar from './components/layout/Navbar.vue'

const route = useRoute()
const isAuthPage = computed(() => route.path === '/login')
</script>

<template>
  <div class="min-h-screen bg-[#F7F5F0] text-[#1A1A1A] flex flex-col font-sans selection:bg-black selection:text-white">
    <!-- Top Bar for header controls -->
    <Navbar />

    <!-- Main Workspace: Left Pill Dock + Content Canvas + Right Widget Panel -->
    <div class="flex-1 flex w-full max-w-[1720px] mx-auto overflow-hidden">
      <!-- Left Vertical Pill Dock (Hidden on Auth pages) -->
      <SidebarDock v-if="!isAuthPage" />

      <!-- Center Dynamic Content Canvas -->
      <main class="flex-1 min-w-0 overflow-y-auto px-4 sm:px-6 py-5 flex flex-col justify-center">
        <router-view />
      </main>

      <!-- Right Companion Panel (Hidden on Auth pages) -->
      <RightWidgetPanel v-if="!isAuthPage" />
    </div>
  </div>
</template>
