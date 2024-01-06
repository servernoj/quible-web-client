/* eslint-disable vue/no-reserved-component-names */
import 'primeflex/primeflex.css'
import '@/assets/main.css'
import 'primevue/resources/themes/lara-dark-cyan/theme.css'
import 'primeicons/primeicons.css'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import ToastService from 'primevue/toastservice'
import Button from 'primevue/button'
import Toast from 'primevue/toast'
import InputNumber from 'primevue/inputnumber'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(PrimeVue)
app.use(ToastService)
// components
app.component('Button', Button)
app.component('Toast', Toast)
app.component('InputNumber', InputNumber)

app.mount('#app')
