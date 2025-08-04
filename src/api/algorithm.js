import { api } from './index'

// 算法管理API
export const algorithmApi = {
  // 获取算法列表
  getAlgorithmList() {
    return api.get('/api/algorithms')
  },

  // 上传算法文件
  uploadAlgorithm(file, data) {
    const formData = new FormData()
    formData.append('algorithm_file', file)
    Object.keys(data).forEach(key => {
      formData.append(key, data[key])
    })
    return api.upload('/api/algorithms/upload', formData)
  },

  // 更新算法信息
  updateAlgorithm(algorithmId, data) {
    return api.put(`/api/algorithms/${algorithmId}`, data)
  },

  // 删除算法模型
  deleteAlgorithm(algorithmId, data) {
    return api.delete(`/api/algorithms/${algorithmId}`, { data })
  },

  // 执行算法下发
  dispatchAlgorithm(data) {
    return api.post('/api/algorithms/dispatch', data)
  },

  // 批量下发算法模型
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

  // 获取下发日志
  getDispatchLogs(params) {
    return api.get('/api/algorithms/dispatch-logs', { params })
  },

  // 获取智能分析板卡列表
  getAnalysisCards() {
    return api.get('/api/devices/analysis-cards')
  },

  // 获取摄像机列表
  getCameraList() {
    return api.get('/api/devices/cameras')
  }
}