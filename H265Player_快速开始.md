# H265Player 快速开始指南

## 🎉 组件已成功集成！

增强型视频播放器组件已成功替换首页的 SimpleStreamPlayer，现在可以开始使用了。

## ✅ 已解决的问题

1. ✅ **ESLint 错误**: 已添加 `/* eslint-disable no-undef */` 解决 defineProps 警告
2. ✅ **h265web.js 依赖问题**: 改用更稳定的 FLV.js 和 HLS.js
3. ✅ **视频元素**: 使用 `<video>` 元素替代 `<canvas>`
4. ✅ **事件监听**: 完整的视频事件监听系统
5. ✅ **零编译错误**: 所有文件通过编译和 lint 检查

## 🚀 快速开始

### 1. 启动开发服务器

```bash
cd belt
npm run serve
```

### 2. 访问首页

打开浏览器访问：`http://localhost:8080`

### 3. 使用播放器

在首页的视频播放区域，你会看到新的增强型播放器：

1. **输入流地址**
   - 在输入框中输入流媒体地址
   - 或点击快捷标签选择预设地址

2. **支持的流格式**
   - HTTP-FLV: `http://localhost:8080/live/camera1.live.flv`
   - HLS: `http://localhost:8080/live/camera1/hls.m3u8`

3. **开始播放**
   - 点击"播放"按钮开始播放
   - 点击"停止"按钮停止播放
   - 点击"显示调试"查看详细信息

### 4. 查看调试信息

调试面板显示以下信息：

#### 连接状态
- 播放器当前状态（未连接/连接中/播放中/错误）
- 流地址
- 播放器类型

#### 视频信息
- 分辨率（宽×高）
- 帧率（FPS）
- 编码格式
- 码率

#### 性能统计
- 已接收帧数
- 已解码帧数
- 丢帧数
- 缓冲延迟
- 运行时长

#### 网络信息
- 接收字节数
- 下载速度
- 连接时间

#### 事件日志
- 实时显示所有事件
- 颜色编码（蓝/绿/黄/红）
- 时间戳（精确到毫秒）

## 📝 测试流地址

### 本地测试流

如果你已经配置了本地流媒体服务器：

```
HTTP-FLV: http://localhost:8080/live/camera1.live.flv
HLS: http://localhost:8080/live/camera1/hls.m3u8
```

### 公共测试流

可以使用这些公共测试流进行测试：

```
Big Buck Bunny (HLS): https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8
```

## 🛠️ 工具类使用

如果你需要在其他地方使用工具类：

```javascript
import { 
  ByteConverter, 
  BitrateConverter, 
  TimeConverter,
  StreamUrlParser
} from '@/utils/videoPlayerUtils'

// 格式化字节
const size = ByteConverter.format(1048576) // "1.00 MB"

// 格式化比特率
const rate = BitrateConverter.format(8000000) // "8.00 Mbps"

// 格式化时间
const time = TimeConverter.format(3661) // "01:01:01"

// 检测流类型
const type = StreamUrlParser.detectType('http://example.com/live.flv') // "flv"
```

## 🔧 组件配置

### 在其他页面使用

```vue
<template>
  <H265Player 
    :default-url="streamUrl"
    :autoplay="false"
  />
</template>

<script setup>
import H265Player from '@/components/H265Player.vue'
import { ref } from 'vue'

const streamUrl = ref('http://localhost:8080/live/stream.flv')
</script>
```

### 组件属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `default-url` | String | `''` | 默认流地址 |
| `autoplay` | Boolean | `false` | 是否自动播放 |

## 📊 性能建议

### 最佳实践

1. **流媒体服务器配置**
   - 确保服务器支持 CORS
   - 使用适当的缓冲区大小
   - 配置合理的码率

2. **网络要求**
   - 稳定的网络连接
   - 足够的带宽（建议 ≥ 视频码率 × 1.2）

3. **浏览器要求**
   - Chrome 87+（推荐）
   - Edge 87+
   - Firefox 78+
   - Safari 14+

## ❓ 常见问题

### Q: 播放失败怎么办？

**A**: 检查以下几点：
1. 流地址是否正确
2. 流媒体服务器是否运行
3. 网络是否通畅
4. 查看调试面板中的错误日志

### Q: 如何修改快捷流地址？

**A**: 编辑 `H265Player.vue` 中的 `quickUrls` 数组：

```javascript
const quickUrls = ref([
  { name: '自定义流1', url: 'http://your-server/stream1.flv' },
  { name: '自定义流2', url: 'http://your-server/stream2.m3u8' }
])
```

### Q: 播放卡顿怎么办？

**A**: 
1. 检查网络速度是否足够
2. 降低视频码率或分辨率
3. 查看丢帧统计
4. 确保设备性能足够

### Q: 如何隐藏调试面板？

**A**: 点击"隐藏调试"按钮，或在组件中设置初始状态：

```javascript
const showDebug = ref(false) // 默认隐藏
```

## 📞 技术支持

如遇到问题：

1. 查看浏览器控制台错误信息
2. 检查调试面板中的事件日志
3. 阅读完整文档：`H265Player_README.md`
4. 查看集成总结：`H265Player集成总结.md`

## 🎯 下一步

- [ ] 测试不同流格式
- [ ] 调整快捷流地址
- [ ] 根据需求自定义 UI
- [ ] 集成到其他页面

---

**享受使用新的增强型视频播放器！** 🎬

**作者**: Belt System  
**日期**: 2025-10-29  
**版本**: 1.0.0


