// 统一导出所有API服务
export { api } from './index'
export { authApi } from './auth'
export { userApi } from './user'
export { deviceApi } from './device'
export { algorithmApi } from './algorithm'
export { detectionApi } from './detection'
export { recordingApi } from './recording'
export { eventApi } from './event'
export { dashboardApi } from './dashboard'
export { systemApi } from './system'
export { statisticsApi } from './statistics'
export { logApi } from './log'
export { websocketApi, wsManager } from './websocket'

// 默认导出常用的API
export default {
  auth: authApi,
  user: userApi,
  device: deviceApi,
  algorithm: algorithmApi,
  detection: detectionApi,
  recording: recordingApi,
  event: eventApi,
  dashboard: dashboardApi,
  system: systemApi,
  statistics: statisticsApi,
  log: logApi,
  websocket: websocketApi
} 