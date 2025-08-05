import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { recordingApi } from '@/api/recording'

/**
 * 录像管理Store
 * 功能：录像列表管理、播放、下载、删除、统计分析
 */
export const useRecordingStore = defineStore('recording', () => {
  // State
  const recordings = ref([])
  const currentRecording = ref(null)
  const loading = ref(false)
  const pagination = ref({
    page: 1,
    page_size: 10,
    total: 0
  })
  const filters = ref({
    device_id: null,
    start_time: '',
    end_time: '',
    alarm_type: ''
  })
  const statistics = ref({
    total_recordings: 0,
    total_size: '',
    available_space: '',
    retention_days: 180,
    auto_cleanup: true,
    daily_average: ''
  })
  const playingRecordings = ref(new Map()) // 记录正在播放的录像
  const downloadProgress = ref(new Map()) // 记录下载进度
  const uploadProgress = ref(new Map()) // 记录上传进度
  const uploadQueue = ref([]) // 上传队列

  // Getters
  const totalRecordings = computed(() => recordings.value.length)
  const todayRecordings = computed(() => {
    const today = new Date().toISOString().split('T')[0]
    return recordings.value.filter(recording => 
      recording.create_time.startsWith(today)
    )
  })
  
  const recordingsByDevice = computed(() => {
    const deviceMap = {}
    recordings.value.forEach(recording => {
      const deviceId = recording.device_id
      if (!deviceMap[deviceId]) {
        deviceMap[deviceId] = []
      }
      deviceMap[deviceId].push(recording)
    })
    return deviceMap
  })
  
  const recordingsByAlarmType = computed(() => {
    const typeMap = {}
    recordings.value.forEach(recording => {
      const type = recording.alarm_type
      if (!typeMap[type]) {
        typeMap[type] = []
      }
      typeMap[type].push(recording)
    })
    return typeMap
  })
  
  const totalSize = computed(() => statistics.value.total_size)
  const availableSpace = computed(() => statistics.value.available_space)
  const retentionDays = computed(() => statistics.value.retention_days)

  // Actions
  /**
   * 获取录像列表
   * @param {Object} params - 查询参数
   */
  const fetchRecordings = async (params = {}) => {
    loading.value = true
    try {
      const queryParams = {
        page: pagination.value.page,
        page_size: pagination.value.page_size,
        ...filters.value,
        ...params
      }
      
      const response = await recordingApi.getRecordingList(queryParams)
      if (response.success) {
        recordings.value = response.body.data
        pagination.value.total = response.body.total
        pagination.value.page = response.body.page
        pagination.value.page_size = response.body.page_size
        return response
      }
      throw new Error(response.message)
    } catch (error) {
      console.error('获取录像列表失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  /**
   * 播放录像
   * @param {number} recordingId - 录像ID
   */
  const playRecording = async (recordingId) => {
    try {
      const response = await recordingApi.getPlayUrl(recordingId)
      if (response.success) {
        const playData = response.body
        
        // 记录播放信息
        playingRecordings.value.set(recordingId, {
          ...playData,
          startTime: new Date(),
          isPlaying: true
        })
        
        currentRecording.value = {
          id: recordingId,
          ...playData
        }
        
        return response
      }
      throw new Error(response.message)
    } catch (error) {
      console.error('播放录像失败:', error)
      throw error
    }
  }

  /**
   * 停止播放录像
   * @param {number} recordingId - 录像ID
   */
  const stopRecording = (recordingId) => {
    if (playingRecordings.value.has(recordingId)) {
      const playInfo = playingRecordings.value.get(recordingId)
      playInfo.isPlaying = false
      playInfo.endTime = new Date()
      
      // 如果是当前播放的录像，清空
      if (currentRecording.value?.id === recordingId) {
        currentRecording.value = null
      }
    }
  }

  /**
   * 下载录像
   * @param {number} recordingId - 录像ID
   */
  const downloadRecording = async (recordingId) => {
    try {
      // 初始化下载进度
      downloadProgress.value.set(recordingId, {
        progress: 0,
        isDownloading: true,
        startTime: new Date()
      })
      
      const response = await recordingApi.downloadRecording(recordingId, (progress) => {
        // 更新下载进度
        if (downloadProgress.value.has(recordingId)) {
          downloadProgress.value.get(recordingId).progress = progress
        }
      })
      
      if (response.success) {
        // 下载完成
        downloadProgress.value.set(recordingId, {
          progress: 100,
          isDownloading: false,
          endTime: new Date()
        })
        
        return response
      }
      throw new Error(response.message)
    } catch (error) {
      console.error('下载录像失败:', error)
      
      // 下载失败
      if (downloadProgress.value.has(recordingId)) {
        downloadProgress.value.get(recordingId).isDownloading = false
        downloadProgress.value.get(recordingId).error = error.message
      }
      
      throw error
    }
  }

  /**
   * 删除录像
   * @param {number} recordingId - 录像ID
   */
  const deleteRecording = async (recordingId) => {
    try {
      const response = await recordingApi.deleteRecording(recordingId)
      if (response.success) {
        // 从本地列表移除
        recordings.value = recordings.value.filter(recording => recording.id !== recordingId)
        pagination.value.total--
        
        // 清理播放和下载状态
        playingRecordings.value.delete(recordingId)
        downloadProgress.value.delete(recordingId)
        
        // 如果是当前播放的录像，清空
        if (currentRecording.value?.id === recordingId) {
          currentRecording.value = null
        }
        
        return response
      }
      throw new Error(response.message)
    } catch (error) {
      console.error('删除录像失败:', error)
      throw error
    }
  }

  /**
   * 批量删除录像
   * @param {Array} recordingIds - 录像ID数组
   */
  const batchDeleteRecordings = async (recordingIds) => {
    try {
      const promises = recordingIds.map(id => deleteRecording(id))
      await Promise.all(promises)
      return { success: true, message: '批量删除成功' }
    } catch (error) {
      console.error('批量删除录像失败:', error)
      throw error
    }
  }

  /**
   * 获取录像统计信息
   */
  const fetchStatistics = async () => {
    try {
      const response = await recordingApi.getStatistics()
      if (response.success) {
        statistics.value = response.body
        return response
      }
      throw new Error(response.message)
    } catch (error) {
      console.error('获取录像统计失败:', error)
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
      device_id: null,
      start_time: '',
      end_time: '',
      alarm_type: ''
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
   * 搜索录像
   * @param {Object} searchParams - 搜索参数
   */
  const searchRecordings = async (searchParams) => {
    setFilters(searchParams)
    await fetchRecordings()
  }

  /**
   * 按时间范围获取录像
   * @param {string} startTime - 开始时间
   * @param {string} endTime - 结束时间
   */
  const getRecordingsByTimeRange = async (startTime, endTime) => {
    await searchRecordings({
      start_time: startTime,
      end_time: endTime
    })
  }

  /**
   * 按设备获取录像
   * @param {number} deviceId - 设备ID
   */
  const getRecordingsByDevice = async (deviceId) => {
    await searchRecordings({
      device_id: deviceId
    })
  }

  /**
   * 按告警类型获取录像
   * @param {string} alarmType - 告警类型
   */
  const getRecordingsByAlarmType = async (alarmType) => {
    await searchRecordings({
      alarm_type: alarmType
    })
  }

  /**
   * 获取录像详情
   * @param {number} recordingId - 录像ID
   */
  const getRecordingDetail = (recordingId) => {
    return recordings.value.find(recording => recording.id === recordingId)
  }

  /**
   * 检查录像是否正在播放
   * @param {number} recordingId - 录像ID
   */
  const isRecordingPlaying = (recordingId) => {
    const playInfo = playingRecordings.value.get(recordingId)
    return playInfo?.isPlaying || false
  }

  /**
   * 获取下载进度
   * @param {number} recordingId - 录像ID
   */
  const getDownloadProgress = (recordingId) => {
    return downloadProgress.value.get(recordingId) || { progress: 0, isDownloading: false }
  }

  /**
   * 清理播放状态
   */
  const clearPlayingStates = () => {
    playingRecordings.value.clear()
    currentRecording.value = null
  }

  /**
   * 清理下载状态
   */
  const clearDownloadStates = () => {
    downloadProgress.value.clear()
  }

  /**
   * 上传录像文件
   * @param {number} deviceId - 设备ID
   * @param {File} file - 录像文件
   */
  const uploadRecording = async (deviceId, file) => {
    const uploadId = Date.now().toString()
    
    try {
      // 初始化上传进度
      uploadProgress.value.set(uploadId, {
        filename: file.name,
        progress: 0,
        status: 'uploading',
        deviceId,
        startTime: new Date()
      })

      // 添加到上传队列
      uploadQueue.value.push({
        id: uploadId,
        deviceId,
        filename: file.name
      })

      const response = await recordingApi.uploadRecording(deviceId, file)
      
      if (response.success) {
        // 上传成功
        uploadProgress.value.set(uploadId, {
          ...uploadProgress.value.get(uploadId),
          progress: 100,
          status: 'success',
          endTime: new Date(),
          recordingId: response.body.recording_id
        })

        // 从上传队列移除
        uploadQueue.value = uploadQueue.value.filter(item => item.id !== uploadId)

        // 刷新录像列表和统计数据
        await Promise.all([fetchRecordings(), fetchStatistics()])

        return response
      }
      throw new Error(response.message)
    } catch (error) {
      console.error('上传录像失败:', error)
      
      // 上传失败
      if (uploadProgress.value.has(uploadId)) {
        uploadProgress.value.set(uploadId, {
          ...uploadProgress.value.get(uploadId),
          status: 'error',
          error: error.message,
          endTime: new Date()
        })
      }

      // 从上传队列移除
      uploadQueue.value = uploadQueue.value.filter(item => item.id !== uploadId)
      
      throw error
    }
  }

  /**
   * 批量上传录像文件
   * @param {number} deviceId - 设备ID
   * @param {FileList} files - 录像文件列表
   */
  const batchUploadRecordings = async (deviceId, files) => {
    const results = []
    const filesArray = Array.from(files)

    for (const file of filesArray) {
      try {
        const result = await uploadRecording(deviceId, file)
        results.push({
          filename: file.name,
          success: true,
          result
        })
      } catch (error) {
        results.push({
          filename: file.name,
          success: false,
          error: error.message
        })
      }
    }

    return results
  }

  /**
   * 获取上传进度
   * @param {string} uploadId - 上传ID
   */
  const getUploadProgress = (uploadId) => {
    return uploadProgress.value.get(uploadId) || { progress: 0, status: 'pending' }
  }

  /**
   * 清理上传状态
   */
  const clearUploadStates = () => {
    uploadProgress.value.clear()
    uploadQueue.value = []
  }

  /**
   * 添加新录像（用于实时告警触发时）
   * @param {Object} recordingData - 录像数据
   */
  const addNewRecording = (recordingData) => {
    recordings.value.unshift({
      ...recordingData,
      id: recordingData.id || Date.now(),
      create_time: recordingData.create_time || new Date().toISOString()
    })
    
    // 更新统计信息
    statistics.value.total_recordings++
  }

  /**
   * 自动清理过期录像（模拟）
   */
  const autoCleanupExpired = () => {
    if (!statistics.value.auto_cleanup) return
    
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - statistics.value.retention_days)
    
    const expiredRecordings = recordings.value.filter(recording => 
      new Date(recording.create_time) < cutoffDate
    )
    
    if (expiredRecordings.length > 0) {
      console.log(`自动清理 ${expiredRecordings.length} 个过期录像`)
      expiredRecordings.forEach(recording => {
        recordings.value = recordings.value.filter(r => r.id !== recording.id)
      })
      statistics.value.total_recordings -= expiredRecordings.length
    }
  }

  /**
   * 重置状态
   */
  const resetState = () => {
    recordings.value = []
    currentRecording.value = null
    pagination.value = {
      page: 1,
      page_size: 10,
      total: 0
    }
    clearFilters()
    clearPlayingStates()
    clearDownloadStates()
    clearUploadStates()
    statistics.value = {
      total_recordings: 0,
      total_size: '',
      available_space: '',
      retention_days: 180,
      auto_cleanup: true,
      daily_average: ''
    }
  }

  return {
    // State
    recordings,
    currentRecording,
    loading,
    pagination,
    filters,
    statistics,
    playingRecordings,
    downloadProgress,
    uploadProgress,
    uploadQueue,
    
    // Getters
    totalRecordings,
    todayRecordings,
    recordingsByDevice,
    recordingsByAlarmType,
    totalSize,
    availableSpace,
    retentionDays,
    
    // Actions
    fetchRecordings,
    playRecording,
    stopRecording,
    downloadRecording,
    deleteRecording,
    batchDeleteRecordings,
    fetchStatistics,
    setFilters,
    clearFilters,
    setPagination,
    searchRecordings,
    getRecordingsByTimeRange,
    getRecordingsByDevice,
    getRecordingsByAlarmType,
    getRecordingDetail,
    isRecordingPlaying,
    getDownloadProgress,
    clearPlayingStates,
    clearDownloadStates,
    uploadRecording,
    batchUploadRecordings,
    getUploadProgress,
    clearUploadStates,
    addNewRecording,
    autoCleanupExpired,
    resetState
  }
})