<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useNotificationStore } from '../../stores/notification'
import { Bell, CheckCheck, Inbox } from 'lucide-vue-next'

const notiStore = useNotificationStore()
const isOpen = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)

const toggleDropdown = () => {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    notiStore.fetchNotifications()
  }
}

const handleClickOutside = (event: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    isOpen.value = false
  }
}

const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && isOpen.value) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('keydown', handleKeyDown)
  notiStore.fetchNotifications()
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('keydown', handleKeyDown)
})

const handleMarkAllRead = () => {
  notiStore.markAllAsRead()
}

const handleMarkRead = (id: string) => {
  notiStore.markAsRead(id)
}
</script>

<template>
  <div class="relative" ref="dropdownRef">
    <!-- Bell Button -->
    <button
      @click="toggleDropdown"
      class="relative p-2 text-neutral-600 hover:text-black hover:bg-white rounded-full border border-transparent hover:border-[#E5E0D5] transition-all focus:outline-none shadow-2xs"
      title="การแจ้งเตือน (Notifications)"
    >
      <Bell class="w-4 h-4" />
      <!-- Red Badge -->
      <span
        v-if="notiStore.unreadCount > 0"
        class="absolute top-0.5 right-0.5 flex items-center justify-center min-w-[16px] h-[16px] px-1 text-[9px] font-bold text-white bg-rose-500 rounded-full animate-pulse shadow-xs"
      >
        {{ notiStore.unreadCount > 9 ? '9+' : notiStore.unreadCount }}
      </span>
    </button>

    <!-- Dropdown Menu -->
    <div
      v-if="isOpen"
      class="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-[#E5E0D5] rounded-3xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
    >
      <!-- Header -->
      <div class="px-5 py-3.5 bg-[#FAF8F5] border-b border-[#F0ECE1] flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="font-display font-bold text-neutral-900 text-sm">การแจ้งเตือน</span>
          <span
            v-if="notiStore.unreadCount > 0"
            class="text-[10px] bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full font-bold border border-rose-200"
          >
            {{ notiStore.unreadCount }} ใหม่
          </span>
        </div>
        <button
          v-if="notiStore.unreadCount > 0"
          @click="handleMarkAllRead"
          class="text-xs text-neutral-500 hover:text-black flex items-center gap-1 font-semibold transition-colors"
        >
          <CheckCheck class="w-3.5 h-3.5" />
          อ่านทั้งหมด
        </button>
      </div>

      <!-- Notification List -->
      <div class="max-h-80 overflow-y-auto divide-y divide-[#F0ECE1]">
        <div
          v-if="notiStore.notifications.length === 0"
          class="py-8 text-center text-neutral-400 flex flex-col items-center gap-2"
        >
          <Inbox class="w-8 h-8 text-neutral-300 stroke-1" />
          <p class="text-xs">ยังไม่มีการแจ้งเตือนในระบบ</p>
        </div>

        <div
          v-for="item in notiStore.notifications"
          :key="item.id"
          @click="handleMarkRead(item.id)"
          :class="[
            'p-4 transition-colors cursor-pointer text-left',
            item.is_read ? 'bg-white hover:bg-[#FAF8F5]' : 'bg-[#FFFDF9] hover:bg-[#FAF6EE]'
          ]"
        >
          <div class="flex items-start justify-between gap-2">
            <div class="flex items-center gap-2 min-w-0">
              <span
                v-if="!item.is_read"
                class="w-2 h-2 rounded-full bg-rose-500 flex-shrink-0"
              ></span>
              <h4
                :class="[
                  'text-xs truncate',
                  item.is_read ? 'font-medium text-neutral-600' : 'font-bold text-neutral-900'
                ]"
              >
                {{ item.title }}
              </h4>
            </div>
            <span class="text-[10px] text-neutral-400 font-mono flex-shrink-0">
              {{ new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}
            </span>
          </div>
          <p class="text-xs text-neutral-500 mt-1 pl-4 leading-relaxed line-clamp-2">
            {{ item.message }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
