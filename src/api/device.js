import { api } from './index'

// 设备管理API
export const deviceApi = {
  // 获取设备列表
  getDeviceList(params) {
    return api.get('/api/devices', { params })
  },

  // 添加新设备
  addDevice(data) {
    return api.post('/api/devices', data)
  },

  // 批量添加设备
  batchAddDevices(file) {
    const formData = new FormData()
    formData.append('file', file)
    return api.upload('/api/devices/batch', formData)
  },

  // 平台设备自动同步
  syncDevices(data) {
    return api.post('/api/devices/sync', data)
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
  exportDevices() {
    return api.download('/api/devices/export')
  },

  // 配置设备接入协议
  configProtocol(deviceId, data) {
    return api.put(`/api/devices/${deviceId}/protocol`, data)
  },

  // 绑定智能分析板卡与摄像机
  bindAnalysisCard(data) {
    return api.post('/api/devices/bind-analysis-card', data)
  },

  // 获取设备详细信息
  getDeviceDetail(deviceId) {
    return api.get(`/api/devices/${deviceId}`)
  },

  // 获取智能分析板卡列表
  getAnalysisCards() {
    return api.get('/api/devices/analysis-cards')
  },

  // 获取摄像机列表
  getCameraList() {
    return api.get('/api/devices/cameras')
  },

  // 测试设备连接
  testDeviceConnection(deviceId) {
    return api.post(`/api/devices/${deviceId}/test-connection`)
  },

  // 获取设备日志
  getDeviceLogs(deviceId, params) {
    return api.get(`/api/devices/${deviceId}/logs`, { params })
  }
}