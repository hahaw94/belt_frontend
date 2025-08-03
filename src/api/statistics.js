import { api } from './index'

// 统计分析API
export const statisticsApi = {
  // 获取系统统计概览
  getOverview() {
    return api.get('/api/statistics/overview')
  },

  // 获取设备状态统计
  getDeviceStatus(params) {
    return api.get('/api/statistics/device-status', params)
  },

  // 获取报警趋势分析
  getAlarmTrend(params) {
    return api.get('/api/statistics/alarm-trend', params)
  },

  // 获取多维度预警统计
  getMultiDimensionAlarm(params) {
    return api.get('/api/statistics/alarm-multi-dimension', params)
  },

  // 导出统计分析报告
  exportReport(data) {
    return api.post('/api/statistics/export-report', data)
  }
} 