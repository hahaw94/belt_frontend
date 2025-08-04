import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { deviceAPI } from '@/api/device'

/**
 * 设备管理Store
 * 功能：设备列表管理、设备添加/编辑/删除、设备同步、协议配置、智能分析板卡绑定
 */
export const useDeviceStore = defineStore('device', () => {
  // State
  const devices = ref([])
  const currentDevice = ref(null)
  const loading = ref(false)
  const pagination = ref({
    page: 1,
    page_size: 10,
    total: 0
  })
  const filters = ref({
    device_name: '',
    device_sn: '',
    device_type: '',
    status: ''
  })
  const syncProgress = ref({
    isRunning: false,
    progress: 0,
    message: ''
  })
  const selectedDevices = ref([])

  // Getters
  const onlineDevices = computed(() => 
    devices.value.filter(device => device.status === '在线')
  )
  
  const offlineDevices = computed(() => 
    devices.value.filter(device => device.status === '离线')
  )
  
  const deviceTypes = computed(() => {
    const types = new Set(devices.value.map(device => device.device_type))
    return Array.from(types)
  })
  
  const totalDevices = computed(() => devices.value.length)
  const onlineCount = computed(() => onlineDevices.value.length)
  const offlineCount = computed(() => offlineDevices.value.length)
  const onlineRate = computed(() => 
    totalDevices.value > 0 ? (onlineCount.value / totalDevices.value * 100).toFixed(1) : 0
  )

  // Actions
  /**
   * 获取设备列表
   * @param {Object} params - 查询参数
   */
  const fetchDevices = async (params = {}) => {
    loading.value = true
    try {
      const queryParams = {
        page: pagination.value.page,
        page_size: pagination.value.page_size,
        ...filters.value,
        ...params
      }
      
      const response = await deviceAPI.getDevices(queryParams)
      if (response.success) {
        devices.value = response.body.devices
        pagination.value.total = response.body.total
        pagination.value.page = response.body.page
        pagination.value.page_size = response.body.page_size
        return response
      }
      throw new Error(response.message)
    } catch (error) {
      console.error('获取设备列表失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  /**
   * 添加设备
   * @param {Object} deviceData - 设备数据
   */
  const addDevice = async (deviceData) => {
    try {
      const response = await deviceAPI.addDevice(deviceData)
      if (response.success) {
        // 重新获取设备列表
        await fetchDevices()
        return response
      }
      throw new Error(response.message)
    } catch (error) {
      console.error('添加设备失败:', error)
      throw error
    }
  }

  /**
   * 批量添加设备
   * @param {File} file - Excel文件
   */
  const batchAddDevices = async (file) => {
    try {
      const response = await deviceAPI.batchAddDevices(file)
      if (response.success) {
        // 重新获取设备列表
        await fetchDevices()
        return response
      }
      throw new Error(response.message)
    } catch (error) {
      console.error('批量添加设备失败:', error)
      throw error
    }
  }

  /**
   * 平台设备同步
   * @param {Object} syncConfig - 同步配置
   */
  const syncDevices = async (syncConfig) => {
    syncProgress.value.isRunning = true
    syncProgress.value.progress = 0
    syncProgress.value.message = '开始设备发现...'
    
    try {
      const response = await deviceAPI.syncDevices(syncConfig)
      if (response.success) {
        syncProgress.value.progress = 100
        syncProgress.value.message = `发现并同步了 ${response.body.sync_count} 个设备`
        
        // 重新获取设备列表
        await fetchDevices()
        return response
      }
      throw new Error(response.message)
    } catch (error) {
      console.error('设备同步失败:', error)
      syncProgress.value.message = '同步失败: ' + error.message
      throw error
    } finally {
      syncProgress.value.isRunning = false
    }
  }

  /**
   * 更新设备信息
   * @param {number} deviceId - 设备ID
   * @param {Object} deviceData - 设备数据
   */
  const updateDevice = async (deviceId, deviceData) => {
    try {
      const response = await deviceAPI.updateDevice(deviceId, deviceData)
      if (response.success) {
        // 更新本地设备列表
        const index = devices.value.findIndex(device => device.id === deviceId)
        if (index !== -1) {
          devices.value[index] = { ...devices.value[index], ...deviceData }
        }
        return response
      }
      throw new Error(response.message)
    } catch (error) {
      console.error('更新设备失败:', error)
      throw error
    }
  }

  /**
   * 删除设备
   * @param {number} deviceId - 设备ID
   */
  const deleteDevice = async (deviceId) => {
    try {
      const response = await deviceAPI.deleteDevice(deviceId)
      if (response.success) {
        // 从本地列表移除
        devices.value = devices.value.filter(device => device.id !== deviceId)
        pagination.value.total--
        return response
      }
      throw new Error(response.message)
    } catch (error) {
      console.error('删除设备失败:', error)
      throw error
    }
  }

  /**
   * 配置设备接入协议
   * @param {number} deviceId - 设备ID
   * @param {Object} protocolConfig - 协议配置
   */
  const configureProtocol = async (deviceId, protocolConfig) => {
    try {
      const response = await deviceAPI.configureProtocol(deviceId, protocolConfig)
      if (response.success) {
        // 更新设备协议信息
        const device = devices.value.find(d => d.id === deviceId)
        if (device) {
          device.protocol_config = protocolConfig
        }
        return response
      }
      throw new Error(response.message)
    } catch (error) {
      console.error('配置协议失败:', error)
      throw error
    }
  }

  /**
   * 绑定智能分析板卡
   * @param {Object} bindingData - 绑定数据
   */
  const bindAnalysisCard = async (bindingData) => {
    try {
      const response = await deviceAPI.bindAnalysisCard(bindingData)
      if (response.success) {
        // 更新相关设备信息
        const camera = devices.value.find(d => d.id === bindingData.camera_id)
        const analysisCard = devices.value.find(d => d.id === bindingData.analysis_card_id)
        
        if (camera) {
          camera.analysis_card_id = bindingData.analysis_card_id
          camera.algorithm_config = bindingData.algorithm_config
        }
        
        if (analysisCard) {
          if (!analysisCard.bound_cameras) {
            analysisCard.bound_cameras = []
          }
          analysisCard.bound_cameras.push({
            camera_id: bindingData.camera_id,
            channel: bindingData.channel
          })
        }
        
        return response
      }
      throw new Error(response.message)
    } catch (error) {
      console.error('绑定智能分析板卡失败:', error)
      throw error
    }
  }

  /**
   * 切换设备状态
   * @param {number} deviceId - 设备ID
   * @param {string} status - 新状态
   */
  const toggleDeviceStatus = async (deviceId, status) => {
    try {
      const response = await deviceAPI.toggleStatus(deviceId, { status })
      if (response.success) {
        // 更新本地设备状态
        const device = devices.value.find(d => d.id === deviceId)
        if (device) {
          device.status = status
        }
        return response
      }
      throw new Error(response.message)
    } catch (error) {
      console.error('切换设备状态失败:', error)
      throw error
    }
  }

  /**
   * 导出设备列表
   */
  const exportDevices = async () => {
    try {
      const response = await deviceAPI.exportDevices()
      if (response.success) {
        return response
      }
      throw new Error(response.message)
    } catch (error) {
      console.error('导出设备列表失败:', error)
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
      device_name: '',
      device_sn: '',
      device_type: '',
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
   * 选择设备
   * @param {Array} deviceIds - 设备ID数组
   */
  const selectDevices = (deviceIds) => {
    selectedDevices.value = deviceIds
  }

  /**
   * 批量删除设备
   */
  const batchDeleteDevices = async () => {
    try {
      const promises = selectedDevices.value.map(deviceId => deleteDevice(deviceId))
      await Promise.all(promises)
      selectedDevices.value = []
      return { success: true, message: '批量删除成功' }
    } catch (error) {
      console.error('批量删除失败:', error)
      throw error
    }
  }

  /**
   * 批量修改设备状态
   * @param {string} status - 新状态
   */
  const batchUpdateStatus = async (status) => {
    try {
      const promises = selectedDevices.value.map(deviceId => 
        toggleDeviceStatus(deviceId, status)
      )
      await Promise.all(promises)
      selectedDevices.value = []
      return { success: true, message: '批量修改状态成功' }
    } catch (error) {
      console.error('批量修改状态失败:', error)
      throw error
    }
  }

  /**
   * 获取设备详情
   * @param {number} deviceId - 设备ID
   */
  const getDeviceDetail = (deviceId) => {
    return devices.value.find(device => device.id === deviceId)
  }

  /**
   * 设置当前设备
   * @param {Object} device - 设备对象
   */
  const setCurrentDevice = (device) => {
    currentDevice.value = device
  }

  /**
   * 重置状态
   */
  const resetState = () => {
    devices.value = []
    currentDevice.value = null
    selectedDevices.value = []
    pagination.value = {
      page: 1,
      page_size: 10,
      total: 0
    }
    clearFilters()
  }

  return {
    // State
    devices,
    currentDevice,
    loading,
    pagination,
    filters,
    syncProgress,
    selectedDevices,
    
    // Getters
    onlineDevices,
    offlineDevices,
    deviceTypes,
    totalDevices,
    onlineCount,
    offlineCount,
    onlineRate,
    
    // Actions
    fetchDevices,
    addDevice,
    batchAddDevices,
    syncDevices,
    updateDevice,
    deleteDevice,
    configureProtocol,
    bindAnalysisCard,
    toggleDeviceStatus,
    exportDevices,
    setFilters,
    clearFilters,
    setPagination,
    selectDevices,
    batchDeleteDevices,
    batchUpdateStatus,
    getDeviceDetail,
    setCurrentDevice,
    resetState
  }
})