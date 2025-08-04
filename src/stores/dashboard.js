import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { dashboardAPI } from '@/api/dashboard'

/**
 * 首页数据看板Store
 * 功能：数据看板概览、CAD图层管理、摄像头实时画面
 */
export const useDashboardStore = defineStore('dashboard', () => {
  // State
  const cameraStats = ref({
    total_cameras: 0,
    online_cameras: 0,
    offline_cameras: 0,
    online_rate: 0
  })
  
  const alarmStats = ref({
    week_total: 0,
    today_total: 0,
    unprocessed: 0,
    processed: 0
  })
  
  const alarmRanking = ref([])
  const latestAlarms = ref([])
  const mapConfig = ref({
    background_image: '',
    width: 1920,
    height: 1080
  })
  const cameraPoints = ref([])
  const selectedCamera = ref(null)
  const liveStream = ref(null)
  const loading = ref(false)
  const lastUpdate = ref(null)

  // Getters
  const totalCameras = computed(() => cameraStats.value.total_cameras)
  const onlineCameras = computed(() => cameraStats.value.online_cameras)
  const offlineCameras = computed(() => cameraStats.value.offline_cameras)
  const onlineRate = computed(() => (cameraStats.value.online_rate * 100).toFixed(1))
  const todayAlarms = computed(() => alarmStats.value.today_total)
  const unprocessedAlarms = computed(() => alarmStats.value.unprocessed)
  const hasNewAlarms = computed(() => alarmStats.value.unprocessed > 0)
  
  const topAlarmType = computed(() => {
    return alarmRanking.value.length > 0 ? alarmRanking.value[0] : null
  })

  // Actions
  /**
   * 获取数据看板概览
   */
  const fetchOverview = async () => {
    loading.value = true
    try {
      const response = await dashboardAPI.getOverview()
      if (response.success) {
        cameraStats.value = response.body.camera_stats
        alarmStats.value = response.body.alarm_stats
        alarmRanking.value = response.body.alarm_ranking
        latestAlarms.value = response.body.latest_alarms
        lastUpdate.value = new Date()
        return response
      }
      throw new Error(response.message)
    } catch (error) {
      console.error('获取数据看板失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  /**
   * 获取CAD图层信息
   */
  const fetchCadMap = async () => {
    try {
      const response = await dashboardAPI.getCadMap()
      if (response.success) {
        mapConfig.value = response.body.map_config
        cameraPoints.value = response.body.camera_points
        return response
      }
      throw new Error(response.message)
    } catch (error) {
      console.error('获取CAD图层失败:', error)
      throw error
    }
  }

  /**
   * 获取摄像头实时画面
   * @param {number} deviceId - 设备ID
   */
  const fetchCameraLive = async (deviceId) => {
    try {
      const response = await dashboardAPI.getCameraLive(deviceId)
      if (response.success) {
        liveStream.value = response.body
        selectedCamera.value = deviceId
        return response
      }
      throw new Error(response.message)
    } catch (error) {
      console.error('获取实时画面失败:', error)
      throw error
    }
  }

  /**
   * 选择摄像头
   * @param {number} deviceId - 设备ID
   */
  const selectCamera = async (deviceId) => {
    if (selectedCamera.value === deviceId) {
      // 如果已选中同一个摄像头，则关闭
      selectedCamera.value = null
      liveStream.value = null
      return
    }
    
    await fetchCameraLive(deviceId)
  }

  /**
   * 关闭实时画面
   */
  const closeLiveStream = () => {
    selectedCamera.value = null
    liveStream.value = null
  }

  /**
   * 更新摄像头状态
   * @param {number} deviceId - 设备ID
   * @param {string} status - 状态
   */
  const updateCameraStatus = (deviceId, status) => {
    const camera = cameraPoints.value.find(cam => cam.device_id === deviceId)
    if (camera) {
      camera.status = status
      
      // 更新统计信息
      if (status === '在线') {
        cameraStats.value.online_cameras++
        cameraStats.value.offline_cameras--
      } else if (status === '离线') {
        cameraStats.value.online_cameras--
        cameraStats.value.offline_cameras++
      }
      
      // 重新计算在线率
      if (cameraStats.value.total_cameras > 0) {
        cameraStats.value.online_rate = cameraStats.value.online_cameras / cameraStats.value.total_cameras
      }
    }
  }

  /**
   * 添加新的告警记录
   * @param {Object} alarm - 告警信息
   */
  const addNewAlarm = (alarm) => {
    // 添加到最新告警列表前面
    latestAlarms.value.unshift(alarm)
    
    // 保持最新告警列表最多10条
    if (latestAlarms.value.length > 10) {
      latestAlarms.value = latestAlarms.value.slice(0, 10)
    }
    
    // 更新统计
    alarmStats.value.today_total++
    alarmStats.value.unprocessed++
    
    // 更新告警分类排名
    const existingType = alarmRanking.value.find(item => item.type === alarm.type)
    if (existingType) {
      existingType.count++
    } else {
      alarmRanking.value.push({
        type: alarm.type,
        count: 1,
        percentage: 0
      })
    }
    
    // 重新计算百分比
    const total = alarmRanking.value.reduce((sum, item) => sum + item.count, 0)
    alarmRanking.value.forEach(item => {
      item.percentage = total > 0 ? item.count / total : 0
    })
    
    // 按数量排序
    alarmRanking.value.sort((a, b) => b.count - a.count)
  }

  /**
   * 处理告警
   * @param {number} alarmId - 告警ID
   */
  const processAlarm = (alarmId) => {
    // 从最新告警列表中找到对应告警并更新状态
    const alarm = latestAlarms.value.find(item => item.id === alarmId)
    if (alarm) {
      alarm.status = '已处理'
    }
    
    // 更新统计
    if (alarmStats.value.unprocessed > 0) {
      alarmStats.value.unprocessed--
      alarmStats.value.processed++
    }
  }

  /**
   * 重置数据
   */
  const resetData = () => {
    cameraStats.value = {
      total_cameras: 0,
      online_cameras: 0,
      offline_cameras: 0,
      online_rate: 0
    }
    alarmStats.value = {
      week_total: 0,
      today_total: 0,
      unprocessed: 0,
      processed: 0
    }
    alarmRanking.value = []
    latestAlarms.value = []
    cameraPoints.value = []
    selectedCamera.value = null
    liveStream.value = null
    lastUpdate.value = null
  }

  /**
   * 定时刷新数据
   * @param {number} interval - 刷新间隔（毫秒）
   */
  const startAutoRefresh = (interval = 30000) => {
    return setInterval(() => {
      fetchOverview()
    }, interval)
  }

  return {
    // State
    cameraStats,
    alarmStats,
    alarmRanking,
    latestAlarms,
    mapConfig,
    cameraPoints,
    selectedCamera,
    liveStream,
    loading,
    lastUpdate,
    
    // Getters
    totalCameras,
    onlineCameras,
    offlineCameras,
    onlineRate,
    todayAlarms,
    unprocessedAlarms,
    hasNewAlarms,
    topAlarmType,
    
    // Actions
    fetchOverview,
    fetchCadMap,
    fetchCameraLive,
    selectCamera,
    closeLiveStream,
    updateCameraStatus,
    addNewAlarm,
    processAlarm,
    resetData,
    startAutoRefresh
  }
})