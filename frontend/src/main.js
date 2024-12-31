import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import 'primeicons/primeicons.css'
import './config/firebase'
import {
   PrimeVue,
   Aura,
   DataTable,
   Column,
   ColumnGroup,
   Row,
   InputText,
   Button,
   Drawer,
   ToastService,
   Toast,
   Dialog,
} from './config/primevue'

const app = createApp(App)
app.use(router)
   .use(PrimeVue, {
      theme: {
         preset: Aura,
      },
   })
   .use(ToastService)
   .component('DataTable', DataTable)
   .component('Column', Column)
   .component('ColumnGroup', ColumnGroup)
   .component('Row', Row)
   .component('InputText', InputText)
   .component('Button', Button)
   .component('Drawer', Drawer)
   .component('Toast', Toast)
   .component('Dialog', Dialog)
   .mount('#app')
