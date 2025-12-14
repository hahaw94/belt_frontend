import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import i18n from '@/locales'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import en from 'element-plus/dist/locale/en.mjs'

export const useLocaleStore = defineStore('locale', () => {
  // 当前语言
  const currentLocale = ref(localStorage.getItem('locale') || 'zh-CN')

  // Element Plus 语言包映射
  const elementLocaleMap = {
    'zh-CN': zhCn,
    'en-US': en
  }

  // Element Plus 语言包
  const elementLocale = computed(() => elementLocaleMap[currentLocale.value])

  // 获取当前语言显示名称
  const currentLocaleName = computed(() => {
    return currentLocale.value === 'zh-CN' ? '中文' : 'English'
  })

  // 切换语言
  const setLocale = (locale) => {
    currentLocale.value = locale
    i18n.global.locale.value = locale
    localStorage.setItem('locale', locale)
  }

  return {
    currentLocale,
    elementLocale,
    currentLocaleName,
    setLocale
  }
})
