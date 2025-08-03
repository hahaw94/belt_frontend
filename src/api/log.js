import { api } from './index'

// 日志管理API
export const logApi = {
  // 获取系统操作日志
  getSystemLogs(params) {
    return api.get('/api/logs', params)
  },

  // 导出系统日志
  exportLogs(params) {
    return api.download('/api/logs/export', params)
  }
} 