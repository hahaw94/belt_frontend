import MockAdapter from 'axios-mock-adapter'
import { userMockData } from './modules/user'
import { deviceMockData } from './modules/device'
import { recordingMockData } from './modules/recording'
import { statisticsMockData } from './modules/statistics'
import { logMockData } from './modules/log'
import { dashboardMockData } from './modules/dashboard'
import { algorithmMockData } from './modules/algorithm'
import { detectionMockData } from './modules/detection'
import { eventMockData } from './modules/event'
import { systemMockData } from './modules/system'

let mock = null

/**
 * 初始化mock拦截器
 * @param {AxiosInstance} axiosInstance - axios实例
 */
export function setupMock(axiosInstance) {
  // 创建Mock适配器实例
  mock = new MockAdapter(axiosInstance, { delayResponse: 200 })

  // 注册所有mock路由
  setupUserMock(mock)
  setupDeviceMock(mock)
  setupRecordingMock(mock)
  setupStatisticsMock(mock)
  setupLogMock(mock)
  setupDashboardMock(mock)
  setupAlgorithmMock(mock)
  setupDetectionMock(mock)
  setupEventMock(mock)
  setupSystemMock(mock)

  // 其他未匹配的请求通过（主要是登录相关）
  mock.onAny().passThrough()

  console.log('Mock 拦截器已启用')
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
 * 用户管理Mock
 */
function setupUserMock(mock) {
  // 获取用户列表
  mock.onGet(/\/api\/users/).reply(config => {
    const params = config.params || {}
    const page = parseInt(params.page) || 1
    const pageSize = parseInt(params.page_size) || 10
    
    let users = userMockData.getAllUsers()
    
    // 搜索过滤
    if (params.username) {
      users = users.filter(user => 
        user.username.toLowerCase().includes(params.username.toLowerCase())
      )
    }
    if (params.role) {
      users = users.filter(user => user.role === params.role)
    }
    if (params.status) {
      users = users.filter(user => user.status === params.status)
    }
    
    // 分页
    const start = (page - 1) * pageSize
    const end = start + pageSize
    const paginatedUsers = users.slice(start, end)
    
    return [200, {
      error: 0,
      body: {
        users: paginatedUsers,
        total: users.length,
        page,
        page_size: pageSize
      },
      message: '获取用户列表成功',
      success: true
    }]
  })

  // 添加用户
  mock.onPost('/api/users').reply(config => {
    const userData = JSON.parse(config.data)
    const newUser = userMockData.addUser(userData)
    
    return [200, {
      error: 0,
      body: {
        user_id: newUser.id
      },
      message: '用户添加成功',
      success: true
    }]
  })

  // 更新用户
  mock.onPut(/\/api\/users\/\d+/).reply(config => {
    const userId = parseInt(config.url.match(/\/api\/users\/(\d+)/)[1])
    const userData = JSON.parse(config.data)
    
    const success = userMockData.updateUser(userId, userData)
    
    return [200, {
      error: success ? 0 : 2001,
      body: {},
      message: success ? '用户更新成功' : '用户不存在',
      success
    }]
  })

  // 删除用户
  mock.onDelete(/\/api\/users\/\d+/).reply(config => {
    const userId = parseInt(config.url.match(/\/api\/users\/(\d+)/)[1])
    const success = userMockData.deleteUser(userId)
    
    return [200, {
      error: success ? 0 : 2001,
      body: {},
      message: success ? '用户删除成功' : '用户不存在',
      success
    }]
  })

  // 重置密码
  mock.onPost(/\/api\/users\/\d+\/reset-password/).reply(config => {
    const userId = parseInt(config.url.match(/\/api\/users\/(\d+)\/reset-password/)[1])
    
    return [200, {
      error: 0,
      body: {},
      message: '密码重置成功',
      success: true
    }]
  })

  // 获取角色列表
  mock.onGet('/api/roles').reply(() => {
    return [200, {
      error: 0,
      body: {
        roles: userMockData.getAllRoles()
      },
      message: '获取角色列表成功',
      success: true
    }]
  })

  // 添加角色
  mock.onPost('/api/roles').reply(config => {
    const roleData = JSON.parse(config.data)
    const newRole = userMockData.addRole(roleData)
    
    return [200, {
      error: 0,
      body: {
        role_id: newRole.id
      },
      message: '角色添加成功',
      success: true
    }]
  })

  // 更新角色
  mock.onPut(/\/api\/roles\/\d+/).reply(config => {
    const roleId = parseInt(config.url.match(/\/api\/roles\/(\d+)/)[1])
    const roleData = JSON.parse(config.data)
    
    const success = userMockData.updateRole(roleId, roleData)
    
    return [200, {
      error: success ? 0 : 2004,
      body: {},
      message: success ? '角色更新成功' : '角色不存在',
      success
    }]
  })

  // 删除角色
  mock.onDelete(/\/api\/roles\/\d+/).reply(config => {
    const roleId = parseInt(config.url.match(/\/api\/roles\/(\d+)/)[1])
    const success = userMockData.deleteRole(roleId)
    
    return [200, {
      error: success ? 0 : 2005,
      body: {},
      message: success ? '角色删除成功' : '默认角色无法删除',
      success
    }]
  })
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
}

/**
 * 录像管理Mock
 */
function setupRecordingMock(mock) {
  // 获取录像列表
  mock.onPost('/api/recordings/list').reply(config => {
    const params = JSON.parse(config.data) || {}
    const page = parseInt(params.page) || 1
    const pageSize = parseInt(params.page_size) || 10
    
    let recordings = recordingMockData.getAllRecordings()
    
    // 过滤
    if (params.device_id) {
      recordings = recordings.filter(recording => recording.device_id === params.device_id)
    }
    if (params.start_time && params.end_time) {
      recordings = recordings.filter(recording => 
        recording.start_time >= params.start_time && recording.start_time <= params.end_time
      )
    }
    if (params.alarm_type) {
      recordings = recordings.filter(recording => recording.alarm_type === params.alarm_type)
    }
    
    // 分页
    const start = (page - 1) * pageSize
    const end = start + pageSize
    const paginatedRecordings = recordings.slice(start, end)
    
    return [200, {
      error: 0,
      body: {
        data: paginatedRecordings,
        total: recordings.length,
        page,
        page_size: pageSize
      },
      message: '获取录像列表成功',
      success: true
    }]
  })

  // 上传录像
  mock.onPost('/api/recordings/upload').reply(() => {
    const newRecording = recordingMockData.addRecording()
    
    return [200, {
      error: 0,
      body: {
        recording_id: newRecording.id
      },
      message: '录像上传成功',
      success: true
    }]
  })

  // 获取录像播放地址
  mock.onGet(/\/api\/recordings\/\d+\/play/).reply(config => {
    const recordingId = parseInt(config.url.match(/\/api\/recordings\/(\d+)\/play/)[1])
    const recording = recordingMockData.getRecording(recordingId)
    
    if (!recording) {
      return [200, {
        error: 5002,
        body: {},
        message: '录像文件不存在',
        success: false
      }]
    }
    
    return [200, {
      error: 0,
      body: {
        recording_id: recordingId,
        play_url: `http://localhost:8080${recording.file_path}`,
        duration: recording.duration,
        resolution: recording.resolution,
        fps: recording.fps,
        has_tracking_box: recording.has_tracking_box
      },
      message: '获取录像播放地址成功',
      success: true
    }]
  })

  // 删除录像
  mock.onDelete(/\/api\/recordings\/\d+/).reply(config => {
    const recordingId = parseInt(config.url.match(/\/api\/recordings\/(\d+)/)[1])
    const success = recordingMockData.deleteRecording(recordingId)
    
    return [200, {
      error: success ? 0 : 5002,
      body: {},
      message: success ? '录像删除成功' : '录像文件不存在',
      success
    }]
  })

  // 获取录像统计
  mock.onGet('/api/recordings/statistics').reply(() => {
    return [200, {
      error: 0,
      body: recordingMockData.getStatistics(),
      message: '获取录像统计成功',
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
    return [200, {
      error: 0,
      body: algorithmMockData.getAllAlgorithms(),
      message: '获取算法列表成功',
      success: true
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
    const { target_cards } = JSON.parse(config.data)
    
    return [200, {
      error: 0,
      body: {
        success_count: target_cards.length,
        failed_count: 0
      },
      message: '批量下发算法成功',
      success: true
    }]
  })

  // 获取下发日志
  mock.onGet('/api/algorithms/dispatch-logs').reply(() => {
    return [200, {
      error: 0,
      body: algorithmMockData.getDispatchLogs(),
      message: '获取下发日志成功',
      success: true
    }]
  })
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
 * 系统管理Mock
 */
function setupSystemMock(mock) {
  // 获取基础配置
  mock.onGet('/api/system/config/basic').reply(() => {
    return [200, {
      error: 0,
      body: systemMockData.getBasicConfig(),
      message: '获取基础配置成功',
      success: true
    }]
  })

  // 更新基础配置
  mock.onPut('/api/system/config/basic').reply(config => {
    const configData = JSON.parse(config.data)
    systemMockData.updateBasicConfig(configData)
    
    return [200, {
      error: 0,
      body: {},
      message: '基础配置更新成功',
      success: true
    }]
  })

  // 获取版本信息
  mock.onGet('/api/system/version').reply(() => {
    return [200, {
      error: 0,
      body: systemMockData.getVersionInfo(),
      message: '获取版本信息成功',
      success: true
    }]
  })

  // 创建版本备份
  mock.onPost('/api/system/version/backup').reply(() => {
    const backup = systemMockData.createBackup()
    
    return [200, {
      error: 0,
      body: {
        backup_id: backup.id
      },
      message: '版本备份创建成功',
      success: true
    }]
  })

  // 获取地图配置
  mock.onGet('/api/system/config/map').reply(() => {
    return [200, {
      error: 0,
      body: systemMockData.getMapConfig(),
      message: '获取地图配置成功',
      success: true
    }]
  })

  // 更新摄像机点位
  mock.onPut('/api/system/config/map/update-positions').reply(config => {
    const { positions } = JSON.parse(config.data)
    systemMockData.updateCameraPositions(positions)
    
    return [200, {
      error: 0,
      body: {},
      message: '摄像机点位更新成功',
      success: true
    }]
  })
}