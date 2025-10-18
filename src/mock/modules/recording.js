// 录像管理 Mock 数据模块

/**
 * 录像管理Mock数据
 */
class RecordingMockData {
  constructor() {
    this.recordings = this.generateMockRecordings()
    this.statistics = this.generateStatistics()
  }

  /**
   * 生成模拟录像数据
   */
  generateMockRecordings() {
    const recordings = []
    const deviceNames = [
      '前门摄像头', '后门摄像头', '侧门摄像头', 
      '皮带头部摄像头', '皮带尾部摄像头', '中央监控摄像头',
      '车间入口摄像头', '车间出口摄像头', '安全通道摄像头',
      '货物装卸摄像头', '质检区域摄像头', '员工休息区摄像头'
    ]
    
    const alarmTypes = [
      '异常行为', '车辆违规', '人员闯入', '区域入侵', 
      '设备故障', '火灾预警', '安全帽检测', '工服识别',
      '违规操作', '环境异常', '噪音超标', '温度异常'
    ]

    const resolutions = ['1920x1080', '1280x720', '3840x2160', '2560x1440']
    const frameRates = [25, 30, 50, 60]
    const formats = ['mp4', 'avi', 'mkv', 'mov']
    
    // 生成100条录像记录
    for (let i = 1; i <= 100; i++) {
      const deviceName = deviceNames[Math.floor(Math.random() * deviceNames.length)]
      const alarmType = alarmTypes[Math.floor(Math.random() * alarmTypes.length)]
      const startTime = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // 最近30天内随机时间
      const duration = Math.floor(Math.random() * 300) + 30 // 30-330秒随机时长
      const endTime = new Date(startTime.getTime() + duration * 1000)
      const fileSize = Math.floor(Math.random() * 500) + 50 // 50-550MB随机文件大小
      const fileSizeBytes = fileSize * 1024 * 1024
      const resolution = resolutions[Math.floor(Math.random() * resolutions.length)]
      const fps = frameRates[Math.floor(Math.random() * frameRates.length)]
      const format = formats[Math.floor(Math.random() * formats.length)]
      const fileName = `${deviceName.replace(/摄像头$/, '')}_${alarmType}_${startTime.getTime()}.${format}`

      recordings.push({
        // 符合后端 VideoResponse 结构
        id: i,  // 使用数字ID，符合后端int64类型
        title: `${deviceName} - ${alarmType}`,  // 视频标题
        description: `录制于${deviceName}的${alarmType}事件`,  // 视频描述
        file_name: fileName,  // 文件名
        file_size: fileSizeBytes,  // 文件大小（字节）
        file_size_str: this.formatFileSize(fileSizeBytes),  // 格式化的文件大小
        duration: duration,  // 时长（秒）
        duration_str: `${Math.floor(duration / 60)}:${String(duration % 60).padStart(2, '0')}`,  // 格式化的时长
        format: format,  // 视频格式
        resolution: resolution,  // 分辨率
        bitrate: Math.floor(Math.random() * 5000) + 2000,  // 码率
        file_url: `http://localhost:8080/recordings/${startTime.getFullYear()}/${String(startTime.getMonth() + 1).padStart(2, '0')}/${fileName}`,  // 访问URL
        status: Math.random() > 0.95 ? 0 : 1,  // 状态(1-正常,0-已删除)
        upload_time: startTime.toISOString().replace('T', ' ').slice(0, 19),  // 上传时间
        uploader_id: Math.floor(Math.random() * 5) + 1,  // 上传者ID
        create_time: new Date(startTime.getTime() - Math.random() * 60 * 60 * 1000).toISOString().replace('T', ' ').slice(0, 19),  // 创建时间
        
        // 保留原有字段用于兼容性
        device_id: Math.floor(Math.random() * 12) + 1,
        device_name: deviceName,
        alarm_type: alarmType,
        start_time: startTime.toISOString().replace('T', ' ').slice(0, 19),
        end_time: endTime.toISOString().replace('T', ' ').slice(0, 19),
        file_path: `/recordings/${startTime.getFullYear()}/${String(startTime.getMonth() + 1).padStart(2, '0')}/${fileName}`,
        has_tracking_box: Math.random() > 0.3,
        fps: fps,
        codec: 'H.264',
        thumbnail_path: `/thumbnails/${deviceName.replace(/摄像头$/, '')}_${alarmType}_${startTime.getTime()}.jpg`,
        metadata: {
          weather: ['晴天', '多云', '阴天', '小雨'][Math.floor(Math.random() * 4)],
          temperature: Math.floor(Math.random() * 20) + 15,
          lighting: ['正常', '昏暗', '强光'][Math.floor(Math.random() * 3)],
          scene: ['室内', '室外', '半室外'][Math.floor(Math.random() * 3)]
        }
      })
    }

    // 按创建时间倒序排列
    return recordings.sort((a, b) => new Date(b.create_time) - new Date(a.create_time))
  }

  /**
   * 生成统计数据
   */
  generateStatistics() {
    const totalSizeGB = Math.floor(Math.random() * 500) + 200 // 200-700GB
    const availableSpaceGB = Math.floor(Math.random() * 300) + 100 // 100-400GB
    
    return {
      total_recordings: this.recordings.length,
      total_size: `${totalSizeGB} GB`, // 格式化为字符串
      total_size_gb: totalSizeGB, // 保留数字格式用于计算
      available_space: `${availableSpaceGB} GB`, // 格式化为字符串
      available_space_gb: availableSpaceGB, // 保留数字格式用于计算
      daily_average: `${Math.floor(Math.random() * 100) + 50} MB`, // 日均增长
      today_count: Math.floor(Math.random() * 20) + 5,
      week_count: Math.floor(Math.random() * 100) + 50,
      month_count: Math.floor(Math.random() * 300) + 200,
      avg_duration_seconds: Math.floor(Math.random() * 180) + 120,
      storage_usage_percent: Math.floor(Math.random() * 30) + 60, // 60-90%存储使用率
      retention_days: 180, // 保留180天
      auto_cleanup: true, // 自动清理已启用
      compression_ratio: (Math.random() * 0.3 + 0.4).toFixed(2), // 0.4-0.7压缩比
      alarm_distribution: {
        '异常行为': Math.floor(Math.random() * 30) + 20,
        '车辆违规': Math.floor(Math.random() * 25) + 15,
        '人员闯入': Math.floor(Math.random() * 20) + 10,
        '区域入侵': Math.floor(Math.random() * 15) + 10,
        '设备故障': Math.floor(Math.random() * 10) + 5,
        '其他': Math.floor(Math.random() * 15) + 5
      }
    }
  }

  /**
   * 格式化文件大小
   */
  formatFileSize(bytes) {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  /**
   * 获取所有录像记录
   */
  getAllRecordings() {
    return [...this.recordings]
  }

  /**
   * 根据条件过滤录像记录
   */
  getFilteredRecordings(filters = {}) {
    let filtered = [...this.recordings]

    // 设备ID过滤
    if (filters.device_id && filters.device_id !== '') {
      filtered = filtered.filter(recording => recording.device_id === parseInt(filters.device_id))
    }

    // 告警类型过滤
    if (filters.alarm_type && filters.alarm_type !== '') {
      filtered = filtered.filter(recording => recording.alarm_type === filters.alarm_type)
    }

    // 时间范围过滤
    if (filters.start_time && filters.end_time) {
      const startTime = new Date(filters.start_time)
      const endTime = new Date(filters.end_time)
      filtered = filtered.filter(recording => {
        const recordingTime = new Date(recording.start_time.replace(' ', 'T'))
        return recordingTime >= startTime && recordingTime <= endTime
      })
    } else if (filters.start_time) {
      const startTime = new Date(filters.start_time)
      filtered = filtered.filter(recording => {
        const recordingTime = new Date(recording.start_time.replace(' ', 'T'))
        return recordingTime >= startTime
      })
    } else if (filters.end_time) {
      const endTime = new Date(filters.end_time)
      filtered = filtered.filter(recording => {
        const recordingTime = new Date(recording.start_time.replace(' ', 'T'))
        return recordingTime <= endTime
      })
    }

    // 关键词搜索（设备名称）
    if (filters.keyword && filters.keyword.trim() !== '') {
      const keyword = filters.keyword.trim().toLowerCase()
      filtered = filtered.filter(recording => 
        recording.device_name.toLowerCase().includes(keyword) ||
        recording.alarm_type.toLowerCase().includes(keyword)
      )
    }

    return filtered
  }

  /**
   * 分页获取录像记录
   */
  getPaginatedRecordings(filters = {}, page = 1, pageSize = 10) {
    const filtered = this.getFilteredRecordings(filters)
    const start = (page - 1) * pageSize
    const end = start + pageSize
    
    return {
      recordings: filtered.slice(start, end),
      total: filtered.length,
      page,
      page_size: pageSize,
      total_pages: Math.ceil(filtered.length / pageSize)
    }
  }

  /**
   * 根据ID获取录像记录
   */
  getRecordingById(recordingId) {
    // 支持字符串和数字ID
    const id = typeof recordingId === 'string' ? parseInt(recordingId) : recordingId
    return this.recordings.find(recording => recording.id === id)
  }

  /**
   * 添加新录像记录
   */
  addRecording(recordingData) {
    const newRecording = {
      id: `recording_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      device_id: recordingData.device_id,
      device_name: recordingData.device_name || '未知设备',
      alarm_type: recordingData.alarm_type || '其他',
      start_time: new Date().toISOString().replace('T', ' ').slice(0, 19),
      end_time: new Date(Date.now() + 120000).toISOString().replace('T', ' ').slice(0, 19), // 默认2分钟
      duration: '2:00',
      file_size: this.formatFileSize(Math.random() * 100 * 1024 * 1024), // 随机大小
      file_path: `/recordings/uploaded/${recordingData.filename || 'unknown.mp4'}`,
      has_tracking_box: false,
      resolution: '1920x1080',
      fps: 25,
      codec: 'H.264',
      bitrate: 3000,
      create_time: new Date().toISOString().replace('T', ' ').slice(0, 19),
      status: '正常',
      thumbnail_path: `/thumbnails/uploaded_${Date.now()}.jpg`,
      metadata: {
        weather: '未知',
        temperature: 25,
        lighting: '正常',
        scene: '室内'
      }
    }

    this.recordings.unshift(newRecording) // 添加到开头
    return newRecording
  }

  /**
   * 删除录像记录
   */
  deleteRecording(recordingId) {
    // 支持字符串和数字ID
    const id = typeof recordingId === 'string' ? parseInt(recordingId) : recordingId
    const index = this.recordings.findIndex(recording => recording.id === id)
    if (index !== -1) {
      this.recordings.splice(index, 1)
      return true
    }
    return false
  }

  /**
   * 获取统计信息
   */
  getStatistics() {
    // 重新计算最新统计信息
    this.statistics.total_recordings = this.recordings.length
    
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    this.statistics.today_count = this.recordings.filter(r => 
      new Date(r.create_time) >= today
    ).length

    this.statistics.week_count = this.recordings.filter(r => 
      new Date(r.create_time) >= weekAgo
    ).length

    this.statistics.month_count = this.recordings.filter(r => 
      new Date(r.create_time) >= monthAgo
    ).length

    return { ...this.statistics }
  }

  /**
   * 清理过期录像
   */
  cleanupOldRecordings(daysToKeep = 90) {
    const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000)
    const initialCount = this.recordings.length
    
    this.recordings = this.recordings.filter(recording => 
      new Date(recording.create_time) >= cutoffDate
    )

    return initialCount - this.recordings.length // 返回清理的数量
  }

  /**
   * 获取设备列表（用于下拉选择）
   */
  getDeviceOptions() {
    const devices = new Map()
    
    this.recordings.forEach(recording => {
      if (!devices.has(recording.device_id)) {
        devices.set(recording.device_id, {
          id: recording.device_id,
          name: recording.device_name
        })
      }
    })

    return Array.from(devices.values()).sort((a, b) => a.id - b.id)
  }

  /**
   * 获取告警类型列表（用于下拉选择）
   */
  getAlarmTypes() {
    const alarmTypes = new Set()
    
    this.recordings.forEach(recording => {
      alarmTypes.add(recording.alarm_type)
    })

    return Array.from(alarmTypes).sort()
  }
}

// 创建全局实例
export const recordingMockData = new RecordingMockData()

export default recordingMockData
