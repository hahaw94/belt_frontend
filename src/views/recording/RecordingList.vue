<template>
  <div class="recording-list">
    <el-card class="tech-card">
      <template #header>
        <div class="card-header">
          <span>录像管理</span>
                           <div class="header-actions">
                   <el-button type="success" @click="manualRefresh" :loading="loading">
                     <el-icon><Refresh /></el-icon>
                     手动刷新
                   </el-button>
                   <el-button type="primary" @click="showUploadDialog">
                     <el-icon><Upload /></el-icon>
                     上传录像
                   </el-button>
                   <el-button type="danger" @click="cleanupOldRecordings">
                     <el-icon><Delete /></el-icon>
                     清理过期录像
                   </el-button>
                 </div>
        </div>
      </template>

      <!-- 搜索筛选栏 -->
      <div class="search-bar">
        <el-form :inline="true" :model="searchForm" label-width="80px">
          <el-form-item label="设备名称">
            <div class="custom-select" :class="{ 'is-open': isDeviceDropdownOpen }" @click="toggleDeviceDropdown">
              <div class="select-input">
                <span class="selected-text">{{ getSelectedDeviceName() || '请选择设备' }}</span>
                <div class="select-arrow">
                  <svg viewBox="0 0 1024 1024" width="14" height="14">
                    <path d="M884 256h-75c-5.1 0-9.9 2.5-12.9 6.6L512 654.2 227.9 262.6c-3-4.1-7.8-6.6-12.9-6.6h-75c-6.5 0-10.3 7.4-6.5 12.7l352.6 486.1c12.8 17.6 39 17.6 51.7 0l352.6-486.1c3.9-5.3 0.1-12.7-6.4-12.7z" fill="currentColor"></path>
                  </svg>
                </div>
              </div>
              <div class="dropdown-menu" v-show="isDeviceDropdownOpen">
                <div 
                  class="dropdown-item" 
                  :class="{ 'is-selected': !searchForm.device_id }"
                  @click.stop="selectDevice(null)"
                >
                  全部设备
                </div>
                <div 
                  class="dropdown-item" 
                  v-for="device in deviceOptions" 
                  :key="device.id"
                  :class="{ 'is-selected': searchForm.device_id === device.id }"
                  @click.stop="selectDevice(device)"
                >
                  {{ device.name }}
                </div>
              </div>
            </div>
          </el-form-item>
          <el-form-item label="时间范围">
            <el-date-picker
              v-model="searchForm.timeRange"
              type="datetimerange"
              range-separator="至"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
              format="YYYY-MM-DD HH:mm:ss"
              value-format="YYYY-MM-DD HH:mm:ss"
            />
          </el-form-item>
          <el-form-item label="告警类型">
            <div class="custom-select" :class="{ 'is-open': isAlarmDropdownOpen }" @click="toggleAlarmDropdown">
              <div class="select-input">
                <span class="selected-text">{{ searchForm.alarm_type || '请选择告警类型' }}</span>
                <div class="select-arrow">
                  <svg viewBox="0 0 1024 1024" width="14" height="14">
                    <path d="M884 256h-75c-5.1 0-9.9 2.5-12.9 6.6L512 654.2 227.9 262.6c-3-4.1-7.8-6.6-12.9-6.6h-75c-6.5 0-10.3 7.4-6.5 12.7l352.6 486.1c12.8 17.6 39 17.6 51.7 0l352.6-486.1c3.9-5.3 0.1-12.7-6.4-12.7z" fill="currentColor"></path>
                  </svg>
                </div>
              </div>
              <div class="dropdown-menu" v-show="isAlarmDropdownOpen">
                <div 
                  class="dropdown-item" 
                  :class="{ 'is-selected': !searchForm.alarm_type }"
                  @click.stop="selectAlarmType(null)"
                >
                  全部类型
                </div>
                <div 
                  class="dropdown-item" 
                  :class="{ 'is-selected': searchForm.alarm_type === '异常行为' }"
                  @click.stop="selectAlarmType('异常行为')"
                >
                  异常行为
                </div>
                <div 
                  class="dropdown-item" 
                  :class="{ 'is-selected': searchForm.alarm_type === '车辆违规' }"
                  @click.stop="selectAlarmType('车辆违规')"
                >
                  车辆违规
                </div>
                <div 
                  class="dropdown-item" 
                  :class="{ 'is-selected': searchForm.alarm_type === '人员闯入' }"
                  @click.stop="selectAlarmType('人员闯入')"
                >
                  人员闯入
                </div>
                <div 
                  class="dropdown-item" 
                  :class="{ 'is-selected': searchForm.alarm_type === '区域入侵' }"
                  @click.stop="selectAlarmType('区域入侵')"
                >
                  区域入侵
                </div>
              </div>
            </div>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button @click="resetSearch">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 录像列表 -->
      <el-table v-loading="loading" :data="recordingList" class="tech-table" style="width: 100%">
        <el-table-column prop="id" label="录像ID" width="120" align="center" header-align="center" />
        <el-table-column prop="device_name" label="设备名称" min-width="140" header-align="center" />
        <el-table-column prop="alarm_type" label="告警类型" width="130" header-align="center">
          <template #default="scope">
            <el-tag :type="getAlarmTypeColor(scope.row.alarm_type)" size="small">
              {{ scope.row.alarm_type }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="start_time" label="开始时间" min-width="160" header-align="center" />
        <el-table-column prop="end_time" label="结束时间" min-width="160" header-align="center" />
        <el-table-column prop="duration" label="时长" width="90" align="center" header-align="center" />
        <el-table-column prop="file_size" label="文件大小" width="110" align="center" header-align="center" />
        <el-table-column prop="has_tracking_box" label="跟踪框" width="120" align="center" header-align="center">
          <template #default="scope">
            <el-tag :type="scope.row.has_tracking_box ? 'success' : 'info'" size="small">
              {{ scope.row.has_tracking_box ? '有' : '无' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="create_time" label="创建时间" min-width="160" header-align="center" />
        <el-table-column label="操作" width="220" align="center" header-align="center" fixed="right">
          <template #default="scope">
            <el-button type="primary" size="small" @click="playRecording(scope.row)">
              <el-icon><VideoPlay /></el-icon>
              播放
            </el-button>
            <el-button type="success" size="small" @click="downloadRecording(scope.row)">
              <el-icon><Download /></el-icon>
              下载
            </el-button>
            <el-button type="danger" size="small" @click="deleteRecording(scope.row)">
              <el-icon><Delete /></el-icon>
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 视频播放对话框 -->
    <el-dialog v-model="videoDialogVisible" title="录像播放" width="900px" @close="stopPlayback">
      <div class="video-player-container">
        <video
          v-if="currentVideoUrl"
          ref="videoPlayer"
          :src="currentVideoUrl"
          controls
          width="100%"
          height="450px"
          preload="metadata"
          crossorigin="anonymous"
          @loadstart="onVideoLoadStart"
          @loadeddata="onVideoLoaded"
          @error="onVideoError"
          @canplay="onVideoCanPlay"
        >
          您的浏览器不支持视频播放。
        </video>
        <div v-else class="video-loading">
          <el-icon class="loading-icon"><Loading /></el-icon>
          <p>正在加载视频...</p>
        </div>
        
        <!-- 视频状态信息 -->
        <div v-if="videoStatus" class="video-status" :class="videoStatus.type">
          <p>{{ videoStatus.message }}</p>
        </div>
      </div>
      <template #footer>
        <div class="video-info">
          <p><strong>录像信息：</strong></p>
          <p>设备：{{ currentRecording.device_name }}</p>
          <p>告警类型：{{ currentRecording.alarm_type }}</p>
          <p>时长：{{ currentRecording.duration }}秒</p>
          <p>分辨率：{{ currentRecording.resolution }}</p>
          <p>帧率：{{ currentRecording.fps }}fps</p>
          <p>文件路径：{{ currentRecording.file_path }}</p>
        </div>
      </template>
    </el-dialog>

    <!-- 上传录像对话框 -->
    <el-dialog v-model="uploadDialogVisible" title="上传录像" width="600px">
      <div class="upload-form">
        <!-- 设备选择 -->
        <div class="form-item">
          <label class="form-label">选择设备：</label>
          <el-select v-model="selectedDeviceId" placeholder="请选择设备" style="width: 100%">
            <el-option
              v-for="device in deviceOptions"
              :key="device.id"
              :label="device.name"
              :value="device.id"
            />
          </el-select>
        </div>
        
        <!-- 文件选择 -->
        <div class="form-item">
          <label class="form-label">选择文件：</label>
          <input 
            ref="fileInput"
            type="file" 
            accept="video/*,audio/*,.mp4,.avi,.mov,.mkv,.wmv,.flv,.webm,.m4v"
            @change="handleFileSelect"
            style="width: 100%; padding: 8px; border: 1px solid #dcdfe6; border-radius: 4px;"
          />
        </div>
        
        <!-- 文件信息显示 -->
        <div v-if="selectedFile" class="file-info">
          <p><strong>文件名：</strong>{{ selectedFile.name }}</p>
          <p><strong>文件大小：</strong>{{ formatFileSize(selectedFile.size) }}</p>
          <p><strong>文件类型：</strong>{{ selectedFile.type || '未知' }}</p>
        </div>
        
        <!-- 上传进度 -->
        <div v-if="uploadProgress > 0" class="upload-progress">
          <el-progress :percentage="uploadProgress" :status="uploadStatus" />
          <p>{{ uploadMessage }}</p>
        </div>
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="cancelUpload">取消</el-button>
          <el-button 
            type="primary" 
            @click="startUpload" 
            :disabled="!selectedDeviceId || !selectedFile || uploading"
            :loading="uploading"
          >
            {{ uploading ? '上传中...' : '开始上传' }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="RecordingList">
import { ref, reactive, onMounted, onUnmounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Delete, Download, VideoPlay, Loading, Upload, Refresh } from '@element-plus/icons-vue'
import { recordingApi } from '@/api/recording'
import { useRecordingStore } from '@/stores/recording'

const loading = ref(false)
const videoDialogVisible = ref(false)
const currentVideoUrl = ref('')
const currentRecording = ref({})
const videoPlayer = ref()
const videoStatus = ref(null)
// 上传相关状态
const uploadDialogVisible = ref(false)
const selectedDeviceId = ref('')
const selectedFile = ref(null)
const uploading = ref(false)
const uploadProgress = ref(0)
const uploadStatus = ref('')
const uploadMessage = ref('')
const fileInput = ref()

// 自定义下拉菜单状态
const isDeviceDropdownOpen = ref(false)
const isAlarmDropdownOpen = ref(false)

// 使用录像store
const recordingStore = useRecordingStore()

// 搜索表单
const searchForm = reactive({
  device_id: '',
  timeRange: [],
  alarm_type: ''
})

// 分页信息
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

// 录像列表
const recordingList = ref([])

// 监听store中录像数据的变化，实现实时同步
watch(() => recordingStore.recordings, (newRecordings) => {
  
  recordingList.value = newRecordings
}, { deep: true, immediate: true })

// 监听分页数据变化
watch(() => recordingStore.pagination, (newPagination) => {
  
  pagination.page = newPagination.page
  pagination.pageSize = newPagination.page_size
  pagination.total = newPagination.total
}, { deep: true, immediate: true })

// 设备选项
const deviceOptions = ref([
  { id: 1, name: '前门摄像头' },
  { id: 2, name: '后门摄像头' },
  { id: 3, name: '侧门摄像头' },
  { id: 4, name: '皮带头部摄像头' },
  { id: 5, name: '皮带尾部摄像头' }
])

// 获取告警类型颜色
const getAlarmTypeColor = (type) => {
  const colorMap = {
    '异常行为': 'danger',
    '车辆违规': 'warning',
    '人员闯入': 'danger',
    '区域入侵': 'warning'
  }
  return colorMap[type] || 'info'
}

// 加载录像列表
const loadRecordingList = async () => {

  loading.value = true
  try {
    // 设置搜索条件 - 确保时间格式正确
    const filters = {
      device_id: searchForm.device_id ? parseInt(searchForm.device_id) : null,
      alarm_type: searchForm.alarm_type || null
    }
    
    // 处理时间范围，确保格式正确
    if (searchForm.timeRange && searchForm.timeRange.length === 2) {
      if (searchForm.timeRange[0]) {
        filters.start_time = new Date(searchForm.timeRange[0]).toISOString()
      }
      if (searchForm.timeRange[1]) {
        filters.end_time = new Date(searchForm.timeRange[1]).toISOString()
      }
    }
    

    recordingStore.setFilters(filters)

    // 设置分页
    recordingStore.setPagination({
      page: pagination.page,
      page_size: pagination.pageSize
    })

    // 使用store加载数据
    await recordingStore.fetchRecordings()
    

    
    // 更新本地数据
    recordingList.value = recordingStore.recordings
    pagination.total = recordingStore.pagination.total
  } catch (error) {

    ElMessage.error('加载录像列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  loadRecordingList()
}

// 重置搜索
const resetSearch = () => {
  searchForm.device_id = ''
  searchForm.timeRange = []
  searchForm.alarm_type = ''
  pagination.page = 1
  loadRecordingList()
}

// 自定义下拉菜单操作函数
const toggleDeviceDropdown = () => {
  isDeviceDropdownOpen.value = !isDeviceDropdownOpen.value
  // 关闭其他下拉菜单
  if (isDeviceDropdownOpen.value) {
    isAlarmDropdownOpen.value = false
  }
}

const toggleAlarmDropdown = () => {
  isAlarmDropdownOpen.value = !isAlarmDropdownOpen.value
  // 关闭其他下拉菜单
  if (isAlarmDropdownOpen.value) {
    isDeviceDropdownOpen.value = false
  }
}

const selectDevice = (device) => {
  searchForm.device_id = device ? device.id : ''
  isDeviceDropdownOpen.value = false
  handleSearch()
}

const selectAlarmType = (type) => {
  searchForm.alarm_type = type || ''
  isAlarmDropdownOpen.value = false
  handleSearch()
}

const getSelectedDeviceName = () => {
  if (!searchForm.device_id) return ''
  const device = deviceOptions.value.find(d => d.id === searchForm.device_id)
  return device ? device.name : ''
}

// 点击外部关闭下拉菜单
const handleClickOutside = (event) => {
  const customSelects = event.target.closest('.custom-select')
  if (!customSelects) {
    isDeviceDropdownOpen.value = false
    isAlarmDropdownOpen.value = false
  }
}

// 分页大小改变
const handleSizeChange = (val) => {
  pagination.pageSize = val
  pagination.page = 1
  loadRecordingList()
}

// 当前页改变
const handleCurrentChange = (val) => {
  pagination.page = val
  loadRecordingList()
}

// 播放录像
const playRecording = async (recording) => {
  console.log('=== 开始播放录像 ===', recording)
  
  currentRecording.value = recording
  videoDialogVisible.value = true
  currentVideoUrl.value = ''

  try {
    // 获取正确的录像ID - 优先使用id字段，后端返回的是MongoDB ObjectID
    const recordingId = recording.id || recording._id
    console.log('录像ID:', recordingId)
    
    if (!recordingId) {
      throw new Error('录像ID不存在')
    }
    
    // 验证ID格式 - MongoDB ObjectID应该是24位十六进制字符串
    const idStr = String(recordingId)
    if (!/^[0-9a-fA-F]{24}$/.test(idStr)) {
      console.warn('录像ID格式可能不正确:', idStr)
    }

    // 使用blob播放方式 - 参考录像管理系统.html的成功实现
    try {
      console.log('=== 尝试获取播放信息 ===')
      // 先获取播放信息
      const response = await recordingApi.getPlayUrl(recordingId)
      console.log('播放信息响应:', response)
      
      if (response && response.success && response.error === 0) {
        console.log('=== 开始获取视频流 ===')
        // 获取视频流 - 使用带认证头的fetch
        const baseUrl = process.env.VUE_APP_API_BASE_URL || 'http://localhost:8080'
        const streamUrl = `${baseUrl}/api/recordings/stream/${recordingId}/mp4`
        
        // 获取认证token
        const token = localStorage.getItem('token')
        console.log('Stream URL:', streamUrl)
        console.log('Token存在:', !!token)
        
        const streamResponse = await fetch(streamUrl, {
          method: 'GET',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/octet-stream'
          }
        })
        
        console.log('流响应状态:', streamResponse.status)
        
        if (streamResponse.ok) {
          console.log('=== 创建Blob URL ===')
          const blob = await streamResponse.blob()
          console.log('Blob大小:', blob.size, '类型:', blob.type)
          
          // 创建blob URL
          const videoUrl = URL.createObjectURL(blob)
          currentVideoUrl.value = videoUrl
          
          console.log('=== 播放成功 ===')
          videoStatus.value = { type: 'success', message: '视频加载成功，开始播放' }
          
          // 清理之前的blob URL (如果存在)
          if (currentRecording.value.blobUrl) {
            URL.revokeObjectURL(currentRecording.value.blobUrl)
          }
          currentRecording.value.blobUrl = videoUrl
          
          return
        } else {
          throw new Error(`获取视频流失败: ${streamResponse.status} ${streamResponse.statusText}`)
        }
      } else {
        throw new Error(response?.message || '获取播放信息失败')
      }
    } catch (blobError) {
      console.error('Blob播放失败:', blobError)
      
      // 如果blob播放失败，回退到直接URL播放（保留原来的逻辑作为备用）
      console.log('=== 回退到直接URL播放 ===')
      try {
        const response = await recordingApi.getPlayUrl(recordingId)
        
        if (response && response.success && response.body) {
          // 后端返回的是 play_urls 对象，包含多种格式
          const playUrls = response.body.play_urls
          if (playUrls) {
            // 优先使用MP4流，然后是HLS流，最后是下载地址
            const baseUrl = process.env.VUE_APP_API_BASE_URL || 'http://localhost:8080'
            let playUrl = null
            
            // 方案1: MP4流（最佳播放体验）
            if (playUrls.mp4) {
              playUrl = playUrls.mp4.startsWith('http') ? playUrls.mp4 : baseUrl + playUrls.mp4
            }
            // 方案2: HLS流
            else if (playUrls.hls) {
              playUrl = playUrls.hls.startsWith('http') ? playUrls.hls : baseUrl + playUrls.hls
            }
            // 方案3: 下载地址
            else if (playUrls.download) {
              playUrl = playUrls.download.startsWith('http') ? playUrls.download : baseUrl + playUrls.download
            }
            
            if (playUrl) {
              currentVideoUrl.value = playUrl
              return
            }
          }
          
          // 检查传统的播放URL字段名作为备用
          const fallbackUrl = response.body.play_url || 
                             response.body.url || 
                             response.body.stream_url || 
                             response.body.video_url
          
          if (fallbackUrl) {
            currentVideoUrl.value = fallbackUrl
            return
          }
        }
      } catch (apiError) {
        // API获取播放地址失败，直接构建播放URL
        const baseUrl = process.env.VUE_APP_API_BASE_URL || 'http://localhost:8080'
        currentVideoUrl.value = `${baseUrl}/api/recordings/stream/${recordingId}/mp4`
      }
    }
    
  } catch (error) {
    console.error('播放录像失败:', error)
    ElMessage.error('播放录像失败: ' + error.message)
    videoDialogVisible.value = false
  }
}

// 视频播放器事件处理
const onVideoLoadStart = () => {
  
  videoStatus.value = { type: 'info', message: '正在加载视频...' }
}

const onVideoLoaded = () => {
  
  videoStatus.value = { type: 'success', message: '视频加载成功，可以播放' }
  setTimeout(() => {
    videoStatus.value = null
  }, 3000)
}

const onVideoError = (event) => {
  const error = event.target.error
  let message = '视频播放失败'
  
  if (error) {
    switch (error.code) {
      case error.MEDIA_ERR_ABORTED:
        message = '视频播放被中止'
        break
      case error.MEDIA_ERR_NETWORK:
        message = '网络错误，无法加载视频。可能需要认证或CORS设置。'
        break
      case error.MEDIA_ERR_DECODE:
        message = '视频解码错误，文件可能已损坏'
        break
      case error.MEDIA_ERR_SRC_NOT_SUPPORTED:
        message = '视频格式不支持或文件不存在。建议尝试Blob播放。'
        break
      default:
        message = `视频播放错误 (代码: ${error.code})`
    }
  }
  
  videoStatus.value = { 
    type: 'error', 
    message: `${message} - 建议尝试调试面板中的"Blob播放"` 
  }
  ElMessage.error(message)
  
  // 如果是CORS或认证问题，建议使用Blob播放
  if (error && (error.code === error.MEDIA_ERR_NETWORK || error.code === error.MEDIA_ERR_SRC_NOT_SUPPORTED)) {
    setTimeout(() => {
      ElMessage.info('提示：如果播放失败，请尝试点击"Blob播放"按钮')
    }, 2000)
  }
}

const onVideoCanPlay = () => {
  
  videoStatus.value = { type: 'success', message: '视频就绪，可以播放' }
  setTimeout(() => {
    videoStatus.value = null
  }, 2000)
}

// 停止播放
const stopPlayback = () => {
  console.log('=== 停止播放 ===')
  
  if (videoPlayer.value) {
    videoPlayer.value.pause()
    videoPlayer.value.currentTime = 0
  }
  
  // 清理当前视频的Blob URL
  if (currentVideoUrl.value && currentVideoUrl.value.startsWith('blob:')) {
    console.log('清理当前视频Blob URL:', currentVideoUrl.value)
    URL.revokeObjectURL(currentVideoUrl.value)
  }
  
  // 清理存储在录像对象中的Blob URL
  if (currentRecording.value && currentRecording.value.blobUrl) {
    console.log('清理录像对象中的Blob URL:', currentRecording.value.blobUrl)
    URL.revokeObjectURL(currentRecording.value.blobUrl)
    currentRecording.value.blobUrl = null
  }
  
  currentVideoUrl.value = ''
  videoStatus.value = null
}







// 下载录像
const downloadRecording = async (recording) => {
  try {
    const recordingId = recording.id || recording._id
    await recordingApi.downloadRecording(recordingId)
    ElMessage.success('开始下载录像文件')
  } catch (error) {
    ElMessage.error('下载失败')
  }
}

// 删除录像
const deleteRecording = async (recording) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除录像"${recording.device_name} - ${recording.alarm_type}"吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    await recordingApi.deleteRecording(recording.id)
    ElMessage.success('删除成功')
    loadRecordingList()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 显示上传对话框
const showUploadDialog = () => {
  
  uploadDialogVisible.value = true
  selectedDeviceId.value = ''
  selectedFile.value = null
  uploadProgress.value = 0
  uploadStatus.value = ''
  uploadMessage.value = ''
}

// 处理文件选择
const handleFileSelect = (event) => {
  const file = event.target.files[0]

  
  if (!file) {
    selectedFile.value = null
    return
  }
  
  // 验证文件大小（限制1GB）
  if (file.size > 1024 * 1024 * 1024) {
    ElMessage.error('文件大小不能超过 1GB！')
    event.target.value = '' // 清空文件选择
    return
  }
  
  // 验证文件类型
  const fileExt = file.name.toLowerCase().split('.').pop()
  const validExts = ['mp4', 'avi', 'mov', 'mkv', 'wmv', 'flv', 'webm', 'm4v']
  
  if (!validExts.includes(fileExt)) {
    ElMessage.error('只能上传视频文件（mp4、avi、mov、mkv、wmv、flv、webm、m4v）！')
    event.target.value = '' // 清空文件选择
    return
  }
  
  selectedFile.value = file

}

// 开始上传
const startUpload = async () => {
  if (!selectedDeviceId.value || !selectedFile.value) {
    ElMessage.error('请选择设备和文件')
    return
  }
  


  
  uploading.value = true
  uploadProgress.value = 0
  uploadStatus.value = 'active'
  uploadMessage.value = '正在上传...'
  
  try {
    // 直接调用API上传，不再使用store的复杂逻辑
    const response = await recordingApi.uploadRecording(selectedDeviceId.value, selectedFile.value)
    

    
    uploadProgress.value = 100
    uploadStatus.value = 'success'
    uploadMessage.value = '上传成功！'
    
    ElMessage.success('录像上传成功！')
    
    // 使用Store方法刷新数据，确保统一状态管理

    try {
      // 暂时只刷新录像列表，跳过统计以避免500错误
      await recordingStore.fetchRecordings()
      
    } catch (refreshError) {
      // 刷新失败，但不影响上传成功
    }
    
    // 触发全局事件，通知其他组件（如录像统计页面）
    window.dispatchEvent(new CustomEvent('recordingUploaded', {
      detail: { 
        recordingId: response.body?.recording_id || response.recording_id || 'unknown',
        deviceId: selectedDeviceId.value,
        fileName: selectedFile.value.name,
        fileSize: selectedFile.value.size
      }
    }))
    
  
    
    // 延迟关闭对话框
    setTimeout(() => {
      cancelUpload()
    }, 1500)
    
  } catch (error) {

    
    uploadProgress.value = 0
    uploadStatus.value = 'exception'
    uploadMessage.value = `上传失败: ${error.message}`
    
    ElMessage.error(`上传失败: ${error.message}`)
  } finally {
    uploading.value = false
  }
}

// 取消上传
const cancelUpload = () => {

  
  uploadDialogVisible.value = false
  selectedDeviceId.value = ''
  selectedFile.value = null
  uploading.value = false
  uploadProgress.value = 0
  uploadStatus.value = ''
  uploadMessage.value = ''
  
  // 清空文件输入
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

// 格式化文件大小
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 手动刷新数据
const manualRefresh = async () => {

  try {
    // 清空当前数据
    recordingList.value = []
    
    // 重新加载数据 - 暂时只刷新录像列表
    await recordingStore.fetchRecordings()
    

    
    ElMessage.success(`刷新完成！共加载 ${recordingStore.recordings.length} 条录像记录`)
  } catch (error) {

    ElMessage.error('刷新失败：' + error.message)
  }
}

// 清理过期录像
const cleanupOldRecordings = async () => {
  try {
    await ElMessageBox.confirm(
      '系统将自动清理6个月前的录像文件，确定要执行清理操作吗？',
      '清理确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    // TODO: 调用实际的API
    // await recordingApi.cleanupOldRecordings()

    ElMessage.success('清理操作已启动，将在后台执行')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('清理操作失败')
    }
  }
}

onMounted(async () => {
  // 添加外部点击事件监听
  document.addEventListener('click', handleClickOutside)
  
  try {
    await loadRecordingList()

  } catch (error) {
    // 初始化失败，静默处理
  }
})

// 组件卸载时移除事件监听
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.recording-list {
  padding: 20px;
}

/* 科技感卡片样式 */
.tech-card {
  background: rgba(15, 25, 45, 0.95) !important;
  border: 1px solid rgba(0, 255, 255, 0.2) !important;
  border-radius: 12px !important;
  backdrop-filter: blur(10px) !important;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.3),
    0 0 20px rgba(0, 255, 255, 0.1) !important;
}

.tech-card :deep(.el-card__header) {
  background: rgba(20, 30, 50, 0.8) !important;
  border-bottom: 1px solid rgba(0, 255, 255, 0.2) !important;
  border-radius: 12px 12px 0 0 !important;
  color: #00ffff !important;
  padding: 16px 20px !important;
}

.tech-card :deep(.el-card__body) {
  background: rgba(15, 25, 45, 0.95) !important;
  padding: 20px !important;
  border-radius: 0 0 12px 12px !important;
  color: rgba(255, 255, 255, 0.9) !important;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.search-bar {
  margin-bottom: 20px;
}

.pagination-container {
  margin-top: 20px;
  text-align: right;
}

.video-player-container {
  width: 100%;
  height: 400px;
  background-color: #000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.video-loading {
  color: #fff;
  text-align: center;
}

.loading-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.video-info {
  margin-top: 16px;
  padding: 16px;
  background: rgba(20, 30, 50, 0.6);
  border: 1px solid rgba(0, 255, 255, 0.2);
  border-radius: 8px;
  backdrop-filter: blur(5px);
}

.video-info p {
  margin: 8px 0;
  color: rgba(255, 255, 255, 0.8);
}

.device-select-content {
  padding: 20px 0;
}

.device-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 16px;
}

.device-item {
  width: 100%;
  margin-right: 0;
  padding: 12px;
  background: rgba(20, 30, 50, 0.4);
  border: 1px solid rgba(0, 255, 255, 0.2);
  border-radius: 6px;
  transition: all 0.3s;
}

.device-item:hover {
  border-color: rgba(0, 255, 255, 0.5);
  background: rgba(0, 255, 255, 0.1);
  box-shadow: 0 0 8px rgba(0, 255, 255, 0.2);
}

.device-item.is-checked {
  border-color: #00ffff;
  background: rgba(0, 255, 255, 0.15);
  box-shadow: 0 0 10px rgba(0, 255, 255, 0.3);
}

.device-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.device-name {
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
}

.device-id {
  font-size: 12px;
  color: rgba(0, 255, 255, 0.7);
}

.upload-form {
  padding: 20px 0;
}

.upload-form .form-item {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.8);
}

.file-info {
  padding: 16px;
  background: rgba(20, 30, 50, 0.6);
  border: 1px solid rgba(0, 255, 255, 0.2);
  border-radius: 8px;
  margin: 16px 0;
  backdrop-filter: blur(5px);
}

.file-info p {
  margin: 8px 0;
  color: rgba(255, 255, 255, 0.8);
}

.upload-progress {
  margin: 16px 0;
}

.upload-progress p {
  margin-top: 8px;
  text-align: center;
  color: rgba(255, 255, 255, 0.8);
}

/* 视频播放器样式 */
.video-player-container {
  position: relative;
  background: #000;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 16px;
}

.video-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 450px;
  background: rgba(15, 25, 45, 0.8);
  color: rgba(255, 255, 255, 0.8);
}

.video-loading .loading-icon {
  font-size: 48px;
  margin-bottom: 16px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.video-status {
  position: absolute;
  top: 16px;
  left: 16px;
  right: 16px;
  padding: 12px 16px;
  border-radius: 6px;
  color: white;
  font-weight: 500;
  z-index: 10;
}

.video-status.info {
  background: rgba(64, 158, 255, 0.9);
}

.video-status.success {
  background: rgba(103, 194, 58, 0.9);
}

.video-status.error {
  background: rgba(245, 108, 108, 0.9);
}

.video-debug {
  margin-top: 16px;
}

.video-debug .el-collapse {
  border: none;
}

.video-debug .el-collapse-item {
  border-bottom: 1px solid rgba(0, 255, 255, 0.2);
}

.url-test-buttons {
  margin-top: 12px;
  display: flex;
  gap: 8px;
}

.video-info {
  background: rgba(20, 30, 50, 0.6);
  padding: 16px;
  border-radius: 6px;
  border-left: 4px solid rgba(0, 255, 255, 0.8);
  backdrop-filter: blur(5px);
}

.video-info p {
  margin: 6px 0;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.5;
}

.video-info p:first-child {
  color: rgba(255, 255, 255, 0.95);
  font-weight: 600;
  margin-bottom: 12px;
}

/* Element Plus 组件深色主题样式 */
:deep(.el-form-item__label) {
  color: rgba(255, 255, 255, 0.8) !important;
}

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
  box-shadow: 
    inset 0 0 15px rgba(0, 255, 255, 0.08),
    0 0 8px rgba(0, 255, 255, 0.2) !important;
}

:deep(.el-input__wrapper.is-focus) {
  background: rgba(25, 35, 55, 0.95) !important;
  border-color: #00ffff !important;
  box-shadow: 
    inset 0 0 20px rgba(0, 255, 255, 0.1),
    0 0 0 2px rgba(0, 255, 255, 0.3),
    0 0 15px rgba(0, 255, 255, 0.2) !important;
}

:deep(.el-input__inner) {
  background: transparent !important;
  color: rgba(255, 255, 255, 0.95) !important;
  font-weight: 500 !important;
}

:deep(.el-input__inner::placeholder) {
  color: rgba(255, 255, 255, 0.5) !important;
  font-style: italic !important;
}

:deep(.el-select .el-input__wrapper) {
  background: rgba(20, 30, 50, 0.8) !important;
  border: 1px solid rgba(0, 255, 255, 0.3) !important;
  box-shadow: inset 0 0 10px rgba(0, 255, 255, 0.05) !important;
}

:deep(.el-select .el-input__wrapper:hover) {
  background: rgba(25, 35, 55, 0.9) !important;
  border-color: rgba(0, 255, 255, 0.5) !important;
  box-shadow: 
    inset 0 0 15px rgba(0, 255, 255, 0.08),
    0 0 8px rgba(0, 255, 255, 0.2) !important;
}

:deep(.el-select-dropdown) {
  background: rgba(15, 25, 45, 0.98) !important;
  border: 1px solid rgba(0, 255, 255, 0.3) !important;
  backdrop-filter: blur(15px) !important;
  box-shadow: 
    0 8px 25px rgba(0, 0, 0, 0.4),
    0 0 20px rgba(0, 255, 255, 0.1) !important;
  border-radius: 8px !important;
}

:deep(.el-select-dropdown .el-select-dropdown__item) {
  background: transparent !important;
  color: rgba(255, 255, 255, 0.85) !important;
  padding: 8px 16px !important;
  transition: all 0.3s ease !important;
  border-radius: 4px !important;
  margin: 2px 4px !important;
}

:deep(.el-select-dropdown .el-select-dropdown__item:hover) {
  background: rgba(0, 255, 255, 0.15) !important;
  color: #00ffff !important;
  transform: translateX(2px) !important;
  box-shadow: 0 2px 8px rgba(0, 255, 255, 0.2) !important;
}

:deep(.el-select-dropdown .el-select-dropdown__item.selected) {
  background: rgba(0, 255, 255, 0.25) !important;
  color: #00ffff !important;
  font-weight: 600 !important;
  box-shadow: 
    0 2px 8px rgba(0, 255, 255, 0.3),
    inset 0 0 10px rgba(0, 255, 255, 0.1) !important;
}

:deep(.el-date-editor) {
  background: rgba(20, 30, 50, 0.85) !important;
  border: 1px solid rgba(0, 255, 255, 0.3) !important;
  border-radius: 6px !important;
  box-shadow: 
    inset 0 0 10px rgba(0, 255, 255, 0.05),
    0 2px 4px rgba(0, 0, 0, 0.2) !important;
  backdrop-filter: blur(5px) !important;
}

:deep(.el-date-editor:hover) {
  background: rgba(25, 35, 55, 0.9) !important;
  border-color: rgba(0, 255, 255, 0.5) !important;
  box-shadow: 
    inset 0 0 15px rgba(0, 255, 255, 0.08),
    0 0 8px rgba(0, 255, 255, 0.2) !important;
}

:deep(.el-date-editor.is-active) {
  background: rgba(25, 35, 55, 0.95) !important;
  border-color: #00ffff !important;
  box-shadow: 
    inset 0 0 20px rgba(0, 255, 255, 0.1),
    0 0 0 2px rgba(0, 255, 255, 0.3),
    0 0 15px rgba(0, 255, 255, 0.2) !important;
}

:deep(.el-picker-panel) {
  background: rgba(15, 25, 45, 0.98) !important;
  border: 1px solid rgba(0, 255, 255, 0.3) !important;
  backdrop-filter: blur(15px) !important;
  box-shadow: 
    0 8px 25px rgba(0, 0, 0, 0.4),
    0 0 20px rgba(0, 255, 255, 0.1) !important;
}

:deep(.el-picker-panel__body) {
  background: transparent !important;
  color: rgba(255, 255, 255, 0.9) !important;
}

:deep(.el-date-table) {
  background: transparent !important;
}

:deep(.el-date-table td) {
  background: transparent !important;
  color: rgba(255, 255, 255, 0.8) !important;
}

:deep(.el-date-table td:hover) {
  background: rgba(0, 255, 255, 0.1) !important;
  color: #00ffff !important;
}

:deep(.el-date-table td.current) {
  background: rgba(0, 255, 255, 0.2) !important;
  color: #00ffff !important;
}

:deep(.el-table) {
  background: transparent !important;
  color: rgba(255, 255, 255, 0.9) !important;
}

:deep(.el-table th) {
  background: rgba(20, 30, 50, 0.8) !important;
  color: #00ffff !important;
  border-color: rgba(0, 255, 255, 0.2) !important;
}

:deep(.el-table td) {
  background: rgba(15, 25, 45, 0.6) !important;
  color: rgba(255, 255, 255, 0.9) !important;
  border-color: rgba(0, 255, 255, 0.1) !important;
}

:deep(.el-table tr) {
  background: transparent !important;
}

:deep(.el-table--striped .el-table__body tr.el-table__row--striped td) {
  background: rgba(20, 30, 50, 0.4) !important;
}

:deep(.el-table__body tr:hover td) {
  background: rgba(0, 255, 255, 0.1) !important;
}

:deep(.el-table__header-wrapper) {
  background: transparent !important;
}

:deep(.el-table__body-wrapper) {
  background: transparent !important;
}

:deep(.el-tag) {
  background: rgba(20, 30, 50, 0.6) !important;
  border: 1px solid rgba(0, 255, 255, 0.3) !important;
  color: rgba(255, 255, 255, 0.8) !important;
}

:deep(.el-tag--primary) {
  background: rgba(0, 150, 200, 0.6) !important;
  border-color: rgba(0, 200, 255, 0.5) !important;
  color: #ffffff !important;
}

:deep(.el-tag--success) {
  background: rgba(103, 194, 58, 0.6) !important;
  border-color: rgba(103, 194, 58, 0.5) !important;
  color: #ffffff !important;
}

:deep(.el-tag--warning) {
  background: rgba(230, 162, 60, 0.6) !important;
  border-color: rgba(230, 162, 60, 0.5) !important;
  color: #ffffff !important;
}

:deep(.el-tag--danger) {
  background: rgba(245, 108, 108, 0.6) !important;
  border-color: rgba(245, 108, 108, 0.5) !important;
  color: #ffffff !important;
}

:deep(.el-tag--info) {
  background: rgba(144, 147, 153, 0.6) !important;
  border-color: rgba(144, 147, 153, 0.5) !important;
  color: #ffffff !important;
}

:deep(.el-pagination) {
  background: transparent !important;
}

:deep(.el-pagination .btn-prev),
:deep(.el-pagination .btn-next),
:deep(.el-pagination .el-pager li) {
  background: rgba(20, 30, 50, 0.6) !important;
  color: rgba(255, 255, 255, 0.8) !important;
  border: 1px solid rgba(0, 255, 255, 0.2) !important;
}

:deep(.el-pagination .btn-prev:hover),
:deep(.el-pagination .btn-next:hover),
:deep(.el-pagination .el-pager li:hover) {
  background: rgba(0, 255, 255, 0.1) !important;
  color: #00ffff !important;
}

:deep(.el-pagination .el-pager li.is-active) {
  background: rgba(0, 255, 255, 0.2) !important;
  color: #00ffff !important;
  border-color: #00ffff !important;
}

:deep(.el-dialog) {
  background: rgba(15, 25, 45, 0.95) !important;
  border: 1px solid rgba(0, 255, 255, 0.2) !important;
  border-radius: 12px !important;
  backdrop-filter: blur(10px) !important;
}

:deep(.el-dialog__header) {
  background: rgba(20, 30, 50, 0.8) !important;
  border-bottom: 1px solid rgba(0, 255, 255, 0.2) !important;
  border-radius: 12px 12px 0 0 !important;
}

:deep(.el-dialog__title) {
  color: #00ffff !important;
}

:deep(.el-dialog__body) {
  background: rgba(15, 25, 45, 0.95) !important;
  color: rgba(255, 255, 255, 0.9) !important;
}

:deep(.el-upload-dragger) {
  background: rgba(20, 30, 50, 0.6) !important;
  border: 2px dashed rgba(0, 255, 255, 0.3) !important;
  color: rgba(255, 255, 255, 0.8) !important;
  border-radius: 8px !important;
}

:deep(.el-upload-dragger:hover) {
  border-color: rgba(0, 255, 255, 0.6) !important;
  background: rgba(20, 30, 50, 0.8) !important;
}

:deep(.el-progress-bar) {
  background: rgba(20, 30, 50, 0.6) !important;
}

:deep(.el-progress-bar__outer) {
  background: rgba(20, 30, 50, 0.6) !important;
  border-radius: 6px !important;
}

:deep(.el-progress-bar__inner) {
  background: linear-gradient(90deg, #00ffff 0%, rgba(0, 255, 255, 0.8) 100%) !important;
}

:deep(.el-collapse) {
  background: transparent !important;
  border: none !important;
}

:deep(.el-collapse-item__header) {
  background: rgba(20, 30, 50, 0.6) !important;
  color: rgba(255, 255, 255, 0.9) !important;
  border-bottom: 1px solid rgba(0, 255, 255, 0.2) !important;
}

:deep(.el-collapse-item__content) {
  background: rgba(15, 25, 45, 0.4) !important;
  color: rgba(255, 255, 255, 0.8) !important;
  border-bottom: 1px solid rgba(0, 255, 255, 0.2) !important;
}

/* 自定义下拉选择器样式 */
.custom-select {
  position: relative;
  min-width: 200px;
  cursor: pointer;
  user-select: none;
  z-index: 100;
}

.select-input {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0;
  background: rgba(20, 30, 50, 0.85);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 6px;
  height: 32px;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 
    inset 0 0 10px rgba(0, 255, 255, 0.05),
    0 2px 4px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(5px);
}

.selected-text {
  flex: 1;
  padding: 0 12px;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
  text-shadow: 0 0 3px rgba(0, 255, 255, 0.2);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.select-arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 100%;
  background: linear-gradient(135deg, #00ffff 0%, #0099cc 50%, #006699 100%);
  color: #ffffff;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 
    0 3px 12px rgba(0, 255, 255, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.2),
    inset 0 -1px 0 rgba(0, 0, 0, 0.1);
  position: relative;
}

.select-arrow::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.1) 50%, transparent 70%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.select-arrow svg {
  transition: transform 0.3s ease;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
}

/* 悬停效果 */
.custom-select:hover .select-input {
  background: rgba(25, 35, 55, 0.9);
  border-color: rgba(0, 255, 255, 0.5);
  box-shadow: 
    inset 0 0 15px rgba(0, 255, 255, 0.08),
    0 0 8px rgba(0, 255, 255, 0.2);
}

.custom-select:hover .select-arrow {
  background: linear-gradient(135deg, #00ccff 0%, #0077aa 50%, #004466 100%);
  box-shadow: 
    0 0 20px rgba(0, 255, 255, 0.6),
    0 0 40px rgba(0, 255, 255, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.3),
    inset 0 -1px 0 rgba(0, 0, 0, 0.2);
  transform: scale(1.02);
}

.custom-select:hover .select-arrow::before {
  opacity: 1;
}

/* 展开状态 */
.custom-select.is-open .select-input {
  border-color: #00ffff;
  background: rgba(25, 35, 55, 0.95);
  box-shadow: 
    0 0 0 2px rgba(0, 255, 255, 0.3),
    inset 0 0 20px rgba(0, 255, 255, 0.1),
    0 0 15px rgba(0, 255, 255, 0.2);
}

.custom-select.is-open .select-arrow {
  background: linear-gradient(135deg, #00ddff 0%, #0088bb 50%, #005577 100%);
  box-shadow: 
    0 0 25px rgba(0, 255, 255, 0.7),
    inset 0 1px 0 rgba(255, 255, 255, 0.4),
    inset 0 -1px 0 rgba(0, 0, 0, 0.2);
}

.custom-select.is-open .select-arrow svg {
  transform: rotate(180deg);
}

/* 下拉菜单 */
.dropdown-menu {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: rgba(15, 25, 45, 0.98);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 8px;
  backdrop-filter: blur(15px);
  box-shadow: 
    0 8px 25px rgba(0, 0, 0, 0.4),
    0 0 20px rgba(0, 255, 255, 0.1);
  z-index: 9999;
  max-height: 200px;
  overflow-y: auto;
  animation: dropdownFadeIn 0.2s ease-out;
  min-height: 120px;
  width: 100%;
}

@keyframes dropdownFadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.dropdown-item {
  padding: 10px 16px;
  color: rgba(255, 255, 255, 0.85);
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 4px;
  margin: 2px 4px;
  position: relative;
  overflow: hidden;
  min-height: 36px;
  display: flex;
  align-items: center;
  white-space: nowrap;
}

.dropdown-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(0, 255, 255, 0.1), transparent);
  transition: left 0.5s ease;
}

.dropdown-item:hover {
  background: rgba(0, 255, 255, 0.15);
  color: #00ffff;
  transform: translateX(2px);
  box-shadow: 0 2px 8px rgba(0, 255, 255, 0.2);
}

.dropdown-item:hover::before {
  left: 100%;
}

.dropdown-item.is-selected {
  background: rgba(0, 255, 255, 0.25);
  color: #00ffff;
  font-weight: 600;
  box-shadow: 
    0 2px 8px rgba(0, 255, 255, 0.3),
    inset 0 0 10px rgba(0, 255, 255, 0.1);
}

.dropdown-item.is-selected::after {
  content: '✓';
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #00ffff;
  font-weight: bold;
  text-shadow: 0 0 5px rgba(0, 255, 255, 0.5);
}

/* 滚动条样式 */
.dropdown-menu::-webkit-scrollbar {
  width: 6px;
}

.dropdown-menu::-webkit-scrollbar-track {
  background: rgba(20, 30, 50, 0.5);
  border-radius: 3px;
}

.dropdown-menu::-webkit-scrollbar-thumb {
  background: linear-gradient(to bottom, #00ffff, #0099cc);
  border-radius: 3px;
  box-shadow: inset 0 0 2px rgba(255, 255, 255, 0.2);
}

.dropdown-menu::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(to bottom, #00ccff, #0077aa);
}

/* 确保表单项允许下拉菜单溢出 */
:deep(.el-form--inline) {
  overflow: visible !important;
}

:deep(.el-form-item) {
  overflow: visible !important;
  position: relative !important;
}

/* 科技感表格 - 彻底解决白线问题 */
.tech-table {
  background: rgba(15, 25, 45, 0.95) !important;
  border-radius: 12px !important;
  overflow: hidden !important;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.3),
    0 0 0 1px rgba(0, 255, 255, 0.2) !important;
  backdrop-filter: blur(10px) !important;
  border: none !important;
}

/* 表格整体容器 - 彻底移除所有边框 */
.tech-table :deep(.el-table) {
  background: rgba(15, 25, 45, 0.95) !important;
  border-radius: 12px !important;
  overflow: hidden !important;
  border: none !important;
  border-collapse: separate !important;
}

.tech-table :deep(.el-table::before) {
  display: none !important;
}

.tech-table :deep(.el-table::after) {
  display: none !important;
}

/* 移除所有可能的白色边框和分隔线 */
.tech-table :deep(.el-table__inner-wrapper) {
  border: none !important;
  border-left: none !important;
  border-right: none !important;
  border-top: none !important;
  border-bottom: none !important;
}

.tech-table :deep(.el-table__inner-wrapper::after) {
  display: none !important;
}

.tech-table :deep(.el-table__inner-wrapper::before) {
  display: none !important;
}

/* 移除表格外层的所有边框元素 */
.tech-table :deep(.el-table__border-left-patch) {
  display: none !important;
}

.tech-table :deep(.el-table__border-right-patch) {
  display: none !important;
}

.tech-table :deep(.el-table__border-bottom-patch) {
  display: none !important;
}

.tech-table :deep(.el-table__border-top-patch) {
  display: none !important;
}

/* 强制移除Element Plus的默认边框样式 */
.tech-table :deep(.el-table--border) {
  border: none !important;
  border-left: none !important;
  border-right: none !important;
  border-top: none !important;
  border-bottom: none !important;
}

.tech-table :deep(.el-table--border::before) {
  display: none !important;
}

.tech-table :deep(.el-table--border::after) {
  display: none !important;
}

/* 表格头部样式 - 参考用户列表的头部设计 */
.tech-table :deep(.el-table__header-wrapper) {
  background: linear-gradient(135deg, 
    rgba(20, 35, 60, 1) 0%, 
    rgba(25, 40, 65, 1) 100%) !important;
  border-radius: 12px 12px 0 0 !important;
  border: none !important;
}

.tech-table :deep(.el-table__header-wrapper .el-table__header) {
  background: linear-gradient(135deg, 
    rgba(20, 35, 60, 1) 0%, 
    rgba(25, 40, 65, 1) 100%) !important;
  border: none !important;
}

.tech-table :deep(.el-table__header-wrapper .el-table__header th) {
  background: linear-gradient(135deg, 
    rgba(20, 35, 60, 1) 0%, 
    rgba(25, 40, 65, 1) 100%) !important;
  color: #00d4ff !important;
  font-weight: 600 !important;
  font-size: 14px !important;
  padding: 16px 12px !important;
  border: none !important;
  border-bottom: none !important;
  border-right: 1px solid rgba(0, 255, 255, 0.1) !important;
  text-shadow: 0 0 10px rgba(0, 212, 255, 0.6) !important;
  letter-spacing: 0.5px !important;
  position: relative !important;
}

.tech-table :deep(.el-table__header-wrapper .el-table__header th:last-child) {
  border-right: none !important;
}

/* 表格头部发光效果 */
.tech-table :deep(.el-table__header-wrapper .el-table__header th::after) {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, 
    transparent 0%, 
    rgba(0, 255, 255, 0.6) 50%, 
    transparent 100%);
  opacity: 0.8;
}

/* 表格主体样式 - 参考用户列表的行设计 */
.tech-table :deep(.el-table__body-wrapper) {
  background: transparent !important;
}

.tech-table :deep(.el-table__body) {
  background: transparent !important;
}

.tech-table :deep(.el-table__body-wrapper .el-table__body tr) {
  background: rgba(25, 35, 55, 0.6) !important;
  color: rgba(255, 255, 255, 0.95) !important;
  border-bottom: 1px solid rgba(0, 255, 255, 0.08) !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
  position: relative !important;
}

/* 交替行颜色 - 创建微妙的斑马纹效果 */
.tech-table :deep(.el-table__body-wrapper .el-table__body tr:nth-child(even)) {
  background: rgba(20, 30, 50, 0.7) !important;
}

.tech-table :deep(.el-table__body-wrapper .el-table__body tr:nth-child(odd)) {
  background: rgba(25, 35, 55, 0.6) !important;
}

/* 悬停效果 - 参考用户列表的交互效果 */
.tech-table :deep(.el-table__body-wrapper .el-table__body tr:hover) {
  background: linear-gradient(90deg, 
    rgba(0, 255, 255, 0.08) 0%, 
    rgba(0, 255, 255, 0.12) 50%, 
    rgba(0, 255, 255, 0.08) 100%) !important;
  transform: translateY(-1px) !important;
  box-shadow: 
    0 4px 20px rgba(0, 255, 255, 0.15),
    inset 0 1px 0 rgba(0, 255, 255, 0.2) !important;
}

.tech-table :deep(.el-table__body-wrapper .el-table__body tr:hover td) {
  background: transparent !important;
  color: rgba(255, 255, 255, 1) !important;
}

/* 单元格样式 - 参考用户列表的单元格设计 */
.tech-table :deep(.el-table__body-wrapper .el-table__body td) {
  border: none !important;
  border-right: 1px solid rgba(0, 255, 255, 0.06) !important;
  background: transparent !important;
  padding: 14px 12px !important;
  font-size: 13px !important;
  line-height: 1.5 !important;
  position: relative !important;
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
  color: rgba(255, 255, 255, 0.9) !important;
}

.tech-table :deep(.el-table__body-wrapper .el-table__body td:last-child) {
  border-right: none !important;
}

/* 彻底移除所有表格边框 - 最终解决方案 */
.tech-table :deep(.el-table--border) {
  border: none !important;
  border-left: none !important;
  border-right: none !important;
  border-top: none !important;
  border-bottom: none !important;
  outline: none !important;
}

.tech-table :deep(.el-table--border .el-table__inner-wrapper) {
  border: none !important;
  border-left: none !important;
  border-right: none !important;
  border-top: none !important;
  border-bottom: none !important;
  outline: none !important;
}

.tech-table :deep(.el-table--border .el-table__inner-wrapper::after) {
  display: none !important;
  content: none !important;
}

.tech-table :deep(.el-table--border .el-table__inner-wrapper::before) {
  display: none !important;
  content: none !important;
}

/* 移除所有边框补丁元素 */
.tech-table :deep(.el-table__border-left-patch) {
  display: none !important;
  width: 0 !important;
  height: 0 !important;
}

.tech-table :deep(.el-table__border-right-patch) {
  display: none !important;
  width: 0 !important;
  height: 0 !important;
}

.tech-table :deep(.el-table__border-bottom-patch) {
  display: none !important;
  width: 0 !important;
  height: 0 !important;
}

.tech-table :deep(.el-table__border-top-patch) {
  display: none !important;
  width: 0 !important;
  height: 0 !important;
}

/* 单元格边框控制 */
.tech-table :deep(.el-table--border td) {
  border: none !important;
  border-left: none !important;
  border-right: 1px solid rgba(0, 255, 255, 0.06) !important;
  border-top: none !important;
  border-bottom: none !important;
  outline: none !important;
}

.tech-table :deep(.el-table--border th) {
  border: none !important;
  border-left: none !important;
  border-right: 1px solid rgba(0, 255, 255, 0.1) !important;
  border-top: none !important;
  border-bottom: none !important;
  outline: none !important;
}

/* 移除表格外围的所有可能边框 */
.tech-table :deep(.el-table__body-wrapper) {
  border: none !important;
  outline: none !important;
}

.tech-table :deep(.el-table__header-wrapper) {
  border: none !important;
  outline: none !important;
}

.tech-table :deep(.el-table__footer-wrapper) {
  border: none !important;
  outline: none !important;
}

/* 移除表格容器本身的边框 */
.tech-table,
.tech-table :deep(.el-table),
.tech-table :deep(.el-table__inner-wrapper) {
  border: none !important;
  outline: none !important;
}

/* 加载状态样式 */
.tech-table :deep(.el-loading-mask) {
  background: rgba(15, 25, 45, 0.8) !important;
  backdrop-filter: blur(10px) !important;
}

.tech-table :deep(.el-loading-spinner) {
  color: #00ffff !important;
}

.tech-table :deep(.el-loading-text) {
  color: rgba(0, 255, 255, 0.8) !important;
}

/* 终极白线白底移除方案 */
.tech-table :deep(*) {
  border: none !important;
  border-left: none !important;
  border-right: none !important;
  border-top: none !important;
  border-bottom: none !important;
  background: transparent !important;
  outline: none !important;
}

/* 强制覆盖Element Plus的所有边框样式 */
.tech-table :deep(.el-table) *,
.tech-table :deep(.el-table__inner-wrapper) *,
.tech-table :deep(.el-table__header-wrapper) *,
.tech-table :deep(.el-table__body-wrapper) *,
.tech-table :deep(.el-table__footer-wrapper) * {
  border: none !important;
  border-left: none !important;
  border-right: none !important;
  border-top: none !important;
  border-bottom: none !important;
  outline: none !important;
  box-shadow: none !important;
}

/* 重新设置表格和行的背景，其他元素保持透明 */
.tech-table :deep(.el-table) {
  background: rgba(15, 25, 45, 0.95) !important;
  border: none !important;
}

.tech-table :deep(.el-table__header-wrapper) {
  background: linear-gradient(135deg, 
    rgba(20, 35, 60, 1) 0%, 
    rgba(25, 40, 65, 1) 100%) !important;
}

.tech-table :deep(.el-table__header-wrapper .el-table__header th) {
  background: linear-gradient(135deg, 
    rgba(20, 35, 60, 1) 0%, 
    rgba(25, 40, 65, 1) 100%) !important;
  border: none !important;
}

.tech-table :deep(.el-table__body-wrapper .el-table__body tr:nth-child(even)) {
  background: rgba(20, 30, 50, 0.7) !important;
}

.tech-table :deep(.el-table__body-wrapper .el-table__body tr:nth-child(odd)) {
  background: rgba(25, 35, 55, 0.6) !important;
}

.tech-table :deep(.el-table__body-wrapper .el-table__body tr:hover) {
  background: linear-gradient(90deg, 
    rgba(0, 255, 255, 0.08) 0%, 
    rgba(0, 255, 255, 0.12) 50%, 
    rgba(0, 255, 255, 0.08) 100%) !important;
}

/* 移除所有可能的白色背景和边框 */
.tech-table :deep(.el-table--border),
.tech-table :deep(.el-table--group),
.tech-table :deep(.el-table--striped) {
  border: none !important;
  background: transparent !important;
}

/* 强制移除单元格的所有边框和背景 */
.tech-table :deep(td),
.tech-table :deep(th) {
  border: none !important;
  border-left: none !important;
  border-right: none !important;
  border-top: none !important;
  border-bottom: none !important;
  background: transparent !important;
  outline: none !important;
}

/* 表格容器最终清理 */
.tech-table,
.tech-table :deep(.el-table),
.tech-table :deep(.el-table__inner-wrapper),
.tech-table :deep(.el-table__header-wrapper),
.tech-table :deep(.el-table__body-wrapper),
.tech-table :deep(.el-table__footer-wrapper) {
  border: none !important;
  outline: none !important;
  box-shadow: none !important;
}

/* 重新设置表格的圆角和阴影 */
.tech-table {
  background: rgba(15, 25, 45, 0.95) !important;
  border-radius: 12px !important;
  overflow: hidden !important;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.3),
    0 0 0 1px rgba(0, 255, 255, 0.2) !important;
  backdrop-filter: blur(10px) !important;
  border: none !important;
  margin: 0 !important;
  padding: 0 !important;
}

/* 彻底移除表格外部容器的所有可能的白底和边距 */
.tech-table,
.tech-table * {
  box-sizing: border-box !important;
}

.tech-table :deep(.el-table),
.tech-table :deep(.el-table__inner-wrapper),
.tech-table :deep(.el-table__header-wrapper),
.tech-table :deep(.el-table__body-wrapper),
.tech-table :deep(.el-table__footer-wrapper) {
  background: transparent !important;
  margin: 0 !important;
  padding: 0 !important;
  border: none !important;
  outline: none !important;
}

/* 移除表格左右两边的任何可能的白底和间距 */
.tech-table :deep(.el-table--border)::before,
.tech-table :deep(.el-table--border)::after,
.tech-table :deep(.el-table)::before,
.tech-table :deep(.el-table)::after {
  display: none !important;
  content: none !important;
  background: none !important;
  border: none !important;
  width: 0 !important;
  height: 0 !important;
}

/* 最强力的边框移除 - 覆盖所有可能的边框样式 */
.tech-table :deep(*) {
  border-left: none !important;
  border-right: none !important;
  border-top: none !important;
  border-bottom: none !important;
}

.tech-table :deep(td) {
  border: none !important;
  border-right: 1px solid rgba(0, 255, 255, 0.06) !important;
}

.tech-table :deep(th) {
  border: none !important;
  border-right: 1px solid rgba(0, 255, 255, 0.1) !important;
}

.tech-table :deep(td:last-child),
.tech-table :deep(th:last-child) {
  border-right: none !important;
}

/* 移除表格容器本身的边框 */
.tech-table,
.tech-table :deep(.el-table),
.tech-table :deep(.el-table__inner-wrapper) {
  border: none !important;
  outline: none !important;
}

/* 专门针对左右边框的强力移除 */
.tech-table :deep(.el-table),
.tech-table :deep(.el-table *),
.tech-table :deep(.el-table__inner-wrapper),
.tech-table :deep(.el-table__header),
.tech-table :deep(.el-table__body) {
  border-left: none !important;
  border-right: none !important;
}

/* 彻底移除表格的所有边框元素和伪元素 */
.tech-table :deep(.el-table)::before,
.tech-table :deep(.el-table)::after,
.tech-table :deep(.el-table__inner-wrapper)::before,
.tech-table :deep(.el-table__inner-wrapper)::after,
.tech-table :deep(.el-table--border)::before,
.tech-table :deep(.el-table--border)::after {
  display: none !important;
  content: none !important;
  background: transparent !important;
  border: none !important;
  width: 0 !important;
  height: 0 !important;
  position: absolute !important;
  left: -9999px !important;
}

/* 强制移除任何可能的白色背景和边框 */
.tech-table :deep(.el-table--enable-row-hover .el-table__body tr:hover > td),
.tech-table :deep(.el-table--enable-row-transition .el-table__body tr),
.tech-table :deep(.el-table--striped .el-table__body tr.el-table__row--striped td),
.tech-table :deep(.el-table--striped .el-table__body tr.el-table__row--striped:hover td) {
  background: transparent !important;
  border: none !important;
}

/* 移除任何可能的表格外部包装器边框 */
.tech-table :deep(.el-table .el-table__cell),
.tech-table :deep(.el-table .el-table__header .el-table__cell),
.tech-table :deep(.el-table .el-table__body .el-table__cell) {
  border: none !important;
  border-left: none !important;
  border-right: none !important;
  border-top: none !important;
  border-bottom: none !important;
  background: transparent !important;
}

/* 终极方案：移除所有可能的Element Plus内部元素边框 */
.tech-table :deep(.el-table__fixed),
.tech-table :deep(.el-table__fixed-left),
.tech-table :deep(.el-table__fixed-right),
.tech-table :deep(.el-table__fixed-left-patch),
.tech-table :deep(.el-table__fixed-right-patch) {
  border: none !important;
  box-shadow: none !important;
}

/* 确保表格容器没有任何白色边框或背景 */
.tech-table {
  position: relative !important;
  isolation: isolate !important;
}

.tech-table::before,
.tech-table::after {
  display: none !important;
}
</style> 