import {createApp} from 'vue'
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
    Drawer

} from './config/primevue'

const app = createApp(App)
app.use(router)
    .use(PrimeVue, {
        theme: {
            preset: Aura,
        },
    })
    .component('DataTable', DataTable)
    .component('Column', Column)
    .component('ColumnGroup', ColumnGroup)
    .component('Row', Row)
    .component('InputText', InputText)
    .component('Button', Button)
    .component('Drawer', Drawer)
    .mount('#app')
