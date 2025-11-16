<template>
  <div class="video-playback tech-page-container">
    <!-- 科技感背景 -->
    <div class="tech-background"></div>
    
    <h2>录像管理</h2>

    <!-- 录像列表区域 -->
    <el-card class="record-list-card tech-card mb-20" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>录像列表</span>
          <div>
            <el-button type="primary" :icon="TrendCharts" size="small" class="tech-button-sm" @click="showStatisticsDialog = true">统计信息</el-button>
            <el-button type="success" :icon="UploadIcon" size="small" class="tech-button-sm" @click="showUploadDialog = true">上传录像</el-button>
          </div>
        </div>
      </template>
        
        <el-table 
          :data="recordList" 
          height="calc(100% - 100px)" 
          style="width: 100%"
          v-loading="loading"
          :row-class-name="getRowClassName"
          @row-click="handleRowClick"
          class="tech-table"
          border
        >
          <el-table-column prop="title" label="标题" min-width="100" show-overflow-tooltip />
          <el-table-column prop="format" label="格式" width="100" align="center">
            <template #default="{ row }">
              <el-tag size="small" type="success">{{ row.format?.toUpperCase() }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="file_size_str" label="大小" width="110" />
          <el-table-column prop="upload_time" label="上传时间" width="150" />
          <el-table-column fixed="right" label="操作" width="240">
            <template #default="scope">
              <el-button 
                size="small"
                class="tech-button-xs"
                @click.stop="playRecord(scope.row)"
                :loading="playingId === scope.row.id"
              >
                <el-icon><VideoPlay /></el-icon>
                播放
              </el-button>
              <el-button 
                size="small"
                class="tech-button-xs"
                @click.stop="downloadRecord(scope.row)"
              >
                <el-icon><Download /></el-icon>
                下载
              </el-button>
              <el-button 
                size="small"
                class="tech-button-xs"
                @click.stop="deleteRecord(scope.row)"
              >
                <el-icon><Delete /></el-icon>
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页 -->
        <div class="pagination-container tech-pagination">
          <div class="pagination-info">
            <span>共 <span class="total-count">{{ pagination.total }}</span> 条记录，每页显示 
              <el-select 
                v-model="pagination.pageSize" 
                @change="handleSizeChange"
                class="page-size-select"
                size="small"
              >
                <el-option label="10" :value="10" />
                <el-option label="20" :value="20" />
                <el-option label="50" :value="50" />
                <el-option label="100" :value="100" />
              </el-select> 条
            </span>
          </div>
          <div class="pagination-controls">
            <el-button 
              class="pagination-btn"
              size="small" 
              :disabled="pagination.page === 1 || loading"
              @click="handlePageChange(1)"
            >
              首页
            </el-button>
            <el-button 
              class="pagination-btn"
              size="small" 
              :disabled="pagination.page === 1 || loading"
              @click="handlePageChange(pagination.page - 1)"
            >
              上一页
            </el-button>
            <div class="pagination-pages">
              <button 
                v-for="page in visiblePages" 
                :key="page"
                class="page-btn"
                :class="{ active: page === pagination.page }"
                @click="handlePageChange(page)"
                :disabled="loading"
              >
                {{ page }}
              </button>
            </div>
            <el-button 
              class="pagination-btn"
              size="small" 
              :disabled="pagination.page === totalPages || loading"
              @click="handlePageChange(pagination.page + 1)"
            >
              下一页
            </el-button>
            <el-button 
              class="pagination-btn"
              size="small" 
              :disabled="pagination.page === totalPages || loading"
              @click="handlePageChange(totalPages)"
            >
              末页
            </el-button>
          </div>
        </div>
    </el-card>

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
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  VideoPlay,
  Upload as UploadIcon,
  Folder,
  Download,
  Delete,
  VideoCamera,
  TrendCharts,
  FolderOpened,
  Coin
} from '@element-plus/icons-vue'
import { detectionApi } from '@/api/detection'
import { useRecordingStore } from '@/stores/recording'

export default {
  name: 'VideoPlayback',
  components: {
    VideoPlay,
    Folder,
    Download,
    Delete,
    VideoCamera,
    TrendCharts,
    FolderOpened,
    Coin
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

    // 视频播放
    const videoPlayer = ref(null)
    const currentVideo = ref(null)
    const currentVideoUrl = ref('')
    const playingId = ref(null)
    
    // 弹窗状态
    const showStatisticsDialog = ref(false)
    const showPlayDialog = ref(false)
    const showUploadDialog = ref(false)

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

    // 播放录像
    const playRecord = async (record) => {
      try {
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
            currentVideo.value = record
            currentVideoUrl.value = playUrl
            showPlayDialog.value = true
            
            // 等待视频元素更新
            setTimeout(() => {
              if (videoPlayer.value) {
                videoPlayer.value.load()
                videoPlayer.value.play().catch(err => {
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
    
    // 停止播放
    const stopPlayback = () => {
      if (videoPlayer.value) {
        videoPlayer.value.pause()
        videoPlayer.value.currentTime = 0
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

    // 表格行样式
    const getRowClassName = ({ row }) => {
      if (currentVideo.value && row.id === currentVideo.value.id) {
        return 'playing-row'
      }
      return ''
    }

    // 表格行点击
    const handleRowClick = (row) => {
      playRecord(row)
    }

    // 视频事件处理
    const onVideoLoaded = () => {
      console.log('视频加载完成')
    }

    const onTimeUpdate = () => {
      // 可以在这里更新播放进度
    }

    const onVideoEnded = () => {
      ElMessage.success('播放完成')
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

    // 组件挂载时加载数据
    onMounted(() => {
      loadRecordingList()
      recordingStore.fetchStatistics()
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
      getRowClassName,
      handleRowClick,
      
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
/* ==================== 科技感主题样式 ==================== */

/* 页面容器 */
.video-playback {
  position: relative;
  width: 100%;
  height: 100%;
  padding: 20px;
  background: transparent;
  overflow-y: auto;
  overflow-x: hidden;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

/* 自定义滚动条样式 - 科技感 */
.video-playback::-webkit-scrollbar {
  width: 8px;
  background: rgba(0, 0, 0, 0.1);
}

.video-playback::-webkit-scrollbar-track {
  background: rgba(0, 255, 255, 0.05);
  border-radius: 4px;
  border: 1px solid rgba(0, 255, 255, 0.1);
}

.video-playback::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, 
    rgba(0, 255, 255, 0.3) 0%, 
    rgba(0, 200, 255, 0.5) 50%, 
    rgba(0, 255, 255, 0.3) 100%);
  border-radius: 4px;
  border: 1px solid rgba(0, 255, 255, 0.2);
  box-shadow: 0 0 10px rgba(0, 255, 255, 0.2);
}

.video-playback::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, 
    rgba(0, 255, 255, 0.5) 0%, 
    rgba(0, 200, 255, 0.7) 50%, 
    rgba(0, 255, 255, 0.5) 100%);
  box-shadow: 0 0 15px rgba(0, 255, 255, 0.4);
}

/* 科技感背景 */
.tech-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

/* 页面标题 */
.video-playback h2 {
  margin: 24px 0 20px 0;
  color: #00ffff;
  font-size: 24px;
  font-weight: 600;
  text-shadow: 0 0 15px rgba(0, 255, 255, 0.6);
  position: relative;
  z-index: 10;
}

/* 工具栏 */
.toolbar-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  position: relative;
  z-index: 10;
  gap: 20px;
}

.toolbar-left {
  flex: 1;
}

.toolbar-right {
  display: flex;
  gap: 12px;
}

/* 科技感按钮 */
.tech-button-sm {
  border: 1px solid rgba(0, 255, 255, 0.4) !important;
  background: rgba(0, 255, 255, 0.1) !important;
  color: #00ffff !important;
  border-radius: 6px !important;
  transition: all 0.3s ease !important;
  box-shadow: 0 0 10px rgba(0, 255, 255, 0.2) !important;
}

.tech-button-sm:hover {
  background: rgba(0, 255, 255, 0.2) !important;
  box-shadow: 0 0 20px rgba(0, 255, 255, 0.4) !important;
  transform: translateY(-1px) !important;
}

/* 科技感小按钮 */
.tech-button-xs {
  font-size: 12px !important;
  padding: 3px 6px !important;
  border: 1px solid rgba(0, 255, 255, 0.3) !important;
  background: rgba(0, 255, 255, 0.08) !important;
  color: #00ffff !important;
  border-radius: 4px !important;
  transition: all 0.3s ease !important;
  margin: 0 1px !important;
  height: 28px !important;
  line-height: 1 !important;
  display: inline-flex !important;
  align-items: center !important;
  gap: 2px !important;
}

.tech-button-xs:hover {
  background: rgba(0, 255, 255, 0.15) !important;
  box-shadow: 0 0 15px rgba(0, 255, 255, 0.3) !important;
  transform: translateY(-1px) !important;
}

.tech-button-xs :deep(.el-icon) {
  font-size: 12px !important;
}

/* 科技感卡片 */
.tech-card {
  position: relative;
  z-index: 10;
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  margin-bottom: 20px;
}

.tech-card :deep(.el-card__header) {
  background: transparent;
  border-bottom: 1px solid rgba(0, 255, 255, 0.2);
  border-radius: 0;
}

.tech-card :deep(.el-card__body) {
  background: transparent;
  padding: 0;
}

/* 卡片头部样式 */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0;
  font-weight: bold;
  color: #00ffff;
  text-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
}

.card-header > span {
  color: #00ffff;
  font-size: 16px;
  font-weight: 600;
  text-shadow: 0 0 10px rgba(0, 255, 255, 0.3);
  letter-spacing: 0.5px;
}

.card-header > div {
  display: flex;
  gap: 12px;
}

/* 边距工具类 */
.mb-20 {
  margin-bottom: 20px !important;
}

/* 录像列表区域 */
.record-list {
  flex: 1;
  padding: 20px;
  display: flex;
  flex-direction: column;
  min-height: 0;
  position: relative;
  z-index: 10;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

/* 上传区域 */
.upload-section {
  padding: 20px;
}

.section-title {
  color: rgba(0, 255, 255, 0.9);
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 8px;
  text-shadow: 0 0 10px rgba(0, 255, 255, 0.3);
}

.file-info {
  margin-left: 10px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
}

.content-area {
  flex: 1;
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
  min-height: 0;
}

/* 视频播放区域 */
.video-area {
  padding: 20px;
  display: flex;
  flex-direction: column;
}

.video-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.video-wrapper {
  flex: 1;
  position: relative;
  background: #000;
  border-radius: 8px;
  overflow: hidden;
  min-height: 400px;
}

.video-player {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.video-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.4);
  gap: 20px;
}

.video-placeholder p {
  font-size: 16px;
  margin: 0;
}

.video-info-bar {
  display: flex;
  gap: 20px;
  padding: 12px 16px;
  background: rgba(20, 30, 50, 0.6);
  border: 1px solid rgba(0, 255, 255, 0.2);
  border-radius: 8px;
  backdrop-filter: blur(5px);
}

.info-item {
  display: flex;
  gap: 8px;
  font-size: 14px;
}

.info-item .label {
  color: rgba(0, 255, 255, 0.8);
  font-weight: 500;
}

.info-item .value {
  color: rgba(255, 255, 255, 0.9);
}

/* 录像列表区域 */
.record-list {
  padding: 20px;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.pagination-wrapper {
  margin-top: 15px;
  display: flex;
  justify-content: center;
}

/* 表格行高亮样式 */
:deep(.playing-row) {
  background: rgba(0, 255, 255, 0.1) !important;
}

:deep(.playing-row:hover td) {
  background: rgba(0, 255, 255, 0.15) !important;
}

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

/* 科技感表格 - 参考图片设计 */
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

/* 表格整体容器 */
.tech-table :deep(.el-table) {
  background: rgba(15, 25, 45, 0.95) !important;
  border-radius: 12px !important;
  overflow: hidden !important;
  border: none !important;
}

.tech-table :deep(.el-table::before) {
  display: none !important;
}

/* 移除所有可能的白色边框 */
.tech-table :deep(.el-table__inner-wrapper) {
  border: none !important;
}

.tech-table :deep(.el-table__inner-wrapper::after) {
  display: none !important;
}

/* 表格头部样式 - 参考图片的头部设计 */
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

/* 表格主体样式 - 参考图片的行设计 */
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

/* 悬停效果 - 参考图片的交互效果 */
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

/* 单元格样式 - 参考图片的单元格设计 */
.tech-table :deep(.el-table__body-wrapper .el-table__body td) {
  border: none !important;
  border-right: 1px solid rgba(0, 255, 255, 0.06) !important;
  background: transparent !important;
  padding: 14px 12px !important;
  font-size: 13px !important;
  line-height: 1.5 !important;
  position: relative !important;
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
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.3),
    0 0 0 1px rgba(0, 255, 255, 0.2) !important;
}

/* 专门针对左右边框的强力移除 */
.tech-table :deep(.el-table),
.tech-table :deep(.el-table *),
.tech-table :deep(.el-table__inner-wrapper),
.tech-table :deep(.el-table__header),
.tech-table :deep(.el-table__body),
.tech-table :deep(.el-table__header-wrapper),
.tech-table :deep(.el-table__body-wrapper) {
  border-left: none !important;
  border-right: none !important;
}

/* 强制移除表格左右的所有可能边框元素 */
.tech-table::before,
.tech-table::after,
.tech-table :deep(.el-table)::before,
.tech-table :deep(.el-table)::after,
.tech-table :deep(.el-table__inner-wrapper)::before,
.tech-table :deep(.el-table__inner-wrapper)::after {
  display: none !important;
  content: none !important;
  border: none !important;
}

/* 确保表格外层容器没有任何边框 */
.tech-table {
  border: none !important;
  border-left: none !important;
  border-right: none !important;
  box-sizing: border-box !important;
  position: relative !important;
}

/* 数据为空时的样式 */
.tech-table :deep(.el-table__empty-block) {
  background: rgba(25, 35, 55, 0.6) !important;
  color: rgba(255, 255, 255, 0.6) !important;
  border: none !important;
}

.tech-table :deep(.el-table__empty-text) {
  color: rgba(255, 255, 255, 0.6) !important;
  font-size: 14px !important;
}

/* 行列样式 */
:deep(.el-row) {
  background: transparent !important;
}

:deep(.el-col) {
  background: transparent !important;
}

/* 按钮样式 */
:deep(.el-button--text) {
  color: rgba(0, 255, 255, 0.8) !important;
}

:deep(.el-button--text:hover) {
  color: #00ffff !important;
  background: rgba(0, 255, 255, 0.1) !important;
}

/* 分页样式 */
:deep(.el-pagination) {
  color: rgba(255, 255, 255, 0.8);
}

:deep(.el-pagination button) {
  background: rgba(20, 30, 50, 0.6) !important;
  color: rgba(255, 255, 255, 0.8) !important;
  border: 1px solid rgba(0, 255, 255, 0.2) !important;
}

:deep(.el-pagination button:hover) {
  background: rgba(0, 255, 255, 0.15) !important;
  color: #00ffff !important;
}

:deep(.el-pagination .el-pager li) {
  background: rgba(20, 30, 50, 0.6) !important;
  color: rgba(255, 255, 255, 0.8) !important;
  border: 1px solid rgba(0, 255, 255, 0.2) !important;
  margin: 0 3px;
}

:deep(.el-pagination .el-pager li:hover) {
  background: rgba(0, 255, 255, 0.15) !important;
  color: #00ffff !important;
}

:deep(.el-pagination .el-pager li.is-active) {
  background: rgba(0, 255, 255, 0.3) !important;
  color: #00ffff !important;
  border-color: rgba(0, 255, 255, 0.5) !important;
}

:deep(.el-select .el-input.is-focus .el-input__wrapper) {
  box-shadow: 0 0 0 1px rgba(0, 255, 255, 0.5) inset !important;
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