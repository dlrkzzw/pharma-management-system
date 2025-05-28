import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap'

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

// 引入Font Awesome图标
import '@fortawesome/fontawesome-free/css/all.css'

const app = createApp(App)
app.use(ElementPlus)
app.use(createPinia())
app.use(router)

app.mount('#app')
