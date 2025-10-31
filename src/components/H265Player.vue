<template>
  <div class="h265-player-container">
    <!-- 控制面板 -->
    <div class="control-panel">
      <div class="input-group">
        <el-input
          v-model="streamUrl"
          placeholder="请输入流地址 (支持 WebSocket/HTTP-FLV/HLS 等)"
          class="stream-input"
          @keyup.enter="playStream"
        >
          <template #prepend>
            <el-icon><VideoCamera /></el-icon>
          </template>
        </el-input>
        <el-button 
          type="primary" 
          :loading="isConnecting"
          @click="playStream"
          class="play-button"
        >
          {{ isPlaying ? '重新播放' : '播放' }}
        </el-button>
        <el-button 
          type="danger" 
          :disabled="!isPlaying"
          @click="stopStream"
          class="stop-button"
        >
          停止
        </el-button>
        <el-button 
          @click="toggleDebugPanel"
          class="debug-button"
        >
          {{ showDebug ? '隐藏调试' : '显示调试' }}
        </el-button>
        <el-button 
          @click="testConnection"
          class="test-button"
          :disabled="!streamUrl"
        >
          测试连接
        </el-button>
      </div>

      <!-- 快捷流地址选择 -->
      <div class="quick-urls">
        <span class="quick-label">快捷选择：</span>
        <el-tag
          v-for="(url, index) in quickUrls"
          :key="index"
          @click="selectQuickUrl(url)"
          class="quick-tag"
          :type="streamUrl === url.url ? 'primary' : 'info'"
        >
          {{ url.name }}
        </el-tag>
      </div>
      
      <!-- 诊断提示 -->
      <div class="diagnostic-hint">
        <el-icon><InfoFilled /></el-icon>
        <span>如果播放失败或下载速度为 0，请先点击 <strong>"测试连接"</strong> 按钮进行诊断</span>
      </div>
    </div>

    <!-- 视频播放区域 -->
    <div class="player-wrapper">
      <div class="video-container" ref="videoContainer">
        <video 
          ref="videoCanvas" 
          class="video-canvas"
          controls
          muted
          autoplay
          playsinline
          preload="auto"
          webkit-playsinline
        ></video>
        
        <!-- 加载状态 -->
        <div v-if="isConnecting" class="loading-overlay">
          <el-icon class="is-loading loading-icon"><Loading /></el-icon>
          <span class="loading-text">正在连接流媒体...</span>
        </div>

        <!-- 错误提示 -->
        <div v-if="errorMessage" class="error-overlay">
          <el-icon class="error-icon"><Warning /></el-icon>
          <span class="error-text">{{ errorMessage }}</span>
          <el-button @click="retryPlay" type="primary" size="small">重试</el-button>
        </div>

        <!-- 无视频提示 -->
        <div v-if="!isPlaying && !isConnecting && !errorMessage" class="placeholder-overlay">
          <el-icon class="placeholder-icon"><VideoCamera /></el-icon>
          <span class="placeholder-text">请输入流地址并点击播放</span>
        </div>
      </div>

      <!-- 调试信息面板 -->
      <div v-show="showDebug" class="debug-panel">
        <div class="debug-header">
          <el-icon><Monitor /></el-icon>
          <span>调试信息</span>
        </div>
        
        <div class="debug-content">
          <!-- 连接状态 -->
          <div class="debug-section">
            <h4>连接状态</h4>
            <div class="debug-item">
              <span class="label">状态：</span>
              <el-tag :type="getStatusType()" size="small">
                {{ getStatusText() }}
              </el-tag>
            </div>
            <div class="debug-item">
              <span class="label">流地址：</span>
              <span class="value">{{ streamUrl || '未设置' }}</span>
            </div>
            <div class="debug-item">
              <span class="label">播放器类型：</span>
              <span class="value">mpegts.js / FLV.js / HLS.js</span>
            </div>
          </div>

          <!-- 视频信息 -->
          <div class="debug-section">
            <h4>视频信息</h4>
            <div class="debug-item">
              <span class="label">分辨率：</span>
              <span class="value">{{ videoInfo.width }} × {{ videoInfo.height }}</span>
            </div>
            <div class="debug-item">
              <span class="label">帧率：</span>
              <span class="value">{{ videoInfo.fps }} FPS</span>
            </div>
            <div class="debug-item">
              <span class="label">编码格式：</span>
              <span class="value">{{ videoInfo.codec }}</span>
            </div>
          </div>

          <!-- 日志信息 -->
          <div class="debug-section">
            <h4>事件日志</h4>
            <div class="log-container">
              <div 
                v-for="(log, index) in eventLogs" 
                :key="index"
                class="log-item"
                :class="log.type"
              >
                <span class="log-time">{{ log.time }}</span>
                <span class="log-message">{{ log.message }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
/* eslint-disable no-undef */
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { VideoCamera, Loading, Warning, Monitor, InfoFilled } from '@element-plus/icons-vue'

const props = defineProps({
  defaultUrl: {
    type: String,
    default: ''
  },
  autoplay: {
    type: Boolean,
    default: false
  }
})

// 响应式数据
const videoCanvas = ref(null)
const videoContainer = ref(null)
const streamUrl = ref(props.defaultUrl)
const isPlaying = ref(false)
const isConnecting = ref(false)
const errorMessage = ref('')
const showDebug = ref(true)

let h265Player = null

const videoInfo = ref({
  width: 0,
  height: 0,
  fps: 0,
  codec: 'H.264'
})

const eventLogs = ref([])

const quickUrls = ref([
  { name: 'WS-FLV (推荐-自动选择播放器)', url: 'ws://10.18.21.202:18081/rtp/34020000001320000001_34020000001320000001.live.flv?originTypeStr=rtp_push' },
  { name: 'HTTP-FLV (备选)', url: 'http://10.18.21.202:18081/rtp/34020000001320000001_34020000001320000001.live.flv?originTypeStr=rtp_push' },
  { name: 'HLS (最兼容)', url: 'http://10.18.21.202:18081/rtp/34020000001320000001_34020000001320000001/hls.m3u8?originTypeStr=rtp_push' },
  { name: 'FMP4-WS (测试)', url: 'ws://10.18.21.202:18081/rtp/34020000001320000001_34020000001320000001.live.mp4?originTypeStr=rtp_push' }
])

// 添加日志
const addLog = (message, type = 'info') => {
  const now = new Date()
  const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`
  
  eventLogs.value.unshift({ time, message, type })
  
  if (eventLogs.value.length > 50) {
    eventLogs.value = eventLogs.value.slice(0, 50)
  }
}

const getStatusType = () => {
  if (isPlaying.value) return 'success'
  if (isConnecting.value) return 'warning'
  if (errorMessage.value) return 'danger'
  return 'info'
}

const getStatusText = () => {
  if (isPlaying.value) return '播放中'
  if (isConnecting.value) return '连接中'
  if (errorMessage.value) return '错误'
  return '未连接'
}

// 辅助函数：解析 readyState
const getReadyStateText = (state) => {
  const stateMap = {
    0: 'HAVE_NOTHING',
    1: 'HAVE_METADATA',
    2: 'HAVE_CURRENT_DATA',
    3: 'HAVE_FUTURE_DATA',
    4: 'HAVE_ENOUGH_DATA'
  }
  return stateMap[state] || 'UNKNOWN'
}

// 辅助函数：获取缓冲信息
const getBufferedInfo = (video) => {
  if (!video.buffered || video.buffered.length === 0) {
    return '0s'
  }
  const buffered = video.buffered.end(video.buffered.length - 1)
  return `${buffered.toFixed(2)}s`
}

// 检测流类型
const detectStreamType = (url) => {
  if (!url) return 'unknown'
  
  const urlWithoutQuery = url.split('?')[0].toLowerCase()
  const urlLower = url.toLowerCase()
  
  // WebSocket FLV
  if ((urlLower.startsWith('ws://') || urlLower.startsWith('wss://')) && urlWithoutQuery.includes('.flv')) {
    return 'ws-flv'
  }
  
  // WebSocket FMP4
  if ((urlLower.startsWith('ws://') || urlLower.startsWith('wss://')) && urlWithoutQuery.includes('.mp4')) {
    return 'ws-fmp4'
  }
  
  // HTTP FLV
  if (urlWithoutQuery.includes('.flv')) {
    return 'flv'
  }
  
  // HTTP FMP4
  if (urlWithoutQuery.includes('.mp4')) {
    return 'fmp4'
  }
  
  // HLS
  if (urlWithoutQuery.includes('.m3u8')) {
    return 'hls'
  }
  
  return 'unknown'
}

// 加载 FMP4 流（原生 video）
const loadNativeFMP4 = async (url) => {
  addLog('使用原生 video 加载 FMP4 流', 'info')
  addLog('⚠️ FMP4 格式可能不稳定，建议使用 FLV 或降低分辨率', 'warning')
  
  try {
    videoCanvas.value.src = url
    await videoCanvas.value.play()
    addLog('✅ FMP4 播放成功', 'success')
    
    // FMP4 播放进度监控和延迟跳转
    const fmp4CheckInterval = setInterval(() => {
      if (!videoCanvas.value || !isPlaying.value) {
        clearInterval(fmp4CheckInterval)
        return
      }
      
      const video = videoCanvas.value
      
      // 检测播放进度是否落后太多（延迟跳转功能）
      if (video.buffered.length > 0 && !video.paused && !video.ended) {
        const bufferedEnd = video.buffered.end(video.buffered.length - 1)
        const currentTime = video.currentTime
        const delay = bufferedEnd - currentTime
        
        // 如果播放进度落后超过3秒，自动跳转到最新位置
        if (delay > 3) {
          addLog(`⚠️ FMP4播放进度落后 ${delay.toFixed(2)}秒，跳转到最新位置`, 'warning')
          try {
            // 跳转到缓冲区末尾前0.5秒的位置，确保流畅播放
            video.currentTime = bufferedEnd - 0.5
            addLog(`✅ 已跳转到最新位置: ${video.currentTime.toFixed(2)}s`, 'success')
          } catch (err) {
            addLog(`❌ 跳转失败: ${err.message}`, 'error')
          }
        }
        // 如果延迟在2-3秒之间，发出警告但不跳转
        else if (delay > 2) {
          addLog(`⚠️ FMP4播放延迟: ${delay.toFixed(2)}秒 (超过3秒将自动跳转)`, 'info')
        }
      }
    }, 2000)
    
    // 保存定时器ID，以便在停止时清理
    if (!window._fmp4Intervals) {
      window._fmp4Intervals = []
    }
    window._fmp4Intervals.push(fmp4CheckInterval)
    
  } catch (err) {
    addLog(`❌ FMP4 播放失败: ${err.message}`, 'error')
    throw err
  }
}

// 加载 mpegts.js 流 (推荐用于 WebSocket-FLV)
const loadMpegts = async (url) => {
  const mpegts = await import('mpegts.js')
  
  if (!mpegts.default.isSupported()) {
    addLog('❌ mpegts.js 不支持当前浏览器', 'error')
    
    // 检查原因
    if (typeof MediaSource === 'undefined') {
      addLog('原因: MediaSource API 不可用', 'error')
      addLog('', 'warning')
      addLog('💡 解决方案:', 'warning')
      addLog('  1. 更新浏览器到最新版本', 'info')
      addLog('  2. 或使用 Chrome/Edge 浏览器', 'info')
      addLog('  3. 或继续使用 HLS 格式（已验证可用）', 'success')
    }
    
    throw new Error('浏览器不支持 mpegts.js 播放')
  }
  
  addLog('✅ mpegts.js 支持检测通过', 'success')
  addLog('使用 mpegts.js 加载 WebSocket-FLV 流', 'info')
  
  if (h265Player) {
    try {
      if (typeof h265Player.destroy === 'function') {
        h265Player.destroy()
      }
    } catch (e) {
      console.warn('清理播放器失败:', e)
    }
    h265Player = null
  }
  
  // 正确的 MediaDataSource 配置
  const mediaDataSource = {
    type: 'flv',
    url: url,
    isLive: true
  }
  
  // 正确的 Config 配置
  const config = {
    enableWorker: false,
    enableStashBuffer: false,  // WebSocket 流建议禁用
    isLive: true,
    lazyLoad: false,
    lazyLoadMaxDuration: 3 * 60,
    lazyLoadRecoverDuration: 30,
    deferLoadAfterSourceOpen: false,
    // 关键优化：更激进的缓冲区清理，避免卡顿
    autoCleanupSourceBuffer: true,
    autoCleanupMaxBackwardDuration: 5,  // 保留最近5秒
    autoCleanupMinBackwardDuration: 3,  // 最少保留3秒
    fixAudioTimestampGap: true
  }
  
  h265Player = mpegts.default.createPlayer(mediaDataSource, config)
  h265Player.attachMediaElement(videoCanvas.value)
  
  // 监听事件
  h265Player.on(mpegts.default.Events.ERROR, (errorType, errorDetail, errorInfo) => {
    console.error('mpegts.js 错误:', { errorType, errorDetail, errorInfo })
    addLog(`mpegts.js 错误: ${errorType} - ${errorDetail}`, 'error')
    
    if (errorInfo) {
      addLog(`错误详情: ${JSON.stringify(errorInfo)}`, 'error')
    }
    
    errorMessage.value = `播放错误: ${errorType} - ${errorDetail}`
    isConnecting.value = false
    isPlaying.value = false
  })
  
  h265Player.on(mpegts.default.Events.METADATA_ARRIVED, (metadata) => {
    addLog(`[mpegts.js] 收到元数据: ${metadata.width}×${metadata.height}`, 'success')
    
    videoInfo.value.width = metadata.width || 0
    videoInfo.value.height = metadata.height || 0
    videoInfo.value.fps = Math.round(metadata.framerate) || 0
    
    if (metadata.videocodecid) {
      const codecMap = { 7: 'H.264/AVC', 12: 'H.265/HEVC' }
      addLog(`视频编码: ${codecMap[metadata.videocodecid] || metadata.videocodecid}`, 'info')
    }
    
    // 4K视频警告
    if (metadata.width >= 3840 || metadata.height >= 2160) {
      addLog('⚠️⚠️⚠️ 检测到 4K 超高清视频 ⚠️⚠️⚠️', 'warning')
      addLog('⚠️ 4K视频可能导致以下问题:', 'warning')
      addLog('  1. 解码性能不足，画面卡顿或黑屏', 'warning')
      addLog('  2. WebSocket连接不稳定', 'warning')
      addLog('  3. 浏览器内存占用过高', 'warning')
      addLog('', 'warning')
      addLog('💡 强烈建议的解决方案:', 'warning')
      addLog('  ✅ 方案1: 点击 "HTTP-FLV (备选)" 按钮', 'info')
      addLog('  ✅ 方案2: 点击 "HLS (最兼容)" 按钮', 'info')
      addLog('  ✅ 方案3: 降低摄像头输出分辨率至 1080p', 'info')
      addLog('════════════════════════════════════', 'warning')
      addLog('', 'warning')
      addLog('⏱️ 正在尝试播放，如10秒内无画面请立即切换格式', 'warning')
    }
  })
  
  h265Player.on(mpegts.default.Events.MEDIA_INFO, (mediaInfo) => {
    addLog('[mpegts.js] MEDIA_INFO', 'info')
    addLog(`  ${JSON.stringify(mediaInfo)}`, 'info')
  })
  
  // 添加视频元素事件监听
  const video = videoCanvas.value
  let playingDetected = false
  let playTimeout = null
  
  // 播放超时检测 - 30秒内如果没有进入playing状态，则认为失败
  playTimeout = setTimeout(() => {
    if (!playingDetected) {
      addLog('❌ 播放超时（30秒内未开始播放）', 'error')
      addLog('', 'error')
      addLog('可能的原因:', 'error')
      addLog('1. 4K视频解码性能不足', 'error')
      addLog('2. WebSocket连接不稳定或断开', 'error')
      addLog('3. 网络带宽不足', 'error')
      addLog('', 'warning')
      addLog('💡 强烈推荐的解决方案:', 'warning')
      addLog('✅ 立即尝试: 点击 "HTTP-FLV (备选)" 按钮', 'info')
      addLog('✅ 或尝试: 点击 "HLS (最兼容)" 按钮', 'info')
      addLog('✅ 或降低: 摄像头分辨率至 1080p 或更低', 'info')
    }
  }, 30000)
  
  video.addEventListener('loadedmetadata', () => {
    addLog(`[Video] 元数据加载完成: ${video.videoWidth}×${video.videoHeight}`, 'success')
  })
  
  video.addEventListener('canplay', () => {
    addLog('[Video] 可以开始播放', 'success')
  })
  
  video.addEventListener('playing', () => {
    addLog('[Video] ✅ 正在播放', 'success')
    playingDetected = true
    if (playTimeout) clearTimeout(playTimeout)  // 清除超时定时器
  })
  
  video.addEventListener('waiting', () => {
    addLog('[Video] 缓冲中...', 'warning')
  })
  
  video.addEventListener('error', (e) => {
    const mediaError = video.error
    if (mediaError) {
      const errorCodes = {
        1: 'MEDIA_ERR_ABORTED - 加载被中止',
        2: 'MEDIA_ERR_NETWORK - 网络错误',
        3: 'MEDIA_ERR_DECODE - 解码错误（可能是4K视频解码问题）',
        4: 'MEDIA_ERR_SRC_NOT_SUPPORTED - 格式不支持'
      }
      addLog(`[Video] 视频错误 ${mediaError.code}: ${errorCodes[mediaError.code] || '未知错误'}`, 'error')
      addLog(`错误消息: ${mediaError.message || '无'}`, 'error')
      
      if (mediaError.code === 3) {
        addLog('⚠️ 解码错误，可能是4K视频导致，建议尝试 HTTP-FLV 或 HLS', 'warning')
      }
    } else {
      addLog(`[Video] 视频错误: ${e.message || '未知错误'}`, 'error')
    }
  })
  
  h265Player.load()
  addLog('mpegts.js load() 完成，等待数据...', 'info')
  
  // 卡顿检测和自动恢复
  let lastPlayTime = 0
  let stallCount = 0
  const stallCheckInterval = setInterval(() => {
    if (!videoCanvas.value || !isPlaying.value) {
      clearInterval(stallCheckInterval)
      return
    }
    
    const currentTime = videoCanvas.value.currentTime
    const video = videoCanvas.value
    
    // 新增：检测播放进度是否落后太多（延迟跳转功能）
    if (video.buffered.length > 0 && !video.paused && !video.ended) {
      const bufferedEnd = video.buffered.end(video.buffered.length - 1)
      const delay = bufferedEnd - currentTime
      
      // 如果播放进度落后超过3秒，自动跳转到最新位置
      if (delay > 3) {
        addLog(`⚠️ 播放进度落后 ${delay.toFixed(2)}秒，跳转到最新位置`, 'warning')
        try {
          // 跳转到缓冲区末尾前0.5秒的位置，确保流畅播放
          video.currentTime = bufferedEnd - 0.5
          addLog(`✅ 已跳转到最新位置: ${video.currentTime.toFixed(2)}s`, 'success')
          stallCount = 0  // 重置卡顿计数器
        } catch (err) {
          addLog(`❌ 跳转失败: ${err.message}`, 'error')
        }
      }
      // 如果延迟在2-3秒之间，发出警告但不跳转
      else if (delay > 2) {
        addLog(`⚠️ 播放延迟: ${delay.toFixed(2)}秒 (超过3秒将自动跳转)`, 'info')
      }
    }
    
    // 检测是否卡住（时间没有前进）
    if (currentTime === lastPlayTime && !video.paused && !video.ended) {
      stallCount++
      addLog(`⚠️ 检测到播放卡顿 (${stallCount})`, 'warning')
      
      // 连续卡顿3次（6秒），尝试恢复
      if (stallCount >= 3) {
        addLog('🔄 尝试恢复播放...', 'warning')
        
        try {
          // 方法1：跳转到直播最新位置
          if (video.buffered.length > 0) {
            const bufferedEnd = video.buffered.end(video.buffered.length - 1)
            video.currentTime = bufferedEnd - 0.5
            addLog(`  跳转到最新位置: ${bufferedEnd.toFixed(2)}s`, 'info')
          }
          
          // 方法2：如果跳转失败，重新播放
          video.play().catch(err => {
            addLog(`  重新播放失败: ${err.message}`, 'error')
          })
          
          stallCount = 0
        } catch (err) {
          addLog(`  恢复失败: ${err.message}`, 'error')
        }
      }
    } else {
      stallCount = 0  // 重置计数器
    }
    
    lastPlayTime = currentTime
  }, 2000)
  
  // 当播放器销毁时清理定时器
  const originalDestroy = h265Player.destroy
  h265Player.destroy = function() {
    clearInterval(stallCheckInterval)
    return originalDestroy.call(this)
  }
  
  // 尝试播放，捕获可能的错误
  try {
    const playPromise = videoCanvas.value.play()
    
    if (playPromise !== undefined) {
      await playPromise
      addLog('✅ play() 调用成功', 'success')
      addLog('🎬 使用 mpegts.js 播放器', 'success')
    }
  } catch (playError) {
    addLog(`❌ play() 调用失败: ${playError.name} - ${playError.message}`, 'error')
    
    if (playError.name === 'NotAllowedError') {
      addLog('⚠️ 浏览器阻止自动播放，请点击播放按钮', 'warning')
    } else if (playError.name === 'NotSupportedError') {
      addLog('⚠️ 视频格式不支持或解码失败', 'error')
      addLog('💡 建议: 尝试 HTTP-FLV 或 HLS 格式', 'warning')
    } else {
      addLog('💡 建议: 检查视频是否为4K，尝试其他格式', 'warning')
    }
    
    throw playError
  }
}

// 加载 FLV 流 (优先使用 mpegts.js 处理 WebSocket 流)
const loadFLV = async (url, isWebSocket = false) => {
  // WebSocket 流优先尝试使用 mpegts.js
  if (isWebSocket) {
    try {
      addLog('=== WebSocket-FLV 播放策略 ===', 'info')
      addLog('1. 优先尝试：mpegts.js (更稳定)', 'info')
      addLog('2. 降级方案：flv.js', 'info')
      addLog('3. 备选方案：HTTP-FLV 或 HLS', 'info')
      addLog('================================', 'info')
      addLog('正在使用 mpegts.js 播放...', 'info')
      await loadMpegts(url)
      return
    } catch (mpegtsError) {
      addLog(`❌ mpegts.js 加载失败: ${mpegtsError.message}`, 'warning')
      addLog('⚠️ 正在回退到 flv.js...', 'warning')
    }
  }
  
  const flvjs = await import('flv.js')
  
  if (!flvjs.default.isSupported()) {
    addLog('❌ flv.js 不支持当前浏览器', 'error')
    
    // 检查原因
    if (typeof MediaSource === 'undefined') {
      addLog('原因: MediaSource API 不可用', 'error')
      addLog('', 'warning')
      addLog('💡 解决方案:', 'warning')
      addLog('  1. 更新浏览器到最新版本', 'info')
      addLog('  2. 或使用 Chrome/Edge 浏览器', 'info')
      addLog('  3. 或继续使用 HLS 格式（已验证可用）', 'success')
    } else {
      addLog('原因: 浏览器不支持必需的特性', 'error')
    }
    
    throw new Error('浏览器不支持 FLV 播放')
  }
  
  const protocolName = isWebSocket ? 'WebSocket' : 'HTTP'
  addLog(`✅ flv.js 支持检测通过`, 'success')
  addLog(`使用 flv.js 加载 ${protocolName}-FLV 流`, 'info')
  
  if (h265Player) {
    try {
      h265Player.destroy()
    } catch (e) {
      console.warn('清理播放器失败:', e)
    }
    h265Player = null
  }
  
  // 正确的 MediaDataSource 配置（第一个参数）
  const mediaDataSource = {
    type: 'flv',
    url: url,
    isLive: true,
    cors: !isWebSocket,  // HTTP 流需要 CORS
    withCredentials: false
  }
  
  // 正确的 Config 配置（第二个参数）
  const config = {
    enableWorker: false,  // 禁用 Worker，避免问题
    enableStashBuffer: true,  // HTTP-FLV 需要启用
    stashInitialSize: 128,  // 初始缓冲区大小（KB）
    isLive: true,
    lazyLoad: false,
    lazyLoadMaxDuration: 3 * 60,
    lazyLoadRecoverDuration: 30,
    deferLoadAfterSourceOpen: false,
    // 关键优化：更激进的缓冲区清理，避免卡顿
    autoCleanupSourceBuffer: true,
    autoCleanupMaxBackwardDuration: 5,  // 保留最近5秒
    autoCleanupMinBackwardDuration: 3,  // 最少保留3秒
    fixAudioTimestampGap: true,
    // 关键修复：不设置 hasAudio，让 flv.js 自动检测
    // WVP 的流可能没有音频或音频配置特殊
  }
  
  h265Player = flvjs.default.createPlayer(mediaDataSource, config)
  h265Player.attachMediaElement(videoCanvas.value)
  
  h265Player.on(flvjs.default.Events.ERROR, (errorType, errorDetail, errorInfo) => {
    console.error('FLV完整错误:', { errorType, errorDetail, errorInfo })
    
    let errorMsg = `FLV错误: ${errorType} - ${errorDetail}`
    let solution = ''
    
    if (errorType === 'NetworkError') {
      if (errorDetail === 'Exception') {
        errorMsg = '网络连接失败'
        solution = '\n可能原因:\n'
        
        // 检查是否是 HTTPS
        if (url.startsWith('https://')) {
          solution += '1. HTTPS 证书问题（自签名证书被浏览器阻止）\n'
          solution += '   → 尝试改用 HTTP: http://10.18.21.219:18081/...\n'
          solution += '2. 或在浏览器地址栏访问一次流地址，信任证书\n'
        } else if (isWebSocket) {
          solution += '1. WebSocket 连接失败或服务器未运行\n'
          solution += '2. 建议尝试 HTTP-FLV 或 HLS 格式\n'
          solution += '3. 检查防火墙或网络代理设置\n'
        } else {
          solution += '1. 流地址错误或服务器未运行\n'
          solution += '2. CORS 跨域配置问题\n'
          solution += '3. 网络连接不通\n'
        }
        
        if (errorInfo) {
          solution += `\n详细信息: ${JSON.stringify(errorInfo)}`
        }
      }
    } else if (errorType === 'MediaError') {
      errorMsg = `媒体错误: ${errorDetail}`
      solution = '\n可能原因:\n'
      solution += '1. 流格式不正确或编码不支持\n'
      solution += '2. 分辨率过高或码率过大\n'
      if (isWebSocket) {
        solution += '3. 建议改用 HTTP-FLV 或 HLS 格式\n'
      }
    }
    
    addLog(errorMsg, 'error')
    if (solution) {
      addLog(solution, 'warning')
    }
    
    errorMessage.value = errorMsg + solution
    isConnecting.value = false
    isPlaying.value = false
  })
  
  h265Player.on(flvjs.default.Events.METADATA_ARRIVED, (metadata) => {
    addLog(`[FLV] 收到元数据: ${metadata.width}×${metadata.height}`, 'success')
    addLog(`完整元数据: ${JSON.stringify(metadata)}`, 'info')
    
    videoInfo.value.width = metadata.width || 0
    videoInfo.value.height = metadata.height || 0
    videoInfo.value.fps = Math.round(metadata.framerate) || 0
    
    // 检查元数据完整性
    const hasVideoDataRate = !!metadata.videodatarate
    const hasAudioDataRate = !!metadata.audiodatarate
    
    if (!hasVideoDataRate) {
      addLog('⚠️ 元数据缺少 videodatarate', 'warning')
    } else {
      addLog(`视频码率: ${metadata.videodatarate} kbps`, 'info')
    }
    
    if (!hasAudioDataRate) {
      addLog('⚠️ 元数据缺少 audiodatarate', 'warning')
    } else {
      addLog(`音频码率: ${metadata.audiodatarate} kbps`, 'info')
    }
    
    if (metadata.videocodecid) {
      const codecMap = { 7: 'H.264/AVC', 12: 'H.265/HEVC' }
      addLog(`视频编码: ${codecMap[metadata.videocodecid] || metadata.videocodecid}`, 'info')
    }
    
    // 4K 视频警告
    if (metadata.width >= 3840 || metadata.height >= 2160) {
      addLog('⚠️⚠️⚠️ 检测到 4K 超高清视频 ⚠️⚠️⚠️', 'warning')
      addLog('⚠️ 4K视频可能需要较长加载时间（10-30秒）', 'warning')
      addLog('⚠️ 如果长时间无画面，建议改用 HLS 格式', 'warning')
      addLog('💡 点击 "HLS (最兼容)" 按钮可获得最佳稳定性', 'info')
    }
    
    // WVP 流元数据不完整的解决方案
    if (!hasVideoDataRate || !hasAudioDataRate) {
      addLog('', 'warning')
      addLog('========== 检测到元数据不完整 ==========', 'warning')
      addLog('当前已自动优化配置，如仍无法播放:', 'warning')
      addLog('1. mpegts.js 可能已在使用（更稳定）', 'info')
      addLog('2. 尝试点击 "HTTP-FLV" 格式', 'warning')
      addLog('3. 尝试点击 "HLS" 格式（最稳定）', 'warning')
      addLog('4. 如仍有问题，可降低摄像头分辨率', 'warning')
      addLog('=======================================', 'warning')
    }
  })
  
  // 监听更多FLV事件
  h265Player.on(flvjs.default.Events.MEDIA_INFO, (mediaInfo) => {
    addLog('[FLV] MEDIA_INFO', 'info')
    addLog(`  ${JSON.stringify(mediaInfo)}`, 'info')
  })
  
  // 下载速度监控
  let slowSpeedCount = 0
  let zeroSpeedCount = 0
  
  h265Player.on(flvjs.default.Events.STATISTICS_INFO, (stats) => {
    // 只显示有用的统计信息
    if (stats.speed !== undefined) {
      const speedKBps = stats.speed / 1024
      addLog(`[FLV] 下载速度: ${speedKBps.toFixed(2)} KB/s`, 'info')
      
      // 检测零速度或极低速度（可能没有推流）
      if (speedKBps < 0.1) {
        zeroSpeedCount++
        
        // 连续3次速度为0，立即警告
        if (zeroSpeedCount === 3) {
          addLog('', 'error')
          addLog('❌❌❌ 严重问题：下载速度为 0 ❌❌❌', 'error')
          addLog(`当前速度: ${speedKBps.toFixed(2)} KB/s`, 'error')
          addLog('', 'error')
          addLog('🔍 问题诊断:', 'error')
          addLog('  服务器连接成功，但没有数据传输', 'error')
          addLog('  这通常意味着:', 'error')
          addLog('  ❌ 1. 流服务器没有实际推流（最可能）', 'error')
          addLog('  ❌ 2. 摄像头离线或未推流', 'error')
          addLog('  ❌ 3. 流地址错误或流不存在', 'error')
          addLog('', 'warning')
          addLog('💡 解决方案:', 'warning')
          addLog('  1️⃣ 检查 ZLMediaKit 管理界面', 'info')
          addLog('      访问: http://10.18.21.202:18081', 'info')
          addLog('      查看当前是否有推流', 'info')
          addLog('', 'info')
          addLog('  2️⃣ 检查摄像头状态', 'info')
          addLog('      确认设备 34020000001320000001 是否在线', 'info')
          addLog('      确认摄像头是否正在推流', 'info')
          addLog('', 'info')
          addLog('  3️⃣ 验证流地址', 'info')
          addLog('      在 ZLMediaKit 中查看正确的流 ID', 'info')
          addLog('      确认流地址格式正确', 'info')
          addLog('', 'info')
          addLog('  4️⃣ 点击 "测试连接" 按钮', 'info')
          addLog('      运行完整的网络诊断', 'info')
          addLog('════════════════════════════════════', 'error')
        } else if (zeroSpeedCount === 5) {
          addLog('⚠️ 持续没有数据传输，建议检查推流状态', 'error')
        }
      } else {
        zeroSpeedCount = 0  // 重置计数器
        
        // 检查是否是4K视频
        const resolution = videoInfo.value.width * videoInfo.value.height
        const is4K = resolution >= 3840 * 2160
        
        // 4K视频速度检测（需要至少1000 KB/s）
        if (is4K && speedKBps < 500) {
          slowSpeedCount++
          
          // 连续5次速度过慢，发出警告
          if (slowSpeedCount === 5) {
            addLog('', 'error')
            addLog('❌❌❌ 严重警告：下载速度过慢 ❌❌❌', 'error')
            addLog(`当前速度: ${speedKBps.toFixed(2)} KB/s`, 'error')
            addLog(`4K视频需要: 1000+ KB/s (至少10 Mbps带宽)`, 'error')
            addLog('', 'error')
            addLog('📊 速度对比:', 'error')
            addLog(`  实际速度: ${speedKBps.toFixed(2)} KB/s`, 'error')
            addLog(`  需要速度: 1000-2000 KB/s`, 'error')
            addLog(`  差距倍数: ${(1000/speedKBps).toFixed(0)}x`, 'error')
            addLog('', 'warning')
            addLog('💡 解决方案（按优先级）:', 'warning')
            addLog('  1️⃣ 立即尝试: 点击 "HLS (最兼容)" 按钮', 'info')
            addLog('  2️⃣ 必须降低: 摄像头分辨率至 1080p', 'info')
            addLog('  3️⃣ 检查网络: 服务器带宽或网络连接', 'info')
            addLog('════════════════════════════════════', 'error')
          }
        } else if (speedKBps >= 500) {
          slowSpeedCount = 0  // 重置计数器
        }
      }
    }
  })
  
  // 添加详细的视频事件监听
  const video = videoCanvas.value
  
  video.addEventListener('loadstart', () => {
    addLog('[Video] loadstart - 开始加载', 'info')
  })
  
  video.addEventListener('loadedmetadata', () => {
    addLog(`[Video] loadedmetadata - 元数据加载完成`, 'success')
    addLog(`  视频尺寸: ${video.videoWidth}×${video.videoHeight}`, 'info')
    addLog(`  时长: ${video.duration}`, 'info')
  })
  
  video.addEventListener('loadeddata', () => {
    addLog(`[Video] loadeddata - 首帧数据加载完成`, 'success')
    addLog(`  readyState: ${video.readyState} (${getReadyStateText(video.readyState)})`, 'info')
  })
  
  video.addEventListener('error', () => {
    const mediaError = video.error
    if (mediaError) {
      const errorCodes = {
        1: 'MEDIA_ERR_ABORTED - 加载被中止',
        2: 'MEDIA_ERR_NETWORK - 网络错误',
        3: 'MEDIA_ERR_DECODE - 解码错误',
        4: 'MEDIA_ERR_SRC_NOT_SUPPORTED - 格式不支持'
      }
      addLog(`[Video] 错误 ${mediaError.code}: ${errorCodes[mediaError.code] || '未知错误'}`, 'error')
      addLog(`错误消息: ${mediaError.message || '无'}`, 'error')
    }
  })
  
  video.addEventListener('canplay', () => {
    addLog('[Video] canplay - 可以开始播放', 'success')
  })
  
  video.addEventListener('canplaythrough', () => {
    addLog('[Video] canplaythrough - 可以流畅播放', 'success')
  })
  
  // 优化 waiting 事件处理 - 检测长时间缓冲
  let waitingStartTime = null
  video.addEventListener('waiting', () => {
    if (!waitingStartTime) {
      waitingStartTime = Date.now()
      addLog('[Video] waiting - 缓冲中...', 'warning')
    }
    
    // 如果缓冲超过5秒，尝试跳转到最新位置
    const waitingDuration = Date.now() - waitingStartTime
    if (waitingDuration > 5000 && video.buffered.length > 0) {
      addLog('⚠️ 长时间缓冲，尝试跳转到最新位置', 'warning')
      try {
        const bufferedEnd = video.buffered.end(video.buffered.length - 1)
        video.currentTime = bufferedEnd - 0.5
        addLog(`  跳转到: ${bufferedEnd.toFixed(2)}s`, 'info')
      } catch (err) {
        addLog(`  跳转失败: ${err.message}`, 'error')
      }
      waitingStartTime = null
    }
  })
  
  video.addEventListener('playing', () => {
    addLog('[Video] playing - 正在播放', 'success')
    addLog(`  currentTime: ${video.currentTime.toFixed(2)}s`, 'info')
    waitingStartTime = null  // 重置等待计时器
  })
  
  video.addEventListener('stalled', () => {
    addLog('[Video] stalled - 数据停滞', 'warning')
  })
  
  video.addEventListener('suspend', () => {
    addLog('[Video] suspend - 暂停数据加载', 'warning')
  })
  
  video.addEventListener('progress', () => {
    addLog(`[Video] progress - 下载中 (buffered: ${getBufferedInfo(video)})`, 'info')
  })
  
  h265Player.load()
  addLog('FLV.js load() 完成，等待数据...', 'info')
  
  // 卡顿检测和自动恢复
  let lastPlayTime = 0
  let stallCount = 0
  const stallCheckInterval = setInterval(() => {
    if (!videoCanvas.value || !isPlaying.value) {
      clearInterval(stallCheckInterval)
      return
    }
    
    const currentTime = videoCanvas.value.currentTime
    const video = videoCanvas.value
    
    // 新增：检测播放进度是否落后太多（延迟跳转功能）
    if (video.buffered.length > 0 && !video.paused && !video.ended) {
      const bufferedEnd = video.buffered.end(video.buffered.length - 1)
      const delay = bufferedEnd - currentTime
      
      // 如果播放进度落后超过3秒，自动跳转到最新位置
      if (delay > 3) {
        addLog(`⚠️ 播放进度落后 ${delay.toFixed(2)}秒，跳转到最新位置`, 'warning')
        try {
          // 跳转到缓冲区末尾前0.5秒的位置，确保流畅播放
          video.currentTime = bufferedEnd - 0.5
          addLog(`✅ 已跳转到最新位置: ${video.currentTime.toFixed(2)}s`, 'success')
          stallCount = 0  // 重置卡顿计数器
        } catch (err) {
          addLog(`❌ 跳转失败: ${err.message}`, 'error')
        }
      }
      // 如果延迟在2-3秒之间，发出警告但不跳转
      else if (delay > 2) {
        addLog(`⚠️ 播放延迟: ${delay.toFixed(2)}秒 (超过3秒将自动跳转)`, 'info')
      }
    }
    
    // 检测是否卡住（时间没有前进）
    if (currentTime === lastPlayTime && !video.paused && !video.ended) {
      stallCount++
      addLog(`⚠️ 检测到播放卡顿 (${stallCount})`, 'warning')
      
      // 连续卡顿3次（6秒），尝试恢复
      if (stallCount >= 3) {
        addLog('🔄 尝试恢复播放...', 'warning')
        
        try {
          // 方法1：跳转到直播最新位置
          if (video.buffered.length > 0) {
            const bufferedEnd = video.buffered.end(video.buffered.length - 1)
            video.currentTime = bufferedEnd - 0.5
            addLog(`  跳转到最新位置: ${bufferedEnd.toFixed(2)}s`, 'info')
          }
          
          // 方法2：如果跳转失败，重新播放
          video.play().catch(err => {
            addLog(`  重新播放失败: ${err.message}`, 'error')
          })
          
          stallCount = 0
        } catch (err) {
          addLog(`  恢复失败: ${err.message}`, 'error')
        }
      }
    } else {
      stallCount = 0  // 重置计数器
    }
    
    lastPlayTime = currentTime
  }, 2000)
  
  // 当播放器销毁时清理定时器
  const originalDestroy = h265Player.destroy
  h265Player.destroy = function() {
    clearInterval(stallCheckInterval)
    return originalDestroy.call(this)
  }
  
  // 尝试播放，捕获可能的错误
  try {
    const playPromise = videoCanvas.value.play()
    
    if (playPromise !== undefined) {
      await playPromise
      addLog('✅ play() 调用成功', 'success')
      addLog(`🎬 使用 flv.js 播放器 (${protocolName} 模式)`, 'success')
    }
  } catch (playError) {
    addLog(`❌ play() 调用失败: ${playError.name} - ${playError.message}`, 'error')
    
    if (playError.name === 'NotAllowedError') {
      addLog('⚠️ 浏览器阻止自动播放，请手动点击播放按钮', 'warning')
    } else if (playError.name === 'NotSupportedError') {
      addLog('⚠️ 视频格式不支持或解码失败', 'error')
      if (isWebSocket) {
        addLog('💡 建议: WebSocket-FLV可能不稳定，尝试 HTTP-FLV 或 HLS', 'warning')
      }
    } else {
      addLog('💡 建议: 尝试其他流格式（HTTP-FLV 或 HLS）', 'warning')
    }
    
    // 清理状态检查定时器
    clearInterval(stateCheckInterval)
    
    throw playError
  }
}

// 加载 HLS 流
const loadHLS = async (url) => {
  addLog('加载 HLS 流', 'info')
  addLog(`HLS URL: ${url}`, 'info')
  
  if (videoCanvas.value.canPlayType('application/vnd.apple.mpegurl')) {
    addLog('使用原生 HLS 播放', 'info')
    
    try {
      videoCanvas.value.src = url
      const playPromise = videoCanvas.value.play()
      
      if (playPromise !== undefined) {
        await playPromise
        addLog('✅ HLS 播放成功 (原生)', 'success')
      }
    } catch (err) {
      addLog(`❌ 原生HLS播放失败: ${err.name} - ${err.message}`, 'error')
      throw err
    }
    return
  }
  
  const { default: Hls } = await import('hls.js')
  
  if (!Hls.isSupported()) {
    addLog('❌ 浏览器不支持 hls.js', 'error')
    addLog('MediaSource API 不可用', 'error')
    throw new Error('浏览器不支持 HLS 播放')
  }
  
  addLog('✅ hls.js 支持检测通过', 'success')
  addLog('使用 hls.js 播放', 'info')
  
  if (h265Player) {
    h265Player.destroy()
    h265Player = null
  }
  
  const hlsConfig = {
    debug: true,
    enableWorker: true,
    lowLatencyMode: false,
    maxBufferLength: 30,
    maxMaxBufferLength: 600
  }
  
  h265Player = new Hls(hlsConfig)
  
  // 详细的错误处理
  h265Player.on(Hls.Events.ERROR, (event, data) => {
    console.error('HLS详细错误:', data)
    
    addLog(`❌ HLS错误类型: ${data.type}`, 'error')
    addLog(`   错误详情: ${data.details}`, 'error')
    
    if (data.fatal) {
      switch(data.type) {
        case Hls.ErrorTypes.NETWORK_ERROR:
          addLog('❌ 网络错误 - 无法加载HLS流', 'error')
          addLog('可能原因:', 'error')
          addLog('  1. CORS跨域限制', 'error')
          addLog('  2. 服务器未响应', 'error')
          addLog('  3. 网络连接问题', 'error')
          
          if (data.details === 'manifestLoadError') {
            addLog('', 'error')
            addLog('❌ 无法加载 m3u8 清单文件', 'error')
            addLog('请检查:', 'warning')
            addLog('  1. 浏览器控制台Console是否有CORS错误', 'info')
            addLog('  2. Network标签中m3u8请求的状态码', 'info')
            addLog('  3. 是否是HTTP/HTTPS混合内容问题', 'info')
          }
          
          // 尝试重试
          addLog('尝试重新加载...', 'warning')
          h265Player.startLoad()
          break
          
        case Hls.ErrorTypes.MEDIA_ERROR:
          addLog('❌ 媒体解码错误', 'error')
          addLog('尝试恢复...', 'warning')
          h265Player.recoverMediaError()
          break
          
        default:
          addLog(`❌ 致命错误: ${data.type}`, 'error')
          errorMessage.value = `播放错误: ${data.type} - ${data.details}`
          isConnecting.value = false
          isPlaying.value = false
          break
      }
    }
  })
  
  h265Player.on(Hls.Events.MANIFEST_LOADING, () => {
    addLog('[HLS] 正在加载 m3u8 清单...', 'info')
  })
  
  h265Player.on(Hls.Events.MANIFEST_LOADED, (event, data) => {
    addLog('[HLS] ✅ m3u8 清单加载成功', 'success')
    addLog(`   视频等级数: ${data.levels.length}`, 'info')
    if (data.levels.length > 0) {
      addLog(`   分辨率: ${data.levels[0].width}×${data.levels[0].height}`, 'info')
    }
  })
  
  h265Player.on(Hls.Events.MANIFEST_PARSED, () => {
    addLog('[HLS] ✅ 清单解析成功', 'success')
    addLog('🎬 使用 hls.js 播放器', 'success')
    
    videoCanvas.value.play().catch(err => {
      addLog(`❌ HLS play() 失败: ${err.name} - ${err.message}`, 'error')
    })
  })
  
  h265Player.on(Hls.Events.LEVEL_LOADED, (event, data) => {
    addLog(`[HLS] 加载视频片段，时长: ${data.details.totalduration.toFixed(2)}s`, 'info')
  })
  
  h265Player.on(Hls.Events.FRAG_LOADED, (event, data) => {
    addLog(`[HLS] 片段加载完成: ${data.frag.sn}`, 'info')
  })
  
  addLog('开始加载HLS源...', 'info')
  h265Player.loadSource(url)
  h265Player.attachMedia(videoCanvas.value)
  
  // HLS 播放进度监控和延迟跳转
  const hlsCheckInterval = setInterval(() => {
    if (!videoCanvas.value || !isPlaying.value) {
      clearInterval(hlsCheckInterval)
      return
    }
    
    const video = videoCanvas.value
    
    // 检测播放进度是否落后太多（延迟跳转功能）
    if (video.buffered.length > 0 && !video.paused && !video.ended) {
      const bufferedEnd = video.buffered.end(video.buffered.length - 1)
      const currentTime = video.currentTime
      const delay = bufferedEnd - currentTime
      
      // HLS 由于分片特性，延迟阈值可以设置稍大一些
      // 如果播放进度落后超过15秒，自动跳转到最新位置
      if (delay > 15) {
        addLog(`⚠️ HLS播放进度落后 ${delay.toFixed(2)}秒，跳转到最新位置`, 'warning')
        try {
          // 跳转到缓冲区末尾前1秒的位置，确保流畅播放
          video.currentTime = bufferedEnd - 1
          addLog(`✅ 已跳转到最新位置: ${video.currentTime.toFixed(2)}s`, 'success')
        } catch (err) {
          addLog(`❌ 跳转失败: ${err.message}`, 'error')
        }
      }
      // 如果延迟在10-15秒之间，发出警告但不跳转
      else if (delay > 10) {
        addLog(`⚠️ HLS播放延迟: ${delay.toFixed(2)}秒 (超过15秒将自动跳转)`, 'info')
      }
    }
  }, 3000)  // HLS 每3秒检查一次即可
  
  // 当播放器销毁时清理定时器
  const originalDestroy = h265Player.destroy
  h265Player.destroy = function() {
    clearInterval(hlsCheckInterval)
    return originalDestroy.call(this)
  }
}

// 播放流
const playStream = async () => {
  if (!streamUrl.value) {
    ElMessage.warning('请输入流地址')
    return
  }
  
  try {
    isConnecting.value = true
    errorMessage.value = ''
    
    addLog(`开始播放: ${streamUrl.value}`, 'info')
    
    // 检查 HTTPS 和端口
    if (streamUrl.value.startsWith('https://')) {
      addLog('⚠️ 检测到 HTTPS 协议', 'warning')
      addLog('如果使用自签名证书，可能无法播放', 'warning')
      addLog('建议改用 HTTP 或先在浏览器中信任证书', 'warning')
      
      // 提供 HTTP 版本建议
      const httpUrl = streamUrl.value.replace('https://', 'http://').replace(':443', ':18081')
      addLog(`建议尝试: ${httpUrl}`, 'info')
    }
    
    // 解析 URL
    try {
      const urlObj = new URL(streamUrl.value)
      addLog(`协议: ${urlObj.protocol}, 主机: ${urlObj.host}`, 'info')
    } catch (e) {
      addLog(`URL 解析警告: ${e.message}`, 'warning')
    }
    
    if (isPlaying.value) {
      await stopStream()
      await nextTick()
    }
    
    const streamType = detectStreamType(streamUrl.value)
    addLog(`流类型: ${streamType}`, 'info')
    
    switch (streamType) {
      case 'ws-flv':
        await loadFLV(streamUrl.value, true)
        break
      case 'ws-fmp4':
        addLog('⚠️ WebSocket-FMP4 不稳定，建议改用 WS-FLV 或降低分辨率', 'warning')
        await loadNativeFMP4(streamUrl.value)
        break
      case 'flv':
        await loadFLV(streamUrl.value, false)
        break
      case 'fmp4':
        addLog('⚠️ HTTP-FMP4 不稳定，建议改用 HTTP-FLV 或降低分辨率', 'warning')
        await loadNativeFMP4(streamUrl.value)
        break
      case 'hls':
        await loadHLS(streamUrl.value)
        break
      default:
        await loadFLV(streamUrl.value, false)
        break
    }
    
    isPlaying.value = true
    isConnecting.value = false
    ElMessage.success('播放成功')
    
  } catch (error) {
    console.error('播放失败:', error)
    addLog(`播放失败: ${error.message}`, 'error')
    errorMessage.value = `播放失败: ${error.message}`
    isConnecting.value = false
    ElMessage.error('播放失败: ' + error.message)
  }
}

// 停止播放
const stopStream = async () => {
  try {
    addLog('停止播放', 'info')
    
    // 标记为非播放状态，停止所有定时器
    isPlaying.value = false
    isConnecting.value = false
    
    if (videoCanvas.value) {
      videoCanvas.value.pause()
      // 清空 src，释放资源
      videoCanvas.value.removeAttribute('src')
      videoCanvas.value.load()
    }
    
    if (h265Player) {
      if (typeof h265Player.destroy === 'function') {
        h265Player.destroy()
      }
      h265Player = null
    }
    
    // 清理 FMP4 的定时器
    if (window._fmp4Intervals) {
      window._fmp4Intervals.forEach(interval => clearInterval(interval))
      window._fmp4Intervals = []
    }
    
    // 触发垃圾回收（建议）
    if (window.gc) {
      window.gc()
    }
    
  } catch (error) {
    console.error('停止失败:', error)
  }
}

const retryPlay = () => {
  errorMessage.value = ''
  playStream()
}

const selectQuickUrl = (url) => {
  streamUrl.value = url.url
  addLog(`选择: ${url.name}`, 'info')
}

const toggleDebugPanel = () => {
  showDebug.value = !showDebug.value
}

// 检测浏览器能力
const checkBrowserCapabilities = () => {
  addLog('========== 浏览器能力检测 ==========', 'info')
  
  // 检测浏览器类型
  const ua = navigator.userAgent
  let browserName = 'Unknown'
  if (ua.indexOf('Chrome') > -1 && ua.indexOf('Edg') === -1) {
    browserName = 'Chrome'
  } else if (ua.indexOf('Edg') > -1) {
    browserName = 'Edge'
  } else if (ua.indexOf('Safari') > -1 && ua.indexOf('Chrome') === -1) {
    browserName = 'Safari'
  } else if (ua.indexOf('Firefox') > -1) {
    browserName = 'Firefox'
  }
  
  addLog(`浏览器: ${browserName}`, 'info')
  
  // 检测MediaSource API
  if (typeof MediaSource !== 'undefined') {
    addLog('✅ MediaSource API: 可用', 'success')
    
    // 检测支持的格式
    const formats = [
      'video/mp4; codecs="avc1.42E01E"',
      'video/mp4; codecs="avc1.64001F"',
      'video/x-flv; codecs="avc1.42E01E"'
    ]
    
    formats.forEach(format => {
      const supported = MediaSource.isTypeSupported(format)
      if (supported) {
        addLog(`  ✅ ${format}`, 'success')
      } else {
        addLog(`  ❌ ${format}`, 'error')
      }
    })
  } else {
    addLog('❌ MediaSource API: 不可用', 'error')
    addLog('   这意味着 flv.js 和 mpegts.js 无法工作', 'error')
    addLog('   只能使用原生支持的格式（如HLS）', 'warning')
  }
  
  // 检测HLS原生支持
  const video = document.createElement('video')
  if (video.canPlayType('application/vnd.apple.mpegurl')) {
    addLog('✅ 原生HLS支持: 是', 'success')
  } else {
    addLog('⚠️ 原生HLS支持: 否', 'warning')
  }
  
  // 检测WebSocket支持
  if (typeof WebSocket !== 'undefined') {
    addLog('✅ WebSocket API: 可用', 'success')
  } else {
    addLog('❌ WebSocket API: 不可用', 'error')
  }
  
  addLog('===================================', 'info')
}

// 测试连接
const testConnection = async () => {
  if (!streamUrl.value) return
  
  // 先检测浏览器能力
  checkBrowserCapabilities()
  
  addLog('========== 测试连接 ==========', 'info')
  addLog(`测试 URL: ${streamUrl.value}`, 'info')
  
  try {
    const url = new URL(streamUrl.value)
    addLog(`✓ URL 格式正确`, 'success')
    addLog(`  协议: ${url.protocol}`, 'info')
    addLog(`  主机: ${url.hostname}`, 'info')
    addLog(`  端口: ${url.port || (url.protocol === 'https:' ? '443' : '80')}`, 'info')
    addLog(`  路径: ${url.pathname}`, 'info')
    
    // HTTPS 警告
    if (url.protocol === 'https:') {
      addLog('⚠️ 使用 HTTPS 协议', 'warning')
      addLog('⚠️ 自签名证书会被浏览器阻止', 'warning')
      
      const httpUrl = streamUrl.value.replace('https://', 'http://').replace(':443', ':18081')
      addLog(`建议改用 HTTP: ${httpUrl}`, 'info')
    }
    
    // 测试 HTTP/HTTPS 连接
    if (url.protocol.startsWith('http')) {
      addLog('', 'info')
      addLog('正在测试 HTTP 连接...', 'info')
      
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)
      
      try {
        const startTime = Date.now()
        const response = await fetch(streamUrl.value, {
          method: 'GET',
          signal: controller.signal,
          mode: 'cors', // 检测 CORS 问题
          credentials: 'omit'
        })
        clearTimeout(timeoutId)
        const endTime = Date.now()
        
        addLog(`✓ 服务器响应成功`, 'success')
        addLog(`  状态码: ${response.status}`, 'info')
        addLog(`  响应时间: ${endTime - startTime}ms`, 'info')
        addLog(`  Content-Type: ${response.headers.get('Content-Type') || '未知'}`, 'info')
        
        // 检查内容类型
        const contentType = response.headers.get('Content-Type')
        if (contentType) {
          if (contentType.includes('flv')) {
            addLog(`✓ 内容类型正确 (FLV)`, 'success')
          } else if (contentType.includes('mpegurl') || contentType.includes('m3u8')) {
            addLog(`✓ 内容类型正确 (HLS)`, 'success')
          } else if (contentType.includes('mp4')) {
            addLog(`✓ 内容类型正确 (MP4)`, 'success')
          } else {
            addLog(`⚠️ 内容类型可能不正确: ${contentType}`, 'warning')
          }
        }
        
        // 尝试读取一些数据
        addLog('正在检测数据流...', 'info')
        const reader = response.body.getReader()
        const readTimeout = setTimeout(() => {
          reader.cancel()
          addLog(`⚠️ 10秒内未接收到流数据`, 'warning')
          addLog(``, 'error')
          addLog(`🔍 问题诊断:`, 'error')
          addLog(`  1. 服务器可能未推流（没有实际视频流）`, 'error')
          addLog(`  2. 摄像头可能离线或未推流`, 'error')
          addLog(`  3. 流地址可能不正确`, 'error')
          addLog(``, 'warning')
          addLog(`💡 解决方案:`, 'warning')
          addLog(`  1. 检查 ZLMediaKit 是否有推流`, 'info')
          addLog(`  2. 访问 ZLMediaKit 管理界面查看流列表`, 'info')
          addLog(`  3. 检查摄像头是否在线并推流`, 'info')
          addLog(`  4. 尝试重启摄像头或推流服务`, 'info')
        }, 10000)
        
        let bytesReceived = 0
        let chunksReceived = 0
        
        try {
          while (chunksReceived < 3) { // 读取前3个数据块
            const { done, value } = await reader.read()
            if (done) break
            
            chunksReceived++
            bytesReceived += value.length
            addLog(`✓ 接收到数据块 ${chunksReceived}: ${value.length} 字节`, 'success')
          }
          
          clearTimeout(readTimeout)
          reader.cancel()
          
          if (bytesReceived > 0) {
            addLog(`✅ 数据流测试成功！`, 'success')
            addLog(`  共接收: ${bytesReceived} 字节 (${chunksReceived} 个数据块)`, 'success')
            addLog(`  平均块大小: ${Math.round(bytesReceived / chunksReceived)} 字节`, 'info')
            addLog(``, 'success')
            addLog(`🎉 流服务器工作正常，可以尝试播放！`, 'success')
          } else {
            addLog(`❌ 未接收到任何数据`, 'error')
            addLog(`  服务器连接成功，但没有数据流`, 'error')
          }
        } catch (readError) {
          clearTimeout(readTimeout)
          if (readError.name !== 'AbortError') {
            addLog(`读取数据时出错: ${readError.message}`, 'error')
          }
        }
        
      } catch (fetchError) {
        clearTimeout(timeoutId)
        
        if (fetchError.name === 'AbortError') {
          addLog(`✗ 连接超时（5秒）`, 'error')
          addLog(``, 'error')
          addLog(`🔍 可能的原因:`, 'error')
          addLog(`  1. 服务器 ${url.hostname}:${url.port || '80'} 未运行`, 'error')
          addLog(`  2. 网络不通或被防火墙阻止`, 'error')
          addLog(`  3. IP 地址或端口错误`, 'error')
          addLog(``, 'warning')
          addLog(`💡 解决方案:`, 'warning')
          addLog(`  1. ping ${url.hostname} 检查网络`, 'info')
          addLog(`  2. 检查 ZLMediaKit 服务是否运行`, 'info')
          addLog(`  3. 检查防火墙设置`, 'info')
        } else if (fetchError.message.includes('CORS')) {
          addLog(`✗ CORS 跨域错误`, 'error')
          addLog(``, 'error')
          addLog(`🔍 CORS 问题:`, 'error')
          addLog(`  浏览器阻止了跨域请求`, 'error')
          addLog(``, 'warning')
          addLog(`💡 解决方案:`, 'warning')
          addLog(`  1. 在 ZLMediaKit 配置中启用 CORS`, 'info')
          addLog(`  2. 配置文件添加: Access-Control-Allow-Origin: *`, 'info')
          addLog(`  3. 或在浏览器中安装 CORS 插件（仅测试用）`, 'info')
        } else if (fetchError.message.includes('certificate')) {
          addLog(`✗ HTTPS 证书错误`, 'error')
          addLog(`  需要先在浏览器中信任证书`, 'error')
          addLog(`  或改用 HTTP 协议`, 'error')
        } else {
          addLog(`✗ 网络错误: ${fetchError.message}`, 'error')
          addLog(``, 'warning')
          addLog(`💡 建议:`, 'warning')
          addLog(`  1. 检查网络连接`, 'info')
          addLog(`  2. 查看浏览器控制台 Network 标签`, 'info')
          addLog(`  3. 确认服务器地址和端口正确`, 'info')
        }
      }
    }
    
    // WebSocket 连接测试
    if (url.protocol.startsWith('ws')) {
      addLog('', 'info')
      addLog('正在测试 WebSocket 连接...', 'info')
      
      const ws = new WebSocket(streamUrl.value)
      let wsTimeout = null
      let wsConnected = false
      
      await new Promise((resolve) => {
        wsTimeout = setTimeout(() => {
          if (!wsConnected) {
            ws.close()
            addLog(`✗ WebSocket 连接超时（5秒）`, 'error')
            addLog(`  服务器可能未运行或不支持 WebSocket`, 'error')
            resolve()
          }
        }, 5000)
        
        ws.onopen = () => {
          wsConnected = true
          clearTimeout(wsTimeout)
          addLog(`✅ WebSocket 连接成功`, 'success')
          
          // 监听数据
          let dataReceived = false
          const dataTimeout = setTimeout(() => {
            if (!dataReceived) {
              addLog(`⚠️ 10秒内未接收到 WebSocket 数据`, 'warning')
              addLog(`  可能没有推流或流地址错误`, 'warning')
            }
            ws.close()
            resolve()
          }, 10000)
          
          ws.onmessage = (event) => {
            if (!dataReceived) {
              dataReceived = true
              clearTimeout(dataTimeout)
              const size = event.data.size || event.data.length || 0
              addLog(`✅ 接收到 WebSocket 数据: ${size} 字节`, 'success')
              addLog(`🎉 WebSocket 流工作正常！`, 'success')
              ws.close()
              resolve()
            }
          }
        }
        
        ws.onerror = (error) => {
          clearTimeout(wsTimeout)
          addLog(`✗ WebSocket 连接错误`, 'error')
          addLog(`  ${error.message || '未知错误'}`, 'error')
          resolve()
        }
        
        ws.onclose = () => {
          clearTimeout(wsTimeout)
          if (!wsConnected) {
            addLog(`✗ WebSocket 连接失败`, 'error')
            addLog(``, 'warning')
            addLog(`💡 建议:`, 'warning')
            addLog(`  1. 尝试使用 HTTP-FLV 格式`, 'info')
            addLog(`  2. 检查服务器 WebSocket 支持`, 'info')
          }
          resolve()
        }
      })
    }
    
    addLog('', 'info')
    addLog('========== 测试完成 ==========', 'info')
    ElMessage.info('连接测试完成，请查看日志')
    
  } catch (error) {
    addLog(`✗ URL 格式错误: ${error.message}`, 'error')
    ElMessage.error('URL 格式不正确')
  }
}

onMounted(async () => {
  addLog('组件已挂载', 'success')
  
  // 内存监控（如果浏览器支持）
  if (performance.memory) {
    setInterval(() => {
      if (!isPlaying.value) return
      
      const memoryUsage = performance.memory.usedJSHeapSize / 1048576  // MB
      const memoryLimit = performance.memory.jsHeapSizeLimit / 1048576  // MB
      const memoryPercent = (memoryUsage / memoryLimit * 100).toFixed(1)
      
      // 如果内存使用超过70%，发出警告
      if (memoryPercent > 70) {
        addLog(`⚠️ 内存使用过高: ${memoryUsage.toFixed(0)}MB / ${memoryLimit.toFixed(0)}MB (${memoryPercent}%)`, 'warning')
        
        if (memoryPercent > 85) {
          addLog('🔄 建议刷新页面或切换到 HLS 格式', 'error')
        }
      }
    }, 30000)  // 每30秒检查一次
  }
  
  if (props.defaultUrl && props.autoplay) {
    streamUrl.value = props.defaultUrl
    await nextTick()
    playStream()
  }
})

onUnmounted(() => {
  if (isPlaying.value) {
    stopStream()
  }
  
  if (h265Player) {
    try {
      if (typeof h265Player.destroy === 'function') {
        h265Player.destroy()
      }
    } catch (error) {
      console.error('销毁失败:', error)
    }
    h265Player = null
  }
})
</script>

<style scoped lang="less">
.h265-player-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #0a0e27;
  border-radius: 8px;
  overflow: hidden;
}

.control-panel {
  padding: 16px;
  background: linear-gradient(135deg, #1a1f3a 0%, #0f1428 100%);
  border-bottom: 1px solid rgba(0, 212, 255, 0.2);
  
  .input-group {
    display: flex;
    gap: 12px;
    margin-bottom: 12px;
    
    .stream-input {
      flex: 1;
      
      :deep(.el-input__wrapper) {
        background: rgba(10, 14, 39, 0.6);
        border: 1px solid rgba(0, 212, 255, 0.3);
        box-shadow: none;
        
        &:hover {
          border-color: rgba(0, 212, 255, 0.5);
        }
        
        &.is-focus {
          border-color: #00d4ff;
          box-shadow: 0 0 10px rgba(0, 212, 255, 0.3);
        }
      }
      
      :deep(.el-input__inner) {
        color: #fff;
        
        &::placeholder {
          color: rgba(255, 255, 255, 0.4);
        }
      }
      
      :deep(.el-input-group__prepend) {
        background: rgba(0, 212, 255, 0.1);
        border-color: rgba(0, 212, 255, 0.3);
        color: #00d4ff;
      }
    }
    
    .play-button, .stop-button, .debug-button, .test-button {
      min-width: 100px;
      
      &.play-button {
        background: linear-gradient(135deg, #00d4ff 0%, #0099cc 100%);
        border: none;
        
        &:hover {
          background: linear-gradient(135deg, #00e6ff 0%, #00b8e6 100%);
        }
      }
      
      &.stop-button {
        background: linear-gradient(135deg, #ff4d4f 0%, #cc3333 100%);
        border: none;
        
        &:hover {
          background: linear-gradient(135deg, #ff6666 0%, #e64545 100%);
        }
        
        &:disabled {
          background: rgba(255, 77, 79, 0.3);
        }
      }
      
      &.debug-button {
        background: rgba(0, 212, 255, 0.1);
        border: 1px solid rgba(0, 212, 255, 0.3);
        color: #00d4ff;
        
        &:hover {
          background: rgba(0, 212, 255, 0.2);
          border-color: #00d4ff;
        }
      }
      
      &.test-button {
        background: rgba(82, 196, 26, 0.1);
        border: 1px solid rgba(82, 196, 26, 0.3);
        color: #52c41a;
        
        &:hover {
          background: rgba(82, 196, 26, 0.2);
          border-color: #52c41a;
        }
        
        &:disabled {
          background: rgba(82, 196, 26, 0.05);
          border-color: rgba(82, 196, 26, 0.1);
          color: rgba(82, 196, 26, 0.3);
        }
      }
    }
  }
  
  .quick-urls {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
    
    .quick-label {
      color: rgba(255, 255, 255, 0.6);
      font-size: 13px;
    }
    
    .quick-tag {
      cursor: pointer;
      transition: all 0.3s ease;
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0, 212, 255, 0.3);
      }
    }
  }
  
  .diagnostic-hint {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 12px;
    padding: 10px 12px;
    background: rgba(250, 173, 20, 0.1);
    border: 1px solid rgba(250, 173, 20, 0.3);
    border-radius: 4px;
    color: #faad14;
    font-size: 13px;
    
    .el-icon {
      font-size: 16px;
    }
    
    strong {
      color: #ffc53d;
      font-weight: 600;
    }
  }
}

.player-wrapper {
  flex: 1;
  display: flex;
  gap: 16px;
  padding: 16px;
  min-height: 0;
  
  .video-container {
    flex: 1;
    position: relative;
    background: #000;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
    
    .video-canvas {
      width: 100%;
      height: 100%;
      display: block;
      object-fit: contain;
      background: #000;
    }
    
    .loading-overlay,
    .error-overlay,
    .placeholder-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 16px;
      background: rgba(0, 0, 0, 0.85);
      backdrop-filter: blur(10px);
      z-index: 10;
    }
    
    .loading-overlay {
      .loading-icon {
        font-size: 48px;
        color: #00d4ff;
      }
      
      .loading-text {
        color: #fff;
        font-size: 16px;
      }
    }
    
    .error-overlay {
      .error-icon {
        font-size: 56px;
        color: #ff4d4f;
      }
      
      .error-text {
        color: #fff;
        font-size: 15px;
        max-width: 80%;
        text-align: center;
        line-height: 1.6;
        white-space: pre-line;
      }
    }
    
    .placeholder-overlay {
      .placeholder-icon {
        font-size: 64px;
        color: rgba(255, 255, 255, 0.3);
      }
      
      .placeholder-text {
        color: rgba(255, 255, 255, 0.5);
        font-size: 16px;
      }
    }
  }
}

.debug-panel {
  width: 380px;
  background: linear-gradient(135deg, #1a1f3a 0%, #0f1428 100%);
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(0, 212, 255, 0.2);
  
  .debug-header {
    padding: 12px 16px;
    background: rgba(0, 212, 255, 0.1);
    border-bottom: 1px solid rgba(0, 212, 255, 0.2);
    display: flex;
    align-items: center;
    gap: 8px;
    color: #00d4ff;
    font-weight: 600;
    font-size: 15px;
  }
  
  .debug-content {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
    
    &::-webkit-scrollbar {
      width: 6px;
    }
    
    &::-webkit-scrollbar-track {
      background: rgba(0, 0, 0, 0.2);
    }
    
    &::-webkit-scrollbar-thumb {
      background: rgba(0, 212, 255, 0.3);
      border-radius: 3px;
      
      &:hover {
        background: rgba(0, 212, 255, 0.5);
      }
    }
  }
  
  .debug-section {
    margin-bottom: 20px;
    
    &:last-child {
      margin-bottom: 0;
    }
    
    h4 {
      margin: 0 0 12px 0;
      color: #00d4ff;
      font-size: 14px;
      font-weight: 600;
      padding-bottom: 8px;
      border-bottom: 1px solid rgba(0, 212, 255, 0.2);
    }
    
    .debug-item {
      display: flex;
      align-items: center;
      padding: 6px 0;
      font-size: 13px;
      
      .label {
        color: rgba(255, 255, 255, 0.6);
        min-width: 90px;
      }
      
      .value {
        color: #fff;
        flex: 1;
        word-break: break-all;
      }
    }
  }
  
  .log-container {
    max-height: 300px;
    overflow-y: auto;
    background: rgba(0, 0, 0, 0.3);
    border-radius: 4px;
    padding: 8px;
    
    &::-webkit-scrollbar {
      width: 4px;
    }
    
    &::-webkit-scrollbar-track {
      background: rgba(0, 0, 0, 0.2);
    }
    
    &::-webkit-scrollbar-thumb {
      background: rgba(0, 212, 255, 0.3);
      border-radius: 2px;
    }
    
    .log-item {
      display: flex;
      gap: 8px;
      padding: 4px 0;
      font-size: 12px;
      font-family: 'Consolas', 'Monaco', monospace;
      
      .log-time {
        color: rgba(255, 255, 255, 0.4);
        min-width: 60px;
      }
      
      .log-message {
        flex: 1;
        color: rgba(255, 255, 255, 0.8);
      }
      
      &.info .log-message {
        color: #00d4ff;
      }
      
      &.success .log-message {
        color: #52c41a;
      }
      
      &.warning .log-message {
        color: #faad14;
      }
      
      &.error .log-message {
        color: #ff4d4f;
      }
    }
  }
}

@media (max-width: 1200px) {
  .player-wrapper {
    flex-direction: column;
    
    .debug-panel {
      width: 100%;
      max-height: 400px;
    }
  }
}
</style>

