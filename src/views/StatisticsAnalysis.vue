<template>
  <div class="statistics-analysis">
    <!-- 统计概览 -->
    <div class="overview-section">
      <el-row :gutter="24">
        <el-col :span="6">
          <div class="stat-card tech-card primary">
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
          <div class="stat-card tech-card success">
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
          <div class="stat-card tech-card warning">
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
          <div class="stat-card tech-card info">
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
          <div class="auto-refresh">
            <span class="filter-label">自动刷新：</span>
            <el-switch 
              v-model="autoRefreshEnabled" 
              @change="toggleAutoRefresh"
              active-text=""
              inactive-text=""
            />
          </div>
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
        <el-card class="chart-card tech-card" shadow="hover">
          <template #header>
            <div class="chart-header">
              <span class="chart-title">告警趋势分析</span>
            </div>
          </template>
          <div class="chart-container" id="alarmTrendChart">
            <div class="chart-placeholder">
              <el-icon class="chart-icon"><TrendCharts /></el-icon>
              <p>告警趋势图表</p>
              
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 告警类型分布 -->
      <el-col :span="12">
        <el-card class="chart-card tech-card" shadow="hover">
          <template #header>
            <div class="chart-header">
              <span class="chart-title">告警类型分布</span>
            </div>
          </template>
          <div class="chart-container" id="alarmTypeChart">
            <div class="chart-placeholder">
              <el-icon class="chart-icon"><PieChart /></el-icon>
              <p>告警类型分布图</p>
              
              <div class="type-statistics">
                <div
                  v-for="(item, index) in typeStatistics"
                  :key="index"
                  class="type-item"
                  @click="viewTypeDetails(item.type)"
                >
                  <div class="type-indicator" :style="{ backgroundColor: getTypeColor(index) }"></div>
                  <div class="type-info">
                    <div class="type-name">{{ item.type }}</div>
                    <div class="type-stats">
                      <span class="type-count">{{ item.count }}</span>
                      <span class="type-percentage">{{ (item.percentage * 100).toFixed(1) }}%</span>
                    </div>
                  </div>
                  <div class="type-actions">
                    <el-icon class="action-icon"><ArrowRight /></el-icon>
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
              class="dimension-item device-item"
            >
              <div class="item-info">
                <div class="item-name">{{ item.device_name }}</div>
                <div class="item-status">
                  <el-tag
                    :type="item.status === 'online' ? 'success' : item.status === 'warning' ? 'warning' : 'danger'"
                    size="small"
                  >
                    {{ item.status === 'online' ? '在线' : item.status === 'warning' ? '警告' : '离线' }}
                  </el-tag>
                  <span class="last-update">{{ item.lastUpdate }}</span>
                </div>
              </div>
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
import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue'
import { statisticsApi } from '@/api/statistics'
import { ElMessage } from 'element-plus'
import { 
  DataAnalysis, 
  Compass, 
  Warning, 
  TrendCharts, 
  PieChart, 
  Refresh, 
  Download,
  ArrowRight 
} from '@element-plus/icons-vue'

const loading = ref(false)
const tableLoading = ref(false)
const exportDialogVisible = ref(false)
const exportLoading = ref(false)
const timeRange = ref([])
const quickTimeFilter = ref('week')
const trendGranularity = ref('day')
const selectedDimension = ref('type')
const autoRefreshEnabled = ref(true)
const refreshInterval = ref(null)

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
  { device_name: '前门摄像头', count: 25, status: 'online', lastUpdate: '2分钟前' },
  { device_name: '后门摄像头', count: 18, status: 'online', lastUpdate: '1分钟前' },
  { device_name: '皮带头部摄像头', count: 22, status: 'warning', lastUpdate: '5分钟前' },
  { device_name: '皮带尾部摄像头', count: 20, status: 'online', lastUpdate: '3分钟前' },
  { device_name: '侧门摄像头', count: 16, status: 'offline', lastUpdate: '15分钟前' }
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
    // 根据时间粒度生成模拟数据
    const generateTrendData = () => {
      const data = []
      const now = new Date()
      const count = trendGranularity.value === 'hour' ? 24 : 
                   trendGranularity.value === 'day' ? 7 : 
                   trendGranularity.value === 'week' ? 4 : 12
      
      for (let i = count - 1; i >= 0; i--) {
        let date = ''
        const baseCount = Math.floor(Math.random() * 30) + 10
        
        if (trendGranularity.value === 'hour') {
          const hour = new Date(now.getTime() - i * 60 * 60 * 1000)
          date = hour.getHours().toString().padStart(2, '0') + ':00'
        } else if (trendGranularity.value === 'day') {
          const day = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
          date = (day.getMonth() + 1).toString().padStart(2, '0') + '-' + day.getDate().toString().padStart(2, '0')
        } else if (trendGranularity.value === 'week') {
          date = `第${count - i}周`
        } else {
          const month = new Date(now.getFullYear(), now.getMonth() - i, 1)
          date = (month.getMonth() + 1).toString().padStart(2, '0') + '月'
        }
        
        data.push({
          date,
          count: baseCount,
          trend: Math.random() > 0.5 ? '上升' : '下降'
        })
      }
      return data
    }
    
    trendData.value = generateTrendData()
    
    // TODO: 调用实际的API
    // const response = await statisticsApi.getAlarmTrend({
    //   start_date: timeRange.value[0],
    //   end_date: timeRange.value[1],
    //   granularity: trendGranularity.value
    // })
    // trendData.value = response.body.trend_data
    
    ElMessage.success(`已切换到按${trendGranularity.value === 'hour' ? '小时' : trendGranularity.value === 'day' ? '天' : trendGranularity.value === 'week' ? '周' : '月'}显示的趋势数据`)
  } catch (error) {
    ElMessage.error('加载趋势数据失败')
  }
}

// 加载详细数据
const loadDetailData = async () => {
  tableLoading.value = true
  try {
    const response = await statisticsApi.getMultiDimensionAlarm({
      dimensions: selectedDimension.value,
      start_date: timeRange.value[0],
      end_date: timeRange.value[1]
    })
    
    const dimensionKey = `by_${selectedDimension.value}`
    detailTableData.value = response.body[dimensionKey] || []
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
const viewTypeDetails = (type = null) => {
  selectedDimension.value = 'type'
  if (type) {
    ElMessage.info(`正在查看 "${type}" 的详细信息`)
  }
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

// 切换自动刷新
const toggleAutoRefresh = (enabled) => {
  if (enabled) {
    startAutoRefresh()
    ElMessage.success('已开启自动刷新，每30秒更新一次数据')
  } else {
    stopAutoRefresh()
    ElMessage.info('已关闭自动刷新')
  }
}

// 开始自动刷新
const startAutoRefresh = () => {
  stopAutoRefresh() // 确保没有重复的定时器
  refreshInterval.value = setInterval(() => {
    refreshData()
  }, 30000) // 30秒刷新一次
}

// 停止自动刷新
const stopAutoRefresh = () => {
  if (refreshInterval.value) {
    clearInterval(refreshInterval.value)
    refreshInterval.value = null
  }
}

// 组件卸载时清理定时器
onBeforeUnmount(() => {
  stopAutoRefresh()
})

onMounted(() => {
  // 初始化本周数据
  setQuickTime('week')
  // 如果自动刷新已启用，开始自动刷新
  if (autoRefreshEnabled.value) {
    startAutoRefresh()
  }
})
</script>

<style scoped>
.statistics-analysis {
  padding: 20px;
  background: transparent;
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
  min-height: calc(100vh - 60px);
}

.overview-section {
  margin-bottom: 24px;
}

.stat-card {
  background: rgba(20, 30, 50, 0.6) !important;
  border: 1px solid rgba(0, 255, 255, 0.2) !important;
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
  align-items: center;
  gap: 16px;
}

.auto-refresh {
  display: flex;
  align-items: center;
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

.chart-controls {
  display: flex;
  align-items: center;
  gap: 8px;
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
  background: rgba(15, 25, 45, 0.6) !important;
  border: 1px solid rgba(0, 255, 255, 0.2) !important;
  border-radius: 8px;
  backdrop-filter: blur(5px) !important;
}

.chart-placeholder {
  text-align: center;
  color: #ffffff !important;
  width: 100%;
}

.chart-icon {
  font-size: 48px;
  color: rgba(0, 255, 255, 0.7) !important;
  margin-bottom: 16px;
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
  background: rgba(20, 30, 50, 0.6) !important;
  border: 1px solid rgba(0, 255, 255, 0.2) !important;
  color: #ffffff !important;
  cursor: pointer;
  transition: all 0.3s ease;
}

.type-item:hover {
  background: rgba(0, 255, 255, 0.1) !important;
  border-color: rgba(0, 255, 255, 0.4) !important;
  transform: translateX(4px);
}

.type-actions {
  margin-left: auto;
}

.action-icon {
  color: rgba(0, 255, 255, 0.7) !important;
  transition: all 0.3s ease;
}

.type-item:hover .action-icon {
  color: #00ffff !important;
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

.device-item {
  flex-direction: column;
  align-items: stretch;
  gap: 8px;
  padding: 12px;
  border-radius: 8px;
  background: rgba(20, 30, 50, 0.4) !important;
  border: 1px solid rgba(0, 255, 255, 0.15) !important;
  margin-bottom: 8px;
}

.device-item:last-child {
  margin-bottom: 0;
}

.item-info {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.item-status {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.last-update {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5) !important;
}

.device-item .item-progress {
  margin: 0;
}

.device-item .item-count {
  align-self: flex-end;
  margin-top: 4px;
}

.item-name {
  width: 120px;
  font-size: 14px;
  color: #303133;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.device-item .item-name {
  width: auto;
  color: rgba(255, 255, 255, 0.9) !important;
  font-weight: 500;
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

/* Element Plus 组件深色主题 */
/* 表单标签 */
:deep(.el-form-item__label) {
  color: #ffffff !important;
  font-weight: 500 !important;
}

/* 输入框 */
:deep(.el-input__wrapper) {
  background: rgba(20, 30, 50, 0.6) !important;
  border: 1px solid rgba(0, 255, 255, 0.2) !important;
  border-radius: 6px !important;
  box-shadow: none !important;
}

:deep(.el-input__wrapper:hover) {
  border-color: rgba(0, 255, 255, 0.4) !important;
  box-shadow: 0 0 8px rgba(0, 255, 255, 0.2) !important;
}

:deep(.el-input__wrapper.is-focus) {
  border-color: #00ffff !important;
  box-shadow: 0 0 12px rgba(0, 255, 255, 0.3) !important;
}

:deep(.el-input__inner) {
  color: #ffffff !important;
  background: transparent !important;
}

:deep(.el-input__inner::placeholder) {
  color: rgba(255, 255, 255, 0.5) !important;
}

/* 选择器 */
:deep(.el-select .el-input__wrapper) {
  background: rgba(20, 30, 50, 0.6) !important;
  border: 1px solid rgba(0, 255, 255, 0.2) !important;
  border-radius: 6px !important;
}

:deep(.el-select .el-input__inner) {
  color: #ffffff !important;
}

:deep(.el-select .el-input__suffix) {
  color: rgba(0, 255, 255, 0.7) !important;
}

/* 选择器下拉面板 */
:deep(.el-select-dropdown) {
  background: linear-gradient(135deg,
    rgba(15, 25, 45, 0.95) 0%,
    rgba(20, 30, 50, 0.95) 100%) !important;
  border: 1px solid rgba(0, 255, 255, 0.3) !important;
  border-radius: 8px !important;
  backdrop-filter: blur(10px) !important;
  box-shadow: 
    0 20px 60px rgba(0, 0, 0, 0.5),
    0 0 40px rgba(0, 255, 255, 0.2) !important;
}

:deep(.el-select-dropdown__item) {
  background: transparent !important;
  color: #ffffff !important;
  transition: all 0.3s ease !important;
}

:deep(.el-select-dropdown__item:hover) {
  background: rgba(0, 255, 255, 0.2) !important;
  color: #00ffff !important;
}

:deep(.el-select-dropdown__item.is-selected) {
  background: rgba(0, 255, 255, 0.3) !important;
  color: #00ffff !important;
  font-weight: 600 !important;
}

/* 日期选择器 */
:deep(.el-date-editor) {
  --el-input-bg-color: rgba(20, 30, 50, 0.6) !important;
  --el-input-border-color: rgba(0, 255, 255, 0.2) !important;
  --el-input-text-color: #ffffff !important;
  --el-input-hover-border-color: rgba(0, 255, 255, 0.4) !important;
  --el-input-focus-border-color: #00ffff !important;
}

:deep(.el-date-editor .el-input__wrapper) {
  background: rgba(20, 30, 50, 0.6) !important;
  border: 1px solid rgba(0, 255, 255, 0.2) !important;
}

/* 按钮 */
:deep(.el-button) {
  --el-button-bg-color: rgba(20, 30, 50, 0.8) !important;
  --el-button-border-color: rgba(0, 255, 255, 0.3) !important;
  --el-button-text-color: #ffffff !important;
  --el-button-hover-bg-color: rgba(0, 255, 255, 0.2) !important;
  --el-button-hover-border-color: #00ffff !important;
  --el-button-hover-text-color: #00ffff !important;
}

:deep(.el-button--primary) {
  --el-button-bg-color: linear-gradient(135deg, rgba(0, 255, 255, 0.3), rgba(0, 200, 255, 0.3)) !important;
  --el-button-border-color: #00ffff !important;
  --el-button-text-color: #00ffff !important;
  --el-button-hover-bg-color: linear-gradient(135deg, rgba(0, 255, 255, 0.5), rgba(0, 200, 255, 0.5)) !important;
}

/* 卡片组件 */
:deep(.el-card) {
  background: rgba(15, 25, 45, 0.95) !important;
  border: 1px solid rgba(0, 255, 255, 0.2) !important;
  border-radius: 12px !important;
  backdrop-filter: blur(10px) !important;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.3),
    0 0 20px rgba(0, 255, 255, 0.1) !important;
}

:deep(.el-card__header) {
  background: rgba(20, 30, 50, 0.8) !important;
  border-bottom: 1px solid rgba(0, 255, 255, 0.2) !important;
  color: #00ffff !important;
  font-weight: 600 !important;
}

:deep(.el-card__body) {
  background: transparent !important;
  color: rgba(255, 255, 255, 0.9) !important;
}

/* 文字颜色修正 */
.chart-title,
.section-title,
.card-title {
  color: #00ffff !important;
  text-shadow: 0 0 10px rgba(0, 255, 255, 0.5) !important;
}

.chart-placeholder p,
.chart-placeholder span {
  color: rgba(255, 255, 255, 0.7) !important;
}
</style>