# H265Player 组件 - WVP 视频平台使用说明

## 🎯 概述

H265Player 组件**完全支持 WVP 视频平台的网络推流**，包括：
- ✅ HTTP-FLV（通过 HTTP 传输 FLV）
- ✅ WS-FLV（通过 WebSocket 传输 FLV） - **WVP 平台推荐**
- ✅ HLS（M3U8 切片流）
- ✅ 远程流和本地流都支持

## 📡 WVP 平台支持的流协议

### 1. WebSocket-FLV（推荐 ⭐）

**为什么推荐？**
- 低延迟（通常 < 1秒）
- 实时性好
- 穿透防火墙能力强
- WVP 平台默认支持

**流地址格式：**
```
ws://[IP]:[端口]/rtp/[设备ID]_[通道ID].live.flv
wss://[IP]:[端口]/rtp/[设备ID]_[通道ID].live.flv  (HTTPS 环境)
```

**示例：**
```
ws://192.168.1.100:18080/rtp/34020000001320000001_34020000001310000001.live.flv
```

### 2. HTTP-FLV

**适用场景：**
- 不支持 WebSocket 的环境
- 需要 HTTP 缓存的场景

**流地址格式：**
```
http://[IP]:[端口]/rtp/[设备ID]_[通道ID].live.flv
https://[IP]:[端口]/rtp/[设备ID]_[通道ID].live.flv
```

**示例：**
```
http://192.168.1.100:18080/rtp/34020000001320000001_34020000001310000001.live.flv
```

### 3. HLS

**适用场景：**
- iOS Safari 浏览器
- 需要多码率切换
- CDN 分发

**流地址格式：**
```
http://[IP]:[端口]/rtp/[设备ID]_[通道ID]/hls.m3u8
```

**示例：**
```
http://192.168.1.100:18080/rtp/34020000001320000001_34020000001310000001/hls.m3u8
```

## 🚀 使用方法

### 方式1：在首页使用（已集成）

1. 打开首页
2. 找到视频播放区域的 H265Player 组件
3. 在输入框输入 WVP 推流地址
4. 点击"播放"按钮

### 方式2：手动输入流地址

```
1. 从 WVP 平台获取流地址
2. 复制完整的流地址（包括协议）
3. 粘贴到 H265Player 的输入框
4. 点击播放
```

### 方式3：从首页流列表选择

如果首页已集成流管理功能：
```
1. 在流列表中找到目标摄像头
2. 点击"使用此流"
3. 自动加载到播放器
```

## 🔍 如何获取 WVP 流地址

### 方法1：从 WVP 管理界面

1. 登录 WVP 管理后台（默认 http://localhost:18080）
2. 进入"国标设备" > "通道列表"
3. 找到目标摄像头，点击"播放"
4. 在播放弹窗中复制流地址

### 方法2：通过 API 获取

```javascript
// 调用 WVP API 获取流地址
GET /api/play/start/{deviceId}/{channelId}

// 响应中包含多种流地址
{
  "code": 0,
  "data": {
    "ws_flv": "ws://localhost:18080/rtp/xxx.live.flv",
    "http_flv": "http://localhost:18080/rtp/xxx.live.flv",
    "hls": "http://localhost:18080/rtp/xxx/hls.m3u8",
    "rtmp": "rtmp://localhost:1935/rtp/xxx"
  }
}
```

### 方法3：流地址格式规则

WVP 流地址遵循以下规则：
```
协议://服务器IP:端口/rtp/设备ID_通道ID.live.flv (FLV)
协议://服务器IP:端口/rtp/设备ID_通道ID/hls.m3u8 (HLS)
```

**参数说明：**
- **设备ID**: 20位国标设备编码（如 34020000001320000001）
- **通道ID**: 20位国标通道编码（如 34020000001310000001）
- **端口**: WVP 默认 18080

## 🛠️ 调试信息解读

### 连接状态

| 状态 | 说明 | 操作建议 |
|------|------|----------|
| 未连接 | 播放器空闲 | 输入流地址并播放 |
| 连接中 | 正在建立连接 | 等待连接完成 |
| 播放中 | 正常播放 | 可查看性能统计 |
| 错误 | 播放失败 | 查看错误日志排查 |

### 常见错误及解决

#### 错误1：网络错误 - Exception

**可能原因：**
1. WVP 服务未启动
2. IP 地址或端口错误
3. 防火墙拦截
4. CORS 跨域问题

**解决方法：**
```bash
# 1. 检查 WVP 是否运行
curl http://localhost:18080/index/api/getServerConfig

# 2. 检查端口是否开放
telnet localhost 18080

# 3. 检查防火墙
# Windows: 控制面板 > Windows Defender 防火墙 > 允许应用
# Linux: sudo ufw allow 18080
```

#### 错误2：媒体错误

**可能原因：**
1. 流格式不正确
2. 编码格式不支持
3. 摄像头未推流

**解决方法：**
1. 在 WVP 后台检查摄像头状态
2. 确认摄像头已在线
3. 尝试使用不同的流协议（WS-FLV → HTTP-FLV → HLS）

#### 错误3：404 Not Found

**可能原因：**
1. 流地址路径错误
2. 设备ID或通道ID错误
3. 流尚未建立

**解决方法：**
1. 检查流地址格式是否正确
2. 在 WVP 后台先手动播放一次
3. 确认设备和通道 ID 准确

## 📊 性能优化建议

### 1. 选择合适的协议

| 场景 | 推荐协议 | 原因 |
|------|----------|------|
| 内网实时监控 | WS-FLV | 延迟最低 |
| 外网访问 | HTTP-FLV 或 HLS | 兼容性好 |
| iOS Safari | HLS | 原生支持 |
| 多人观看 | HLS | CDN 友好 |

### 2. 网络要求

- **带宽**: ≥ 视频码率 × 1.2
- **示例**: 2Mbps 视频需要 ≥ 2.4Mbps 带宽
- **延迟**: 内网 < 100ms，外网 < 500ms

### 3. WVP 配置优化

编辑 WVP 配置文件 `application.yml`:

```yaml
media:
  rtp:
    # 端口范围
    port-range: 30000-30500
    
  # 录像配置
  record:
    # 开启录像
    assist-port: 18081
    
# 流媒体服务器（ZLMediaKit）配置
zlm:
  # HTTP-FLV 端口
  http-port: 18080
  
  # RTMP 端口
  rtmp-port: 1935
  
  # 性能优化
  hook:
    enable: true
    on_play: http://127.0.0.1:18080/index/hook/on_play
```

## 🔧 troubleshooting 排查流程

### Step 1: 检查 WVP 服务

```bash
# 检查 WVP 进程
ps aux | grep wvp

# 检查端口监听
netstat -an | grep 18080

# 查看 WVP 日志
tail -f logs/wvp.log
```

### Step 2: 检查摄像头状态

1. 登录 WVP 后台
2. 进入"国标设备"页面
3. 确认设备状态为"在线"
4. 确认通道状态为"在线"

### Step 3: 测试流地址

使用 VLC 播放器测试：
```
1. 打开 VLC
2. 媒体 > 打开网络串流
3. 输入流地址
4. 播放
```

如果 VLC 能播放，说明流地址正确，问题在浏览器端。

### Step 4: 查看浏览器控制台

```javascript
// F12 打开开发者工具
// 查看 Console 标签的错误信息
// 查看 Network 标签的网络请求
```

### Step 5: 查看调试面板

H265Player 组件的调试面板会显示详细的错误日志：
- 连接过程
- 错误类型
- 元数据信息
- 网络统计

## 💡 最佳实践

### 1. 流地址管理

```javascript
// 推荐：集中管理流地址配置
const streamConfig = {
  wvp: {
    host: '192.168.1.100',
    port: 18080,
    protocol: 'ws' // ws 或 http
  }
}

// 动态生成流地址
function getStreamUrl(deviceId, channelId, type = 'ws-flv') {
  const { host, port, protocol } = streamConfig.wvp
  
  if (type === 'ws-flv') {
    return `ws://${host}:${port}/rtp/${deviceId}_${channelId}.live.flv`
  } else if (type === 'http-flv') {
    return `http://${host}:${port}/rtp/${deviceId}_${channelId}.live.flv`
  } else if (type === 'hls') {
    return `http://${host}:${port}/rtp/${deviceId}_${channelId}/hls.m3u8`
  }
}
```

### 2. 错误处理

```javascript
// 自动重试机制
let retryCount = 0
const maxRetries = 3

async function playWithRetry(url) {
  try {
    await playStream(url)
  } catch (error) {
    if (retryCount < maxRetries) {
      retryCount++
      console.log(`重试播放 (${retryCount}/${maxRetries})`)
      setTimeout(() => playWithRetry(url), 2000)
    } else {
      console.error('播放失败，已达最大重试次数')
    }
  }
}
```

### 3. 协议自动切换

```javascript
// 按优先级尝试不同协议
const protocols = ['ws-flv', 'http-flv', 'hls']

async function playWithFallback(deviceId, channelId) {
  for (const protocol of protocols) {
    try {
      const url = getStreamUrl(deviceId, channelId, protocol)
      await playStream(url)
      console.log(`使用 ${protocol} 协议播放成功`)
      return
    } catch (error) {
      console.warn(`${protocol} 播放失败，尝试下一个协议`)
    }
  }
  console.error('所有协议都无法播放')
}
```

## 📚 相关文档

- [WVP 官方文档](https://github.com/648540858/wvp-GB28181-pro)
- [ZLMediaKit 文档](https://github.com/ZLMediaKit/ZLMediaKit)
- [FLV.js 文档](https://github.com/bilibili/flv.js)
- [HLS.js 文档](https://github.com/video-dev/hls.js)

## 🆘 技术支持

如果遇到问题：

1. 检查调试面板的事件日志
2. 查看浏览器控制台错误
3. 参考本文档的排查流程
4. 联系技术支持团队

---

**更新日期**: 2025-10-29  
**版本**: 1.1.0  
**状态**: ✅ 完全支持 WVP 平台网络推流

