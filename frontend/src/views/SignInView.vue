<script setup>
import { ref } from 'vue'
import {
   getAuth,
   signInWithEmailAndPassword,
   signInWithCustomToken,
} from 'firebase/auth'
import { useRouter } from 'vue-router'
import $http from '../api/axios'

const email = ref('')
const password = ref('')
const router = useRouter()
const errMsg = ref()
const emailInput = ref(null)
const passwordInput = ref(null)
const date = new Date()
const isLoading = ref(false)

const getCustomToken = async (uid) => {
   try {
      console.log('Requesting custom token for UID:', uid)
      console.log('API URL:', import.meta.env.VITE_APP_API_URL)

      const response = await $http.post('/auth/token', { uid })
      console.log('Custom token response:', response.data)
      return response.data.customToken
   } catch (error) {
      console.error('Token error details:', {
         message: error.message,
         response: error.response?.data,
         status: error.response?.status,
         url: error.config?.url,
      })
      throw new Error('Failed to get custom token')
   }
}

const signIn = async () => {
   isLoading.value = true
   errMsg.value = ''
   const auth = getAuth()

   try {
      // First sign in with email and password
      const userCredential = await signInWithEmailAndPassword(
         auth,
         email.value,
         password.value
      )
      const user = userCredential.user
      console.log('Email/Password sign in successful, UID:', user.uid)

      try {
         // Get custom token from our backend
         const customToken = await getCustomToken(user.uid)
         console.log('Custom token received successfully', customToken)

         // Sign in with custom token
         await signInWithCustomToken(auth, customToken)
         console.log('Custom token sign in successful')

         // Only navigate if both steps are successful
         router.push({ name: 'panel' })
      } catch (tokenError) {
         console.error('Token error:', tokenError)
         errMsg.value = 'Failed to authenticate with server. Please try again.'
         throw tokenError
      }
   } catch (error) {
      console.error('Authentication error:', error)
      switch (error.code) {
         case 'auth/invalid-email':
            errMsg.value = 'Invalid email'
            emailInput.value?.focus()
            break
         case 'auth/user-not-found':
            errMsg.value = 'User not found'
            emailInput.value?.focus()
            break
         case 'auth/wrong-password':
            errMsg.value = 'Wrong password'
            password.value = ''
            passwordInput.value?.focus()
            break
         default:
            errMsg.value = error.message || 'Authentication failed'
            emailInput.value?.focus()
            break
      }
   } finally {
      isLoading.value = false
   }
}
</script>

<template>
   <div class="flex-center-col">
      <form
         @submit.prevent="signIn"
         class="container flex flex-col items-center gap-4 h-full py-10"
      >
         <img src="/icon.png" alt="" class="scale-50" />
         <div class="capitalize text-3xl">Please Sign In</div>
         <div class="signin-dimensions flex flex-col">
            <input
               ref="emailInput"
               type="email"
               v-model="email"
               placeholder="E-mail address"
               class="rounded-t-md input-style"
            />
            <input
               ref="passwordInput"
               type="password"
               v-model="password"
               placeholder="Password"
               class="rounded-b-md input-style"
            />
         </div>

         <button
            :disabled="isLoading"
            type="submit"
            class="signin-dimensions btn-primary-color p-3 rounded-md transition-all duration-300"
         >
            {{ isLoading ? 'Signing in...' : 'Sign in' }}
         </button>
         <div
            class="transition-all duration-300"
            :class="`${
               errMsg ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`"
         >
            {{ errMsg }}
         </div>
         <footer class="absolute bottom-0 right-0 p-10">
            <p class="opacity-50">Codeway &copy; {{ date.getFullYear() }}</p>
         </footer>
      </form>
   </div>
</template>

<style scoped></style>
