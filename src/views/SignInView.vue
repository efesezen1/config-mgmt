<script setup>
import { ref } from 'vue'
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'
import { useRouter } from 'vue-router'
const email = ref('')
const password = ref('')
const router = useRouter()
const errMsg = ref()
const emailInput = ref(null)
const passwordInput = ref(null)
const date = new Date()

const signIn = () => {
   const auth = getAuth()
   signInWithEmailAndPassword(auth, email.value, password.value)
      .then(() => {
         console.log('Successfully signed in.')
         console.log(auth.currentUser)
         router.push({ name: 'panel' })
      })
      .catch((error) => {
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
               errMsg.value = 'Email or password was incorrect'
               emailInput.value.focus()
               break
         }
      })
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
               class="rounded-t-md signin-input"
            />
            <input
               ref="passwordInput"
               type="password"
               v-model="password"
               placeholder="Password"
               class="rounded-b-md signin-input"
            />
         </div>

         <button
            type="submit"
            class="signin-dimensions btn-primary-color p-3 rounded-md transition-all duration-300"
         >
            Sign in
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
