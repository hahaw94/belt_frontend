<template>
  <div class="video-playback">
    <!-- 上传录像区域 -->
    <div class="upload-section tech-card">
      <h3 class="section-title">
        <el-icon><Upload /></el-icon>
        上传录像
      </h3>
      <el-form :inline="true" :model="uploadForm">
        <el-form-item label="视频标题">
          <el-input 
            v-model="uploadForm.title" 
            placeholder="请输入视频标题" 
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="视频描述">
          <el-input 
            v-model="uploadForm.description" 
            placeholder="请输入视频描述（可选）" 
            style="width: 250px"
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
        <el-form-item>
          <el-button 
            type="success" 
            @click="uploadVideo" 
            :loading="uploading"
            :disabled="!uploadForm.title || !uploadForm.file"
          >
            <el-icon><Upload /></el-icon>
            {{ uploading ? `上传中 ${uploadProgress}%` : '开始上传' }}
          </el-button>
        </el-form-item>
      </el-form>
      <el-progress 
        v-if="uploading" 
        :percentage="uploadProgress" 
        :stroke-width="8"
        :color="progressColor"
      />
    </div>


    <div class="content-area">
      <!-- 视频播放区域 -->
      <div class="video-area tech-card">
        <div class="video-container">
          <div class="video-wrapper">
            <video 
              ref="videoPlayer"
              class="video-player"
              :src="currentVideoUrl"
              controls
              @loadedmetadata="onVideoLoaded"
              @timeupdate="onTimeUpdate"
              @ended="onVideoEnded"
            >
              您的浏览器不支持视频播放。
            </video>
            <div v-if="!currentVideoUrl" class="video-placeholder">
              <el-icon :size="60"><VideoCamera /></el-icon>
              <p>请从右侧列表选择要播放的录像</p>
            </div>
          </div>
          <div v-if="currentVideo" class="video-info-bar">
            <div class="info-item">
              <span class="label">标题:</span>
              <span class="value">{{ currentVideo.title }}</span>
            </div>
            <div class="info-item">
              <span class="label">格式:</span>
              <span class="value">{{ currentVideo.format?.toUpperCase() }}</span>
            </div>
            <div class="info-item">
              <span class="label">大小:</span>
              <span class="value">{{ currentVideo.file_size_str }}</span>
            </div>
            <div class="info-item" v-if="currentVideo.duration_str">
              <span class="label">时长:</span>
              <span class="value">{{ currentVideo.duration_str }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 录像列表区域 -->
      <div class="record-list tech-card">
        <div class="list-header">
          <h3 class="section-title">
            <el-icon><List /></el-icon>
            录像列表
          </h3>
          <el-tag type="info">共 {{ pagination.total }} 条</el-tag>
        </div>
        
        <el-table 
          :data="recordList" 
          height="calc(100% - 100px)" 
          style="width: 100%"
          v-loading="loading"
          :row-class-name="getRowClassName"
          @row-click="handleRowClick"
        >
          <el-table-column prop="title" label="标题" min-width="150" show-overflow-tooltip />
          <el-table-column prop="format" label="格式" width="80" align="center">
            <template #default="{ row }">
              <el-tag size="small" type="success">{{ row.format?.toUpperCase() }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="file_size_str" label="大小" width="100" />
          <el-table-column prop="duration_str" label="时长" width="100" />
          <el-table-column prop="upload_time" label="上传时间" width="160" />
          <el-table-column fixed="right" label="操作" width="150">
            <template #default="scope">
              <el-button 
                link 
                type="primary" 
                @click.stop="playRecord(scope.row)"
                :loading="playingId === scope.row.id"
              >
                <el-icon><VideoPlay /></el-icon>
                播放
              </el-button>
              <el-button 
                link 
                type="warning" 
                @click.stop="downloadRecord(scope.row)"
              >
                <el-icon><Download /></el-icon>
                下载
              </el-button>
              <el-button 
                link 
                type="danger" 
                @click.stop="deleteRecord(scope.row)"
              >
                <el-icon><Delete /></el-icon>
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页 -->
        <div class="pagination-wrapper">
          <el-pagination
            v-model:current-page="pagination.page"
            v-model:page-size="pagination.pageSize"
            :page-sizes="[10, 20, 50, 100]"
            :total="pagination.total"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handlePageChange"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  VideoPlay,
  Upload,
  Folder,
  Download,
  Delete,
  VideoCamera,
  List
} from '@element-plus/icons-vue'
import { detectionApi } from '@/api/detection'

export default {
  name: 'VideoPlayback',
  components: {
    VideoPlay,
    Upload,
    Folder,
    Download,
    Delete,
    VideoCamera,
    List
  },
  setup() {
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

    // 组件挂载时加载数据
    onMounted(() => {
      loadRecordingList()
    })

    return {
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
      onVideoLoaded,
      onTimeUpdate,
      onVideoEnded
    }
  }
}
</script>

<style scoped>
.video-playback {
  padding: 20px;
  height: calc(100vh - 120px);
  display: flex;
  flex-direction: column;
  gap: 20px;
  overflow-y: auto;
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
:deep(.el-progress__text) {
  color: rgba(255, 255, 255, 0.9) !important;
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

:deep(.el-table__body tr:hover td) {
  background: rgba(0, 255, 255, 0.1) !important;
  cursor: pointer;
}

:deep(.el-table__header-wrapper) {
  background: transparent !important;
}

:deep(.el-table__body-wrapper) {
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
}

:deep(.el-tag.el-tag--success) {
  background: rgba(0, 150, 136, 0.3) !important;
  border-color: rgba(0, 255, 200, 0.5) !important;
  color: rgba(0, 255, 200, 0.9) !important;
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
</style>