import { api } from './index'

// 设备管理API
export const deviceApi = {
  // 获取设备列表
  getDeviceList(params) {
    return api.get('/api/devices', params)
  },

  // 添加设备
  addDevice(data) {
    return api.post('/api/devices', data)
  },

  // 批量添加设备
  batchAddDevices(file) {
    const formData = new FormData()
    formData.append('file', file)
    return api.upload('/api/devices/batch', formData)
  },

  // 平台设备同步
  syncDevices(data) {
    return api.post('/api/devices/sync', data)
  },

  // 配置设备接入协议
  configDeviceProtocol(deviceId, data) {
    return api.put(`/api/devices/${deviceId}/protocol`, data)
  },

  // 绑定智能分析板卡
  bindAnalysisCard(data) {
    return api.post('/api/devices/bind-analysis-card', data)
  },

  // 更新设备信息
  updateDevice(deviceId, data) {
    return api.put(`/api/devices/${deviceId}`, data)
  },

  // 删除设备
  deleteDevice(deviceId) {
    return api.delete(`/api/devices/${deviceId}`)
  },

  // 切换设备状态
  toggleDeviceStatus(deviceId, data) {
    return api.post(`/api/devices/${deviceId}/toggle-status`, data)
  },

  // 导出设备列表
  exportDeviceList(params) {
    return api.download('/api/devices/export', params)
  }
} 