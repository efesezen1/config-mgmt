<template>
  <nav
      class="border-b border-b-slate-800 w-full h-10 flex justify-between items-center px-6 py-7"
  >
    <Logo />
    <button
        type="button"
        id="profile_btn"
        class="btn-primary-color p-2 aspect-square w-10 rounded-full flex-center-col"
        @click="toggleMenu"
        aria-haspopup="true"
        aria-controls="overlay_menu"
    >
      <i class="pi pi-user"></i>
    </button>
    <div
        v-if="isMenuOpen"
        id="overlay_menu"
        class="absolute right-4 top-9 mt-2 w-48 rounded-md shadow-lg bg-slate-700 ring-1 ring-black ring-opacity-5 z-50"
    >
      <div class="py-1">
        <div class="px-4 py-2 text-sm text-white border-b border-slate-600">
          {{ mail }}
        </div>
        <button
            @click="handleLogout"
            class="w-full text-left px-4 py-2 text-sm text-white hover:bg-slate-600 flex items-center gap-2"
        >
          <i class="pi pi-sign-out"></i>
          Logout
        </button>
      </div>
    </div>
  </nav>
</template>

<script setup>
import {onMounted, onUnmounted, ref} from 'vue'
import {getAuth, signOut} from 'firebase/auth'
import {getCurrentUser} from '../utils'
import {useRouter} from 'vue-router'
import Logo from './Logo.vue'
const router = useRouter(),
    mail = ref(''),
    auth = getAuth(),
    isMenuOpen = ref(false),
    toggleMenu = () => {
      isMenuOpen.value = !isMenuOpen.value
    },
    handleLogout = async () => {
      try {
        await signOut(auth)
        console.log('Successfully signed out.')
        router.push('/signin')
      } catch (error) {
        console.error('Error signing out:', error)
      }
    },
    closeMenuOnClickOutside = (event) => {
      const menu = document.getElementById('overlay_menu'),
          button = event.target.closest('#profile_btn')
      if (isMenuOpen.value && !menu?.contains(event.target) && !button) {
        isMenuOpen.value = false
      }
    }


onMounted(() => {
  getCurrentUser().then((user) => {
    mail.value = user.email
  })
  document.addEventListener('click', closeMenuOnClickOutside)
})


onUnmounted(() => {
  document.removeEventListener('click', closeMenuOnClickOutside)
})
</script>

<script>
export default {
  components: {
    Logo
  }
}
</script>
