import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import 'primeicons/primeicons.css'
import './config/firebase'
import { PrimeVue, Aura, Menu, Image, Button } from './config/primevue'

const app = createApp(App)
app.use(router)
   .use(PrimeVue, {
      theme: {
         preset: Aura,
      },
   })
   .component('Image', Image)
   .component('Button', Button)
   .component('Menu', Menu)
   .mount('#app')
