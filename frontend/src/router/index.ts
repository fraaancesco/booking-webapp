import { createRouter, createWebHistory } from 'vue-router'
import EventsView from '@/views/EventsView.vue'
import LoginView from '@/views/LoginView.vue'
import RegisterView from '@/views/RegisterView.vue'
import MyBookingsView from '@/views/MyBookingsView.vue'
import { useAuthStore } from '@/store/authStore'

const routes = [
  { path: '/', name: 'Events', component: EventsView },
  { path: '/login', name: 'Login', component: LoginView },
  { path: '/register', name: 'Register', component: RegisterView },
  {
    path: '/bookings',
    name: 'MyBookings',
    component: MyBookingsView,
    meta: { requiresAuth: true },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach((to) => {
  const authStore = useAuthStore()
  if (to.meta.requiresAuth && !authStore.isLoggedIn) {
    return { name: 'Login' }
  }
})

export default router
