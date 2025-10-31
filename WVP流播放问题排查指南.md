# WVP 流播放问题排查指南

## 📋 问题现象

VLC 可以播放，但浏览器中 H265Player 组件无法播放 WVP 流。

## 🔍 可能的原因

### 1. CORS 跨域问题 ⭐ **最常见**

**症状**：
- 浏览器控制台显示 CORS 错误
- 调试面板显示"网络错误"
- FLV.js 报错 "NetworkError: Exception"

**解决方案**：

#### 方案A：配置 ZLMediaKit 允许跨域

编辑 ZLMediaKit 配置文件（通常在 `Release/config.ini`）：

```ini
[http]
# 允许跨域访问
allow_cross_domains=1
```

或者通过 WVP 的 `application.yml` 配置：

```yaml
media:
  zlm:
    http:
      allow-cross-domains: true
```

重启 ZLMediaKit 服务。

#### 方案B：使用代理服务器

在开发环境中使用 Vue 代理：

编辑 `vue.config.js`:

```javascript
module.exports = {
  devServer: {
    proxy: {
      '/rtp': {
        target: 'http://10.18.21.219:18081',
        changeOrigin: true,
        ws: true  // 支持 WebSocket
      }
    }
  }
}
```

然后使用相对路径：
```
http://localhost:8080/rtp/xxx.live.flv
```

### 2. 浏览器自动播放策略

**症状**：
- 调试面板显示 "NotAllowedError"
- 视频加载但不播放

**解决方案**：
1. 用户手动点击视频播放
2. 在组件中设置 `muted` 属性（已设置）
3. 用户先与页面交互（点击任何地方）

### 3. 网络连接问题

**症状**：
- 连接超时
- 无法建立连接

**排查步骤**：

```bash
# 1. 检查服务器是否可达
ping 10.18.21.219

# 2. 检查端口是否开放
telnet 10.18.21.219 18081

# 3. 使用 curl 测试 HTTP 流
curl -I "http://10.18.21.219:18081/rtp/34020000001320000001_34020000001320000001.live.flv?originTypeStr=rtp_push"

# 应该返回 200 状态码
```

### 4. WebSocket 连接问题

**症状**：
- WS-FLV 无法播放
- HTTP-FLV 可以播放

**排查步骤**：

```javascript
// 在浏览器控制台测试 WebSocket
const ws = new WebSocket('ws://10.18.21.219:18081/rtp/34020000001320000001_34020000001320000001.live.flv?originTypeStr=rtp_push')

ws.onopen = () => console.log('✅ WebSocket 连接成功')
ws.onerror = (e) => console.log('❌ WebSocket 错误:', e)
ws.onclose = (e) => console.log('⚠️ WebSocket 关闭:', e)
```

**解决方案**：
- 检查防火墙是否允许 WebSocket
- 检查代理服务器是否支持 WebSocket
- 尝试使用 HTTP-FLV 替代

### 5. 流格式不支持

**症状**：
- 加载后显示 "NotSupportedError"
- 视频元数据错误

**排查**：
```bash
# 使用 ffprobe 检查流信息
ffprobe "http://10.18.21.219:18081/rtp/xxx.live.flv"

# 查看编码格式
# 应该是 H.264 视频，AAC 音频
```

### 6. 浏览器兼容性

**症状**：
- FLV.js 报错 "isSupported() = false"

**解决方案**：
- 使用 Chrome 87+、Edge 87+、Firefox 78+
- 不要使用 IE 浏览器
- 确保浏览器已启用 JavaScript

## 🛠️ 调试步骤

### Step 1: 查看调试面板

1. 点击"显示调试"按钮
2. 查看"事件日志"部分
3. 找到红色错误信息

### Step 2: 检查浏览器控制台

按 F12 打开开发者工具，查看：

1. **Console** 标签页：
   - 查找 CORS 错误
   - 查找 FLV.js 错误
   - 查找 WebSocket 错误

2. **Network** 标签页：
   - 检查流请求是否发出
   - 检查响应状态码
   - 检查响应头中的 CORS 设置

### Step 3: 使用不同协议测试

按优先级测试：

1. ✅ **WS-FLV**（推荐）
   ```
   ws://10.18.21.219:18081/rtp/xxx.live.flv?originTypeStr=rtp_push
   ```

2. ✅ **HTTP-FLV**
   ```
   http://10.18.21.219:18081/rtp/xxx.live.flv?originTypeStr=rtp_push
   ```

3. ✅ **HLS**
   ```
   http://10.18.21.219:18081/rtp/xxx/hls.m3u8?originTypeStr=rtp_push
   ```

### Step 4: 对比 VLC 和浏览器

**VLC 可以播放说明**：
- ✅ 流地址正确
- ✅ 服务器运行正常
- ✅ 流格式正确
- ❓ 可能是浏览器端的问题（CORS、自动播放等）

## 🔧 快速修复方案

### 方案 1: 启用 CORS（推荐）

**编辑 ZLMediaKit 配置**：

1. 找到配置文件：
   - Windows: `Release/config.ini`
   - Linux: `/etc/zlmediakit/config.ini`

2. 修改 HTTP 部分：
   ```ini
   [http]
   # 是否允许跨域请求
   allow_cross_domains=1
   
   # CORS 允许的域名（* 表示所有）
   cross_domain_allow_origin=*
   
   # CORS 允许的请求头
   cross_domain_allow_credentials=0
   ```

3. 重启 ZLMediaKit：
   ```bash
   # Windows
   taskkill /F /IM MediaServer.exe
   cd Release
   MediaServer.exe
   
   # Linux
   sudo systemctl restart zlmediakit
   ```

### 方案 2: 使用 WebSocket-FLV

WebSocket 不受 CORS 限制，切换到 WS-FLV：

```
ws://10.18.21.219:18081/rtp/xxx.live.flv?originTypeStr=rtp_push
```

### 方案 3: 使用 Nginx 反向代理

配置 Nginx 作为反向代理：

```nginx
server {
    listen 80;
    server_name localhost;
    
    # 添加 CORS 头
    add_header Access-Control-Allow-Origin *;
    add_header Access-Control-Allow-Methods 'GET, POST, OPTIONS';
    add_header Access-Control-Allow-Headers 'DNT,X-Mx-ReqToken,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type';
    
    location /rtp/ {
        proxy_pass http://10.18.21.219:18081/rtp/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}
```

然后使用：
```
http://localhost/rtp/xxx.live.flv?originTypeStr=rtp_push
```

## 📊 诊断检查清单

使用以下清单逐项排查：

- [ ] **网络连接**
  - [ ] 可以 ping 通服务器 IP
  - [ ] 端口 18081 可访问
  - [ ] 防火墙已允许访问

- [ ] **CORS 配置**
  - [ ] ZLMediaKit 已启用 `allow_cross_domains`
  - [ ] 浏览器控制台无 CORS 错误

- [ ] **流地址**
  - [ ] URL 格式正确
  - [ ] 设备 ID 和通道 ID 正确
  - [ ] 查询参数完整（包括 `?originTypeStr=rtp_push`）

- [ ] **浏览器**
  - [ ] 使用 Chrome/Edge/Firefox 最新版
  - [ ] JavaScript 已启用
  - [ ] 已允许自动播放（或手动播放）

- [ ] **WVP 平台**
  - [ ] WVP 服务运行正常
  - [ ] ZLMediaKit 服务运行正常
  - [ ] 摄像头在线
  - [ ] 流已成功推送到服务器

- [ ] **组件状态**
  - [ ] 调试面板显示正确的流类型
  - [ ] 事件日志无致命错误
  - [ ] 视频元素已正确初始化

## 💡 常见错误代码

| 错误信息 | 原因 | 解决方案 |
|---------|------|----------|
| `NetworkError: Exception` | CORS 问题或网络不通 | 启用 CORS 或使用代理 |
| `NotAllowedError` | 浏览器禁止自动播放 | 用户手动播放 |
| `NotSupportedError` | 不支持的媒体格式 | 检查流编码格式 |
| `CORS policy` | 跨域限制 | 配置服务器 CORS |
| `WebSocket connection failed` | WS 连接失败 | 改用 HTTP-FLV |
| `404 Not Found` | 流不存在 | 检查流地址和推流状态 |

## 📞 获取技术支持

如果以上方法都无法解决，请提供：

1. **浏览器控制台截图**（Console 和 Network 标签）
2. **调试面板事件日志**
3. **流地址**（脱敏处理）
4. **WVP 版本**
5. **ZLMediaKit 配置**（`config.ini` 的 HTTP 部分）

---

**更新日期**: 2025-10-29  
**版本**: 1.2.0

