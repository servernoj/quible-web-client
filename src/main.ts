import 'primeflex/primeflex.css'
import '@/assets/main.css'
import 'primevue/resources/themes/lara-dark-cyan/theme.css'
import 'primeicons/primeicons.css'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import ToastService from 'primevue/toastservice'
import Toast from 'primevue/toast'
import { VueQueryPlugin } from '@tanstack/vue-query'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(PrimeVue)
app.use(ToastService)
app.use(VueQueryPlugin)
// components
app.component('Toast', Toast)

app.mount('#app')
