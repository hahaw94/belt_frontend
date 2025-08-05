<template>
  <div class="recording-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>录像管理</span>
          <div class="header-actions">
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
            <el-select v-model="searchForm.device_id" placeholder="请选择设备" clearable>
              <el-option
                v-for="device in deviceOptions"
                :key="device.id"
                :label="device.name"
                :value="device.id"
              />
            </el-select>
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
            <el-select v-model="searchForm.alarm_type" placeholder="请选择告警类型" clearable>
              <el-option label="异常行为" value="异常行为" />
              <el-option label="车辆违规" value="车辆违规" />
              <el-option label="人员闯入" value="人员闯入" />
              <el-option label="区域入侵" value="区域入侵" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button @click="resetSearch">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 录像列表 -->
      <el-table v-loading="loading" :data="recordingList" style="width: 100%">
        <el-table-column prop="id" label="录像ID" width="80" />
        <el-table-column prop="device_name" label="设备名称" width="150" />
        <el-table-column prop="alarm_type" label="告警类型" width="120">
          <template #default="scope">
            <el-tag :type="getAlarmTypeColor(scope.row.alarm_type)" size="small">
              {{ scope.row.alarm_type }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="start_time" label="开始时间" width="180" />
        <el-table-column prop="end_time" label="结束时间" width="180" />
        <el-table-column prop="duration" label="时长(秒)" width="100" />
        <el-table-column prop="file_size" label="文件大小" width="120" />
        <el-table-column prop="has_tracking_box" label="跟踪框" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.has_tracking_box ? 'success' : 'info'" size="small">
              {{ scope.row.has_tracking_box ? '有' : '无' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="create_time" label="创建时间" width="180" />
        <el-table-column label="操作" width="250" fixed="right">
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
    <el-dialog v-model="videoDialogVisible" title="录像播放" width="800px">
      <div class="video-player-container">
        <video
          v-if="currentVideoUrl"
          :src="currentVideoUrl"
          controls
          width="100%"
          height="400px"
        />
        <div v-else class="video-loading">
          <el-icon class="loading-icon"><Loading /></el-icon>
          <p>正在加载视频...</p>
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
import { ref, reactive, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Delete, Download, VideoPlay, Loading, Upload } from '@element-plus/icons-vue'
import { recordingApi } from '@/api/recording'
import { useRecordingStore } from '@/stores/recording'

const loading = ref(false)
const videoDialogVisible = ref(false)
const currentVideoUrl = ref('')
const currentRecording = ref({})
// 上传相关状态
const uploadDialogVisible = ref(false)
const selectedDeviceId = ref('')
const selectedFile = ref(null)
const uploading = ref(false)
const uploadProgress = ref(0)
const uploadStatus = ref('')
const uploadMessage = ref('')
const fileInput = ref()

// 使用录像store
const recordingStore = useRecordingStore()

// 监听store中录像数据的变化，实现实时同步
watch(() => recordingStore.recordings, (newRecordings) => {
  recordingList.value = newRecordings
}, { deep: true })

// 监听分页数据变化
watch(() => recordingStore.pagination, (newPagination) => {
  pagination.total = newPagination.total
}, { deep: true })

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
    // 设置搜索条件
    recordingStore.setFilters({
      device_id: searchForm.device_id || null,
      start_time: searchForm.timeRange?.[0] || '',
      end_time: searchForm.timeRange?.[1] || '',
      alarm_type: searchForm.alarm_type || ''
    })

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
  currentRecording.value = recording
  videoDialogVisible.value = true
  currentVideoUrl.value = ''

  try {
    const response = await recordingApi.getPlayUrl(recording.id)
    currentVideoUrl.value = response.body.play_url
  } catch (error) {
    ElMessage.error('获取播放地址失败')
    videoDialogVisible.value = false
  }
}

// 下载录像
const downloadRecording = async (recording) => {
  try {
    await recordingApi.downloadRecording(recording.id)
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
  console.log('=== 显示上传对话框 ===')
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
  console.log('=== 文件选择 ===', file)
  
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
  console.log('文件验证通过:', {
    name: file.name,
    size: file.size,
    type: file.type
  })
}

// 开始上传
const startUpload = async () => {
  if (!selectedDeviceId.value || !selectedFile.value) {
    ElMessage.error('请选择设备和文件')
    return
  }
  
  console.log('=== 开始上传流程 ===')
  console.log('设备ID:', selectedDeviceId.value)
  console.log('文件:', selectedFile.value.name)
  
  uploading.value = true
  uploadProgress.value = 0
  uploadStatus.value = 'active'
  uploadMessage.value = '正在上传...'
  
  try {
    // 直接调用API上传，不再使用store的复杂逻辑
    const response = await recordingApi.uploadRecording(selectedDeviceId.value, selectedFile.value)
    
    console.log('=== 上传成功 ===', response)
    
    uploadProgress.value = 100
    uploadStatus.value = 'success'
    uploadMessage.value = '上传成功！'
    
    ElMessage.success('录像上传成功！')
    
    // 刷新列表
    loadRecordingList()
    
    // 延迟关闭对话框
    setTimeout(() => {
      cancelUpload()
    }, 1500)
    
  } catch (error) {
    console.error('=== 上传失败 ===', error)
    
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
  console.log('=== 取消上传 ===')
  
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

onMounted(() => {
  loadRecordingList()
})
</script>

<style scoped>
.recording-list {
  padding: 20px;
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
  background-color: #f5f7fa;
  border-radius: 4px;
}

.video-info p {
  margin: 8px 0;
  color: #606266;
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
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  transition: all 0.3s;
}

.device-item:hover {
  border-color: #409eff;
  background-color: #f0f8ff;
}

.device-item.is-checked {
  border-color: #409eff;
  background-color: #f0f8ff;
}

.device-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.device-name {
  font-weight: 500;
  color: #303133;
}

.device-id {
  font-size: 12px;
  color: #909399;
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
  color: #606266;
}

.file-info {
  padding: 16px;
  background-color: #f5f7fa;
  border-radius: 4px;
  margin: 16px 0;
}

.file-info p {
  margin: 8px 0;
  color: #606266;
}

.upload-progress {
  margin: 16px 0;
}

.upload-progress p {
  margin-top: 8px;
  text-align: center;
  color: #606266;
}
</style> 