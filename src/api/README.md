# API 使用指南

## 概述

本项目的API调用已经根据后端API文档进行了全面优化和完善，支持完整的智能监控系统功能。

## 核心特性

### 1. 统一的响应格式处理
所有API响应都遵循后端标准格式：
```json
{
  "error": 0,          // 错误码，0表示成功
  "body": {},          // 响应数据
  "message": "success", // 响应消息
  "success": true      // 是否成功
}
```

### 2. 完善的错误处理
- 自动处理所有标准错误码（1001-9999）
- 智能错误消息提示
- 自动处理认证失败和权限不足

### 3. WebSocket实时通信
支持以下实时数据推送：
- 实时告警推送
- 设备状态变化
- 即时告警通知

## API 模块说明

### 认证模块 (authApi)
```javascript
import { authApi } from '@/api/auth'

// 用户登录
const loginResult = await authApi.login({
  username: 'admin',
  password: 'admin123'
})

// 刷新token
await authApi.refreshToken()
```

### 设备管理 (deviceApi)
```javascript
import { deviceApi } from '@/api/device'

// 获取设备列表
const devices = await deviceApi.getDeviceList({
  page: 1,
  page_size: 10,
  status: '在线'
})

// 添加设备
await deviceApi.addDevice({
  device_name: '前门摄像头',
  device_sn: 'SN202401001',
  ip_address: '192.168.1.101'
})
```

### 录像管理 (recordingApi)
```javascript
import { recordingApi } from '@/api/recording'

// 上传录像
await recordingApi.uploadRecording(deviceId, file)

// 批量上传
await recordingApi.batchUploadRecordings(deviceId, files)

// 获取录像列表
const recordings = await recordingApi.getRecordingList({
  page: 1,
  page_size: 20,
  device_id: 1
})
```

### 实时检测 (detectionApi)
```javascript
import { detectionApi } from '@/api/detection'

// 开始实时检测
await detectionApi.startDetection({
  device_ids: [1, 2, 3],
  algorithm_type: '人脸识别'
})

// 获取实时状态
const status = await detectionApi.getRealTimeStatus()

// PTZ控制
await detectionApi.ptzControl(deviceId, {
  command: 'move',
  direction: 'up',
  speed: 5
})
```

### 算法管理 (algorithmApi)
```javascript
import { algorithmApi } from '@/api/algorithm'

// 上传算法
await algorithmApi.uploadAlgorithm(file, {
  name: 'CoreAlgo_01',
  version: 'V1.2.5'
})

// 下发算法
await algorithmApi.dispatchAlgorithm({
  algorithm_version_id: 1,
  target_card: 'card001'
})
```

### 事件中心 (eventApi)
```javascript
import { eventApi } from '@/api/event'

// 获取报警列表
const alarms = await eventApi.getAlarmList({
  page: 1,
  page_size: 10,
  alarm_type: '异常行为'
})

// 处理报警
await eventApi.processAlarm(alarmId, {
  process_note: '已确认处理'
})
```

### 日志管理 (logApi)
```javascript
import { logApi } from '@/api/log'

// 获取系统日志
const logs = await logApi.getSystemLogs({
  page: 1,
  log_level: 'ERROR'
})

// 获取日志统计
const stats = await logApi.getLogStatistics()

// 清理旧日志
await logApi.cleanOldLogs({
  before_date: '2024-01-01',
  confirm: true
})
```

## WebSocket 使用示例

### 连接实时告警
```javascript
import { websocketApi } from '@/api/websocket'

// 连接告警推送
websocketApi.connectAlerts(
  userId,
  (alertData) => {
    console.log('收到告警:', alertData)
    // 处理告警数据
  },
  (error) => {
    console.error('WebSocket错误:', error)
  }
)

// 断开连接
websocketApi.disconnect('/ws/alerts/1')
```

### 连接设备状态
```javascript
// 连接设备状态推送
websocketApi.connectDeviceStatus(
  userId,
  (deviceStatus) => {
    console.log('设备状态变化:', deviceStatus)
    // 更新设备状态UI
  }
)
```

## 错误处理

### 全局错误处理
API已经内置了完善的错误处理机制，会自动：
- 显示错误消息
- 处理认证失败（自动跳转登录）
- 处理权限不足
- 处理网络错误

### 自定义错误处理
```javascript
try {
  const result = await deviceApi.getDeviceList()
  // 处理成功响应
} catch (error) {
  // 自定义错误处理
  console.error('获取设备列表失败:', error.message)
}
```

## 文件上传

### 单文件上传
```javascript
// 录像文件上传
const file = document.getElementById('fileInput').files[0]
await recordingApi.uploadRecording(deviceId, file)
```

### 多文件上传
```javascript
// 批量录像上传
const files = Array.from(document.getElementById('fileInput').files)
await recordingApi.batchUploadRecordings(deviceId, files)
```

## 文件下载

### 录像下载
```javascript
// 下载录像文件
const blob = await recordingApi.downloadRecording(recordingId)
// 浏览器会自动处理下载
```

### 导出数据
```javascript
// 导出设备列表
const excelBlob = await deviceApi.exportDevices()
// 导出日志
const logBlob = await logApi.exportLogs({
  start_time: '2024-01-01 00:00:00',
  end_time: '2024-01-31 23:59:59'
})
```

## 注意事项

1. **认证令牌**: 所有API调用都会自动添加Bearer token，无需手动处理
2. **错误处理**: 大部分错误会自动显示提示消息，特殊情况可自定义处理
3. **WebSocket连接**: 页面销毁时记得断开WebSocket连接
4. **文件大小**: 上传文件前注意检查文件大小限制
5. **网络超时**: 默认请求超时时间为10秒

## 环境配置

在 `.env` 文件中配置API地址：
```env
VUE_APP_API_BASE_URL=http://localhost:8080
VUE_APP_WS_BASE_URL=ws://localhost:8080
```