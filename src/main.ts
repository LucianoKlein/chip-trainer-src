import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import App from './App.vue'
import router from './router'
import i18n from './i18n/config'
import 'element-plus/dist/index.css'
import '@/styles/index.css'
import { useAuthInit } from '@/composables/useAuthInit'

const app = createApp(App)

app.use(createPinia())
app.use(ElementPlus)
app.use(i18n)
app.use(router)

// ⭐ 必须在 mount 之前
useAuthInit()

app.mount('#app')
