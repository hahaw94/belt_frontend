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
  },

  // 获取日志统计信息
  getLogStatistics() {
    return api.get('/api/logs/statistics')
  },

  // 清理旧日志
  cleanOldLogs(data) {
    return api.post('/api/logs/clean', data)
  }
} 