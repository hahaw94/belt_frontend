# WVP FLV 元数据问题 - 最终解决方案

## ❌ 问题确认

经过详细测试，问题已明确：

### 测试结果总结

| 格式 | 协议 | 元数据完整性 | [FLV] MEDIA_INFO | readyState | 结果 |
|------|------|--------------|------------------|------------|------|
| 本地 FLV | WebSocket | ✅ 完整 | ✅ 有 | 4 | ✅ 成功 |
| WVP FLV | HTTP | ❌ 不完整 | ❌ 无 | 0 | ❌ 失败 |
| WVP FLV | **WebSocket** | ❌ 不完整 | ❌ 无 | 0 | ❌ 失败 |
| WVP HLS | HTTP | N/A | N/A | 4 | ✅ 成功（延迟高） |

### 元数据对比

**本地流元数据**（成功）：
```json
{
  "width": 3840,
  "height": 2160,
  "framerate": 20,
  "videodatarate": 5000,     ← ✅ 有
  "audiodatarate": 50,       ← ✅ 有
  "audiosamplerate": 16000,
  "videocodecid": 7
}
```

**WVP 流元数据**（失败）：
```json
{
  "width": 3840,
  "height": 2160,
  "framerate": 20,
  "videocodecid": 7,
  "title": "Streamed by ZLMediaKit(...)",
  "duration": 0,
  "fileSize": 0
  // ❌ 缺少 videodatarate
  // ❌ 缺少 audiodatarate
  // ❌ 缺少 audiosamplerate
}
```

**根本原因**：
- WVP 的 FLV 流缺少关键元数据字段
- FLV.js 收到元数据后无法正确解析，不触发 `MEDIA_INFO` 事件
- 没有 `MEDIA_INFO`，video 元素无法接收数据（readyState=0）
- **这不是协议问题（HTTP/WebSocket 都一样），是 WVP 推流的问题**

---

## ✅ 解决方案（按可行性排序）

### 🥇 方案 1：使用 FMP4-WS 格式 ⭐⭐⭐⭐⭐

**最有可能成功！延迟 <1秒**

#### 原因

FMP4 使用不同的封装格式，可能不受元数据问题影响。

#### 操作步骤

1. **刷新页面**（Ctrl+Shift+R）
2. **点击 "FMP4-WS" 快捷按钮**
3. **点击播放**
4. **观察日志**

#### 预期效果

如果成功，应该看到：
```
✅ 流类型: ws-fmp4
✅ 加载 WebSocket-FMP4 流
✅ [Video] loadeddata
✅ readyState=3 或 4
✅ 播放成功
```

#### 如果失败

尝试 HTTP-FMP4（手动输入）：
```
http://10.18.21.219:18081/rtp/34020000001320000001_34020000001320000001.live.mp4?originTypeStr=rtp_push
```

---

### 🥈 方案 2：降低分辨率到 1080p ⭐⭐⭐⭐

**最稳定，但需要修改摄像头配置**

#### 原因

1. 降低分辨率后，元数据生成可能正常
2. 1080p 数据量小，浏览器处理更容易
3. 您的本地 4K 流能播放，但 WVP 4K 不行，可能是 4K 处理流程有问题

#### 操作步骤

1. **登录 WVP 后台**
   ```
   http://10.18.21.219:18080
   ```

2. **设备管理** → **国标设备** → **通道列表**

3. **找到通道** `34020000001320000001`

4. **编辑视频参数**
   - 分辨率: **1920×1080** (1080p)
   - 帧率: **20 FPS**
   - 码率: **3000-4000 Kbps**

5. **保存并重启推流**

6. **回到播放器重新播放**

#### 预期效果

如果元数据问题是由 4K 引起的，降低分辨率后应该能正常播放。

---

### 🥉 方案 3：重新配置 WVP 推流 ⭐⭐⭐

**修复元数据生成问题**

#### 步骤 1：检查摄像头是否有音频

GB28181 设备可能没有音频流，导致音频元数据缺失。

1. **登录 WVP 后台**
2. **查看设备详情**
3. **确认是否支持音频**

#### 步骤 2：修改 ZLMediaKit 配置

编辑 `smart-video-platform/Release/config.ini`：

```ini
[protocol]
add_mute_audio=1          # 已有，确保启用
enable_audio=1            # 已有，确保启用

# 尝试添加以下配置（如果没有）
[rtmp]
add_mute_audio=1
```

#### 步骤 3：重启服务

```powershell
# 停止服务
taskkill /F /IM MediaServer.exe
taskkill /F /IM smart-video-platform.exe

# 重新启动
cd D:\study\belt_frontend\front\smart-video-platform\Release
start MediaServer.exe

cd D:\study\belt_frontend\front\smart-video-platform
start smart-video-platform.exe
```

#### 步骤 4：重启推流

在 WVP 后台停止并重新开始推流。

---

### 🏅 方案 4：使用 HLS 并接受延迟 ⭐⭐

**稳定但延迟高（2-10秒）**

如果实时性要求不是特别高，HLS 是最稳定的方案。

#### 优化 HLS 延迟

在 `smart-video-platform/Release/config.ini` 中：

```ini
[hls]
segDur=1          # 减小分片时长到1秒（默认2秒）
segNum=2          # 减小分片数量到2个（默认3个）
```

重启 MediaServer 后，HLS 延迟可降低到 2-4秒。

---

## 🧪 立即测试步骤

### 第一优先级：FMP4-WS ⭐⭐⭐⭐⭐

**30秒测试**

1. 刷新页面
2. 点击 **"FMP4-WS"**
3. 点击播放
4. 观察是否成功

### 第二优先级：降低分辨率 ⭐⭐⭐⭐

**5分钟操作**

1. WVP 后台修改分辨率
2. 重启推流
3. 重新播放

### 第三优先级：重新配置 WVP ⭐⭐⭐

**10分钟操作**

1. 修改配置文件
2. 重启服务
3. 重启推流
4. 测试

---

## 📊 为什么 FMP4 可能成功？

### FLV vs FMP4 元数据处理

| 特性 | FLV | FMP4 |
|------|-----|------|
| 元数据位置 | 流开始处（onMetaData 标签） | 每个分片的 moov box |
| 元数据要求 | **必须完整**，否则无法解析 | 可以缺少某些字段 |
| FLV.js 解析 | **严格**，缺少字段会失败 | **容错性更好** |
| 浏览器支持 | MSE + FLV demuxer | MSE + MP4 demuxer（原生更好） |

**结论**：FMP4 格式对元数据不完整的容错性更好！

---

## 💡 诊断增强

现在播放器会自动检测元数据问题并给出建议：

### 播放 WVP 流时会看到

```
✅ [FLV] 收到元数据: 3840×2160
完整元数据: {...}
⚠️ 元数据缺少 videodatarate      ← 自动检测
⚠️ 元数据缺少 audiodatarate      ← 自动检测
视频编码: H.264/AVC

========== 检测到 WVP 元数据问题 ==========
建议解决方案:
1. 尝试点击 "FMP4-WS" 格式          ← 自动建议
2. 或在 WVP 后台降低分辨率到 1080p
3. 或重启 WVP 推流
=========================================
```

---

## 🎯 推荐流程

### 快速测试（2分钟）

```
1. 测试 FMP4-WS  ← 最可能成功
   ↓ 如果失败
2. 测试 HTTP-FMP4
   ↓ 如果失败
3. 看下面
```

### 彻底解决（10分钟）

```
1. 降低分辨率到 1080p  ← 最稳定
   或
2. 重新配置 WVP
   或
3. 使用 HLS 并接受延迟
```

---

## 📞 测试反馈清单

### 测试 FMP4-WS 后请告诉我

- [ ] 是否出现 `[Video] loadeddata`？
- [ ] `readyState` 是否变化到 3 或 4？
- [ ] 视频是否播放？
- [ ] 延迟如何？
- [ ] 是否有错误？

### 如果失败

请提供：
1. 完整日志（从"开始播放"开始）
2. 浏览器控制台错误（F12 → Console）
3. 我会继续帮您排查

---

## 🚀 总结

**问题根源**：
- ❌ WVP 推送的 FLV 流缺少关键元数据（videodatarate, audiodatarate）
- ❌ FLV.js 无法正确解析，不触发 MEDIA_INFO 事件
- ❌ video 元素收不到数据（readyState=0）

**最佳方案（按优先级）**：
1. ⭐⭐⭐⭐⭐ **FMP4-WS** - 立即测试，最可能成功
2. ⭐⭐⭐⭐ **降低分辨率** - 最稳定的解决方案
3. ⭐⭐⭐ **重新配置 WVP** - 修复根本问题
4. ⭐⭐ **HLS 优化** - 接受延迟的稳定方案

**立即行动**：
```
1. 刷新页面
2. 点击 "FMP4-WS"
3. 点击播放
4. 观察结果
```

很可能直接解决问题！如果不行，我们再试下一个方案。🎉

---

**文档版本**: 2.0  
**更新日期**: 2025-10-29  
**状态**: 问题确诊，待测试 FMP4 格式


