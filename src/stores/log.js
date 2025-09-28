import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { logApi } from '@/api/log'

/**
 * 日志管理Store
 * 功能：系统日志查询、日志导出、日志统计、日志级别管理
 */
export const useLogStore = defineStore('log', () => {
  // State
  const logs = ref([])
  const loading = ref(false)
  const pagination = ref({
    page: 1,
    page_size: 10,
    total: 0
  })
  const filters = ref({
    start_time: '',
    end_time: '',
    log_level: '',
    module: '',
    user_id: null,
    operation: '',
    result: ''
  })
  const exportProgress = ref({
    isExporting: false,
    progress: 0,
    message: ''
  })
  const logLevels = ref([
    { value: 'DEBUG', label: '调试', color: '#909399' },
    { value: 'INFO', label: '信息', color: '#409EFF' },
    { value: 'WARN', label: '警告', color: '#E6A23C' },
    { value: 'ERROR', label: '错误', color: '#F56C6C' }
  ])
  const modules = ref([
    'UserManagement',
    'DeviceManagement', 
    'AlgorithmManagement',
    'Detection',
    'Recording',
    'Event',
    'System'
  ])
  const statistics = ref({
    total_logs: 0,
    logs_by_level: {},
    logs_by_module: {},
    logs_by_user: {},
    error_trend: []
  })

  // Getters
  const todayLogs = computed(() => {
    const today = new Date().toISOString().split('T')[0]
    return logs.value.filter(log => log.timestamp.startsWith(today))
  })
  
  const errorLogs = computed(() => 
    logs.value.filter(log => log.level === 'ERROR')
  )
  
  const warningLogs = computed(() => 
    logs.value.filter(log => log.level === 'WARN')
  )
  
  const infoLogs = computed(() => 
    logs.value.filter(log => log.level === 'INFO')
  )
  
  const debugLogs = computed(() => 
    logs.value.filter(log => log.level === 'DEBUG')
  )
  
  const logsByModule = computed(() => {
    const moduleMap = {}
    logs.value.forEach(log => {
      if (!moduleMap[log.module]) {
        moduleMap[log.module] = []
      }
      moduleMap[log.module].push(log)
    })
    return moduleMap
  })
  
  const logsByUser = computed(() => {
    const userMap = {}
    logs.value.forEach(log => {
      if (log.username) {
        if (!userMap[log.username]) {
          userMap[log.username] = []
        }
        userMap[log.username].push(log)
      }
    })
    return userMap
  })
  
  const recentErrorCount = computed(() => {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
    return logs.value.filter(log => 
      log.level === 'ERROR' && new Date(log.timestamp) > oneHourAgo
    ).length
  })
  
  const totalErrors = computed(() => errorLogs.value.length)
  const totalWarnings = computed(() => warningLogs.value.length)

  // Actions
  /**
   * 获取系统日志
   * @param {Object} params - 查询参数
   */
  const fetchLogs = async (params = {}) => {
    loading.value = true
    try {
      const queryParams = {
        page: pagination.value.page,
        page_size: pagination.value.page_size,
        ...filters.value,
        ...params
      }
      
      const response = await logApi.getSystemLogs(queryParams)
      if (response.success) {
        logs.value = response.body.logs
        pagination.value.total = response.body.total
        pagination.value.page = response.body.page
        pagination.value.page_size = response.body.page_size
        return response
      }
      throw new Error(response.message)
    } catch (error) {
      console.error('获取日志列表失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  /**
   * 导出系统日志
   * @param {Object} exportParams - 导出参数
   */
  const exportLogs = async (exportParams = {}) => {
    exportProgress.value.isExporting = true
    exportProgress.value.progress = 0
    exportProgress.value.message = '开始导出日志...'
    
    try {
      const response = await logApi.exportLogs({
        ...filters.value,
        ...exportParams
      }, (progress) => {
        exportProgress.value.progress = progress
        if (progress < 30) {
          exportProgress.value.message = '正在查询日志数据...'
        } else if (progress < 70) {
          exportProgress.value.message = '正在格式化数据...'
        } else {
          exportProgress.value.message = '正在生成文件...'
        }
      })
      
      if (response.success) {
        exportProgress.value.progress = 100
        exportProgress.value.message = '日志导出成功'
        return response
      }
      throw new Error(response.message)
    } catch (error) {
      console.error('导出日志失败:', error)
      exportProgress.value.message = '导出失败: ' + error.message
      throw error
    } finally {
      exportProgress.value.isExporting = false
    }
  }

  /**
   * 获取日志统计信息
   * @param {Object} params - 统计参数
   */
  const fetchLogStatistics = async (params = {}) => {
    try {
      const response = await logApi.getLogStatistics(params)
      if (response.success) {
        statistics.value = response.body
        return response
      }
      throw new Error(response.message)
    } catch (error) {
      console.error('获取日志统计失败:', error)
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
      log_level: '',
      module: '',
      user_id: null,
      operation: '',
      result: ''
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
   * 搜索日志
   * @param {Object} searchParams - 搜索参数
   */
  const searchLogs = async (searchParams) => {
    setFilters(searchParams)
    await fetchLogs()
  }

  /**
   * 按时间范围查询日志
   * @param {string} startTime - 开始时间
   * @param {string} endTime - 结束时间
   */
  const getLogsByTimeRange = async (startTime, endTime) => {
    await searchLogs({
      start_time: startTime,
      end_time: endTime
    })
  }

  /**
   * 按日志级别查询
   * @param {string} level - 日志级别
   */
  const getLogsByLevel = async (level) => {
    await searchLogs({
      log_level: level
    })
  }

  /**
   * 按模块查询日志
   * @param {string} module - 模块名称
   */
  const getLogsByModule = async (module) => {
    await searchLogs({
      module: module
    })
  }

  /**
   * 按用户查询日志
   * @param {number} userId - 用户ID
   */
  const getLogsByUser = async (userId) => {
    await searchLogs({
      user_id: userId
    })
  }

  /**
   * 获取今天的日志
   */
  const getTodayLogs = async () => {
    const today = new Date()
    const startTime = today.toISOString().split('T')[0] + ' 00:00:00'
    const endTime = today.toISOString().split('T')[0] + ' 23:59:59'
    
    await getLogsByTimeRange(startTime, endTime)
  }

  /**
   * 获取最近的错误日志
   * @param {number} hours - 最近多少小时
   */
  const getRecentErrorLogs = async (hours = 24) => {
    const endTime = new Date()
    const startTime = new Date(endTime.getTime() - hours * 60 * 60 * 1000)
    
    await searchLogs({
      start_time: startTime.toISOString().replace('T', ' ').split('.')[0],
      end_time: endTime.toISOString().replace('T', ' ').split('.')[0],
      log_level: 'ERROR'
    })
  }

  /**
   * 添加新日志（实时推送时使用）
   * @param {Object} logData - 日志数据
   */
  const addNewLog = (logData) => {
    logs.value.unshift({
      ...logData,
      id: logData.id || Date.now()
    })
    
    // 保持日志列表最多1000条
    if (logs.value.length > 1000) {
      logs.value = logs.value.slice(0, 1000)
    }
    
    // 更新统计信息
    statistics.value.total_logs++
    if (statistics.value.logs_by_level[logData.level]) {
      statistics.value.logs_by_level[logData.level]++
    } else {
      statistics.value.logs_by_level[logData.level] = 1
    }
  }

  /**
   * 获取日志级别颜色
   * @param {string} level - 日志级别
   */
  const getLogLevelColor = (level) => {
    const levelInfo = logLevels.value.find(l => l.value === level)
    return levelInfo ? levelInfo.color : '#909399'
  }

  /**
   * 获取日志级别标签
   * @param {string} level - 日志级别
   */
  const getLogLevelLabel = (level) => {
    const levelInfo = logLevels.value.find(l => l.value === level)
    return levelInfo ? levelInfo.label : level
  }

  /**
   * 分析日志模式（查找异常模式）
   */
  const analyzeLogPatterns = computed(() => {
    const patterns = {
      repeated_errors: [],
      frequent_operations: [],
      unusual_activity: []
    }
    
    // 分析重复错误
    const errorGroups = {}
    errorLogs.value.forEach(log => {
      const key = `${log.module}_${log.operation}`
      if (!errorGroups[key]) {
        errorGroups[key] = []
      }
      errorGroups[key].push(log)
    })
    
    Object.entries(errorGroups).forEach(([key, logs]) => {
      if (logs.length > 3) { // 重复超过3次的错误
        patterns.repeated_errors.push({
          pattern: key,
          count: logs.length,
          latest: logs[0].timestamp
        })
      }
    })
    
    // 分析频繁操作
    const operationGroups = {}
    logs.value.forEach(log => {
      if (!operationGroups[log.operation]) {
        operationGroups[log.operation] = []
      }
      operationGroups[log.operation].push(log)
    })
    
    Object.entries(operationGroups).forEach(([operation, logs]) => {
      if (logs.length > 50) { // 操作超过50次
        patterns.frequent_operations.push({
          operation,
          count: logs.length,
          users: [...new Set(logs.map(l => l.username).filter(Boolean))]
        })
      }
    })
    
    return patterns
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
   * 开始监控错误日志
   * @param {Function} callback - 回调函数
   */
  const startErrorMonitoring = (callback) => {
    return setInterval(async () => {
      try {
        await getRecentErrorLogs(1) // 获取最近1小时的错误
        if (recentErrorCount.value > 0 && callback) {
          callback(recentErrorCount.value)
        }
      } catch (error) {
        console.error('错误监控失败:', error)
      }
    }, 5 * 60 * 1000) // 每5分钟检查一次
  }

  /**
   * 重置状态
   */
  const resetState = () => {
    logs.value = []
    pagination.value = {
      page: 1,
      page_size: 10,
      total: 0
    }
    clearFilters()
    clearExportProgress()
    statistics.value = {
      total_logs: 0,
      logs_by_level: {},
      logs_by_module: {},
      logs_by_user: {},
      error_trend: []
    }
  }

  return {
    // State
    logs,
    loading,
    pagination,
    filters,
    exportProgress,
    logLevels,
    modules,
    statistics,
    
    // Getters
    todayLogs,
    errorLogs,
    warningLogs,
    infoLogs,
    debugLogs,
    logsByModule,
    logsByUser,
    recentErrorCount,
    totalErrors,
    totalWarnings,
    analyzeLogPatterns,
    
    // Actions
    fetchLogs,
    exportLogs,
    fetchLogStatistics,
    setFilters,
    clearFilters,
    setPagination,
    searchLogs,
    getLogsByTimeRange,
    getLogsByLevel,
    getLogsByModule,
    getLogsByUser,
    getTodayLogs,
    getRecentErrorLogs,
    addNewLog,
    getLogLevelColor,
    getLogLevelLabel,
    clearExportProgress,
    startErrorMonitoring,
    resetState
  }
})