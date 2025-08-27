import request from './index'

/**
 * 系统配置相关API
 */
export const systemAPI = {
  // ===================== NTP时间设置 =====================
  // 获取NTP配置
  getNTPConfig() {
    return request.get('/api/v1/system/ntp')
  },

  // 设置NTP配置
  setNTPConfig(data) {
    return request.put('/api/v1/system/ntp', data)
  },

  // 立即同步时间
  syncNTP() {
    return request.post('/api/v1/system/ntp/sync')
  },

  // 手动设置时间（NTP服务器模式下）
  setManualTime(data) {
    return request.put('/api/v1/system/time', data)
  },

  // ===================== 网络配置 =====================
  // 获取网络配置
  getNetworkConfig() {
    return request.get('/api/v1/system/network')
  },

  // 修改网络配置
  setNetworkConfig(data) {
    return request.put('/api/v1/system/network', data)
  },

  // ===================== LOGO管理 =====================
  // 上传LOGO
  uploadLogo(formData) {
    return request.post('/api/v1/system/logo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  // 获取当前LOGO信息
  getCurrentLogo() {
    return request.get('/api/v1/system/logo')
  },

  // 删除LOGO，恢复默认
  deleteLogo() {
    return request.delete('/api/v1/system/logo')
  },

  // ===================== 存储策略配置 =====================
  // 获取录像存储策略配置
  getVideoStorageConfig() {
    return request.get('/api/v1/system/management/video-storage')
  },

  // 设置录像存储策略配置
  setVideoStorageConfig(data) {
    return request.put('/api/v1/system/management/video-storage', data)
  },

  // 获取存储使用情况
  getStorageUsage() {
    return request.get('/api/v1/system/storage/usage')
  },

  // 获取告警数据存储策略
  getAlarmDataConfig() {
    return request.get('/api/v1/system/management/alarm-data')
  },

  // 设置告警数据存储策略
  setAlarmDataConfig(data) {
    return request.put('/api/v1/system/management/alarm-data', data)
  },

  // ===================== GB28181平台对接 =====================
  // 获取GB28181配置
  getGB28181Config() {
    return request.get('/api/v1/system/management/gb28181')
  },

  // 设置GB28181配置
  setGB28181Config(data) {
    return request.put('/api/v1/system/management/gb28181', data)
  },

  // 测试GB28181连接 (暂未实现)
  testGB28181Connection(data) {
    return request.post('/api/v1/system/management/gb28181/test', data)
  },

  // ===================== 系统维护 =====================
  // 获取镜像点列表
  getSnapshots() {
    return request.get('/api/v1/system/maintenance/snapshots')
  },

  // 创建系统镜像点
  createSnapshot(data) {
    return request.post('/api/v1/system/maintenance/snapshots', data)
  },

  // 恢复到指定镜像点
  restoreSnapshot(id) {
    return request.post(`/api/v1/system/maintenance/snapshots/${id}/restore`)
  },

  // 删除镜像点
  deleteSnapshot(id) {
    return request.delete(`/api/v1/system/maintenance/snapshots/${id}`)
  },

  // 重启服务
  restartService() {
    return request.post('/api/v1/system/maintenance/restart/service')
  },

  // 重启服务器
  rebootServer() {
    return request.post('/api/v1/system/maintenance/restart/server')
  },

  // ===================== 版本管理 (待后端实现) =====================
  // // 获取版本信息
  // getVersionInfo() {
  //   return request.get('/api/v1/system/version')
  // },

  // // 创建备份
  // createBackup(data) {
  //   return request.post('/api/v1/system/backup', data)
  // },

  // // 获取备份列表
  // getBackupList() {
  //   return request.get('/api/v1/system/backups')
  // },

  // // 下载备份文件
  // downloadBackup(id) {
  //   return request.get(`/api/v1/system/backup/${id}/download`, {
  //     responseType: 'blob'
  //   })
  // },

  // // 上传并恢复备份
  // restoreBackup(formData) {
  //   return request.post('/api/v1/system/restore', formData, {
  //     headers: {
  //       'Content-Type': 'multipart/form-data'
  //     }
  //   })
  // },

  // // 一键升级
  // upgradeSystem(formData) {
  //   return request.post('/api/v1/system/upgrade', formData, {
  //     headers: {
  //       'Content-Type': 'multipart/form-data'
  //     }
  //   })
  // },

  // // 获取升级状态
  // getUpgradeStatus(id) {
  //   return request.get(`/api/v1/system/upgrade/${id}`)
  // }

  // ===================== 地图管理 (待后端实现) =====================
  // // 获取地图列表
  // getMapList() {
  //   return request.get('/api/v1/system/maps')
  // },

  // // 上传地图
  // uploadMap(formData) {
  //   return request.post('/api/v1/system/maps', formData, {
  //     headers: {
  //       'Content-Type': 'multipart/form-data'
  //     }
  //   })
  // },

  // // 删除地图
  // deleteMap(id) {
  //   return request.delete(`/api/v1/system/maps/${id}`)
  // },

  // // 获取地图设备
  // getMapDevices(mapId) {
  //   return request.get(`/api/v1/system/maps/${mapId}/devices`)
  // },

  // // 更新地图设备位置
  // updateMapDevices(mapId, data) {
  //   return request.put(`/api/v1/system/maps/${mapId}/devices`, data)
  // },

  // // 获取可用设备列表
  // getAvailableDevices() {
  //   return request.get('/api/v1/devices/cameras')
  // }
}

export default systemAPI