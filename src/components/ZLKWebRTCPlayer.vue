<template>
  <div class="zlk-webrtc-player">
    <video
      ref="videoElement"
      class="webrtc-video"
      autoplay
      playsinline
      muted
      :controls="showControls"
      preload="none"
      disablePictureInPicture
      disableRemotePlayback
      x5-video-player-type="h5"
      x5-video-player-fullscreen="false"
      x5-video-orientation="portraint"
      webkit-playsinline
      crossorigin="anonymous"
    ></video>
    
    <!-- 状态指示器 -->
    <div v-if="showStatus" class="player-status" :class="statusClass">
      <span class="status-text">{{ statusText }}</span>
    </div>

    <!-- 统计信息 -->
    <div v-if="showStats && stats" class="player-stats">
      <div class="stat-item">
        <span class="label">延迟:</span>
        <span class="value">{{ stats.latency }}ms</span>
      </div>
      <div class="stat-item">
        <span class="label">帧率:</span>
        <span class="value">{{ stats.fps }} fps</span>
      </div>
      <div class="stat-item">
        <span class="label">码率:</span>
        <span class="value">{{ stats.bitrate }} kbps</span>
      </div>
    </div>
  </div>
</template>

<script setup>
/* eslint-disable no-undef */
import { ref, onMounted, onBeforeUnmount, watch, computed } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  // ZLMediaKit 服务器地址
  serverUrl: {
    type: String,
    required: true,
    default: 'http://127.0.0.1:18081'
  },
  // 流应用名
  app: {
    type: String,
    required: true,
    default: 'live'
  },
  // 流ID
  stream: {
    type: String,
    required: true
  },
  // 是否自动播放
  autoPlay: {
    type: Boolean,
    default: true
  },
  // 是否显示控制条
  showControls: {
    type: Boolean,
    default: false
  },
  // 是否显示状态
  showStatus: {
    type: Boolean,
    default: true
  },
  // 是否显示统计信息
  showStats: {
    type: Boolean,
    default: false
  },
  // 是否使用 HTTPS (WebRTC over TLS)
  useHttps: {
    type: Boolean,
    default: false
  },
  // 视频编解码器偏好 (根据 config.ini: H264,H265,AV1,VP9,VP8)
  videoCodec: {
    type: String,
    default: 'H264',
    validator: (value) => ['H264', 'H265', 'AV1', 'VP9', 'VP8'].includes(value)
  },
  // 音频编解码器偏好 (根据 config.ini: PCMA,PCMU,opus,mpeg4-generic)
  audioCodec: {
    type: String,
    default: 'opus',
    validator: (value) => ['PCMA', 'PCMU', 'opus', 'mpeg4-generic'].includes(value)
  },
  // 性能模式 (多路播放时使用)
  performanceMode: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['play', 'pause', 'error', 'stats-update'])

// 引用
const videoElement = ref(null)
const pc = ref(null) // RTCPeerConnection
const status = ref('idle') // idle, connecting, playing, error, stopped
const errorMessage = ref('')
const stats = ref({
  latency: 0,
  fps: 0,
  bitrate: 0
})

// 重连相关
const reconnectAttempts = ref(0)
const maxReconnectAttempts = 3
const reconnectDelay = 2000 // 2秒后重连
let reconnectTimer = null

// 计算状态类和文本
const statusClass = computed(() => {
  return {
    'status-idle': status.value === 'idle',
    'status-connecting': status.value === 'connecting',
    'status-playing': status.value === 'playing',
    'status-error': status.value === 'error',
    'status-stopped': status.value === 'stopped'
  }
})

const statusText = computed(() => {
  const textMap = {
    idle: '未播放',
    connecting: reconnectAttempts.value > 0 ? `重连中 (${reconnectAttempts.value}/${maxReconnectAttempts})...` : '连接中...',
    playing: '播放中',
    error: `错误: ${errorMessage.value}`,
    stopped: '已停止'
  }
  return textMap[status.value] || '未知状态'
})

// 监听流地址变化
watch(() => [props.app, props.stream], () => {
  if (status.value === 'playing') {
    stop()
    if (props.autoPlay) {
      setTimeout(() => play(), 500)
    }
  }
})

// 播放
const play = async () => {
  try {
    status.value = 'connecting'
    
    // 创建 RTCPeerConnection - 性能优化配置
    const configuration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' }
      ],
      // 多路播放优化：降低 ICE 收集开销
      iceTransportPolicy: 'all',
      bundlePolicy: 'max-bundle', // 复用端口，减少连接数
      rtcpMuxPolicy: 'require', // 强制 RTP/RTCP 复用
      // 编码器参数 - 针对多路播放优化
      encodedInsertableStreams: false // 禁用插入流，降低CPU开销
    }
    
    pc.value = new RTCPeerConnection(configuration)
    
    // 监听 ICE 候选（减少日志输出）
    pc.value.onicecandidate = () => {
      // 仅在需要时输出日志
      // console.log('ICE candidate:', event.candidate)
    }
    
    // 监听连接状态变化
    pc.value.onconnectionstatechange = () => {
      console.log('Connection state:', pc.value.connectionState)
      
      if (pc.value.connectionState === 'connected') {
        status.value = 'playing'
        reconnectAttempts.value = 0 // 重置重连次数
        emit('play')
      } else if (pc.value.connectionState === 'disconnected') {
        console.log('WebRTC 连接断开，尝试重连...')
        attemptReconnect()
      } else if (pc.value.connectionState === 'failed') {
        console.log('WebRTC 连接失败，尝试重连...')
        attemptReconnect()
      } else if (pc.value.connectionState === 'closed') {
        console.log('WebRTC 连接已关闭')
        // 如果是用户主动关闭，不重连
      }
    }
    
    // 监听轨道
    pc.value.ontrack = (event) => {
      // console.log('Received track:', event.track.kind)
      if (videoElement.value && event.streams[0]) {
        if (!videoElement.value.srcObject) {
          videoElement.value.srcObject = event.streams[0]
          
          // 性能优化：设置视频元素的硬件加速属性
          if (props.performanceMode) {
            // 多路播放时降低视频质量以减少GPU负载
            videoElement.value.style.imageRendering = 'pixelated'
            videoElement.value.style.filter = 'contrast(0.95)'
          }
        }
      }
    }
    
    // 添加收发器 (Transceiver) - 仅接收
    pc.value.addTransceiver('video', { direction: 'recvonly' })
    pc.value.addTransceiver('audio', { direction: 'recvonly' })
    
    // 创建 Offer
    const offer = await pc.value.createOffer({
      offerToReceiveAudio: true,
      offerToReceiveVideo: true
    })
    
    // 设置本地描述
    await pc.value.setLocalDescription(offer)
    
    // 构建 WebRTC 播放 URL（将参数放在 URL 中）
    const protocol = props.useHttps ? 'https' : 'http'
    const baseUrl = props.serverUrl.replace(/^https?:\/\//, '')
    const webrtcUrl = `${protocol}://${baseUrl}/index/api/webrtc?app=${props.app}&stream=${props.stream}&type=play`
    
    // 减少日志输出，降低性能开销
    // console.log('WebRTC 请求 URL:', webrtcUrl)
    
    // 发送 SDP Offer 到 ZLMediaKit
    const response = await fetch(webrtcUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain'
      },
      body: offer.sdp  // 直接发送 SDP 字符串（ZLMediaKit 需要纯文本格式）
    })
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    const result = await response.json()
    
    // 减少日志输出
    // console.log('ZLMediaKit WebRTC 响应:', result)
    
    if (result.code !== 0) {
      throw new Error(result.msg || 'WebRTC 请求失败')
    }
    
    // 检查是否有返回的 SDP
    if (!result.sdp) {
      throw new Error('服务器未返回 SDP Answer')
    }
    
    // 设置远程描述 (Answer)
    const answer = {
      type: 'answer',
      sdp: result.sdp
    }
    
    await pc.value.setRemoteDescription(answer)
    
    // 启动统计监控（性能模式下不启动）
    if (props.showStats && !props.performanceMode) {
      startStatsMonitor()
    }
    
    // 减少日志输出
    // console.log('WebRTC 播放成功')
    
  } catch (error) {
    handleError(error.message)
  }
}

// 尝试重连
const attemptReconnect = () => {
  // 清除已有的重连定时器
  if (reconnectTimer) {
    clearTimeout(reconnectTimer)
    reconnectTimer = null
  }
  
  if (reconnectAttempts.value >= maxReconnectAttempts) {
    handleError(`WebRTC 连接失败，已尝试重连 ${maxReconnectAttempts} 次`)
    return
  }
  
  reconnectAttempts.value++
  console.log(`准备第 ${reconnectAttempts.value} 次重连...`)
  status.value = 'connecting'
  
  reconnectTimer = setTimeout(() => {
    console.log(`开始第 ${reconnectAttempts.value} 次重连`)
    // 先清理旧连接
    if (pc.value) {
      try {
        pc.value.close()
      } catch (e) {
        console.warn('关闭旧连接失败:', e)
      }
      pc.value = null
    }
    
    // 清除视频源
    if (videoElement.value) {
      videoElement.value.srcObject = null
    }
    
    // 重新播放
    play()
  }, reconnectDelay)
}

// 停止播放
const stop = () => {
  try {
    // 清除重连定时器
    if (reconnectTimer) {
      clearTimeout(reconnectTimer)
      reconnectTimer = null
    }
    
    // 重置重连计数
    reconnectAttempts.value = 0
    
    // 停止统计监控
    stopStatsMonitor()
    
    // 关闭 RTCPeerConnection
    if (pc.value) {
      pc.value.close()
      pc.value = null
    }
    
    // 清除视频源
    if (videoElement.value) {
      videoElement.value.srcObject = null
    }
    
    status.value = 'stopped'
    emit('pause')
    
  } catch (error) {
    console.error('停止播放失败:', error)
  }
}

// 错误处理
const handleError = (message) => {
  console.error('WebRTC Error:', message)
  status.value = 'error'
  errorMessage.value = message
  emit('error', message)
  ElMessage.error(`播放失败: ${message}`)
}

// 统计监控
let statsInterval = null

const startStatsMonitor = () => {
  if (statsInterval) return
  
  // 性能优化：根据性能模式和显示状态动态调整统计频率
  // 多路播放时（performanceMode=true）完全禁用统计，减少 getStats() 调用开销
  let monitorInterval = 0
  
  if (props.performanceMode) {
    // 性能模式：完全禁用统计监控
    monitorInterval = 0
  } else if (props.showStats) {
    // 普通模式：3秒间隔
    monitorInterval = 3000
  }
  
  if (monitorInterval === 0) return
  
  statsInterval = setInterval(async () => {
    if (!pc.value) return
    
    try {
      const statsReport = await pc.value.getStats()
      
      let inboundRtp = null
      statsReport.forEach(report => {
        if (report.type === 'inbound-rtp' && report.mediaType === 'video') {
          inboundRtp = report
        }
      })
      
      if (inboundRtp) {
        // 计算帧率
        if (stats.value._lastFrames && stats.value._lastTimestamp) {
          const framesDelta = inboundRtp.framesDecoded - stats.value._lastFrames
          const timeDelta = (inboundRtp.timestamp - stats.value._lastTimestamp) / 1000
          stats.value.fps = Math.round(framesDelta / timeDelta)
        }
        stats.value._lastFrames = inboundRtp.framesDecoded
        stats.value._lastTimestamp = inboundRtp.timestamp
        
        // 计算码率
        if (stats.value._lastBytes && stats.value._lastBytesTimestamp) {
          const bytesDelta = inboundRtp.bytesReceived - stats.value._lastBytes
          const timeDelta = (inboundRtp.timestamp - stats.value._lastBytesTimestamp) / 1000
          stats.value.bitrate = Math.round((bytesDelta * 8) / timeDelta / 1000) // kbps
        }
        stats.value._lastBytes = inboundRtp.bytesReceived
        stats.value._lastBytesTimestamp = inboundRtp.timestamp
        
        // 延迟 (jitterBufferDelay)
        if (inboundRtp.jitterBufferDelay) {
          stats.value.latency = Math.round(inboundRtp.jitterBufferDelay * 1000)
        }
        
        emit('stats-update', { ...stats.value })
      }
    } catch (error) {
      // 16路播放时减少错误日志输出
      // console.error('获取统计信息失败:', error)
    }
  }, monitorInterval)
}

const stopStatsMonitor = () => {
  if (statsInterval) {
    clearInterval(statsInterval)
    statsInterval = null
  }
}

// 生命周期
onMounted(() => {
  if (props.autoPlay) {
    play()
  }
})

onBeforeUnmount(() => {
  // 清除重连定时器
  if (reconnectTimer) {
    clearTimeout(reconnectTimer)
    reconnectTimer = null
  }
  stop()
})

// 暴露方法给父组件
defineExpose({
  play,
  stop,
  getStatus: () => status.value
})
</script>

<style scoped>
.zlk-webrtc-player {
  position: relative;
  width: 100%;
  height: 100%;
  background: #000;
}

.webrtc-video {
  width: 100%;
  height: 100%;
  object-fit: contain;
  
  /* 关键性能优化 - 启用硬件加速和GPU合成 */
  transform: translateZ(0);
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  will-change: auto; /* 避免过度使用 will-change */
  
  /* CSS Containment - 隔离渲染，大幅提升性能 */
  contain: layout style paint;
  content-visibility: auto; /* 自动管理渲染 */
  
  /* 降低渲染质量以减少GPU负载 */
  image-rendering: optimizeSpeed;
  image-rendering: -webkit-optimize-contrast;
  
  /* 强制使用硬件解码 */
  -webkit-transform: translateZ(0);
  -webkit-font-smoothing: antialiased;
  
  /* 优化合成 */
  isolation: isolate;
}

.player-status {
  position: absolute;
  top: 10px;
  left: 10px;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  backdrop-filter: blur(10px);
  z-index: 10;
}

.status-idle {
  background: rgba(108, 117, 125, 0.9);
  color: #fff;
}

.status-connecting {
  background: rgba(255, 193, 7, 0.9);
  color: #000;
  animation: pulse 1.5s ease-in-out infinite;
}

.status-playing {
  background: rgba(40, 167, 69, 0.9);
  color: #fff;
}

.status-error {
  background: rgba(220, 53, 69, 0.9);
  color: #fff;
}

.status-stopped {
  background: rgba(108, 117, 125, 0.9);
  color: #fff;
}

.player-stats {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 8px 12px;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 4px;
  backdrop-filter: blur(10px);
  z-index: 10;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: #fff;
  margin-bottom: 4px;
}

.stat-item:last-child {
  margin-bottom: 0;
}

.stat-item .label {
  margin-right: 8px;
  opacity: 0.8;
}

.stat-item .value {
  font-weight: 600;
  color: #00ff88;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}
</style>

