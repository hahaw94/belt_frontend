import request from './index'

/**
 * GB28181设备管理相关API（用于系统配置中的设备监控）
 */
export const gb28181API = {
  // 获取GB28181设备列表
  getDevices() {
    return request.get('/api/v1/video/devices')
  },

  // 获取GB28181摄像头列表
  getCameras(params = {}) {
    return request.get('/api/v1/video/cameras', { params })
  },

  // 按分类获取摄像头
  getCamerasByCategory(params = {}) {
    return request.get('/api/v1/video/cameras/by-category', { params })
  },

  // 更新摄像头分类
  updateCameraCategory(id, category) {
    return request.put(`/api/v1/video/cameras/${id}/category`, { category })
  },

  // 获取未绑定摄像头
  getUnboundCameras(params = {}) {
    return request.get('/api/v1/video/cameras/unbound', { params })
  },

  // 绑定摄像头到图层
  bindCameraToLayer(id, data) {
    return request.post(`/api/v1/video/cameras/${id}/bind`, data)
  },

  // 解绑摄像头
  unbindCameraFromLayer(id) {
    return request.delete(`/api/v1/video/cameras/${id}/unbind`)
  },

  // 获取图层摄像头
  getCamerasByLayer(params = {}) {
    return request.get('/api/v1/video/cameras/by-layer', { params })
  },

  // 更新摄像头位置
  updateCameraPosition(id, data) {
    return request.put(`/api/v1/video/cameras/${id}/position`, data)
  },

  // 单个摄像头同步
  syncSingleCamera(id) {
    return request.post(`/api/v1/video/cameras/${id}/sync`)
  },

  // 创建设备
  createDevice(data) {
    return request.post('/api/v1/video/devices', data)
  },

  // 更新设备
  updateDevice(id, data) {
    return request.post(`/api/v1/video/devices/${id}`, data)
  },

  // 删除设备
  deleteDevice(id) {
    return request.delete(`/api/v1/video/devices/${id}`)
  },

  // 创建通道
  createChannel(deviceId, data) {
    return request.post(`/api/v1/video/devices/${deviceId}/channels`, data)
  },

  // 更新通道
  updateChannel(id, data) {
    return request.post(`/api/v1/video/channels/${id}`, data)
  },

  // 删除通道
  deleteChannel(id) {
    return request.delete(`/api/v1/video/channels/${id}`)
  },

  // 获取录像列表
  getRecords(channelId, params = {}) {
    const query = new URLSearchParams(params).toString()
    return request.get(`/api/v1/video/channels/${channelId}/records${query ? '?' + query : ''}`)
  },

  // 智能同步摄像头
  smartSyncCameras(forceSync = false) {
    return request.post('/api/v1/video/cameras/smart-sync', null, {
      params: { force_sync: forceSync }
    })
  },

  // 获取设备通道
  getDeviceChannels(deviceId) {
    return request.get(`/api/v1/video/devices/${deviceId}/channels`)
  },

  // 获取流列表
  getStreams() {
    return request.get('/api/v1/video/streams')
  },

  // 开始播放
  startPlay(channelId, data = {}) {
    return request.post(`/api/v1/video/channels/${channelId}/play`, data)
  },

  // 停止播放
  stopPlay(streamId) {
    return request.delete(`/api/v1/video/streams/${streamId}`)
  },

  // 获取播放地址
  getPlayUrls(streamId) {
    return request.get(`/api/v1/video/streams/${streamId}/urls`)
  }
}

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

  // 修改端口配置
  setPortConfig(data) {
    return request.put('/api/v1/system/port', data)
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

  // 注意：以下平台管理接口在当前后端中尚未实现，保留作为未来扩展
  // 获取GB28181平台列表 - 未实现
  getGB28181Platforms() {
    // 替代方案：返回空列表或模拟数据
    return Promise.resolve({ code: 200, data: [] })
  },

  // 添加GB28181平台 - 未实现
  addGB28181Platform() {
    console.warn('GB28181平台管理功能尚未在后端实现')
    return Promise.resolve({ code: 200, message: '功能开发中...' })
  },

  // 更新GB28181平台 - 未实现
  updateGB28181Platform() {
    console.warn('GB28181平台管理功能尚未在后端实现')
    return Promise.resolve({ code: 200, message: '功能开发中...' })
  },

  // 删除GB28181平台 - 未实现
  deleteGB28181Platform() {
    console.warn('GB28181平台管理功能尚未在后端实现')
    return Promise.resolve({ code: 200, message: '功能开发中...' })
  },

  // 切换GB28181平台启用状态 - 未实现
  toggleGB28181Platform() {
    console.warn('GB28181平台管理功能尚未在后端实现')
    return Promise.resolve({ code: 200, message: '功能开发中...' })
  },

  // 测试GB28181连接 - 未实现
  testGB28181Connection() {
    console.warn('GB28181平台管理功能尚未在后端实现')
    return Promise.resolve({ code: 200, message: '测试功能开发中...' })
  },

  // 获取GB28181连接状态 - 未实现
  getGB28181Status() {
    return Promise.resolve({ code: 200, data: { status: 'unknown', message: '状态检查功能开发中...' } })
  },

  // ===================== 系统维护 =====================

  // 重启服务
  restartService() {
    return request.post('/api/v1/system/maintenance/restart/service')
  },

  // 重启服务器
  rebootServer() {
    return request.post('/api/v1/system/maintenance/restart/server')
  },

  // ===================== 版本管理 =====================
  // 获取版本信息
  getVersionInfo() {
    return request.get('/api/v1/system/version')
  },

  // 获取MinIO桶信息
  getMinioBucketsInfo() {
    return request.get('/api/v1/system/backup/buckets')
  },

  // 获取备份列表
  getBackupList() {
    return request.get('/api/v1/system/backups')
  },

  // 下载备份文件
  downloadBackup(filename) {
    return request.get(`/api/v1/system/backups/${filename}/download`, {
      responseType: 'blob',
      timeout: 300000, // 5分钟超时，适用于大文件下载
      onDownloadProgress: (progressEvent) => {
        // 可以在这里添加下载进度处理
        if (progressEvent.lengthComputable) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          console.log(`下载进度: ${percentCompleted}%`)
        }
      }
    })
  },

  // 删除备份文件
  deleteBackup(filename) {
    return request.delete(`/api/v1/system/backups/${filename}`)
  },

  // 创建备份
  createBackup(data) {
    return request.post('/api/v1/system/backup', data)
  },

  // 上传并恢复备份
  restoreSystem(formData) {
    return request.post('/api/v1/system/restore', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  // 一键升级
  upgradeSystem(formData) {
    return request.post('/api/v1/system/upgrade', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  // 重启服务
  restartSystemService() {
    return request.post('/api/v1/system/restart')
  },

  // 一键恢复系统
  oneClickRestore(backupFileName, options = {}) {
    return request.post('/api/v1/system/restore/one-click', {
      restore_type: 'one_click',
      backup_file_name: backupFileName,
      options: {
        force_restore: options.force_restore || false,
        auto_restart: options.auto_restart || false,
        backup_before_restore: options.backup_before_restore || true,
        ...options
      }
    })
  }

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