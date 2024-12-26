<script setup>
import { ref } from 'vue'
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'
import { useRouter } from 'vue-router'
const email = ref('')
const password = ref('')
const router = useRouter()
const errMsg = ref()
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
               break
            case 'auth/user-not-found':
               errMsg.value = 'User not found'
               break
            case 'auth/wrong-password':
               errMsg.value = 'Wrong password'
               break
            default:
               errMsg.value = 'Email or password was incorrect'
               break
         }
      })
}
</script>

<template>
   <div class="flex-center-col">
      <form class="container flex flex-col items-center gap-4 h-full py-10">
         <img src="/icon.png" alt="" class="scale-50" />
         <div class="capitalize text-3xl">Please Sign In</div>
         <div class="signin-dimensions flex flex-col">
            <input
               type="email"
               v-model="email"
               placeholder="E-mail address"
               class="rounded-t-md signin-input"
            />
            <input
               type="password"
               v-model="password"
               placeholder="Password"
               class="rounded-b-md signin-input"
            />
         </div>

         <button
            type="submit"
            class="signin-dimensions bg-gradient-to-tr from-[#4158CA] to-[#5770EE] p-3 rounded-md"
            @click.prevent="signIn"
         >
            Sign in
         </button>
         {{ errMsg }}
         <footer>
            <p class="opacity-50">Codeway &copy; {{ date.getFullYear() }}</p>
         </footer>
      </form>
   </div>
</template>

<style scoped></style>
