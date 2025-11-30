# 实时告警通知三组件联动实现

## 概述

已成功实现三个告警组件与后端WebSocket API的联动，统一管理实时告警通知。

## 三个组件

### 1. 右下角冒泡通知 (AlertToast.vue)
- **位置**: `src/components/AlertToast.vue`
- **显示位置**: 屏幕右下角
- **功能**: 
  - 显示最新的3条活动告警
  - 5秒后自动消失
  - 可点击跳转到告警展示页面
  - 可手动关闭
- **数据源**: `alertStore.activeAlerts`

### 2. 右上角历史通知 (AlertNotification.vue)
- **位置**: `src/components/AlertNotification.vue`
- **显示位置**: 页面右上角导航栏
- **功能**:
  - 铃铛图标显示未读告警数量
  - 下拉菜单展示历史记录（最近50条）
  - 支持标记已读、全部已读、清空历史
  - 分页显示（每页10条）
  - 点击告警项跳转到告警展示页面
- **数据源**: `alertStore.alertHistory`

### 3. 实时告警弹窗 (WarningPush.vue)
- **位置**: `src/views/event/WarningPush.vue`
- **显示位置**: 预警推送管理页面的弹窗
- **功能**:
  - 显示WebSocket连接状态
  - 手动连接/断开WebSocket
  - 实时消息列表（最近100条）
  - 卡片式展示每条告警
  - 可单独关闭每条消息
  - 可清空所有消息
- **数据源**: `alertStore.realtimeMessages`

## 核心实现

### alertStore (src/stores/alertStore.js)

统一的告警状态管理中心：

```javascript
state: {
  activeAlerts: [],        // 右下角冒泡显示的活动告警
  alertHistory: [],        // 右上角历史记录
  realtimeMessages: [],    // WarningPush弹窗的实时消息
  wsConnected: false,      // WebSocket连接状态
  wsStatus: '未连接'       // WebSocket状态文本
}
```

**关键方法**:

1. **initWebSocket()** - 初始化并连接WebSocket
   - 注册消息处理器和状态处理器
   - 自动连接到后端WebSocket服务
   - 在App.vue中监听登录状态自动调用

2. **handleWebSocketMessage(message)** - 处理WebSocket消息
   - 解析后端告警数据
   - 映射后端字段到前端格式
   - 同时更新三个数据源：
     * `realtimeMessages` - 添加到实时消息列表
     * `activeAlerts` - 添加到活动告警（触发右下角冒泡）
     * `alertHistory` - 添加到历史记录（更新右上角铃铛）

3. **disconnectWebSocket()** - 断开WebSocket连接
   - 清理消息处理器
   - 关闭WebSocket连接

### App.vue 集成

在应用根组件中监听登录状态，自动管理WebSocket连接：

```javascript
// 监听登录状态
watch(() => authStore.isAuthenticated, (isAuthenticated) => {
  if (isAuthenticated) {
    alertStore.initWebSocket()  // 登录后自动连接
  } else {
    alertStore.disconnectWebSocket()  // 登出后断开连接
  }
}, { immediate: true })
```

## 数据流

```
后端WebSocket推送告警
        ↓
alertStore.handleWebSocketMessage()
        ↓
    解析并映射数据
        ↓
        ├─→ realtimeMessages.unshift()  → WarningPush弹窗显示
        │
        └─→ addAlert()
                ↓
                ├─→ activeAlerts.push()  → 右下角冒泡显示
                │                           ↓
                │                      5秒后自动移除
                │
                └─→ alertHistory.unshift() → 右上角历史记录
                                              ↓
                                         标记已读/清空
```

## 后端数据格式

### 告警消息格式
```json
{
  "type": "alarm",
  "data": {
    "alarm_id": "string",
    "alarm_type_name": "皮带撕裂",
    "alarm_level": 3,
    "camera_name": "CAMERA-004",
    "message": "检测到皮带撕裂告警",
    "location": "string",
    "alarm_time": "2024-11-30T10:00:00",
    "snapshot_url": "http://..."
  }
}
```

### 系统消息格式
```json
{
  "type": "info",
  "text": "WebSocket连接成功"
}
```

## 字段映射

后端字段 → 前端字段：
- `alarm_type_name` → `type_name`
- `alarm_level` → `level`
- `camera_name` → `device_name`
- `message` → `content`

## 告警级别映射

```javascript
level >= 4  → 'error'   (红色)
level >= 3  → 'warning' (黄色)
level >= 2  → 'info'    (青色)
level < 2   → 'success' (绿色)
```

## 使用说明

### 1. 用户登录后
- WebSocket自动连接
- 开始接收实时告警
- 三个组件同步显示告警信息

### 2. 收到告警时
- **右下角**: 弹出冒泡通知，5秒后自动消失
- **右上角**: 铃铛图标显示未读数量，摇铃动画
- **WarningPush**: 如果弹窗打开，实时显示新告警卡片

### 3. 用户交互
- 点击右下角冒泡 → 跳转到告警展示页面
- 点击右上角铃铛 → 查看历史记录
- 点击历史记录项 → 标记已读并跳转
- 在WarningPush中 → 查看详细实时消息流

### 4. 用户登出后
- WebSocket自动断开
- 清空所有告警数据

## 优势

1. **统一管理**: 所有告警数据由alertStore统一管理
2. **自动同步**: 一次WebSocket消息，三个组件同时更新
3. **状态共享**: WebSocket连接状态全局共享
4. **生命周期管理**: 跟随登录状态自动连接/断开
5. **数据持久化**: 历史记录保留最近1000条
6. **性能优化**: 限制各列表的最大长度，避免内存溢出

## 配置

### WebSocket URL
```javascript
// 开发环境: ws://localhost:8080/api/v1/ws/alarms?token=xxx
// 生产环境: wss://yourdomain.com/api/v1/ws/alarms?token=xxx
```

### 重连策略
- 最大重连次数: 5次
- 重连间隔: 5秒
- 非正常断开时自动重连

## 测试

1. 登录系统
2. 打开浏览器控制台查看WebSocket连接日志
3. 后端推送测试告警
4. 观察三个组件是否同步显示
5. 测试各种交互功能

## 注意事项

1. 确保后端WebSocket服务正常运行
2. Token需要有效，否则无法连接
3. 网络断开会自动尝试重连
4. 历史记录会保存在内存中，刷新页面会清空
