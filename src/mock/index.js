import MockAdapter from 'axios-mock-adapter'

import { deviceMockData } from './modules/device'
// import setupUserMock from './modules/user' // 已禁用，直接调用后端API

import { statisticsMockData } from './modules/statistics'
import { logMockData } from './modules/log'
import { dashboardMockData } from './modules/dashboard'
import { algorithmMockData, analysisCardMockData } from './modules/algorithm'
import { detectionMockData } from './modules/detection'
import { eventMockData } from './modules/event'
import { recordingMockData } from './modules/recording'



let mock = null

/**
 * 初始化mock拦截器
 * @param {AxiosInstance} axiosInstance - axios实例
 */
export function setupMock(axiosInstance) {
  // 创建Mock适配器实例
  mock = new MockAdapter(axiosInstance, { delayResponse: 200 })

  console.log('正在设置Mock拦截器...')

  // 注册所有mock路由
  try {
    setupDeviceMock(mock)
    console.log('✓ 设备管理Mock已注册')
    
    console.log('🔧 开始注册算法管理Mock...')
    setupAlgorithmMock(mock)
    console.log('✓ 算法管理Mock已注册')
    console.log('🔧 算法Mock数据初始化检查:', algorithmMockData.getAllAlgorithms())
    
    // setupUserMock(mock) // 已禁用，直接调用后端API
    // console.log('✓ 用户管理Mock已注册')
    
    setupStatisticsMock(mock)
    setupLogMock(mock)
    setupDashboardMock(mock)
    setupDetectionMock(mock)
    setupEventMock(mock)
    // setupRecordingMock(mock) // 已禁用，直接调用后端API
    // console.log('✓ 录像管理Mock已注册')

    
    console.log('✓ 所有Mock模块已注册')
  } catch (error) {
    console.error('Mock设置错误:', error)
  }

  // 确保认证和用户相关接口不被拦截，直接通过到真实后端
  mock.onPost('/api/v1/auth/login').passThrough()
  mock.onPost('/api/v1/auth/logout').passThrough()
  mock.onPost('/api/v1/auth/refresh').passThrough()
  mock.onPost('/api/v1/auth/verify').passThrough()
  mock.onGet('/api/v1/auth/userinfo').passThrough()
  
  // 用户管理相关接口也不拦截，直接调用后端API
  mock.onGet('/api/v1/users/profile').passThrough()
  mock.onPut('/api/v1/users/profile').passThrough()
  mock.onGet(/\/api\/v1\/users\/\d+/).passThrough()
  mock.onGet('/api/v1/users').passThrough()
  mock.onPost('/api/v1/users').passThrough()
  mock.onPut(/\/api\/v1\/users\/\d+/).passThrough()
  mock.onDelete(/\/api\/v1\/users\/\d+/).passThrough()
  
  // 系统配置相关接口不拦截，直接调用后端API
  mock.onGet(/\/api\/v1\/system\/.*/).passThrough()
  mock.onPost(/\/api\/v1\/system\/.*/).passThrough()
  mock.onPut(/\/api\/v1\/system\/.*/).passThrough()
  mock.onDelete(/\/api\/v1\/system\/.*/).passThrough()
  
  // 板卡管理相关接口不拦截，直接调用后端API
  mock.onGet(/\/api\/v1\/algorithm\/boards.*/).passThrough()
  mock.onPost(/\/api\/v1\/algorithm\/boards.*/).passThrough()
  mock.onPut(/\/api\/v1\/algorithm\/boards.*/).passThrough()
  mock.onDelete(/\/api\/v1\/algorithm\/boards.*/).passThrough()
  
  // 录像管理相关接口不拦截，直接调用后端API
  mock.onGet(/\/api\/v1\/recordings.*/).passThrough()
  mock.onPost(/\/api\/v1\/recordings.*/).passThrough()
  mock.onPut(/\/api\/v1\/recordings.*/).passThrough()
  mock.onDelete(/\/api\/v1\/recordings.*/).passThrough()
  
  // 其他未匹配的请求通过
  mock.onAny().passThrough()

  console.log('🎉 Mock 拦截器已启用')
  console.log('💡 注意: 认证、用户管理、系统配置、板卡管理和录像管理接口已完全移除Mock拦截，直接调用后端API，其他模块使用Mock数据')
}

/**
 * 禁用mock拦截器
 */
export function disableMock() {
  if (mock) {
    mock.restore()
    mock = null
    console.log('Mock 拦截器已禁用')
  }
}



/**
 * 设备管理Mock
 */
function setupDeviceMock(mock) {
  // 获取设备列表
  mock.onGet(/\/api\/devices/).reply(config => {
    const params = config.params || {}
    const page = parseInt(params.page) || 1
    const pageSize = parseInt(params.page_size) || 10
    
    let devices = deviceMockData.getAllDevices()
    
    // 搜索过滤
    if (params.device_name) {
      devices = devices.filter(device => 
        device.device_name.toLowerCase().includes(params.device_name.toLowerCase())
      )
    }
    if (params.device_sn) {
      devices = devices.filter(device => 
        device.device_sn.toLowerCase().includes(params.device_sn.toLowerCase())
      )
    }
    if (params.device_type) {
      devices = devices.filter(device => device.device_type === params.device_type)
    }
    if (params.status) {
      devices = devices.filter(device => device.status === params.status)
    }
    
    // 分页
    const start = (page - 1) * pageSize
    const end = start + pageSize
    const paginatedDevices = devices.slice(start, end)
    
    return [200, {
      error: 0,
      body: {
        devices: paginatedDevices,
        total: devices.length,
        page,
        page_size: pageSize
      },
      message: '获取设备列表成功',
      success: true
    }]
  })

  // 添加设备
  mock.onPost('/api/devices').reply(config => {
    const deviceData = JSON.parse(config.data)
    const newDevice = deviceMockData.addDevice(deviceData)
    
    return [200, {
      error: 0,
      body: {
        device_id: newDevice.id
      },
      message: '设备添加成功',
      success: true
    }]
  })

  // 更新设备
  mock.onPut(/\/api\/devices\/\d+/).reply(config => {
    const deviceId = parseInt(config.url.match(/\/api\/devices\/(\d+)/)[1])
    const deviceData = JSON.parse(config.data)
    
    const success = deviceMockData.updateDevice(deviceId, deviceData)
    
    return [200, {
      error: success ? 0 : 3001,
      body: {},
      message: success ? '设备更新成功' : '设备不存在',
      success
    }]
  })

  // 删除设备
  mock.onDelete(/\/api\/devices\/\d+/).reply(config => {
    const deviceId = parseInt(config.url.match(/\/api\/devices\/(\d+)/)[1])
    const success = deviceMockData.deleteDevice(deviceId)
    
    return [200, {
      error: success ? 0 : 3001,
      body: {},
      message: success ? '设备删除成功' : '设备不存在',
      success
    }]
  })

  // 切换设备状态
  mock.onPost(/\/api\/devices\/\d+\/toggle-status/).reply(config => {
    const deviceId = parseInt(config.url.match(/\/api\/devices\/(\d+)\/toggle-status/)[1])
    const { status } = JSON.parse(config.data)
    
    const success = deviceMockData.toggleDeviceStatus(deviceId, status)
    
    return [200, {
      error: success ? 0 : 3001,
      body: {},
      message: success ? '设备状态切换成功' : '设备不存在',
      success
    }]
  })

  // 获取设备详细信息
  mock.onGet(/\/api\/devices\/\d+$/).reply(config => {
    const deviceId = parseInt(config.url.match(/\/api\/devices\/(\d+)$/)[1])
    const device = deviceMockData.getDeviceById(deviceId)
    
    return [200, {
      error: device ? 0 : 3001,
      body: device || {},
      message: device ? '获取设备详情成功' : '设备不存在',
      success: !!device
    }]
  })

  // 获取智能分析板卡列表
  mock.onGet('/api/devices/analysis-cards').reply(() => {
    // 使用算法模块中更丰富的分析板卡数据
    const analysisCardsData = analysisCardMockData.getAllAnalysisCards()
    
    return [200, {
      code: 200,
      message: '获取分析板卡列表成功',
      data: analysisCardsData
    }]
  })

  // 获取摄像机列表
  mock.onGet('/api/devices/cameras').reply(() => {
    const cameras = deviceMockData.getCameras()
    
    return [200, {
      error: 0,
      body: {
        cameras: cameras,
        total: cameras.length
      },
      message: '获取摄像机列表成功',
      success: true
    }]
  })

  // 批量添加设备
  mock.onPost('/api/devices/batch').reply((_config) => { // eslint-disable-line no-unused-vars
    // 模拟从文件中解析的设备数据
    const mockDevicesFromFile = [
      { device_name: '批量设备01', device_sn: 'BATCH001', device_type: 'IPC摄像机', manufacturer: '海康威视' },
      { device_name: '批量设备02', device_sn: 'BATCH002', device_type: '球型摄像机', manufacturer: '大华' },
      { device_name: '批量设备03', device_sn: 'BATCH003', device_type: '枪型摄像机', manufacturer: '宇视' }
    ]
    
    try {
      const addedDevices = deviceMockData.batchAddDevices(mockDevicesFromFile)
      return [200, {
        error: 0,
        body: {
          success_count: addedDevices.length,
          failed_count: 0,
          added_devices: addedDevices.map(d => ({ id: d.id, name: d.device_name }))
        },
        message: '批量添加设备完成',
        success: true
      }]
    } catch (error) {
      return [200, {
        error: 3003,
        body: {
          success_count: 0,
          failed_count: mockDevicesFromFile.length
        },
        message: '批量添加设备失败',
        success: false
      }]
    }
  })

  // 平台设备自动同步
  mock.onPost('/api/devices/sync').reply(() => {
    const syncedDevices = deviceMockData.syncDevicesFromPlatform()
    
    return [200, {
      error: 0,
      body: {
        synced_count: syncedDevices.length,
        new_count: syncedDevices.length,
        updated_count: 0,
        synced_devices: syncedDevices.map(d => ({ id: d.id, name: d.device_name, status: d.status }))
      },
      message: '设备同步成功',
      success: true
    }]
  })

  // 导出设备列表
  mock.onGet('/api/devices/export').reply(() => {
    const exportData = deviceMockData.exportDevicesData()
    const csvContent = [
      Object.keys(exportData[0]).join(','),
      ...exportData.map(row => Object.values(row).join(','))
    ].join('\n')
    
    return [200, new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })]
  })

  // 配置设备接入协议
  mock.onPut(/\/api\/devices\/\d+\/protocol/).reply(() => {
    return [200, {
      error: 0,
      body: {},
      message: '设备协议配置成功',
      success: true
    }]
  })

  // 绑定智能分析板卡与摄像机
  mock.onPost('/api/devices/bind-analysis-card').reply(() => {
    return [200, {
      error: 0,
      body: {},
      message: '绑定分析板卡成功',
      success: true
    }]
  })

  // 测试设备连接
  mock.onPost(/\/api\/devices\/\d+\/test-connection/).reply(config => {
    const deviceId = parseInt(config.url.match(/\/api\/devices\/(\d+)\/test-connection/)[1])
    const testResult = deviceMockData.testDeviceConnection(deviceId)
    
    if (!testResult) {
      return [200, {
        error: 3001,
        body: {},
        message: '设备不存在',
        success: false
      }]
    }
    
    return [200, {
      error: testResult.connected ? 0 : 3002,
      body: testResult,
      message: testResult.connected ? '设备连接正常' : '设备连接失败',
      success: testResult.connected
    }]
  })

  // 获取设备日志
  mock.onGet(/\/api\/devices\/\d+\/logs/).reply(config => {
    const deviceId = parseInt(config.url.match(/\/api\/devices\/(\d+)\/logs/)[1])
    const params = config.params || {}
    const page = parseInt(params.page) || 1
    const pageSize = parseInt(params.page_size) || 10
    
    const logs = []
    for (let i = 1; i <= 50; i++) {
      logs.push({
        id: i,
        device_id: deviceId,
        level: ['INFO', 'WARN', 'ERROR'][Math.floor(Math.random() * 3)],
        message: `设备日志消息 ${i}`,
        timestamp: new Date(Date.now() - i * 60000).toISOString().replace('T', ' ').split('.')[0]
      })
    }
    
    const start = (page - 1) * pageSize
    const end = start + pageSize
    const paginatedLogs = logs.slice(start, end)
    
    return [200, {
      error: 0,
      body: {
        logs: paginatedLogs,
        total: logs.length,
        page,
        page_size: pageSize
      },
      message: '获取设备日志成功',
      success: true
    }]
  })
}



/**
 * 统计分析Mock
 */
function setupStatisticsMock(mock) {
  // 获取统计概览
  mock.onGet('/api/statistics/overview').reply(() => {
    return [200, {
      error: 0,
      body: statisticsMockData.getOverview(),
      message: '获取统计概览成功',
      success: true
    }]
  })

  // 获取多维度预警统计
  mock.onGet('/api/statistics/alarm-multi-dimension').reply(config => {
    const params = config.params || {}
    const dimensions = params.dimensions || 'type'
    
    return [200, {
      error: 0,
      body: statisticsMockData.getMultiDimensionData(dimensions),
      message: '获取多维度统计成功',
      success: true
    }]
  })

  // 获取设备状态统计
  mock.onGet('/api/statistics/device-status').reply(() => {
    return [200, {
      error: 0,
      body: statisticsMockData.getDeviceStatus(),
      message: '获取设备状态统计成功',
      success: true
    }]
  })

  // 获取报警趋势分析
  mock.onGet('/api/statistics/alarm-trend').reply(config => {
    const params = config.params || {}
    
    return [200, {
      error: 0,
      body: statisticsMockData.getAlarmTrend(params),
      message: '获取报警趋势成功',
      success: true
    }]
  })

  // 导出统计报告
  mock.onPost('/api/statistics/export-report').reply(() => {
    return [200, new Blob(['统计报告数据'], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })]
  })
}

/**
 * 日志管理Mock
 */
function setupLogMock(mock) {
  // 获取系统日志
  mock.onGet('/api/logs').reply(config => {
    const params = config.params || {}
    const page = parseInt(params.page) || 1
    const pageSize = parseInt(params.page_size) || 10
    
    let logs = logMockData.getAllLogs()
    
    // 过滤
    if (params.start_time && params.end_time) {
      logs = logs.filter(log => 
        log.timestamp >= params.start_time && log.timestamp <= params.end_time
      )
    }
    if (params.log_level) {
      logs = logs.filter(log => log.level === params.log_level)
    }
    if (params.module) {
      logs = logs.filter(log => log.module === params.module)
    }
    
    // 分页
    const start = (page - 1) * pageSize
    const end = start + pageSize
    const paginatedLogs = logs.slice(start, end)
    
    return [200, {
      error: 0,
      body: {
        logs: paginatedLogs,
        total: logs.length,
        page,
        page_size: pageSize
      },
      message: '获取日志列表成功',
      success: true
    }]
  })

  // 获取日志统计
  mock.onGet('/api/logs/statistics').reply(() => {
    return [200, {
      error: 0,
      body: logMockData.getStatistics(),
      message: '获取日志统计成功',
      success: true
    }]
  })

  // 清理旧日志
  mock.onPost('/api/logs/clean').reply(config => {
    const { before_date } = JSON.parse(config.data)
    const cleanedCount = logMockData.cleanOldLogs(before_date)
    
    return [200, {
      error: 0,
      body: {
        cleaned_count: cleanedCount
      },
      message: `成功清理 ${cleanedCount} 条旧日志`,
      success: true
    }]
  })
}

/**
 * 首页看板Mock
 */
function setupDashboardMock(mock) {
  // 获取数据看板概览
  mock.onGet('/api/dashboard/overview').reply(() => {
    return [200, {
      error: 0,
      body: dashboardMockData.getOverview(),
      message: '获取数据看板成功',
      success: true
    }]
  })

  // 获取CAD图层信息
  mock.onGet('/api/dashboard/cad-map').reply(() => {
    return [200, {
      error: 0,
      body: dashboardMockData.getCadMap(),
      message: '获取CAD图层信息成功',
      success: true
    }]
  })

  // 获取摄像头实时画面
  mock.onGet(/\/api\/dashboard\/camera-live\/\d+/).reply(config => {
    const deviceId = parseInt(config.url.match(/\/api\/dashboard\/camera-live\/(\d+)/)[1])
    
    return [200, {
      error: 0,
      body: dashboardMockData.getCameraLive(deviceId),
      message: '获取摄像头实时画面成功',
      success: true
    }]
  })
}

/**
 * 算法管理Mock
 */
function setupAlgorithmMock(mock) {
  // 获取算法列表
  mock.onGet('/api/algorithms').reply(() => {
    console.log('🎯 算法Mock拦截器被调用: /api/algorithms')
    const data = algorithmMockData.getAllAlgorithms()
    console.log('🎯 算法Mock返回数据:', data)
    
    return [200, {
      code: 200,
      message: '获取算法列表成功',
      data: data
    }]
  })

  // 上传算法
  mock.onPost('/api/algorithms/upload').reply(() => {
    const newAlgorithm = algorithmMockData.addAlgorithm()
    
    return [200, {
      error: 0,
      body: {
        algorithm_id: newAlgorithm.id
      },
      message: '算法上传成功',
      success: true
    }]
  })

  // 下发算法
  mock.onPost('/api/algorithms/dispatch').reply(() => {
    return [200, {
      error: 0,
      body: {},
      message: '算法下发成功',
      success: true
    }]
  })

  // 批量下发算法
  mock.onPost('/api/algorithms/batch-dispatch').reply(config => {
    const { algorithm_ids, target_cards } = JSON.parse(config.data)
    
    const batchResult = algorithmMockData.batchDispatchAlgorithms(algorithm_ids, target_cards)
    
    return [200, {
      error: 0,
      body: batchResult,
      message: '批量下发算法成功',
      success: true
    }]
  })

  // 获取下发日志
  mock.onGet('/api/algorithms/dispatch-logs').reply(config => {
    const params = config.params || {}
    const dispatchLogs = algorithmMockData.getDispatchLogs()
    
    let logs = dispatchLogs.logs
    
    // 过滤
    if (params.algorithm_id) {
      logs = logs.filter(log => log.algorithm_id == params.algorithm_id)
    }
    if (params.result) {
      logs = logs.filter(log => log.result === params.result)
    }
    if (params.target_card) {
      logs = logs.filter(log => log.target_card === params.target_card)
    }
    
    return [200, {
      error: 0,
      body: {
        logs: logs,
        total: logs.length
      },
      message: '获取下发日志成功',
      success: true
    }]
  })

  // 更新算法信息
  mock.onPut(/\/api\/algorithms\/\d+/).reply(config => {
    const algorithmId = parseInt(config.url.match(/\/api\/algorithms\/(\d+)/)[1])
    const algorithmData = JSON.parse(config.data)
    
    const success = algorithmMockData.updateAlgorithm(algorithmId, algorithmData)
    
    return [200, {
      error: success ? 0 : 4001,
      body: {},
      message: success ? '算法更新成功' : '算法不存在',
      success
    }]
  })

  // 删除算法模型
  mock.onDelete(/\/api\/algorithms\/\d+/).reply(config => {
    const algorithmId = parseInt(config.url.match(/\/api\/algorithms\/(\d+)/)[1])
    const success = algorithmMockData.deleteAlgorithm(algorithmId)
    
    return [200, {
      error: success ? 0 : 4001,
      body: {},
      message: success ? '算法删除成功' : '算法不存在',
      success
    }]
  })

  // 同步规则到分析板
  mock.onPost('/api/algorithms/sync-rules').reply(config => {
    const { algorithm_id, target_cards, rules } = JSON.parse(config.data)
    
    const syncResult = algorithmMockData.syncRulesToAnalysisCards(algorithm_id, target_cards, rules)
    
    if (!syncResult) {
      return [200, {
        error: 4001,
        body: {},
        message: '算法不存在',
        success: false
      }]
    }
    
    return [200, {
      error: 0,
      body: syncResult,
      message: '规则同步成功',
      success: true
    }]
  })

  // 配置智能分析规则
  mock.onPost('/api/algorithms/config').reply(config => {
    const { algorithm_id, device_id, config_data } = JSON.parse(config.data)
    
    const configResult = algorithmMockData.configureAlgorithmRules(algorithm_id, device_id, config_data)
    
    if (!configResult) {
      return [200, {
        error: 4001,
        body: {},
        message: '算法不存在',
        success: false
      }]
    }
    
    return [200, {
      error: 0,
      body: {
        config_id: configResult.id,
        config_details: configResult
      },
      message: '算法配置成功',
      success: true
    }]
  })

  // 获取算法统计信息
  mock.onGet('/api/algorithms/statistics').reply(() => {
    const statistics = algorithmMockData.getAlgorithmStatistics()
    
    return [200, {
      error: 0,
      body: statistics,
      message: '获取算法统计成功',
      success: true
    }]
  })

  // 获取算法版本历史
  mock.onGet(/\/api\/algorithms\/\d+\/versions/).reply(config => {
    const algorithmId = parseInt(config.url.match(/\/api\/algorithms\/(\d+)\/versions/)[1])
    const versions = algorithmMockData.getAlgorithmVersionHistory(algorithmId)
    
    if (!versions) {
      return [200, {
        error: 4001,
        body: {},
        message: '算法不存在',
        success: false
      }]
    }
    
    return [200, {
      error: 0,
      body: {
        versions: versions,
        total: versions.length
      },
      message: '获取版本历史成功',
      success: true
    }]
  })

  // 注意：分析板卡相关接口已在设备管理Mock中统一处理，避免重复定义
}

/**
 * 实时检测Mock
 */
function setupDetectionMock(mock) {
  // 获取实时检测状态
  mock.onGet('/api/detection/real-time').reply(() => {
    return [200, {
      error: 0,
      body: detectionMockData.getRealTimeStatus(),
      message: '获取实时检测状态成功',
      success: true
    }]
  })

  // 开始实时检测
  mock.onPost('/api/detection/start').reply(() => {
    return [200, {
      error: 0,
      body: {},
      message: '实时检测已启动',
      success: true
    }]
  })

  // 停止实时检测
  mock.onPost('/api/detection/stop').reply(() => {
    return [200, {
      error: 0,
      body: {},
      message: '实时检测已停止',
      success: true
    }]
  })

  // PTZ控制
  mock.onPost(/\/api\/detection\/ptz-control\/\d+/).reply(() => {
    return [200, {
      error: 0,
      body: {},
      message: 'PTZ控制指令已发送',
      success: true
    }]
  })

  // 获取视频流
  mock.onGet(/\/api\/detection\/video-stream\/\d+/).reply(config => {
    const deviceId = parseInt(config.url.match(/\/api\/detection\/video-stream\/(\d+)/)[1])
    
    return [200, {
      error: 0,
      body: detectionMockData.getVideoStream(deviceId),
      message: '获取视频流成功',
      success: true
    }]
  })

  // 获取预警信息
  mock.onGet('/api/detection/warnings').reply(() => {
    return [200, {
      error: 0,
      body: detectionMockData.getWarnings(),
      message: '获取预警信息成功',
      success: true
    }]
  })
}

/**
 * 事件中心Mock
 */
function setupEventMock(mock) {
  // 获取报警列表
  mock.onGet('/api/events/alarms').reply(config => {
    const params = config.params || {}
    const page = parseInt(params.page) || 1
    const pageSize = parseInt(params.page_size) || 10
    
    let alarms = eventMockData.getAllAlarms()
    
    // 过滤
    if (params.alarm_type) {
      alarms = alarms.filter(alarm => alarm.type === params.alarm_type)
    }
    if (params.status) {
      alarms = alarms.filter(alarm => alarm.status === params.status)
    }
    
    // 分页
    const start = (page - 1) * pageSize
    const end = start + pageSize
    const paginatedAlarms = alarms.slice(start, end)
    
    return [200, {
      error: 0,
      body: {
        alarms: paginatedAlarms,
        total: alarms.length,
        page,
        page_size: pageSize
      },
      message: '获取报警列表成功',
      success: true
    }]
  })

  // 处理报警
  mock.onPost(/\/api\/events\/alarms\/\d+\/process/).reply(config => {
    const alarmId = parseInt(config.url.match(/\/api\/events\/alarms\/(\d+)\/process/)[1])
    const success = eventMockData.processAlarm(alarmId)
    
    return [200, {
      error: success ? 0 : 5001,
      body: {},
      message: success ? '报警处理成功' : '报警事件不存在',
      success
    }]
  })

  // 获取点位列表
  mock.onGet('/api/events/locations').reply(() => {
    return [200, {
      error: 0,
      body: {
        locations: eventMockData.getLocations()
      },
      message: '获取点位列表成功',
      success: true
    }]
  })
}

/**
 * 录像管理Mock
 * 已禁用，直接调用后端API
 */
// eslint-disable-next-line no-unused-vars
function setupRecordingMock(mock) {
  // 获取录像列表 - 支持新版API路径 GET /api/v1/recordings
  mock.onGet('/api/v1/recordings').reply(config => {
    console.log('🎯 录像Mock拦截器被调用: GET /api/v1/recordings')
    
    const params = config.params || {}
    const page = parseInt(params.page) || 1
    const pageSize = parseInt(params.page_size) || 10
    
    console.log('📋 录像列表请求参数:', params)
    
    // 构建过滤条件
    const filters = {}
    if (params.title) filters.title = params.title
    if (params.format) filters.format = params.format
    if (params.uploader_id) filters.uploader_id = params.uploader_id
    
    // 获取所有录像数据
    const allRecordings = recordingMockData.getAllRecordings()
    
    // 过滤数据
    let filteredRecordings = allRecordings
    if (filters.title) {
      filteredRecordings = filteredRecordings.filter(r => 
        r.title?.toLowerCase().includes(filters.title.toLowerCase())
      )
    }
    if (filters.format) {
      filteredRecordings = filteredRecordings.filter(r => r.format === filters.format)
    }
    
    // 分页
    const total = filteredRecordings.length
    const start = (page - 1) * pageSize
    const end = start + pageSize
    const paginatedRecordings = filteredRecordings.slice(start, end)
    
    console.log('📋 录像Mock返回数据:', {
      recordingsCount: paginatedRecordings.length,
      total: total,
      page: page,
      pageSize: pageSize
    })
    
    return [200, {
      code: 200,
      message: '获取录像列表成功',
      data: {
        list: paginatedRecordings,
        total: total,
        page: page,
        page_size: pageSize
      },
      success: true
    }]
  })

  // 获取录像列表 - 兼容旧版API路径 POST /api/recordings/list
  mock.onPost('/api/recordings/list').reply(config => {
    console.log('🎯 录像Mock拦截器被调用: /api/recordings/list')
    
    const params = JSON.parse(config.data || '{}')
    const page = parseInt(params.page) || 1
    const pageSize = parseInt(params.page_size) || 10
    
    console.log('📋 录像列表请求参数:', params)
    
    // 构建过滤条件
    const filters = {}
    if (params.device_id) filters.device_id = params.device_id
    if (params.alarm_type) filters.alarm_type = params.alarm_type
    if (params.start_time) filters.start_time = params.start_time
    if (params.end_time) filters.end_time = params.end_time
    if (params.keyword) filters.keyword = params.keyword
    
    const result = recordingMockData.getPaginatedRecordings(filters, page, pageSize)
    
    console.log('📋 录像Mock返回数据:', {
      recordingsCount: result.recordings.length,
      total: result.total,
      page: result.page,
      pageSize: result.page_size
    })
    
    return [200, {
      code: 200,
      message: '获取录像列表成功',
      data: {
        recordings: result.recordings,
        pagination: {
          page: result.page,
          page_size: result.page_size,
          total: result.total,
          total_pages: result.total_pages
        }
      },
      success: true
    }]
  })

  // 获取录像播放地址 - 新版API路径 /api/v1/recordings/{id}/play
  mock.onGet(/\/api\/v1\/recordings\/\d+\/play/).reply(config => {
    const recordingId = parseInt(config.url.match(/\/api\/v1\/recordings\/(\d+)\/play/)[1])
    console.log('🎯 录像播放Mock拦截器被调用 (v1):', recordingId)
    
    const recording = recordingMockData.getRecordingById(recordingId)
    
    if (!recording) {
      return [404, {
        code: 404,
        message: '录像文件不存在',
        success: false
      }]
    }

    return [200, {
      code: 200,
      message: '获取播放地址成功',
      data: {
        file_url: recording.file_url,
        recording_info: {
          id: recording.id,
          title: recording.title,
          format: recording.format,
          duration: recording.duration,
          file_size: recording.file_size
        }
      },
      success: true
    }]
  })

  // 获取录像播放地址 - 兼容旧版API路径 /api/recordings/{id}/play
  mock.onGet(/\/api\/recordings\/[^/]+\/play/).reply(config => {
    const recordingId = config.url.match(/\/api\/recordings\/([^/]+)\/play/)[1]
    console.log('🎯 录像播放Mock拦截器被调用 (旧版):', recordingId)
    
    const recording = recordingMockData.getRecordingById(recordingId)
    
    if (!recording) {
      return [404, {
        error: 6001,
        body: {},
        message: '录像文件不存在',
        success: false
      }]
    }

    // 生成模拟播放URL
    const baseUrl = 'http://localhost:8080'
    const playUrls = {
      mp4: `${baseUrl}/api/recordings/stream/${recordingId}/mp4`,
      hls: `${baseUrl}/api/recordings/stream/${recordingId}/hls`,
      download: `${baseUrl}/api/recordings/download/${recordingId}`
    }

    return [200, {
      error: 0,
      body: {
        play_urls: playUrls,
        recording_info: {
          id: recording.id,
          device_name: recording.device_name,
          alarm_type: recording.alarm_type,
          duration: recording.duration,
          resolution: recording.resolution,
          fps: recording.fps,
          file_size: recording.file_size
        }
      },
      message: '获取播放地址成功',
      success: true
    }]
  })

  // 上传录像 - 新版API POST /api/v1/recordings/upload
  mock.onPost('/api/v1/recordings/upload').reply(() => {
    console.log('🎯 录像上传Mock拦截器被调用 (v1)')
    
    const newRecording = recordingMockData.addRecording({
      device_id: Math.floor(Math.random() * 12) + 1,
      device_name: '上传设备',
      alarm_type: '手动上传',
      filename: 'uploaded_video.mp4'
    })

    return [200, {
      code: 200,
      message: '视频上传成功',
      data: {
        id: newRecording.id,
        title: newRecording.title,
        file_name: newRecording.file_name,
        file_size: newRecording.file_size,
        file_url: newRecording.file_url
      },
      success: true
    }]
  })

  // 删除录像 - 新版API DELETE /api/v1/recordings/{id}
  mock.onDelete(/\/api\/v1\/recordings\/\d+/).reply(config => {
    const recordingId = parseInt(config.url.match(/\/api\/v1\/recordings\/(\d+)/)[1])
    console.log('🎯 录像删除Mock拦截器被调用 (v1):', recordingId)
    
    const success = recordingMockData.deleteRecording(recordingId)
    
    if (success) {
      return [200, {
        code: 200,
        message: '录像删除成功',
        success: true
      }]
    } else {
      return [404, {
        code: 404,
        message: '录像不存在',
        success: false
      }]
    }
  })

  // 上传录像文件 - 兼容旧版API
  mock.onPost('/api/recordings/upload').reply(() => {
    console.log('🎯 录像上传Mock拦截器被调用 (旧版)')
    
    // 模拟上传延迟
    return new Promise(resolve => {
      setTimeout(() => {
        const newRecording = recordingMockData.addRecording({
          device_id: Math.floor(Math.random() * 12) + 1,
          device_name: '上传设备',
          alarm_type: '手动上传',
          filename: 'uploaded_video.mp4'
        })

        resolve([200, {
          error: 0,
          body: {
            recording_id: newRecording.id,
            message: '录像上传成功'
          },
          message: '录像上传成功',
          success: true
        }])
      }, 1000) // 模拟1秒上传时间
    })
  })

  // 删除录像文件
  mock.onDelete(/\/api\/recordings\/[^/]+$/).reply(config => {
    const recordingId = config.url.match(/\/api\/recordings\/([^/]+)$/)[1]
    console.log('🎯 录像删除Mock拦截器被调用:', recordingId)
    
    const success = recordingMockData.deleteRecording(recordingId)
    
    return [200, {
      error: success ? 0 : 6001,
      body: {},
      message: success ? '录像删除成功' : '录像文件不存在',
      success
    }]
  })

  // 下载录像文件
  mock.onGet(/\/api\/recordings\/download\/[^/]+/).reply(config => {
    const recordingId = config.url.match(/\/api\/recordings\/download\/([^/]+)/)[1]
    console.log('🎯 录像下载Mock拦截器被调用:', recordingId)
    
    const recording = recordingMockData.getRecordingById(recordingId)
    
    if (!recording) {
      return [404, {
        error: 6001,
        body: {},
        message: '录像文件不存在',
        success: false
      }]
    }

    // 模拟下载文件
    const mockFileContent = `Mock录像文件内容 - ${recording.device_name} - ${recording.alarm_type}`
    
    return [200, new Blob([mockFileContent], { 
      type: 'video/mp4' 
    }), {
      'Content-Disposition': `attachment; filename="${recording.device_name}_${recording.alarm_type}_${recording.start_time}.mp4"`
    }]
  })

  // 获取录像统计信息
  mock.onGet('/api/recordings/statistics').reply(() => {
    console.log('🎯 录像统计Mock拦截器被调用')
    
    const statistics = recordingMockData.getStatistics()
    
    return [200, {
      code: 200,
      message: '获取录像统计成功',
      data: {
        statistics: statistics,
        device_options: recordingMockData.getDeviceOptions(),
        alarm_types: recordingMockData.getAlarmTypes()
      },
      success: true
    }]
  })

  // 清理过期录像
  mock.onPost('/api/recordings/cleanup').reply(config => {
    console.log('🎯 录像清理Mock拦截器被调用')
    
    const { days_to_keep = 90 } = JSON.parse(config.data || '{}')
    const cleanedCount = recordingMockData.cleanupOldRecordings(days_to_keep)
    
    return [200, {
      error: 0,
      body: {
        cleaned_count: cleanedCount,
        remaining_count: recordingMockData.getAllRecordings().length
      },
      message: `成功清理 ${cleanedCount} 条过期录像`,
      success: true
    }]
  })

  // 获取录像流（用于视频播放）
  mock.onGet(/\/api\/recordings\/stream\/[^/]+\/[^/]+/).reply(config => {
    const matches = config.url.match(/\/api\/recordings\/stream\/([^/]+)\/([^/]+)/)
    const recordingId = matches[1]
    const format = matches[2]
    
    console.log('🎯 录像流Mock拦截器被调用:', { recordingId, format })
    
    const recording = recordingMockData.getRecordingById(recordingId)
    
    if (!recording) {
      return [404, {
        error: 6001,
        body: {},
        message: '录像文件不存在',
        success: false
      }]
    }

    // 根据格式返回相应的mock数据
    if (format === 'mp4') {
      // 返回模拟的MP4视频流
      const mockVideoData = new ArrayBuffer(1024 * 1024) // 1MB的mock数据
      return [200, mockVideoData, {
        'Content-Type': 'video/mp4',
        'Content-Length': mockVideoData.byteLength.toString(),
        'Accept-Ranges': 'bytes'
      }]
    } else if (format === 'hls') {
      // 返回HLS播放列表
      const hlsPlaylist = `#EXTM3U
#EXT-X-VERSION:3
#EXT-X-TARGETDURATION:10
#EXT-X-MEDIA-SEQUENCE:0
#EXTINF:9.009,
segment0.ts
#EXTINF:9.009,
segment1.ts
#EXTINF:9.009,
segment2.ts
#EXT-X-ENDLIST`
      
      return [200, hlsPlaylist, {
        'Content-Type': 'application/vnd.apple.mpegurl'
      }]
    }

    return [400, {
      error: 6002,
      body: {},
      message: '不支持的流格式',
      success: false
    }]
  })
}



