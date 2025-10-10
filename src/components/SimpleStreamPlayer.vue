<template>
  <div class="simple-stream-player">
    <video
      ref="videoRef"
      :poster="poster"
      controls
      muted
      autoplay
      playsinline
      preload="auto"
      :webkit-playsinline="true"
      class="video-element"
      @loadstart="onLoadStart"
      @canplay="onCanPlay"
      @error="onError"
    >
      您的浏览器不支持视频播放
    </video>
    <div v-if="loading" class="loading-overlay">
      <el-icon class="is-loading"><Loading /></el-icon>
      <span>加载中...</span>
    </div>
    <div v-if="error" class="error-overlay">
      <el-icon><Warning /></el-icon>
      <span>{{ error }}</span>
      <button @click="retry" class="retry-btn">重试</button>
    </div>
  </div>
</template>

<script setup>
/* eslint-disable no-undef */
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { ElIcon } from 'element-plus'
import { Loading, Warning } from '@element-plus/icons-vue'

const props = defineProps({
  src: {
    type: String,
    required: true
  },
  poster: {
    type: String,
    default: ''
  },
  autoplay: {
    type: Boolean,
    default: true
  },
  type: {
    type: String,
    default: 'auto', // 'auto', 'flv', 'hls', 'rtmp'
    validator: (value) => ['auto', 'flv', 'hls', 'rtmp'].includes(value)
  }
})

const videoRef = ref(null)
const loading = ref(true)
const error = ref('')
const player = ref(null)

// 自动检测流类型
const detectStreamType = (url) => {
  if (!url) return 'unknown'
  
  const urlLower = url.toLowerCase()
  if (urlLower.includes('.flv') || urlLower.includes('/flv/')) {
    return 'flv'
  } else if (urlLower.includes('.m3u8') || urlLower.includes('/hls/')) {
    return 'hls'
  } else if (urlLower.startsWith('rtmp://')) {
    return 'rtmp'
  } else if (urlLower.startsWith('rtsp://')) {
    return 'rtsp'
  }
  return 'unknown'
}

// 加载FLV流
const loadFLV = async () => {
  if (!videoRef.value) return

  try {
    const flvjs = await import('flv.js')
    
    if (!flvjs.default.isSupported()) {
      error.value = '您的浏览器不支持FLV播放，请使用Chrome/Edge/Firefox'
      loading.value = false
      return
    }

    // 清理之前的播放器
    if (player.value) {
      try {
        player.value.unload()
        player.value.detachMediaElement()
        player.value.destroy()
      } catch (e) {
        console.warn('清理播放器失败:', e)
      }
      player.value = null
    }

    console.log('开始加载FLV流:', props.src)

    player.value = flvjs.default.createPlayer({
      type: 'flv',
      url: props.src,
      isLive: true,
      hasAudio: true,
      hasVideo: true,
      cors: true,
      withCredentials: false
    }, {
      enableWorker: false,
      enableStashBuffer: true,          // 启用缓冲区以保证流畅播放
      stashInitialSize: 384,             // 增加初始缓存大小 (384KB)
      lazyLoad: false,
      lazyLoadMaxDuration: 3,            // 增加懒加载最大持续时间
      lazyLoadRecoverDuration: 1,        // 增加恢复持续时间
      autoCleanupSourceBuffer: true,     // 保持自动清理以避免内存泄漏
      autoCleanupMaxBackwardDuration: 12, // 增加到12秒，避免过早清理
      autoCleanupMinBackwardDuration: 8,  // 增加到8秒
      fixAudioTimestampGap: true,
      accurateSeek: false,
      seekType: 'range',
      reuseRedirectedURL: true
    })

    player.value.attachMediaElement(videoRef.value)
    
    // 监听错误事件
    player.value.on(flvjs.default.Events.ERROR, (errorType, errorDetail, errorInfo) => {
      console.error('FLV播放错误:', { errorType, errorDetail, errorInfo })
      
      let errorMsg = ''
      if (errorType === 'NetworkError') {
        errorMsg = '网络错误：\n'
        if (errorDetail === 'Exception') {
          errorMsg += '• 无法连接到服务器，请检查：\n'
          errorMsg += '1. 流地址是否正确\n'
          errorMsg += '2. ZLMediaKit是否运行\n'
          errorMsg += '3. 是否存在跨域问题\n'
          errorMsg += '4. 防火墙是否允许访问'
        } else {
          errorMsg += `详细信息: ${errorDetail}`
        }
      } else if (errorType === 'MediaError') {
        errorMsg = `媒体错误: ${errorDetail}\n可能是流格式不正确`
      } else {
        errorMsg = `播放失败: ${errorType} - ${errorDetail}`
      }
      
      error.value = errorMsg
      loading.value = false
    })

    // 监听加载成功事件
    player.value.on(flvjs.default.Events.LOADING_COMPLETE, () => {
      console.log('FLV流加载完成')
      loading.value = false
    })

    player.value.on(flvjs.default.Events.METADATA_ARRIVED, (metadata) => {
      console.log('收到FLV元数据:', metadata)
      loading.value = false
    })

    player.value.load()

    // 自动播放
    if (props.autoplay) {
      await nextTick()
      try {
        await videoRef.value.play()
        console.log('FLV自动播放成功')
      } catch (err) {
        console.warn('自动播放失败，需要用户点击播放:', err)
        // 自动播放失败不算错误，用户点击播放按钮即可
      }
    }

  } catch (err) {
    console.error('加载FLV播放器失败:', err)
    error.value = '加载播放器失败：' + err.message
    loading.value = false
  }
}

// 加载HLS流
const loadHLS = async () => {
  if (!videoRef.value) return

  try {
    // 检查浏览器是否原生支持HLS (Safari等)
    if (videoRef.value.canPlayType('application/vnd.apple.mpegurl')) {
      videoRef.value.src = props.src
      if (props.autoplay) {
        await nextTick()
        videoRef.value.play().catch(err => {
          console.warn('自动播放失败:', err)
        })
      }
      return
    }

    // 使用hls.js
    const { default: Hls } = await import('hls.js')
    
    if (!Hls.isSupported()) {
      error.value = '您的浏览器不支持HLS播放'
      loading.value = false
      return
    }

    // 清理之前的播放器
    if (player.value) {
      player.value.destroy()
      player.value = null
    }

    player.value = new Hls({
      enableWorker: true,
      lowLatencyMode: true,
      backBufferLength: 90,
      maxBufferLength: 30,           // 最大缓冲长度30秒
      maxMaxBufferLength: 600,        // 最大缓冲长度上限10分钟
      maxBufferSize: 60 * 1000 * 1000, // 最大缓冲大小60MB
      maxBufferHole: 0.5,             // 最大缓冲空洞0.5秒
      liveSyncDurationCount: 3,       // 直播同步持续时间计数
      liveMaxLatencyDurationCount: 10 // 直播最大延迟持续时间计数
    })

    player.value.loadSource(props.src)
    player.value.attachMedia(videoRef.value)

    player.value.on(Hls.Events.MANIFEST_PARSED, () => {
      console.log('HLS manifest解析成功')
      if (props.autoplay) {
        videoRef.value.play().catch(err => {
          console.warn('自动播放失败:', err)
        })
      }
    })

    player.value.on(Hls.Events.ERROR, (event, data) => {
      console.error('HLS播放错误:', data)
      if (data.fatal) {
        error.value = `播放失败: ${data.type}`
        loading.value = false
      }
    })

  } catch (err) {
    console.error('加载HLS播放器失败:', err)
    error.value = '加载播放器失败，请检查网络或流地址'
    loading.value = false
  }
}

// 加载流媒体
const loadStream = async () => {
  if (!props.src || !videoRef.value) return

  loading.value = true
  error.value = ''

  // 确定流类型
  let streamType = props.type
  if (streamType === 'auto') {
    streamType = detectStreamType(props.src)
  }

  console.log('检测到流类型:', streamType, '地址:', props.src)

  // 根据类型加载对应播放器
  switch (streamType) {
    case 'flv':
      await loadFLV()
      break
    case 'hls':
      await loadHLS()
      break
    case 'rtmp':
    case 'rtsp':
      error.value = 'RTMP/RTSP流需要先通过服务器转码为FLV或HLS格式'
      loading.value = false
      break
    default:
      // 默认尝试FLV
      await loadFLV()
      break
  }
}

// 重试
const retry = () => {
  error.value = ''
  loading.value = true
  loadStream()
}

// 清理播放器
const cleanup = () => {
  if (player.value) {
    try {
      if (typeof player.value.destroy === 'function') {
        player.value.destroy()
      }
    } catch (err) {
      console.error('清理播放器失败:', err)
    }
    player.value = null
  }
  if (videoRef.value) {
    videoRef.value.src = ''
  }
}

// 事件处理
const onLoadStart = () => {
  loading.value = true
  error.value = ''
}

const onCanPlay = () => {
  loading.value = false
  console.log('视频可以播放')
}

const onError = (event) => {
  loading.value = false
  error.value = '视频加载失败，请检查流地址或网络连接'
  console.error('Video error:', event)
}

// 监听src变化
watch(() => props.src, (newSrc) => {
  if (newSrc) {
    cleanup()
    nextTick(() => {
      loadStream()
    })
  }
}, { immediate: false })

onMounted(() => {
  if (props.src) {
    loadStream()
  }
})

onUnmounted(() => {
  cleanup()
})
</script>

<style scoped>
.simple-stream-player {
  position: relative;
  width: 100%;
  height: 100%;
  background: #000;
  border-radius: 4px;
  overflow: hidden;
}

.video-element {
  width: 100%;
  height: 100%;
  object-fit: contain;
  background: #000;
}

.loading-overlay,
.error-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.8);
  color: #fff;
  gap: 12px;
  z-index: 10;
}

.loading-overlay .el-icon {
  font-size: 32px;
  color: #00d4ff;
}

.error-overlay .el-icon {
  font-size: 40px;
  color: #f56c6c;
}

.error-overlay span {
  max-width: 80%;
  text-align: center;
  line-height: 1.5;
}

.retry-btn {
  margin-top: 10px;
  padding: 8px 20px;
  background: #00d4ff;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
}

.retry-btn:hover {
  background: #00b8e6;
  transform: scale(1.05);
}
</style>

 