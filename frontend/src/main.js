import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import 'primeicons/primeicons.css'
import './config/firebase'
import {
   PrimeVue,
   Aura,

   Button,
   Drawer,
   ToastService,
   Toast,
   Dialog,
   Tooltip,
} from './config/primevue'

const app = createApp(App)
app.use(router)
   .use(PrimeVue, {
      theme: {
         preset: Aura,
      },
   })
   .use(ToastService)

   .component('Button', Button)
   .component('Drawer', Drawer)
   .component('Toast', Toast)
   .component('Dialog', Dialog)
   .directive('tooltip', Tooltip)
   .mount('#app')
