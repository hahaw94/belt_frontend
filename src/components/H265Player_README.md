# H265Player 组件使用说明

## 概述

`H265Player` 是一个基于 `h265web.js` 的高性能视频播放器组件，支持硬件加速解码和多种流媒体协议。

## 功能特性

- ✅ **硬件加速解码**：使用 WebAssembly 实现 H.265/HEVC 硬解码
- ✅ **多协议支持**：支持 WebSocket、HTTP-FLV、HLS 等多种流协议
- ✅ **实时调试**：提供详细的调试信息和性能统计
- ✅ **低延迟播放**：优化的缓冲策略，实现低延迟直播
- ✅ **灵活配置**：支持自定义流地址和快捷选择
- ✅ **响应式设计**：适配不同屏幕尺寸

## 安装依赖

确保项目已安装 `h265web.js`：

```bash
npm install h265web.js@^2.2.2
```

## 基本用法

### 1. 导入组件

```vue
<script setup>
import H265Player from '@/components/H265Player.vue'
</script>
```

### 2. 使用组件

```vue
<template>
  <div class="player-container">
    <H265Player 
      :default-url="streamUrl"
      :autoplay="false"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import H265Player from '@/components/H265Player.vue'

const streamUrl = ref('ws://localhost:8080/live/stream1')
</script>

<style scoped>
.player-container {
  width: 100%;
  height: 600px;
}
</style>
```

## 组件属性

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `default-url` | String | `''` | 默认流地址 |
| `autoplay` | Boolean | `false` | 是否自动播放 |

## 支持的流协议

### 1. WebSocket 流

```
ws://localhost:8080/live/stream1
wss://example.com/live/stream1
```

### 2. HTTP-FLV 流

```
http://localhost:8080/live/stream1.flv
https://example.com/live/stream1.flv
```

### 3. HLS 流

```
http://localhost:8080/live/stream1.m3u8
https://example.com/live/stream1.m3u8
```

## 调试信息说明

组件提供丰富的调试信息，帮助开发者监控播放状态：

### 连接状态
- **状态**：显示当前播放器状态（未连接、连接中、播放中、错误）
- **流地址**：当前正在播放的流地址
- **播放器类型**：H265Web.js (硬解码)

### 视频信息
- **分辨率**：视频的宽度和高度（如 1920 × 1080）
- **帧率**：视频帧率（FPS）
- **编码格式**：视频编码格式（H.265/HEVC）
- **码率**：视频比特率（Mbps 或 Kbps）

### 性能统计
- **已接收帧数**：从流中接收的总帧数
- **已解码帧数**：成功解码的帧数
- **丢帧数**：由于性能问题丢弃的帧数
- **缓冲延迟**：当前缓冲延迟时间（毫秒）
- **运行时长**：播放器运行的总时长

### 网络信息
- **接收字节数**：已接收的数据总量
- **下载速度**：当前网络下载速度
- **连接时间**：建立连接所需的时间

### 事件日志
实时显示播放器的各种事件，包括：
- 🔵 **INFO**：一般信息（蓝色）
- ✅ **SUCCESS**：成功事件（绿色）
- ⚠️ **WARNING**：警告信息（黄色）
- ❌ **ERROR**：错误信息（红色）

## 使用工具类

组件配套提供了 `videoPlayerUtils.js` 工具类，用于处理各种数据格式转换：

### ByteConverter - 字节转换

```javascript
import { ByteConverter } from '@/utils/videoPlayerUtils'

// 格式化字节
ByteConverter.format(1048576) // "1.00 MB"

// 转换为速度
ByteConverter.toSpeed(1048576) // "1.00 MB/s"

// 转换为 MB
ByteConverter.toMB(1048576) // 1
```

### BitrateConverter - 比特率转换

```javascript
import { BitrateConverter } from '@/utils/videoPlayerUtils'

// 格式化比特率
BitrateConverter.format(1000000) // "1.00 Mbps"

// 字节转比特率
BitrateConverter.fromBytes(125000) // 1000000 (bps)
```

### TimeConverter - 时间转换

```javascript
import { TimeConverter } from '@/utils/videoPlayerUtils'

// 格式化秒数
TimeConverter.format(3661) // "01:01:01"

// 格式化时间戳
TimeConverter.formatTimestamp(Date.now()) // "14:23:45"
```

### StreamUrlParser - 流地址解析

```javascript
import { StreamUrlParser } from '@/utils/videoPlayerUtils'

// 检测流类型
StreamUrlParser.detectType('http://example.com/live.flv') // "flv"

// 验证流地址
StreamUrlParser.isValid('ws://localhost:8080/live') // true

// 解析流地址
StreamUrlParser.parse('http://example.com:8080/live/stream1.flv')
// {
//   type: 'flv',
//   protocol: 'http',
//   host: 'example.com',
//   port: 8080,
//   path: '/live/stream1.flv',
//   streamName: 'stream1'
// }
```

## 在 HomeView 中的集成

组件已集成到首页（HomeView.vue）中，替代了原有的 SimpleStreamPlayer：

```vue
<!-- HomeView.vue -->
<template>
  <div class="video-display-area">
    <div class="video-player-container">
      <H265Player 
        :default-url="currentStreamUrl"
        :autoplay="false"
      />
    </div>
  </div>
</template>

<script setup>
import H265Player from '@/components/H265Player.vue'
import { ref } from 'vue'

const currentStreamUrl = ref('')
</script>
```

## 注意事项

### 1. WASM 文件路径

组件默认从 `/node_modules/h265web.js/dist/` 加载 WASM 文件。如果部署到生产环境，需要确保 WASM 文件可访问：

```javascript
// 在 vue.config.js 中配置
module.exports = {
  publicPath: '/',
  // 复制 WASM 文件到 public 目录
  chainWebpack: config => {
    config.plugin('copy').use(require('copy-webpack-plugin'), [{
      patterns: [
        {
          from: 'node_modules/h265web.js/dist/*.wasm',
          to: 'wasm/[name][ext]'
        }
      ]
    }])
  }
}
```

### 2. 浏览器兼容性

- 需要浏览器支持 WebAssembly
- 推荐使用 Chrome 87+、Edge 87+、Firefox 78+ 或 Safari 14+
- IE 浏览器不支持

### 3. 性能要求

- H.265 解码对 CPU 有一定要求
- 高分辨率视频（如 4K）需要较强的设备性能
- 建议在实际设备上进行性能测试

### 4. CORS 问题

如果流媒体服务器与前端不在同一域名，需要配置 CORS：

```nginx
# Nginx 配置示例
add_header Access-Control-Allow-Origin *;
add_header Access-Control-Allow-Methods 'GET, POST, OPTIONS';
add_header Access-Control-Allow-Headers 'DNT,X-Mx-ReqToken,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type';
```

## 常见问题

### Q1: 播放器初始化失败？

**A**: 检查以下几点：
1. 确认已安装 h265web.js 依赖
2. 检查 WASM 文件路径是否正确
3. 查看浏览器控制台的错误信息

### Q2: 无法播放某些流？

**A**: 
1. 确认流地址格式正确
2. 检查流媒体服务器是否正常运行
3. 验证网络连接和防火墙设置
4. 查看调试面板中的错误日志

### Q3: 播放卡顿或丢帧？

**A**:
1. 检查设备性能是否满足要求
2. 降低视频分辨率或码率
3. 检查网络带宽是否充足
4. 查看性能统计中的丢帧数

### Q4: 如何自定义快捷流地址？

**A**: 修改组件中的 `quickUrls` 数组：

```javascript
const quickUrls = ref([
  { name: '测试流1', url: 'ws://your-server:8080/live/stream1' },
  { name: '测试流2', url: 'http://your-server:8080/live/stream2.flv' }
])
```

## 更新日志

### v1.0.0 (2025-10-29)

- ✨ 初始版本发布
- ✅ 支持 H.265 硬解码
- ✅ 集成调试信息面板
- ✅ 提供工具类库
- ✅ 替代首页原有播放器

## 技术支持

如有问题，请联系开发团队或查看：
- h265web.js 官方文档：https://www.h265web.com/
- 项目 GitHub 仓库

---

**作者**: Belt System  
**日期**: 2025-10-29  
**版本**: 1.0.0


