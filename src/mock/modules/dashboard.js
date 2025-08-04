// 首页看板Mock数据
class DashboardMockData {
  constructor() {
    this.generateData()
  }

  generateData() {
    // 生成最新告警数据
    this.latestAlarms = this.generateLatestAlarms()
  }

  generateLatestAlarms() {
    const alarms = []
    const types = ['异常行为', '车辆违规', '人员闯入', '物品遗留', '烟火检测']
    const locations = ['前门', '后门', '大厅', '停车场', '侧门']
    const deviceNames = ['前门摄像头', '后门摄像头', '大厅摄像头', '停车场摄像头', '侧门摄像头']

    for (let i = 0; i < 10; i++) {
      const type = types[Math.floor(Math.random() * types.length)]
      const location = locations[Math.floor(Math.random() * locations.length)]
      const deviceName = deviceNames[Math.floor(Math.random() * deviceNames.length)]
      const time = new Date(Date.now() - Math.floor(Math.random() * 2 * 60 * 60 * 1000)) // 最近2小时

      alarms.push({
        id: 100 + i,
        time: time.toISOString().replace('T', ' ').split('.')[0],
        type: type,
        location: location,
        image: `/uploads/alarms/${time.toISOString().split('T')[0].replace(/-/g, '')}_${time.getHours().toString().padStart(2, '0')}${time.getMinutes().toString().padStart(2, '0')}_${100 + i}.jpg`,
        device_name: deviceName
      })
    }

    return alarms.sort((a, b) => new Date(b.time) - new Date(a.time))
  }

  getOverview() {
    return {
      camera_stats: {
        total_cameras: 30,
        online_cameras: 28,
        offline_cameras: 2,
        online_rate: 0.933
      },
      alarm_stats: {
        week_total: 85,
        today_total: 12,
        unprocessed: 5,
        processed: 7
      },
      alarm_ranking: [
        {
          type: '异常行为',
          count: 35,
          percentage: 0.412
        },
        {
          type: '车辆违规',
          count: 28,
          percentage: 0.329
        },
        {
          type: '人员闯入',
          count: 22,
          percentage: 0.259
        }
      ],
      latest_alarms: this.latestAlarms.slice(0, 5)
    }
  }

  getCadMap() {
    return {
      map_config: {
        background_image: '/uploads/maps/belt_layout.png',
        width: 1920,
        height: 1080
      },
      camera_points: [
        {
          device_id: 1,
          device_name: '皮带头部摄像头',
          x: 150,
          y: 200,
          status: '在线',
          stream_url: 'rtmp://192.168.1.101:1935/live/stream1'
        },
        {
          device_id: 2,
          device_name: '皮带尾部摄像头',
          x: 800,
          y: 200,
          status: '在线',
          stream_url: 'rtmp://192.168.1.102:1935/live/stream2'
        },
        {
          device_id: 3,
          device_name: '皮带中部摄像头01',
          x: 350,
          y: 150,
          status: '在线',
          stream_url: 'rtmp://192.168.1.103:1935/live/stream3'
        },
        {
          device_id: 4,
          device_name: '皮带中部摄像头02',
          x: 550,
          y: 250,
          status: '离线',
          stream_url: 'rtmp://192.168.1.104:1935/live/stream4'
        },
        {
          device_id: 5,
          device_name: '控制室摄像头',
          x: 100,
          y: 400,
          status: '在线',
          stream_url: 'rtmp://192.168.1.105:1935/live/stream5'
        }
      ]
    }
  }

  getCameraLive(deviceId) {
    const cameras = this.getCadMap().camera_points
    const camera = cameras.find(c => c.device_id === deviceId)
    
    if (!camera) {
      return null
    }

    return {
      device_id: deviceId,
      device_name: camera.device_name,
      stream_url: camera.stream_url,
      backup_url: camera.stream_url.replace('rtmp', 'rtsp').replace('1935', '554'),
      status: camera.status,
      resolution: '1920x1080',
      fps: 25
    }
  }
}

export const dashboardMockData = new DashboardMockData()