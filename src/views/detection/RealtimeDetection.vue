<template>
  <div class="realtime-detection">
    <!-- 左侧设备树 -->
    <div class="device-sidebar">
      <div class="sidebar-header">
        <el-icon><VideoCamera /></el-icon>
        <span>显示所有通道</span>
      </div>
      
      <el-input 
        v-model="searchText" 
        placeholder="搜索设备..." 
        class="search-input"
        clearable
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
      
      <div class="status-filters">
        <span class="filter-label">状态：</span>
        <el-button :type="statusFilter === 'all' ? 'primary' : ''" size="small" @click="statusFilter = 'all'">不限</el-button>
        <el-button :type="statusFilter === 'online' ? 'primary' : ''" size="small" @click="statusFilter = 'online'">在线</el-button>
        <el-button :type="statusFilter === 'offline' ? 'primary' : ''" size="small" @click="statusFilter = 'offline'">离线</el-button>
      </div>

      <div v-loading="loading" element-loading-text="正在加载设备和通道..." class="tree-loading-wrapper">
        <el-tree
          :data="deviceTree"
          :props="treeProps"
          node-key="id"
          default-expand-all
          :filter-node-method="filterNode"
          ref="treeRef"
          class="device-tree"
          @node-click="handleNodeClick"
        >
          <template #default="{ node, data }">
            <span class="custom-tree-node">
              <el-icon v-if="data.type === 'group'"><Folder /></el-icon>
              <el-icon v-else-if="data.type === 'device'"><Monitor /></el-icon>
              <el-icon v-else><VideoCamera /></el-icon>
              <span class="node-label">{{ node.label }}</span>
              <span v-if="data.online !== undefined" :class="['status-dot', data.online ? 'online' : 'offline']"></span>
            </span>
          </template>
        </el-tree>
        
        <div v-if="!loading && deviceTree.length === 0" class="empty-state">
          <el-icon :size="40" style="color: rgba(255, 255, 255, 0.3);"><VideoCamera /></el-icon>
          <p style="margin-top: 10px; color: rgba(255, 255, 255, 0.5);">暂无设备数据</p>
        </div>
      </div>
    </div>

    <!-- 右侧主内容区 -->
    <div class="main-content">
      <!-- 视频网格区域 -->
      <div class="video-grid-wrapper">
    <div class="video-grid" :class="'grid-' + currentLayout">
          <div 
            v-for="n in currentLayout" 
            :key="n" 
            class="video-cell"
            :class="{ 'active': selectedCell === n }"
            @click="selectCell(n)"
          >
        <div class="video-container">
          <!-- 每个分屏都显示视频播放器 -->
          <div class="video-player-wrapper">
            <!-- 流地址输入框 -->
            <div class="stream-input-panel" v-if="!playerStates[n - 1].isPlaying">
              <el-input
                v-model="playerStates[n - 1].streamUrl"
                placeholder="请输入流地址 (支持 HTTP-FLV/WS-FLV/HLS)"
                class="stream-url-input"
                @keyup.enter="handlePlayStream(n)"
              >
                <template #prepend>
                  <el-icon><VideoCamera /></el-icon>
                </template>
              </el-input>
              <el-button 
                type="primary" 
                @click="handlePlayStream(n)"
                :loading="playerStates[n - 1].isLoading"
                class="play-stream-btn"
              >
                播放
              </el-button>
            </div>
            
            <!-- 视频播放区域 - 始终存在于DOM中 -->
            <video 
              :ref="el => setVideoRef(el, n)" 
              class="video-player"
              muted
              playsinline
              preload="none"
              webkit-playsinline
              :disablePictureInPicture="true"
              disableRemotePlayback
              x5-video-player-type="h5"
              x5-video-player-fullscreen="true"
              x5-video-orientation="portraint"
            ></video>
            
            <!-- 停止按钮 (播放时显示) -->
            <div v-if="playerStates[n - 1].isPlaying" class="stop-btn-wrapper">
              <el-button 
                type="danger" 
                size="small"
                @click="handleStopStream(n)"
                class="stop-stream-btn"
              >
                <el-icon><Close /></el-icon>
                停止
              </el-button>
            </div>
          </div>

          <div class="video-info-bar">
            <span class="channel-name">通道 {{ n }}</span>
            <span class="time-display">{{ currentTime }}</span>
          </div>
          <div class="overlay-info" v-if="hasWarning(n)">
            <el-tag type="danger" size="small">预警</el-tag>
          </div>
        </div>
          </div>
        </div>
      </div>

      <!-- 底部控制栏 -->
      <div class="control-bar">
        <!-- 分屏切换按钮 -->
        <div class="control-group layout-controls">
          <el-tooltip content="1画面" placement="top">
            <el-button :type="currentLayout === 1 ? 'primary' : ''" @click="setLayout(1)" class="layout-btn">
              <svg class="grid-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <rect x="4" y="4" width="16" height="16" rx="2" fill="none" stroke="currentColor" stroke-width="2"/>
              </svg>
            </el-button>
          </el-tooltip>
          <el-tooltip content="4画面" placement="top">
            <el-button :type="currentLayout === 4 ? 'primary' : ''" @click="setLayout(4)" class="layout-btn">
              <svg class="grid-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="3" width="8" height="8" rx="1" fill="currentColor"/>
                <rect x="13" y="3" width="8" height="8" rx="1" fill="currentColor"/>
                <rect x="3" y="13" width="8" height="8" rx="1" fill="currentColor"/>
                <rect x="13" y="13" width="8" height="8" rx="1" fill="currentColor"/>
              </svg>
            </el-button>
          </el-tooltip>
          <el-tooltip content="9画面" placement="top">
            <el-button :type="currentLayout === 9 ? 'primary' : ''" @click="setLayout(9)" class="layout-btn">
              <svg class="grid-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <rect x="2" y="2" width="5.5" height="5.5" rx="0.5" fill="currentColor"/>
                <rect x="9.25" y="2" width="5.5" height="5.5" rx="0.5" fill="currentColor"/>
                <rect x="16.5" y="2" width="5.5" height="5.5" rx="0.5" fill="currentColor"/>
                <rect x="2" y="9.25" width="5.5" height="5.5" rx="0.5" fill="currentColor"/>
                <rect x="9.25" y="9.25" width="5.5" height="5.5" rx="0.5" fill="currentColor"/>
                <rect x="16.5" y="9.25" width="5.5" height="5.5" rx="0.5" fill="currentColor"/>
                <rect x="2" y="16.5" width="5.5" height="5.5" rx="0.5" fill="currentColor"/>
                <rect x="9.25" y="16.5" width="5.5" height="5.5" rx="0.5" fill="currentColor"/>
                <rect x="16.5" y="16.5" width="5.5" height="5.5" rx="0.5" fill="currentColor"/>
              </svg>
            </el-button>
          </el-tooltip>
          <el-tooltip content="16画面" placement="top">
            <el-button :type="currentLayout === 16 ? 'primary' : ''" @click="setLayout(16)" class="layout-btn">
              <svg class="grid-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <rect x="2" y="2" width="4" height="4" rx="0.5" fill="currentColor"/>
                <rect x="7.33" y="2" width="4" height="4" rx="0.5" fill="currentColor"/>
                <rect x="12.67" y="2" width="4" height="4" rx="0.5" fill="currentColor"/>
                <rect x="18" y="2" width="4" height="4" rx="0.5" fill="currentColor"/>
                <rect x="2" y="7.33" width="4" height="4" rx="0.5" fill="currentColor"/>
                <rect x="7.33" y="7.33" width="4" height="4" rx="0.5" fill="currentColor"/>
                <rect x="12.67" y="7.33" width="4" height="4" rx="0.5" fill="currentColor"/>
                <rect x="18" y="7.33" width="4" height="4" rx="0.5" fill="currentColor"/>
                <rect x="2" y="12.67" width="4" height="4" rx="0.5" fill="currentColor"/>
                <rect x="7.33" y="12.67" width="4" height="4" rx="0.5" fill="currentColor"/>
                <rect x="12.67" y="12.67" width="4" height="4" rx="0.5" fill="currentColor"/>
                <rect x="18" y="12.67" width="4" height="4" rx="0.5" fill="currentColor"/>
                <rect x="2" y="18" width="4" height="4" rx="0.5" fill="currentColor"/>
                <rect x="7.33" y="18" width="4" height="4" rx="0.5" fill="currentColor"/>
                <rect x="12.67" y="18" width="4" height="4" rx="0.5" fill="currentColor"/>
                <rect x="18" y="18" width="4" height="4" rx="0.5" fill="currentColor"/>
              </svg>
            </el-button>
          </el-tooltip>
        </div>

        <div class="control-spacer"></div>

        <!-- 播放控制 -->
        <div class="control-group playback-controls">
          <el-tooltip content="上一个" placement="top">
            <el-button @click="handlePrevious" class="func-btn">
              <el-icon><DArrowLeft /></el-icon>
            </el-button>
          </el-tooltip>
          <el-tooltip content="播放/暂停" placement="top">
            <el-button @click="handlePlayPause" type="primary" class="func-btn">
              <el-icon v-if="!isPlaying"><VideoPlay /></el-icon>
              <el-icon v-else><VideoPause /></el-icon>
            </el-button>
          </el-tooltip>
          <el-tooltip content="下一个" placement="top">
            <el-button @click="handleNext" class="func-btn">
              <el-icon><DArrowRight /></el-icon>
            </el-button>
          </el-tooltip>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, watch, onMounted, onUnmounted, computed, nextTick } from 'vue'
import { ElButton, ElTag, ElInput, ElTree, ElTooltip, ElMessage } from 'element-plus'
import { 
  VideoCamera, Folder, Search, VideoPlay, VideoPause,
  DArrowLeft, DArrowRight, Monitor, Close
} from '@element-plus/icons-vue'
import { gb28181API } from '@/api/system'

export default {
  name: 'RealtimeDetection',
  components: {
    ElButton,
    ElTag,
    ElInput,
    ElTree,
    ElTooltip,
    VideoCamera,
    Folder,
    Monitor,
    Search,
    VideoPlay,
    VideoPause,
    DArrowLeft,
    DArrowRight,
    Close
  },
  setup() {
    const currentLayout = ref(16) // 默认16分屏
    const selectedCell = ref(1) // 当前选中的视频格子
    const warnings = ref(new Set([2, 4])) // 模拟某些摄像头有预警
    const searchText = ref('')
    const statusFilter = ref('all')
    const treeRef = ref(null)
    const isPlaying = ref(true)
    const currentTime = ref('')
    const loading = ref(false)

    // 多个视频播放器相关
    const MAX_PLAYERS = 16 // 最大支持16个播放器
    const videoRefs = {} // 存储每个video元素的引用
    const playerInstances = {} // 存储每个播放器实例
    
    // 每个播放器的状态
    const playerStates = ref(Array.from({ length: MAX_PLAYERS }, () => ({
      streamUrl: '',
      isPlaying: false,
      isLoading: false
    })))
    
    // 获取当前播放的视频数量
    const getPlayingCount = () => {
      return playerStates.value.filter(state => state.isPlaying).length
    }
    
    // 根据播放数量动态获取配置 - 16路激进优化
    const getDynamicConfig = (baseConfig, playingCount) => {
      if (playingCount <= 4) {
        // 4路以内：较高质量配置
        return {
          ...baseConfig,
          liveBufferLatencyMaxLatency: 2.0,
          liveBufferLatencyMinRemain: 0.8,
          stashInitialSize: 384,
          autoCleanupMaxBackwardDuration: 10,
          autoCleanupMinBackwardDuration: 5
        }
      } else if (playingCount <= 9) {
        // 5-9路：平衡配置 - 保持稳定
        return {
          ...baseConfig,
          liveBufferLatencyMaxLatency: 1.8,
          liveBufferLatencyMinRemain: 0.6,
          stashInitialSize: 256,
          autoCleanupMaxBackwardDuration: 8,
          autoCleanupMinBackwardDuration: 4
        }
      } else if (playingCount <= 12) {
        // 10-12路：性能优先 - 减少缓冲
        return {
          ...baseConfig,
          liveBufferLatencyMaxLatency: 1.2,
          liveBufferLatencyMinRemain: 0.3,
          stashInitialSize: 128, // 减小缓冲
          autoCleanupMaxBackwardDuration: 4,
          autoCleanupMinBackwardDuration: 2
        }
      } else {
        // 13-16路：极限性能 - 最小化配置
        return {
          ...baseConfig,
          enableStashBuffer: false, // 禁用stash buffer
          liveBufferLatencyMaxLatency: 0.8,
          liveBufferLatencyMinRemain: 0.2,
          stashInitialSize: 64, // 最小缓冲
          autoCleanupMaxBackwardDuration: 2,
          autoCleanupMinBackwardDuration: 0.5
        }
      }
    }
    
    // 设置 video 元素的引用
    const setVideoRef = (el, index) => {
      if (el) {
        videoRefs[index] = el
      }
    }
    
    // 获取指定索引的 video 元素
    const getVideoElement = (index) => {
      return videoRefs[index]
    }

    // 树形结构配置
    const treeProps = {
      children: 'children',
      label: 'label'
    }

    // 原始设备和通道数据
    const rawDeviceTree = ref([])
    
    // 根据状态过滤后的设备树
    const deviceTree = computed(() => {
      let filteredTree = JSON.parse(JSON.stringify(rawDeviceTree.value))
      
      // 应用状态过滤
      if (statusFilter.value !== 'all') {
        filteredTree = filterTreeByStatus(filteredTree, statusFilter.value)
      }
      
      return filteredTree
    })

    // 根据状态过滤树形数据
    const filterTreeByStatus = (tree, status) => {
      return tree.filter(node => {
        // 如果有子节点，先递归过滤子节点
        if (node.children && node.children.length > 0) {
          node.children = filterTreeByStatus(node.children, status)
        }
        
        // 如果是设备或通道节点，根据在线状态过滤
        if (node.type === 'device' || node.type === 'channel') {
          const isOnline = node.online === true || (node.status && node.status.toUpperCase() === 'ON')
          if (status === 'online' && !isOnline) {
            return false
          }
          if (status === 'offline' && isOnline) {
            return false
          }
        }
        
        // 保留有子节点的分组节点
        if (node.type === 'group' && (!node.children || node.children.length === 0)) {
          return false
        }
        
        return true
      })
    }

    // 加载设备列表
    const loadDevices = async () => {
      loading.value = true
      try {
        const response = await gb28181API.getWVPDevices({
          page: 1,
          count: 100
        })
        
        if (response && response.data && response.data.list) {
          const devices = response.data.list
          const deviceTreeData = []
          
          // 为每个设备加载通道
          for (const device of devices) {
            const deviceId = device.deviceId || device.device_id
            const deviceName = device.name || deviceId
            const isOnline = device.status?.toUpperCase() === 'ON'
            
            // 创建设备节点
            const deviceNode = {
              id: `device-${deviceId}`,
              label: deviceName,
              type: 'device',
              online: isOnline,
              deviceId: deviceId,
              children: []
            }
            
            // 加载该设备的通道
            try {
              const channelResponse = await gb28181API.getWVPDeviceChannels(deviceId, {
                page: 1,
                count: 100
              })
              
              if (channelResponse && channelResponse.data && channelResponse.data.list) {
                const channels = channelResponse.data.list
                
                // 添加通道节点
                channels.forEach((channel, index) => {
                  const channelId = channel.channelId || channel.channel_id || channel.deviceId || channel.device_id
                  const channelName = channel.name || channel.channel_name || `通道 ${index + 1}`
                  const channelOnline = channel.status?.toUpperCase() === 'ON'
                  
                  deviceNode.children.push({
                    id: `channel-${deviceId}-${channelId}`,
                    label: channelName,
                    type: 'channel',
                    online: channelOnline,
                    deviceId: deviceId,
                    channelId: channelId,
                    channelData: channel
                  })
                })
              }
            } catch (error) {
              console.error(`加载设备 ${deviceId} 的通道失败:`, error)
            }
            
            deviceTreeData.push(deviceNode)
          }
          
          rawDeviceTree.value = deviceTreeData
          ElMessage.success(`成功加载 ${devices.length} 个设备`)
        }
      } catch (error) {
        console.error('加载设备列表失败:', error)
        ElMessage.error('加载设备列表失败，请检查网络连接')
      } finally {
        loading.value = false
      }
    }

    // 更新时间显示
    const updateTime = () => {
      const now = new Date()
      currentTime.value = now.toLocaleTimeString('zh-CN', { hour12: false })
    }

    let timeInterval = null

    onMounted(() => {
      updateTime()
      timeInterval = setInterval(updateTime, 1000)
      // 加载设备和通道数据
      loadDevices()
    })

    onUnmounted(() => {
      if (timeInterval) {
        clearInterval(timeInterval)
      }
      cleanupAllPlayers()
    })

    // 监听搜索文本变化
    watch(searchText, (val) => {
      if (treeRef.value) {
        treeRef.value.filter(val)
      }
    })

    const setLayout = (layout) => {
      currentLayout.value = layout
      selectedCell.value = 1
    }

    const selectCell = (n) => {
      selectedCell.value = n
    }

    const hasWarning = (cameraId) => {
      return warnings.value.has(cameraId)
    }

    const filterNode = (value, data) => {
      if (!value) return true
      return data.label.toLowerCase().includes(value.toLowerCase())
    }

    const handleNodeClick = async (data) => {
      console.log('节点点击:', data)
      if (data.type === 'channel') {
        ElMessage.success(`选中通道: ${data.label}`)
        // TODO: 这里可以开始播放该通道的视频流
        // 可以调用 gb28181API.startWVPPreview 获取流地址
      } else if (data.type === 'device') {
        ElMessage.info(`选中设备: ${data.label}`)
      }
    }

    // 播放控制函数
    const handlePrevious = () => {
      if (selectedCell.value > 1) {
        selectedCell.value--
      }
    }

    const handleNext = () => {
      if (selectedCell.value < currentLayout.value) {
        selectedCell.value++
      }
    }

    const handlePlayPause = () => {
      isPlaying.value = !isPlaying.value
      ElMessage.info(isPlaying.value ? '播放' : '暂停')
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
      
      // HTTP FLV
      if (urlWithoutQuery.includes('.flv')) {
        return 'flv'
      }
      
      // HLS
      if (urlWithoutQuery.includes('.m3u8')) {
        return 'hls'
      }
      
      return 'unknown'
    }

    // 延迟监控器存储
    const latencyMonitors = {}
    
    // 全局同步定时器
    let globalSyncTimer = null
    
    // 清理延迟监控器
    const clearLatencyMonitor = (index) => {
      if (latencyMonitors[index]) {
        clearInterval(latencyMonitors[index])
        delete latencyMonitors[index]
      }
    }
    
    // 启动全局同步 - 16路优化
    const startGlobalSync = () => {
      // 先清理已有的同步定时器
      if (globalSyncTimer) {
        clearInterval(globalSyncTimer)
      }
      
      // 根据播放数量动态调整同步频率
      const playingCount = getPlayingCount()
      let syncInterval = 10000
      
      if (playingCount <= 4) {
        syncInterval = 8000 // 4路：8秒
      } else if (playingCount <= 9) {
        syncInterval = 12000 // 5-9路：12秒
      } else if (playingCount <= 12) {
        syncInterval = 10000 // 10-12路：10秒（略微增加）
      } else {
        syncInterval = 8000 // 13-16路：8秒（更频繁同步防止偏移）
      }
      
      console.log(`启动全局同步，当前${playingCount}路视频，同步间隔${syncInterval}ms`)
      
      // 创建新的全局同步定时器
      globalSyncTimer = setInterval(() => {
        syncAllPlayers()
      }, syncInterval)
    }
    
    // 停止全局同步
    const stopGlobalSync = () => {
      if (globalSyncTimer) {
        clearInterval(globalSyncTimer)
        globalSyncTimer = null
      }
    }
    
    // 同步所有播放器 - 16路激进优化
    const syncAllPlayers = () => {
      try {
        // 获取所有正在播放的视频元素
        const playingVideos = []
        
        for (let i = 1; i <= MAX_PLAYERS; i++) {
          if (playerStates.value[i - 1].isPlaying) {
            const videoElement = getVideoElement(i)
            if (videoElement && !videoElement.paused && !videoElement.ended) {
              const buffered = videoElement.buffered
              if (buffered.length > 0) {
                playingVideos.push({
                  index: i,
                  element: videoElement,
                  currentTime: videoElement.currentTime,
                  bufferedEnd: buffered.end(buffered.length - 1),
                  latency: buffered.end(buffered.length - 1) - videoElement.currentTime
                })
              }
            }
          }
        }
        
        // 如果少于2个视频在播放，不需要同步
        if (playingVideos.length < 2) {
          return
        }
        
        // 计算平均播放位置作为同步目标
        const avgTime = playingVideos.reduce((sum, v) => sum + v.currentTime, 0) / playingVideos.length
        
        // 根据视频数量调整同步阈值
        let syncThreshold = 5.0
        let keepBuffer = 2
        
        if (playingVideos.length <= 9) {
          syncThreshold = 5.0
          keepBuffer = 2
        } else if (playingVideos.length <= 12) {
          syncThreshold = 3.0 // 更激进
          keepBuffer = 1.0
        } else {
          syncThreshold = 2.0 // 16路时更激进
          keepBuffer = 0.5
        }
        
        // 同步所有视频到平均时间
        playingVideos.forEach(video => {
          const timeDiff = video.currentTime - avgTime
          
          if (Math.abs(timeDiff) > syncThreshold) {
            const targetTime = Math.max(0, Math.min(avgTime, video.bufferedEnd - keepBuffer))
            
            if (targetTime > 0 && targetTime < video.bufferedEnd) {
              console.log(`[同步] 通道${video.index}: ${video.currentTime.toFixed(2)}s → ${targetTime.toFixed(2)}s (差${timeDiff.toFixed(2)}s)`)
              video.element.currentTime = targetTime
            }
          }
          video.element.playbackRate = 1.0
        })
        
      } catch (e) {
        console.warn('全局同步出错:', e)
      }
    }

    // 清理播放器实例
    const cleanupPlayer = (index) => {
      const playerInstance = playerInstances[index]
      
      // 清理延迟监控器
      clearLatencyMonitor(index)
      
      if (!playerInstance) return
      
      try {
        // 尝试各种可能的清理方法
        if (typeof playerInstance.destroy === 'function') {
          playerInstance.destroy()
        } else if (typeof playerInstance.detachMediaElement === 'function') {
          playerInstance.detachMediaElement()
        } else if (typeof playerInstance.unload === 'function') {
          playerInstance.unload()
        }
      } catch (e) {
        console.warn('清理播放器时出错:', e)
      } finally {
        delete playerInstances[index]
      }
    }

    // 加载FLV流
    const loadFLV = async (url, index, isWebSocket = false) => {
      // 确保 video 元素存在
      const videoElement = getVideoElement(index)
      if (!videoElement) {
        throw new Error('视频元素未就绪')
      }
      
      // WebSocket 流优先尝试使用 mpegts.js
      if (isWebSocket) {
        try {
          const mpegts = await import('mpegts.js')
          
          if (!mpegts.default.isSupported()) {
            throw new Error('浏览器不支持 mpegts.js')
          }
          
          cleanupPlayer(index)
          
          const mediaDataSource = {
            type: 'flv',
            url: url,
            isLive: true
          }
          
          // 根据当前播放数量动态获取配置 - 稳定GPU使用
          const playingCount = getPlayingCount()
          const baseConfig = {
            enableWorker: false, // 禁用worker减少开销
            enableStashBuffer: true, // 启用stash buffer保持稳定
            isLive: true,
            lazyLoad: false, // 禁用懒加载，保持连续加载
            autoCleanupSourceBuffer: true, // 自动清理
            autoCleanupMaxBackwardDuration: 10, // 保留更多缓冲
            autoCleanupMinBackwardDuration: 5, // 保持稳定
            fixAudioTimestampGap: false, // 禁用以提升性能
            liveBufferLatencyChasing: true,
            liveBufferLatencyChasingOnPaused: false,
            // 稳定配置：适度缓冲
            liveBufferLatencyMaxLatency: 2.0,
            liveBufferLatencyMinRemain: 0.8
          }
          
          const config = getDynamicConfig(baseConfig, playingCount)
          console.log(`通道${index} mpegts配置 (${playingCount}路):`, config)
          
          playerInstances[index] = mpegts.default.createPlayer(mediaDataSource, config)
          
          // 确保在 attachMediaElement 之前 video 元素仍然存在
          if (!videoElement) {
            throw new Error('视频元素丢失')
          }
          
          // 确保是 HTMLVideoElement
          if (!(videoElement instanceof HTMLVideoElement)) {
            throw new Error('videoElement 不是有效的 video 元素')
          }
          
          console.log('mpegts.js - 准备 attachMediaElement, video元素:', videoElement)
          
          playerInstances[index].attachMediaElement(videoElement)
          
          playerInstances[index].on(mpegts.default.Events.ERROR, (errorType, errorDetail) => {
            console.error('mpegts.js 错误:', { errorType, errorDetail })
            ElMessage.error(`通道${index}播放错误: ${errorType}`)
            playerStates.value[index - 1].isPlaying = false
            playerStates.value[index - 1].isLoading = false
          })
          
          playerInstances[index].load()
          
          if (!videoElement) {
            throw new Error('视频元素丢失')
          }
          
          // 设置低延迟和性能优化属性
          videoElement.playsInline = true
          
          // GPU性能优化
          videoElement.style.transform = 'translateZ(0)' // 启用硬件加速
          videoElement.style.backfaceVisibility = 'hidden'
          
          // 根据播放数量调整优化策略
          const currentPlayingCount = getPlayingCount()
          if (currentPlayingCount > 12) {
            // 16路：极限优化
            videoElement.style.imageRendering = 'pixelated'
            videoElement.style.filter = 'contrast(0.95) brightness(0.98)'
          } else if (currentPlayingCount > 9) {
            // 10-12路：中度优化
            videoElement.style.imageRendering = 'optimizeSpeed'
          }
          
          await videoElement.play()
          
          // 启用延迟优化监控
          setupLatencyMonitor(videoElement, index)
          
          return
        } catch (mpegtsError) {
          console.warn('mpegts.js 加载失败，回退到 flv.js:', mpegtsError)
        }
      }
      
      // 使用 flv.js
      const flvjs = await import('flv.js')
      
      if (!flvjs.default.isSupported()) {
        throw new Error('浏览器不支持 FLV 播放')
      }
      
      cleanupPlayer(index)
      
      // 再次确认 video 元素存在
      if (!videoElement) {
        throw new Error('视频元素未就绪')
      }
      
      const mediaDataSource = {
        type: 'flv',
        url: url,
        isLive: true,
        cors: !isWebSocket,
        withCredentials: false
      }
      
      // 根据当前播放数量动态获取配置 - 稳定GPU使用
      const playingCount = getPlayingCount()
      const baseConfig = {
        enableWorker: false, // 禁用worker减少开销
        enableStashBuffer: true, // 启用stash buffer保持稳定
        isLive: true,
        lazyLoad: false, // 禁用懒加载，保持连续
        autoCleanupSourceBuffer: true, // 自动清理
        autoCleanupMaxBackwardDuration: 10, // 保留更多缓冲
        autoCleanupMinBackwardDuration: 5, // 保持稳定
        fixAudioTimestampGap: false, // 禁用以提升性能
        liveBufferLatencyChasing: true,
        liveBufferLatencyChasingOnPaused: false,
        // 稳定配置：适度缓冲
        liveBufferLatencyMaxLatency: 2.0,
        liveBufferLatencyMinRemain: 0.8
      }
      
      const config = getDynamicConfig(baseConfig, playingCount)
      console.log(`通道${index} flv配置 (${playingCount}路):`, config)
      
      playerInstances[index] = flvjs.default.createPlayer(mediaDataSource, config)
      
      if (!videoElement) {
        throw new Error('视频元素丢失')
      }
      
      // 确保是 HTMLVideoElement
      if (!(videoElement instanceof HTMLVideoElement)) {
        throw new Error('videoElement 不是有效的 video 元素')
      }
      
      console.log('flv.js - 准备 attachMediaElement, video元素:', videoElement)
      
      playerInstances[index].attachMediaElement(videoElement)
      
      playerInstances[index].on(flvjs.default.Events.ERROR, (errorType, errorDetail) => {
        console.error('FLV 错误:', { errorType, errorDetail })
        ElMessage.error(`通道${index}播放错误: ${errorType}`)
        playerStates.value[index - 1].isPlaying = false
        playerStates.value[index - 1].isLoading = false
      })
      
      playerInstances[index].load()
      
      if (!videoElement) {
        throw new Error('视频元素丢失')
      }
      
      // 设置低延迟和性能优化属性
      videoElement.playsInline = true
      
      // GPU性能优化
      videoElement.style.transform = 'translateZ(0)' // 启用硬件加速
      videoElement.style.backfaceVisibility = 'hidden'
      
      // 根据播放数量调整优化策略
      const currentPlayingCount = getPlayingCount()
      if (currentPlayingCount > 12) {
        // 16路：极限优化
        videoElement.style.imageRendering = 'pixelated'
        videoElement.style.filter = 'contrast(0.95) brightness(0.98)'
      } else if (currentPlayingCount > 9) {
        // 10-12路：中度优化
        videoElement.style.imageRendering = 'optimizeSpeed'
      }
      
      await videoElement.play()
      
      // 启用延迟优化监控
      setupLatencyMonitor(videoElement, index)
    }

    // 加载HLS流
    const loadHLS = async (url, index) => {
      // 确保 video 元素存在
      const videoElement = getVideoElement(index)
      if (!videoElement) {
        throw new Error('视频元素未就绪')
      }
      
      if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
        videoElement.src = url
        await videoElement.play()
        return
      }
      
      const { default: Hls } = await import('hls.js')
      
      if (!Hls.isSupported()) {
        throw new Error('浏览器不支持 HLS 播放')
      }
      
      cleanupPlayer(index)
      
      // 再次确认 video 元素存在
      if (!videoElement) {
        throw new Error('视频元素未就绪')
      }
      
      // 根据当前播放数量动态获取HLS配置 - 16路激进优化
      const playingCount = getPlayingCount()
      let hlsConfig = {
        debug: false,
        enableWorker: false,
        lowLatencyMode: false,
        liveDurationInfinity: false
      }
      
      if (playingCount <= 4) {
        // 4路以内：高质量配置
        hlsConfig = {
          ...hlsConfig,
          maxBufferSize: 30 * 1000 * 1000,
          maxBufferHole: 0.5,
          maxBufferLength: 10,
          maxMaxBufferLength: 20,
          backBufferLength: 8,
          liveSyncDurationCount: 3,
          liveMaxLatencyDurationCount: 6,
          highBufferWatchdogPeriod: 3
        }
      } else if (playingCount <= 9) {
        // 5-9路：平衡配置
        hlsConfig = {
          ...hlsConfig,
          maxBufferSize: 25 * 1000 * 1000,
          maxBufferHole: 0.5,
          maxBufferLength: 8,
          maxMaxBufferLength: 15,
          backBufferLength: 5,
          liveSyncDurationCount: 2,
          liveMaxLatencyDurationCount: 5,
          highBufferWatchdogPeriod: 3
        }
      } else if (playingCount <= 12) {
        // 10-12路：性能优先
        hlsConfig = {
          ...hlsConfig,
          maxBufferSize: 15 * 1000 * 1000, // 15MB
          maxBufferHole: 0.8,
          maxBufferLength: 4, // 大幅减少
          maxMaxBufferLength: 8,
          backBufferLength: 2,
          liveSyncDurationCount: 1,
          liveMaxLatencyDurationCount: 3,
          highBufferWatchdogPeriod: 5
        }
      } else {
        // 13-16路：极限性能 - 最小化
        hlsConfig = {
          ...hlsConfig,
          maxBufferSize: 8 * 1000 * 1000, // 仅8MB
          maxBufferHole: 1.0,
          maxBufferLength: 2, // 最小缓冲
          maxMaxBufferLength: 4,
          backBufferLength: 0.5,
          liveSyncDurationCount: 1,
          liveMaxLatencyDurationCount: 2,
          highBufferWatchdogPeriod: 6
        }
      }
      
      console.log(`通道${index} HLS配置 (${playingCount}路):`, hlsConfig)
      
      playerInstances[index] = new Hls(hlsConfig)
      
      playerInstances[index].on(Hls.Events.ERROR, (event, data) => {
        console.error('HLS 错误:', data)
        if (data.fatal) {
          ElMessage.error(`通道${index}播放错误: ${data.type}`)
          playerStates.value[index - 1].isPlaying = false
          playerStates.value[index - 1].isLoading = false
        }
      })
      
      playerInstances[index].loadSource(url)
      
      if (!videoElement) {
        throw new Error('视频元素丢失')
      }
      
      // 确保是 HTMLVideoElement
      if (!(videoElement instanceof HTMLVideoElement)) {
        throw new Error('videoElement 不是有效的 video 元素')
      }
      
      console.log('hls.js - 准备 attachMedia, video元素:', videoElement)
      
      playerInstances[index].attachMedia(videoElement)
      
      playerInstances[index].on(Hls.Events.MANIFEST_PARSED, () => {
        const video = getVideoElement(index)
        if (video) {
          // 设置低延迟和性能优化属性
          video.playsInline = true
          
          // GPU性能优化
          video.style.transform = 'translateZ(0)' // 启用硬件加速
          video.style.backfaceVisibility = 'hidden'
          
          // 根据播放数量调整优化策略
          const currentPlayingCount = getPlayingCount()
          if (currentPlayingCount > 12) {
            // 16路：极限优化
            video.style.imageRendering = 'pixelated'
            video.style.filter = 'contrast(0.95) brightness(0.98)'
          } else if (currentPlayingCount > 9) {
            // 10-12路：中度优化
            video.style.imageRendering = 'optimizeSpeed'
          }
          
          video.play().then(() => {
            // 启用延迟优化监控
            setupLatencyMonitor(video, index)
          }).catch(err => {
            console.error('HLS play 失败:', err)
          })
        }
      })
    }
    
    // 设置延迟监控和优化 - 16路激进优化
    const setupLatencyMonitor = (videoElement, index) => {
      // 清除已有的监控器
      if (latencyMonitors[index]) {
        clearInterval(latencyMonitors[index])
      }
      
      // 根据播放数量动态调整监控频率
      const playingCount = getPlayingCount()
      let monitorInterval = 5000
      let latencyThreshold = 10 // 延迟阈值
      let keepBuffer = 2 // 保留缓冲
      
      if (playingCount <= 4) {
        monitorInterval = 5000
        latencyThreshold = 10
        keepBuffer = 2
      } else if (playingCount <= 9) {
        monitorInterval = 8000
        latencyThreshold = 8
        keepBuffer = 1.5
      } else if (playingCount <= 12) {
        monitorInterval = 6000 // 增加监控频率
        latencyThreshold = 5 // 更激进的阈值
        keepBuffer = 0.8
      } else {
        // 13-16路：激进监控
        monitorInterval = 4000 // 更频繁监控
        latencyThreshold = 3 // 激进阈值
        keepBuffer = 0.3 // 最小保留
      }
      
      // 创建新的监控器
      latencyMonitors[index] = setInterval(() => {
        if (!videoElement || videoElement.paused || videoElement.ended) {
          return
        }
        
        try {
          const buffered = videoElement.buffered
          if (buffered.length > 0) {
            const bufferedEnd = buffered.end(buffered.length - 1)
            const currentTime = videoElement.currentTime
            const latency = bufferedEnd - currentTime
            
            // 根据路数动态调整控制策略
            if (latency > latencyThreshold) {
              console.log(`通道${index}延迟过高: ${latency.toFixed(2)}秒，跳转`)
              videoElement.currentTime = bufferedEnd - keepBuffer
            }
            videoElement.playbackRate = 1.0
          }
        } catch (e) {
          console.warn(`通道${index}延迟监控出错:`, e)
        }
      }, monitorInterval)
    }

    // 播放流
    const handlePlayStream = async (cellIndex) => {
      const state = playerStates.value[cellIndex - 1]
      
      if (!state.streamUrl) {
        ElMessage.warning('请输入流地址')
        return
      }
      
      try {
        state.isLoading = true
        
        // 等待 DOM 更新，确保 video 元素已渲染
        await nextTick()
        
        // 获取实际的 video 元素
        const videoElement = getVideoElement(cellIndex)
        
        // 详细检查 video 元素
        console.log('videoElement:', videoElement)
        console.log('videoElement 类型:', typeof videoElement)
        console.log('是否是 HTMLVideoElement:', videoElement instanceof HTMLVideoElement)
        
        // 再次检查 video 元素是否已准备好
        if (!videoElement) {
          console.error('video 元素未找到')
          ElMessage.error('视频播放器未准备好，请稍后重试')
          state.isLoading = false
          return
        }
        
        // 确保是真正的 video 元素
        if (!(videoElement instanceof HTMLVideoElement)) {
          console.error('videoElement 不是 HTMLVideoElement')
          ElMessage.error('视频元素类型错误')
          state.isLoading = false
          return
        }
        
        const streamType = detectStreamType(state.streamUrl)
        
        switch (streamType) {
          case 'ws-flv':
            await loadFLV(state.streamUrl, cellIndex, true)
            break
          case 'flv':
            await loadFLV(state.streamUrl, cellIndex, false)
            break
          case 'hls':
            await loadHLS(state.streamUrl, cellIndex)
            break
          default:
            await loadFLV(state.streamUrl, cellIndex, false)
            break
        }
        
        state.isPlaying = true
        state.isLoading = false
        
        const playingCount = getPlayingCount()
        let message = `通道${cellIndex}播放成功`
        
        // 性能提示 - 细化提示
        if (playingCount > 12) {
          message += ` (当前${playingCount}路，极限性能模式)`
          ElMessage.warning(message)
        } else if (playingCount > 9) {
          message += ` (当前${playingCount}路，性能优化模式)`
          ElMessage.success(message)
        } else if (playingCount > 6) {
          message += ` (当前${playingCount}路，平衡模式)`
          ElMessage.success(message)
        } else {
          ElMessage.success(message)
        }
        
        // 启动全局同步（如果有多个视频在播放）
        startGlobalSync()
        
      } catch (error) {
        console.error('播放失败:', error)
        
        // 播放失败时清理资源
        cleanupPlayer(cellIndex)
        state.isPlaying = false
        state.isLoading = false
        
        // 显示友好的错误提示
        let errorMsg = '播放失败'
        if (error.message) {
          if (error.message.includes('支持')) {
            errorMsg = '浏览器不支持此播放格式'
          } else {
            errorMsg = error.message
          }
        }
        
        ElMessage.error(`通道${cellIndex}: ${errorMsg}`)
      }
    }

    // 停止流
    const handleStopStream = (cellIndex) => {
      try {
        const state = playerStates.value[cellIndex - 1]
        state.isPlaying = false
        state.isLoading = false
        
        // 清理 video 元素
        const videoElement = getVideoElement(cellIndex)
        if (videoElement) {
          try {
            videoElement.pause()
            videoElement.removeAttribute('src')
            videoElement.load()
          } catch (e) {
            console.warn('清理 video 元素时出错:', e)
          }
        }
        
        // 清理播放器实例
        cleanupPlayer(cellIndex)
        
        // 检查是否还有其他播放器在运行
        const hasPlayingVideos = playerStates.value.some(state => state.isPlaying)
        if (!hasPlayingVideos) {
          // 如果没有视频在播放，停止全局同步
          stopGlobalSync()
          console.log('所有视频已停止，关闭全局同步')
        }
        
        ElMessage.info(`通道${cellIndex}已停止播放`)
      } catch (error) {
        console.error('停止失败:', error)
        ElMessage.error(`通道${cellIndex}停止播放时出错`)
      }
    }
    
    // 清理所有播放器
    const cleanupAllPlayers = () => {
      for (let i = 1; i <= MAX_PLAYERS; i++) {
        if (playerStates.value[i - 1].isPlaying) {
          handleStopStream(i)
        }
      }
      // 停止全局同步
      stopGlobalSync()
    }

    return {
      currentLayout,
      selectedCell,
      searchText,
      statusFilter,
      treeRef,
      treeProps,
      deviceTree,
      isPlaying,
      currentTime,
      loading,
      setLayout,
      selectCell,
      hasWarning,
      filterNode,
      handleNodeClick,
      handlePrevious,
      handleNext,
      handlePlayPause,
      loadDevices,
      // 多个视频播放器相关
      playerStates,
      setVideoRef,
      handlePlayStream,
      handleStopStream
    }
  }
}
</script>

<style scoped>
.realtime-detection {
  display: flex;
  height: 100%;
  width: 100%;
  background: linear-gradient(135deg, #0a1628 0%, #0d1b2e 50%, #0a1628 100%);
  overflow: hidden;
}

/* 左侧设备树 */
.device-sidebar {
  width: 280px;
  background: linear-gradient(180deg, rgba(15, 30, 50, 0.95) 0%, rgba(10, 22, 40, 0.98) 100%);
  border-right: 1px solid rgba(64, 158, 255, 0.2);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.3);
}

.sidebar-header {
  padding: 12px 15px;
  background: linear-gradient(135deg, rgba(24, 144, 255, 0.15) 0%, rgba(24, 144, 255, 0.05) 100%);
  border-bottom: 1px solid rgba(64, 158, 255, 0.3);
  display: flex;
  align-items: center;
  gap: 8px;
  color: #e8f4ff;
  font-size: 14px;
  font-weight: 500;
  backdrop-filter: blur(10px);
}

.search-input {
  margin: 10px 12px 8px;
}

.status-filters {
  padding: 8px 12px;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  border-bottom: 1px solid rgba(64, 158, 255, 0.15);
}

.filter-label {
  color: #91caff;
  font-size: 12px;
}

.tree-loading-wrapper {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  position: relative;
}

.device-tree {
  flex: 1;
  overflow-y: auto;
  background: transparent;
  color: #e8f4ff;
  padding: 4px 0;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
}

.custom-tree-node {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1;
  padding: 2px 0;
}

.node-label {
  flex: 1;
  font-size: 13px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-left: auto;
}

.status-dot.online {
  background: #52c41a;
}

.status-dot.offline {
  background: #999;
}

/* 右侧主内容区 */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0;
}

.video-grid-wrapper {
  flex: 1;
  padding: 8px;
  background: transparent;
  overflow: hidden;
  min-height: 0;
}

.video-grid {
  width: 100%;
  height: 100%;
  display: grid;
  gap: 6px;
  background: transparent;
}

/* 单屏模式 */
.grid-1 {
  grid-template-columns: 1fr;
  grid-template-rows: 1fr;
}

/* 4分屏模式 - 2x2 */
.grid-4 {
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(2, 1fr);
}

/* 6分屏模式 - 3x2 */
.grid-6 {
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(2, 1fr);
}

/* 8分屏模式 - 4x2 */
.grid-8 {
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: repeat(2, 1fr);
}

/* 9分屏模式 - 3x3 */
.grid-9 {
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(3, 1fr);
}

/* 16分屏模式 - 4x4 */
.grid-16 {
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: repeat(4, 1fr);
}

.video-cell {
  background: linear-gradient(135deg, rgba(10, 20, 35, 0.8) 0%, rgba(15, 25, 40, 0.9) 100%);
  border: 2px solid rgba(64, 158, 255, 0.25);
  border-radius: 6px;
  overflow: hidden;
  position: relative;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 
    0 2px 8px rgba(0, 0, 0, 0.3),
    inset 0 0 20px rgba(64, 158, 255, 0.05);
  backdrop-filter: blur(10px);
}

.video-cell.active {
  border-color: #1890ff;
  box-shadow: 
    0 0 15px rgba(24, 144, 255, 0.6),
    0 4px 12px rgba(0, 0, 0, 0.4),
    inset 0 0 30px rgba(24, 144, 255, 0.1);
  transform: translateY(-2px);
}

.video-cell:hover {
  border-color: #40a9ff;
  box-shadow: 
    0 0 10px rgba(64, 169, 255, 0.4),
    0 4px 12px rgba(0, 0, 0, 0.3),
    inset 0 0 25px rgba(64, 158, 255, 0.08);
  transform: translateY(-1px);
}

.video-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.video-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(5, 15, 30, 0.6) 0%, rgba(10, 20, 35, 0.8) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: 0;
  left: 0;
}

.video-placeholder::before {
  content: '📹';
  font-size: 3em;
  opacity: 0.2;
  filter: grayscale(100%) drop-shadow(0 0 10px rgba(64, 158, 255, 0.3));
}

.video-info-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(10, 20, 35, 0.95) 0%, rgba(10, 20, 35, 0.7) 70%, transparent 100%);
  padding: 6px 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #e8f4ff;
  font-size: 12px;
  backdrop-filter: blur(5px);
}

.channel-name {
  font-weight: 500;
  color: #91caff;
}

.time-display {
  color: #69b1ff;
  font-size: 11px;
  font-family: 'Courier New', monospace;
}

.overlay-info {
  position: absolute;
  top: 8px;
  left: 8px;
  z-index: 10;
}

/* 底部控制栏 */
.control-bar {
  height: 60px;
  background: linear-gradient(180deg, rgba(15, 30, 50, 0.95) 0%, rgba(10, 22, 40, 0.98) 100%);
  border-top: 1px solid rgba(64, 158, 255, 0.25);
  display: flex;
  align-items: center;
  padding: 0 15px;
  gap: 12px;
  flex-shrink: 0;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
}

.control-group {
  display: flex;
  align-items: center;
  gap: 4px;
}

.control-divider {
  width: 1px;
  height: 30px;
  background: rgba(64, 158, 255, 0.2);
}

.control-spacer {
  flex: 1;
}

.layout-btn,
.func-btn {
  width: 40px;
  height: 40px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(24, 144, 255, 0.1) 0%, rgba(24, 144, 255, 0.05) 100%);
  border: 1px solid rgba(64, 158, 255, 0.3);
  color: #91caff;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.layout-btn:hover,
.func-btn:hover {
  background: linear-gradient(135deg, rgba(24, 144, 255, 0.2) 0%, rgba(24, 144, 255, 0.1) 100%);
  border-color: #1890ff;
  color: #e8f4ff;
  box-shadow: 0 0 10px rgba(24, 144, 255, 0.4);
  transform: translateY(-2px);
}

.layout-btn.el-button--primary,
.func-btn.el-button--primary {
  background: linear-gradient(135deg, #1890ff 0%, #0066cc 100%);
  border-color: #1890ff;
  color: #fff;
  box-shadow: 0 0 15px rgba(24, 144, 255, 0.5);
}

/* 自定义SVG网格图标样式 */
.grid-icon {
  width: 20px;
  height: 20px;
  color: currentColor;
  transition: all 0.3s;
}

.layout-btn:hover .grid-icon {
  transform: scale(1.1);
}

/* Element Plus 组件样式覆盖 */
:deep(.el-input__wrapper) {
  background: rgba(15, 30, 50, 0.6);
  border: 1px solid rgba(64, 158, 255, 0.3);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(5px);
}

:deep(.el-input__inner) {
  color: #e8f4ff;
}

:deep(.el-input__inner::placeholder) {
  color: rgba(145, 202, 255, 0.5);
}

:deep(.el-input__wrapper:hover) {
  border-color: #1890ff;
  box-shadow: 0 0 8px rgba(24, 144, 255, 0.3);
}

:deep(.el-input__wrapper.is-focus) {
  border-color: #1890ff;
  box-shadow: 0 0 12px rgba(24, 144, 255, 0.4);
}

:deep(.el-tree) {
  background: transparent;
  color: #e8f4ff;
}

:deep(.el-tree-node__content) {
  background: transparent;
  color: #e8f4ff;
  height: 32px;
  transition: all 0.2s;
}

:deep(.el-tree-node__content:hover) {
  background: rgba(24, 144, 255, 0.15);
}

:deep(.el-tree-node:focus > .el-tree-node__content) {
  background: rgba(24, 144, 255, 0.2);
}

:deep(.el-tree-node__expand-icon) {
  color: #91caff;
}

:deep(.el-button) {
  border-radius: 6px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

:deep(.el-button--small) {
  height: 26px;
  padding: 4px 10px;
  font-size: 12px;
  background: rgba(24, 144, 255, 0.1);
  border-color: rgba(64, 158, 255, 0.3);
  color: #91caff;
}

:deep(.el-button--small:hover) {
  background: rgba(24, 144, 255, 0.2);
  border-color: #1890ff;
  color: #e8f4ff;
}

:deep(.el-button--small.el-button--primary) {
  background: linear-gradient(135deg, #1890ff 0%, #0066cc 100%);
  border-color: #1890ff;
  color: #fff;
}

:deep(.el-tooltip__trigger) {
  display: flex;
  align-items: center;
  justify-content: center;
}

:deep(.el-icon) {
  color: inherit;
}

/* 滚动条样式 */
.device-tree::-webkit-scrollbar {
  width: 6px;
}

.device-tree::-webkit-scrollbar-track {
  background: rgba(10, 20, 35, 0.3);
  border-radius: 3px;
}

.device-tree::-webkit-scrollbar-thumb {
  background: rgba(64, 158, 255, 0.3);
  border-radius: 3px;
}

.device-tree::-webkit-scrollbar-thumb:hover {
  background: rgba(64, 158, 255, 0.5);
}

/* Loading遮罩层样式覆盖 */
:deep(.el-loading-mask) {
  background-color: rgba(10, 20, 35, 0.95) !important;
  backdrop-filter: blur(8px);
}

:deep(.el-loading-spinner) {
  top: 50%;
  margin-top: -21px;
}

:deep(.el-loading-spinner .path) {
  stroke: #1890ff !important;
  stroke-width: 3;
}

:deep(.el-loading-spinner .el-loading-text) {
  color: #91caff !important;
  font-size: 14px;
  font-weight: 500;
  text-shadow: 0 0 10px rgba(24, 144, 255, 0.3);
  margin-top: 10px;
}

:deep(.el-loading-spinner .circular) {
  width: 50px;
  height: 50px;
  animation: loading-rotate 2s linear infinite;
}

@keyframes loading-rotate {
  100% {
    transform: rotate(360deg);
  }
}

/* 不同分屏下的摄像头图标大小 */
.grid-1 .video-placeholder::before {
  font-size: 5em;
}

.grid-4 .video-placeholder::before {
  font-size: 3em;
}

.grid-6 .video-placeholder::before,
.grid-8 .video-placeholder::before {
  font-size: 2.5em;
}

.grid-9 .video-placeholder::before {
  font-size: 2em;
}

.grid-16 .video-placeholder::before {
  font-size: 1.5em;
}

/* 视频播放器样式 */
.video-player-wrapper {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, rgba(5, 15, 30, 0.8) 0%, rgba(10, 20, 35, 0.9) 100%);
}

.stream-input-panel {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 90%;
  max-width: 500px;
  z-index: 10;
  padding: 24px;
  background: linear-gradient(135deg, rgba(15, 30, 50, 0.95) 0%, rgba(10, 22, 40, 0.98) 100%);
  border-radius: 12px;
  border: 1px solid rgba(64, 158, 255, 0.3);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
}

.stream-url-input {
  width: 100%;
}

.stream-url-input :deep(.el-input__wrapper) {
  background: rgba(10, 14, 39, 0.7);
  border: 1px solid rgba(64, 158, 255, 0.3);
  box-shadow: none;
}

.stream-url-input :deep(.el-input__wrapper:hover) {
  border-color: rgba(64, 158, 255, 0.5);
}

.stream-url-input :deep(.el-input__wrapper.is-focus) {
  border-color: #1890ff;
  box-shadow: 0 0 10px rgba(24, 144, 255, 0.3);
}

.stream-url-input :deep(.el-input__inner) {
  color: #e8f4ff;
}

.stream-url-input :deep(.el-input__inner::placeholder) {
  color: rgba(145, 202, 255, 0.5);
}

.stream-url-input :deep(.el-input-group__prepend) {
  background: rgba(24, 144, 255, 0.15);
  border-color: rgba(64, 158, 255, 0.3);
  color: #1890ff;
}

.play-stream-btn {
  width: 100%;
  background: linear-gradient(135deg, #1890ff 0%, #0066cc 100%);
  border: none;
  color: #fff;
  height: 40px;
  font-size: 15px;
  font-weight: 500;
  border-radius: 6px;
  transition: all 0.3s;
}

.play-stream-btn:hover {
  background: linear-gradient(135deg, #40a9ff 0%, #1890ff 100%);
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.4);
  transform: translateY(-2px);
}

.video-player {
  width: 100%;
  height: 100%;
  object-fit: contain;
  background: #000;
  /* GPU性能优化 */
  transform: translateZ(0);
  will-change: auto;
  /* 禁用不必要的功能 */
  pointer-events: auto;
}

/* 根据分屏数量降低视频渲染质量 */
.grid-9 .video-player {
  image-rendering: optimizeSpeed;
  image-rendering: -webkit-optimize-contrast;
}

/* 16分屏：极限性能优化 */
.grid-16 .video-player {
  image-rendering: optimizeSpeed;
  image-rendering: -webkit-optimize-contrast;
  image-rendering: crisp-edges;
  image-rendering: pixelated; /* 最激进的渲染优化 */
  /* 进一步降低渲染质量 */
  filter: contrast(0.95) brightness(0.98);
  /* 减少GPU合成层 */
  transform: translateZ(0) scale(0.99);
}

.stop-btn-wrapper {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 20;
}

.stop-stream-btn {
  background: linear-gradient(135deg, rgba(255, 77, 79, 0.9) 0%, rgba(204, 51, 51, 0.95) 100%);
  border: 1px solid rgba(255, 77, 79, 0.5);
  color: #fff;
  backdrop-filter: blur(5px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  transition: all 0.3s;
}

.stop-stream-btn:hover {
  background: linear-gradient(135deg, rgba(255, 102, 102, 0.95) 0%, rgba(230, 69, 69, 1) 100%);
  box-shadow: 0 4px 12px rgba(255, 77, 79, 0.5);
  transform: translateY(-2px);
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .device-sidebar {
    width: 240px;
  }
  
  .control-bar {
    height: 55px;
    padding: 0 10px;
  }
  
  .layout-btn,
  .func-btn {
    width: 36px;
    height: 36px;
  }
  
  .video-grid-wrapper {
    padding: 6px;
  }
  
  .video-grid {
    gap: 4px;
  }
}

@media (max-width: 768px) {
  .device-sidebar {
    width: 200px;
  }
  
  .control-bar {
    height: 50px;
    padding: 0 8px;
    gap: 8px;
  }
  
  .layout-btn,
  .func-btn {
    width: 32px;
    height: 32px;
  }
  
  .control-group {
    gap: 2px;
  }
  
  .video-grid-wrapper {
    padding: 4px;
  }
  
  .video-grid {
    gap: 3px;
  }
  
  .video-cell {
    border-width: 1px;
  }
}
</style>