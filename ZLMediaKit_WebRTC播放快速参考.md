# ZLMediaKit WebRTC 播放快速参考

## 📋 已完成的工作

✅ 创建了 `ZLKWebRTCPlayer.vue` WebRTC 播放组件  
✅ 创建了完整的使用说明文档  
✅ 组件已通过 Linter 检查，无错误

## 🚀 快速开始

### 1. 最简单的用法

```vue
<template>
  <ZLKWebRTCPlayer
    server-url="http://127.0.0.1:18081"
    app="live"
    stream="your_stream_name"
  />
</template>

<script setup>
import ZLKWebRTCPlayer from '@/components/ZLKWebRTCPlayer.vue'
</script>
```

### 2. 根据您的 config.ini 配置

根据您提供的 `smart-video-platform/Release/config.ini`：

```vue
<ZLKWebRTCPlayer
  server-url="http://127.0.0.1:18081"
  app="live"
  stream="camera001"
  video-codec="H264"
  audio-codec="opus"
  :auto-play="true"
  :show-stats="true"
/>
```

**配置对应关系**：
- `port=18081` → `server-url="http://127.0.0.1:18081"`
- `preferredCodecV=H264,H265,AV1,VP9,VP8` → `video-codec="H264"`
- `preferredCodecA=PCMA,PCMU,opus,mpeg4-generic` → `audio-codec="opus"`

### 3. 在 RealtimeDetection.vue 中集成

#### 步骤 1: 导入组件

```javascript
import ZLKWebRTCPlayer from '@/components/ZLKWebRTCPlayer.vue'
```

#### 步骤 2: 添加 WebRTC 流类型检测

在 `detectStreamType` 函数中添加：

```javascript
const detectStreamType = (url) => {
  const urlLower = url.toLowerCase()
  
  // 添加 WebRTC 检测
  if (urlLower.startsWith('webrtc://') || urlLower.startsWith('webrtcs://')) {
    return 'webrtc'
  }
  
  if (urlLower.startsWith('ws://') && urlLower.includes('.flv')) {
    return 'ws-flv'
  }
  // ... 其他检测逻辑
}
```

#### 步骤 3: 添加 WebRTC URL 格式

WebRTC 流地址格式：
```
webrtc://127.0.0.1:18081/live/camera001
```

## 🔧 与后端 API 集成

### 方法 1: 使用现有的 WVP API

```javascript
import { gb28181API } from '@/api/system'

// 开始预览
const result = await gb28181API.startWVPPreview({
  deviceId: 'device_id',
  channelId: 'channel_id'
})

// 如果后端返回 WebRTC 地址
if (result.rtc) {
  // 使用 WebRTC 播放器
  // rtc 格式可能是：webrtc://127.0.0.1:18081/live/stream_id
}
```

### 方法 2: 直接使用流信息

如果您已知流的 app 和 stream 名称：

```vue
<ZLKWebRTCPlayer
  :server-url="zlkServerUrl"
  :app="streamApp"
  :stream="streamId"
/>
```

## 📊 组件 Props 速查表

| 属性 | 类型 | 默认值 | 必填 | 说明 |
|------|------|--------|------|------|
| server-url | String | http://127.0.0.1:18081 | ❌ | ZLK 服务器地址 |
| app | String | live | ❌ | 应用名 |
| stream | String | - | ✅ | 流名称 |
| auto-play | Boolean | true | ❌ | 自动播放 |
| show-controls | Boolean | false | ❌ | 显示控制条 |
| show-status | Boolean | true | ❌ | 显示状态 |
| show-stats | Boolean | false | ❌ | 显示统计 |
| video-codec | String | H264 | ❌ | 视频编码 |
| audio-codec | String | opus | ❌ | 音频编码 |

## 🎯 常见场景

### 场景 1: 单个视频播放

```vue
<template>
  <div class="player-container">
    <ZLKWebRTCPlayer
      ref="playerRef"
      server-url="http://127.0.0.1:18081"
      app="live"
      stream="camera001"
      :auto-play="false"
      :show-controls="true"
      :show-stats="true"
      @error="handleError"
    />
    
    <el-button @click="playerRef?.play()">播放</el-button>
    <el-button @click="playerRef?.stop()">停止</el-button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import ZLKWebRTCPlayer from '@/components/ZLKWebRTCPlayer.vue'

const playerRef = ref(null)

const handleError = (error) => {
  console.error('播放错误:', error)
}
</script>
```

### 场景 2: 多路视频（4 宫格）

```vue
<template>
  <div class="grid-container">
    <div v-for="(camera, index) in cameras" :key="index" class="grid-item">
      <ZLKWebRTCPlayer
        server-url="http://127.0.0.1:18081"
        app="live"
        :stream="camera.stream"
        :auto-play="true"
        :show-stats="false"
      />
    </div>
  </div>
</template>

<script setup>
import ZLKWebRTCPlayer from '@/components/ZLKWebRTCPlayer.vue'

const cameras = [
  { stream: 'camera001' },
  { stream: 'camera002' },
  { stream: 'camera003' },
  { stream: 'camera004' }
]
</script>

<style scoped>
.grid-container {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(2, 1fr);
  gap: 4px;
  width: 100%;
  height: 100%;
}

.grid-item {
  background: #000;
}
</style>
```

### 场景 3: 动态切换流

```vue
<template>
  <div>
    <ZLKWebRTCPlayer
      server-url="http://127.0.0.1:18081"
      app="live"
      :stream="currentStream"
      :auto-play="true"
    />
    
    <el-select v-model="currentStream">
      <el-option 
        v-for="cam in cameraList" 
        :key="cam.id"
        :label="cam.name"
        :value="cam.stream"
      />
    </el-select>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import ZLKWebRTCPlayer from '@/components/ZLKWebRTCPlayer.vue'

const currentStream = ref('camera001')
const cameraList = [
  { id: 1, name: '摄像头1', stream: 'camera001' },
  { id: 2, name: '摄像头2', stream: 'camera002' }
]

// 组件会自动监听 stream 变化并重新播放
</script>
```

## ⚙️ ZLMediaKit 配置检查清单

- [ ] HTTP API 端口开放 (默认 18081)
- [ ] WebRTC 端口开放 (默认 8000 UDP/TCP)
- [ ] CORS 已启用 (`allow_cross_domains=1`)
- [ ] 视频编码已配置 (`preferredCodecV=H264,H265...`)
- [ ] 音频编码已配置 (`preferredCodecA=PCMA,PCMU,opus...`)

### 测试 ZLMediaKit 是否正常

```bash
# 1. 测试 API 是否可访问
curl http://127.0.0.1:18081/index/api/getServerConfig

# 2. 查看在线流列表
curl http://127.0.0.1:18081/index/api/getMediaList

# 3. 测试特定流是否在线
curl "http://127.0.0.1:18081/index/api/isMediaOnline?schema=rtmp&vhost=__defaultVhost__&app=live&stream=camera001"
```

## 🐛 常见问题

### 1. 无法播放 - CORS 错误

**现象**: 浏览器控制台显示 CORS 错误

**解决**: 在 `config.ini` 中设置：
```ini
[http]
allow_cross_domains=1
```

然后重启 ZLMediaKit。

### 2. 无法播放 - 连接超时

**现象**: WebRTC 连接一直在 "connecting" 状态

**检查**:
1. 防火墙是否开放 8000 端口（UDP + TCP）
2. ZLMediaKit 是否正在运行
3. 流是否真的存在

**测试**:
```bash
# 先用 HTTP-FLV 测试流是否可播放
http://127.0.0.1:18081/live/camera001.live.flv
```

### 3. 延迟较高

**优化建议**:
1. 使用 H264 编码（延迟最低）
2. 降低视频分辨率
3. 使用有线网络
4. 减少同时播放的流数量

### 4. 编码不支持

**现象**: 视频无法解码

**解决**: 
- Chrome/Edge: 支持 H264, VP8, VP9
- Safari: 主要支持 H264
- Firefox: 支持 H264, VP8, VP9

**建议**: 统一使用 H264 编码，兼容性最好。

## 📝 WebRTC URL 格式说明

### 标准格式
```
webrtc://[server]:[port]/[app]/[stream]
```

### 示例
```
webrtc://127.0.0.1:18081/live/camera001
webrtc://192.168.1.100:18081/rtp/34020000001320000001
webrtcs://example.com:443/live/stream1  (HTTPS/TLS)
```

### 组件内部处理
组件会自动：
1. 解析服务器地址
2. 构造 WebRTC API 请求
3. 处理 SDP 协商
4. 建立 WebRTC 连接

## 🔄 从 FLV 迁移到 WebRTC

### 对比

| 特性 | FLV (mpegts.js/flv.js) | WebRTC |
|------|------------------------|--------|
| 延迟 | 1-3 秒 | 200-500 毫秒 |
| 浏览器支持 | 需 MSE 支持 | 原生支持 |
| 穿透性 | HTTP/WebSocket | UDP + STUN/TURN |
| CPU 占用 | 较高 | 中等 |
| 适用场景 | 监控、直播 | 实时互动 |

### 何时使用 WebRTC？

✅ **推荐使用**:
- 需要低延迟（< 1秒）
- 实时监控
- 远程控制配合
- 双向音视频

❌ **不推荐**:
- 对延迟不敏感
- 需要长时间录制
- 网络环境复杂（NAT穿透困难）

## 📚 相关文件

- **组件**: `belt/src/components/ZLKWebRTCPlayer.vue`
- **文档**: `belt/src/components/ZLKWebRTCPlayer_使用说明.md`
- **ZLK 配置**: `smart-video-platform/Release/config.ini`
- **API 接口**: `belt/src/api/system.js` (gb28181API)

## 💡 下一步建议

1. **测试组件**: 在本地环境测试 WebRTC 播放
2. **集成到现有页面**: 在 `RealtimeDetection.vue` 中添加 WebRTC 支持
3. **后端对接**: 确保后端 API 返回 WebRTC 播放地址
4. **性能优化**: 根据实际情况调整编码参数

## 🆘 需要帮助？

查看详细文档: `belt/src/components/ZLKWebRTCPlayer_使用说明.md`

