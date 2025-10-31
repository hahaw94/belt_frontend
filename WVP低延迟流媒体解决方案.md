# WVP 低延迟流媒体解决方案

## 🎯 问题总结

- ❌ **HTTP-FLV**: 无法播放（元数据接收但 readyState=0）
- ✅ **HLS**: 可以播放，但**延迟太高（2-10秒）**，不适合实时监控
- ✅ **WS-FLV**: 本地测试成功，**低延迟（<1秒）**

---

## ✅ 推荐的低延迟方案（按优先级）

### 🥇 方案 1：WebSocket-FLV（最推荐）⭐⭐⭐

**特点**：
- ✅ **延迟最低**：<1秒
- ✅ **稳定性高**：WebSocket 长连接
- ✅ **本地已验证**：您的本地流用的就是这个
- ✅ **兼容性好**：FLV.js 完美支持

**流地址格式**：
```
ws://10.18.21.219:18081/rtp/34020000001320000001_34020000001320000001.live.flv?originTypeStr=rtp_push
```

**使用方法**：
1. 刷新页面
2. 点击快捷选择中的 **"WS-FLV (推荐)"**
3. 点击播放

**预期效果**：
```
流类型: ws-flv
加载 WebSocket-FLV 流
[FLV] 收到元数据: 3840×2160
[FLV] MEDIA_INFO
[Video] loadeddata
✅ 播放成功，延迟 <1秒
```

---

### 🥈 方案 2：WebSocket-FMP4 ⭐⭐⭐

**特点**：
- ✅ **延迟低**：<1秒
- ✅ **更现代的封装格式**：基于 MP4
- ✅ **可能更好的兼容性**：某些编码场景下

**流地址格式**：
```
ws://10.18.21.219:18081/rtp/34020000001320000001_34020000001320000001.live.mp4?originTypeStr=rtp_push
```

**使用方法**：
1. 刷新页面
2. 点击快捷选择中的 **"FMP4-WS"**
3. 点击播放

---

### 🥉 方案 3：HTTP-FMP4 ⭐⭐

**特点**：
- ⚠️ **延迟中等**：1-2秒
- ✅ **无需 WebSocket**：标准 HTTP
- ✅ **可能解决 HTTP-FLV 的问题**

**流地址格式**：
```
http://10.18.21.219:18081/rtp/34020000001320000001_34020000001320000001.live.mp4?originTypeStr=rtp_push
```

**手动输入测试**。

---

## 📊 延迟对比

| 方案 | 延迟 | 稳定性 | 推荐指数 | 本地测试 |
|------|------|--------|----------|----------|
| **WS-FLV** | **<1秒** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ✅ 成功 |
| **WS-FMP4** | **<1秒** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | 待测试 |
| HTTP-FMP4 | 1-2秒 | ⭐⭐⭐⭐ | ⭐⭐⭐ | 待测试 |
| HTTP-FLV | - | ❌ 不可用 | ❌ | ❌ 失败 |
| HLS | 2-10秒 | ⭐⭐⭐⭐⭐ | ⭐ | ✅ 成功但延迟高 |

---

## 🔧 WVP 提供的所有流格式

根据您的截图，WVP 提供以下格式：

### 超低延迟（<500ms）
- **WebRTC (RTC)**: `http://10.18.21.219:18081/index/api/webrtc?app=rtp&stream=...`
  - 延迟最低（<500ms）
  - 需要浏览器支持 WebRTC
  - 适合实时互动场景

### 低延迟（<1秒）
- **WS-FLV**: `ws://...live.flv` ⭐ 推荐
- **WS-FMP4**: `ws://...live.mp4` ⭐ 推荐
- **WSS-FLV**: `wss://...live.flv` (需要 HTTPS 证书)
- **WSS-FMP4**: `wss://...live.mp4` (需要 HTTPS 证书)

### 中等延迟（1-2秒）
- **HTTP-FMP4**: `http://...live.mp4`
- **HTTPS-FMP4**: `https://...live.mp4`
- **TS**: `http://...live.ts`

### 高延迟（2-10秒）
- **HLS**: `http://...hls.m3u8` ✅ 已验证可用
- **HLS-WS**: `ws://...hls.m3u8`

### 其他协议（需要特殊处理）
- **RTMP**: `rtmp://...` (需要 Flash 或转码)
- **RTSP**: `rtsp://...` (需要服务器端转码)

---

## 🧪 测试步骤

### 步骤 1：测试 WS-FLV（最优先）⭐⭐⭐

1. **刷新页面**
2. **点击 "WS-FLV (推荐)"**
3. **点击播放**
4. **观察**：
   - 是否出现 `[FLV] MEDIA_INFO`？
   - `readyState` 是否变化？
   - 视频是否播放？
   - 延迟是否 <1秒？

### 步骤 2：如果 WS-FLV 失败，测试 FMP4-WS

1. **停止播放**
2. **点击 "FMP4-WS"**
3. **点击播放**
4. **观察日志**

### 步骤 3：对比延迟

使用秒表测试延迟：
1. 在摄像头前挥手
2. 观察画面中的延迟
3. 记录时间差

---

## 🔍 为什么 HTTP-FLV 失败，WS-FLV 可能成功？

### HTTP-FLV 的问题

**症状**：
```
✅ 收到元数据
❌ 没有 [FLV] MEDIA_INFO
❌ readyState=0
❌ 下载速度 0.01 KB/s
```

**可能原因**：
1. **WVP HTTP-FLV 元数据不完整**
   - 缺少 `videodatarate`
   - 缺少 `audiodatarate`
   - FLV.js 无法正确初始化

2. **HTTP 分块传输问题**
   - WVP 的 HTTP chunked transfer 可能有问题
   - 浏览器无法正确接收数据

3. **CORS 配置**
   - 虽然没报错，但可能有隐性问题

### WS-FLV 的优势

**为什么可能成功**：

1. **WebSocket 长连接**
   - 不需要 HTTP chunked transfer
   - 数据直接推送到浏览器
   - 避免 HTTP 的各种兼容性问题

2. **元数据处理更好**
   - WebSocket 流的元数据格式可能更规范
   - FLV.js 对 WebSocket-FLV 的支持更成熟

3. **您的本地流已验证**
   ```
   ws://localhost:18081/live/board_1_1761739264.live.flv
   ✅ 成功播放，延迟低
   ```

---

## 💡 如果 WebSocket 连接失败

### 检查防火墙

确保防火墙允许 WebSocket 连接：
```bash
# Windows 防火墙规则
netsh advfirewall firewall add rule name="WVP WebSocket" dir=in action=allow protocol=TCP localport=18081
```

### 检查 WVP 配置

确认 ZLMediaKit 开启了 WebSocket：

编辑 `smart-video-platform/Release/config.ini`:
```ini
[http]
# 确保 WebSocket 端口开启
port=18081
sslport=443
```

### 使用 WSS（如果需要 HTTPS）

如果您的页面是 HTTPS，需要使用 WSS：
```
wss://10.18.21.219:443/rtp/...live.flv?originTypeStr=rtp_push
```

---

## 🎯 立即行动

### 最简单的测试（30秒）

1. **刷新浏览器页面**（Ctrl+Shift+R）
2. **点击 "WS-FLV (推荐)"** 快捷按钮
3. **点击 "播放"**
4. **观察是否成功**

### 预期成功的标志

```
✅ 流类型: ws-flv
✅ 加载 WebSocket-FLV 流
✅ [FLV] 收到元数据: 3840×2160
✅ [FLV] MEDIA_INFO  ← 关键！
✅ [Video] loadeddata
✅ readyState=3 或 4
✅ [Video] playing
✅ 视频画面显示
✅ 延迟 <1秒
```

---

## 📞 测试后请反馈

### 方案 1：WS-FLV 测试结果

- [ ] 是否出现 `[FLV] MEDIA_INFO`？
- [ ] `readyState` 是否变化到 3 或 4？
- [ ] 视频是否播放？
- [ ] 延迟是多少？

### 方案 2：FMP4-WS 测试结果

- [ ] 是否播放？
- [ ] 延迟如何？
- [ ] 与 WS-FLV 对比？

### 如果都失败

请提供：
1. 完整的日志（从"开始播放"到失败）
2. 浏览器控制台的错误（F12 → Console）
3. Network 中 WebSocket 请求的状态

---

## 🚀 总结

**推荐方案**：
1. **首选**：WebSocket-FLV (ws://)
2. **备选**：WebSocket-FMP4 (ws://)
3. **降级**：如果 WebSocket 有问题，考虑配置 WVP 的 HTTP-FLV

**关键优势**：
- ✅ 延迟 <1秒
- ✅ 您的本地流已验证成功
- ✅ 避开了 HTTP-FLV 的兼容性问题

**立即测试 WS-FLV，很可能直接解决问题！** 🎉

---

**文档版本**: 1.0  
**更新日期**: 2025-10-29  
**适用版本**: WVP 2.7.4+, H265Player.vue v1.2


