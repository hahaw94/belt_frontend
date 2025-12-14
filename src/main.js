// src/main.js

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'

// 引入 Element Plus
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css' // 引入 Element Plus 的样式文件
import * as ElementPlusIconsVue from '@element-plus/icons-vue' // 引入 Element Plus 的图标
import { ElMessage } from 'element-plus'

// 引入 i18n 国际化
import i18n from './locales'
import { useLocaleStore } from '@/stores/locale'

// 引入全局滚动条样式
import '@/assets/global-scrollbar.css'
// 引入下拉菜单主题覆盖样式（必须在Element Plus样式之后）
import '@/assets/dropdown-theme-override.css'

// 在开发环境中导入Mock测试
if (process.env.NODE_ENV === 'development') {
  import('./test-mock.js')
}

// 创建 Vue 应用实例
const app = createApp(App)

// 创建 Pinia 实例
const pinia = createPinia()

// 挂载 Pinia
app.use(pinia)

// 初始化认证状态
import { useAuthStore } from '@/stores/auth'
import { useSystemStore } from '@/stores/system'
const authStore = useAuthStore()
const systemStore = useSystemStore()
authStore.initAuth()

// 初始化系统配置（包括logo）
systemStore.fetchLogoConfig()

// 挂载路由
app.use(router)

// 注册 i18n
app.use(i18n)

// 初始化 locale store
const localeStore = useLocaleStore()

// 注册 Element Plus (支持国际化)
app.use(ElementPlus, {
  locale: localeStore.elementLocale
})

// 注册 Element Plus 所有图标为全局组件
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}

// 将 ElMessage 挂载到 window 对象上，供路由守卫使用
window.ElMessage = ElMessage

// 将应用实例挂载到 public/index.html 中的 #app 元素上
app.mount('#app')