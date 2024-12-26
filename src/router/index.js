import { createRouter, createWebHistory } from 'vue-router'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { getCurrentUser } from '../utils/getCurrentUser'
const routes = [
   {
      path: '/',
      name: 'panel',
      component: () => import('../views/PanelView.vue'),
      meta: {
         requiresAuth: true,
      },
   },
   {
      path: '/signin',
      name: 'signin',
      component: () => import('../views/SignInView.vue'),
   },
]

const router = createRouter({
   history: createWebHistory(import.meta.env.BASE_URL),
   routes,
})

router.beforeEach(async (to, from, next) => {
   console.log(to, from, next)
   if (to.matched.some((record) => record.meta.requiresAuth)) {
      if (await getCurrentUser()) {
         console.log('User authenticated')
         next()
      } else {
         // User is NOT authenticated and trying to access an authenticated route
         next('/signin') // Redirect to login page instead of home page
      }
   } else {
      // If user IS authenticated, then should redirected to main page
      if (to.path === '/signin' && (await getCurrentUser())) {
         next('/')
      } else {
         next()
      }
   }
})

export default router
