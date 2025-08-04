import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { detectionAPI } from '@/api/detection'

/**
 * 实时检测Store
 * 功能：视频流管理、多分屏显示、预警信息、云镜控制
 */
export const useDetectionStore = defineStore('detection', () => {
  // State
  const videoStreams = ref([])
  const currentLayout = ref(4) // 4分屏、9分屏、16分屏
  const selectedDevices = ref([])
  const warnings = ref([])
  const loading = ref(false)
  const streamStatus = ref({}) // 记录每个流的状态
  const ptzControl = ref({
    isControlling: false,
    deviceId: null,
    command: null
  })
  const detectionSettings = ref({
    showTrackingBox: true,
    showConfidence: true,
    autoSwitchOnAlert: true,
    alertThreshold: 0.8
  })

  // Getters
  const activeStreams = computed(() => 
    videoStreams.value.filter(stream => stream.status === '在线')
  )
  
  const offlineStreams = computed(() => 
    videoStreams.value.filter(stream => stream.status === '离线')
  )
  
  const currentWarnings = computed(() => 
    warnings.value.filter(warning => !warning.processed)
  )
  
  const highPriorityWarnings = computed(() => 
    currentWarnings.value.filter(warning => warning.confidence >= detectionSettings.value.alertThreshold)
  )
  
  const availableLayouts = computed(() => [
    { value: 1, label: '单屏', grid: '1x1' },
    { value: 4, label: '四分屏', grid: '2x2' },
    { value: 9, label: '九分屏', grid: '3x3' },
    { value: 16, label: '十六分屏', grid: '4x4' }
  ])

  // Actions
  /**
   * 获取单路视频流
   * @param {number} deviceId - 设备ID
   */
  const fetchVideoStream = async (deviceId) => {
    try {
      const response = await detectionAPI.getVideoStream(deviceId)
      if (response.success) {
        const streamData = response.body
        
        // 更新或添加视频流
        const existingIndex = videoStreams.value.findIndex(stream => stream.device_id === deviceId)
        if (existingIndex !== -1) {
          videoStreams.value[existingIndex] = {
            ...videoStreams.value[existingIndex],
            ...streamData
          }
        } else {
          videoStreams.value.push({
            device_id: deviceId,
            position: videoStreams.value.length + 1,
            ...streamData
          })
        }
        
        return response
      }
      throw new Error(response.message)
    } catch (error) {
      console.error('获取视频流失败:', error)
      throw error
    }
  }

  /**
   * 获取多路视频流
   * @param {Array} deviceIds - 设备ID数组
   * @param {number} layout - 布局模式
   */
  const fetchMultiStreams = async (deviceIds, layout = currentLayout.value) => {
    loading.value = true
    try {
      const response = await detectionAPI.getMultiStreams({
        device_ids: deviceIds.join(','),
        layout: layout
      })
      
      if (response.success) {
        videoStreams.value = response.body.streams.map((stream, index) => ({
          ...stream,
          position: index + 1
        }))
        currentLayout.value = response.body.layout
        selectedDevices.value = deviceIds
        
        // 初始化流状态
        deviceIds.forEach(deviceId => {
          streamStatus.value[deviceId] = 'loading'
        })
        
        return response
      }
      throw new Error(response.message)
    } catch (error) {
      console.error('获取多路视频流失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  /**
   * 切换布局模式
   * @param {number} layout - 新的布局模式
   */
  const switchLayout = async (layout) => {
    if (selectedDevices.value.length === 0) {
      throw new Error('请先选择要显示的设备')
    }
    
    // 根据布局调整显示的设备数量
    const maxDevices = layout
    const devicesToShow = selectedDevices.value.slice(0, maxDevices)
    
    await fetchMultiStreams(devicesToShow, layout)
  }

  /**
   * 添加设备到显示列表
   * @param {number} deviceId - 设备ID
   */
  const addDeviceToDisplay = async (deviceId) => {
    if (selectedDevices.value.includes(deviceId)) {
      return // 已经在显示列表中
    }
    
    if (selectedDevices.value.length >= currentLayout.value) {
      throw new Error(`当前布局最多支持 ${currentLayout.value} 路视频`)
    }
    
    const newDevices = [...selectedDevices.value, deviceId]
    await fetchMultiStreams(newDevices, currentLayout.value)
  }

  /**
   * 从显示列表移除设备
   * @param {number} deviceId - 设备ID
   */
  const removeDeviceFromDisplay = (deviceId) => {
    selectedDevices.value = selectedDevices.value.filter(id => id !== deviceId)
    videoStreams.value = videoStreams.value.filter(stream => stream.device_id !== deviceId)
    delete streamStatus.value[deviceId]
    
    // 重新排列位置
    videoStreams.value.forEach((stream, index) => {
      stream.position = index + 1
    })
  }

  /**
   * 获取实时预警信息
   */
  const fetchWarnings = async () => {
    try {
      const response = await detectionAPI.getWarnings()
      if (response.success) {
        // 合并新的告警，避免重复
        const newWarnings = response.body.warnings.filter(newWarning => 
          !warnings.value.find(existing => existing.id === newWarning.id)
        )
        
        warnings.value = [...newWarnings, ...warnings.value]
        
        // 保持告警列表最多100条
        if (warnings.value.length > 100) {
          warnings.value = warnings.value.slice(0, 100)
        }
        
        return response
      }
      throw new Error(response.message)
    } catch (error) {
      console.error('获取预警信息失败:', error)
      throw error
    }
  }

  /**
   * 处理新的告警信息
   * @param {Object} warning - 告警数据
   */
  const addWarning = (warning) => {
    // 添加到告警列表前面
    warnings.value.unshift({
      ...warning,
      id: warning.id || Date.now(),
      timestamp: warning.timestamp || new Date().toISOString(),
      processed: false
    })
    
    // 如果启用了自动切换，切换到告警设备
    if (detectionSettings.value.autoSwitchOnAlert && warning.confidence >= detectionSettings.value.alertThreshold) {
      if (!selectedDevices.value.includes(warning.device_id)) {
        addDeviceToDisplay(warning.device_id).catch(console.error)
      }
    }
  }

  /**
   * 处理告警
   * @param {number} warningId - 告警ID
   */
  const processWarning = (warningId) => {
    const warning = warnings.value.find(w => w.id === warningId)
    if (warning) {
      warning.processed = true
      warning.processTime = new Date().toISOString()
    }
  }

  /**
   * 云镜控制
   * @param {number} deviceId - 设备ID
   * @param {Object} controlData - 控制参数
   */
  const controlPTZ = async (deviceId, controlData) => {
    ptzControl.value.isControlling = true
    ptzControl.value.deviceId = deviceId
    ptzControl.value.command = controlData.command
    
    try {
      const response = await detectionAPI.controlPTZ(deviceId, controlData)
      if (response.success) {
        return response
      }
      throw new Error(response.message)
    } catch (error) {
      console.error('云镜控制失败:', error)
      throw error
    } finally {
      ptzControl.value.isControlling = false
      ptzControl.value.deviceId = null
      ptzControl.value.command = null
    }
  }

  /**
   * 更新流状态
   * @param {number} deviceId - 设备ID
   * @param {string} status - 状态
   */
  const updateStreamStatus = (deviceId, status) => {
    streamStatus.value[deviceId] = status
    
    // 同时更新视频流对象的状态
    const stream = videoStreams.value.find(s => s.device_id === deviceId)
    if (stream) {
      stream.status = status
    }
  }

  /**
   * 设置检测参数
   * @param {Object} settings - 设置参数
   */
  const updateDetectionSettings = (settings) => {
    detectionSettings.value = { ...detectionSettings.value, ...settings }
  }

  /**
   * 全屏显示指定设备
   * @param {number} deviceId - 设备ID
   */
  const fullscreenDevice = async (deviceId) => {
    await fetchMultiStreams([deviceId], 1)
  }

  /**
   * 交换设备位置
   * @param {number} fromPosition - 源位置
   * @param {number} toPosition - 目标位置
   */
  const swapDevicePositions = (fromPosition, toPosition) => {
    const fromStream = videoStreams.value.find(s => s.position === fromPosition)
    const toStream = videoStreams.value.find(s => s.position === toPosition)
    
    if (fromStream && toStream) {
      fromStream.position = toPosition
      toStream.position = fromPosition
      
      // 重新排序
      videoStreams.value.sort((a, b) => a.position - b.position)
    }
  }

  /**
   * 清空所有视频流
   */
  const clearAllStreams = () => {
    videoStreams.value = []
    selectedDevices.value = []
    streamStatus.value = {}
  }

  /**
   * 开始自动刷新告警
   * @param {number} interval - 刷新间隔（毫秒）
   */
  const startWarningRefresh = (interval = 5000) => {
    return setInterval(() => {
      fetchWarnings()
    }, interval)
  }

  /**
   * 获取设备的当前告警数
   * @param {number} deviceId - 设备ID
   */
  const getDeviceWarningCount = (deviceId) => {
    return currentWarnings.value.filter(w => w.device_id === deviceId).length
  }

  /**
   * 批量处理告警
   * @param {Array} warningIds - 告警ID数组
   */
  const batchProcessWarnings = (warningIds) => {
    warningIds.forEach(id => processWarning(id))
  }

  /**
   * 清空历史告警
   */
  const clearHistoryWarnings = () => {
    warnings.value = warnings.value.filter(w => !w.processed)
  }

  /**
   * 重置状态
   */
  const resetState = () => {
    clearAllStreams()
    warnings.value = []
    ptzControl.value = {
      isControlling: false,
      deviceId: null,
      command: null
    }
    detectionSettings.value = {
      showTrackingBox: true,
      showConfidence: true,
      autoSwitchOnAlert: true,
      alertThreshold: 0.8
    }
  }

  return {
    // State
    videoStreams,
    currentLayout,
    selectedDevices,
    warnings,
    loading,
    streamStatus,
    ptzControl,
    detectionSettings,
    
    // Getters
    activeStreams,
    offlineStreams,
    currentWarnings,
    highPriorityWarnings,
    availableLayouts,
    
    // Actions
    fetchVideoStream,
    fetchMultiStreams,
    switchLayout,
    addDeviceToDisplay,
    removeDeviceFromDisplay,
    fetchWarnings,
    addWarning,
    processWarning,
    controlPTZ,
    updateStreamStatus,
    updateDetectionSettings,
    fullscreenDevice,
    swapDevicePositions,
    clearAllStreams,
    startWarningRefresh,
    getDeviceWarningCount,
    batchProcessWarnings,
    clearHistoryWarnings,
    resetState
  }
})