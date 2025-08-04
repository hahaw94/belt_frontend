import { api } from './index'

// 系统管理API
export const systemApi = {
  // 获取系统基础配置
  getBasicConfig() {
    return api.get('/api/system/config/basic')
  },

  // 更新系统基础配置
  updateBasicConfig(data) {
    return api.put('/api/system/config/basic', data)
  },

  // 一键修改平台IP
  changeIP(data) {
    return api.post('/api/system/config/change-ip', data)
  },

  // 执行时间同步
  syncTime(data) {
    return api.post('/api/system/config/time-sync', data)
  },

  // 获取设备参数配置
  getDeviceParams() {
    return api.get('/api/system/config/device-params')
  },

  // 更新设备参数配置
  updateDeviceParams(data) {
    return api.put('/api/system/config/device-params', data)
  },

  // 应用设备参数到所有设备
  applyDeviceParamsToAll(data) {
    return api.post('/api/system/config/device-params/apply-all', data)
  },

  // 导出设备参数配置
  exportDeviceParams() {
    return api.download('/api/system/config/device-params/export')
  },

  // 导入设备参数配置
  importDeviceParams(file) {
    const formData = new FormData()
    formData.append('file', file)
    return api.upload('/api/system/config/import-device-params', formData)
  },

  // 获取地图配置
  getMapConfig() {
    return api.get('/api/system/config/map')
  },

  // 上传地图背景
  uploadMapBackground(file) {
    const formData = new FormData()
    formData.append('background_image', file)
    return api.upload('/api/system/config/map/upload-background', formData)
  },

  // 更新摄像机点位信息
  updateCameraPositions(data) {
    return api.put('/api/system/config/map/update-positions', data)
  },

  // 导出点位配置信息
  exportPositions() {
    return api.download('/api/system/config/map/export-positions')
  },

  // 导入点位配置信息
  importPositions(file) {
    const formData = new FormData()
    formData.append('file', file)
    return api.upload('/api/system/config/map/import-positions', formData)
  },

  // 获取系统版本信息
  getVersionInfo() {
    return api.get('/api/system/version')
  },

  // 备份当前系统版本
  backupVersion(data) {
    return api.post('/api/system/version/backup', data)
  },

  // 系统一键升级
  upgradeSystem(file, backupBeforeUpgrade = true) {
    const formData = new FormData()
    formData.append('upgrade_package', file)
    formData.append('backup_before_upgrade', backupBeforeUpgrade)
    return api.upload('/api/system/version/upgrade', formData)
  }
} 