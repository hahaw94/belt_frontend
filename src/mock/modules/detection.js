// 实时检测Mock数据
class DetectionMockData {
  constructor() {
    this.detectionStatus = 'running'
    this.activeDevices = 15
    this.generateData()
  }

  generateData() {
    // 生成预警数据
    this.warnings = this.generateWarnings()
  }

  generateWarnings() {
    const warnings = []
    const types = ['异常行为', '车辆违规', '人员闯入', '物品遗留']
    const deviceNames = ['前门摄像头', '后门摄像头', '大厅摄像头', '停车场摄像头', '侧门摄像头']
    const descriptions = [
      '检测到可疑人员逗留',
      '发现车辆违规停放',
      '检测到非授权人员进入',
      '发现可疑物品遗留'
    ]

    for (let i = 0; i < 5; i++) {
      const type = types[Math.floor(Math.random() * types.length)]
      const deviceId = Math.floor(Math.random() * 5) + 1
      const deviceName = deviceNames[deviceId - 1]
      const description = descriptions[Math.floor(Math.random() * descriptions.length)]
      const timestamp = new Date(Date.now() - Math.floor(Math.random() * 30 * 60 * 1000)) // 最近30分钟

      warnings.push({
        device_id: deviceId,
        device_name: deviceName,
        warning_type: type,
        description: description,
        confidence: (Math.random() * 0.3 + 0.7).toFixed(2), // 0.7-1.0
        timestamp: timestamp.toISOString().replace('T', ' ').split('.')[0]
      })
    }

    return warnings.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
  }

  getRealTimeStatus() {
    const todayAlarms = Math.floor(Math.random() * 20) + 5
    const accuracy = (Math.random() * 0.1 + 0.9).toFixed(2) // 0.9-1.0

    return {
      detection_status: this.detectionStatus,
      active_devices: this.activeDevices,
      total_alarms_today: todayAlarms,
      detection_accuracy: parseFloat(accuracy)
    }
  }

  startDetection(deviceIds = []) {
    this.detectionStatus = 'running'
    this.activeDevices = deviceIds.length || this.activeDevices
    return true
  }

  stopDetection(deviceIds = []) {
    if (deviceIds.length === 0) {
      this.detectionStatus = 'stopped'
      this.activeDevices = 0
    } else {
      this.activeDevices = Math.max(0, this.activeDevices - deviceIds.length)
      if (this.activeDevices === 0) {
        this.detectionStatus = 'stopped'
      }
    }
    return true
  }

  getVideoStream(deviceId) {
    const streamUrls = {
      1: 'rtmp://192.168.1.101:1935/live/stream1',
      2: 'rtmp://192.168.1.102:1935/live/stream2',
      3: 'rtmp://192.168.1.103:1935/live/stream3',
      4: 'rtmp://192.168.1.104:1935/live/stream4',
      5: 'rtmp://192.168.1.105:1935/live/stream5'
    }

    const backupUrls = {
      1: 'rtsp://192.168.1.101:554/stream',
      2: 'rtsp://192.168.1.102:554/stream',
      3: 'rtsp://192.168.1.103:554/stream',
      4: 'rtsp://192.168.1.104:554/stream',
      5: 'rtsp://192.168.1.105:554/stream'
    }

    return {
      stream_url: streamUrls[deviceId] || streamUrls[1],
      backup_url: backupUrls[deviceId] || backupUrls[1],
      device_status: Math.random() > 0.1 ? '在线' : '离线'
    }
  }

  getMultiStreams(deviceIds = [1, 2, 3, 4], layout = 4) {
    const streams = deviceIds.map((deviceId, index) => {
      const streamInfo = this.getVideoStream(deviceId)
      return {
        device_id: deviceId,
        device_name: `摄像头${deviceId.toString().padStart(2, '0')}`,
        stream_url: streamInfo.stream_url,
        status: streamInfo.device_status,
        position: index + 1
      }
    })

    return {
      layout: layout,
      streams: streams
    }
  }

  getWarnings() {
    // 重新生成一些新的预警（模拟实时更新）
    if (Math.random() > 0.7) {
      this.warnings = this.generateWarnings()
    }

    return {
      warnings: this.warnings
    }
  }

  ptzControl(deviceId, command) {
    // 模拟PTZ控制响应
    return {
      device_id: deviceId,
      command: command,
      result: 'success',
      message: 'PTZ控制指令已发送'
    }
  }
}

export const detectionMockData = new DetectionMockData()