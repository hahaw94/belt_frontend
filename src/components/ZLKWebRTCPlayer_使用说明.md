# ZLMediaKit WebRTC 播放器使用说明

## 概述

`ZLKWebRTCPlayer.vue` 是专为 ZLMediaKit 流媒体服务器设计的 WebRTC 播放组件，支持低延迟实时视频流播放。

## ZLMediaKit 配置要求

### 1. config.ini 配置检查

确保 ZLMediaKit 的 `config.ini` 文件中 WebRTC 相关配置正确：

```ini
[rtc]
port=8000                    # WebRTC 端口
tcpPort=8000                # WebRTC TCP 端口
preferredCodecV=H264,H265,AV1,VP9,VP8  # 视频编解码器
preferredCodecA=PCMA,PCMU,opus,mpeg4-generic  # 音频编解码器
timeoutSec=15               # 超时时间
```

### 2. HTTP API 端口

确认 HTTP API 端口（默认 18081）：

```ini
[http]
port=18081
allow_cross_domains=1       # 允许跨域（重要！）
```

### 3. CORS 配置

如果前端和 ZLMediaKit 不在同一域，必须配置 CORS：

```ini
[http]
allow_cross_domains=1
```

## 基础用法

### 1. 在 Vue 组件中使用

```vue
<template>
  <div class="video-container">
    <ZLKWebRTCPlayer
      server-url="http://127.0.0.1:18081"
      app="live"
      stream="camera001"
      :auto-play="true"
      :show-controls="true"
      :show-status="true"
      :show-stats="true"
      @play="handlePlay"
      @pause="handlePause"
      @error="handleError"
      @stats-update="handleStatsUpdate"
    />
  </div>
</template>

<script setup>
import ZLKWebRTCPlayer from '@/components/ZLKWebRTCPlayer.vue'

const handlePlay = () => {
  console.log('播放开始')
}

const handlePause = () => {
  console.log('播放停止')
}

const handleError = (error) => {
  console.error('播放错误:', error)
}

const handleStatsUpdate = (stats) => {
  console.log('统计信息:', stats)
}
</script>

<style scoped>
.video-container {
  width: 800px;
  height: 450px;
}
</style>
```

### 2. 使用 ref 控制播放

```vue
<template>
  <div>
    <ZLKWebRTCPlayer
      ref="playerRef"
      server-url="http://127.0.0.1:18081"
      app="live"
      stream="camera001"
      :auto-play="false"
    />
    
    <div class="controls">
      <el-button @click="handlePlay">播放</el-button>
      <el-button @click="handleStop">停止</el-button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import ZLKWebRTCPlayer from '@/components/ZLKWebRTCPlayer.vue'

const playerRef = ref(null)

const handlePlay = () => {
  playerRef.value?.play()
}

const handleStop = () => {
  playerRef.value?.stop()
}
</script>
```

## Props 属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `serverUrl` | String | `http://127.0.0.1:18081` | ZLMediaKit 服务器地址 |
| `app` | String | `live` | 流应用名（application） |
| `stream` | String | 必填 | 流ID（stream name） |
| `autoPlay` | Boolean | `true` | 是否自动播放 |
| `showControls` | Boolean | `false` | 是否显示原生播放控制条 |
| `showStatus` | Boolean | `true` | 是否显示播放状态指示器 |
| `showStats` | Boolean | `false` | 是否显示统计信息（延迟、帧率、码率） |
| `useHttps` | Boolean | `false` | 是否使用 HTTPS（需要 ZLMediaKit 配置 SSL） |
| `videoCodec` | String | `H264` | 视频编解码器偏好 |
| `audioCodec` | String | `opus` | 音频编解码器偏好 |

### 支持的编解码器

**视频编解码器**（根据 config.ini）：
- `H264` - 推荐，兼容性最好
- `H265` - 需要浏览器支持
- `AV1` - 新一代编码
- `VP9` - Google 编码
- `VP8` - Google 旧编码

**音频编解码器**（根据 config.ini）：
- `opus` - 推荐，音质好延迟低
- `PCMA` - G.711 A-law
- `PCMU` - G.711 μ-law
- `mpeg4-generic` - AAC

## 事件

| 事件名 | 参数 | 说明 |
|--------|------|------|
| `play` | 无 | 播放开始时触发 |
| `pause` | 无 | 播放停止时触发 |
| `error` | `(errorMessage: string)` | 播放错误时触发 |
| `stats-update` | `(stats: object)` | 统计信息更新时触发（每秒） |

### stats 对象结构

```javascript
{
  latency: 120,    // 延迟（毫秒）
  fps: 25,         // 帧率
  bitrate: 2048    // 码率（kbps）
}
```

## 方法

通过 `ref` 调用组件方法：

| 方法名 | 参数 | 返回值 | 说明 |
|--------|------|--------|------|
| `play()` | 无 | `Promise<void>` | 开始播放 |
| `stop()` | 无 | `void` | 停止播放 |
| `getStatus()` | 无 | `string` | 获取当前状态 |

### 状态值

- `idle` - 未播放
- `connecting` - 连接中
- `playing` - 播放中
- `error` - 错误
- `stopped` - 已停止

## 集成到 RealtimeDetection.vue

### 方式 1: 修改现有播放逻辑

在 `belt/src/views/detection/RealtimeDetection.vue` 中添加 WebRTC 支持：

```vue
<script setup>
// 在 detectStreamType 函数中添加 WebRTC 检测
const detectStreamType = (url) => {
  const urlLower = url.toLowerCase()
  
  if (urlLower.startsWith('webrtc://')) {
    return 'webrtc'
  }
  if (urlLower.startsWith('ws://') && urlLower.includes('.flv')) {
    return 'ws-flv'
  }
  // ... 其他检测逻辑
}

// 添加 loadWebRTC 函数
const loadWebRTC = async (url, index) => {
  // 解析 WebRTC URL
  // 格式: webrtc://server:port/app/stream
  const match = url.match(/webrtc:\/\/([^/]+)\/([^/]+)\/(.+)/)
  
  if (!match) {
    throw new Error('WebRTC URL 格式错误')
  }
  
  const [, serverAddr, app, stream] = match
  const serverUrl = `http://${serverAddr}`
  
  // 使用 WebRTC 播放器组件
  // 这里需要动态创建组件或改用组件方式
}

// 在 handlePlayStream 中添加 WebRTC 分支
const handlePlayStream = async (cellIndex) => {
  // ...
  
  const streamType = detectStreamType(state.streamUrl)
  
  switch (streamType) {
    case 'webrtc':
      await loadWebRTC(state.streamUrl, cellIndex)
      break
    case 'ws-flv':
      await loadFLV(state.streamUrl, cellIndex, true)
      break
    // ...
  }
}
</script>
```

### 方式 2: 创建独立的 WebRTC 播放页面

创建专门的 WebRTC 播放页面，使用 `ZLKWebRTCPlayer` 组件。

## 获取流地址

### 方法 1: 使用后端 API

通过后端 API 获取 WebRTC 播放地址：

```javascript
import { gb28181API } from '@/api/system'

// 开始播放，获取流ID
const result = await gb28181API.startPlay(channelId, {
  // 可选参数
})

const streamId = result.stream_id

// 获取播放地址（包含 WebRTC 地址）
const urls = await gb28181API.getPlayUrls(streamId)

// urls 结构：
// {
//   flv: "http://...",
//   ws_flv: "ws://...",
//   hls: "http://...",
//   rtc: "webrtc://...",  // WebRTC 播放地址
//   rtcs: "webrtcs://..." // WebRTC over TLS
// }
```

### 方法 2: 直接构造地址

如果知道流信息，可以直接使用：

```javascript
// 组件 props
const serverUrl = 'http://127.0.0.1:18081'
const app = 'live'
const stream = 'camera001'
```

## 故障排查

### 1. 无法播放

**检查项**：
- ZLMediaKit 是否正在运行
- HTTP API 端口 (18081) 是否可访问
- WebRTC 端口 (8000) 是否开放
- 流是否存在（使用 HTTP-FLV 测试）
- 浏览器控制台是否有 CORS 错误

**解决方案**：
```bash
# 测试 ZLMediaKit API
curl http://127.0.0.1:18081/index/api/getMediaList

# 测试流是否存在
curl http://127.0.0.1:18081/index/api/isMediaOnline?schema=rtmp&vhost=__defaultVhost__&app=live&stream=camera001
```

### 2. CORS 错误

在 `config.ini` 中确保：

```ini
[http]
allow_cross_domains=1
```

重启 ZLMediaKit 后生效。

### 3. WebRTC 连接失败

**常见原因**：
- 防火墙阻止 UDP 端口 (8000)
- NAT 穿透问题
- ICE 候选交换失败

**解决方案**：
```ini
[rtc]
externIP=<公网IP>  # 如果需要外网访问
port=8000
```

### 4. 延迟过高

**优化建议**：
- 使用 H264 编码（延迟最低）
- 降低视频分辨率和码率
- 减少 GOP（关键帧间隔）

## 高级用法

### 1. 多路播放（16 宫格）

```vue
<template>
  <div class="video-grid grid-16">
    <div 
      v-for="n in 16" 
      :key="n" 
      class="video-cell"
    >
      <ZLKWebRTCPlayer
        v-if="streams[n - 1]"
        :server-url="serverUrl"
        :app="streams[n - 1].app"
        :stream="streams[n - 1].stream"
        :auto-play="true"
        :show-controls="false"
        :show-status="true"
        :show-stats="false"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import ZLKWebRTCPlayer from '@/components/ZLKWebRTCPlayer.vue'

const serverUrl = 'http://127.0.0.1:18081'

const streams = ref([
  { app: 'live', stream: 'camera001' },
  { app: 'live', stream: 'camera002' },
  // ... 更多流
])
</script>

<style scoped>
.video-grid {
  display: grid;
  gap: 2px;
  width: 100%;
  height: 100%;
  background: #000;
}

.grid-16 {
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: repeat(4, 1fr);
}

.video-cell {
  position: relative;
  background: #1a1a1a;
}
</style>
```

### 2. 结合后端 API 动态获取流

```vue
<script setup>
import { ref, onMounted } from 'vue'
import { gb28181API } from '@/api/system'
import ZLKWebRTCPlayer from '@/components/ZLKWebRTCPlayer.vue'

const playerConfig = ref({
  serverUrl: '',
  app: '',
  stream: ''
})

const loadStream = async (channelId) => {
  try {
    // 开始播放
    const playResult = await gb28181API.startWVPPreview({
      deviceId: 'device001',
      channelId: channelId
    })
    
    // 从返回的数据中提取 WebRTC 信息
    // 根据实际后端返回格式调整
    if (playResult.rtc) {
      // 解析 WebRTC URL: webrtc://127.0.0.1:18081/live/stream001
      const url = new URL(playResult.rtc.replace('webrtc://', 'http://'))
      const pathParts = url.pathname.split('/').filter(p => p)
      
      playerConfig.value = {
        serverUrl: `http://${url.host}`,
        app: pathParts[0] || 'live',
        stream: pathParts[1]
      }
    }
  } catch (error) {
    console.error('加载流失败:', error)
  }
}

onMounted(() => {
  loadStream('channel001')
})
</script>
```

## 浏览器兼容性

| 浏览器 | 版本 | WebRTC 支持 | 备注 |
|--------|------|-------------|------|
| Chrome | 74+ | ✅ 完全支持 | 推荐 |
| Edge | 79+ | ✅ 完全支持 | 推荐 |
| Firefox | 66+ | ✅ 完全支持 | |
| Safari | 11+ | ⚠️ 部分支持 | H265 可能不支持 |
| Opera | 62+ | ✅ 完全支持 | |
| 移动端 Chrome | 最新 | ✅ 支持 | |
| 移动端 Safari | iOS 11+ | ⚠️ 部分支持 | |

## 性能建议

1. **单路播放**: 推荐使用 H264 + opus，延迟可低至 200-500ms
2. **多路播放（4-9 路）**: 使用 H264，降低分辨率到 720p
3. **多路播放（10-16 路）**: 使用 H264，降低分辨率到 480p，考虑降低码率
4. **超过 16 路**: 不推荐在一个页面播放，考虑分页或切换播放

## 与其他播放方式对比

| 协议 | 延迟 | 浏览器支持 | 穿透性 | 推荐场景 |
|------|------|-----------|--------|----------|
| WebRTC | 200-500ms | 好 | 好 | 实时互动、低延迟要求 |
| HTTP-FLV | 1-3s | 需插件 | 一般 | 监控、直播 |
| WS-FLV | 1-3s | 好 | 好 | 监控、直播 |
| HLS | 5-10s | 原生支持 | 好 | 点播、对延迟不敏感 |

## 参考资料

- [ZLMediaKit 官方文档](https://github.com/ZLMediaKit/ZLMediaKit)
- [WebRTC API 文档](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API)
- [ZLMediaKit WebRTC 配置说明](https://github.com/ZLMediaKit/ZLMediaKit/wiki/webrtc)

