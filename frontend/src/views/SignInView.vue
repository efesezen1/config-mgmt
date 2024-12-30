<script setup>
import { ref } from 'vue'
import {
   getAuth,
   signInWithEmailAndPassword,
   signInWithCustomToken,
} from 'firebase/auth'
import { useRouter } from 'vue-router'

const email = ref('')
const password = ref('')
const router = useRouter()
const errMsg = ref()
const emailInput = ref(null)
const passwordInput = ref(null)
const date = new Date()
const isLoading = ref(false)

const getCustomToken = async (uid) => {
   const response = await fetch('http://localhost:3000/api/v1/auth/token', {
      method: 'POST',
      headers: {
         'Content-Type': 'application/json',
      },
      body: JSON.stringify({ uid }),
   })

   if (!response.ok) {
      const error = await response.json()
      console.error('Token error:', error)
      throw new Error('Failed to get custom token')
   }

   const { customToken } = await response.json()
   return customToken
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
      console.log('Email/Password sign in successful')

      // Get custom token from our backend
      const customToken = await getCustomToken(user.uid)
      console.log('Got custom token', customToken)

      // Sign in with custom token
      await signInWithCustomToken(auth, customToken)
      console.log('Custom token sign in successful')

      // Get the ID token
      const idToken = await auth.currentUser.getIdToken()

      router.push({ name: 'panel' })
   } catch (error) {
      console.log(error.code)
      console.log(error.message)
      switch (error.code) {
         case 'auth/invalid-email':
            errMsg.value = 'Invalid email'
            emailInput.value.focus()
            break
         case 'auth/user-not-found':
            errMsg.value = 'User not found'
            emailInput.value.focus()
            break
         case 'auth/wrong-password':
            errMsg.value = 'Wrong password'
            password.value = ''
            passwordInput.value.focus()
            break
         default:
            errMsg.value = 'Authentication failed'
            emailInput.value.focus()
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
