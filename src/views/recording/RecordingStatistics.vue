<template>
  <div class="recording-statistics">
    <el-card class="tech-card" v-loading="loading">
      <template #header>
        <span>录像统计</span>
      </template>

      <!-- 统计概览 -->
      <div class="statistics-overview">
        <el-row :gutter="24">
          <el-col :span="6">
            <div class="stat-card tech-card">
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
            <div class="stat-card tech-card">
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
            <div class="stat-card tech-card">
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
            <div class="stat-card tech-card">
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
            <el-card class="tech-card" shadow="never">
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
            <el-card class="tech-card" shadow="never">
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
            <el-card class="tech-card" shadow="never">
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
            <el-card class="tech-card" shadow="never">
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


    </el-card>
  </div>
</template>

<script setup name="RecordingStatistics">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { 
  VideoCamera, 
  FolderOpened, 
  Coin, 
  TrendCharts, 
  PieChart
} from '@element-plus/icons-vue'
import { useRecordingStore } from '@/stores/recording'

const trendPeriod = ref('7d')
const loading = ref(false)

// 使用录像store
const recordingStore = useRecordingStore()

// 统计数据 - 添加默认值防止数据为空
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



// 计算存储使用率
const storageUsagePercentage = computed(() => {
  // 安全处理 total_size
  let totalSizeGB = 0
  if (statisticsData.value.total_size !== null && statisticsData.value.total_size !== undefined) {
    if (typeof statisticsData.value.total_size === 'string') {
      totalSizeGB = parseFloat(statisticsData.value.total_size.replace(' GB', '') || '0')
    } else if (typeof statisticsData.value.total_size === 'number') {
      totalSizeGB = statisticsData.value.total_size
    }
  }
  
  // 安全处理 available_space
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
  console.log('=== 录像统计页面：检测到录像上传完成 ===', event.detail)
  ElMessage.info(`新录像已上传：${event.detail.fileName}，正在刷新统计数据...`)
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
  height: calc(100vh - 120px);
  overflow-y: auto;
  overflow-x: hidden;
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
  border-bottom: 1px solid rgba(0, 255, 255, 0.2);
}

.config-item:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.config-label {
  width: 100px;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
}

.config-value {
  color: rgba(255, 255, 255, 0.95);
}

.storage-usage {
  padding: 20px 0;
}

.usage-text {
  display: flex;
  justify-content: space-between;
  margin-top: 12px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
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
  color: rgba(255, 255, 255, 0.6);
}

.chart-icon {
  font-size: 48px;
  margin-bottom: 16px;
  color: rgba(0, 255, 255, 0.5);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* Element Plus 组件深色主题样式 */
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

:deep(.el-table__empty-block) {
  background: transparent !important;
}

:deep(.el-table__empty-text) {
  color: rgba(255, 255, 255, 0.6) !important;
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

:deep(.el-progress) {
  background: transparent !important;
}

:deep(.el-progress-bar) {
  background: rgba(20, 30, 50, 0.6) !important;
  border-radius: 10px !important;
}

:deep(.el-progress-bar__outer) {
  background: rgba(20, 30, 50, 0.6) !important;
  border: 1px solid rgba(0, 255, 255, 0.2) !important;
  border-radius: 10px !important;
}

:deep(.el-progress-bar__inner) {
  border-radius: 10px !important;
}

:deep(.el-tag) {
  background: rgba(20, 30, 50, 0.6) !important;
  border: 1px solid rgba(0, 255, 255, 0.3) !important;
  color: rgba(255, 255, 255, 0.8) !important;
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

/* 滚动条样式 */
.recording-statistics::-webkit-scrollbar {
  width: 8px;
}

.recording-statistics::-webkit-scrollbar-track {
  background: rgba(20, 30, 50, 0.3);
  border-radius: 4px;
}

.recording-statistics::-webkit-scrollbar-thumb {
  background: rgba(0, 255, 255, 0.3);
  border-radius: 4px;
  transition: all 0.3s ease;
}

.recording-statistics::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 255, 255, 0.5);
}
</style> 