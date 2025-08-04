import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { eventAPI } from '@/api/event'

/**
 * 事件中心与报警Store
 * 功能：报警管理、负样本标记、即时告警、联动设置、数据收集、预警推送
 */
export const useEventStore = defineStore('event', () => {
  // State
  const alarms = ref([])
  const currentAlarm = ref(null)
  const loading = ref(false)
  const pagination = ref({
    page: 1,
    page_size: 10,
    total: 0
  })
  const filters = ref({
    start_time: '',
    end_time: '',
    alarm_type: '',
    location_id: null,
    status: ''
  })
  const locations = ref([])
  const instantAlertConfig = ref({
    alert_types: [],
    notification_methods: [],
    location_filter: [],
    time_filter: {
      start_time: '00:00:00',
      end_time: '23:59:59',
      weekdays: [1, 2, 3, 4, 5, 6, 7]
    }
  })
  const linkageSettings = ref([])
  const emergencyPlans = ref([])
  const pushConfig = ref({
    push_channels: []
  })
  const realTimeAlerts = ref([])
  const negativeSamples = ref([])
  const dataCollectionStats = ref({})

  // Getters
  const unprocessedAlarms = computed(() => 
    alarms.value.filter(alarm => alarm.status === '未处理')
  )
  
  const processedAlarms = computed(() => 
    alarms.value.filter(alarm => alarm.status === '已处理')
  )
  
  const todayAlarms = computed(() => {
    const today = new Date().toISOString().split('T')[0]
    return alarms.value.filter(alarm => 
      alarm.time.startsWith(today)
    )
  })
  
  const alarmsByType = computed(() => {
    const typeMap = {}
    alarms.value.forEach(alarm => {
      if (!typeMap[alarm.type]) {
        typeMap[alarm.type] = []
      }
      typeMap[alarm.type].push(alarm)
    })
    return typeMap
  })
  
  const alarmsByLocation = computed(() => {
    const locationMap = {}
    alarms.value.forEach(alarm => {
      if (!locationMap[alarm.location]) {
        locationMap[alarm.location] = []
      }
      locationMap[alarm.location].push(alarm)
    })
    return locationMap
  })
  
  const highConfidenceAlarms = computed(() => 
    alarms.value.filter(alarm => alarm.confidence >= 0.8)
  )
  
  const totalUnprocessed = computed(() => unprocessedAlarms.value.length)
  const totalProcessed = computed(() => processedAlarms.value.length)

  // Actions
  /**
   * 获取报警列表
   * @param {Object} params - 查询参数
   */
  const fetchAlarms = async (params = {}) => {
    loading.value = true
    try {
      const queryParams = {
        page: pagination.value.page,
        page_size: pagination.value.page_size,
        ...filters.value,
        ...params
      }
      
      const response = await eventAPI.getAlarms(queryParams)
      if (response.success) {
        alarms.value = response.body.alarms
        pagination.value.total = response.body.total
        pagination.value.page = response.body.page
        pagination.value.page_size = response.body.page_size
        return response
      }
      throw new Error(response.message)
    } catch (error) {
      console.error('获取报警列表失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  /**
   * 获取报警详情
   * @param {number} alarmId - 报警ID
   */
  const fetchAlarmDetail = async (alarmId) => {
    try {
      const response = await eventAPI.getAlarmDetail(alarmId)
      if (response.success) {
        currentAlarm.value = response.body
        return response
      }
      throw new Error(response.message)
    } catch (error) {
      console.error('获取报警详情失败:', error)
      throw error
    }
  }

  /**
   * 处理报警事件
   * @param {number} alarmId - 报警ID
   * @param {Object} processData - 处理数据
   */
  const processAlarm = async (alarmId, processData) => {
    try {
      const response = await eventAPI.processAlarm(alarmId, processData)
      if (response.success) {
        // 更新本地报警状态
        const alarm = alarms.value.find(a => a.id === alarmId)
        if (alarm) {
          alarm.status = '已处理'
          alarm.process_time = new Date().toISOString()
          alarm.process_note = processData.process_note
        }
        
        return response
      }
      throw new Error(response.message)
    } catch (error) {
      console.error('处理报警失败:', error)
      throw error
    }
  }

  /**
   * 标记报警为负样本
   * @param {number} alarmId - 报警ID
   * @param {Object} markData - 标记数据
   */
  const markAsNegativeSample = async (alarmId, markData) => {
    try {
      const response = await eventAPI.markNegativeSample(alarmId, markData)
      if (response.success) {
        // 添加到负样本列表
        const alarm = alarms.value.find(a => a.id === alarmId)
        if (alarm) {
          negativeSamples.value.push({
            ...alarm,
            mark_reason: markData.reason,
            mark_time: new Date().toISOString(),
            upload_to_training: markData.upload_to_training
          })
          
          // 更新报警状态
          alarm.is_negative_sample = true
          alarm.negative_reason = markData.reason
        }
        
        return response
      }
      throw new Error(response.message)
    } catch (error) {
      console.error('标记负样本失败:', error)
      throw error
    }
  }

  /**
   * 导出样本数据
   * @param {Object} exportData - 导出参数
   */
  const exportSamples = async (exportData) => {
    try {
      const response = await eventAPI.exportSamples(exportData)
      if (response.success) {
        return response
      }
      throw new Error(response.message)
    } catch (error) {
      console.error('导出样本失败:', error)
      throw error
    }
  }

  /**
   * 获取监控点位列表
   */
  const fetchLocations = async () => {
    try {
      const response = await eventAPI.getLocations()
      if (response.success) {
        locations.value = response.body.locations
        return response
      }
      throw new Error(response.message)
    } catch (error) {
      console.error('获取点位列表失败:', error)
      throw error
    }
  }

  /**
   * 配置即时告警接收
   * @param {Object} configData - 配置数据
   */
  const configureInstantAlert = async (configData) => {
    try {
      const response = await eventAPI.configureInstantAlert(configData)
      if (response.success) {
        instantAlertConfig.value = configData
        return response
      }
      throw new Error(response.message)
    } catch (error) {
      console.error('配置即时告警失败:', error)
      throw error
    }
  }

  /**
   * 添加实时告警
   * @param {Object} alertData - 告警数据
   */
  const addRealTimeAlert = (alertData) => {
    realTimeAlerts.value.unshift({
      ...alertData,
      id: alertData.alarm_id || Date.now(),
      received_time: new Date().toISOString(),
      read: false
    })
    
    // 保持实时告警列表最多50条
    if (realTimeAlerts.value.length > 50) {
      realTimeAlerts.value = realTimeAlerts.value.slice(0, 50)
    }
  }

  /**
   * 标记告警为已读
   * @param {number} alertId - 告警ID
   */
  const markAlertAsRead = (alertId) => {
    const alert = realTimeAlerts.value.find(a => a.id === alertId)
    if (alert) {
      alert.read = true
    }
  }

  /**
   * 批量标记告警为已读
   */
  const markAllAlertsAsRead = () => {
    realTimeAlerts.value.forEach(alert => {
      alert.read = true
    })
  }

  /**
   * 配置告警联动规则
   * @param {Object} linkageData - 联动规则数据
   */
  const configureLinkage = async (linkageData) => {
    try {
      const response = await eventAPI.configureLinkage(linkageData)
      if (response.success) {
        // 添加或更新联动设置
        const existingIndex = linkageSettings.value.findIndex(
          setting => setting.rule_name === linkageData.rule_name
        )
        
        if (existingIndex !== -1) {
          linkageSettings.value[existingIndex] = linkageData
        } else {
          linkageSettings.value.push({
            ...linkageData,
            id: Date.now(),
            created_time: new Date().toISOString()
          })
        }
        
        return response
      }
      throw new Error(response.message)
    } catch (error) {
      console.error('配置联动规则失败:', error)
      throw error
    }
  }

  /**
   * 管理联动预案
   * @param {Object} planData - 预案数据
   */
  const manageEmergencyPlan = async (planData) => {
    try {
      const response = await eventAPI.manageEmergencyPlan(planData)
      if (response.success) {
        // 添加或更新应急预案
        const existingIndex = emergencyPlans.value.findIndex(
          plan => plan.plan_name === planData.plan_name
        )
        
        if (existingIndex !== -1) {
          emergencyPlans.value[existingIndex] = planData
        } else {
          emergencyPlans.value.push({
            ...planData,
            id: Date.now(),
            created_time: new Date().toISOString()
          })
        }
        
        return response
      }
      throw new Error(response.message)
    } catch (error) {
      console.error('管理应急预案失败:', error)
      throw error
    }
  }

  /**
   * 配置预警推送渠道
   * @param {Object} configData - 推送配置数据
   */
  const configurePushChannels = async (configData) => {
    try {
      const response = await eventAPI.configurePushChannels(configData)
      if (response.success) {
        pushConfig.value = configData
        return response
      }
      throw new Error(response.message)
    } catch (error) {
      console.error('配置推送渠道失败:', error)
      throw error
    }
  }

  /**
   * 获取数据采集统计
   */
  const fetchDataCollectionStats = async () => {
    try {
      const response = await eventAPI.getDataCollectionStats()
      if (response.success) {
        dataCollectionStats.value = response.body
        return response
      }
      throw new Error(response.message)
    } catch (error) {
      console.error('获取数据采集统计失败:', error)
      throw error
    }
  }

  /**
   * 发送即时指令
   * @param {Object} commandData - 指令数据
   */
  const sendImmediateCommand = async (commandData) => {
    try {
      const response = await eventAPI.sendImmediateCommand(commandData)
      if (response.success) {
        return response
      }
      throw new Error(response.message)
    } catch (error) {
      console.error('发送即时指令失败:', error)
      throw error
    }
  }

  /**
   * 设置筛选条件
   * @param {Object} newFilters - 新的筛选条件
   */
  const setFilters = (newFilters) => {
    filters.value = { ...filters.value, ...newFilters }
    pagination.value.page = 1 // 重置到第一页
  }

  /**
   * 清空筛选条件
   */
  const clearFilters = () => {
    filters.value = {
      start_time: '',
      end_time: '',
      alarm_type: '',
      location_id: null,
      status: ''
    }
    pagination.value.page = 1
  }

  /**
   * 设置分页
   * @param {Object} pageInfo - 分页信息
   */
  const setPagination = (pageInfo) => {
    pagination.value = { ...pagination.value, ...pageInfo }
  }

  /**
   * 批量处理报警
   * @param {Array} alarmIds - 报警ID数组
   * @param {Object} processData - 处理数据
   */
  const batchProcessAlarms = async (alarmIds, processData) => {
    try {
      const promises = alarmIds.map(id => processAlarm(id, processData))
      await Promise.all(promises)
      return { success: true, message: '批量处理成功' }
    } catch (error) {
      console.error('批量处理报警失败:', error)
      throw error
    }
  }

  /**
   * 批量标记负样本
   * @param {Array} alarmIds - 报警ID数组
   * @param {Object} markData - 标记数据
   */
  const batchMarkNegative = async (alarmIds, markData) => {
    try {
      const promises = alarmIds.map(id => markAsNegativeSample(id, markData))
      await Promise.all(promises)
      return { success: true, message: '批量标记成功' }
    } catch (error) {
      console.error('批量标记负样本失败:', error)
      throw error
    }
  }

  /**
   * 搜索报警
   * @param {Object} searchParams - 搜索参数
   */
  const searchAlarms = async (searchParams) => {
    setFilters(searchParams)
    await fetchAlarms()
  }

  /**
   * 获取未读告警数量
   */
  const getUnreadAlertCount = computed(() => 
    realTimeAlerts.value.filter(alert => !alert.read).length
  )

  /**
   * 清空实时告警
   */
  const clearRealTimeAlerts = () => {
    realTimeAlerts.value = []
  }

  /**
   * 删除联动规则
   * @param {number} ruleId - 规则ID
   */
  const deleteLinkageRule = (ruleId) => {
    linkageSettings.value = linkageSettings.value.filter(rule => rule.id !== ruleId)
  }

  /**
   * 删除应急预案
   * @param {number} planId - 预案ID
   */
  const deleteEmergencyPlan = (planId) => {
    emergencyPlans.value = emergencyPlans.value.filter(plan => plan.id !== planId)
  }

  /**
   * 重置状态
   */
  const resetState = () => {
    alarms.value = []
    currentAlarm.value = null
    realTimeAlerts.value = []
    negativeSamples.value = []
    linkageSettings.value = []
    emergencyPlans.value = []
    locations.value = []
    pagination.value = {
      page: 1,
      page_size: 10,
      total: 0
    }
    clearFilters()
    instantAlertConfig.value = {
      alert_types: [],
      notification_methods: [],
      location_filter: [],
      time_filter: {
        start_time: '00:00:00',
        end_time: '23:59:59',
        weekdays: [1, 2, 3, 4, 5, 6, 7]
      }
    }
    pushConfig.value = {
      push_channels: []
    }
    dataCollectionStats.value = {}
  }

  return {
    // State
    alarms,
    currentAlarm,
    loading,
    pagination,
    filters,
    locations,
    instantAlertConfig,
    linkageSettings,
    emergencyPlans,
    pushConfig,
    realTimeAlerts,
    negativeSamples,
    dataCollectionStats,
    
    // Getters
    unprocessedAlarms,
    processedAlarms,
    todayAlarms,
    alarmsByType,
    alarmsByLocation,
    highConfidenceAlarms,
    totalUnprocessed,
    totalProcessed,
    getUnreadAlertCount,
    
    // Actions
    fetchAlarms,
    fetchAlarmDetail,
    processAlarm,
    markAsNegativeSample,
    exportSamples,
    fetchLocations,
    configureInstantAlert,
    addRealTimeAlert,
    markAlertAsRead,
    markAllAlertsAsRead,
    configureLinkage,
    manageEmergencyPlan,
    configurePushChannels,
    fetchDataCollectionStats,
    sendImmediateCommand,
    setFilters,
    clearFilters,
    setPagination,
    batchProcessAlarms,
    batchMarkNegative,
    searchAlarms,
    clearRealTimeAlerts,
    deleteLinkageRule,
    deleteEmergencyPlan,
    resetState
  }
})