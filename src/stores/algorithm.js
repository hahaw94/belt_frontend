import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { algorithmAPI } from '@/api/algorithm'

/**
 * 算法管理Store
 * 功能：算法仓管理、算法下发、算法配置、规则同步
 */
export const useAlgorithmStore = defineStore('algorithm', () => {
  // State
  const algorithms = ref([])
  const currentAlgorithm = ref(null)
  const loading = ref(false)
  const uploadProgress = ref({
    isUploading: false,
    progress: 0,
    message: ''
  })
  const dispatchProgress = ref({
    isDispatching: false,
    progress: 0,
    message: '',
    targetCards: []
  })
  const dispatchLogs = ref([])
  const analysisCards = ref([])
  const algorithmConfigs = ref([])

  // Getters
  const totalAlgorithms = computed(() => algorithms.value.length)
  const publishedAlgorithms = computed(() => 
    algorithms.value.filter(algo => algo.status === '已发布')
  )
  const draftAlgorithms = computed(() => 
    algorithms.value.filter(algo => algo.status === '草稿')
  )
  const algorithmsByType = computed(() => {
    const typeMap = {}
    algorithms.value.forEach(algo => {
      if (!typeMap[algo.type]) {
        typeMap[algo.type] = []
      }
      typeMap[algo.type].push(algo)
    })
    return typeMap
  })

  // Actions
  /**
   * 获取算法列表
   */
  const fetchAlgorithms = async () => {
    loading.value = true
    try {
      const response = await algorithmAPI.getAlgorithms()
      if (response.success) {
        algorithms.value = response.body.algorithms
        return response
      }
      throw new Error(response.message)
    } catch (error) {
      console.error('获取算法列表失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  /**
   * 上传算法文件
   * @param {File} file - 算法文件
   * @param {Object} metadata - 算法元数据
   */
  const uploadAlgorithm = async (file, metadata) => {
    uploadProgress.value.isUploading = true
    uploadProgress.value.progress = 0
    uploadProgress.value.message = '开始上传算法文件...'
    
    try {
      const response = await algorithmAPI.uploadAlgorithm(file, metadata, (progress) => {
        uploadProgress.value.progress = progress
        uploadProgress.value.message = `上传中... ${progress}%`
      })
      
      if (response.success) {
        uploadProgress.value.progress = 100
        uploadProgress.value.message = '上传成功'
        
        // 重新获取算法列表
        await fetchAlgorithms()
        return response
      }
      throw new Error(response.message)
    } catch (error) {
      console.error('上传算法失败:', error)
      uploadProgress.value.message = '上传失败: ' + error.message
      throw error
    } finally {
      uploadProgress.value.isUploading = false
    }
  }

  /**
   * 单个算法下发
   * @param {Object} dispatchData - 下发数据
   */
  const dispatchAlgorithm = async (dispatchData) => {
    dispatchProgress.value.isDispatching = true
    dispatchProgress.value.progress = 0
    dispatchProgress.value.message = '开始下发算法...'
    dispatchProgress.value.targetCards = [dispatchData.target_card]
    
    try {
      const response = await algorithmAPI.dispatchAlgorithm(dispatchData)
      if (response.success) {
        dispatchProgress.value.progress = 100
        dispatchProgress.value.message = '算法下发成功'
        
        // 添加到下发日志
        dispatchLogs.value.unshift({
          id: Date.now(),
          algorithm_id: dispatchData.algorithm_version_id,
          target_cards: [dispatchData.target_card],
          status: '成功',
          dispatch_time: new Date().toISOString(),
          message: '单个算法下发成功'
        })
        
        return response
      }
      throw new Error(response.message)
    } catch (error) {
      console.error('算法下发失败:', error)
      dispatchProgress.value.message = '下发失败: ' + error.message
      
      // 添加失败日志
      dispatchLogs.value.unshift({
        id: Date.now(),
        algorithm_id: dispatchData.algorithm_version_id,
        target_cards: [dispatchData.target_card],
        status: '失败',
        dispatch_time: new Date().toISOString(),
        message: error.message
      })
      
      throw error
    } finally {
      dispatchProgress.value.isDispatching = false
    }
  }

  /**
   * 批量算法下发
   * @param {Object} batchDispatchData - 批量下发数据
   */
  const batchDispatchAlgorithm = async (batchDispatchData) => {
    dispatchProgress.value.isDispatching = true
    dispatchProgress.value.progress = 0
    dispatchProgress.value.message = '开始批量下发算法...'
    dispatchProgress.value.targetCards = batchDispatchData.target_cards
    
    try {
      const response = await algorithmAPI.batchDispatchAlgorithm(batchDispatchData, (progress) => {
        dispatchProgress.value.progress = progress
        dispatchProgress.value.message = `批量下发中... ${progress}%`
      })
      
      if (response.success) {
        dispatchProgress.value.progress = 100
        dispatchProgress.value.message = `批量下发完成，成功 ${response.body.success_count} 个，失败 ${response.body.failed_count} 个`
        
        // 添加到下发日志
        dispatchLogs.value.unshift({
          id: Date.now(),
          algorithm_id: batchDispatchData.algorithm_version_id,
          target_cards: batchDispatchData.target_cards,
          status: response.body.failed_count > 0 ? '部分成功' : '成功',
          dispatch_time: new Date().toISOString(),
          message: `成功 ${response.body.success_count} 个，失败 ${response.body.failed_count} 个`,
          details: response.body.results
        })
        
        return response
      }
      throw new Error(response.message)
    } catch (error) {
      console.error('批量下发失败:', error)
      dispatchProgress.value.message = '批量下发失败: ' + error.message
      
      // 添加失败日志
      dispatchLogs.value.unshift({
        id: Date.now(),
        algorithm_id: batchDispatchData.algorithm_version_id,
        target_cards: batchDispatchData.target_cards,
        status: '失败',
        dispatch_time: new Date().toISOString(),
        message: error.message
      })
      
      throw error
    } finally {
      dispatchProgress.value.isDispatching = false
    }
  }

  /**
   * 同步规则到分析板
   * @param {Object} syncData - 同步数据
   */
  const syncRules = async (syncData) => {
    try {
      const response = await algorithmAPI.syncRules(syncData)
      if (response.success) {
        return response
      }
      throw new Error(response.message)
    } catch (error) {
      console.error('同步规则失败:', error)
      throw error
    }
  }

  /**
   * 配置算法规则
   * @param {Object} configData - 配置数据
   */
  const configureAlgorithm = async (configData) => {
    try {
      const response = await algorithmAPI.configureAlgorithm(configData)
      if (response.success) {
        // 更新本地配置
        const existingConfigIndex = algorithmConfigs.value.findIndex(
          config => config.analysis_card_id === configData.analysis_card_id && 
                   config.channel === configData.channel
        )
        
        if (existingConfigIndex !== -1) {
          algorithmConfigs.value[existingConfigIndex] = configData
        } else {
          algorithmConfigs.value.push(configData)
        }
        
        return response
      }
      throw new Error(response.message)
    } catch (error) {
      console.error('配置算法失败:', error)
      throw error
    }
  }

  /**
   * 删除算法模型
   * @param {number} algorithmId - 算法ID
   * @param {Object} deleteData - 删除确认数据
   */
  const deleteAlgorithm = async (algorithmId, deleteData) => {
    try {
      const response = await algorithmAPI.deleteAlgorithm(algorithmId, deleteData)
      if (response.success) {
        // 从本地列表移除
        algorithms.value = algorithms.value.filter(algo => algo.id !== algorithmId)
        return response
      }
      throw new Error(response.message)
    } catch (error) {
      console.error('删除算法失败:', error)
      throw error
    }
  }

  /**
   * 获取下发日志
   */
  const fetchDispatchLogs = async () => {
    try {
      const response = await algorithmAPI.getDispatchLogs()
      if (response.success) {
        dispatchLogs.value = response.body.logs
        return response
      }
      throw new Error(response.message)
    } catch (error) {
      console.error('获取下发日志失败:', error)
      throw error
    }
  }

  /**
   * 获取智能分析板卡列表
   */
  const fetchAnalysisCards = async () => {
    try {
      // 这里假设从设备API获取分析板卡
      const response = await algorithmAPI.getAnalysisCards()
      if (response.success) {
        analysisCards.value = response.body.cards
        return response
      }
      throw new Error(response.message)
    } catch (error) {
      console.error('获取分析板卡列表失败:', error)
      throw error
    }
  }

  /**
   * 获取算法配置列表
   * @param {number} analysisCardId - 分析板卡ID
   */
  const fetchAlgorithmConfigs = async (analysisCardId) => {
    try {
      const response = await algorithmAPI.getAlgorithmConfigs(analysisCardId)
      if (response.success) {
        algorithmConfigs.value = response.body.configs
        return response
      }
      throw new Error(response.message)
    } catch (error) {
      console.error('获取算法配置失败:', error)
      throw error
    }
  }

  /**
   * 设置当前算法
   * @param {Object} algorithm - 算法对象
   */
  const setCurrentAlgorithm = (algorithm) => {
    currentAlgorithm.value = algorithm
  }

  /**
   * 更新算法状态
   * @param {number} algorithmId - 算法ID
   * @param {string} status - 新状态
   */
  const updateAlgorithmStatus = (algorithmId, status) => {
    const algorithm = algorithms.value.find(algo => algo.id === algorithmId)
    if (algorithm) {
      algorithm.status = status
    }
  }

  /**
   * 添加下发日志
   * @param {Object} logData - 日志数据
   */
  const addDispatchLog = (logData) => {
    dispatchLogs.value.unshift({
      ...logData,
      id: Date.now(),
      dispatch_time: new Date().toISOString()
    })
    
    // 保持日志列表最多100条
    if (dispatchLogs.value.length > 100) {
      dispatchLogs.value = dispatchLogs.value.slice(0, 100)
    }
  }

  /**
   * 清空上传进度
   */
  const clearUploadProgress = () => {
    uploadProgress.value = {
      isUploading: false,
      progress: 0,
      message: ''
    }
  }

  /**
   * 清空下发进度
   */
  const clearDispatchProgress = () => {
    dispatchProgress.value = {
      isDispatching: false,
      progress: 0,
      message: '',
      targetCards: []
    }
  }

  /**
   * 重置状态
   */
  const resetState = () => {
    algorithms.value = []
    currentAlgorithm.value = null
    dispatchLogs.value = []
    analysisCards.value = []
    algorithmConfigs.value = []
    clearUploadProgress()
    clearDispatchProgress()
  }

  return {
    // State
    algorithms,
    currentAlgorithm,
    loading,
    uploadProgress,
    dispatchProgress,
    dispatchLogs,
    analysisCards,
    algorithmConfigs,
    
    // Getters
    totalAlgorithms,
    publishedAlgorithms,
    draftAlgorithms,
    algorithmsByType,
    
    // Actions
    fetchAlgorithms,
    uploadAlgorithm,
    dispatchAlgorithm,
    batchDispatchAlgorithm,
    syncRules,
    configureAlgorithm,
    deleteAlgorithm,
    fetchDispatchLogs,
    fetchAnalysisCards,
    fetchAlgorithmConfigs,
    setCurrentAlgorithm,
    updateAlgorithmStatus,
    addDispatchLog,
    clearUploadProgress,
    clearDispatchProgress,
    resetState
  }
})