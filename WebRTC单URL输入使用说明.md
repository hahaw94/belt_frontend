# WebRTC 单 URL 输入使用说明

## 修改日期
2025-11-06

## 修改内容

已将 WebRTC 播放器的输入方式从三个输入框（服务器、App、Stream）改为单个 URL 输入框。

## 使用方法

### 1. 打开实时检测页面

进入"实时检测"页面，第一个分屏会显示 WebRTC 播放输入框。

### 2. 输入完整的 WebRTC URL

在输入框中粘贴完整的 WebRTC API 地址，例如：

```
http://10.18.21.207:18081/index/api/webrtc?app=rtp&stream=34020000001320000002_34020000001320000002&type=play&originTypeStr=rtp_push
```

### 3. 点击播放

点击"开始 WebRTC 播放"按钮，系统会：
1. 自动解析 URL
2. 提取服务器地址：`http://10.18.21.207:18081`
3. 提取 app 参数：`rtp`
4. 提取 stream 参数：`34020000001320000002_34020000001320000002`
5. 建立 WebRTC 连接并开始播放

## URL 格式说明

### 标准格式

```
http(s)://[服务器地址]:[端口]/index/api/webrtc?app=[应用名]&stream=[流名称]&type=play
```

### 必填参数

| 参数 | 说明 | 示例 |
|------|------|------|
| 服务器地址 | ZLMediaKit 服务器 IP 或域名 | `10.18.21.207` |
| 端口 | HTTP API 端口 | `18081` |
| app | 应用名/目录名 | `rtp` 或 `live` |
| stream | 流名称 | `34020000001320000002_34020000001320000002` |

### 可选参数

- `type=play` - 播放类型
- `originTypeStr` - 源类型（如 `rtp_push`）
- 其他自定义参数

## 示例 URL

### 示例 1: 本地测试
```
http://127.0.0.1:18081/index/api/webrtc?app=live&stream=test001&type=play
```

### 示例 2: GB28181 推流
```
http://10.18.21.207:18081/index/api/webrtc?app=rtp&stream=34020000001320000002_34020000001320000002&type=play&originTypeStr=rtp_push
```

### 示例 3: RTMP 转 WebRTC
```
http://192.168.1.100:18081/index/api/webrtc?app=live&stream=camera001&type=play
```

## 技术实现

### URL 解析逻辑

```javascript
// 解析函数
const parseWebRTCUrl = (url) => {
  const urlObj = new URL(url.trim())
  
  // 提取服务器地址
  const serverUrl = `${urlObj.protocol}//${urlObj.host}`
  
  // 提取参数
  const params = new URLSearchParams(urlObj.search)
  const app = params.get('app')
  const stream = params.get('stream')
  
  return { serverUrl, app, stream }
}
```

### 解析示例

输入：
```
http://10.18.21.207:18081/index/api/webrtc?app=rtp&stream=xxx&type=play
```

解析结果：
```javascript
{
  serverUrl: "http://10.18.21.207:18081",
  app: "rtp",
  stream: "xxx"
}
```

## 新增功能

### 1. 单一输入框
- 使用多行文本框（textarea）
- 支持完整 URL 粘贴
- 自动解析参数

### 2. URL 示例提示
- 显示 URL 格式示例
- 帮助用户理解正确格式

### 3. 智能解析
- 自动提取服务器地址
- 自动提取 app 和 stream
- 错误提示

### 4. 错误处理
- URL 格式错误提示
- 缺少必填参数提示
- 友好的错误消息

## 界面截图说明

输入框外观：
```
┌─────────────────────────────────────────────┐
│ 📹  WebRTC 播放地址                         │
│                                              │
│  http://10.18.21.207:18081/index/api/       │
│  webrtc?app=rtp&stream=xxx&type=play        │
│                                              │
└─────────────────────────────────────────────┘
 
 示例: http://10.18.21.207:18081/index/api/webrtc?app=rtp&stream=xxx&type=play

┌─────────────────────────────────────────────┐
│        ▶️ 开始 WebRTC 播放                  │
└─────────────────────────────────────────────┘
```

## 优势

✅ **更简单**：一次性粘贴完整 URL，无需分别输入  
✅ **更快速**：直接从浏览器或后端 API 复制 URL  
✅ **更准确**：避免手动输入错误  
✅ **更灵活**：支持任意 ZLMediaKit WebRTC URL 格式  

## 注意事项

### 1. URL 格式要求

- 必须是完整的 HTTP/HTTPS URL
- 必须包含 `app` 参数
- 必须包含 `stream` 参数

### 2. 错误提示

如果 URL 格式错误，会显示：
- ❌ "WebRTC URL 格式错误"
- ❌ "URL 中缺少 app 或 stream 参数"

### 3. 浏览器兼容性

- ✅ Chrome 74+
- ✅ Edge 79+
- ✅ Firefox 66+
- ⚠️ Safari 11+（部分支持）

## 故障排查

### 问题 1: 无法解析 URL

**症状**: 提示 "WebRTC URL 格式错误"

**解决方案**:
1. 检查 URL 是否完整（包含 http:// 或 https://）
2. 检查 URL 是否包含必填参数（app、stream）
3. 使用浏览器地址栏测试 URL 是否可访问

### 问题 2: 解析成功但无法播放

**症状**: URL 解析成功，但播放失败

**解决方案**:
1. 检查 ZLMediaKit 服务器是否运行
2. 检查流是否真的存在
3. 使用 HTTP-FLV 测试流：`http://10.18.21.207:18081/rtp/xxx.live.flv`
4. 检查防火墙是否开放 WebRTC 端口（8000）

### 问题 3: CORS 错误

**症状**: 浏览器控制台显示跨域错误

**解决方案**:
在 ZLMediaKit 的 `config.ini` 中确保：
```ini
[http]
allow_cross_domains=1
```

## 从后端 API 获取 URL

如果您的后端 API 返回 WebRTC URL，可以直接使用：

```javascript
// 示例：从后端获取流地址
const result = await gb28181API.startWVPPreview({
  deviceId: 'device001',
  channelId: 'channel001'
})

// 如果后端返回完整的 WebRTC URL
if (result.webrtcUrl) {
  // 直接粘贴到输入框
  webrtcUrl.value = result.webrtcUrl
  startWebRTC()
}
```

## 相关文件

- **修改文件**: `belt/src/views/detection/RealtimeDetection.vue`
- **WebRTC 组件**: `belt/src/components/ZLKWebRTCPlayer.vue`
- **详细文档**: `belt/src/components/ZLKWebRTCPlayer_使用说明.md`

## 更新日志

### 2025-11-06
- ✅ 将三个输入框改为单个 URL 输入框
- ✅ 添加 URL 解析功能
- ✅ 添加 URL 格式示例提示
- ✅ 优化输入框样式（多行文本框）
- ✅ 添加错误处理和提示

