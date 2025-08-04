/**
 * 智能视频分析平台 - Pinia Store 统一导出文件
 * 
 * 包含所有业务模块的状态管理：
 * - 用户认证与管理
 * - 首页数据看板  
 * - 设备管理
 * - 算法管理
 * - 实时检测
 * - 录像管理
 * - 事件中心与报警
 * - 系统配置
 * - 统计分析
 * - 日志管理
 * - WebSocket连接管理
 */

// 导入所有store
import { useAuthStore } from './auth'
import { useDashboardStore } from './dashboard'
import { useDeviceStore } from './device'
import { useAlgorithmStore } from './algorithm'
import { useDetectionStore } from './detection'
import { useRecordingStore } from './recording'
import { useEventStore } from './event'
import { useSystemStore } from './system'
import { useStatisticsStore } from './statistics'
import { useLogStore } from './log'
import { useWebSocketStore } from './websocket'

// 统一导出所有store
export {
  useAuthStore,
  useDashboardStore,
  useDeviceStore,
  useAlgorithmStore,
  useDetectionStore,
  useRecordingStore,
  useEventStore,
  useSystemStore,
  useStatisticsStore,
  useLogStore,
  useWebSocketStore
}

/**
 * 获取所有store实例的便捷方法
 * 主要用于开发调试和全局状态重置
 */
export const getAllStores = () => {
  return {
    auth: useAuthStore(),
    dashboard: useDashboardStore(),
    device: useDeviceStore(),
    algorithm: useAlgorithmStore(),
    detection: useDetectionStore(),
    recording: useRecordingStore(),
    event: useEventStore(),
    system: useSystemStore(),
    statistics: useStatisticsStore(),
    log: useLogStore(),
    websocket: useWebSocketStore()
  }
}

/**
 * 重置所有store状态
 * 通常在用户登出或需要清理状态时调用
 */
export const resetAllStores = () => {
  const stores = getAllStores()
  
  Object.values(stores).forEach(store => {
    if (typeof store.resetState === 'function') {
      store.resetState()
    }
  })
  
  console.log('所有store状态已重置')
}

/**
 * 初始化应用状态
 * 在应用启动时调用，恢复用户认证状态
 */
export const initializeStores = async () => {
  const authStore = useAuthStore()
  
  try {
    // 恢复用户认证状态
    authStore.initAuth()
    
    // 如果用户已登录，建立WebSocket连接
    if (authStore.isAuthenticated) {
      const websocketStore = useWebSocketStore()
      const userId = authStore.userInfo?.id
      
      if (userId) {
        await websocketStore.connectAll(userId)
      }
    }
    
    console.log('应用状态初始化完成')
  } catch (error) {
    console.error('应用状态初始化失败:', error)
  }
}

/**
 * 处理用户登录后的状态初始化
 * @param {Object} userInfo - 用户信息
 */
export const handleUserLogin = async (userInfo) => {
  try {
    // 建立WebSocket连接
    const websocketStore = useWebSocketStore()
    await websocketStore.connectAll(userInfo.id)
    
    // 初始化各模块的基础数据
    const dashboardStore = useDashboardStore()
    const deviceStore = useDeviceStore()
    
    // 异步加载基础数据，不阻塞登录流程
    Promise.all([
      dashboardStore.fetchOverview().catch(console.error),
      deviceStore.fetchDevices().catch(console.error)
    ])
    
    console.log('用户登录后状态初始化完成')
  } catch (error) {
    console.error('用户登录后状态初始化失败:', error)
  }
}

/**
 * 处理用户登出后的状态清理
 */
export const handleUserLogout = () => {
  try {
    // 断开所有WebSocket连接
    const websocketStore = useWebSocketStore()
    websocketStore.disconnectAll()
    
    // 重置所有store状态
    resetAllStores()
    
    console.log('用户登出后状态清理完成')
  } catch (error) {
    console.error('用户登出后状态清理失败:', error)
  }
}

/**
 * 获取应用状态概览
 * 用于监控和调试
 */
export const getAppStateOverview = () => {
  const stores = getAllStores()
  
  const overview = {
    auth: {
      isAuthenticated: stores.auth.isAuthenticated,
      username: stores.auth.username,
      role: stores.auth.userInfo?.role
    },
    device: {
      totalDevices: stores.device.totalDevices,
      onlineCount: stores.device.onlineCount,
      offlineCount: stores.device.offlineCount
    },
    dashboard: {
      totalCameras: stores.dashboard.totalCameras,
      onlineCameras: stores.dashboard.onlineCameras,
      todayAlarms: stores.dashboard.todayAlarms
    },
    websocket: {
      isConnected: stores.websocket.isConnected,
      activeConnections: stores.websocket.activeConnections.length,
      unreadMessages: stores.websocket.unreadMessageCount
    },
    event: {
      unprocessedAlarms: stores.event.totalUnprocessed,
      totalProcessed: stores.event.totalProcessed
    }
  }
  
  return overview
}

/**
 * Store使用指南和最佳实践
 */
export const STORE_USAGE_GUIDE = {
  // 在组件中使用store的推荐方式
  componentUsage: `
    <script setup>
    import { useAuthStore, useDeviceStore } from '@/stores'
    
    const authStore = useAuthStore()
    const deviceStore = useDeviceStore()
    
    // 使用响应式数据
    const isAuthenticated = computed(() => authStore.isAuthenticated)
    const devices = computed(() => deviceStore.devices)
    
    // 调用actions
    const handleLogin = async (credentials) => {
      try {
        await authStore.login(credentials)
        await deviceStore.fetchDevices()
      } catch (error) {
        console.error('登录失败:', error)
      }
    }
    </script>
  `,
  
  // 状态管理最佳实践
  bestPractices: [
    '使用computed获取派生状态',
    '在actions中处理异步逻辑',
    '使用try-catch处理API调用错误',
    '及时清理副作用（如定时器、WebSocket连接）',
    '避免直接修改state，使用actions',
    '合理使用getters进行数据计算'
  ],
  
  // 错误处理指南
  errorHandling: [
    'API调用失败时显示用户友好的错误信息',
    '网络错误时提供重试机制',
    '认证失败时自动跳转到登录页',
    '记录错误日志便于调试'
  ]
}

// 默认导出主要的store集合
export default {
  useAuthStore,
  useDashboardStore,
  useDeviceStore,
  useAlgorithmStore,
  useDetectionStore,
  useRecordingStore,
  useEventStore,
  useSystemStore,
  useStatisticsStore,
  useLogStore,
  useWebSocketStore,
  getAllStores,
  resetAllStores,
  initializeStores,
  handleUserLogin,
  handleUserLogout,
  getAppStateOverview
}