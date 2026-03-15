import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import './../public/iconfont.css'

import App from './App.vue'
import router from './router'
import { useUserStore } from './stores/user'

const app = createApp(App)

const pinia = createPinia()
app.use(pinia)
app.use(router)
app.use(ElementPlus, {
  locale: zhCn
})

// 初始化用户信息
const userStore = useUserStore(pinia)
userStore.initUserInfo()

app.mount('#app')
