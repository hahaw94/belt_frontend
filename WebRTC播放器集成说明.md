# WebRTC 播放器集成到实时画面说明

## 修改日期
2025-11-06

## 修改内容

### 1. 修改文件
- `belt/src/views/detection/RealtimeDetection.vue`

### 2. 主要改动

#### 2.1 导入 WebRTC 组件
```javascript
import ZLKWebRTCPlayer from '@/components/ZLKWebRTCPlayer.vue'
```

#### 2.2 模板结构调整

**第一个分屏（n === 1）**：
- 使用 `ZLKWebRTCPlayer` 组件
- 配置输入面板，包含：
  - 服务器地址输入框
  - App 名称输入框
  - Stream 名称输入框
  - 开始播放按钮
- 显示实时统计信息（延迟、帧率、码率）

**其他分屏（n > 1）**：
- 显示占位内容
- 保留分屏结构
- 显示分屏编号
- 移除了所有视频播放器组件

#### 2.3 新增状态管理

```javascript
// WebRTC 配置
const webrtcConfig = ref({
  serverUrl: 'http://127.0.0.1:18081',  // ZLMediaKit 服务器地址
  app: 'live',                           // 应用名
  stream: ''                             // 流名称（需用户输入）
})

// WebRTC 加载状态
const webrtcLoading = ref(false)

// WebRTC 统计信息
const webrtcStats = ref(null)
```

#### 2.4 新增方法

1. **startWebRTC()** - 开始 WebRTC 播放
2. **handleWebRTCPlay()** - 播放成功回调
3. **handleWebRTCPause()** - 播放暂停回调
4. **handleWebRTCError(error)** - 播放错误回调
5. **handleStatsUpdate(stats)** - 统计信息更新回调

#### 2.5 新增样式

```css
/* WebRTC 配置面板 */
.webrtc-config-panel {
  width: 100%;
}

/* 占位分屏样式 */
.placeholder-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(5, 15, 30, 0.5) 0%, rgba(10, 20, 35, 0.6) 100%);
}

.placeholder-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.5);
}
```

## 使用说明

### 1. 启动 ZLMediaKit 服务器

确保 ZLMediaKit 服务器正在运行，且配置正确：
- HTTP API 端口：18081
- WebRTC 端口：8000
- CORS 已启用

### 2. 访问实时检测页面

进入 "实时检测" 页面，第一个分屏会显示 WebRTC 配置面板。

### 3. 配置播放参数

在第一个分屏的配置面板中输入：

- **服务器地址**：`http://127.0.0.1:18081` 或您的 ZLK 服务器地址
- **App**：`live` 或您的应用名
- **Stream**：流名称，例如 `camera001`

### 4. 开始播放

点击 "开始 WebRTC 播放" 按钮，组件会：
1. 连接到 ZLMediaKit 服务器
2. 进行 SDP 协商
3. 建立 WebRTC 连接
4. 开始播放视频
5. 显示实时统计信息

### 5. 查看统计信息

播放时会在视频右上角显示：
- **延迟**（Latency）：毫秒
- **帧率**（FPS）：帧/秒
- **码率**（Bitrate）：千比特/秒

## 功能特点

### ✅ 优势

1. **低延迟**：WebRTC 延迟通常在 200-500ms，远低于 FLV/HLS
2. **实时统计**：显示延迟、帧率、码率等关键指标
3. **状态显示**：实时显示连接状态（连接中、播放中、错误等）
4. **易于配置**：直观的输入面板，无需手动拼接 URL
5. **错误处理**：完善的错误提示和处理机制
6. **保留分屏**：其他分屏保留结构，便于后续扩展

### ⚠️ 注意事项

1. **浏览器支持**：推荐使用 Chrome/Edge 浏览器
2. **网络环境**：WebRTC 需要良好的网络环境
3. **防火墙**：确保 8000 端口（UDP+TCP）未被防火墙阻止
4. **编码格式**：推荐使用 H264 编码，兼容性最好

## 示例配置

### 本地测试
```
服务器: http://127.0.0.1:18081
App: live
Stream: test001
```

### 局域网测试
```
服务器: http://192.168.1.100:18081
App: live
Stream: camera001
```

### 使用后端 API（未来扩展）

可以通过后端 API 获取流信息：

```javascript
// 获取流播放地址
const result = await gb28181API.startWVPPreview({
  deviceId: 'device001',
  channelId: 'channel001'
})

// 解析返回的 WebRTC 地址
if (result.rtc) {
  // 格式: webrtc://server:port/app/stream
  // 自动填充配置
}
```

## 后续优化建议

1. **多路播放**：扩展其他分屏也支持 WebRTC 播放
2. **自动获取流**：集成后端 API，自动获取流信息
3. **流切换**：支持在同一分屏切换不同流
4. **录制功能**：添加 WebRTC 流录制功能
5. **截图功能**：添加视频截图功能
6. **云台控制**：集成云台控制功能

## 故障排查

### 问题 1: 无法连接

**症状**: 一直显示 "连接中..."

**解决方案**:
1. 检查 ZLMediaKit 是否运行
2. 检查服务器地址是否正确
3. 检查防火墙是否开放端口
4. 使用浏览器访问 `http://127.0.0.1:18081/index/api/getServerConfig` 测试

### 问题 2: CORS 错误

**症状**: 浏览器控制台显示 CORS 错误

**解决方案**:
在 ZLMediaKit 的 `config.ini` 中确保：
```ini
[http]
allow_cross_domains=1
```

### 问题 3: 流不存在

**症状**: 提示 "流不存在" 或返回 404

**解决方案**:
1. 确认流确实在推送
2. 使用 HTTP-FLV 测试流是否可用：`http://127.0.0.1:18081/live/camera001.live.flv`
3. 检查 app 和 stream 名称是否正确

## 相关文档

- **WebRTC 组件**: `belt/src/components/ZLKWebRTCPlayer.vue`
- **详细文档**: `belt/src/components/ZLKWebRTCPlayer_使用说明.md`
- **快速参考**: `belt/ZLMediaKit_WebRTC播放快速参考.md`
- **ZLK 配置**: `smart-video-platform/Release/config.ini`

## 技术栈

- **前端框架**: Vue 3 Composition API
- **UI 框架**: Element Plus
- **WebRTC**: 原生 WebRTC API (RTCPeerConnection)
- **流媒体服务器**: ZLMediaKit
- **视频编码**: H264 (推荐)
- **音频编码**: opus (推荐)

