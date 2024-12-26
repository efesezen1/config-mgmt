<script setup> 
const date = new Date()</script>

<template>
   <div class="flex-center-col">
      <form class="container flex flex-col items-center gap-4 h-full py-10">
         <img src="/icon.png" alt="" class="scale-50" />
         <div class="capitalize text-3xl">Please Sign In</div>
         <div class="signin-dimensions flex flex-col">
            <input
               type="email"
               placeholder="E-mail address"
               class="rounded-t-md signin-input"
            />
            <input
               type="password"
               placeholder="Password"
               class="rounded-b-md signin-input"
            />
         </div>

         <button
            type="submit"
            class="signin-dimensions bg-gradient-to-tr from-[#4158CA] to-[#5770EE] p-3 rounded-md"
            @click.prevent=""
         >
            Sign in
         </button>
         <footer>
            <p class="opacity-50">Codeway &copy; {{ date.getFullYear() }}</p>
         </footer>
      </form>
   </div>
</template>

<style scoped></style>
