// 录像管理Mock数据
class RecordingMockData {
  constructor() {
    this.recordings = []
    this.initData()
  }

  initData() {
    const deviceNames = ['前门摄像头', '后门摄像头', '侧门摄像头', '大厅摄像头', '停车场摄像头']
    const alarmTypes = ['异常行为', '车辆违规', '人员闯入', '物品遗留', '烟火检测']
    const resolutions = ['1920x1080', '1280x720', '2560x1440']
    const fpsList = [25, 30, 60]

    for (let i = 1; i <= 100; i++) {
      const deviceId = Math.floor(Math.random() * 5) + 1
      const deviceName = deviceNames[deviceId - 1]
      const alarmType = alarmTypes[Math.floor(Math.random() * alarmTypes.length)]
      const resolution = resolutions[Math.floor(Math.random() * resolutions.length)]
      const fps = fpsList[Math.floor(Math.random() * fpsList.length)]
      
      const startTime = new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000))
      const duration = Math.floor(Math.random() * 30) + 10 // 10-40秒
      const endTime = new Date(startTime.getTime() + duration * 1000)
      
      const fileSize = ((Math.random() * 20) + 5).toFixed(1) // 5-25MB

      this.recordings.push({
        id: i,
        device_id: deviceId,
        device_name: deviceName,
        alarm_id: 100 + i,
        alarm_type: alarmType,
        start_time: startTime.toISOString().replace('T', ' ').split('.')[0],
        end_time: endTime.toISOString().replace('T', ' ').split('.')[0],
        duration: duration,
        file_path: `/recordings/${startTime.toISOString().split('T')[0].replace(/-/g, '')}/${startTime.getHours().toString().padStart(2, '0')}${startTime.getMinutes().toString().padStart(2, '0')}_${startTime.getSeconds().toString().padStart(2, '0')}_alarm_${100 + i}.mp4`,
        file_size: `${fileSize} MB`,
        has_tracking_box: Math.random() > 0.2,
        create_time: startTime.toISOString().replace('T', ' ').split('.')[0],
        resolution: resolution,
        fps: fps
      })
    }

    // 按时间倒序排列
    this.recordings.sort((a, b) => new Date(b.start_time) - new Date(a.start_time))
  }

  getAllRecordings() {
    return [...this.recordings]
  }

  getRecording(id) {
    return this.recordings.find(recording => recording.id === id)
  }

  addRecording(deviceId = null) {
    const newId = Math.max(0, ...this.recordings.map(r => r.id)) + 1
    const deviceNames = ['前门摄像头', '后门摄像头', '侧门摄像头', '大厅摄像头', '停车场摄像头']
    const alarmTypes = ['异常行为', '车辆违规', '人员闯入', '物品遗留', '烟火检测']
    
    const selectedDeviceId = deviceId || Math.floor(Math.random() * 5) + 1
    const deviceName = deviceNames[selectedDeviceId - 1]
    const alarmType = alarmTypes[Math.floor(Math.random() * alarmTypes.length)]
    
    const startTime = new Date()
    const duration = Math.floor(Math.random() * 30) + 10
    const endTime = new Date(startTime.getTime() + duration * 1000)
    const fileSize = ((Math.random() * 20) + 5).toFixed(1)

    const newRecording = {
      id: newId,
      device_id: selectedDeviceId,
      device_name: deviceName,
      alarm_id: 100 + newId,
      alarm_type: alarmType,
      start_time: startTime.toISOString().replace('T', ' ').split('.')[0],
      end_time: endTime.toISOString().replace('T', ' ').split('.')[0],
      duration: duration,
      file_path: `/recordings/${startTime.toISOString().split('T')[0].replace(/-/g, '')}/${startTime.getHours().toString().padStart(2, '0')}${startTime.getMinutes().toString().padStart(2, '0')}_${startTime.getSeconds().toString().padStart(2, '0')}_alarm_${100 + newId}.mp4`,
      file_size: `${fileSize} MB`,
      has_tracking_box: true,
      create_time: startTime.toISOString().replace('T', ' ').split('.')[0],
      resolution: '1920x1080',
      fps: 25
    }

    this.recordings.unshift(newRecording)
    return newRecording
  }

  deleteRecording(id) {
    const index = this.recordings.findIndex(recording => recording.id === id)
    if (index === -1) return false

    this.recordings.splice(index, 1)
    return true
  }

  getStatistics() {
    const totalRecordings = this.recordings.length
    const totalSizeInMB = this.recordings.reduce((sum, recording) => {
      return sum + parseFloat(recording.file_size.replace(' MB', ''))
    }, 0)
    const totalSizeInGB = (totalSizeInMB / 1024).toFixed(1)
    
    const avgSizeInMB = totalRecordings > 0 ? (totalSizeInMB / totalRecordings).toFixed(1) : 0
    const dailyAverage = (totalSizeInMB / 30).toFixed(1) // 假设30天的数据

    return {
      total_recordings: totalRecordings,
      total_size: `${totalSizeInGB} GB`,
      available_space: '150.2 GB',
      retention_days: 180,
      auto_cleanup: true,
      daily_average: `${dailyAverage} MB`,
      avg_file_size: `${avgSizeInMB} MB`
    }
  }
}

export const recordingMockData = new RecordingMockData()