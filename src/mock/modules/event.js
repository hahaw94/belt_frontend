// 事件中心Mock数据
class EventMockData {
  constructor() {
    this.alarms = []
    this.locations = []
    this.initData()
  }

  initData() {
    // 初始化点位数据
    this.locations = [
      { id: 1, name: '前门', description: '主入口监控点', device_count: 2 },
      { id: 2, name: '后门', description: '后门出入口', device_count: 1 },
      { id: 3, name: '大厅', description: '大厅中央区域', device_count: 3 },
      { id: 4, name: '停车场', description: '停车场监控区域', device_count: 4 },
      { id: 5, name: '侧门', description: '侧门通道', device_count: 1 }
    ]

    // 初始化报警数据
    const alarmTypes = ['异常行为', '车辆违规', '人员闯入', '物品遗留', '烟火检测']
    const statuses = ['未处理', '处理中', '已处理']
    const descriptions = [
      '检测到可疑人员逗留',
      '发现车辆违规停放',
      '检测到非授权人员进入',
      '发现可疑物品遗留',
      '检测到烟火信号'
    ]

    for (let i = 1; i <= 100; i++) {
      const type = alarmTypes[Math.floor(Math.random() * alarmTypes.length)]
      const locationIndex = Math.floor(Math.random() * this.locations.length)
      const location = this.locations[locationIndex]
      const status = statuses[Math.floor(Math.random() * statuses.length)]
      const description = descriptions[Math.floor(Math.random() * descriptions.length)]
      const confidence = (Math.random() * 0.3 + 0.7).toFixed(2) // 0.7-1.0
      
      const time = new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000))
      const processTime = status === '已处理' ? 
        new Date(time.getTime() + Math.floor(Math.random() * 24 * 60 * 60 * 1000)) : null
      
      // 生成多个告警图片
      const imageCount = Math.floor(Math.random() * 3) + 1
      const images = []
      for (let j = 0; j < imageCount; j++) {
        images.push(`/uploads/alarms/${time.toISOString().split('T')[0].replace(/-/g, '')}_${time.getHours().toString().padStart(2, '0')}${time.getMinutes().toString().padStart(2, '0')}_${i.toString().padStart(3, '0')}_${j + 1}.jpg`)
      }

      this.alarms.push({
        id: i,
        time: time.toISOString().replace('T', ' ').split('.')[0],
        type: type,
        location: location.name,
        location_id: location.id,
        device_id: Math.floor(Math.random() * 5) + 1,
        device_name: `${location.name}摄像头`,
        description: description,
        confidence: parseFloat(confidence),
        status: status,
        images: images,
        create_time: time.toISOString().replace('T', ' ').split('.')[0],
        process_time: processTime ? processTime.toISOString().replace('T', ' ').split('.')[0] : null,
        process_user: status === '已处理' ? ['admin', 'operator01', 'user02'][Math.floor(Math.random() * 3)] : null,
        process_note: status === '已处理' ? ['已确认处理', '误报已标记', '现场检查完毕'][Math.floor(Math.random() * 3)] : null
      })
    }

    // 按时间倒序排列
    this.alarms.sort((a, b) => new Date(b.time) - new Date(a.time))
  }

  getAllAlarms() {
    return [...this.alarms]
  }

  getAlarmById(id) {
    return this.alarms.find(alarm => alarm.id === id)
  }

  addAlarm(alarmData) {
    const newId = Math.max(0, ...this.alarms.map(a => a.id)) + 1
    const newAlarm = {
      id: newId,
      time: new Date().toISOString().replace('T', ' ').split('.')[0],
      type: alarmData.type || '异常行为',
      location: alarmData.location || '前门',
      location_id: alarmData.location_id || 1,
      device_id: alarmData.device_id || 1,
      device_name: alarmData.device_name || '前门摄像头',
      description: alarmData.description || '检测到异常情况',
      confidence: alarmData.confidence || 0.85,
      status: '未处理',
      images: alarmData.images || [`/uploads/alarms/${Date.now()}_001.jpg`],
      create_time: new Date().toISOString().replace('T', ' ').split('.')[0],
      process_time: null,
      process_user: null,
      process_note: null
    }

    this.alarms.unshift(newAlarm)
    return newAlarm
  }

  processAlarm(id, processData = {}) {
    const alarm = this.getAlarmById(id)
    if (!alarm) return false

    alarm.status = '已处理'
    alarm.process_time = new Date().toISOString().replace('T', ' ').split('.')[0]
    alarm.process_user = processData.process_user || 'admin'
    alarm.process_note = processData.process_note || '已确认处理'

    return true
  }

  markNegativeSample(id, reason = '误报') {
    const alarm = this.getAlarmById(id)
    if (!alarm) return false

    alarm.status = '已处理'
    alarm.process_time = new Date().toISOString().replace('T', ' ').split('.')[0]
    alarm.process_user = 'admin'
    alarm.process_note = `负样本标记: ${reason}`

    return true
  }

  getLocations() {
    return [...this.locations]
  }

  getLocationById(id) {
    return this.locations.find(location => location.id === id)
  }

  addLocation(locationData) {
    const newId = Math.max(0, ...this.locations.map(l => l.id)) + 1
    const newLocation = {
      id: newId,
      name: locationData.name,
      description: locationData.description,
      device_count: locationData.device_count || 0
    }

    this.locations.push(newLocation)
    return newLocation
  }

  updateLocation(id, locationData) {
    const index = this.locations.findIndex(location => location.id === id)
    if (index === -1) return false

    Object.assign(this.locations[index], locationData)
    return true
  }

  deleteLocation(id) {
    const index = this.locations.findIndex(location => location.id === id)
    if (index === -1) return false

    this.locations.splice(index, 1)
    return true
  }

  getAlarmStatistics() {
    const total = this.alarms.length
    const unprocessed = this.alarms.filter(a => a.status === '未处理').length
    const processing = this.alarms.filter(a => a.status === '处理中').length
    const processed = this.alarms.filter(a => a.status === '已处理').length

    const today = new Date().toISOString().split('T')[0]
    const todayAlarms = this.alarms.filter(a => a.time.startsWith(today)).length

    const typeStats = this.alarms.reduce((acc, alarm) => {
      acc[alarm.type] = (acc[alarm.type] || 0) + 1
      return acc
    }, {})

    return {
      total_alarms: total,
      unprocessed_count: unprocessed,
      processing_count: processing,
      processed_count: processed,
      today_count: todayAlarms,
      alarm_types: typeStats
    }
  }
}

export const eventMockData = new EventMockData()