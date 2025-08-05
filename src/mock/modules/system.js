// 系统管理Mock数据
class SystemMockData {
  constructor() {
    this.basicConfig = {}
    this.versionInfo = {}
    this.mapConfig = {}
    this.backups = []
    this.initData()
  }

  initData() {
    // 初始化基础配置
    this.basicConfig = {
      system_name: '智能监控系统',
      platform_ip: '192.168.1.100',
      platform_port: 8080,
      time_sync_enabled: true,
      ntp_server: 'ntp.pool.org',
      timezone: 'Asia/Shanghai',
      max_camera_count: 1000,
      current_camera_count: 30
    }

    // 初始化版本信息
    this.versionInfo = {
      current_version: 'V2.1.0',
      build_time: '2024-01-15 10:30:00',
      update_available: true,
      latest_version: 'V2.2.0',
      update_notes: '修复若干bug，优化算法性能'
    }

    // 初始化地图配置
    this.mapConfig = {
      background_image: '/uploads/maps/layout.png',
      width: 1920,
      height: 1080,
      camera_positions: [
        { device_id: 1, x: 150, y: 200, icon: 'camera' },
        { device_id: 2, x: 800, y: 200, icon: 'camera' },
        { device_id: 3, x: 350, y: 150, icon: 'camera' },
        { device_id: 4, x: 550, y: 250, icon: 'camera' },
        { device_id: 5, x: 100, y: 400, icon: 'camera' }
      ]
    }

    // 初始化备份记录
    for (let i = 1; i <= 10; i++) {
      const backupTime = new Date(Date.now() - Math.floor(Math.random() * 90 * 24 * 60 * 60 * 1000))
      const size = (Math.random() * 500 + 100).toFixed(1) // 100-600MB
      
      this.backups.push({
        id: i,
        backup_name: `系统备份_${backupTime.toISOString().split('T')[0].replace(/-/g, '_')}`,
        backup_time: backupTime.toISOString().replace('T', ' ').split('.')[0],
        version: `V2.${Math.floor(Math.random() * 5)}.${Math.floor(Math.random() * 10)}`,
        size: `${size} MB`,
        type: ['完整备份', '增量备份', '配置备份'][Math.floor(Math.random() * 3)],
        status: ['成功', '失败'][Math.floor(Math.random() * 10) > 0 ? 0 : 1], // 90%成功率
        description: `${backupTime.toISOString().split('T')[0]}的系统备份`
      })
    }

    // 按时间倒序排列
    this.backups.sort((a, b) => new Date(b.backup_time) - new Date(a.backup_time))
  }

  getBasicConfig() {
    return { ...this.basicConfig }
  }

  updateBasicConfig(configData) {
    Object.assign(this.basicConfig, configData)
    return true
  }

  getVersionInfo() {
    return { ...this.versionInfo }
  }

  updateVersionInfo(versionData) {
    Object.assign(this.versionInfo, versionData)
    return true
  }

  createBackup(backupData = {}) {
    const newId = Math.max(0, ...this.backups.map(b => b.id)) + 1
    const now = new Date()
    const size = (Math.random() * 500 + 100).toFixed(1)

    const newBackup = {
      id: newId,
      backup_name: backupData.backup_name || `系统备份_${now.toISOString().split('T')[0].replace(/-/g, '_')}`,
      backup_time: now.toISOString().replace('T', ' ').split('.')[0],
      version: this.versionInfo.current_version,
      size: `${size} MB`,
      type: backupData.include_data ? '完整备份' : '配置备份',
      status: '成功',
      description: backupData.description || `${now.toISOString().split('T')[0]}的系统备份`
    }

    this.backups.unshift(newBackup)
    return newBackup
  }

  getAllBackups() {
    return [...this.backups]
  }

  getBackupById(id) {
    return this.backups.find(backup => backup.id === id)
  }

  deleteBackup(id) {
    const index = this.backups.findIndex(backup => backup.id === id)
    if (index === -1) return false

    this.backups.splice(index, 1)
    return true
  }

  getMapConfig() {
    return { ...this.mapConfig }
  }

  updateMapConfig(mapData) {
    Object.assign(this.mapConfig, mapData)
    return true
  }

  updateCameraPositions(positions) {
    this.mapConfig.camera_positions = positions
    return true
  }

  uploadMapBackground(backgroundImage) {
    this.mapConfig.background_image = backgroundImage
    return true
  }

  getSystemStatus() {
    return {
      cpu_usage: (Math.random() * 30 + 20).toFixed(1), // 20-50%
      memory_usage: (Math.random() * 40 + 30).toFixed(1), // 30-70%
      disk_usage: (Math.random() * 20 + 40).toFixed(1), // 40-60%
      network_status: 'normal',
      uptime: '99.8%',
      last_restart: '2024-01-15 08:30:00',
      active_connections: Math.floor(Math.random() * 50) + 20, // 20-70
      total_requests_today: Math.floor(Math.random() * 10000) + 5000 // 5000-15000
    }
  }

  changeSystemIP(newIP) {
    const oldIP = this.basicConfig.platform_ip
    this.basicConfig.platform_ip = newIP
    
    return {
      old_ip: oldIP,
      new_ip: newIP,
      restart_required: true,
      new_access_url: `http://${newIP}:${this.basicConfig.platform_port}`
    }
  }

  syncTime(ntpServer = null) {
    if (ntpServer) {
      this.basicConfig.ntp_server = ntpServer
    }
    
    return {
      sync_time: new Date().toISOString().replace('T', ' ').split('.')[0],
      ntp_server: this.basicConfig.ntp_server,
      time_diff: Math.floor(Math.random() * 200 - 100) + 'ms', // -100ms to +100ms
      sync_status: 'success'
    }
  }

  getDeviceParams() {
    return {
      stream_protocol: 'RTMP',
      video_quality: 'HD',
      frame_rate: 25,
      bitrate: '2048 kbps',
      audio_enabled: true,
      motion_detection: true,
      infrared_mode: 'auto',
      storage_days: 30
    }
  }

  updateDeviceParams() {
    // 模拟更新设备参数
    return {
      updated_devices: Math.floor(Math.random() * 20) + 10, // 10-30台设备
      failed_devices: Math.floor(Math.random() * 3), // 0-2台失败
      update_time: new Date().toISOString().replace('T', ' ').split('.')[0]
    }
  }
}

export const systemMockData = new SystemMockData()