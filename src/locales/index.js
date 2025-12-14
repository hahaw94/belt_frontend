import { createI18n } from 'vue-i18n'
import zhCN from './zh-CN'
import enUS from './en-US'

// 创建 i18n 实例
const i18n = createI18n({
  legacy: false,              // 使用 Composition API 模式
  locale: localStorage.getItem('locale') || 'zh-CN',  // 默认语言
  fallbackLocale: 'zh-CN',    // 回退语言
  messages: {
    'zh-CN': zhCN,
    'en-US': enUS
  },
  globalInjection: true       // 全局注入 $t 方法
})

export default i18n
