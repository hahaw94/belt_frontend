# SimpleStreamPlayer 通用流媒体播放器使用说明

## 📺 功能特点

这是一个简单易用的流媒体播放器组件，专为 ZLMediaKit 流媒体服务器设计，支持：

- ✅ **HTTP-FLV** - 低延迟（推荐用于实时监控）
- ✅ **HLS** - 兼容性最好（适合各种浏览器）
- ✅ **RTMP** - 实时推流协议
- ✅ 自动检测流类型
- ✅ 自动播放和错误重试
- ✅ 加载状态和错误提示

---

## 🚀 快速开始

### 1. 配置流媒体服务器地址

在 `HomeView.vue` 中找到 `streamConfig` 配置：

```javascript
// 流媒体服务器配置
const streamConfig = {
  baseUrl: 'http://localhost',  // ZLMediaKit服务器地址（修改为你的服务器IP）
  httpPort: 80,                  // HTTP端口，默认80
  app: 'live',                   // 应用名，默认live
  protocol: 'flv',               // 播放协议: 'flv' | 'hls' | 'rtmp'
  snapshotPath: '/snapshots'     // 截图路径
}
```

### 2. 修改配置示例

**示例1：使用本地ZLMediaKit（默认端口）**
```javascript
const streamConfig = {
  baseUrl: 'http://localhost',
  httpPort: 80,
  app: 'live',
  protocol: 'flv'  // 使用FLV，延迟最低
}
```

**示例2：使用远程服务器（自定义端口）**
```javascript
const streamConfig = {
  baseUrl: 'http://192.168.1.100',  // 修改为你的服务器IP
  httpPort: 8080,                   // ZLMediaKit HTTP端口
  app: 'live',
  protocol: 'flv'
}
```

**示例3：使用HLS协议（兼容性最好）**
```javascript
const streamConfig = {
  baseUrl: 'http://192.168.1.100',
  httpPort: 80,
  app: 'live',
  protocol: 'hls'  // 改为HLS，兼容所有浏览器
}
```

---

## 📹 推流和播放

### 推流到ZLMediaKit

使用 **OBS** 或 **FFmpeg** 推流：

**OBS设置：**
- 服务器：`rtmp://localhost:1935/live`
- 串流密钥：`camera1`（或任何你想要的流名称）

**FFmpeg命令：**
```bash
# 从摄像头推流
ffmpeg -f dshow -i video="摄像头名称" -vcodec libx264 -preset ultrafast -f flv rtmp://localhost:1935/live/camera1

# 从RTSP摄像头转推
ffmpeg -i rtsp://admin:password@192.168.1.100:554/stream -c copy -f flv rtmp://localhost:1935/live/camera1

# 从视频文件推流（循环播放）
ffmpeg -re -stream_loop -1 -i test.mp4 -c copy -f flv rtmp://localhost:1935/live/camera1
```

### 播放地址格式

根据你选择的协议，系统会自动生成对应的播放地址：

**FLV格式（推荐）：**
```
http://localhost:80/live/camera1.live.flv
```

**HLS格式：**
```
http://localhost:80/live/camera1/hls.m3u8
```

**RTMP格式：**
```
rtmp://localhost:1935/live/camera1
```

---

## 🎯 使用示例

### 在组件中使用

```vue
<template>
  <SimpleStreamPlayer 
    :src="streamUrl"
    :poster="posterUrl"
    :autoplay="true"
    type="auto"
  />
</template>

<script setup>
import SimpleStreamPlayer from '@/components/SimpleStreamPlayer.vue'

const streamUrl = 'http://localhost/live/camera1.live.flv'
const posterUrl = 'http://localhost/snapshots/camera1_latest.jpg'
</script>
```

### 组件属性说明

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `src` | String | 必填 | 流媒体地址 |
| `poster` | String | '' | 封面图片URL |
| `autoplay` | Boolean | true | 是否自动播放 |
| `type` | String | 'auto' | 流类型：'auto'、'flv'、'hls'、'rtmp' |

---

## 🔧 ZLMediaKit 配置参考

### config.ini 关键配置

```ini
[general]
enableVhost=0
flowThreshold=1024

[http]
port=80
sslport=443

[rtmp]
port=1935

[protocol]
enable_hls=1
enable_mp4=0
enable_rtsp=1
enable_rtmp=1
enable_ts=1
enable_fmp4=0

[hls]
segDur=2
segNum=3
segKeep=0
broadcastRecordTs=0

[rtsp]
port=554
```

### 启动ZLMediaKit

```bash
# Windows
cd ZLMediaKit
MediaServer.exe -c config.ini

# Linux
./MediaServer -c config.ini
```

---

## 🐛 常见问题

### 1. 播放器显示"加载失败"

**解决方法：**
- 检查ZLMediaKit是否正常运行
- 确认流地址是否正确
- 检查防火墙是否开放对应端口
- 在浏览器控制台查看详细错误信息

### 2. 视频延迟较高

**解决方法：**
- 使用FLV协议（延迟最低，约1-3秒）
- 不要使用HLS（延迟通常6-20秒）
- 在ZLMediaKit配置中减小HLS切片时长

### 3. 跨域问题（CORS Error）

**解决方法：**

在ZLMediaKit的 `config.ini` 中添加：

```ini
[http]
allow_cross_domain=1
```

或在nginx中配置反向代理：

```nginx
location /live/ {
    proxy_pass http://localhost:80/live/;
    add_header Access-Control-Allow-Origin *;
    add_header Access-Control-Allow-Methods 'GET, POST, OPTIONS';
}
```

### 4. 浏览器不支持某种格式

| 浏览器 | FLV | HLS | RTMP |
|--------|-----|-----|------|
| Chrome | ✅ (flv.js) | ✅ (hls.js) | ❌ |
| Firefox | ✅ (flv.js) | ✅ (hls.js) | ❌ |
| Safari | ✅ (flv.js) | ✅ (原生) | ❌ |
| Edge | ✅ (flv.js) | ✅ (hls.js) | ❌ |

**建议：** 优先使用FLV格式，兼容性好且延迟低。

---

## 📊 协议对比

| 协议 | 延迟 | 兼容性 | 推荐场景 |
|------|------|--------|----------|
| **FLV** | 1-3秒 | ⭐⭐⭐⭐ | 实时监控（推荐） |
| **HLS** | 6-20秒 | ⭐⭐⭐⭐⭐ | 移动端、兼容性要求高 |
| **RTMP** | <1秒 | ⭐⭐ | 浏览器不支持，仅用于推流 |

---

## 💡 高级用法

### 切换播放协议

你可以在页面上动态切换协议：

```javascript
// 切换为FLV
streamConfig.protocol = 'flv'

// 切换为HLS
streamConfig.protocol = 'hls'

// 重新加载流
const newUrl = getStreamUrl('camera1')
```

### 手动指定流类型

```vue
<SimpleStreamPlayer 
  src="http://localhost/live/camera1.live.flv"
  type="flv"
  :autoplay="true"
/>
```

### 监听播放器事件

播放器组件会自动处理加载状态和错误，你可以在控制台查看详细日志。

---

## 📝 测试流地址

如果你没有实际的摄像头，可以使用测试流：

```javascript
// 公共测试流（HLS）
const testStream = 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8'

// 或者使用FFmpeg推送测试视频
ffmpeg -re -stream_loop -1 -i test.mp4 -c copy -f flv rtmp://localhost:1935/live/test
```

---

## 🔗 相关资源

- [ZLMediaKit官网](https://github.com/ZLMediaKit/ZLMediaKit)
- [flv.js文档](https://github.com/bilibili/flv.js)
- [hls.js文档](https://github.com/video-dev/hls.js)
- [OBS下载](https://obsproject.com/)

---

## ✅ 总结

1. **修改配置**：在 `HomeView.vue` 中修改 `streamConfig`
2. **启动ZLMediaKit**：确保流媒体服务器正常运行
3. **开始推流**：使用OBS或FFmpeg推送视频流
4. **点击摄像头图标**：在页面上查看实时画面

**推荐配置：**
- 协议：FLV（低延迟）
- 端口：80（HTTP）、1935（RTMP）
- 应用名：live

如有问题，请查看浏览器控制台的详细日志！



