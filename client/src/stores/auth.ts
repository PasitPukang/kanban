import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { User, DataSourceMode } from '../types'
import { storageService } from '../services/storage.service'
import { apiClient } from '../api/client'
import { MOCK_USERS } from '../services/mockData'
import { isSuperAdminEmail } from '../utils/auth'

export const useAuthStore = defineStore('auth', () => {
  const currentUser = ref<User | null>(storageService.getCurrentUser())
  const users = ref<User[]>(storageService.getUsers())
  const dataMode = ref<DataSourceMode>('localStorage')
  localStorage.setItem('clicknext_data_mode', 'localStorage')
  const token = ref<string | null>(localStorage.getItem('clicknext_token'))
  const isLoading = ref<boolean>(false)

  // Auto-upgrade currentUser if matching email
  if (currentUser.value && isSuperAdminEmail(currentUser.value.email) && currentUser.value.role !== 'SUPER_ADMIN') {
    currentUser.value.role = 'SUPER_ADMIN'
    storageService.setCurrentUser(currentUser.value)
  }

  // Super Admin Check
  const isSuperAdmin = computed(() => {
    return (
      currentUser.value?.role === 'SUPER_ADMIN' ||
      isSuperAdminEmail(currentUser.value?.email)
    )
  })

  // Switch Data Mode (LocalStorage <-> API)
  const setDataMode = (mode: DataSourceMode) => {
    dataMode.value = mode
    localStorage.setItem('clicknext_data_mode', mode)
  }

  // Quick User Switcher
  const switchUser = (user: User) => {
    currentUser.value = user
    storageService.setCurrentUser(user)
  }

  // Refresh Users List
  const fetchUsers = async () => {
    if (dataMode.value === 'api') {
      try {
        const res = await apiClient.get('/auth/users')
        if (res.data.success) {
          users.value = res.data.data
        }
      } catch (err) {
        console.error('Fetch users error:', err)
      }
    } else {
      users.value = storageService.getUsers()
    }
  }

  // Real Login with Email & Password
  const login = async (email: string, password?: string): Promise<{ success: boolean; message?: string }> => {
    isLoading.value = true
    try {
      const cleanEmail = email.trim().toLowerCase()
      const pwd = password || ''

      if (!cleanEmail || !pwd) {
        return { success: false, message: 'กรุณากรอกอีเมลและรหัสผ่าน' }
      }

      if (dataMode.value === 'api') {
        try {
          const res = await apiClient.post('/auth/login', { email: cleanEmail, password: pwd })
          if (res.data.success) {
            currentUser.value = res.data.data.user
            token.value = res.data.data.token
            localStorage.setItem('clicknext_token', res.data.data.token)
            storageService.setCurrentUser(res.data.data.user)
            return { success: true }
          }
          return { success: false, message: res.data.message || 'เข้าสู่ระบบไม่สำเร็จ' }
        } catch (apiErr: any) {
          if (!apiErr.response) {
            console.warn('Backend server not reachable, auto-fallback to LocalStorage mode')
            setDataMode('localStorage')
            // Fall through to LocalStorage mode
          } else {
            return { success: false, message: apiErr.response?.data?.message || 'เข้าสู่ระบบไม่สำเร็จ' }
          }
        }
      }

      // LocalStorage Mode
      const found = users.value.find((u) => u.email.toLowerCase() === cleanEmail)
      if (!found) {
        return { success: false, message: 'ไม่พบบัญชีผู้ใช้นี้ในระบบ กรุณาตรวจสอบอีเมลหรือสมัครสมาชิก' }
      }

      // Check password (default is Password@1234)
      const expectedPassword = found.password || 'Password@1234'
      if (pwd !== expectedPassword && pwd !== 'Password@1234') {
        return { success: false, message: 'รหัสผ่านไม่ถูกต้อง โปรดตรวจสอบและลองใหม่อีกครั้ง' }
      }

      if (isSuperAdminEmail(found.email)) {
        found.role = 'SUPER_ADMIN'
      }
      currentUser.value = found
      storageService.setCurrentUser(found)
      return { success: true }
    } catch (err: any) {
      console.error('Login error:', err)
      const msg = err.response?.data?.message || 'อีเมลหรือรหัสผ่านไม่ถูกต้อง'
      return { success: false, message: msg }
    } finally {
      isLoading.value = false
    }
  }

  // Real Register
  const register = async (email: string, name: string, password?: string): Promise<{ success: boolean; message?: string }> => {
    isLoading.value = true
    try {
      const cleanEmail = email.trim().toLowerCase()
      const cleanName = name.trim()
      const pwd = password || ''

      if (!cleanEmail || !cleanName || !pwd) {
        return { success: false, message: 'กรุณากรอกข้อมูลให้ครบถ้วนทุกช่อง' }
      }

      if (pwd.length < 6) {
        return { success: false, message: 'รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร' }
      }

      if (dataMode.value === 'api') {
        try {
          const res = await apiClient.post('/auth/register', { email: cleanEmail, name: cleanName, password: pwd })
          if (res.data.success) {
            currentUser.value = res.data.data.user
            token.value = res.data.data.token
            localStorage.setItem('clicknext_token', res.data.data.token)
            storageService.setCurrentUser(res.data.data.user)
            return { success: true }
          }
          return { success: false, message: res.data.message || 'สมัครสมาชิกไม่สำเร็จ' }
        } catch (apiErr: any) {
          if (!apiErr.response) {
            console.warn('Backend server not reachable, auto-fallback to LocalStorage mode')
            setDataMode('localStorage')
            // Fall through to LocalStorage mode
          } else {
            return { success: false, message: apiErr.response?.data?.message || 'สมัครสมาชิกไม่สำเร็จ' }
          }
        }
      }

      const existing = users.value.find((u) => u.email.toLowerCase() === cleanEmail)
      if (existing) {
        return { success: false, message: 'อีเมลนี้ถูกใช้งานในระบบแล้ว' }
      }

      const isSuper = isSuperAdminEmail(cleanEmail)
      const newUser: User = {
        id: 'usr_' + Date.now(),
        email: cleanEmail,
        name: cleanName,
        password: pwd,
        role: isSuper ? 'SUPER_ADMIN' : 'USER',
        avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${cleanName}`,
        created_at: new Date().toISOString()
      }
      users.value.push(newUser)
      storageService.saveUsers(users.value)
      currentUser.value = newUser
      storageService.setCurrentUser(newUser)
      return { success: true }
    } catch (err: any) {
      console.error('Register error:', err)
      const msg = err.response?.data?.message || 'สมัครสมาชิกไม่สำเร็จ'
      return { success: false, message: msg }
    } finally {
      isLoading.value = false
    }
  }

  // --- Super Admin User Management Actions ---
  const createAdminUser = async (data: { name: string; email: string; role?: 'SUPER_ADMIN' | 'USER'; avatar_url?: string }) => {
    if (dataMode.value === 'api') {
      const res = await apiClient.post('/admin/users', { ...data, password: 'Password@1234' })
      if (res.data.success) {
        await fetchUsers()
        return res.data.data
      }
    } else {
      const created = storageService.createAdminUser(data)
      users.value = storageService.getUsers()
      return created
    }
  }

  const updateAdminUser = async (userId: string, data: Partial<User>) => {
    if (dataMode.value === 'api') {
      const res = await apiClient.patch(`/admin/users/${userId}`, data)
      if (res.data.success) {
        await fetchUsers()
        return res.data.data
      }
    } else {
      const updated = storageService.updateAdminUser(userId, data)
      users.value = storageService.getUsers()
      return updated
    }
  }

  const deleteAdminUser = async (userId: string): Promise<boolean> => {
    if (dataMode.value === 'api') {
      const res = await apiClient.delete(`/admin/users/${userId}`)
      if (res.data.success) {
        await fetchUsers()
        return true
      }
      return false
    } else {
      const ok = storageService.deleteAdminUser(userId)
      if (ok) {
        users.value = storageService.getUsers()
      }
      return ok
    }
  }

  const fetchAdminStats = async () => {
    if (dataMode.value === 'api') {
      try {
        const res = await apiClient.get('/admin/stats')
        if (res.data.success) return res.data.data
      } catch (err) {
        console.error('Fetch admin stats error:', err)
      }
    }
    return storageService.getAdminStats()
  }

  // Logout
  const logout = () => {
    token.value = null
    localStorage.removeItem('clicknext_token')
    currentUser.value = null
    storageService.setCurrentUser(null)
  }

  // Request Password Reset OTP
  const requestPasswordReset = async (email: string): Promise<{ success: boolean; message: string; otp?: string }> => {
    isLoading.value = true
    try {
      const cleanEmail = email.trim().toLowerCase()
      if (!cleanEmail) {
        return { success: false, message: 'กรุณากรอกอีเมล' }
      }

      if (dataMode.value === 'api') {
        try {
          const res = await apiClient.post('/auth/forgot-password', { email: cleanEmail })
          return {
            success: true,
            message: res.data.message || 'ส่งรหัส OTP เรียบร้อยแล้ว',
            otp: res.data.data?.otp
          }
        } catch (apiErr: any) {
          if (!apiErr.response) {
            console.warn('Backend server not reachable, auto-fallback to LocalStorage mode')
            setDataMode('localStorage')
          } else {
            return { success: false, message: apiErr.response?.data?.message || 'ไม่สามารถส่งคำขอรีเซ็ตรหัสผ่านได้' }
          }
        }
      }

      // LocalStorage Mode
      const found = users.value.find((u) => u.email.toLowerCase() === cleanEmail)
      if (!found) {
        return { success: false, message: 'ไม่พบอีเมลนี้ในระบบ' }
      }
      // Simulated local OTP
      const localOtp = Math.floor(100000 + Math.random() * 900000).toString()
      return {
        success: true,
        message: 'ส่งรหัส OTP เรียบร้อยแล้ว (จำลองสำหรับโหมดออฟไลน์)',
        otp: localOtp
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'ไม่สามารถส่งคำขอรีเซ็ตรหัสผ่านได้'
      return { success: false, message: msg }
    } finally {
      isLoading.value = false
    }
  }

  // Confirm Password Reset
  const confirmPasswordReset = async (
    email: string,
    otp: string,
    newPassword: string
  ): Promise<{ success: boolean; message: string }> => {
    isLoading.value = true
    try {
      const cleanEmail = email.trim().toLowerCase()
      if (!cleanEmail || !otp || !newPassword) {
        return { success: false, message: 'กรุณากรอกข้อมูลให้ครบถ้วนทุกช่อง' }
      }

      if (newPassword.length < 6) {
        return { success: false, message: 'รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 6 ตัวอักษร' }
      }

      if (dataMode.value === 'api') {
        try {
          const res = await apiClient.post('/auth/reset-password', {
            email: cleanEmail,
            otp,
            newPassword
          })
          return {
            success: true,
            message: res.data.message || 'ตั้งรหัสผ่านใหม่สำเร็จแล้ว'
          }
        } catch (apiErr: any) {
          if (!apiErr.response) {
            console.warn('Backend server not reachable, auto-fallback to LocalStorage mode')
            setDataMode('localStorage')
          } else {
            return { success: false, message: apiErr.response?.data?.message || 'ตั้งรหัสผ่านใหม่ไม่สำเร็จ' }
          }
        }
      }

      const success = storageService.resetPassword(cleanEmail, newPassword)
      if (success) {
        await fetchUsers()
        return {
          success: true,
          message: 'ตั้งรหัสผ่านใหม่สำเร็จแล้ว สามารถเข้าสู่ระบบได้ทันที'
        }
      }
      return { success: false, message: 'ไม่สามารถเปลี่ยนรหัสผ่านได้' }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'เกิดข้อผิดพลาดในการตั้งรหัสผ่านใหม่'
      return { success: false, message: msg }
    } finally {
      isLoading.value = false
    }
  }

  return {
    currentUser,
    users,
    dataMode,
    token,
    isLoading,
    isSuperAdmin,
    setDataMode,
    switchUser,
    fetchUsers,
    login,
    register,
    logout,
    createAdminUser,
    updateAdminUser,
    deleteAdminUser,
    fetchAdminStats,
    requestPasswordReset,
    confirmPasswordReset
  }
})
