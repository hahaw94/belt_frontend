// 统计分析Mock数据
class StatisticsMockData {
  constructor() {
    this.generateData()
  }

  generateData() {
    // 生成趋势数据
    this.trendData = this.generateTrendData()
  }

  generateTrendData() {
    const data = []
    const now = new Date()
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      const dateStr = date.toISOString().split('T')[0]
      
      data.push({
        date: dateStr,
        total_alarms: Math.floor(Math.random() * 50) + 10,
        behavior_alarms: Math.floor(Math.random() * 20) + 5,
        vehicle_alarms: Math.floor(Math.random() * 15) + 3,
        intrusion_alarms: Math.floor(Math.random() * 10) + 2,
        processed_rate: (Math.random() * 0.3 + 0.7).toFixed(2)
      })
    }
    
    return data
  }

  getOverview() {
    return {
      total_devices: 30,
      online_devices: 28,
      total_alarms_today: 15,
      processed_alarms_today: 12,
      detection_accuracy: 0.92,
      system_uptime: '99.8%'
    }
  }

  getDeviceStatus() {
    return {
      total_count: 30,
      online_count: 28,
      offline_count: 2,
      online_rate: 0.933,
      device_types: [
        { type: 'IPC摄像机', count: 15, online: 14 },
        { type: '球型摄像机', count: 8, online: 7 },
        { type: '枪型摄像机', count: 5, online: 5 },
        { type: '半球摄像机', count: 2, online: 2 }
      ],
      areas: [
        { area: '区域1', total: 8, online: 7, offline: 1 },
        { area: '区域2', total: 6, online: 6, offline: 0 },
        { area: '区域3', total: 7, online: 7, offline: 0 },
        { area: '区域4', total: 5, online: 4, offline: 1 },
        { area: '区域5', total: 4, online: 4, offline: 0 }
      ]
    }
  }

  getAlarmTrend(params = {}) {
    const { granularity = 'day' } = params
    
    if (granularity === 'hour') {
      // 24小时数据
      const data = []
      for (let i = 0; i < 24; i++) {
        data.push({
          time: `${i.toString().padStart(2, '0')}:00`,
          count: Math.floor(Math.random() * 10) + 1
        })
      }
      return { trend_data: data }
    } else {
      // 30天数据
      return { trend_data: this.trendData }
    }
  }

  getMultiDimensionData(dimensions) {
    const data = {}
    
    if (dimensions.includes('type')) {
      data.by_type = [
        {
          dimension: '异常行为',
          count: 45,
          percentage: 0.35,
          avg_per_day: 6.4,
          max_day: '2024-01-17',
          trend: '下降',
          description: '主要发生在工作时间，需重点关注'
        },
        {
          dimension: '车辆违规',
          count: 32,
          percentage: 0.25,
          avg_per_day: 4.6,
          max_day: '2024-01-15',
          trend: '稳定',
          description: '多发生在出入口区域'
        },
        {
          dimension: '人员闯入',
          count: 28,
          percentage: 0.22,
          avg_per_day: 4.0,
          max_day: '2024-01-18',
          trend: '上升',
          description: '夜间时段较多'
        },
        {
          dimension: '物品遗留',
          count: 18,
          percentage: 0.14,
          avg_per_day: 2.6,
          max_day: '2024-01-16',
          trend: '稳定',
          description: '主要在公共区域'
        },
        {
          dimension: '烟火检测',
          count: 5,
          percentage: 0.04,
          avg_per_day: 0.7,
          max_day: '2024-01-19',
          trend: '下降',
          description: '安全意识提升'
        }
      ]
    }
    
    if (dimensions.includes('location')) {
      data.by_location = [
        {
          dimension: '前门',
          count: 38,
          percentage: 0.30,
          avg_per_day: 5.4,
          max_day: '2024-01-16',
          trend: '上升',
          description: '人流量大，告警频发'
        },
        {
          dimension: '后门',
          count: 25,
          percentage: 0.20,
          avg_per_day: 3.6,
          max_day: '2024-01-17',
          trend: '稳定',
          description: '货物进出较多'
        },
        {
          dimension: '大厅',
          count: 22,
          percentage: 0.17,
          avg_per_day: 3.1,
          max_day: '2024-01-15',
          trend: '下降',
          description: '监控覆盖良好'
        },
        {
          dimension: '停车场',
          count: 28,
          percentage: 0.22,
          avg_per_day: 4.0,
          max_day: '2024-01-18',
          trend: '上升',
          description: '车辆违停较多'
        },
        {
          dimension: '其他区域',
          count: 15,
          percentage: 0.11,
          avg_per_day: 2.1,
          max_day: '2024-01-14',
          trend: '稳定',
          description: '零散告警'
        }
      ]
    }
    
    if (dimensions.includes('time')) {
      data.by_time = [
        { hour: '00:00-02:00', count: 3 },
        { hour: '02:00-04:00', count: 2 },
        { hour: '04:00-06:00', count: 1 },
        { hour: '06:00-08:00', count: 8 },
        { hour: '08:00-10:00', count: 12 },
        { hour: '10:00-12:00', count: 15 },
        { hour: '12:00-14:00', count: 10 },
        { hour: '14:00-16:00', count: 18 },
        { hour: '16:00-18:00', count: 16 },
        { hour: '18:00-20:00', count: 14 },
        { hour: '20:00-22:00', count: 8 },
        { hour: '22:00-24:00', count: 5 }
      ]
    }
    
    return data
  }
}

export const statisticsMockData = new StatisticsMockData()