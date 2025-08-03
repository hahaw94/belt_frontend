import { api } from './index'

// 算法管理API
export const algorithmApi = {
  // 获取算法列表
  getAlgorithmList(params) {
    return api.get('/api/algorithms', params)
  },

  // 上传算法文件
  uploadAlgorithm(file, data = {}) {
    const formData = new FormData()
    formData.append('file', file)
    Object.keys(data).forEach(key => {
      formData.append(key, data[key])
    })
    return api.upload('/api/algorithms/upload', formData)
  },

  // 执行算法下发
  dispatchAlgorithm(data) {
    return api.post('/api/algorithms/dispatch', data)
  },

  // 批量算法下发
  batchDispatchAlgorithm(data) {
    return api.post('/api/algorithms/batch-dispatch', data)
  },

  // 同步规则到分析板
  syncRules(data) {
    return api.post('/api/algorithms/sync-rules', data)
  },

  // 配置智能分析规则
  configAlgorithm(data) {
    return api.post('/api/algorithms/config', data)
  },

  // 删除算法模型
  deleteAlgorithm(algorithmId, data) {
    return api.delete(`/api/algorithms/${algorithmId}`, data)
  },

  // 获取算法下发日志
  getDispatchLogs(params) {
    return api.get('/api/algorithms/dispatch-logs', params)
  }
} 