<script setup></script>

<template>
   <div class="w-screen h-screen flex-center-col bg-slate-900 text-white">
      <form class="container flex flex-col items-center gap-4 h-full py-10">
         <img src="/icon.png" alt="" class="scale-50" />
         <div class="capitalize text-3xl ">Please Sign In</div>
         <div class="w-full flex-center-col">
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
            class="bg-gradient-to-tr from-[#4158CA] to-[#5770EE] w-3/4 p-3  rounded-md"
            @click.prevent=""
         >
            Sign in
         </button>
      </form>
   </div>
</template>

<style scoped></style>

