<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  ShieldAlert,
  ShieldCheck,
  UserPlus,
  Users,
  Search,
  Edit2,
  Trash2,
  ArrowLeft,
  Lock,
  Mail,
  User as UserIcon,
  Check,
  X,
  Database,
  Layers,
  Sparkles
} from 'lucide-vue-next'
import { useAuthStore } from '../stores/auth'
import { User } from '../types'

const router = useRouter()
const authStore = useAuthStore()

const searchQuery = ref('')
const stats = ref({
  totalUsers: 0,
  superAdmins: 0,
  totalBoards: 0,
  totalTasks: 0
})

// Modal states
const isCreateModalOpen = ref(false)
const isEditModalOpen = ref(false)
const selectedUser = ref<User | null>(null)

// Form fields
const formName = ref('')
const formEmail = ref('')
const formRole = ref<'SUPER_ADMIN' | 'USER'>('USER')
const formPassword = ref('')
const formError = ref('')

const loadData = async () => {
  await authStore.fetchUsers()
  const s = await authStore.fetchAdminStats()
  if (s) {
    stats.value = s
  }
}

onMounted(() => {
  if (!authStore.isSuperAdmin) {
    // Redirection if not super admin
    router.replace('/dashboard')
    return
  }
  loadData()
})

const filteredUsers = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return authStore.users
  return authStore.users.filter(
    (u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
  )
})

// Open Create Modal
const openCreateModal = () => {
  formName.value = ''
  formEmail.value = ''
  formRole.value = 'USER'
  formPassword.value = 'Password@1234'
  formError.value = ''
  isCreateModalOpen.value = true
}

const handleCreateUser = async () => {
  if (!formName.value.trim() || !formEmail.value.trim()) {
    formError.value = 'กรุณากรอกชื่อและอีเมลให้ครบถ้วน'
    return
  }

  await authStore.createAdminUser({
    name: formName.value.trim(),
    email: formEmail.value.trim(),
    role: formRole.value
  })

  isCreateModalOpen.value = false
  await loadData()
}

// Open Edit Modal
const openEditModal = (user: User) => {
  selectedUser.value = user
  formName.value = user.name
  formEmail.value = user.email
  formRole.value = user.role || 'USER'
  formError.value = ''
  isEditModalOpen.value = true
}

const handleUpdateUser = async () => {
  if (!selectedUser.value) return
  if (!formName.value.trim() || !formEmail.value.trim()) {
    formError.value = 'กรุณากรอกชื่อและอีเมลให้ครบถ้วน'
    return
  }

  await authStore.updateAdminUser(selectedUser.value.id, {
    name: formName.value.trim(),
    email: formEmail.value.trim(),
    role: formRole.value
  })

  isEditModalOpen.value = false
  selectedUser.value = null
  await loadData()
}

const isSuperAdminEmail = (email?: string): boolean => {
  if (!email) return false
  const clean = email.trim().toLowerCase()
  return (
    clean === 'pasitpukang1234567@gmail.com'
  )
}

// Delete User
const handleDeleteUser = async (user: User) => {
  if (isSuperAdminEmail(user.email)) {
    alert('ไม่สามารถลบบัญชี Super Admin หลักได้')
    return
  }

  if (confirm(`คุณแน่ใจหรือไม่ที่จะลบผู้ใช้ "${user.name}" (${user.email}) ออกจากระบบ?`)) {
    const success = await authStore.deleteAdminUser(user.id)
    if (success) {
      await loadData()
    }
  }
}
</script>

<template>
  <div class="max-w-6xl mx-auto space-y-7 pb-10">
    <!-- Top Header Bar -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
      <div class="flex items-center gap-3">
        <router-link
          to="/dashboard"
          class="w-10 h-10 rounded-full bg-white border border-[#E5E0D5] flex items-center justify-center text-neutral-600 hover:text-black hover:bg-[#FAF8F5] transition-colors shadow-2xs"
        >
          <ArrowLeft class="w-4 h-4" />
        </router-link>
        <div>
          <h1 class="font-display font-extrabold text-2xl sm:text-3xl text-neutral-900 tracking-tight flex items-center gap-2.5">
            <span class="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-black text-amber-400 shadow-sm">
              👑
            </span>
            Super Admin Control Center
          </h1>
          <p class="text-xs text-neutral-500 mt-0.5 font-medium">
            จัดการบัญชีผู้ใช้ สิทธิ์ และความปลอดภัยระดับสูงสุดในระบบ (เฉพาะ psitpukang1234567@gmail.com)
          </p>
        </div>
      </div>

      <button
        @click="openCreateModal"
        class="flex items-center gap-2 px-5 py-2.5 rounded-full bg-black text-white hover:bg-neutral-800 text-xs font-bold shadow-md hover:scale-105 active:scale-95 transition-all flex-shrink-0"
      >
        <UserPlus class="w-4 h-4" />
        เพิ่มผู้ใช้ใหม่ (Add User)
      </button>
    </div>

    <!-- Stats Bento Row (Matching Neo-Bento Palette) -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- Card 1: Total Users -->
      <div class="bg-[#FCE7E7] border border-[#F7CACA] rounded-3xl p-5 shadow-2xs flex flex-col justify-between">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-[#852C2C] uppercase tracking-wider">ผู้ใช้ทั้งหมด</span>
          <Users class="w-4 h-4 text-[#852C2C]" />
        </div>
        <div class="mt-4">
          <span class="font-display font-extrabold text-3xl text-neutral-900">{{ stats.totalUsers }}</span>
          <span class="text-xs text-[#852C2C] ml-1 font-medium">บัญชี</span>
        </div>
      </div>

      <!-- Card 2: Super Admins -->
      <div class="bg-[#FEF0DC] border border-[#FBE0B8] rounded-3xl p-5 shadow-2xs flex flex-col justify-between">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-[#8A5617] uppercase tracking-wider">Super Admin</span>
          <ShieldCheck class="w-4 h-4 text-[#8A5617]" />
        </div>
        <div class="mt-4">
          <span class="font-display font-extrabold text-3xl text-neutral-900">{{ stats.superAdmins }}</span>
          <span class="text-xs text-[#8A5617] ml-1 font-medium">ผู้ดูแลระบบ</span>
        </div>
      </div>

      <!-- Card 3: Total Boards -->
      <div class="bg-[#E6EAFF] border border-[#CAD2FD] rounded-3xl p-5 shadow-2xs flex flex-col justify-between">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-[#2D3E8D] uppercase tracking-wider">กระดานทั้งหมด</span>
          <Layers class="w-4 h-4 text-[#2D3E8D]" />
        </div>
        <div class="mt-4">
          <span class="font-display font-extrabold text-3xl text-neutral-900">{{ stats.totalBoards }}</span>
          <span class="text-xs text-[#2D3E8D] ml-1 font-medium">บอร์ด</span>
        </div>
      </div>

      <!-- Card 4: Total Tasks -->
      <div class="bg-[#DFF6EC] border border-[#B6EAD5] rounded-3xl p-5 shadow-2xs flex flex-col justify-between">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-[#1E734B] uppercase tracking-wider">การ์ดงานทั้งหมด</span>
          <Database class="w-4 h-4 text-[#1E734B]" />
        </div>
        <div class="mt-4">
          <span class="font-display font-extrabold text-3xl text-neutral-900">{{ stats.totalTasks }}</span>
          <span class="text-xs text-[#1E734B] ml-1 font-medium">งาน</span>
        </div>
      </div>
    </div>

    <!-- User Management Section -->
    <div class="bg-white border border-[#E5E0D5] rounded-[32px] p-6 sm:p-7 shadow-soft space-y-5">
      <!-- Search & Filter Bar -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h3 class="font-display font-bold text-base text-neutral-900 flex items-center gap-2">
          <span>รายชื่อบัญชีผู้ใช้ในระบบ (User Directory)</span>
          <span class="text-xs font-mono font-bold bg-[#FAF8F5] border border-[#E5E0D5] px-2.5 py-0.5 rounded-full text-neutral-600">
            {{ filteredUsers.length }}
          </span>
        </h3>

        <div class="relative w-full sm:w-72">
          <Search class="w-3.5 h-3.5 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="ค้นหาด้วยชื่อ หรือ อีเมล..."
            class="w-full pl-9 pr-4 py-2 bg-[#FAF8F5] border border-[#E5E0D5] rounded-full text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-black"
          />
        </div>
      </div>

      <!-- Users Table -->
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="border-b border-[#F0ECE1] text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
              <th class="py-3 px-4">ผู้ใช้งาน</th>
              <th class="py-3 px-4">อีเมล</th>
              <th class="py-3 px-4">สิทธิ์ (Role)</th>
              <th class="py-3 px-4 text-right">การจัดการ</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[#F5F2EA] text-xs">
            <tr
              v-for="user in filteredUsers"
              :key="user.id"
              class="hover:bg-[#FAF8F5]/80 transition-colors group"
            >
              <!-- Name & Avatar -->
              <td class="py-3.5 px-4">
                <div class="flex items-center gap-3">
                  <img
                    :src="user.avatar_url || ''"
                    class="w-8 h-8 rounded-full object-cover ring-1 ring-neutral-200"
                  />
                  <div>
                    <span class="font-bold text-neutral-900 block">{{ user.name }}</span>
                    <span
                      v-if="isSuperAdminEmail(user.email)"
                      class="text-[10px] text-amber-600 font-semibold"
                    >
                      ★ Primary Super Admin
                    </span>
                  </div>
                </div>
              </td>

              <!-- Email -->
              <td class="py-3.5 px-4 font-mono text-neutral-600">
                {{ user.email }}
              </td>

              <!-- Role Badge -->
              <td class="py-3.5 px-4">
                <span
                  v-if="user.role === 'SUPER_ADMIN' || isSuperAdminEmail(user.email)"
                  class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold bg-neutral-900 text-amber-300 shadow-2xs"
                >
                  👑 SUPER_ADMIN
                </span>
                <span
                  v-else
                  class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold bg-[#DFF6EC] text-[#1E734B] border border-[#B6EAD5]"
                >
                  <UserIcon class="w-3 h-3" /> USER
                </span>
              </td>

              <!-- Action Buttons -->
              <td class="py-3.5 px-4 text-right">
                <div class="flex items-center justify-end gap-1.5">
                  <!-- Edit Button -->
                  <button
                    @click="openEditModal(user)"
                    class="p-2 rounded-xl text-neutral-500 hover:text-black hover:bg-neutral-100 transition-colors"
                    title="แก้ไขข้อมูลผู้ใช้"
                  >
                    <Edit2 class="w-3.5 h-3.5" />
                  </button>

                  <!-- Delete Button -->
                  <button
                    v-if="!isSuperAdminEmail(user.email)"
                    @click="handleDeleteUser(user)"
                    class="p-2 rounded-xl text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                    title="ลบผู้ใช้นี้"
                  >
                    <Trash2 class="w-3.5 h-3.5" />
                  </button>
                  <span v-else class="text-[10px] text-neutral-400 italic px-2">
                    (ระบบหลัก)
                  </span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Create User Modal -->
    <div
      v-if="isCreateModalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in"
    >
      <div class="bg-white border border-[#E5E0D5] rounded-[32px] w-full max-w-md p-7 shadow-2xl space-y-4 animate-in zoom-in-95">
        <div class="flex items-center justify-between pb-3 border-b border-[#F0ECE1]">
          <h3 class="font-display font-bold text-base text-neutral-900 flex items-center gap-2">
            <UserPlus class="w-4 h-4 text-black" />
            เพิ่มผู้ใช้ใหม่ (New User)
          </h3>
          <button @click="isCreateModalOpen = false" class="p-1 rounded-full text-neutral-400 hover:text-black">
            <X class="w-4 h-4" />
          </button>
        </div>

        <div class="space-y-3">
          <div>
            <label class="block text-xs font-bold text-neutral-700 mb-1">ชื่อ-นามสกุล *</label>
            <input
              v-model="formName"
              type="text"
              placeholder="เช่น นายสมชาย สายลุย"
              class="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E5E0D5] rounded-2xl text-xs text-neutral-900 focus:outline-none focus:border-black"
            />
          </div>

          <div>
            <label class="block text-xs font-bold text-neutral-700 mb-1">อีเมล *</label>
            <input
              v-model="formEmail"
              type="email"
              placeholder="user@clicknext.com"
              class="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E5E0D5] rounded-2xl text-xs text-neutral-900 focus:outline-none focus:border-black"
            />
          </div>

          <div>
            <label class="block text-xs font-bold text-neutral-700 mb-1">กำหนดสิทธิ์ (Role)</label>
            <select
              v-model="formRole"
              class="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E5E0D5] rounded-2xl text-xs text-neutral-900 focus:outline-none focus:border-black"
            >
              <option value="USER">USER (ผู้ใช้งานทั่วไป)</option>
              <option value="SUPER_ADMIN">SUPER_ADMIN (ผู้ดูแลระบบสูงสุด)</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-bold text-neutral-700 mb-1">รหัสผ่านเริ่มต้น</label>
            <input
              v-model="formPassword"
              type="text"
              class="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E5E0D5] rounded-2xl text-xs text-neutral-900 font-mono"
            />
          </div>

          <p v-if="formError" class="text-xs text-rose-500 font-medium">{{ formError }}</p>
        </div>

        <div class="pt-3 flex items-center justify-end gap-2 border-t border-[#F0ECE1]">
          <button
            @click="isCreateModalOpen = false"
            class="px-4 py-2 rounded-full text-xs font-medium text-neutral-500 hover:text-black"
          >
            ยกเลิก
          </button>
          <button
            @click="handleCreateUser"
            class="px-5 py-2 rounded-full text-xs font-bold text-white bg-black hover:bg-neutral-800 transition-colors shadow-sm"
          >
            บันทึกผู้ใช้
          </button>
        </div>
      </div>
    </div>

    <!-- Edit User Modal -->
    <div
      v-if="isEditModalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in"
    >
      <div class="bg-white border border-[#E5E0D5] rounded-[32px] w-full max-w-md p-7 shadow-2xl space-y-4 animate-in zoom-in-95">
        <div class="flex items-center justify-between pb-3 border-b border-[#F0ECE1]">
          <h3 class="font-display font-bold text-base text-neutral-900 flex items-center gap-2">
            <Edit2 class="w-4 h-4 text-black" />
            แก้ไขข้อมูลผู้ใช้ (Edit User)
          </h3>
          <button @click="isEditModalOpen = false" class="p-1 rounded-full text-neutral-400 hover:text-black">
            <X class="w-4 h-4" />
          </button>
        </div>

        <div class="space-y-3">
          <div>
            <label class="block text-xs font-bold text-neutral-700 mb-1">ชื่อ-นามสกุล</label>
            <input
              v-model="formName"
              type="text"
              class="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E5E0D5] rounded-2xl text-xs text-neutral-900 focus:outline-none focus:border-black"
            />
          </div>

          <div>
            <label class="block text-xs font-bold text-neutral-700 mb-1">อีเมล</label>
            <input
              v-model="formEmail"
              type="email"
              class="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E5E0D5] rounded-2xl text-xs text-neutral-900 focus:outline-none focus:border-black"
            />
          </div>

          <div>
            <label class="block text-xs font-bold text-neutral-700 mb-1">สิทธิ์ (Role)</label>
            <select
              v-model="formRole"
              :disabled="isSuperAdminEmail(selectedUser?.email)"
              class="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E5E0D5] rounded-2xl text-xs text-neutral-900 focus:outline-none focus:border-black disabled:opacity-60"
            >
              <option value="USER">USER (ผู้ใช้งานทั่วไป)</option>
              <option value="SUPER_ADMIN">SUPER_ADMIN (ผู้ดูแลระบบสูงสุด)</option>
            </select>
          </div>

          <p v-if="formError" class="text-xs text-rose-500 font-medium">{{ formError }}</p>
        </div>

        <div class="pt-3 flex items-center justify-end gap-2 border-t border-[#F0ECE1]">
          <button
            @click="isEditModalOpen = false"
            class="px-4 py-2 rounded-full text-xs font-medium text-neutral-500 hover:text-black"
          >
            ยกเลิก
          </button>
          <button
            @click="handleUpdateUser"
            class="px-5 py-2 rounded-full text-xs font-bold text-white bg-black hover:bg-neutral-800 transition-colors shadow-sm"
          >
            บันทึกการแก้ไข
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
