<template>
  <div id="app">
    <router-view />
    
    <!-- 告警弹窗 - 只在已登录状态显示，全局固定在右下角 -->
    <template v-if="authStore.isAuthenticated">
      <AlertToast
        :alerts="alertStore.activeAlerts"
        :max-visible="3"
        :duration="5000"
        @remove-alert="handleRemoveAlert"
        @toast-click="handleToastClick"
      />
    </template>
  </div>
</template>

<script>
import { onMounted, onBeforeUnmount, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAlertStore } from './stores/alertStore'
import { useAuthStore } from './stores/auth'
import AlertToast from './components/AlertToast.vue'

export default {
  name: 'App',
  components: {
    AlertToast
  },
  setup() {
    const router = useRouter()
    const alertStore = useAlertStore()
    const authStore = useAuthStore()

    // 处理移除活动告警
    const handleRemoveAlert = (alertId) => {
      alertStore.removeActiveAlert(alertId)
    }

    // 处理点击冒泡消息，跳转到告警展示页面
    const handleToastClick = (alert) => {
      // 跳转到告警信息展示页面
      router.push('/event/alarm-display')
      // 移除该告警
      alertStore.removeActiveAlert(alert.id)
    }

    // 监听登录状态，自动连接/断开WebSocket
    watch(() => authStore.isAuthenticated, (isAuthenticated) => {
      if (isAuthenticated) {
        console.log('用户已登录，初始化WebSocket连接')
        alertStore.initWebSocket()
      } else {
        console.log('用户已登出，断开WebSocket连接')
        alertStore.disconnectWebSocket()
      }
    }, { immediate: true })

    // 组件挂载时检查登录状态
    onMounted(() => {
      if (authStore.isAuthenticated) {
        console.log('App挂载：用户已登录，初始化WebSocket')
        alertStore.initWebSocket()
      }
    })

    // 组件卸载时断开连接
    onBeforeUnmount(() => {
      console.log('App卸载：断开WebSocket连接')
      alertStore.disconnectWebSocket()
    })

    return {
      alertStore,
      authStore,
      handleRemoveAlert,
      handleToastClick
    }
  }
}
</script>

<style>
/* 这里放置全局的 CSS 样式 */
html, body, #app {
  margin: 0;
  padding: 0;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  height: 100vh; /* 确保 html, body, #app 都占满整个视口高度 */
  overflow: hidden; /* 隐藏全局滚动条，由内部的 el-main 控制 */
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%); /* 科技感背景渐变 */
}

/* 全局强制覆盖Element Plus下拉菜单样式 - 最高优先级 */
body .el-dropdown-menu,
html .el-dropdown-menu,
#app .el-dropdown-menu {
  background: rgba(15, 25, 45, 0.98) !important;
  border: 1px solid rgba(0, 255, 255, 0.4) !important;
  backdrop-filter: blur(12px) !important;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.6) !important;
}

body .el-popper,
html .el-popper,
#app .el-popper {
  background: rgba(15, 25, 45, 0.98) !important;
  border: 1px solid rgba(0, 255, 255, 0.4) !important;
}

/* 强制覆盖所有可能的popper类 */
.el-popper.el-dropdown__popper {
  background: rgba(15, 25, 45, 0.98) !important;
  border: 1px solid rgba(0, 255, 255, 0.4) !important;
}

/* 系统告警弹窗样式 */
.system-alert-dialog {
  border-radius: 12px !important;
  background: linear-gradient(135deg, rgba(15, 25, 45, 0.98) 0%, rgba(20, 30, 50, 0.98) 100%) !important;
  border: 2px solid rgba(255, 193, 7, 0.6) !important;
  box-shadow: 0 8px 32px rgba(255, 193, 7, 0.3), 0 0 60px rgba(255, 193, 7, 0.2) !important;
  backdrop-filter: blur(20px) !important;
}

.system-alert-dialog .el-message-box__header {
  background: linear-gradient(90deg, rgba(255, 193, 7, 0.15) 0%, transparent 100%) !important;
  border-bottom: 1px solid rgba(255, 193, 7, 0.3) !important;
  padding: 20px 24px !important;
}

.system-alert-dialog .el-message-box__title {
  color: #ffc107 !important;
  font-size: 18px !important;
  font-weight: 600 !important;
  text-shadow: 0 0 10px rgba(255, 193, 7, 0.5) !important;
}

.system-alert-dialog .el-message-box__content {
  color: #e0e6ed !important;
  padding: 24px !important;
}

.system-alert-dialog .el-message-box__message {
  color: #e0e6ed !important;
  line-height: 1.6 !important;
}

.system-alert-dialog .el-button--primary {
  background: linear-gradient(135deg, #ffc107 0%, #ff9800 100%) !important;
  border: none !important;
  color: #1a1a2e !important;
  font-weight: 600 !important;
  padding: 10px 24px !important;
  border-radius: 6px !important;
  box-shadow: 0 4px 12px rgba(255, 193, 7, 0.4) !important;
  transition: all 0.3s ease !important;
}

.system-alert-dialog .el-button--primary:hover {
  background: linear-gradient(135deg, #ffca28 0%, #ffa726 100%) !important;
  box-shadow: 0 6px 16px rgba(255, 193, 7, 0.6) !important;
  transform: translateY(-2px) !important;
}

.system-alert-dialog .el-message-box__close {
  color: #ffc107 !important;
  font-size: 20px !important;
}

.system-alert-dialog .el-message-box__close:hover {
  color: #ffca28 !important;
}

</style>