// src/main.js

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

// 引入 Element Plus
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css' // 引入 Element Plus 的样式文件
import * as ElementPlusIconsVue from '@element-plus/icons-vue' // 引入 Element Plus 的图标

// 创建 Vue 应用实例
const app = createApp(App)

// 挂载路由和 Vuex
app.use(store).use(router)

// 注册 Element Plus
app.use(ElementPlus)

// 注册 Element Plus 所有图标为全局组件
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}

// 将应用实例挂载到 public/index.html 中的 #app 元素上
app.mount('#app')