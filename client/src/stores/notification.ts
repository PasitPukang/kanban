import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { NotificationItem } from '../types'
import { storageService } from '../services/storage.service'
import { apiClient } from '../api/client'
import { useAuthStore } from './auth'

export const useNotificationStore = defineStore('notification', () => {
  const authStore = useAuthStore()
  const notifications = ref<NotificationItem[]>([])
  const isLoading = ref<boolean>(false)

  const unreadCount = computed(() => {
    return notifications.value.filter((n) => !n.is_read).length
  })

  // Load notifications
  const fetchNotifications = async () => {
    if (!authStore.currentUser) return
    isLoading.value = true
    try {
      if (authStore.dataMode === 'api' && authStore.token) {
        const res = await apiClient.get('/notifications')
        if (res.data.success) {
          notifications.value = res.data.data.notifications
        }
      } else {
        notifications.value = storageService.getNotifications(authStore.currentUser.id)
      }
    } catch (err) {
      console.error('Fetch notifications error:', err)
      notifications.value = storageService.getNotifications(authStore.currentUser.id)
    } finally {
      isLoading.value = false
    }
  }

  // Add Notification
  const addNotification = async (userId: string, title: string, message: string, link?: string) => {
    const item = storageService.addNotification(userId, title, message, link)
    if (authStore.currentUser?.id === userId) {
      notifications.value.unshift(item)
    }
  }

  // Mark single as read
  const markAsRead = async (id: string) => {
    const target = notifications.value.find((n) => n.id === id)
    if (target) {
      target.is_read = true
    }
    if (authStore.dataMode === 'api' && authStore.token) {
      try {
        await apiClient.patch(`/notifications/${id}/read`)
      } catch (err) {
        console.error('Mark read error:', err)
      }
    }
    storageService.markNotificationAsRead(id)
  }

  // Mark all as read
  const markAllAsRead = async () => {
    notifications.value.forEach((n) => (n.is_read = true))
    if (authStore.dataMode === 'api' && authStore.token) {
      try {
        await apiClient.post('/notifications/read-all')
      } catch (err) {
        console.error('Mark all read error:', err)
      }
    }
    if (authStore.currentUser) {
      storageService.markAllNotificationsAsRead(authStore.currentUser.id)
    }
  }

  return {
    notifications,
    unreadCount,
    isLoading,
    fetchNotifications,
    addNotification,
    markAsRead,
    markAllAsRead
  }
})
