<template>
  <div class="recording-statistics">
    <el-card v-loading="loading">
      <template #header>
        <span>录像统计</span>
      </template>

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

      <!-- 详细配置信息 -->
      <div class="config-info">
        <el-row :gutter="24">
          <el-col :span="12">
            <el-card shadow="never">
              <template #header>
                <span>存储配置</span>
              </template>
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
              <div class="config-item">
                <span class="config-label">录像格式：</span>
                <span class="config-value">MP4 (H.264)</span>
              </div>
            </el-card>
          </el-col>
          <el-col :span="12">
            <el-card shadow="never">
              <template #header>
                <span>存储使用率</span>
              </template>
              <div class="storage-usage">
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
            </el-card>
          </el-col>
        </el-row>
      </div>

      <!-- 图表统计 -->
      <div class="charts-section">
        <el-row :gutter="24">
          <el-col :span="12">
            <el-card shadow="never">
              <template #header>
                <div class="chart-header">
                  <span>录像数量趋势</span>
                  <el-select v-model="trendPeriod" size="small" style="width: 120px;">
                    <el-option label="最近7天" value="7d" />
                    <el-option label="最近30天" value="30d" />
                    <el-option label="最近90天" value="90d" />
                  </el-select>
                </div>
              </template>
              <div class="chart-container" id="recordingTrendChart">
                <!-- 这里可以集成 ECharts 或其他图表库 -->
                <div class="chart-placeholder">
                  <el-icon class="chart-icon"><TrendCharts /></el-icon>
                  <p>录像数量趋势图</p>
                  <small>请集成图表库（如 ECharts）来显示详细图表</small>
                </div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="12">
            <el-card shadow="never">
              <template #header>
                <span>告警类型分布</span>
              </template>
              <div class="chart-container" id="alarmTypeChart">
                <div class="chart-placeholder">
                  <el-icon class="chart-icon"><PieChart /></el-icon>
                  <p>告警类型分布图</p>
                  <small>请集成图表库（如 ECharts）来显示详细图表</small>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>

      <!-- 设备录像统计 -->
      <div class="device-statistics">
        <el-card shadow="never">
          <template #header>
            <span>各设备录像统计</span>
          </template>
          <el-table :data="deviceStats" style="width: 100%">
            <el-table-column prop="device_name" label="设备名称" />
            <el-table-column prop="recording_count" label="录像数量" width="120" />
            <el-table-column prop="total_size" label="总大小" width="120" />
            <el-table-column prop="average_duration" label="平均时长" width="120" />
            <el-table-column prop="last_recording" label="最新录像" width="180" />
            <el-table-column label="操作" width="120">
              <template #default="scope">
                <el-button type="primary" size="small" @click="viewDeviceDetails(scope.row)">
                  查看详情
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </div>

      <!-- 清理历史 -->
      <div class="cleanup-history">
        <el-card shadow="never">
          <template #header>
            <div class="card-header">
              <span>清理历史</span>
              <el-button type="danger" size="small" @click="executeCleanup">
                <el-icon><Delete /></el-icon>
                立即清理
              </el-button>
            </div>
          </template>
          <el-table :data="cleanupHistory" style="width: 100%">
            <el-table-column prop="cleanup_time" label="清理时间" width="180" />
            <el-table-column prop="files_deleted" label="删除文件数" width="120" />
            <el-table-column prop="space_freed" label="释放空间" width="120" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="scope">
                <el-tag :type="scope.row.status === '成功' ? 'success' : 'danger'" size="small">
                  {{ scope.row.status }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="operator" label="操作员" width="120" />
            <el-table-column prop="remarks" label="备注" />
          </el-table>
        </el-card>
      </div>
    </el-card>
  </div>
</template>

<script setup name="RecordingStatistics">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  VideoCamera, 
  FolderOpened, 
  Coin, 
  TrendCharts, 
  PieChart, 
  Delete 
} from '@element-plus/icons-vue'
import { useRecordingStore } from '@/stores/recording'

const trendPeriod = ref('7d')
const loading = ref(false)

// 使用录像store
const recordingStore = useRecordingStore()

// 统计数据
const statisticsData = computed(() => recordingStore.statistics)

// 设备统计
const deviceStats = computed(() => {
  const deviceMap = recordingStore.recordingsByDevice
  const stats = []
  
  Object.keys(deviceMap).forEach(deviceId => {
    const recordings = deviceMap[deviceId]
    const totalSize = recordings.reduce((sum, recording) => {
      const sizeInMB = parseFloat(recording.file_size?.replace(' MB', '') || '0')
      return sum + sizeInMB
    }, 0)
    
    const averageDuration = recordings.length > 0 
      ? (recordings.reduce((sum, recording) => sum + recording.duration, 0) / recordings.length).toFixed(1)
      : 0
    
    const lastRecording = recordings.length > 0 
      ? recordings[0].create_time 
      : '无录像'
    
    const deviceName = recordings[0]?.device_name || `设备${deviceId}`
    
    stats.push({
      device_name: deviceName,
      recording_count: recordings.length,
      total_size: `${(totalSize / 1024).toFixed(2)} GB`,
      average_duration: `${averageDuration}s`,
      last_recording: lastRecording
    })
  })
  
  return stats
})

// 清理历史（这里可以考虑添加到store或者单独的API）
const cleanupHistory = ref([
  {
    cleanup_time: '2024-01-15 02:00:00',
    files_deleted: 156,
    space_freed: '3.2 GB',
    status: '成功',
    operator: '系统自动',
    remarks: '定时清理180天前的录像'
  },
  {
    cleanup_time: '2024-01-10 14:30:00',
    files_deleted: 89,
    space_freed: '1.8 GB',
    status: '成功',
    operator: 'admin',
    remarks: '手动清理指定设备录像'
  },
  {
    cleanup_time: '2024-01-08 02:00:00',
    files_deleted: 0,
    space_freed: '0 MB',
    status: '失败',
    operator: '系统自动',
    remarks: '磁盘空间不足，清理失败'
  }
])

// 计算存储使用率
const storageUsagePercentage = computed(() => {
  const totalSizeGB = parseFloat(statisticsData.value.total_size?.replace(' GB', '') || '0')
  const availableSpaceGB = parseFloat(statisticsData.value.available_space?.replace(' GB', '') || '0')
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

// 查看设备详情
const viewDeviceDetails = (device) => {
  // TODO: 实现设备录像详情查看
  ElMessage.info(`查看 ${device.device_name} 的录像详情`)
}

// 执行清理
const executeCleanup = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要立即执行录像清理操作吗？这将删除超过保留期的所有录像文件。',
      '清理确认',
      {
        confirmButtonText: '确定清理',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    // TODO: 调用实际的API
    // await recordingApi.executeCleanup()

    ElMessage.success('清理操作已启动，将在后台执行')
    
    // 模拟添加清理记录
    const newCleanupRecord = {
      cleanup_time: new Date().toLocaleString('zh-CN'),
      files_deleted: Math.floor(Math.random() * 100) + 50,
      space_freed: (Math.random() * 3 + 1).toFixed(1) + ' GB',
      status: '成功',
      operator: 'admin',
      remarks: '手动执行清理操作'
    }
    cleanupHistory.value.unshift(newCleanupRecord)
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('清理操作失败')
    }
  }
}

// 加载统计数据
const loadStatistics = async () => {
  loading.value = true
  try {
    await Promise.all([
      recordingStore.fetchStatistics(),
      recordingStore.fetchRecordings()
    ])
    ElMessage.success('统计数据加载完成')
  } catch (error) {
    ElMessage.error('加载统计数据失败')
  } finally {
    loading.value = false
  }
}

// 监听store中的统计数据变化，实现实时更新
watch(() => recordingStore.statistics, (newStats) => {
  console.log('统计数据更新:', newStats)
}, { deep: true })

// 监听录像上传事件，自动刷新统计数据
const handleRecordingUploaded = (event) => {
  console.log('检测到录像上传完成，刷新统计数据', event.detail)
  loadStatistics()
}

onMounted(() => {
  loadStatistics()
  
  // 添加录像上传事件监听器
  window.addEventListener('recordingUploaded', handleRecordingUploaded)
})

// 组件卸载时清理事件监听器
onUnmounted(() => {
  window.removeEventListener('recordingUploaded', handleRecordingUploaded)
})
</script>

<style scoped>
.recording-statistics {
  padding: 20px;
}

.statistics-overview {
  margin-bottom: 24px;
}

.stat-card {
  display: flex;
  align-items: center;
  padding: 20px;
  background: #f8f9ff;
  border-radius: 8px;
  border-left: 4px solid #409eff;
  transition: all 0.3s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
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

.stat-icon.total { background: #409eff; }
.stat-icon.size { background: #67c23a; }
.stat-icon.available { background: #e6a23c; }
.stat-icon.average { background: #f56c6c; }

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}

.config-info,
.charts-section,
.device-statistics,
.cleanup-history {
  margin-bottom: 24px;
}

.config-item {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.config-item:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.config-label {
  width: 100px;
  color: #606266;
  font-weight: 500;
}

.config-value {
  color: #303133;
}

.storage-usage {
  padding: 20px 0;
}

.usage-text {
  display: flex;
  justify-content: space-between;
  margin-top: 12px;
  font-size: 14px;
  color: #606266;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart-container {
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chart-placeholder {
  text-align: center;
  color: #909399;
}

.chart-icon {
  font-size: 48px;
  margin-bottom: 16px;
  color: #c0c4cc;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style> 