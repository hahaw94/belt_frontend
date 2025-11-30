# 告警图片加载问题修复

## 问题描述

告警通知中的图片无法加载，显示为损坏图标。

## 问题原因

1. **相对路径问题** - 后端返回的是相对路径 `/api/v1/alarms/33/snapshot`，需要转换为完整URL
2. **认证问题** - 图片接口需要token认证，返回401 Unauthorized错误
3. **跨域问题** - 前端运行在3000端口，后端在8080端口

## 后端实际数据格式

```json
{
  "type": "alarm",
  "data": {
    "alarm_id": 33,
    "alarm_type": 2,
    "alarm_type_name": "皮带撕裂",
    "alarm_level": 3,
    "camera_name": "CAMERA-004",
    "location": "",
    "alarm_time": "2025-11-26T15:30:00+08:00",
    "snapshot_url": "/api/v1/alarms/33/snapshot",  // 相对路径，需要认证
    "message": "检测到皮带撕裂告警 - CAMERA-004"
  }
}
```

**注意**: 
- `snapshot_url` 是相对路径，不是完整URL
- 图片接口需要token认证
- 可能还会有 `snapshot_base64` 字段（Base64编码的图片）

## 解决方案

在 `alertStore.js` 的 `handleWebSocketMessage` 方法中：

1. **保存两种图片格式**
   ```javascript
   const mappedAlarm = {
     // ... 其他字段
     snapshot_url: alarmData.snapshot_url,
     snapshot_base64: alarmData.snapshot_base64
   }
   ```

2. **智能处理图片URL**
   ```javascript
   // 处理图片：优先使用Base64，其次使用URL
   let imageUrl = '/api/placeholder/300/200?text=告警'
   if (alarmData.snapshot_base64) {
     // Base64图片需要添加data URI前缀
     imageUrl = `data:image/jpeg;base64,${alarmData.snapshot_base64}`
   } else if (alarmData.snapshot_url) {
     // 处理相对路径URL，添加token参数
     const token = localStorage.getItem('token')
     const baseUrl = process.env.NODE_ENV === 'development' 
       ? 'http://localhost:8080' 
       : window.location.origin
     
     // 如果是相对路径，转换为完整URL并添加token
     if (alarmData.snapshot_url.startsWith('/')) {
       imageUrl = `${baseUrl}${alarmData.snapshot_url}?token=${token}`
     } else {
       imageUrl = alarmData.snapshot_url
     }
   }
   ```

3. **使用处理后的图片URL**
   ```javascript
   this.addAlert({
     type: alertType,
     message: `${alarmData.camera_name || '设备'}: ${alarmData.message}`,
     image: imageUrl,  // 使用处理后的图片URL
     rawData: mappedAlarm
   })
   ```

## Base64图片格式说明

Base64图片在HTML中使用时需要添加 Data URI 前缀：

```
data:image/jpeg;base64,<Base64编码数据>
```

- `data:` - Data URI协议
- `image/jpeg` - MIME类型（根据实际图片格式可能是 jpeg, png, gif 等）
- `base64,` - 编码方式
- 后面跟Base64编码的图片数据

## 优先级策略

1. **优先使用Base64** - 如果后端提供了Base64数据，直接使用（无需额外请求）
2. **其次使用URL** - 如果没有Base64但有URL，使用URL加载
   - 自动处理相对路径，转换为完整URL
   - 自动添加token参数进行认证
   - 根据环境自动选择后端地址（开发环境: localhost:8080，生产环境: 当前域名）
3. **默认占位图** - 如果两者都没有，显示默认占位图

## URL处理逻辑

### 相对路径转换
```javascript
// 输入: /api/v1/alarms/33/snapshot
// 开发环境输出: http://localhost:8080/api/v1/alarms/33/snapshot?token=xxx
// 生产环境输出: https://yourdomain.com/api/v1/alarms/33/snapshot?token=xxx
```

### Token认证
- 从 `localStorage` 获取token
- 作为URL参数传递: `?token=xxx`
- 后端通过token验证用户身份

## 优势

- **减少网络请求** - Base64图片直接嵌入，无需额外HTTP请求
- **即时显示** - 图片随告警数据一起到达，立即显示
- **兼容性好** - 同时支持Base64和URL两种方式
- **降级处理** - 有默认占位图作为后备方案

## 注意事项

1. **Base64数据大小** - Base64编码会增加约33%的数据量
2. **图片格式** - 确保MIME类型正确（jpeg/png/gif等）
3. **内存占用** - 大量Base64图片会占用较多内存
4. **缓存策略** - Base64图片无法被浏览器缓存
5. **跨域问题** - 开发环境需要配置代理或CORS
6. **Token安全** - Token通过URL参数传递，注意HTTPS加密
7. **图片大小** - 建议后端压缩图片，减少传输量

## 错误排查

### 401 Unauthorized
- **原因**: Token无效或过期
- **解决**: 检查localStorage中的token是否存在且有效

### 图片无法显示
1. 检查控制台Network标签，查看图片请求状态
2. 检查图片URL是否正确拼接
3. 检查token是否正确传递
4. 检查后端CORS配置

### 控制台日志
```
=== WebSocket消息 ===
消息类型: alarm
告警数据字段: ['alarm_id', 'alarm_type', ...]
snapshot_base64存在: false
snapshot_url存在: true
使用URL图片: http://localhost:8080/api/v1/alarms/33/snapshot?token=xxx
```

## 测试

使用 `test_alarm.json` 中的数据测试：
- 包含完整的Base64图片数据
- 图片应该能够正常显示在：
  - 右下角冒泡通知
  - 右上角历史记录
  - WarningPush实时告警弹窗
