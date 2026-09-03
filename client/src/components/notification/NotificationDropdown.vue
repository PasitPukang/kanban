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

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  notiStore.fetchNotifications()
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
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
      class="relative p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
      title="Notifications"
    >
      <Bell class="w-5 h-5" />
      <!-- Red Badge -->
      <span
        v-if="notiStore.unreadCount > 0"
        class="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-rose-500 rounded-full animate-pulse shadow-sm"
      >
        {{ notiStore.unreadCount > 9 ? '9+' : notiStore.unreadCount }}
      </span>
    </button>

    <!-- Dropdown Menu -->
    <div
      v-if="isOpen"
      class="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
    >
      <!-- Header -->
      <div class="px-4 py-3 bg-slate-800/90 border-b border-slate-700 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="font-semibold text-white text-sm">การแจ้งเตือน</span>
          <span
            v-if="notiStore.unreadCount > 0"
            class="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full font-medium"
          >
            {{ notiStore.unreadCount }} ใหม่
          </span>
        </div>
        <button
          v-if="notiStore.unreadCount > 0"
          @click="handleMarkAllRead"
          class="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium transition-colors"
        >
          <CheckCheck class="w-3.5 h-3.5" />
          อ่านทั้งหมด
        </button>
      </div>

      <!-- Notification List -->
      <div class="max-h-80 overflow-y-auto divide-y divide-slate-700/60">
        <div
          v-if="notiStore.notifications.length === 0"
          class="py-8 text-center text-slate-400 flex flex-col items-center gap-2"
        >
          <Inbox class="w-8 h-8 text-slate-500 stroke-1" />
          <p class="text-xs">ยังไม่มีการแจ้งเตือนในระบบ</p>
        </div>

        <div
          v-for="item in notiStore.notifications"
          :key="item.id"
          @click="handleMarkRead(item.id)"
          :class="[
            'p-3.5 transition-colors cursor-pointer text-left',
            item.is_read ? 'bg-slate-800/40 hover:bg-slate-700/30' : 'bg-indigo-950/30 hover:bg-indigo-900/40'
          ]"
        >
          <div class="flex items-start justify-between gap-2">
            <div class="flex items-center gap-2">
              <span
                v-if="!item.is_read"
                class="w-2 h-2 rounded-full bg-rose-500 flex-shrink-0"
              ></span>
              <h4
                :class="[
                  'text-xs font-semibold',
                  item.is_read ? 'text-slate-300' : 'text-indigo-200'
                ]"
              >
                {{ item.title }}
              </h4>
            </div>
            <span class="text-[10px] text-slate-400 flex-shrink-0">
              {{ new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}
            </span>
          </div>
          <p class="text-xs text-slate-300 mt-1 pl-4 leading-relaxed">
            {{ item.message }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
