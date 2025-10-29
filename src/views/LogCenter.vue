<template>
  <div class="log-center tech-page-container">
    <!-- 科技感背景 -->
    <div class="tech-background"></div>
    
    <h2>系统操作日志</h2>
    
    <el-card class="tech-card">
      <template #header>
        <div class="card-header">
          <div class="header-actions">
            <el-button type="primary" @click="exportLogs">
              <el-icon><Download /></el-icon>
              导出日志
            </el-button>
            <el-button @click="refreshLogs">
              <el-icon><Refresh /></el-icon>
              刷新
            </el-button>
          </div>
        </div>
      </template>

      <!-- 搜索筛选栏 -->
      <div class="search-filters-card">
        <div class="search-filters-header">
          <span class="filter-title">搜索筛选</span>
        </div>
        <div class="search-filters-content">
          <div class="filter-row">
            <div class="filter-item">
              <label for="timeRange">时间范围</label>
            <el-date-picker
              v-model="searchForm.timeRange"
                id="timeRange"
              type="datetimerange"
              range-separator="至"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
              format="YYYY-MM-DD HH:mm:ss"
              value-format="YYYY-MM-DD HH:mm:ss"
                class="tech-input"
                style="width: 100%;"
              />
                </div>
            <div class="filter-item">
              <label for="logLevel">日志级别</label>
              <el-select
                v-model="searchForm.log_level"
                id="logLevel"
                placeholder="全部"
                class="tech-select"
                clearable
                @change="handleSearch"
              >
                <el-option label="全部" value="" />
                <el-option label="INFO" value="INFO" />
                <el-option label="WARN" value="WARN" />
                <el-option label="ERROR" value="ERROR" />
                <el-option label="DEBUG" value="DEBUG" />
              </el-select>
                </div>
            <div class="filter-item">
              <label for="module">功能模块</label>
              <el-select
                v-model="searchForm.module"
                id="module"
                placeholder="全部"
                class="tech-select"
                clearable
                @change="handleSearch"
              >
                <el-option label="全部" value="" />
                <el-option label="用户管理" value="UserManagement" />
                <el-option label="设备管理" value="DeviceManagement" />
                <el-option label="算法配置" value="AlgorithmConfig" />
                <el-option label="实时检测" value="Detection" />
                <el-option label="事件中心" value="EventCenter" />
                <el-option label="系统配置" value="SystemConfig" />
                <el-option label="录像管理" value="RecordingManagement" />
                <el-option label="统计分析" value="StatisticsAnalysis" />
              </el-select>
                </div>
            <div class="filter-item">
              <label for="username">用户名</label>
            <el-input 
              v-model="searchForm.username" 
                id="username"
              placeholder="请输入用户名" 
              clearable 
                class="tech-input"
              />
                </div>
            <div class="filter-actions">
              <el-button type="primary" @click="handleSearch" class="tech-button-sm">搜索</el-button>
              <el-button @click="resetSearch" class="tech-button-sm">重置</el-button>
              </div>
                </div>
                </div>
      </div>

      <!-- 快速筛选 -->
      <div class="quick-filters">
        <span class="filter-label">快速筛选：</span>
        <el-button-group>
          <el-button
            :type="quickFilter === 'all' ? 'primary' : ''"
            size="small"
            @click="setQuickFilter('all')"
          >
            全部日志
          </el-button>
          <el-button
            :type="quickFilter === 'today' ? 'primary' : ''"
            size="small"
            @click="setQuickFilter('today')"
          >
            今日日志
          </el-button>
          <el-button
            :type="quickFilter === 'error' ? 'primary' : ''"
            size="small"
            @click="setQuickFilter('error')"
          >
            错误日志
          </el-button>
          <el-button
            :type="quickFilter === 'login' ? 'primary' : ''"
            size="small"
            @click="setQuickFilter('login')"
          >
            登录日志
          </el-button>
        </el-button-group>
      </div>

      <!-- 日志统计信息 -->
      <div class="log-stats">
        <el-row :gutter="16">
          <el-col :span="6">
            <div class="stat-item">
              <div class="stat-number">{{ logStats.total_logs }}</div>
              <div class="stat-label">总日志数</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-item">
              <div class="stat-number success">{{ logStats.success_count }}</div>
              <div class="stat-label">成功操作</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-item">
              <div class="stat-number error">{{ logStats.error_count }}</div>
              <div class="stat-label">错误操作</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-item">
              <div class="stat-number warning">{{ logStats.today_count }}</div>
              <div class="stat-label">今日日志</div>
            </div>
          </el-col>
        </el-row>
      </div>

      <!-- 日志列表 -->
      <div class="tech-table" style="border: none !important; outline: none !important; box-shadow: none !important;">
      <el-table 
        v-loading="loading" 
        :data="logList" 
        style="width: 100%; border: none !important; outline: none !important; box-shadow: none !important;"
        :row-class-name="getRowClassName"
        :border="false"
        :show-overflow-tooltip="false"
      >
        <el-table-column type="expand">
          <template #default="props">
            <div class="log-detail-expand">
              <el-descriptions :column="2" border>
                <el-descriptions-item label="日志ID">{{ props.row.id }}</el-descriptions-item>
                <el-descriptions-item label="IP地址">{{ props.row.ip_address }}</el-descriptions-item>
                <el-descriptions-item label="用户ID">{{ props.row.user_id }}</el-descriptions-item>
                <el-descriptions-item label="功能模块">{{ props.row.module }}</el-descriptions-item>
                <el-descriptions-item label="详细描述" :span="2">
                  {{ props.row.details }}
                </el-descriptions-item>
              </el-descriptions>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="timestamp" label="时间" width="180" sortable />
        <el-table-column prop="level" label="级别" width="80">
          <template #default="scope">
            <el-tag :type="getLevelType(scope.row.level)" size="small">
              {{ scope.row.level }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="module" label="模块" width="120" />
        <el-table-column prop="operation" label="操作" width="150" />
        <el-table-column prop="username" label="用户" width="100" />
        <el-table-column prop="ip_address" label="IP地址" width="120" />
        <el-table-column prop="result" label="结果" width="80">
          <template #default="scope">
            <el-tag :type="scope.row.result === '成功' ? 'success' : 'danger'" size="small">
              {{ scope.row.result }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="details" label="详情" min-width="200" show-overflow-tooltip />
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="scope">
            <el-button type="primary" size="small" @click.stop="viewLogDetail(scope.row)">
              查看详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      </div>

      <!-- 增强型分页组件 -->
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
            :disabled="pagination.page === 1"
            @click="goToPage(1)"
          >
            首页
          </el-button>
          <el-button 
            class="pagination-btn"
            size="small" 
            :disabled="pagination.page === 1"
            @click="goToPage(pagination.page - 1)"
          >
            上一页
          </el-button>
          <div class="pagination-pages">
            <button 
              v-for="page in visiblePages" 
              :key="page"
              class="page-btn"
              :class="{ active: page === pagination.page }"
              @click="goToPage(page)"
            >
              {{ page }}
            </button>
          </div>
          <el-button 
            class="pagination-btn"
            size="small" 
            :disabled="pagination.page === totalPages"
            @click="goToPage(pagination.page + 1)"
          >
            下一页
          </el-button>
          <el-button 
            class="pagination-btn"
            size="small" 
            :disabled="pagination.page === totalPages"
            @click="goToPage(totalPages)"
          >
            末页
          </el-button>
        </div>
      </div>
    </el-card>


    <!-- 导出进度弹窗 -->
    <el-dialog
      v-model="exportDialogVisible"
      title="导出日志"
      width="500px"
      :close-on-click-modal="false"
    >
      <div class="export-progress">
        <div v-if="!exportCompleted">
          <el-progress 
            :percentage="exportProgress" 
            :status="exportProgress === 100 ? 'success' : ''"
            :stroke-width="20"
          />
          <p class="progress-text">正在导出日志文件，请稍候...</p>
        </div>
        <div v-else class="export-completed">
          <el-result
            icon="success"
            title="导出完成"
            sub-title="日志文件已成功生成"
          >
            <template #extra>
              <el-button type="primary" @click="downloadExportedFile">
                <el-icon><Download /></el-icon>
                下载文件
              </el-button>
              <el-button @click="exportDialogVisible = false">关闭</el-button>
            </template>
          </el-result>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup name="LogCenter">
import { ref, reactive, computed, onMounted } from 'vue'
import { logApi } from '@/api/log'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Download, Refresh } from '@element-plus/icons-vue'

const loading = ref(false)
const exportDialogVisible = ref(false)
const exportProgress = ref(0)
const exportCompleted = ref(false)
const quickFilter = ref('all')


// 搜索表单
const searchForm = reactive({
  timeRange: [],
  log_level: '',
  module: '',
  username: '',
  result: ''
})

// 分页信息
const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0
})

// 日志统计
const logStats = reactive({
  total_logs: 1547,
  success_count: 1432,
  error_count: 89,
  today_count: 156
})

// 日志列表
const logList = ref([])

// 获取日志级别类型
const getLevelType = (level) => {
  const typeMap = {
    'INFO': 'info',
    'WARN': 'warning',
    'ERROR': 'danger',
    'DEBUG': 'success'
  }
  return typeMap[level] || 'info'
}

// 获取行样式类名
const getRowClassName = ({ row }) => {
  if (row.level === 'ERROR') return 'error-row'
  if (row.level === 'WARN') return 'warning-row'
  if (row.result === '失败') return 'failed-row'
  return ''
}

// 加载日志列表
const loadLogList = async () => {
  loading.value = true
  try {
    // TODO: 调用实际的API
    // const params = {
    //   page: pagination.page,
    //   page_size: pagination.pageSize,
    //   start_time: searchForm.timeRange[0],
    //   end_time: searchForm.timeRange[1],
    //   log_level: searchForm.log_level,
    //   module: searchForm.module,
    //   username: searchForm.username,
    //   result: searchForm.result
    // }
    // const response = await logApi.getSystemLogs(params)
    
    const params = {
      page: pagination.page,
      page_size: pagination.pageSize
    }

    // 添加搜索条件
    if (searchForm.timeRange?.[0] && searchForm.timeRange?.[1]) {
      params.start_time = searchForm.timeRange[0]
      params.end_time = searchForm.timeRange[1]
    }
    if (searchForm.level) {
      params.log_level = searchForm.level
    }
    if (searchForm.module) {
      params.module = searchForm.module
    }

    const response = await logApi.getSystemLogs(params)
    logList.value = response.body.logs
    pagination.total = response.body.total
  } catch (error) {
    console.error('加载日志列表失败:', error)
    ElMessage.error('加载日志列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  loadLogList()
}

// 重置搜索
const resetSearch = () => {
  searchForm.timeRange = []
  searchForm.log_level = ''
  searchForm.module = ''
  searchForm.username = ''
  searchForm.result = ''
  quickFilter.value = 'all'
  pagination.page = 1
  loadLogList()
}

// 快速筛选
const setQuickFilter = (filter) => {
  quickFilter.value = filter
  
  const now = new Date()
  const today = now.toISOString().split('T')[0]
  
  switch (filter) {
    case 'all':
      searchForm.timeRange = []
      searchForm.log_level = ''
      searchForm.result = ''
      break
    case 'today':
      searchForm.timeRange = [
        `${today} 00:00:00`,
        `${today} 23:59:59`
      ]
      searchForm.log_level = ''
      searchForm.result = ''
      break
    case 'error':
      searchForm.timeRange = []
      searchForm.log_level = 'ERROR'
      searchForm.result = ''
      break
    case 'login':
      searchForm.timeRange = []
      searchForm.log_level = ''
      searchForm.result = ''
      searchForm.module = 'UserManagement'
      break
  }
  
  pagination.page = 1
  loadLogList()
}

// 计算总页数
const totalPages = computed(() => {
  return Math.ceil(pagination.total / pagination.pageSize) || 1
})

// 计算可见页码
const visiblePages = computed(() => {
  const maxVisiblePages = 5
  const totalPagesValue = totalPages.value
  const currentPageValue = pagination.page
  
  let startPage = Math.max(1, currentPageValue - Math.floor(maxVisiblePages / 2))
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

// 分页大小改变
const handleSizeChange = (val) => {
  pagination.pageSize = val
  pagination.page = 1
  loadLogList()
}

// 跳转到指定页面
const goToPage = (page) => {
  if (page < 1 || page > totalPages.value || page === pagination.page) {
    return
  }
  pagination.page = page
  loadLogList()
}

// 查看日志详情
const viewLogDetail = () => {
  ElMessage.info('查看日志中')
}

// 刷新日志
const refreshLogs = () => {
  loadLogList()
}

// 导出日志
const exportLogs = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要导出当前筛选条件下的日志吗？导出可能需要一些时间。',
      '导出确认',
      {
        confirmButtonText: '确定导出',
        cancelButtonText: '取消',
        type: 'info'
      }
    )

    exportDialogVisible.value = true
    exportProgress.value = 0
    exportCompleted.value = false

    // 模拟导出进度
    const progressInterval = setInterval(() => {
      exportProgress.value += Math.random() * 30
      if (exportProgress.value >= 100) {
        exportProgress.value = 100
        clearInterval(progressInterval)
        setTimeout(() => {
          exportCompleted.value = true
        }, 500)
      }
    }, 500)

    // TODO: 调用实际的导出API
    // const params = {
    //   start_time: searchForm.timeRange[0],
    //   end_time: searchForm.timeRange[1],
    //   log_level: searchForm.log_level,
    //   module: searchForm.module,
    //   username: searchForm.username,
    //   result: searchForm.result
    // }
    // await logApi.exportLogs(params)

  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('导出失败')
    }
  }
}

// 下载导出的文件
const downloadExportedFile = () => {
  // TODO: 实现实际的文件下载
  const link = document.createElement('a')
  link.href = '/exports/system_logs_20240120.xlsx'
  link.download = `system_logs_${new Date().toISOString().split('T')[0]}.xlsx`
  link.click()
  
  ElMessage.success('开始下载日志文件')
  exportDialogVisible.value = false
}


onMounted(() => {
  loadLogList()
})
</script>

<style scoped>
/* 确保页面可以滚动 */
html, body {
  overflow: visible !important;
  height: auto !important;
}

.sub-page-content {
  overflow: visible !important;
  height: auto !important;
}

/* ==================== 科技感主题样式 ==================== */

/* 页面容器 */
.tech-page-container {
  position: relative;
  width: 100%;
  padding: 20px 20px 40px 20px;
  max-width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
  box-sizing: border-box;
  background: transparent;
}

/* 标题样式 */
.log-center h2 {
  margin: 24px 0 20px 0;
  color: #00ffff;
  font-size: 24px;
  font-weight: 600;
  text-shadow: 0 0 15px rgba(0, 255, 255, 0.6);
  position: relative;
  z-index: 10;
  flex-shrink: 0;
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

.log-center {
  position: relative;
  z-index: 10;
}

/* 科技感卡片样式 */
.tech-card {
  background: transparent !important;
  border: none !important;
  border-radius: 0 !important;
  backdrop-filter: none !important;
  box-shadow: none !important;
  flex-shrink: 0;
}

.tech-card :deep(.el-card__header) {
  background: transparent !important;
  border-bottom: none !important;
  border-radius: 0 !important;
  color: #00ffff !important;
  padding: 16px 20px !important;
}

.tech-card :deep(.el-card__body) {
  background: transparent !important;
  padding: 20px !important;
  border-radius: 0 !important;
  color: rgba(255, 255, 255, 0.9) !important;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  font-size: 18px;
  font-weight: bold;
  color: #303133;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.mb-20 {
  margin-bottom: 20px;
}

/* 搜索筛选样式 */
.search-filters-card {
  margin-bottom: 20px;
  padding: 15px;
  background: rgba(0, 255, 255, 0.03) !important;
  border: 1px solid rgba(0, 255, 255, 0.2) !important;
  border-radius: 8px !important;
  position: relative;
  z-index: 10;
  flex-shrink: 0;
}

.search-filters-header {
  margin-bottom: 15px;
  border-bottom: 1px solid rgba(0, 255, 255, 0.2);
  padding-bottom: 8px;
}

.filter-title {
  color: #00ffff;
  font-weight: bold;
  font-size: 16px;
  text-shadow: 0 0 8px rgba(0, 255, 255, 0.5);
}

.search-filters-content {
  padding: 0;
}

.filter-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr auto;
  gap: 15px;
  align-items: end;
}

.filter-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.filter-item label {
  color: #00ffff;
  font-size: 14px;
  font-weight: 500;
  text-shadow: 0 0 5px rgba(0, 255, 255, 0.3);
}

.tech-input :deep(.el-input__wrapper),
.tech-select :deep(.el-select__wrapper),
.tech-input :deep(.el-range-editor) {
  background-color: rgba(65, 75, 95, 0.85) !important;
  border: 1px solid rgba(0, 255, 255, 0.4) !important;
  border-radius: 6px !important;
  box-shadow: 0 0 8px rgba(0, 255, 255, 0.1) !important;
}

.tech-input :deep(.el-input__inner),
.tech-select :deep(.el-select__input),
.tech-input :deep(.el-range-input) {
  color: rgba(255, 255, 255, 0.95) !important;
  background: transparent !important;
}

.tech-input :deep(.el-range-separator) {
  color: rgba(255, 255, 255, 0.7) !important;
}

.filter-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.search-bar {
  margin-bottom: 20px;
  padding: 20px;
  background: rgba(20, 30, 50, 0.6) !important;
  border: 1px solid rgba(0, 255, 255, 0.2) !important;
  border-radius: 8px;
  backdrop-filter: blur(5px) !important;
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

.quick-filters {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.filter-label {
  font-weight: 500;
  color: #ffffff !important;
}

.log-stats {
  margin-bottom: 20px;
  padding: 20px;
  background: linear-gradient(135deg, 
    rgba(0, 255, 255, 0.15) 0%, 
    rgba(20, 30, 50, 0.8) 50%, 
    rgba(0, 255, 255, 0.15) 100%) !important;
  border: 1px solid rgba(0, 255, 255, 0.2) !important;
  border-radius: 12px;
  color: white;
  backdrop-filter: blur(10px) !important;
  flex-shrink: 0;
}

.stat-item {
  text-align: center;
}

.stat-number {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 8px;
}

.stat-number.success {
  color: #67c23a;
}

.stat-number.error {
  color: #f56c6c;
}

.stat-number.warning {
  color: #e6a23c;
}

.stat-label {
  font-size: 14px;
  opacity: 0.9;
}

/* 增强型分页样式 */
.tech-pagination {
  margin-top: 20px;
  margin-bottom: 20px;
  flex-shrink: 0;
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
  flex-shrink: 0;
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

.log-detail-expand {
  padding: 20px;
  background: rgba(20, 30, 50, 0.6) !important;
  margin: 0 20px 20px 20px;
  border-radius: 8px;
  border: 1px solid rgba(0, 255, 255, 0.2) !important;
}

.log-detail-dialog {
  max-height: 600px;
  overflow-y: auto;
}

.log-details-content {
  max-height: 200px;
  overflow-y: auto;
  padding: 12px;
  background: rgba(20, 30, 50, 0.6) !important;
  border: 1px solid rgba(0, 255, 255, 0.2) !important;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
  color: #ffffff !important;
}

.export-progress {
  text-align: center;
  padding: 20px;
}

.progress-text {
  margin-top: 16px;
  color: #606266;
}

.export-completed {
  padding: 20px;
}

/* 科技感表格 - 与用户列表完全一致的样式 */
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

/* 特殊行样式 - 错误/警告行的深色主题适配 */
.tech-table :deep(.error-row) {
  background: rgba(220, 20, 60, 0.15) !important;
}

.tech-table :deep(.warning-row) {
  background: rgba(255, 193, 7, 0.15) !important;
}

.tech-table :deep(.failed-row) {
  background: rgba(220, 20, 60, 0.15) !important;
}

.tech-table :deep(.error-row:hover) {
  background: rgba(220, 20, 60, 0.25) !important;
}

.tech-table :deep(.warning-row:hover) {
  background: rgba(255, 193, 7, 0.25) !important;
}

.tech-table :deep(.failed-row:hover) {
  background: rgba(220, 20, 60, 0.25) !important;
}

/* 移除所有可能的白色边框 */
.tech-table :deep(.el-table--border) {
  border: none !important;
}

.tech-table :deep(.el-table__inner-wrapper) {
  border: none !important;
}

/* 边框控制 */
.tech-table :deep(.el-table--border td) {
  border-left: none !important;
  border-right: 1px solid rgba(0, 255, 255, 0.06) !important;
  border-top: none !important;
  border-bottom: none !important;
}

.tech-table :deep(.el-table--border th) {
  border: none !important;
  border-right: 1px solid rgba(0, 255, 255, 0.1) !important;
}

.tech-table :deep(td:last-child),
.tech-table :deep(th:last-child) {
  border-right: none !important;
}

/* 强制移除表格所有边框 - 最强力的边框移除 */
.tech-table :deep(.el-table),
.tech-table :deep(.el-table *),
.tech-table :deep(.el-table__inner-wrapper),
.tech-table :deep(.el-table__header-wrapper),
.tech-table :deep(.el-table__body-wrapper),
.tech-table :deep(.el-table__footer-wrapper),
.tech-table :deep(.el-table__header),
.tech-table :deep(.el-table__body),
.tech-table :deep(.el-table__footer) {
  border: none !important;
  border-top: none !important;
  border-bottom: none !important;
  border-left: none !important;
  border-right: none !important;
  outline: none !important;
}

/* 移除表格底部可能的分隔线 */
.tech-table :deep(.el-table__inner-wrapper::after),
.tech-table :deep(.el-table__body-wrapper::after),
.tech-table :deep(.el-table::after) {
  display: none !important;
  content: none !important;
  border: none !important;
  background: none !important;
}

/* 彻底移除表格的所有可能边框线 */
.tech-table :deep(.el-table--border) {
  border: none !important;
}

.tech-table :deep(.el-table--border::after) {
  display: none !important;
}

.tech-table :deep(.el-table--border::before) {
  display: none !important;
}

.tech-table :deep(.el-table__cell) {
  border: none !important;
  border-bottom: none !important;
  border-right: none !important;
}

.tech-table :deep(.el-table .cell) {
  border: none !important;
}

/* 强制移除最后一行的底边框 */
.tech-table :deep(.el-table__body tr:last-child td) {
  border-bottom: none !important;
}

/* 移除可能的表格外边框 */
.tech-table :deep(.el-table__border-left-patch) {
  display: none !important;
}

.tech-table :deep(.el-table__border-bottom-patch) {
  display: none !important;
}

/* 移除固定列可能的边框 */
.tech-table :deep(.el-table__fixed) {
  border: none !important;
  box-shadow: none !important;
}

/* 最强力的边框移除 - 覆盖所有Element Plus内部样式 */
.tech-table :deep(.el-table) * {
  border: none !important;
  border-top: none !important;
  border-bottom: none !important;
  border-left: none !important;
  border-right: none !important;
  box-shadow: none !important;
}

/* 移除所有可能的分隔线和边框 */
.tech-table :deep(.el-table__row) {
  border: none !important;
}

.tech-table :deep(.el-table__row:last-child) {
  border-bottom: none !important;
}

.tech-table :deep(.el-table tbody tr:last-child td) {
  border-bottom: none !important;
}

.tech-table :deep(.el-table thead tr th) {
  border-bottom: none !important;
}

/* 移除表格容器的所有边框属性 */
.tech-table :deep(.el-table),
.tech-table :deep(.el-table-wrapper),
.tech-table :deep(.el-table__inner-wrapper) {
  border: none !important;
  border-collapse: separate !important;
  border-spacing: 0 !important;
}

/* 强制重置所有边框相关的CSS属性 */
.tech-table :deep(.el-table) {
  border-top-width: 0 !important;
  border-bottom-width: 0 !important;
  border-left-width: 0 !important;
  border-right-width: 0 !important;
  border-style: none !important;
  outline: none !important;
}

/* 移除可能存在的底部分隔符 */
.tech-table :deep(.el-table__append-wrapper) {
  border: none !important;
}

.tech-table :deep(.el-table__placeholder) {
  border: none !important;
}

/* 终极白线移除方案 - 针对所有可能的边框来源 */
.tech-table :deep(.el-table) {
  box-shadow: none !important;
  border-collapse: collapse !important;
}

.tech-table :deep(.el-table__inner-wrapper) {
  box-shadow: none !important;
  border-collapse: collapse !important;
}

/* 移除表格周围可能的容器边框 */
.tech-table {
  border: none !important;
  outline: none !important;
  box-shadow: none !important;
  background: transparent !important;
}

/* 强制移除所有可能的底部边框线 */
.tech-table :deep(.el-table__footer),
.tech-table :deep(.el-table__footer-wrapper),
.tech-table :deep(.el-table__footer *) {
  border: none !important;
  border-bottom: none !important;
  background: transparent !important;
}

/* 移除表格最后一行可能的边框 */
.tech-table :deep(.el-table tbody),
.tech-table :deep(.el-table tbody tr:last-of-type),
.tech-table :deep(.el-table tbody tr:last-of-type td),
.tech-table :deep(.el-table__body tr:last-of-type),
.tech-table :deep(.el-table__body tr:last-of-type td) {
  border-bottom: none !important;
  border: none !important;
}

/* 移除可能的表格外包装边框 */
.tech-table :deep(.el-table-wrapper),
.tech-table :deep(.el-table__wrapper) {
  border: none !important;
  box-shadow: none !important;
  background: transparent !important;
}

/* 强制移除Element Plus可能添加的任何边框 */
.tech-table :deep(*[class*="el-table"]) {
  border: none !important;
  border-bottom: none !important;
  border-top: none !important;
  border-left: none !important;
  border-right: none !important;
  outline: none !important;
}

/* 移除可能的分隔符和装饰性边框 */
.tech-table :deep(.el-table)::before,
.tech-table :deep(.el-table)::after,
.tech-table :deep(.el-table__inner-wrapper)::before,
.tech-table :deep(.el-table__inner-wrapper)::after,
.tech-table :deep(.el-table__body-wrapper)::before,
.tech-table :deep(.el-table__body-wrapper)::after {
  display: none !important;
  content: none !important;
  border: none !important;
  background: none !important;
  width: 0 !important;
  height: 0 !important;
}

/* 最强力的通用边框移除 */
.tech-table * {
  border: none !important;
  outline: none !important;
}

.tech-table *::before,
.tech-table *::after {
  border: none !important;
  background: none !important;
}

/* 终极底部白线清除方案 */
.tech-table {
  position: relative !important;
  overflow: hidden !important;
}

.tech-table::after {
  content: '' !important;
  position: absolute !important;
  bottom: -5px !important;
  left: 0 !important;
  right: 0 !important;
  height: 10px !important;
  background: rgba(15, 25, 45, 0.95) !important;
  z-index: 10 !important;
}

/* 强制移除Element Plus表格的所有可能底部线条 */
.tech-table :deep(.el-table),
.tech-table :deep(.el-table__inner-wrapper),
.tech-table :deep(.el-table__body-wrapper),
.tech-table :deep(.el-table__header-wrapper),
.tech-table :deep(.el-table__footer-wrapper) {
  border-bottom: none !important;
  box-shadow: none !important;
  position: relative !important;
}

.tech-table :deep(.el-table__body),
.tech-table :deep(.el-table__header),
.tech-table :deep(.el-table__footer) {
  border-bottom: none !important;
  margin-bottom: 0 !important;
  padding-bottom: 0 !important;
}

/* 移除loading遮罩可能的边框 */
.tech-table :deep(.el-loading-mask) {
  border: none !important;
  border-bottom: none !important;
}

/* 彻底移除任何可能的底部装饰线 */
.tech-table :deep([class*="border"]),
.tech-table :deep([class*="line"]),
.tech-table :deep([style*="border"]) {
  border: none !important;
  border-bottom: none !important;
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

:deep(.el-button--small) {
  --el-button-size: 24px !important;
}

/* 按钮组 */
:deep(.el-button-group .el-button) {
  border-color: rgba(0, 255, 255, 0.2) !important;
}

/* 标签 */
:deep(.el-tag) {
  background: rgba(0, 255, 255, 0.15) !important;
  border-color: rgba(0, 255, 255, 0.3) !important;
  color: #00ffff !important;
}

:deep(.el-tag--success) {
  background: rgba(103, 194, 58, 0.15) !important;
  border-color: rgba(103, 194, 58, 0.3) !important;
  color: #67c23a !important;
}

:deep(.el-tag--warning) {
  background: rgba(230, 162, 60, 0.15) !important;
  border-color: rgba(230, 162, 60, 0.3) !important;
  color: #e6a23c !important;
}

:deep(.el-tag--danger) {
  background: rgba(245, 108, 108, 0.15) !important;
  border-color: rgba(245, 108, 108, 0.3) !important;
  color: #f56c6c !important;
}

:deep(.el-tag--info) {
  background: rgba(144, 147, 153, 0.15) !important;
  border-color: rgba(144, 147, 153, 0.3) !important;
  color: #909399 !important;
}

/* 分页 */
:deep(.el-pagination) {
  --el-pagination-bg-color: transparent !important;
  --el-pagination-text-color: #ffffff !important;
  --el-pagination-border-color: rgba(0, 255, 255, 0.2) !important;
  --el-pagination-hover-color: #00ffff !important;
  background: rgba(15, 25, 45, 0.8) !important;
  padding: 12px 16px !important;
  border-radius: 8px !important;
  border: 1px solid rgba(0, 255, 255, 0.2) !important;
  backdrop-filter: blur(10px) !important;
  box-shadow: 
    0 4px 16px rgba(0, 0, 0, 0.3),
    0 0 10px rgba(0, 255, 255, 0.1) !important;
}

:deep(.el-pagination .el-pager li) {
  background: rgba(20, 30, 50, 0.6) !important;
  color: #ffffff !important;
  border: 1px solid rgba(0, 255, 255, 0.2) !important;
}

:deep(.el-pagination .el-pager li:hover) {
  background: rgba(0, 255, 255, 0.2) !important;
  color: #00ffff !important;
}

:deep(.el-pagination .el-pager li.is-active) {
  background: linear-gradient(135deg, rgba(0, 255, 255, 0.3), rgba(0, 200, 255, 0.3)) !important;
  color: #00ffff !important;
  border-color: #00ffff !important;
}

:deep(.el-pagination .btn-prev),
:deep(.el-pagination .btn-next) {
  background: rgba(20, 30, 50, 0.6) !important;
  color: #ffffff !important;
  border: 1px solid rgba(0, 255, 255, 0.2) !important;
}

:deep(.el-pagination .btn-prev:hover),
:deep(.el-pagination .btn-next:hover) {
  background: rgba(0, 255, 255, 0.2) !important;
  color: #00ffff !important;
}

/* 对话框 */
:deep(.el-dialog) {
  background: linear-gradient(135deg,
    rgba(15, 25, 45, 0.95) 0%,
    rgba(20, 30, 50, 0.95) 50%,
    rgba(15, 25, 45, 0.95) 100%) !important;
  border: 2px solid rgba(0, 255, 255, 0.3) !important;
  border-radius: 16px !important;
  backdrop-filter: blur(10px) !important;
  box-shadow: 
    0 20px 60px rgba(0, 0, 0, 0.5),
    0 0 40px rgba(0, 255, 255, 0.2) !important;
  color: #ffffff !important;
}

:deep(.el-dialog__header) {
  background: transparent !important;
  border-bottom: 1px solid rgba(0, 255, 255, 0.2) !important;
  padding: 20px !important;
}

:deep(.el-dialog__title) {
  color: #00ffff !important;
  font-weight: 600 !important;
  text-shadow: 0 0 10px rgba(0, 255, 255, 0.5) !important;
}

:deep(.el-dialog__body) {
  background: transparent !important;
  color: #ffffff !important;
  padding: 20px !important;
}

/* 描述列表 */
:deep(.el-descriptions) {
  --el-descriptions-table-border: 1px solid rgba(0, 255, 255, 0.2) !important;
  --el-descriptions-item-bordered-label-background: rgba(20, 30, 50, 0.8) !important;
}

:deep(.el-descriptions__table) {
  background: transparent !important;
}

:deep(.el-descriptions__cell) {
  background: rgba(20, 30, 50, 0.4) !important;
  color: #ffffff !important;
  border-color: rgba(0, 255, 255, 0.2) !important;
}

:deep(.el-descriptions__label) {
  background: rgba(20, 30, 50, 0.8) !important;
  color: #00ffff !important;
  font-weight: 600 !important;
}

/* 进度条 */
:deep(.el-progress) {
  --el-progress-bg-color: rgba(20, 30, 50, 0.6) !important;
}

:deep(.el-progress__text) {
  color: #ffffff !important;
}

/* 结果组件 */
:deep(.el-result__title) {
  color: #ffffff !important;
}

:deep(.el-result__subtitle) {
  color: rgba(255, 255, 255, 0.7) !important;
}

/* Loading 遮罩 */
:deep(.el-loading-mask) {
  background-color: rgba(15, 25, 45, 0.8) !important;
}

:deep(.el-loading-text) {
  color: #00ffff !important;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .search-bar .el-form-item {
    margin-bottom: 16px;
  }
}

@media (max-width: 768px) {
  .log-stats .el-col {
    margin-bottom: 16px;
  }
  
  .header-actions {
    flex-direction: column;
    gap: 8px;
  }
  
  .quick-filters {
    flex-wrap: wrap;
  }
}

</style>