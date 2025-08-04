// 算法管理Mock数据
class AlgorithmMockData {
  constructor() {
    this.algorithms = []
    this.dispatchLogs = []
    this.initData()
  }

  initData() {
    // 初始化算法数据
    const algorithmNames = ['CoreAlgo', 'FaceDetect', 'VehicleTrack', 'BehaviorAnalysis', 'ObjectDetect']
    const statuses = ['已发布', '测试中', '已停用']
    const types = ['.zip', '.tar', '.gz']

    for (let i = 1; i <= 15; i++) {
      const name = algorithmNames[Math.floor(Math.random() * algorithmNames.length)]
      const status = statuses[Math.floor(Math.random() * statuses.length)]
      const type = types[Math.floor(Math.random() * types.length)]
      const uploadTime = new Date(Date.now() - Math.floor(Math.random() * 90 * 24 * 60 * 60 * 1000))
      const size = (Math.random() * 50 + 10).toFixed(1) // 10-60MB

      this.algorithms.push({
        id: i,
        name: `${name}_${i.toString().padStart(2, '0')}`,
        version: `V${Math.floor(Math.random() * 3) + 1}.${Math.floor(Math.random() * 5)}.${Math.floor(Math.random() * 10)}`,
        type: type,
        size: `${size} MB`,
        upload_time: uploadTime.toISOString().replace('T', ' ').split('.')[0],
        status: status,
        description: `这是${name}算法的第${i}个版本。`
      })
    }

    // 初始化下发日志
    const targetCards = ['card001', 'card002', 'card003', 'card004', 'card005']
    const results = ['成功', '失败', '超时']

    for (let i = 1; i <= 50; i++) {
      const algorithm = this.algorithms[Math.floor(Math.random() * this.algorithms.length)]
      const targetCard = targetCards[Math.floor(Math.random() * targetCards.length)]
      const result = results[Math.floor(Math.random() * results.length)]
      const dispatchTime = new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000))

      this.dispatchLogs.push({
        id: i,
        algorithm_id: algorithm.id,
        algorithm_name: algorithm.name,
        algorithm_version: algorithm.version,
        target_card: targetCard,
        dispatch_time: dispatchTime.toISOString().replace('T', ' ').split('.')[0],
        result: result,
        error_message: result === '失败' ? ['网络连接失败', '目标卡离线', '文件传输错误'][Math.floor(Math.random() * 3)] : null,
        operator: ['admin', 'operator01', 'user02'][Math.floor(Math.random() * 3)]
      })
    }

    // 按时间倒序排列
    this.dispatchLogs.sort((a, b) => new Date(b.dispatch_time) - new Date(a.dispatch_time))
  }

  getAllAlgorithms() {
    return {
      algorithms: [...this.algorithms],
      total: this.algorithms.length
    }
  }

  getAlgorithmById(id) {
    return this.algorithms.find(algorithm => algorithm.id === id)
  }

  addAlgorithm(algorithmData = {}) {
    const newId = Math.max(0, ...this.algorithms.map(a => a.id)) + 1
    const algorithmNames = ['CoreAlgo', 'FaceDetect', 'VehicleTrack', 'BehaviorAnalysis', 'ObjectDetect']
    const name = algorithmData.name || algorithmNames[Math.floor(Math.random() * algorithmNames.length)]
    const size = (Math.random() * 50 + 10).toFixed(1)

    const newAlgorithm = {
      id: newId,
      name: `${name}_${newId.toString().padStart(2, '0')}`,
      version: algorithmData.version || 'V1.0.0',
      type: '.zip',
      size: `${size} MB`,
      upload_time: new Date().toISOString().replace('T', ' ').split('.')[0],
      status: '测试中',
      description: algorithmData.description || `这是${name}算法的新版本。`
    }

    this.algorithms.unshift(newAlgorithm)
    return newAlgorithm
  }

  updateAlgorithm(id, algorithmData) {
    const index = this.algorithms.findIndex(algorithm => algorithm.id === id)
    if (index === -1) return false

    Object.assign(this.algorithms[index], algorithmData)
    return true
  }

  deleteAlgorithm(id) {
    const index = this.algorithms.findIndex(algorithm => algorithm.id === id)
    if (index === -1) return false

    this.algorithms.splice(index, 1)
    return true
  }

  addDispatchLog(algorithmId, targetCard, result = '成功') {
    const algorithm = this.getAlgorithmById(algorithmId)
    if (!algorithm) return null

    const newId = Math.max(0, ...this.dispatchLogs.map(l => l.id)) + 1
    const newLog = {
      id: newId,
      algorithm_id: algorithmId,
      algorithm_name: algorithm.name,
      algorithm_version: algorithm.version,
      target_card: targetCard,
      dispatch_time: new Date().toISOString().replace('T', ' ').split('.')[0],
      result: result,
      error_message: result === '失败' ? '模拟下发失败' : null,
      operator: 'admin'
    }

    this.dispatchLogs.unshift(newLog)
    return newLog
  }

  getDispatchLogs() {
    return {
      logs: [...this.dispatchLogs],
      total: this.dispatchLogs.length
    }
  }
}

export const algorithmMockData = new AlgorithmMockData()