// 算法管理Mock数据
class AlgorithmMockData {
  constructor() {
    this.algorithms = []
    this.dispatchLogs = []
    this.initData()
  }

  initData() {
    // 初始化算法数据
    const algorithmConfigs = [
      {
        name: 'YOLOv8_PersonDetection',
        description: '基于YOLOv8深度学习框架的人员检测算法，支持实时视频流中的人员识别和定位，准确率高达95%以上。'
      },
      {
        name: 'FaceRecognition_Advanced',
        description: '高精度人脸识别算法，支持1:N人脸比对，具备活体检测功能，适用于门禁、考勤等场景。'
      },
      {
        name: 'VehicleTrack_DeepSORT',
        description: '基于DeepSORT的车辆跟踪算法，能够在复杂交通场景中稳定跟踪多个车辆目标，支持车辆计数和轨迹分析。'
      },
      {
        name: 'BehaviorAnalysis_3D',
        description: '三维行为分析算法，能够识别异常行为如摔倒、打架、徘徊等，广泛应用于安防监控场景。'
      },
      {
        name: 'ObjectDetection_RCNN',
        description: '基于Region-CNN的通用目标检测算法，支持80+类别物体检测，包括人员、车辆、动物等。'
      },
      {
        name: 'FireSmoke_Detection',
        description: '火灾烟雾检测专用算法，能够快速识别火焰和烟雾，支持早期火灾预警，误报率低于2%。'
      },
      {
        name: 'Intrusion_Detection',
        description: '区域入侵检测算法，支持自定义检测区域，能够准确识别人员或车辆的非法入侵行为。'
      },
      {
        name: 'PPE_Safety_Check',
        description: '个人防护装备检测算法，能够识别安全帽、工作服、反光衣等防护用品的穿戴情况。'
      },
      {
        name: 'Crowd_Density_Analysis',
        description: '人群密度分析算法，实时统计区域内人员数量，支持人群聚集预警和疏散引导。'
      },
      {
        name: 'License_Plate_Recognition',
        description: '车牌识别算法，支持多种车牌类型识别，包括蓝牌、黄牌、新能源车牌等，识别准确率99%以上。'
      }
    ]
    
    const statuses = ['published', 'testing', 'disabled']
    const versions = ['1.0.0', '1.1.0', '1.2.0', '2.0.0', '2.1.0', '3.0.0']

    let algorithmId = 1
    
    // 为每个算法配置创建多个版本
    algorithmConfigs.forEach((config) => {
      const versionCount = Math.floor(Math.random() * 3) + 2 // 每个算法2-4个版本
      
      for (let v = 0; v < versionCount; v++) {
        const status = v === 0 ? statuses[Math.floor(Math.random() * statuses.length)] : 
                      (Math.random() > 0.7 ? 'disabled' : statuses[Math.floor(Math.random() * 2)]) // 旧版本更可能被禁用
        const version = versions[v] || `${Math.floor(Math.random() * 2) + 3}.${v}.0`
        const createTime = new Date(Date.now() - (versionCount - v) * 30 * 24 * 60 * 60 * 1000) // 版本时间递减
        const modelSize = Math.floor(Math.random() * 500 + 50) * 1024 * 1024 // 50MB-550MB
        const accuracy = Math.random() * 0.15 + 0.85 // 85%-100%

        this.algorithms.push({
          id: algorithmId++,
          name: config.name, // 使用相同的名称以便分组
          version: `v${version}`,
          description: config.description,
          status: status,
          model_size: modelSize,
          accuracy: accuracy,
          create_time: createTime.toISOString().replace('T', ' ').split('.')[0],
          // 兼容旧字段
          type: '.zip',
          size: `${(modelSize / (1024 * 1024)).toFixed(1)} MB`,
          upload_time: createTime.toISOString().replace('T', ' ').split('.')[0]
        })
      }
    })

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
    const algorithmNames = ['YOLOv8_PersonDetection', 'FaceRecognition_Advanced', 'VehicleTrack_DeepSORT', 'BehaviorAnalysis_3D', 'ObjectDetection_RCNN']
    const name = algorithmData.name || algorithmNames[Math.floor(Math.random() * algorithmNames.length)]
    const modelSize = Math.floor(Math.random() * 300 + 80) * 1024 * 1024 // 80MB-380MB
    const accuracy = Math.random() * 0.1 + 0.9 // 90%-100%
    const createTime = new Date()

    const newAlgorithm = {
      id: newId,
      name: algorithmData.name || `${name}_v${newId}`,
      version: algorithmData.version || 'v1.0.0',
      description: algorithmData.description || `这是${name}算法的新版本，具备高精度检测能力和优异的性能表现。`,
      status: 'testing',
      model_size: modelSize,
      accuracy: accuracy,
      create_time: createTime.toISOString().replace('T', ' ').split('.')[0],
      // 兼容旧字段
      type: '.zip',
      size: `${(modelSize / (1024 * 1024)).toFixed(1)} MB`,
      upload_time: createTime.toISOString().replace('T', ' ').split('.')[0]
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

  // 获取算法统计信息
  getAlgorithmStatistics() {
    const total = this.algorithms.length
    const published = this.algorithms.filter(a => a.status === 'published').length
    const testing = this.algorithms.filter(a => a.status === 'testing').length
    const disabled = this.algorithms.filter(a => a.status === 'disabled').length

    return {
      total_algorithms: total,
      published_count: published,
      testing_count: testing,
      disabled_count: disabled,
      recent_uploads: this.algorithms.slice(0, 5).map(a => ({
        name: a.name,
        version: a.version,
        upload_time: a.upload_time || a.create_time
      }))
    }
  }

  // 同步算法规则到分析板
  syncRulesToAnalysisCards(algorithmId, targetCards, rules) {
    const algorithm = this.getAlgorithmById(algorithmId)
    if (!algorithm) return null

    const syncResults = targetCards.map(cardId => ({
      card_id: cardId,
      algorithm_id: algorithmId,
      algorithm_name: algorithm.name,
      sync_time: new Date().toISOString().replace('T', ' ').split('.')[0],
      status: Math.random() > 0.1 ? '成功' : '失败', // 90% 成功率
      synced_rules: rules ? rules.length : Math.floor(Math.random() * 5) + 1
    }))

    return {
      total_cards: targetCards.length,
      success_count: syncResults.filter(r => r.status === '成功').length,
      failed_count: syncResults.filter(r => r.status === '失败').length,
      sync_results: syncResults
    }
  }

  // 配置算法规则
  configureAlgorithmRules(algorithmId, deviceId, configData) {
    const algorithm = this.getAlgorithmById(algorithmId)
    if (!algorithm) return null

    const configId = Math.floor(Math.random() * 10000) + 1
    const config = {
      id: configId,
      algorithm_id: algorithmId,
      algorithm_name: algorithm.name,
      device_id: deviceId,
      config_data: configData,
      create_time: new Date().toISOString().replace('T', ' ').split('.')[0],
      status: '已启用',
      last_update: new Date().toISOString().replace('T', ' ').split('.')[0]
    }

    return config
  }

  // 批量下发算法
  batchDispatchAlgorithms(algorithmIds, targetCards) {
    const results = []
    
    algorithmIds.forEach(algorithmId => {
      const algorithm = this.getAlgorithmById(algorithmId)
      if (algorithm) {
        targetCards.forEach(cardId => {
          const result = Math.random() > 0.15 ? '成功' : '失败' // 85% 成功率
          const newLog = this.addDispatchLog(algorithmId, cardId, result)
          results.push({
            algorithm_id: algorithmId,
            algorithm_name: algorithm.name,
            target_card: cardId,
            result: result,
            dispatch_time: newLog.dispatch_time
          })
        })
      }
    })

    return {
      total_dispatches: results.length,
      success_count: results.filter(r => r.result === '成功').length,
      failed_count: results.filter(r => r.result === '失败').length,
      dispatch_results: results
    }
  }

  // 获取算法版本历史
  getAlgorithmVersionHistory(algorithmId) {
    const algorithm = this.getAlgorithmById(algorithmId)
    if (!algorithm) return null

    // 模拟版本历史
    const versions = []
    const baseVersion = algorithm.version
    const majorVersion = parseInt(baseVersion.split('.')[0].substring(1))
    
    for (let i = majorVersion; i >= 1; i--) {
      for (let j = 4; j >= 0; j--) {
        versions.push({
          version: `V${i}.${j}.0`,
          upload_time: new Date(Date.now() - (majorVersion - i + 1) * 30 * 24 * 60 * 60 * 1000 - j * 7 * 24 * 60 * 60 * 1000).toISOString().replace('T', ' ').split('.')[0],
          status: i === majorVersion && j === parseInt(baseVersion.split('.')[1]) ? algorithm.status : '已停用',
          size: `${(Math.random() * 40 + 15).toFixed(1)} MB`,
          description: `${algorithm.name}算法 V${i}.${j} 版本`
        })
      }
    }

    return versions.slice(0, 10) // 返回最近10个版本
  }
}

// 分析板卡Mock数据
class AnalysisCardMockData {
  constructor() {
    this.analysisCards = []
    this.initData()
  }

  initData() {
    // 初始化分析板卡数据
    const locations = ['大门入口', '车库监控', '办公区域', '生产车间', '仓库区域', '周界围墙', '电梯间', '楼梯间']
    const cardTypes = ['AI-1080P', 'AI-4K', 'AI-Ultra', 'AI-Pro']
    const statuses = ['在线', '离线', '维护中']

    for (let i = 1; i <= 12; i++) {
      const location = locations[Math.floor(Math.random() * locations.length)]
      const cardType = cardTypes[Math.floor(Math.random() * cardTypes.length)]
      const status = statuses[Math.floor(Math.random() * statuses.length)]
      const channels = Math.floor(Math.random() * 4) + 4 // 4-8路
      const lastOnlineTime = new Date(Date.now() - Math.floor(Math.random() * 48 * 60 * 60 * 1000))

      this.analysisCards.push({
        id: `card_${i.toString().padStart(3, '0')}`,
        name: `智能分析板卡_${location}_${i.toString().padStart(2, '0')}`,
        model: `${cardType}-${channels}CH`,
        location: location,
        status: status,
        channels: channels,
        ip_address: `192.168.1.${100 + i}`,
        version: `v${Math.floor(Math.random() * 3) + 2}.${Math.floor(Math.random() * 5)}.${Math.floor(Math.random() * 10)}`,
        cpu_usage: status === '在线' ? Math.floor(Math.random() * 60) + 20 : 0,
        memory_usage: status === '在线' ? Math.floor(Math.random() * 70) + 15 : 0,
        temperature: status === '在线' ? Math.floor(Math.random() * 25) + 35 : 0,
        uptime: status === '在线' ? Math.floor(Math.random() * 30) + 1 : 0,
        last_online: lastOnlineTime.toISOString().replace('T', ' ').split('.')[0],
        algorithms_deployed: status === '在线' ? Math.floor(Math.random() * 3) + 1 : 0,
        processing_capability: Math.floor(Math.random() * 50) + 30, // 30-80 FPS
        description: `位于${location}的${cardType}型智能分析板卡，支持${channels}路视频流并发处理`
      })
    }
  }

  getAllAnalysisCards() {
    return {
      analysis_cards: [...this.analysisCards],
      total: this.analysisCards.length
    }
  }

  getAnalysisCardById(id) {
    return this.analysisCards.find(card => card.id === id)
  }

  updateAnalysisCard(id, cardData) {
    const index = this.analysisCards.findIndex(card => card.id === id)
    if (index === -1) return false

    Object.assign(this.analysisCards[index], cardData)
    return true
  }
}

export const algorithmMockData = new AlgorithmMockData()
export const analysisCardMockData = new AnalysisCardMockData()