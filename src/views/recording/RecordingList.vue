<template>
  <div class="recording-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>录像管理</span>
          <el-button type="danger" @click="cleanupOldRecordings">
            <el-icon><Delete /></el-icon>
            清理过期录像
          </el-button>
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
  </div>
</template>

<script setup name="RecordingList">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Delete, Download, VideoPlay, Loading } from '@element-plus/icons-vue'

const loading = ref(false)
const videoDialogVisible = ref(false)
const currentVideoUrl = ref('')
const currentRecording = ref({})

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
    // TODO: 调用实际的API
    // const params = {
    //   page: pagination.page,
    //   page_size: pagination.pageSize,
    //   device_id: searchForm.device_id,
    //   start_time: searchForm.timeRange[0],
    //   end_time: searchForm.timeRange[1],
    //   alarm_type: searchForm.alarm_type
    // }

    // 模拟数据
    const mockData = {
      recordings: [
        {
          id: 1,
          device_id: 1,
          device_name: '前门摄像头',
          alarm_id: 101,
          alarm_type: '异常行为',
          start_time: '2024-01-20 10:29:50',
          end_time: '2024-01-20 10:30:10',
          duration: 20,
          file_path: '/recordings/20240120/1029_50_alarm_101.mp4',
          file_size: '15.2 MB',
          has_tracking_box: true,
          create_time: '2024-01-20 10:30:00',
          resolution: '1920x1080',
          fps: 25
        },
        {
          id: 2,
          device_id: 2,
          device_name: '后门摄像头',
          alarm_id: 102,
          alarm_type: '车辆违规',
          start_time: '2024-01-20 14:15:20',
          end_time: '2024-01-20 14:15:40',
          duration: 20,
          file_path: '/recordings/20240120/1415_20_alarm_102.mp4',
          file_size: '18.5 MB',
          has_tracking_box: true,
          create_time: '2024-01-20 14:15:40',
          resolution: '1920x1080',
          fps: 30
        },
        {
          id: 3,
          device_id: 3,
          device_name: '侧门摄像头',
          alarm_id: 103,
          alarm_type: '人员闯入',
          start_time: '2024-01-20 16:22:10',
          end_time: '2024-01-20 16:22:30',
          duration: 20,
          file_path: '/recordings/20240120/1622_10_alarm_103.mp4',
          file_size: '14.8 MB',
          has_tracking_box: true,
          create_time: '2024-01-20 16:22:30',
          resolution: '1920x1080',
          fps: 25
        }
      ],
      total: 50
    }

    recordingList.value = mockData.recordings
    pagination.total = mockData.total
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
    // TODO: 调用实际的API获取播放地址
    // const response = await recordingApi.getPlayUrl(recording.id)
    
    // 模拟获取播放地址
    setTimeout(() => {
      currentVideoUrl.value = `http://192.168.1.100:8080${recording.file_path}`
    }, 1000)
  } catch (error) {
    ElMessage.error('获取播放地址失败')
    videoDialogVisible.value = false
  }
}

// 下载录像
const downloadRecording = async (recording) => {
  try {
    // TODO: 调用实际的API下载文件
    // window.open(`/api/recordings/${recording.id}/download`)
    
    // 模拟下载
    const link = document.createElement('a')
    link.href = `http://192.168.1.100:8080${recording.file_path}`
    link.download = `recording_${recording.id}.mp4`
    link.click()
    
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

    // TODO: 调用实际的API
    // await recordingApi.deleteRecording(recording.id)

    ElMessage.success('删除成功')
    loadRecordingList()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
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
</style> 