import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { statisticsAPI } from '@/api/statistics'

/**
 * 统计分析Store
 * 功能：系统统计概览、设备状态统计、报警趋势分析、多维度统计、报告导出
 */
export const useStatisticsStore = defineStore('statistics', () => {
  // State
  const overview = ref({
    total_devices: 0,
    online_devices: 0,
    total_alarms_today: 0,
    processed_alarms_today: 0,
    detection_accuracy: 0,
    system_uptime: '0%'
  })
  
  const deviceStatus = ref({
    online_count: 0,
    offline_count: 0,
    maintenance_count: 0,
    error_count: 0,
    online_rate: 0,
    device_types: []
  })
  
  const alarmTrend = ref({
    trend_data: [],
    total_count: 0,
    average_per_day: 0,
    peak_hour: '',
    most_common_type: ''
  })
  
  const multiDimensionStats = ref({
    by_type: [],
    by_location: [],
    by_time: [],
    by_device: [],
    by_confidence: []
  })
  
  const loading = ref(false)
  const dateRange = ref({
    start_date: '',
    end_date: ''
  })
  const filters = ref({
    granularity: 'day', // day, hour, week, month
    dimensions: ['type', 'location', 'time'],
    device_types: [],
    alarm_types: [],
    locations: []
  })
  const exportProgress = ref({
    isExporting: false,
    progress: 0,
    message: ''
  })
  const chartData = ref({
    alarmTrendChart: [],
    deviceStatusChart: [],
    alarmTypeChart: [],
    locationChart: [],
    timeDistributionChart: []
  })

  // Getters
  const totalDevices = computed(() => overview.value.total_devices)
  const onlineDevices = computed(() => overview.value.online_devices)
  const todayAlarms = computed(() => overview.value.total_alarms_today)
  const processedAlarms = computed(() => overview.value.processed_alarms_today)
  const detectionAccuracy = computed(() => (overview.value.detection_accuracy * 100).toFixed(1))
  const systemUptime = computed(() => overview.value.system_uptime)
  
  const deviceOnlineRate = computed(() => (deviceStatus.value.online_rate * 100).toFixed(1))
  const offlineDevices = computed(() => deviceStatus.value.offline_count)
  const maintenanceDevices = computed(() => deviceStatus.value.maintenance_count)
  const errorDevices = computed(() => deviceStatus.value.error_count)
  
  const topAlarmType = computed(() => {
    if (multiDimensionStats.value.by_type.length > 0) {
      return multiDimensionStats.value.by_type[0]
    }
    return null
  })
  
  const topAlarmLocation = computed(() => {
    if (multiDimensionStats.value.by_location.length > 0) {
      return multiDimensionStats.value.by_location[0]
    }
    return null
  })
  
  const peakAlarmTime = computed(() => {
    if (multiDimensionStats.value.by_time.length > 0) {
      return multiDimensionStats.value.by_time.reduce((prev, current) => 
        prev.count > current.count ? prev : current
      )
    }
    return null
  })

  // Actions
  /**
   * 获取统计概览
   */
  const fetchOverview = async () => {
    loading.value = true
    try {
      const response = await statisticsAPI.getOverview()
      if (response.success) {
        overview.value = response.body
        return response
      }
      throw new Error(response.message)
    } catch (error) {
      console.error('获取统计概览失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  /**
   * 获取设备状态统计
   */
  const fetchDeviceStatus = async () => {
    try {
      const response = await statisticsAPI.getDeviceStatus()
      if (response.success) {
        deviceStatus.value = response.body
        
        // 生成设备状态图表数据
        chartData.value.deviceStatusChart = [
          { name: '在线', value: deviceStatus.value.online_count, color: '#67C23A' },
          { name: '离线', value: deviceStatus.value.offline_count, color: '#F56C6C' },
          { name: '维护', value: deviceStatus.value.maintenance_count, color: '#E6A23C' },
          { name: '故障', value: deviceStatus.value.error_count, color: '#909399' }
        ]
        
        return response
      }
      throw new Error(response.message)
    } catch (error) {
      console.error('获取设备状态统计失败:', error)
      throw error
    }
  }

  /**
   * 获取报警趋势分析
   * @param {Object} params - 查询参数
   */
  const fetchAlarmTrend = async (params = {}) => {
    try {
      const queryParams = {
        start_date: dateRange.value.start_date,
        end_date: dateRange.value.end_date,
        granularity: filters.value.granularity,
        ...params
      }
      
      const response = await statisticsAPI.getAlarmTrend(queryParams)
      if (response.success) {
        alarmTrend.value = response.body
        
        // 生成趋势图表数据
        chartData.value.alarmTrendChart = alarmTrend.value.trend_data.map(item => ({
          date: item.date || item.hour || item.week,
          count: item.count,
          processed: item.processed || 0,
          unprocessed: item.count - (item.processed || 0)
        }))
        
        return response
      }
      throw new Error(response.message)
    } catch (error) {
      console.error('获取报警趋势失败:', error)
      throw error
    }
  }

  /**
   * 获取多维度预警统计
   * @param {Object} params - 查询参数
   */
  const fetchMultiDimensionStats = async (params = {}) => {
    try {
      const queryParams = {
        dimensions: filters.value.dimensions.join(','),
        start_date: dateRange.value.start_date,
        end_date: dateRange.value.end_date,
        ...params
      }
      
      const response = await statisticsAPI.getMultiDimensionStats(queryParams)
      if (response.success) {
        multiDimensionStats.value = response.body
        
        // 生成各种图表数据
        if (response.body.by_type) {
          chartData.value.alarmTypeChart = response.body.by_type.map(item => ({
            name: item.type,
            value: item.count,
            percentage: (item.percentage * 100).toFixed(1)
          }))
        }
        
        if (response.body.by_location) {
          chartData.value.locationChart = response.body.by_location.map(item => ({
            name: item.location,
            value: item.count,
            percentage: (item.percentage * 100).toFixed(1)
          }))
        }
        
        if (response.body.by_time) {
          chartData.value.timeDistributionChart = response.body.by_time.map(item => ({
            time: item.hour,
            count: item.count
          }))
        }
        
        return response
      }
      throw new Error(response.message)
    } catch (error) {
      console.error('获取多维度统计失败:', error)
      throw error
    }
  }

  /**
   * 导出统计报告
   * @param {Object} exportParams - 导出参数
   */
  const exportReport = async (exportParams) => {
    exportProgress.value.isExporting = true
    exportProgress.value.progress = 0
    exportProgress.value.message = '开始生成报告...'
    
    try {
      const response = await statisticsAPI.exportReport(exportParams, (progress) => {
        exportProgress.value.progress = progress
        if (progress < 30) {
          exportProgress.value.message = '正在收集数据...'
        } else if (progress < 60) {
          exportProgress.value.message = '正在生成图表...'
        } else if (progress < 90) {
          exportProgress.value.message = '正在生成报告文件...'
        } else {
          exportProgress.value.message = '报告生成完成'
        }
      })
      
      if (response.success) {
        exportProgress.value.progress = 100
        exportProgress.value.message = '报告导出成功'
        return response
      }
      throw new Error(response.message)
    } catch (error) {
      console.error('导出报告失败:', error)
      exportProgress.value.message = '导出失败: ' + error.message
      throw error
    } finally {
      exportProgress.value.isExporting = false
    }
  }

  /**
   * 设置日期范围
   * @param {string} startDate - 开始日期
   * @param {string} endDate - 结束日期
   */
  const setDateRange = (startDate, endDate) => {
    dateRange.value = {
      start_date: startDate,
      end_date: endDate
    }
  }

  /**
   * 设置筛选条件
   * @param {Object} newFilters - 新的筛选条件
   */
  const setFilters = (newFilters) => {
    filters.value = { ...filters.value, ...newFilters }
  }

  /**
   * 获取今天的统计数据
   */
  const getTodayStats = async () => {
    const today = new Date().toISOString().split('T')[0]
    setDateRange(today, today)
    
    await Promise.all([
      fetchAlarmTrend(),
      fetchMultiDimensionStats()
    ])
  }

  /**
   * 获取本周统计数据
   */
  const getWeekStats = async () => {
    const today = new Date()
    const weekStart = new Date(today.setDate(today.getDate() - today.getDay()))
    const weekEnd = new Date(today.setDate(today.getDate() - today.getDay() + 6))
    
    setDateRange(
      weekStart.toISOString().split('T')[0],
      weekEnd.toISOString().split('T')[0]
    )
    
    setFilters({ granularity: 'day' })
    
    await Promise.all([
      fetchAlarmTrend(),
      fetchMultiDimensionStats()
    ])
  }

  /**
   * 获取本月统计数据
   */
  const getMonthStats = async () => {
    const today = new Date()
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0)
    
    setDateRange(
      monthStart.toISOString().split('T')[0],
      monthEnd.toISOString().split('T')[0]
    )
    
    setFilters({ granularity: 'day' })
    
    await Promise.all([
      fetchAlarmTrend(),
      fetchMultiDimensionStats()
    ])
  }

  /**
   * 获取自定义时间范围统计
   * @param {string} startDate - 开始日期
   * @param {string} endDate - 结束日期
   * @param {string} granularity - 时间粒度
   */
  const getCustomRangeStats = async (startDate, endDate, granularity = 'day') => {
    setDateRange(startDate, endDate)
    setFilters({ granularity })
    
    await Promise.all([
      fetchAlarmTrend(),
      fetchMultiDimensionStats()
    ])
  }

  /**
   * 刷新所有统计数据
   */
  const refreshAllStats = async () => {
    await Promise.all([
      fetchOverview(),
      fetchDeviceStatus(),
      fetchAlarmTrend(),
      fetchMultiDimensionStats()
    ])
  }

  /**
   * 获取实时统计概览（定时刷新用）
   */
  const getRealtimeOverview = async () => {
    try {
      await fetchOverview()
      await fetchDeviceStatus()
    } catch (error) {
      console.error('获取实时统计失败:', error)
    }
  }

  /**
   * 开始自动刷新统计数据
   * @param {number} interval - 刷新间隔（毫秒）
   */
  const startAutoRefresh = (interval = 60000) => {
    return setInterval(() => {
      getRealtimeOverview()
    }, interval)
  }

  /**
   * 计算统计指标
   */
  const calculateMetrics = computed(() => {
    const metrics = {}
    
    // 设备相关指标
    metrics.deviceHealth = {
      total: totalDevices.value,
      online_rate: parseFloat(deviceOnlineRate.value),
      offline_count: offlineDevices.value,
      error_rate: totalDevices.value > 0 ? (errorDevices.value / totalDevices.value * 100).toFixed(1) : 0
    }
    
    // 告警相关指标
    metrics.alarmMetrics = {
      total_today: todayAlarms.value,
      processed_rate: todayAlarms.value > 0 ? (processedAlarms.value / todayAlarms.value * 100).toFixed(1) : 0,
      unprocessed_count: todayAlarms.value - processedAlarms.value,
      detection_accuracy: parseFloat(detectionAccuracy.value)
    }
    
    // 系统相关指标
    metrics.systemMetrics = {
      uptime: systemUptime.value,
      performance_score: parseFloat(detectionAccuracy.value) * parseFloat(deviceOnlineRate.value) / 100
    }
    
    return metrics
  })

  /**
   * 清空导出进度
   */
  const clearExportProgress = () => {
    exportProgress.value = {
      isExporting: false,
      progress: 0,
      message: ''
    }
  }

  /**
   * 重置状态
   */
  const resetState = () => {
    overview.value = {
      total_devices: 0,
      online_devices: 0,
      total_alarms_today: 0,
      processed_alarms_today: 0,
      detection_accuracy: 0,
      system_uptime: '0%'
    }
    deviceStatus.value = {
      online_count: 0,
      offline_count: 0,
      maintenance_count: 0,
      error_count: 0,
      online_rate: 0,
      device_types: []
    }
    alarmTrend.value = {
      trend_data: [],
      total_count: 0,
      average_per_day: 0,
      peak_hour: '',
      most_common_type: ''
    }
    multiDimensionStats.value = {
      by_type: [],
      by_location: [],
      by_time: [],
      by_device: [],
      by_confidence: []
    }
    dateRange.value = {
      start_date: '',
      end_date: ''
    }
    filters.value = {
      granularity: 'day',
      dimensions: ['type', 'location', 'time'],
      device_types: [],
      alarm_types: [],
      locations: []
    }
    chartData.value = {
      alarmTrendChart: [],
      deviceStatusChart: [],
      alarmTypeChart: [],
      locationChart: [],
      timeDistributionChart: []
    }
    clearExportProgress()
  }

  return {
    // State
    overview,
    deviceStatus,
    alarmTrend,
    multiDimensionStats,
    loading,
    dateRange,
    filters,
    exportProgress,
    chartData,
    
    // Getters
    totalDevices,
    onlineDevices,
    todayAlarms,
    processedAlarms,
    detectionAccuracy,
    systemUptime,
    deviceOnlineRate,
    offlineDevices,
    maintenanceDevices,
    errorDevices,
    topAlarmType,
    topAlarmLocation,
    peakAlarmTime,
    calculateMetrics,
    
    // Actions
    fetchOverview,
    fetchDeviceStatus,
    fetchAlarmTrend,
    fetchMultiDimensionStats,
    exportReport,
    setDateRange,
    setFilters,
    getTodayStats,
    getWeekStats,
    getMonthStats,
    getCustomRangeStats,
    refreshAllStats,
    getRealtimeOverview,
    startAutoRefresh,
    clearExportProgress,
    resetState
  }
})