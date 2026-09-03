import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '../views/DashboardView.vue'
import BoardDetailView from '../views/BoardDetailView.vue'
import LoginView from '../views/LoginView.vue'
import AdminUsersView from '../views/AdminUsersView.vue'
import { useAuthStore } from '../stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/dashboard'
    },
    {
      path: '/dashboard',
      name: 'Dashboard',
      component: DashboardView,
      meta: { requiresAuth: true }
    },
    {
      path: '/board/:id',
      name: 'BoardDetail',
      component: BoardDetailView,
      props: true,
      meta: { requiresAuth: true }
    },
    {
      path: '/admin/users',
      name: 'AdminUsers',
      component: AdminUsersView,
      meta: { requiresAuth: true, requiresSuperAdmin: true }
    },
    {
      path: '/login',
      name: 'Login',
      component: LoginView
    }
  ]
})

router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth && !authStore.currentUser) {
    next({ name: 'Login' })
  } else if (to.meta.requiresSuperAdmin && !authStore.isSuperAdmin) {
    next({ name: 'Dashboard' })
  } else if (to.name === 'Login' && authStore.currentUser) {
    next({ name: 'Dashboard' })
  } else {
    next()
  }
})

export default router
