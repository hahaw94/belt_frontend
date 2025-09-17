<template>
  <div class="hls-video-player">
    <video
      ref="videoRef"
      :poster="posterUrl"
      controls
      muted
      autoplay
      playsinline
      preload="none"
      :webkit-playsinline="true"
      class="video-element"
      @loadstart="onLoadStart"
      @canplay="onCanPlay"
      @error="onError"
      @loadedmetadata="onLoadedMetadata"
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
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { ElIcon } from 'element-plus'
import { Loading, Warning } from '@element-plus/icons-vue'

export default {
  name: 'HLSVideoPlayer',
  components: {
    ElIcon,
    Loading,
    Warning
  },
  props: {
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
    }
  },
  setup(props) {
    const videoRef = ref(null)
    const loading = ref(true)
    const error = ref('')
    const hls = ref(null)

    const posterUrl = ref(props.poster)

    const loadHLS = async () => {
      if (!videoRef.value) return

      loading.value = true
      error.value = ''

      try {
        // 检查浏览器是否原生支持HLS
        if (videoRef.value.canPlayType('application/vnd.apple.mpegurl')) {
          // Safari等浏览器原生支持HLS
          videoRef.value.src = props.src
        } else {
          // 其他浏览器使用hls.js
          const { default: Hls } = await import('hls.js')
          
          if (Hls.isSupported()) {
            if (hls.value) {
              hls.value.destroy()
            }
            
            hls.value = new Hls({
              enableWorker: true,
              lowLatencyMode: true,
              liveBackBufferLength: 0,
              liveSyncDurationCount: 1,
              liveMaxLatencyDurationCount: 1.5,
              liveDurationInfinity: true,
              maxBufferLength: 4,
              maxMaxBufferLength: 8,
              backBufferLength: 4,
              startPosition: -1,
              manifestLoadingTimeOut: 5000,
              manifestLoadingMaxRetry: 6,
              levelLoadingTimeOut: 5000,
              fragLoadingTimeOut: 10000,
              progressive: true,
              lowBufferWatchdogPeriod: 0.5,
              highBufferWatchdogPeriod: 1
            })
            
            hls.value.loadSource(props.src)
            hls.value.attachMedia(videoRef.value)
            
            hls.value.on(Hls.Events.MANIFEST_PARSED, () => {
              console.log('HLS manifest parsed')
              // 跳转到最新的片段
              if (hls.value.liveSyncPosition !== undefined && isFinite(hls.value.liveSyncPosition)) {
                videoRef.value.currentTime = Math.max(0, hls.value.liveSyncPosition)
              }
              if (props.autoplay) {
                videoRef.value.play().catch(console.error)
              }
            })
            
            hls.value.on(Hls.Events.LEVEL_LOADED, () => {
              // 当新的片段加载时，确保播放最新内容
              if (videoRef.value && hls.value.liveSyncPosition !== undefined && isFinite(hls.value.liveSyncPosition)) {
                const currentTime = videoRef.value.currentTime
                const livePosition = hls.value.liveSyncPosition
                // 更积极的跳转策略，减少延迟
                if (isFinite(currentTime) && livePosition - currentTime > 3) {
                  const newTime = Math.max(0, livePosition - 1)
                  if (isFinite(newTime)) {
                    videoRef.value.currentTime = newTime
                  }
                }
              }
            })
            
            // 添加片段加载事件，进一步优化延迟
            hls.value.on(Hls.Events.FRAG_LOADED, () => {
              if (videoRef.value && hls.value.liveSyncPosition !== undefined && isFinite(hls.value.liveSyncPosition)) {
                const currentTime = videoRef.value.currentTime
                const livePosition = hls.value.liveSyncPosition
                // 如果延迟超过2秒，立即跳转
                if (isFinite(currentTime) && livePosition - currentTime > 2) {
                  const newTime = Math.max(0, livePosition - 0.5)
                  if (isFinite(newTime)) {
                    videoRef.value.currentTime = newTime
                  }
                }
              }
            })
            
            hls.value.on(Hls.Events.ERROR, (event, data) => {
              console.error('HLS error:', data)
              if (data.fatal) {
                switch (data.type) {
                  case Hls.ErrorTypes.NETWORK_ERROR:
                    error.value = '网络错误，请检查网络连接'
                    break
                  case Hls.ErrorTypes.MEDIA_ERROR:
                    error.value = '媒体错误，尝试恢复中...'
                    hls.value.recoverMediaError()
                    break
                  default:
                    error.value = '播放器错误，请刷新页面重试'
                    hls.value.destroy()
                    break
                }
              }
            })
          } else {
            error.value = '您的浏览器不支持HLS播放'
          }
        }
      } catch (err) {
        console.error('加载HLS播放器失败:', err)
        error.value = '加载播放器失败'
      }
    }

    const onLoadStart = () => {
      loading.value = true
      error.value = ''
    }

    const onCanPlay = () => {
      loading.value = false
    }

    const onLoadedMetadata = () => {
      // 当元数据加载完成时，跳转到最新位置
      if (videoRef.value && videoRef.value.duration) {
        // 检查duration是否为有限数值，避免Infinity或NaN
        if (isFinite(videoRef.value.duration) && videoRef.value.duration > 1) {
          videoRef.value.currentTime = videoRef.value.duration - 1
        } else {
          // 对于直播流，duration通常是Infinity，使用HLS的liveSyncPosition
          if (hls.value && hls.value.liveSyncPosition !== undefined && isFinite(hls.value.liveSyncPosition)) {
            videoRef.value.currentTime = Math.max(0, hls.value.liveSyncPosition - 1)
          }
        }
      }
    }

    const onError = (event) => {
      loading.value = false
      error.value = '视频加载失败'
      console.error('Video error:', event)
    }

    const cleanup = () => {
      if (hls.value) {
        hls.value.destroy()
        hls.value = null
      }
    }

    watch(() => props.src, () => {
      if (props.src) {
        loadHLS()
      }
    })

    onMounted(() => {
      if (props.src) {
        loadHLS()
      }
    })

    onUnmounted(() => {
      cleanup()
    })

    return {
      videoRef,
      loading,
      error,
      posterUrl,
      onLoadStart,
      onCanPlay,
      onLoadedMetadata,
      onError
    }
  }
}
</script>

<style scoped>
.hls-video-player {
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
  object-fit: cover;
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
  gap: 8px;
}

.loading-overlay .el-icon {
  font-size: 24px;
}

.error-overlay .el-icon {
  font-size: 32px;
  color: #f56c6c;
}
</style>
