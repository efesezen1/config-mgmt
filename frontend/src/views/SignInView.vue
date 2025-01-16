<script setup>
import { ref } from 'vue'
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'
import { useRouter } from 'vue-router'
import Logo from '../components/Logo.vue'

const email = ref(''),
   password = ref(''),
   router = useRouter(),
   errMsg = ref(),
   emailInput = ref(null),
   passwordInput = ref(null),
   date = new Date(),
   isLoading = ref(false),
   auth = getAuth()

const signIn = async () => {
   isLoading.value = true
   errMsg.value = ''

   try {
      // First sign in with email and password
      const userCredential = await signInWithEmailAndPassword(
         auth,
         email.value,
         password.value
      )
      console.log('Email/Password sign in successful')
      router.push({ name: 'panel' })
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
         <Logo width="96px" height="96px" />
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
            <p class="opacity-50">
               Configuration Management System &copy; {{ date.getFullYear() }}
            </p>
         </footer>
      </form>
   </div>
</template>

<style scoped></style>
