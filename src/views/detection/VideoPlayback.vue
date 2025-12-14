<template>
  <div class="video-playback">
    <!-- 左侧设备树 -->
    <div class="device-sidebar">
      <div class="sidebar-header">
        <el-icon><VideoCamera /></el-icon>
        <span>{{ $t('device.device.allChannels') }}</span>
        <span class="total-indicator">{{ getOnlineChannelCount() }}/{{ getTotalChannelCount() }}</span>
      </div>
      
      <el-input 
        v-model="searchText" 
        :placeholder="$t('common.search') + $t('device.device.device') + '...'" 
        class="search-input"
        clearable
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
      
      <div class="status-filters">
        <span class="filter-label">{{ $t('common.status') }}：</span>
        <el-button :type="statusFilter === 'all' ? 'primary' : ''" size="small" @click="statusFilter = 'all'">{{ $t('common.all') }}</el-button>
        <el-button :type="statusFilter === 'online' ? 'primary' : ''" size="small" @click="statusFilter = 'online'">{{ $t('common.online') }}</el-button>
        <el-button :type="statusFilter === 'offline' ? 'primary' : ''" size="small" @click="statusFilter = 'offline'">{{ $t('common.offline') }}</el-button>
      </div>

      <!-- 时间选择器（选中通道后显示） -->
      <div v-if="selectedChannel" class="time-selector">
        <div class="selector-header">
          <el-icon><Calendar /></el-icon>
          <span>{{ $t('common.recordingTime') }}</span>
        </div>
        <div class="date-inputs">
          <el-date-picker
            v-model="recordingStartDate"
            type="date"
            :placeholder="$t('common.startDate')"
            size="small"
            class="date-picker-single"
            value-format="YYYY-MM-DD"
          />
          <span class="date-separator">-</span>
          <el-date-picker
            v-model="recordingEndDate"
            type="date"
            :placeholder="$t('common.endDate')"
            size="small"
            class="date-picker-single"
            value-format="YYYY-MM-DD"
          />
        </div>
        <el-button 
          type="primary" 
          size="small" 
          @click="loadChannelRecordings"
          :loading="loadingRecordings"
          class="query-btn"
        >
          <el-icon><Search /></el-icon>
{{ $t('common.query') }}
        </el-button>
      </div>

      <div v-loading="loading" :element-loading-text="$t('common.loading')" class="tree-loading-wrapper">
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
            <span class="custom-tree-node" :class="{'recording-node': data.type === 'recording'}">
              <el-icon v-if="data.type === 'group'"><Folder /></el-icon>
              <el-icon v-else-if="data.type === 'device'"><Monitor /></el-icon>
              <el-icon v-else-if="data.type === 'recording'"><VideoPlay /></el-icon>
              <el-icon v-else><VideoCamera /></el-icon>
              <span class="node-label">{{ node.label }}</span>
              <span v-if="data.type === 'device'" class="device-indicator">
                {{ getDeviceOnlineChannelCount(data.id) }}/{{ getDeviceTotalChannelCount(data.id) }}
              </span>
              <span v-if="data.type === 'channel' && data.recordingCount > 0" class="recording-count">
                {{ data.recordingCount }}个录像
              </span>
              <span v-if="data.type === 'recording'" class="recording-info">
                {{ formatFileSize(data.fileSize) }} | {{ data.duration }}s
              </span>
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
      <!-- 视频播放区域 -->
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
              <!-- 停止播放按钮 -->
              <div v-if="playbackPlayers[n - 1].videoUrl" class="stop-btn-wrapper">
                <el-button 
                  :size="currentLayout >= 9 ? 'small' : 'default'"
                  type="danger" 
                  @click.stop="stopPlayback(n)"
                  class="stop-stream-btn"
                >
                  <el-icon><VideoPause /></el-icon>
                  <span v-if="currentLayout <= 4">停止</span>
                </el-button>
              </div>
              
              <!-- 视频播放器 -->
              <div class="video-player-wrapper">
                <video 
                  v-if="playbackPlayers[n - 1].videoUrl"
                  :ref="el => setVideoRef(el, n)"
                  class="video-player"
                  :src="playbackPlayers[n - 1].videoUrl"
                  controls
                  autoplay
                  @loadedmetadata="() => onVideoLoaded(n)"
                  @timeupdate="() => onTimeUpdate(n)"
                  @ended="() => onVideoEnded(n)"
                >
                  您的浏览器不支持视频播放。
                </video>
              
                <!-- 空闲状态提示 -->
                <div v-else class="stream-input-panel">
                  <div class="empty-screen-hint">
                    <el-icon :size="currentLayout <= 4 ? 60 : 40" style="color: rgba(64, 158, 255, 0.3);"><VideoCamera /></el-icon>
                    <p style="margin-top: 12px; color: rgba(255, 255, 255, 0.6); font-size: 14px;">
                      {{ selectedCell === n ? '请在左侧选择录像播放' : '点击选中此分屏' }}
                    </p>
                  </div>
                </div>
              </div>

              <div class="video-info-bar">
                <span class="channel-name">
                  {{ playbackPlayers[n - 1].recordingInfo ? playbackPlayers[n - 1].recordingInfo.title : `分屏 ${n}` }}
                </span>
                <span class="time-display">{{ currentTime }}</span>
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
        </div>
      </div>
    </div>

    <!-- 统计信息弹窗 -->
    <el-dialog 
      v-model="showStatisticsDialog" 
      title="录像统计信息" 
      width="70%"
      class="statistics-dialog"
    >
      <div class="statistics-content">
        <!-- 统计概览 -->
        <div class="statistics-overview">
          <el-row :gutter="24">
            <el-col :span="6">
              <div class="stat-card">
                <div class="stat-icon total">
                  <el-icon><VideoCamera /></el-icon>
                </div>
                <div class="stat-content">
                  <div class="stat-number">{{ statisticsData.total_recordings }}</div>
                  <div class="stat-label">录像总数</div>
                </div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="stat-card">
                <div class="stat-icon size">
                  <el-icon><FolderOpened /></el-icon>
                </div>
                <div class="stat-content">
                  <div class="stat-number">{{ statisticsData.total_size }}</div>
                  <div class="stat-label">总存储量</div>
                </div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="stat-card">
                <div class="stat-icon available">
                  <el-icon><Coin /></el-icon>
                </div>
                <div class="stat-content">
                  <div class="stat-number">{{ statisticsData.available_space }}</div>
                  <div class="stat-label">可用空间</div>
                </div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="stat-card">
                <div class="stat-icon average">
                  <el-icon><TrendCharts /></el-icon>
                </div>
                <div class="stat-content">
                  <div class="stat-number">{{ statisticsData.daily_average }}</div>
                  <div class="stat-label">日均增长</div>
                </div>
              </div>
            </el-col>
          </el-row>
        </div>

        <!-- 存储配置 -->
        <el-row :gutter="24" style="margin-top: 20px;">
          <el-col :span="12">
            <div class="config-card">
              <h4>存储配置</h4>
              <div class="config-item">
                <span class="config-label">保留天数：</span>
                <span class="config-value">{{ statisticsData.retention_days }} 天</span>
              </div>
              <div class="config-item">
                <span class="config-label">自动清理：</span>
                <el-tag :type="statisticsData.auto_cleanup ? 'success' : 'warning'" size="small">
                  {{ statisticsData.auto_cleanup ? '已启用' : '已禁用' }}
                </el-tag>
              </div>
              <div class="config-item">
                <span class="config-label">存储路径：</span>
                <span class="config-value">/data/recordings/</span>
              </div>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="config-card">
              <h4>存储使用率</h4>
              <el-progress
                :percentage="storageUsagePercentage"
                :color="getStorageColor()"
                :stroke-width="20"
              />
              <div class="usage-text">
                <span>已使用：{{ statisticsData.total_size }}</span>
                <span>可用：{{ statisticsData.available_space }}</span>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>
    </el-dialog>

    <!-- 上传录像弹窗 -->
    <el-dialog 
      v-model="showUploadDialog" 
      title="上传录像" 
      width="50%"
      class="upload-dialog"
    >
      <el-form :model="uploadForm" label-width="100px">
        <el-form-item label="视频标题">
          <el-input 
            v-model="uploadForm.title" 
            placeholder="请输入视频标题"
          />
        </el-form-item>
        <el-form-item label="视频描述">
          <el-input 
            v-model="uploadForm.description" 
            placeholder="请输入视频描述（可选）"
            type="textarea"
            rows="3"
          />
        </el-form-item>
        <el-form-item label="选择文件">
          <el-upload
            ref="uploadRef"
            :auto-upload="false"
            :on-change="handleFileChange"
            :show-file-list="false"
            accept="video/*"
          >
            <el-button type="primary">
              <el-icon><Folder /></el-icon>
              选择视频
            </el-button>
          </el-upload>
          <span v-if="uploadForm.file" class="file-info">
            {{ uploadForm.file.name }} ({{ formatFileSize(uploadForm.file.size) }})
          </span>
        </el-form-item>
        <el-form-item v-if="uploading">
          <el-progress 
            :percentage="uploadProgress" 
            :stroke-width="8"
            :color="progressColor"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showUploadDialog = false">取消</el-button>
        <el-button 
          type="success" 
          @click="uploadVideo" 
          :loading="uploading"
          :disabled="!uploadForm.title || !uploadForm.file"
        >
          {{ uploading ? `上传中 ${uploadProgress}%` : '开始上传' }}
        </el-button>
      </template>
    </el-dialog>

    <!-- 视频播放弹窗 -->
    <el-dialog 
      v-model="showPlayDialog" 
      :title="currentVideo?.title || '视频播放'" 
      width="80%"
      class="play-dialog"
      @close="stopPlayback"
    >
      <div class="play-dialog-content">
        <div class="video-wrapper">
          <video 
            ref="videoPlayer"
            class="video-player"
            :src="currentVideoUrl"
            controls
            autoplay
            @loadedmetadata="onVideoLoaded"
            @timeupdate="onTimeUpdate"
            @ended="onVideoEnded"
          >
            您的浏览器不支持视频播放。
          </video>
        </div>
        <div v-if="currentVideo" class="video-info">
          <el-row :gutter="20">
            <el-col :span="6">
              <div class="info-item">
                <span class="label">格式:</span>
                <span class="value">{{ currentVideo.format?.toUpperCase() }}</span>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="info-item">
                <span class="label">大小:</span>
                <span class="value">{{ currentVideo.file_size_str }}</span>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="info-item">
                <span class="label">时长:</span>
                <span class="value">{{ currentVideo.duration_str }}</span>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="info-item">
                <span class="label">上传时间:</span>
                <span class="value">{{ currentVideo.upload_time }}</span>
              </div>
            </el-col>
          </el-row>
          <div v-if="currentVideo.description" class="description">
            <span class="label">描述:</span>
            <span class="value">{{ currentVideo.description }}</span>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, onMounted, onUnmounted, computed, watch } from 'vue'
import { ElMessage, ElMessageBox, ElTooltip } from 'element-plus'
import { gb28181API } from '@/api/system'
import {
  Upload as UploadIcon,
  Folder,
  VideoCamera,
  TrendCharts,
  FolderOpened,
  Coin,
  VideoPause,
  Search,
  Monitor,
  Calendar,
  VideoPlay
} from '@element-plus/icons-vue'
import { detectionApi } from '@/api/detection'
import { useRecordingStore } from '@/stores/recording'

export default {
  name: 'VideoPlayback',
  components: {
    Folder,
    VideoCamera,
    TrendCharts,
    FolderOpened,
    Coin,
    VideoPause,
    Search,
    Monitor,
    Calendar,
    VideoPlay,
    ElTooltip
  },
  setup() {
    // 使用录像store
    const recordingStore = useRecordingStore()
    
    // 上传表单
    const uploadForm = reactive({
      title: '',
      description: '',
      file: null
    })
    const uploading = ref(false)
    const uploadProgress = ref(0)
    const uploadRef = ref(null)

    // 分页
    const pagination = reactive({
      page: 1,
      pageSize: 10,
      total: 0
    })

    // 录像列表
    const recordList = ref([])
    const loading = ref(false)

    // 分屏布局
    const currentLayout = ref(4) // 默认4分屏
    const selectedCell = ref(1) // 当前选中的分屏
    const MAX_PLAYERS = 9 // 最大支持9个播放器
    
    // 每个分屏的播放器配置
    const playbackPlayers = ref(Array.from({ length: MAX_PLAYERS }, () => ({
      videoUrl: '',
      recordingInfo: null,
      isPlaying: false
    })))
    
    // video元素引用
    const videoRefs = {}
    
    // 设置video元素引用
    const setVideoRef = (el, index) => {
      if (el) {
        videoRefs[index] = el
      }
    }
    
    // 获取video元素
    const getVideoElement = (index) => {
      return videoRefs[index]
    }
    
    // 视频播放（保留兼容性）
    const videoPlayer = ref(null)
    const currentVideo = ref(null)
    const currentVideoUrl = ref('')
    const playingId = ref(null)
    
    // 弹窗状态
    const showStatisticsDialog = ref(false)
    const showPlayDialog = ref(false)
    const showUploadDialog = ref(false)
    const currentTime = ref('')

    // 设备树相关
    const searchText = ref('')
    const statusFilter = ref('all')
    const treeRef = ref(null)
    const rawDeviceTree = ref([])
    
    // 录像查询相关
    const selectedChannel = ref(null) // 当前选中的通道
    const recordingStartDate = ref('') // 录像开始日期
    const recordingEndDate = ref('') // 录像结束日期
    const loadingRecordings = ref(false) // 加载录像中
    
    // 树形结构配置
    const treeProps = {
      children: 'children',
      label: 'label'
    }

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

    // 获取在线通道数
    const getOnlineChannelCount = () => {
      let count = 0
      const countOnlineChannels = (nodes) => {
        nodes.forEach(node => {
          if (node.type === 'channel' && node.online) {
            count++
          }
          if (node.children) {
            countOnlineChannels(node.children)
          }
        })
      }
      countOnlineChannels(rawDeviceTree.value)
      return count
    }

    // 获取总通道数
    const getTotalChannelCount = () => {
      let count = 0
      const countChannels = (nodes) => {
        nodes.forEach(node => {
          if (node.type === 'channel') {
            count++
          }
          if (node.children) {
            countChannels(node.children)
          }
        })
      }
      countChannels(rawDeviceTree.value)
      return count
    }

    // 获取设备的在线通道数
    const getDeviceOnlineChannelCount = (deviceId) => {
      const device = rawDeviceTree.value.find(d => d.id === deviceId)
      if (!device || !device.children) return 0
      return device.children.filter(ch => ch.online).length
    }

    // 获取设备的总通道数
    const getDeviceTotalChannelCount = (deviceId) => {
      const device = rawDeviceTree.value.find(d => d.id === deviceId)
      if (!device || !device.children) return 0
      return device.children.length
    }

    // 树节点过滤
    const filterNode = (value, data) => {
      if (!value) return true
      return data.label.toLowerCase().includes(value.toLowerCase())
    }

    // 进度条颜色
    const progressColor = computed(() => {
      return [
        { color: '#f56c6c', percentage: 20 },
        { color: '#e6a23c', percentage: 40 },
        { color: '#5cb87a', percentage: 60 },
        { color: '#1989fa', percentage: 80 },
        { color: '#6f7ad3', percentage: 100 }
      ]
    })

    // 格式化文件大小
    const formatFileSize = (bytes) => {
      if (!bytes || bytes === 0) return '0 B'
      const k = 1024
      const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    // 文件选择处理
    const handleFileChange = (file) => {
      uploadForm.file = file.raw
    }

    // 上传视频
    const uploadVideo = async () => {
      if (!uploadForm.title) {
        ElMessage.warning('请输入视频标题')
        return
      }
      if (!uploadForm.file) {
        ElMessage.warning('请选择视频文件')
        return
      }

      // 检查文件大小（2GB限制）
      const maxSize = 2 * 1024 * 1024 * 1024
      if (uploadForm.file.size > maxSize) {
        ElMessage.error('文件大小超过限制，最大支持2GB')
        return
      }

      uploading.value = true
      uploadProgress.value = 0

      try {
        // 使用XMLHttpRequest实现上传进度
        await new Promise((resolve, reject) => {
          const formData = new FormData()
          formData.append('title', uploadForm.title)
          if (uploadForm.description) {
            formData.append('description', uploadForm.description)
          }
          formData.append('file', uploadForm.file)

          const xhr = new XMLHttpRequest()

          // 上传进度
          xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
              uploadProgress.value = Math.round((e.loaded / e.total) * 100)
            }
          }

          // 上传完成
          xhr.onload = () => {
            if (xhr.status === 200) {
              const response = JSON.parse(xhr.responseText)
              // 后端返回格式: { code: 200, message: "success", data: { id, title, file_name, file_size, file_url, message } }
              if (response.code === 200) {
                resolve(response)
              } else {
                reject(new Error(response.message || '上传失败'))
              }
            } else {
              reject(new Error('上传失败'))
            }
          }

          xhr.onerror = () => reject(new Error('网络错误'))

          // 获取token
          const token = localStorage.getItem('token')
          xhr.open('POST', '/api/v1/recordings/upload')
          if (token) {
            xhr.setRequestHeader('Authorization', `Bearer ${token}`)
          }
          xhr.send(formData)
        })

        ElMessage({
          message: '上传成功',
          type: 'success',
          customClass: 'upload-success-message'
        })
        
        // 重置表单
        uploadForm.title = ''
        uploadForm.description = ''
        uploadForm.file = null
        uploadProgress.value = 0
        if (uploadRef.value) {
          uploadRef.value.clearFiles()
        }

        // 刷新列表
        await loadRecordingList()
      } catch (error) {
        console.error('上传失败:', error)
        ElMessage.error(error.message || '上传失败')
      } finally {
        uploading.value = false
      }
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
            
            // 创建设备节点
            const deviceNode = {
              id: `device-${deviceId}`,
              label: deviceName,
              type: 'device',
              online: false,
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
                let hasOnlineChannel = false
                
                // 添加通道节点
                channels.forEach((channel, index) => {
                  const channelId = channel.channelId || channel.channel_id || channel.deviceId || channel.device_id
                  const channelName = channel.name || channel.channel_name || `通道 ${index + 1}`
                  const channelOnline = channel.status?.toUpperCase() === 'ON'
                  
                  if (channelOnline) {
                    hasOnlineChannel = true
                  }
                  
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
                
                deviceNode.online = hasOnlineChannel
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

    // 加载录像列表
    const loadRecordingList = async () => {
      loading.value = true
      try {
        const params = {
          page: pagination.page,
          page_size: pagination.pageSize
        }

        console.log('=== 请求录像列表 ===', params)
        const response = await detectionApi.getRecordingList(params)
        console.log('=== 录像列表响应 ===', response)
        
        // 后端返回格式: { code: 200, message: "success", data: { total, list, page, page_size } }
        if (response && response.code === 200 && response.data) {
          const dataObj = response.data
          
          // 后端data字段包含 list 数组和 total 数量
          if (dataObj.list && Array.isArray(dataObj.list)) {
            recordList.value = dataObj.list
            pagination.total = dataObj.total || 0
          } else {
            console.warn('=== 响应数据格式异常，缺少list字段 ===', dataObj)
            recordList.value = []
            pagination.total = 0
          }
          
          console.log('=== 解析后的录像数据 ===', {
            count: recordList.value.length,
            total: pagination.total,
            data: recordList.value
          })
        } else {
          console.error('=== 录像列表响应格式异常 ===', response)
          ElMessage.error(response?.message || '获取录像列表失败')
          recordList.value = []
          pagination.total = 0
        }
      } catch (error) {
        console.error('=== 获取录像列表失败 ===', error)
        ElMessage.error('获取录像列表失败: ' + (error.message || '未知错误'))
        recordList.value = []
        pagination.total = 0
      } finally {
        loading.value = false
      }
    }

    // 设置分屏布局
    const setLayout = (layout) => {
      currentLayout.value = layout
      selectedCell.value = 1
    }

    // 选择分屏
    const selectCell = (n) => {
      selectedCell.value = n
    }

    // 处理节点点击
    const handleNodeClick = async (data) => {
      console.log('节点点击:', data)
      
      if (data.type === 'channel') {
        // 选中通道，显示时间选择器
        selectedChannel.value = data
        // 默认查询最近7天的录像
        const endDate = new Date()
        const startDate = new Date()
        startDate.setDate(startDate.getDate() - 7)
        recordingStartDate.value = startDate.toISOString().split('T')[0]
        recordingEndDate.value = endDate.toISOString().split('T')[0]
        // 自动加载录像
        await loadChannelRecordings()
      } else if (data.type === 'recording') {
        // 点击录像节点，播放录像
        await playRecording(data)
      } else if (data.type === 'device') {
        ElMessage.info(`选中设备: ${data.label}`)
      }
    }

    // 加载通道录像
    const loadChannelRecordings = async () => {
      if (!selectedChannel.value) {
        return
      }
      
      if (!recordingStartDate.value || !recordingEndDate.value) {
        ElMessage.warning('请选择时间范围')
        return
      }
      
      loadingRecordings.value = true
      try {
        const params = {
          wvp_channel_id: selectedChannel.value.channelId,
          start_time: recordingStartDate.value,
          end_time: recordingEndDate.value,
          page: 1,
          page_size: 100
        }
        
        console.log('查询通道录像:', params)
        const response = await detectionApi.getRecordingList(params)
        console.log('录像查询响应:', response)
        
        if (response && response.code === 200 && response.data) {
          const recordings = response.data.list || []
          
          // 找到当前通道节点并添加录像子节点
          const updateChannelRecordings = (nodes) => {
            for (const node of nodes) {
              if (node.id === selectedChannel.value.id) {
                // 清空旧的录像节点
                node.children = node.children?.filter(child => child.type !== 'recording') || []
                
                // 添加新的录像节点
                recordings.forEach((rec, index) => {
                  node.children.push({
                    id: `recording-${rec.id}`,
                    label: `录像 ${index + 1} - ${rec.created_at?.split(' ')[1] || ''}`,
                    type: 'recording',
                    recordingData: rec,
                    fileSize: rec.file_size,
                    duration: rec.duration,
                    playUrl: rec.play_url
                  })
                })
                
                // 更新录像数量
                node.recordingCount = recordings.length
                return true
              }
              
              if (node.children && node.children.length > 0) {
                if (updateChannelRecordings(node.children)) {
                  return true
                }
              }
            }
            return false
          }
          
          updateChannelRecordings(rawDeviceTree.value)
          
          if (recordings.length > 0) {
            ElMessage.success(`找到 ${recordings.length} 个录像`)
          } else {
            ElMessage.info('该时间段内没有录像')
          }
        }
      } catch (error) {
        console.error('加载录像失败:', error)
        ElMessage.error('加载录像失败: ' + (error.message || '未知错误'))
      } finally {
        loadingRecordings.value = false
      }
    }

    // 播放录像（从树节点）
    const playRecording = async (recordingNode) => {
      if (!selectedCell.value) {
        ElMessage.warning('请先选择一个分屏')
        return
      }
      
      const playerIndex = selectedCell.value
      const player = playbackPlayers.value[playerIndex - 1]
      const recording = recordingNode.recordingData
      
      if (!recording || !recording.play_url) {
        ElMessage.error('录像数据异常')
        return
      }
      
      console.log('播放录像:', recording)
      
      // 设置分屏播放器
      player.videoUrl = recording.play_url
      player.recordingInfo = {
        title: recordingNode.label,
        ...recording
      }
      player.isPlaying = true
      
      ElMessage.success(`录像已开始播放到分屏 ${playerIndex}`)
      
      // 等待视频元素更新
      setTimeout(() => {
        const videoElement = getVideoElement(playerIndex)
        if (videoElement) {
          videoElement.load()
          videoElement.play().catch(err => {
            console.error('播放失败:', err)
            ElMessage.warning('自动播放失败，请手动点击播放')
          })
        }
      }, 100)
    }

    // 播放录像（支持多分屏）
    const playRecord = async (record) => {
      try {
        // 检查是否有选中的分屏
        if (!selectedCell.value) {
          ElMessage.warning('请先选择一个分屏')
          return
        }
        
        const playerIndex = selectedCell.value
        const player = playbackPlayers.value[playerIndex - 1]
        
        playingId.value = record.id
        
        console.log('=== 开始播放录像 ===', record)
        
        // 获取播放地址
        const response = await detectionApi.getRecordingPlayUrl(record.id)
        
        console.log('=== 播放地址响应 ===', response)
        
        // 后端返回格式: { code: 200, message: "success", data: { id, title, file_url, format, ... } }
        if (response && response.code === 200 && response.data) {
          const dataObj = response.data
          
          // 后端直接在data中返回file_url
          const playUrl = dataObj.file_url
          
          console.log('=== 解析播放URL ===', playUrl)
          
          if (playUrl) {
            // 设置分屏播放器
            player.videoUrl = playUrl
            player.recordingInfo = record
            player.isPlaying = true
            
            // 兼容旧的单播放器模式
            currentVideo.value = record
            currentVideoUrl.value = playUrl
            
            ElMessage.success(`录像 ${record.title} 已开始播放到分屏 ${playerIndex}`)
            
            // 等待视频元素更新
            setTimeout(() => {
              const videoElement = getVideoElement(playerIndex)
              if (videoElement) {
                videoElement.load()
                videoElement.play().catch(err => {
                  console.error('播放失败:', err)
                  ElMessage.warning('自动播放失败，请手动点击播放')
                })
              }
            }, 100)
          } else {
            console.error('=== 未找到播放URL ===', { response, record })
            ElMessage.error('未找到播放地址')
          }
        } else {
          console.error('=== 播放地址响应格式异常 ===', response)
          ElMessage.error(response?.message || '获取播放地址失败')
        }
      } catch (error) {
        console.error('=== 播放录像失败 ===', error)
        ElMessage.error('播放录像失败: ' + (error.message || '未知错误'))
      } finally {
        playingId.value = null
      }
    }
    
    // 停止播放（支持多分屏）
    const stopPlayback = (playerIndex) => {
      if (playerIndex) {
        // 停止指定分屏
        const player = playbackPlayers.value[playerIndex - 1]
        const videoElement = getVideoElement(playerIndex)
        
        if (videoElement) {
          videoElement.pause()
          videoElement.currentTime = 0
        }
        
        player.videoUrl = ''
        player.recordingInfo = null
        player.isPlaying = false
        
        ElMessage.success(`分屏 ${playerIndex} 已停止播放`)
      } else {
        // 兼容旧的单播放器模式
        if (videoPlayer.value) {
          videoPlayer.value.pause()
          videoPlayer.value.currentTime = 0
        }
        currentVideo.value = null
        currentVideoUrl.value = ''
      }
    }

    // 下载录像（预留功能）
    // eslint-disable-next-line no-unused-vars
    const downloadRecord = (record) => {
      ElMessage.info('下载功能开发中，敬请期待')
      // TODO: 实现下载功能
      // window.open(record.file_url, '_blank')
    }

    // 删除录像
    const deleteRecord = async (record) => {
      try {
        await ElMessageBox.confirm(
          `确定要删除录像"${record.title}"吗？此操作不可恢复。`,
          '确认删除',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )

        loading.value = true
        const response = await detectionApi.deleteRecording(record.id)
        
        // 后端返回格式: { code: 200, message: "视频删除成功", data: null }
        if (response && response.code === 200) {
          ElMessage.success(response.message || '录像删除成功')
          
          // 如果删除的是当前播放的视频，清空播放器
          if (currentVideo.value && currentVideo.value.id === record.id) {
            currentVideo.value = null
            currentVideoUrl.value = ''
          }
          
          // 刷新列表
          await loadRecordingList()
        } else {
          ElMessage.error(response?.message || '删除失败')
        }
      } catch (error) {
        if (error !== 'cancel') {
          console.error('删除录像失败:', error)
          ElMessage.error('删除录像失败')
        }
      } finally {
        loading.value = false
      }
    }

    // 分页处理
    const handlePageChange = (page) => {
      pagination.page = page
      loadRecordingList()
    }

    const handleSizeChange = (size) => {
      pagination.pageSize = size
      pagination.page = 1
      loadRecordingList()
    }

    // 更新时间显示
    const updateTime = () => {
      const now = new Date()
      currentTime.value = now.toLocaleTimeString('zh-CN', { hour12: false })
    }

    let timeInterval = null

    // 视频事件处理（支持多分屏）
    const onVideoLoaded = (playerIndex) => {
      console.log(`分屏 ${playerIndex} 视频加载完成`)
    }

    // eslint-disable-next-line no-unused-vars
    const onTimeUpdate = (playerIndex) => {
      // 可以在这里更新播放进度
    }

    const onVideoEnded = (playerIndex) => {
      const player = playbackPlayers.value[playerIndex - 1]
      if (player.recordingInfo) {
        ElMessage.success(`分屏 ${playerIndex} 播放完成`)
      }
    }

    // 统计数据
    const statisticsData = computed(() => {
      const stats = recordingStore.statistics || {}
      return {
        total_recordings: stats.total_recordings || 0,
        total_size: stats.total_size || '0 GB',
        available_space: stats.available_space || '0 GB',
        retention_days: stats.retention_days || 180,
        auto_cleanup: stats.auto_cleanup !== undefined ? stats.auto_cleanup : true,
        daily_average: stats.daily_average || '0 MB'
      }
    })

    // 总页数
    const totalPages = computed(() => {
      return Math.ceil(pagination.total / pagination.pageSize) || 1
    })

    // 可见页码
    const visiblePages = computed(() => {
      const maxVisiblePages = 5
      const totalPagesValue = totalPages.value
      const currentPage = pagination.page
      
      let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
      let endPage = Math.min(totalPagesValue, startPage + maxVisiblePages - 1)
      
      if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1)
      }
      
      const pages = []
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i)
      }
      return pages
    })

    // 计算存储使用率
    const storageUsagePercentage = computed(() => {
      let totalSizeGB = 0
      if (statisticsData.value.total_size !== null && statisticsData.value.total_size !== undefined) {
        if (typeof statisticsData.value.total_size === 'string') {
          totalSizeGB = parseFloat(statisticsData.value.total_size.replace(' GB', '') || '0')
        } else if (typeof statisticsData.value.total_size === 'number') {
          totalSizeGB = statisticsData.value.total_size
        }
      }
      
      let availableSpaceGB = 0
      if (statisticsData.value.available_space !== null && statisticsData.value.available_space !== undefined) {
        if (typeof statisticsData.value.available_space === 'string') {
          availableSpaceGB = parseFloat(statisticsData.value.available_space.replace(' GB', '') || '0')
        } else if (typeof statisticsData.value.available_space === 'number') {
          availableSpaceGB = statisticsData.value.available_space
        }
      }
      
      const totalCapacity = totalSizeGB + availableSpaceGB
      return totalCapacity > 0 ? Math.round((totalSizeGB / totalCapacity) * 100) : 0
    })

    // 获取存储使用率颜色
    const getStorageColor = () => {
      const percentage = storageUsagePercentage.value
      if (percentage < 70) return '#67C23A'
      if (percentage < 90) return '#E6A23C'
      return '#F56C6C'
    }

    // 监听搜索文本变化
    watch(searchText, (val) => {
      if (treeRef.value) {
        treeRef.value.filter(val)
      }
    })

    // 组件挂载时加载数据
    onMounted(() => {
      loadDevices()
      // 尝试获取统计信息，如果失败则忽略（后端接口可能未实现）
      recordingStore.fetchStatistics().catch(err => {
        console.warn('获取录像统计信息失败，使用默认值:', err)
      })
      updateTime()
      timeInterval = setInterval(updateTime, 1000)
    })

    onUnmounted(() => {
      if (timeInterval) {
        clearInterval(timeInterval)
      }
    })

    return {
      // 图标相关
      TrendCharts,
      UploadIcon,
      
      // 上传相关
      uploadForm,
      uploading,
      uploadProgress,
      uploadRef,
      progressColor,
      handleFileChange,
      uploadVideo,
      formatFileSize,
      
      // 列表相关
      recordList,
      loading,
      pagination,
      handlePageChange,
      handleSizeChange,
      currentTime,
      
      // 设备树相关
      searchText,
      statusFilter,
      treeRef,
      deviceTree,
      treeProps,
      filterNode,
      handleNodeClick,
      getOnlineChannelCount,
      getTotalChannelCount,
      getDeviceOnlineChannelCount,
      getDeviceTotalChannelCount,
      
      // 录像查询相关
      selectedChannel,
      recordingStartDate,
      recordingEndDate,
      loadingRecordings,
      loadChannelRecordings,
      playRecording,
      
      // 分屏布局相关
      currentLayout,
      selectedCell,
      playbackPlayers,
      setLayout,
      selectCell,
      setVideoRef,
      getVideoElement,
      
      // 播放相关
      videoPlayer,
      currentVideo,
      currentVideoUrl,
      playingId,
      playRecord,
      downloadRecord,
      deleteRecord,
      stopPlayback,
      onVideoLoaded,
      onTimeUpdate,
      onVideoEnded,
      
      // 弹窗相关
      showStatisticsDialog,
      showPlayDialog,
      showUploadDialog,
      statisticsData,
      storageUsagePercentage,
      getStorageColor,
      
      // 分页相关
      totalPages,
      visiblePages
    }
  }
}
</script>

<style scoped>
/* ==================== 完全复制实时画面样式 ==================== */

/* 页面容器 */
.video-playback {
  display: flex;
  height: 100%;
  width: 100%;
  background: linear-gradient(135deg, #0a1628 0%, #0d1b2e 50%, #0a1628 100%);
  overflow: hidden;
}

/* ==================== 左侧设备树 ==================== */
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

.total-indicator {
  margin-left: auto;
  padding: 2px 8px;
  background: linear-gradient(135deg, rgba(24, 144, 255, 0.3) 0%, rgba(24, 144, 255, 0.15) 100%);
  border: 1px solid rgba(64, 158, 255, 0.4);
  border-radius: 4px;
  font-size: 12px;
  color: #91caff;
  font-weight: 600;
  white-space: nowrap;
}

/* 搜索输入框 */
.search-input {
  margin: 10px 12px 8px;
}

.search-input :deep(.el-input__wrapper) {
  background: rgba(15, 30, 50, 0.6);
  border: 1px solid rgba(64, 158, 255, 0.3);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(5px);
}

.search-input :deep(.el-input__inner) {
  color: #e8f4ff;
}

.search-input :deep(.el-input__inner::placeholder) {
  color: rgba(145, 202, 255, 0.5);
}

.search-input :deep(.el-input__wrapper:hover) {
  border-color: #1890ff;
  box-shadow: 0 0 8px rgba(24, 144, 255, 0.3);
}

.search-input :deep(.el-input__wrapper.is-focus) {
  border-color: #1890ff;
  box-shadow: 0 0 12px rgba(24, 144, 255, 0.4);
}

/* 状态过滤器 */
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

.status-filters :deep(.el-button--small) {
  height: 26px;
  padding: 4px 10px;
  font-size: 12px;
  background: rgba(24, 144, 255, 0.1);
  border-color: rgba(64, 158, 255, 0.3);
  color: #91caff;
}

.status-filters :deep(.el-button--small:hover) {
  background: rgba(24, 144, 255, 0.2);
  border-color: #1890ff;
  color: #e8f4ff;
}

.status-filters :deep(.el-button--small.el-button--primary) {
  background: linear-gradient(135deg, #1890ff 0%, #0066cc 100%);
  border-color: #1890ff;
  color: #fff;
}

/* 时间选择器 */
.time-selector {
  padding: 8px 10px;
  background: rgba(24, 144, 255, 0.08);
  border-radius: 6px;
  margin: 8px 12px;
  border: 1px solid rgba(24, 144, 255, 0.2);
}

.selector-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-bottom: 8px;
  color: #91caff;
  font-size: 12px;
  font-weight: 500;
}

.selector-header .el-icon {
  font-size: 16px;
}

/* 日期输入容器 */
.date-inputs {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 8px;
}

.date-separator {
  color: #91caff;
  font-size: 12px;
  text-align: center;
  padding: 2px 0;
}

/* 单个日期选择器 */
.date-picker-single {
  width: 100%;
}

.date-picker-single :deep(.el-input__wrapper) {
  background: rgba(10, 20, 35, 0.6);
  border-color: rgba(24, 144, 255, 0.3);
  box-shadow: none;
}

.date-picker-single :deep(.el-input__inner) {
  color: #e8f4ff;
  font-size: 12px;
}

.date-picker-single :deep(.el-input__inner::placeholder) {
  color: rgba(145, 202, 255, 0.5);
  font-size: 12px;
}

.date-picker-single :deep(.el-input__wrapper:hover) {
  border-color: #1890ff;
}

.date-picker-single :deep(.el-input__wrapper.is-focus) {
  border-color: #1890ff;
  box-shadow: 0 0 8px rgba(24, 144, 255, 0.3);
}

.query-btn {
  width: 100%;
  background: linear-gradient(135deg, #1890ff 0%, #0066cc 100%);
  border-color: #1890ff;
}

.query-btn:hover {
  background: linear-gradient(135deg, #40a9ff 0%, #1890ff 100%);
}

/* 录像节点样式 */
.recording-node {
  opacity: 0.9;
}

.recording-node:hover {
  opacity: 1;
  background: rgba(24, 144, 255, 0.15);
}

.recording-count {
  margin-left: 8px;
  font-size: 11px;
  color: #52c41a;
  background: rgba(82, 196, 26, 0.1);
  padding: 2px 6px;
  border-radius: 10px;
}

.recording-info {
  margin-left: 8px;
  font-size: 11px;
  color: #91caff;
  opacity: 0.8;
}

/* 树形加载容器 */
.tree-loading-wrapper {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  position: relative;
}

/* 设备树样式 */
.device-tree {
  flex: 1;
  overflow-y: auto;
  background: transparent;
  color: #e8f4ff;
  padding: 4px 0;
}

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

.device-tree :deep(.el-tree-node__content) {
  background: transparent;
  color: #e8f4ff;
  height: 32px;
  transition: all 0.2s;
}

.device-tree :deep(.el-tree-node__content:hover) {
  background: rgba(24, 144, 255, 0.15);
}

.device-tree :deep(.el-tree-node:focus > .el-tree-node__content) {
  background: rgba(24, 144, 255, 0.2);
}

.device-tree :deep(.el-tree-node__expand-icon) {
  color: #91caff;
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

.device-indicator {
  margin-left: 6px;
  padding: 2px 6px;
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.2) 0%, rgba(76, 175, 80, 0.1) 100%);
  border: 1px solid rgba(76, 175, 80, 0.3);
  border-radius: 3px;
  font-size: 11px;
  color: #81c784;
  font-weight: 600;
  white-space: nowrap;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
}

/* ==================== 右侧主内容区 ==================== */
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
  contain: layout style;
  will-change: auto;
}

.grid-1 {
  grid-template-columns: 1fr;
  grid-template-rows: 1fr;
}

.grid-4 {
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(2, 1fr);
}

.grid-9 {
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(3, 1fr);
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
  contain: layout style paint;
  content-visibility: auto;
  transform: translateZ(0);
  will-change: auto;
}

.video-cell:hover {
  border-color: rgba(64, 158, 255, 0.5);
  box-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.4),
    0 0 20px rgba(64, 158, 255, 0.2),
    inset 0 0 30px rgba(64, 158, 255, 0.1);
}

.video-cell.active {
  border-color: #1890ff;
  box-shadow: 
    0 4px 16px rgba(24, 144, 255, 0.4),
    0 0 30px rgba(24, 144, 255, 0.3),
    inset 0 0 40px rgba(24, 144, 255, 0.15);
  background: linear-gradient(135deg, rgba(15, 25, 40, 0.9) 0%, rgba(20, 30, 45, 1) 100%);
}

.video-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.stop-btn-wrapper {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 10;
}

.stop-stream-btn {
  background: linear-gradient(135deg, rgba(244, 67, 54, 0.9) 0%, rgba(229, 57, 53, 0.95) 100%);
  border: 1px solid rgba(244, 67, 54, 0.6);
  color: #fff;
  border-radius: 4px;
  padding: 6px 12px;
  font-size: 12px;
  backdrop-filter: blur(5px);
  box-shadow: 0 2px 8px rgba(244, 67, 54, 0.3);
}

.stop-stream-btn:hover {
  background: linear-gradient(135deg, rgba(244, 67, 54, 1) 0%, rgba(229, 57, 53, 1) 100%);
  box-shadow: 0 0 15px rgba(244, 67, 54, 0.5);
  transform: translateY(-1px);
}

.video-player-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.video-player {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.stream-input-panel {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-screen-hint {
  text-align: center;
  color: rgba(255, 255, 255, 0.5);
}

.video-info-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 6px 10px;
  background: linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.7) 100%);
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #e8f4ff;
  backdrop-filter: blur(5px);
  z-index: 5;
}

.channel-name {
  font-weight: 500;
  color: #91caff;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}

.time-display {
  color: rgba(255, 255, 255, 0.7);
  font-size: 11px;
  margin-left: 8px;
}

/* ==================== 底部控制栏 ==================== */
.control-bar {
  height: 60px;
  background: linear-gradient(180deg, rgba(10, 20, 35, 0.95) 0%, rgba(15, 25, 40, 0.98) 100%);
  border-top: 1px solid rgba(64, 158, 255, 0.2);
  display: flex;
  align-items: center;
  padding: 0 20px;
  gap: 20px;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
}

.control-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.layout-controls {
  display: flex;
  gap: 8px;
}

.layout-btn {
  width: 40px;
  height: 40px;
  padding: 0;
  background: rgba(24, 144, 255, 0.1) !important;
  border: 1px solid rgba(64, 158, 255, 0.3) !important;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.layout-btn:hover {
  background: rgba(24, 144, 255, 0.2) !important;
  border-color: #1890ff !important;
  box-shadow: 0 0 12px rgba(24, 144, 255, 0.3);
  transform: translateY(-2px);
}

.layout-btn.el-button--primary {
  background: linear-gradient(135deg, #1890ff 0%, #0066cc 100%) !important;
  border-color: #1890ff !important;
  box-shadow: 0 0 15px rgba(24, 144, 255, 0.4);
}

.grid-icon {
  width: 20px;
  height: 20px;
  color: #91caff;
}

.layout-btn.el-button--primary .grid-icon {
  color: #fff;
}

/* ==================== Element Plus 组件样式覆盖 ==================== */

/* 按钮样式 */
:deep(.el-button) {
  border-radius: 6px !important;
  font-weight: 500 !important;
  transition: all 0.3s ease !important;
}

:deep(.el-button.is-plain) {
  background: rgba(20, 30, 50, 0.6) !important;
  border: 1px solid rgba(0, 255, 255, 0.3) !important;
  color: rgba(0, 255, 255, 0.8) !important;
}

:deep(.el-button.is-plain:hover) {
  background: rgba(25, 35, 55, 0.8) !important;
  border-color: rgba(0, 255, 255, 0.6) !important;
  color: #00ffff !important;
}

:deep(.el-button--primary) {
  background: rgba(0, 150, 200, 0.8) !important;
  border: 1px solid rgba(0, 255, 255, 0.4) !important;
  color: #ffffff !important;
}

:deep(.el-button--primary:hover) {
  background: rgba(0, 180, 220, 0.9) !important;
  border-color: #00ffff !important;
  box-shadow: 0 0 15px rgba(0, 255, 255, 0.3) !important;
}

:deep(.el-button--success) {
  background: rgba(100, 180, 100, 0.8) !important;
  border: 1px solid rgba(100, 255, 100, 0.4) !important;
  color: #ffffff !important;
}

:deep(.el-button--success:hover) {
  background: rgba(120, 200, 120, 0.9) !important;
  border-color: rgba(100, 255, 100, 0.8) !important;
  box-shadow: 0 0 15px rgba(100, 255, 100, 0.3) !important;
}

/* Element Plus 组件深色主题样式 */
:deep(.el-form-item__label) {
  color: rgba(255, 255, 255, 0.8) !important;
}

/* 通用输入框深色主题 */
:deep(.el-input__wrapper) {
  background: rgba(20, 30, 50, 0.85) !important;
  border: 1px solid rgba(0, 255, 255, 0.3) !important;
  border-radius: 6px !important;
  box-shadow: 
    inset 0 0 10px rgba(0, 255, 255, 0.05),
    0 2px 4px rgba(0, 0, 0, 0.2) !important;
  backdrop-filter: blur(5px) !important;
}

:deep(.el-input__wrapper:hover) {
  background: rgba(25, 35, 55, 0.9) !important;
  border-color: rgba(0, 255, 255, 0.5) !important;
}

:deep(.el-input__wrapper.is-focus) {
  background: rgba(25, 35, 55, 0.95) !important;
  border-color: #00ffff !important;
  box-shadow: 
    inset 0 0 20px rgba(0, 255, 255, 0.1),
    0 0 0 2px rgba(0, 255, 255, 0.3) !important;
}

:deep(.el-input__inner) {
  background: transparent !important;
  color: rgba(255, 255, 255, 0.9) !important;
}

:deep(.el-input__inner::placeholder) {
  color: rgba(255, 255, 255, 0.4) !important;
}

/* 选择框样式 */
:deep(.el-select) {
  width: 100%;
}

:deep(.el-select__wrapper) {
  background: rgba(20, 30, 50, 0.85) !important;
  border: 1px solid rgba(0, 255, 255, 0.3) !important;
  box-shadow: 
    inset 0 0 10px rgba(0, 255, 255, 0.05),
    0 2px 4px rgba(0, 0, 0, 0.2) !important;
}

:deep(.el-select__wrapper:hover) {
  background: rgba(25, 35, 55, 0.9) !important;
  border-color: rgba(0, 255, 255, 0.5) !important;
}

:deep(.el-select__wrapper.is-focused) {
  border-color: #00ffff !important;
  box-shadow: 0 0 0 2px rgba(0, 255, 255, 0.3) !important;
}

/* 进度条样式 */
:deep(.el-progress) {
  background: rgba(20, 30, 50, 0.6) !important;
  border-radius: 6px !important;
  padding: 8px !important;
}

:deep(.el-progress__text) {
  color: rgba(255, 255, 255, 0.9) !important;
}

:deep(.el-progress__bar) {
  background: linear-gradient(90deg, 
    rgba(0, 255, 255, 0.8) 0%, 
    rgba(0, 200, 255, 0.8) 100%) !important;
  box-shadow: 0 0 10px rgba(0, 255, 255, 0.4) !important;
}

/* 行列样式 */
:deep(.el-row) {
  background: transparent !important;
}

:deep(.el-col) {
  background: transparent !important;
}

/* Tag 样式 */
:deep(.el-tag) {
  background: rgba(20, 30, 50, 0.6) !important;
  border-color: rgba(0, 255, 255, 0.3) !important;
  color: rgba(255, 255, 255, 0.9) !important;
  border-radius: 6px !important;
}

:deep(.el-tag.el-tag--info) {
  background: rgba(0, 100, 150, 0.3) !important;
  border-color: rgba(0, 255, 255, 0.5) !important;
  color: rgba(0, 255, 255, 0.9) !important;
}

:deep(.el-tag.el-tag--success) {
  background: rgba(0, 150, 136, 0.3) !important;
  border-color: rgba(0, 255, 200, 0.5) !important;
  color: rgba(0, 255, 200, 0.9) !important;
}

:deep(.el-tag.el-tag--warning) {
  background: rgba(255, 152, 0, 0.3) !important;
  border-color: rgba(255, 152, 0, 0.5) !important;
  color: rgba(255, 152, 0, 0.9) !important;
}

:deep(.el-tag.el-tag--danger) {
  background: rgba(244, 67, 54, 0.3) !important;
  border-color: rgba(244, 67, 54, 0.5) !important;
  color: rgba(244, 67, 54, 0.9) !important;
}

/* Upload 组件样式 */
:deep(.el-upload) {
  display: inline-block;
}

/* Loading 样式 */
:deep(.el-loading-mask) {
  background-color: rgba(0, 0, 0, 0.7) !important;
}

:deep(.el-loading-spinner .path) {
  stroke: #00ffff !important;
}

:deep(.el-loading-spinner .el-loading-text) {
  color: #00ffff !important;
}

/* 上传成功消息样式 - 绿色背景 */
:deep(.upload-success-message) {
  background-color: #67c23a !important;
  border-color: #67c23a !important;
}

:deep(.upload-success-message .el-message__content) {
  color: #ffffff !important;
  font-weight: 500;
}

/* 全局 success 消息样式 */
:deep(.el-message--success) {
  background-color: #67c23a !important;
  border-color: #67c23a !important;
}

:deep(.el-message--success .el-message__content) {
  color: #ffffff !important;
}

:deep(.el-message--success .el-message__icon) {
  color: #ffffff !important;
}

/* 顶部工具栏 */
.toolbar-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 10px;
  margin-bottom: 10px;
}

.page-title {
  color: rgba(0, 255, 255, 0.9);
  font-size: 24px;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 12px;
  text-shadow: 0 0 10px rgba(0, 255, 255, 0.3);
}

.toolbar-right {
  display: flex;
  gap: 12px;
}

/* 统计信息弹窗 */
.statistics-dialog :deep(.el-dialog__body) {
  padding: 20px;
}

.statistics-content {
  color: rgba(255, 255, 255, 0.9);
}

.statistics-overview {
  margin-bottom: 24px;
}

.stat-card {
  display: flex;
  align-items: center;
  padding: 20px;
  background: rgba(20, 30, 50, 0.6);
  border-radius: 8px;
  border-left: 4px solid rgba(0, 255, 255, 0.8);
  transition: all 0.3s;
  backdrop-filter: blur(5px);
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 
    0 8px 20px rgba(0, 0, 0, 0.3),
    0 0 15px rgba(0, 255, 255, 0.2);
  background: rgba(25, 35, 55, 0.7);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  font-size: 24px;
  color: white;
}

.stat-icon.total { background: linear-gradient(135deg, rgba(0, 150, 255, 0.8), rgba(0, 200, 255, 0.9)); }
.stat-icon.size { background: linear-gradient(135deg, rgba(103, 194, 58, 0.8), rgba(120, 210, 75, 0.9)); }
.stat-icon.available { background: linear-gradient(135deg, rgba(230, 162, 60, 0.8), rgba(245, 180, 80, 0.9)); }
.stat-icon.average { background: linear-gradient(135deg, rgba(245, 108, 108, 0.8), rgba(255, 130, 130, 0.9)); }

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 24px;
  font-weight: bold;
  color: rgba(255, 255, 255, 0.95);
  margin-bottom: 4px;
  text-shadow: 0 0 10px rgba(0, 255, 255, 0.3);
}

.stat-label {
  font-size: 14px;
  color: rgba(0, 255, 255, 0.8);
}

.config-card {
  background: rgba(20, 30, 50, 0.6);
  padding: 16px;
  border-radius: 8px;
  border: 1px solid rgba(0, 255, 255, 0.2);
}

.config-card h4 {
  color: rgba(0, 255, 255, 0.9);
  margin: 0 0 12px 0;
  font-size: 14px;
}

.config-item {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  padding: 8px 0;
  border-bottom: 1px solid rgba(0, 255, 255, 0.2);
}

.config-item:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.config-label {
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
  min-width: 100px;
}

.config-value {
  color: rgba(255, 255, 255, 0.95);
}

.usage-text {
  display: flex;
  justify-content: space-between;
  margin-top: 12px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
}

/* 视频播放弹窗 */
.play-dialog :deep(.el-dialog__body) {
  padding: 20px;
}

.play-dialog-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.play-dialog-content .video-wrapper {
  width: 100%;
  aspect-ratio: 16 / 9;
  background: #000;
  border-radius: 8px;
  overflow: hidden;
}

.play-dialog-content .video-player {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.video-info {
  padding: 16px;
  background: rgba(20, 30, 50, 0.6);
  border-radius: 8px;
  border: 1px solid rgba(0, 255, 255, 0.2);
}

.info-item {
  display: flex;
  gap: 8px;
  font-size: 14px;
  margin-bottom: 8px;
}

.info-item .label {
  color: rgba(0, 255, 255, 0.8);
  font-weight: 500;
  min-width: 80px;
}

.info-item .value {
  color: rgba(255, 255, 255, 0.9);
}

.description {
  display: flex;
  gap: 8px;
  font-size: 14px;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid rgba(0, 255, 255, 0.2);
}

.description .label {
  color: rgba(0, 255, 255, 0.8);
  font-weight: 500;
  min-width: 80px;
}

.description .value {
  color: rgba(255, 255, 255, 0.9);
  flex: 1;
  word-break: break-word;
}

/* 弹窗深色主题 */
.statistics-dialog :deep(.el-dialog),
.play-dialog :deep(.el-dialog),
.upload-dialog :deep(.el-dialog) {
  background: rgba(15, 25, 45, 0.95) !important;
  border: 1px solid rgba(0, 255, 255, 0.2) !important;
  border-radius: 8px !important;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4) !important;
}

.statistics-dialog :deep(.el-dialog__header),
.play-dialog :deep(.el-dialog__header),
.upload-dialog :deep(.el-dialog__header) {
  background: rgba(20, 30, 50, 0.8) !important;
  border-bottom: 1px solid rgba(0, 255, 255, 0.2) !important;
}

.statistics-dialog :deep(.el-dialog__title),
.play-dialog :deep(.el-dialog__title),
.upload-dialog :deep(.el-dialog__title) {
  color: rgba(0, 255, 255, 0.9) !important;
  font-weight: 600 !important;
}

.statistics-dialog :deep(.el-dialog__body) {
  background: rgba(15, 25, 45, 0.95) !important;
  color: rgba(255, 255, 255, 0.9) !important;
  padding: 20px !important;
}

.play-dialog :deep(.el-dialog__body) {
  background: rgba(15, 25, 45, 0.95) !important;
  color: rgba(255, 255, 255, 0.9) !important;
  padding: 20px !important;
}

.upload-dialog :deep(.el-dialog__body) {
  background: rgba(15, 25, 45, 0.95) !important;
  color: rgba(255, 255, 255, 0.9) !important;
  padding: 20px !important;
}

.statistics-dialog :deep(.el-dialog__footer),
.play-dialog :deep(.el-dialog__footer),
.upload-dialog :deep(.el-dialog__footer) {
  background: rgba(20, 30, 50, 0.8) !important;
  border-top: 1px solid rgba(0, 255, 255, 0.2) !important;
}

/* 统计卡片样式 */
.stat-card {
  background: rgba(20, 30, 50, 0.8) !important;
  border: 1px solid rgba(0, 255, 255, 0.2) !important;
  border-radius: 8px !important;
  padding: 16px !important;
}

.stat-icon {
  background: rgba(0, 150, 200, 0.3) !important;
  border: 1px solid rgba(0, 255, 255, 0.3) !important;
  border-radius: 8px !important;
}

.stat-number {
  color: #00ffff !important;
  font-weight: 600 !important;
}

.stat-label {
  color: rgba(255, 255, 255, 0.7) !important;
}

/* 配置卡片样式 */
.config-card {
  background: rgba(20, 30, 50, 0.8) !important;
  border: 1px solid rgba(0, 255, 255, 0.2) !important;
  border-radius: 8px !important;
  padding: 16px !important;
}

.config-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid rgba(0, 255, 255, 0.1) !important;
}

.config-item:last-child {
  border-bottom: none !important;
}

.config-label {
  color: rgba(255, 255, 255, 0.7) !important;
}

.config-value {
  color: #00ffff !important;
  font-weight: 500 !important;
}

/* 上传弹窗表单样式 */
.upload-dialog :deep(.el-form-item__label) {
  color: rgba(255, 255, 255, 0.8) !important;
}

.upload-dialog :deep(.el-input__wrapper) {
  background: rgba(20, 30, 50, 0.85) !important;
  border: 1px solid rgba(0, 255, 255, 0.3) !important;
  border-radius: 6px !important;
  box-shadow: inset 0 0 10px rgba(0, 255, 255, 0.05) !important;
}

.upload-dialog :deep(.el-input__wrapper:hover) {
  background: rgba(25, 35, 55, 0.9) !important;
  border-color: rgba(0, 255, 255, 0.5) !important;
}

.upload-dialog :deep(.el-input__wrapper.is-focus) {
  background: rgba(25, 35, 55, 0.95) !important;
  border-color: #00ffff !important;
  box-shadow: inset 0 0 20px rgba(0, 255, 255, 0.1) !important;
}

.upload-dialog :deep(.el-input__inner) {
  background: transparent !important;
  color: rgba(255, 255, 255, 0.9) !important;
}

.upload-dialog :deep(.el-textarea__wrapper) {
  background: rgba(20, 30, 50, 0.85) !important;
  border: 1px solid rgba(0, 255, 255, 0.3) !important;
  border-radius: 6px !important;
}

.upload-dialog :deep(.el-textarea__inner) {
  background: transparent !important;
  color: rgba(255, 255, 255, 0.9) !important;
}

/* 弹窗关闭按钮 */
:deep(.el-dialog__close) {
  color: rgba(0, 255, 255, 0.8) !important;
}

:deep(.el-dialog__close:hover) {
  color: #00ffff !important;
}

/* 分页组件样式 */
.flex-center {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

:deep(.el-pagination) {
  color: #00ffff !important;
}

:deep(.el-pagination .el-pager li) {
  background: rgba(0, 255, 255, 0.1) !important;
  border: 1px solid rgba(0, 255, 255, 0.2) !important;
  color: #00ffff !important;
  border-radius: 4px !important;
  margin: 0 2px !important;
}

:deep(.el-pagination .el-pager li.is-active) {
  background: rgba(0, 255, 255, 0.3) !important;
  box-shadow: 0 0 10px rgba(0, 255, 255, 0.5) !important;
}

:deep(.el-pagination .btn-prev),
:deep(.el-pagination .btn-next) {
  background: rgba(0, 255, 255, 0.1) !important;
  border: 1px solid rgba(0, 255, 255, 0.2) !important;
  color: #00ffff !important;
  border-radius: 4px !important;
}

/* 增强型分页样式 */
.tech-pagination {
  margin-top: 20px;
  margin-bottom: 20px;
}

.pagination-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background: rgba(0, 255, 255, 0.03);
  border: 1px solid rgba(0, 255, 255, 0.2);
  border-radius: 8px;
  position: relative;
  z-index: 1;
}

.pagination-info {
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
}

.pagination-info .total-count {
  color: #00ffff;
  font-weight: bold;
  text-shadow: 0 0 5px rgba(0, 255, 255, 0.5);
}

.page-size-select {
  margin: 0 5px;
  width: 80px;
}

.page-size-select :deep(.el-select__wrapper) {
  background-color: rgba(65, 75, 95, 0.85) !important;
  border: 1px solid rgba(0, 255, 255, 0.3) !important;
  border-radius: 4px !important;
  height: 28px !important;
}

.page-size-select :deep(.el-select__input) {
  color: rgba(255, 255, 255, 0.95) !important;
  font-size: 12px !important;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pagination-btn {
  border: 1px solid rgba(0, 255, 255, 0.3) !important;
  background: rgba(0, 255, 255, 0.1) !important;
  color: #00ffff !important;
  border-radius: 4px !important;
  transition: all 0.3s ease !important;
  font-size: 12px !important;
  padding: 6px 12px !important;
}

.pagination-btn:hover:not(:disabled) {
  background: rgba(0, 255, 255, 0.2) !important;
  box-shadow: 0 0 10px rgba(0, 255, 255, 0.3) !important;
  transform: translateY(-1px) !important;
}

.pagination-btn:disabled {
  background: rgba(0, 255, 255, 0.05) !important;
  color: rgba(255, 255, 255, 0.3) !important;
  border-color: rgba(0, 255, 255, 0.1) !important;
  cursor: not-allowed !important;
  transform: none !important;
  box-shadow: none !important;
}

.pagination-pages {
  display: flex;
  align-items: center;
  gap: 4px;
  margin: 0 10px;
}

.page-btn {
  padding: 6px 10px;
  border: 1px solid rgba(0, 255, 255, 0.3);
  background: rgba(0, 255, 255, 0.1);
  color: #00ffff;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 12px;
  min-width: 32px;
  text-align: center;
}

.page-btn:hover:not(:disabled) {
  background: rgba(0, 255, 255, 0.2);
  box-shadow: 0 0 8px rgba(0, 255, 255, 0.3);
}

.page-btn.active {
  background: rgba(0, 255, 255, 0.3);
  color: white;
  border-color: #00ffff;
  box-shadow: 0 0 12px rgba(0, 255, 255, 0.5);
}

.page-btn:disabled {
  background: rgba(0, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.3);
  border-color: rgba(0, 255, 255, 0.1);
  cursor: not-allowed;
}

/* 响应式设计 */
@media (max-width: 1400px) {
  .content-area {
    grid-template-columns: 1fr 1fr !important;
  }
}

@media (max-width: 1024px) {
  .video-playback {
    padding: 15px;
  }
  
  .video-playback h2 {
    font-size: 20px;
    margin: 16px 0 15px 0;
  }
  
  .toolbar-section {
    flex-direction: column;
    gap: 10px;
  }
  
  .toolbar-right {
    width: 100%;
    justify-content: flex-end;
  }
  
  .content-area {
    grid-template-columns: 1fr !important;
  }
  
  .statistics-overview {
    grid-template-columns: repeat(2, 1fr) !important;
  }
}

@media (max-width: 768px) {
  .video-playback {
    padding: 10px;
  }
  
  .video-playback h2 {
    font-size: 18px;
    margin: 12px 0 10px 0;
  }
  
  .toolbar-right {
    flex-direction: column;
    width: 100%;
  }
  
  .toolbar-right .el-button {
    width: 100%;
  }
  
  .record-list {
    padding: 15px;
  }
  
  .section-title {
    font-size: 14px;
    margin-bottom: 10px;
  }
  
  .statistics-overview {
    grid-template-columns: 1fr !important;
  }
  
  :deep(.el-table) {
    font-size: 12px;
  }
  
  :deep(.el-pagination) {
    font-size: 12px;
  }
}
</style>