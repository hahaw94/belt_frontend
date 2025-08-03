<template>
  <div class="statistics-analysis">
    <!-- 统计概览 -->
    <div class="overview-section">
      <el-row :gutter="24">
        <el-col :span="6">
          <div class="stat-card primary">
            <div class="stat-icon">
              <el-icon><DataAnalysis /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ overviewData.total_devices }}</div>
              <div class="stat-label">设备总数</div>
              <div class="stat-change positive">+5</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card success">
            <div class="stat-icon">
              <el-icon><Compass /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ overviewData.online_devices }}</div>
              <div class="stat-label">在线设备</div>
              <div class="stat-change positive">+2</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card warning">
            <div class="stat-icon">
              <el-icon><Warning /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ overviewData.total_alarms_today }}</div>
              <div class="stat-label">今日告警</div>
              <div class="stat-change negative">-8</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card info">
            <div class="stat-icon">
              <el-icon><TrendCharts /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ overviewData.detection_accuracy }}%</div>
              <div class="stat-label">检测准确率</div>
              <div class="stat-change positive">+0.5%</div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 时间选择和快速筛选 -->
    <el-card class="filter-card">
      <div class="filter-controls">
        <div class="time-range">
          <span class="filter-label">时间范围：</span>
          <el-date-picker
            v-model="timeRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            @change="onTimeRangeChange"
          />
        </div>
        <div class="quick-filters">
          <span class="filter-label">快速选择：</span>
          <el-button-group>
            <el-button
              :type="quickTimeFilter === 'today' ? 'primary' : ''"
              size="small"
              @click="setQuickTime('today')"
            >
              今天
            </el-button>
            <el-button
              :type="quickTimeFilter === 'week' ? 'primary' : ''"
              size="small"
              @click="setQuickTime('week')"
            >
              本周
            </el-button>
            <el-button
              :type="quickTimeFilter === 'month' ? 'primary' : ''"
              size="small"
              @click="setQuickTime('month')"
            >
              本月
            </el-button>
            <el-button
              :type="quickTimeFilter === 'quarter' ? 'primary' : ''"
              size="small"
              @click="setQuickTime('quarter')"
            >
              本季度
            </el-button>
          </el-button-group>
        </div>
        <div class="actions">
          <el-button type="primary" @click="refreshData">
            <el-icon><Refresh /></el-icon>
            刷新数据
          </el-button>
          <el-button @click="exportReport">
            <el-icon><Download /></el-icon>
            导出报告
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 主要统计图表区域 -->
    <el-row :gutter="24" class="chart-section">
      <!-- 告警趋势图 -->
      <el-col :span="12">
        <el-card class="chart-card" shadow="hover">
          <template #header>
            <div class="chart-header">
              <span class="chart-title">告警趋势分析</span>
              <el-select
                v-model="trendGranularity"
                size="small"
                style="width: 100px;"
                @change="loadTrendData"
              >
                <el-option label="按天" value="day" />
                <el-option label="按小时" value="hour" />
              </el-select>
            </div>
          </template>
          <div class="chart-container" id="alarmTrendChart">
            <div class="chart-placeholder">
              <el-icon class="chart-icon"><TrendCharts /></el-icon>
              <p>告警趋势图表</p>
              <small>集成图表库（如 ECharts）显示告警趋势</small>
              <div class="trend-data">
                <el-table :data="trendData" size="small">
                  <el-table-column prop="date" label="日期" width="120" />
                  <el-table-column prop="count" label="告警数量" width="80" />
                  <el-table-column prop="trend" label="趋势" width="80">
                    <template #default="scope">
                      <el-tag
                        :type="scope.row.trend === '上升' ? 'danger' : 'success'"
                        size="small"
                      >
                        {{ scope.row.trend }}
                      </el-tag>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 告警类型分布 -->
      <el-col :span="12">
        <el-card class="chart-card" shadow="hover">
          <template #header>
            <div class="chart-header">
              <span class="chart-title">告警类型分布</span>
              <el-button type="text" size="small" @click="viewTypeDetails">详细分析</el-button>
            </div>
          </template>
          <div class="chart-container" id="alarmTypeChart">
            <div class="chart-placeholder">
              <el-icon class="chart-icon"><PieChart /></el-icon>
              <p>告警类型分布图</p>
              <small>集成图表库（如 ECharts）显示类型分布</small>
              <div class="type-statistics">
                <div
                  v-for="(item, index) in typeStatistics"
                  :key="index"
                  class="type-item"
                >
                  <div class="type-indicator" :style="{ backgroundColor: getTypeColor(index) }"></div>
                  <div class="type-info">
                    <div class="type-name">{{ item.type }}</div>
                    <div class="type-stats">
                      <span class="type-count">{{ item.count }}</span>
                      <span class="type-percentage">{{ (item.percentage * 100).toFixed(1) }}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 多维度统计 -->
    <el-row :gutter="24" class="multi-dimension-section">
      <!-- 按位置统计 -->
      <el-col :span="8">
        <el-card class="dimension-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span class="card-title">按位置统计</span>
              <el-button type="text" size="small" @click="exportLocationData">导出</el-button>
            </div>
          </template>
          <div class="dimension-list">
            <div
              v-for="(item, index) in locationStatistics"
              :key="index"
              class="dimension-item"
            >
              <div class="item-name">{{ item.location }}</div>
              <div class="item-progress">
                <el-progress
                  :percentage="item.percentage * 100"
                  :color="getDimensionColor(index)"
                  :show-text="false"
                  :stroke-width="8"
                />
              </div>
              <div class="item-count">{{ item.count }}</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 按时间段统计 -->
      <el-col :span="8">
        <el-card class="dimension-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span class="card-title">按时间段统计</span>
              <el-button type="text" size="small" @click="exportTimeData">导出</el-button>
            </div>
          </template>
          <div class="dimension-list">
            <div
              v-for="(item, index) in timeStatistics"
              :key="index"
              class="dimension-item"
            >
              <div class="item-name">{{ item.hour }}</div>
              <div class="item-progress">
                <el-progress
                  :percentage="(item.count / maxTimeCount) * 100"
                  :color="getDimensionColor(index)"
                  :show-text="false"
                  :stroke-width="8"
                />
              </div>
              <div class="item-count">{{ item.count }}</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 按设备统计 -->
      <el-col :span="8">
        <el-card class="dimension-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span class="card-title">按设备统计</span>
              <el-button type="text" size="small" @click="exportDeviceData">导出</el-button>
            </div>
          </template>
          <div class="dimension-list">
            <div
              v-for="(item, index) in deviceStatistics"
              :key="index"
              class="dimension-item"
            >
              <div class="item-name">{{ item.device_name }}</div>
              <div class="item-progress">
                <el-progress
                  :percentage="(item.count / maxDeviceCount) * 100"
                  :color="getDimensionColor(index)"
                  :show-text="false"
                  :stroke-width="8"
                />
              </div>
              <div class="item-count">{{ item.count }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 详细数据表格 -->
    <el-card class="data-table-card">
      <template #header>
        <div class="table-header">
          <span class="table-title">详细统计数据</span>
          <div class="table-controls">
            <el-select
              v-model="selectedDimension"
              placeholder="选择统计维度"
              style="width: 150px; margin-right: 8px;"
              @change="loadDetailData"
            >
              <el-option label="按告警类型" value="type" />
              <el-option label="按位置" value="location" />
              <el-option label="按时间" value="time" />
              <el-option label="按设备" value="device" />
            </el-select>
            <el-button type="primary" size="small" @click="exportDetailData">
              <el-icon><Download /></el-icon>
              导出数据
            </el-button>
          </div>
        </div>
      </template>
      <el-table :data="detailTableData" v-loading="tableLoading" style="width: 100%">
        <el-table-column prop="dimension" :label="getDimensionLabel()" width="200" />
        <el-table-column prop="count" label="告警数量" width="120" sortable />
        <el-table-column prop="percentage" label="占比" width="100">
          <template #default="scope">
            {{ (scope.row.percentage * 100).toFixed(1) }}%
          </template>
        </el-table-column>
        <el-table-column prop="avg_per_day" label="日均数量" width="120" sortable />
        <el-table-column prop="max_day" label="最高峰日期" width="150" />
        <el-table-column prop="trend" label="趋势" width="100">
          <template #default="scope">
            <el-tag
              :type="scope.row.trend === '上升' ? 'danger' : scope.row.trend === '下降' ? 'success' : 'info'"
              size="small"
            >
              {{ scope.row.trend }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="备注" min-width="200" />
      </el-table>
    </el-card>

    <!-- 导出报告弹窗 -->
    <el-dialog
      v-model="exportDialogVisible"
      title="导出统计报告"
      width="500px"
    >
      <el-form :model="exportForm" label-width="100px">
        <el-form-item label="报告类型">
          <el-select v-model="exportForm.report_type" placeholder="请选择报告类型">
            <el-option label="综合报告" value="comprehensive" />
            <el-option label="告警分析" value="alarm_analysis" />
            <el-option label="设备统计" value="device_stats" />
            <el-option label="趋势分析" value="trend_analysis" />
          </el-select>
        </el-form-item>
        <el-form-item label="导出格式">
          <el-radio-group v-model="exportForm.export_format">
            <el-radio label="excel">Excel</el-radio>
            <el-radio label="pdf">PDF</el-radio>
            <el-radio label="csv">CSV</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="包含图表">
          <el-switch v-model="exportForm.include_charts" />
        </el-form-item>
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="exportForm.timeRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="exportDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmExport" :loading="exportLoading">
            开始导出
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="StatisticsAnalysis">
import { ref, reactive, computed, onMounted } from 'vue'
// import { statisticsApi } from '@/api/statistics'
import { ElMessage } from 'element-plus'
import { 
  DataAnalysis, 
  Compass, 
  Warning, 
  TrendCharts, 
  PieChart, 
  Refresh, 
  Download 
} from '@element-plus/icons-vue'

const loading = ref(false)
const tableLoading = ref(false)
const exportDialogVisible = ref(false)
const exportLoading = ref(false)
const timeRange = ref([])
const quickTimeFilter = ref('week')
const trendGranularity = ref('day')
const selectedDimension = ref('type')

// 统计概览数据
const overviewData = reactive({
  total_devices: 30,
  online_devices: 28,
  total_alarms_today: 15,
  processed_alarms_today: 12,
  detection_accuracy: 92.0,
  system_uptime: '99.8%'
})

// 趋势数据
const trendData = ref([
  { date: '01-15', count: 23, trend: '下降' },
  { date: '01-16', count: 18, trend: '下降' },
  { date: '01-17', count: 31, trend: '上升' },
  { date: '01-18', count: 25, trend: '下降' },
  { date: '01-19', count: 19, trend: '下降' },
  { date: '01-20', count: 15, trend: '下降' }
])

// 告警类型统计
const typeStatistics = ref([
  { type: '异常行为', count: 45, percentage: 0.35 },
  { type: '车辆违规', count: 32, percentage: 0.25 },
  { type: '人员闯入', count: 28, percentage: 0.22 },
  { type: '区域入侵', count: 23, percentage: 0.18 }
])

// 位置统计
const locationStatistics = ref([
  { location: '前门', count: 38, percentage: 0.30 },
  { location: '后门', count: 25, percentage: 0.20 },
  { location: '侧门', count: 22, percentage: 0.17 },
  { location: '皮带头部', count: 20, percentage: 0.16 },
  { location: '皮带尾部', count: 23, percentage: 0.17 }
])

// 时间统计
const timeStatistics = ref([
  { hour: '08:00-09:00', count: 12 },
  { hour: '14:00-15:00', count: 18 },
  { hour: '20:00-21:00', count: 8 },
  { hour: '02:00-03:00', count: 3 },
  { hour: '10:00-11:00', count: 15 }
])

// 设备统计
const deviceStatistics = ref([
  { device_name: '前门摄像头', count: 25 },
  { device_name: '后门摄像头', count: 18 },
  { device_name: '皮带头部摄像头', count: 22 },
  { device_name: '皮带尾部摄像头', count: 20 },
  { device_name: '侧门摄像头', count: 16 }
])

// 详细表格数据
const detailTableData = ref([])

// 导出表单
const exportForm = reactive({
  report_type: 'comprehensive',
  export_format: 'excel',
  include_charts: true,
  timeRange: []
})

// 计算最大值用于进度条
const maxTimeCount = computed(() => {
  return Math.max(...timeStatistics.value.map(item => item.count))
})

const maxDeviceCount = computed(() => {
  return Math.max(...deviceStatistics.value.map(item => item.count))
})

// 获取类型颜色
const getTypeColor = (index) => {
  const colors = ['#f56c6c', '#e6a23c', '#67c23a', '#409eff', '#909399']
  return colors[index % colors.length]
}

// 获取维度颜色
const getDimensionColor = (index) => {
  const colors = ['#409eff', '#67c23a', '#e6a23c', '#f56c6c', '#909399']
  return colors[index % colors.length]
}

// 获取维度标签
const getDimensionLabel = () => {
  const labels = {
    'type': '告警类型',
    'location': '位置',
    'time': '时间段',
    'device': '设备名称'
  }
  return labels[selectedDimension.value] || '维度'
}

// 设置快速时间筛选
const setQuickTime = (period) => {
  quickTimeFilter.value = period
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  
  switch (period) {
    case 'today': {
      timeRange.value = [
        today.toISOString().split('T')[0],
        today.toISOString().split('T')[0]
      ]
      break
    }
    case 'week': {
      const weekStart = new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000)
      timeRange.value = [
        weekStart.toISOString().split('T')[0],
        today.toISOString().split('T')[0]
      ]
      break
    }
    case 'month': {
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
      timeRange.value = [
        monthStart.toISOString().split('T')[0],
        today.toISOString().split('T')[0]
      ]
      break
    }
    case 'quarter': {
      const quarterStart = new Date(today.getFullYear(), Math.floor(today.getMonth() / 3) * 3, 1)
      timeRange.value = [
        quarterStart.toISOString().split('T')[0],
        today.toISOString().split('T')[0]
      ]
      break
    }
  }
  
  refreshData()
}

// 时间范围改变
const onTimeRangeChange = () => {
  if (timeRange.value && timeRange.value.length === 2) {
    refreshData()
  }
}

// 加载趋势数据
const loadTrendData = async () => {
  try {
    // TODO: 调用实际的API
    // const response = await statisticsApi.getAlarmTrend({
    //   start_date: timeRange.value[0],
    //   end_date: timeRange.value[1],
    //   granularity: trendGranularity.value
    // })
    ElMessage.success('趋势数据已更新')
  } catch (error) {
    ElMessage.error('加载趋势数据失败')
  }
}

// 加载详细数据
const loadDetailData = async () => {
  tableLoading.value = true
  try {
    // TODO: 调用实际的API
    // const response = await statisticsApi.getMultiDimensionAlarm({
    //   dimensions: selectedDimension.value,
    //   start_date: timeRange.value[0],
    //   end_date: timeRange.value[1]
    // })
    
    // 模拟数据
    const mockData = {
      'type': [
        {
          dimension: '异常行为',
          count: 45,
          percentage: 0.35,
          avg_per_day: 6.4,
          max_day: '2024-01-17',
          trend: '下降',
          description: '主要发生在工作时间，需重点关注'
        },
        {
          dimension: '车辆违规',
          count: 32,
          percentage: 0.25,
          avg_per_day: 4.6,
          max_day: '2024-01-15',
          trend: '稳定',
          description: '多发生在出入口区域'
        }
      ],
      'location': [
        {
          dimension: '前门',
          count: 38,
          percentage: 0.30,
          avg_per_day: 5.4,
          max_day: '2024-01-16',
          trend: '上升',
          description: '人流量大，告警频发'
        }
      ]
    }
    
    detailTableData.value = mockData[selectedDimension.value] || []
  } catch (error) {
    ElMessage.error('加载详细数据失败')
  } finally {
    tableLoading.value = false
  }
}

// 刷新数据
const refreshData = async () => {
  loading.value = true
  try {
    // TODO: 调用实际的API加载所有数据
    await Promise.all([
      loadTrendData(),
      loadDetailData()
    ])
    ElMessage.success('数据已刷新')
  } catch (error) {
    ElMessage.error('刷新数据失败')
  } finally {
    loading.value = false
  }
}

// 查看类型详情
const viewTypeDetails = () => {
  selectedDimension.value = 'type'
  loadDetailData()
}

// 导出报告
const exportReport = () => {
  exportForm.timeRange = timeRange.value
  exportDialogVisible.value = true
}

// 确认导出
const confirmExport = async () => {
  exportLoading.value = true
  try {
    // TODO: 调用实际的导出API
    // await statisticsApi.exportReport({
    //   report_type: exportForm.report_type,
    //   start_date: exportForm.timeRange[0],
    //   end_date: exportForm.timeRange[1],
    //   export_format: exportForm.export_format,
    //   include_charts: exportForm.include_charts
    // })
    
    // 模拟导出
    setTimeout(() => {
      ElMessage.success('报告导出成功，请查看下载文件')
      exportDialogVisible.value = false
      exportLoading.value = false
    }, 2000)
  } catch (error) {
    ElMessage.error('导出失败')
    exportLoading.value = false
  }
}

// 导出位置数据
const exportLocationData = () => {
  ElMessage.info('导出位置统计数据')
}

// 导出时间数据
const exportTimeData = () => {
  ElMessage.info('导出时间统计数据')
}

// 导出设备数据
const exportDeviceData = () => {
  ElMessage.info('导出设备统计数据')
}

// 导出详细数据
const exportDetailData = () => {
  ElMessage.info('导出详细统计数据')
}

onMounted(() => {
  // 初始化本周数据
  setQuickTime('week')
})
</script>

<style scoped>
.statistics-analysis {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 60px);
}

.overview-section {
  margin-bottom: 24px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  align-items: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
}

.stat-card.primary {
  border-left: 4px solid #409eff;
}

.stat-card.success {
  border-left: 4px solid #67c23a;
}

.stat-card.warning {
  border-left: 4px solid #e6a23c;
}

.stat-card.info {
  border-left: 4px solid #909399;
}

.stat-icon {
  font-size: 48px;
  margin-right: 20px;
  opacity: 0.8;
  color: #409eff;
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 32px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 16px;
  color: #606266;
  margin-bottom: 4px;
}

.stat-change {
  font-size: 14px;
  font-weight: 500;
}

.stat-change.positive {
  color: #67c23a;
}

.stat-change.negative {
  color: #f56c6c;
}

.filter-card {
  margin-bottom: 24px;
}

.filter-controls {
  display: flex;
  align-items: center;
  gap: 24px;
  flex-wrap: wrap;
}

.filter-label {
  font-weight: 500;
  color: #606266;
  white-space: nowrap;
}

.actions {
  margin-left: auto;
  display: flex;
  gap: 8px;
}

.chart-section {
  margin-bottom: 24px;
}

.chart-card {
  margin-bottom: 24px;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart-title {
  font-size: 16px;
  font-weight: bold;
  color: #303133;
}

.chart-container {
  height: 350px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}

.chart-placeholder {
  text-align: center;
  color: #909399;
  width: 100%;
}

.chart-icon {
  font-size: 48px;
  margin-bottom: 16px;
  color: #c0c4cc;
}

.trend-data {
  margin-top: 20px;
  max-height: 200px;
  overflow-y: auto;
}

.type-statistics {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 20px;
}

.type-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  border-radius: 6px;
  background: #f8f9fa;
}

.type-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.type-info {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.type-name {
  font-weight: 500;
  color: #303133;
}

.type-stats {
  display: flex;
  gap: 8px;
}

.type-count {
  font-weight: bold;
  color: #409eff;
}

.type-percentage {
  color: #909399;
  font-size: 12px;
}

.multi-dimension-section {
  margin-bottom: 24px;
}

.dimension-card {
  height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  font-size: 14px;
  font-weight: bold;
  color: #303133;
}

.dimension-list {
  max-height: 300px;
  overflow-y: auto;
}

.dimension-item {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.dimension-item:last-child {
  border-bottom: none;
}

.item-name {
  width: 120px;
  font-size: 14px;
  color: #303133;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-progress {
  flex: 1;
  margin: 0 12px;
}

.item-count {
  width: 40px;
  text-align: right;
  font-weight: bold;
  color: #409eff;
}

.data-table-card {
  margin-bottom: 24px;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.table-title {
  font-size: 16px;
  font-weight: bold;
  color: #303133;
}

.table-controls {
  display: flex;
  align-items: center;
}

.dialog-footer {
  text-align: right;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .filter-controls {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .actions {
    margin-left: 0;
  }
}

@media (max-width: 768px) {
  .overview-section .el-col {
    margin-bottom: 16px;
  }
  
  .chart-section .el-col,
  .multi-dimension-section .el-col {
    margin-bottom: 16px;
  }
  
  .stat-card {
    flex-direction: column;
    text-align: center;
  }
  
  .stat-icon {
    margin-right: 0;
    margin-bottom: 16px;
  }
}
</style>