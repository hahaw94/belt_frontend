<template>
  <div class="log-center">
    <el-card class="tech-card">
      <template #header>
        <div class="card-header">
          <span class="card-title">系统操作日志</span>
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
      <div class="search-bar">
        <el-form :inline="true" :model="searchForm" label-width="80px">
          <el-form-item label="时间范围">
            <el-date-picker
              v-model="searchForm.timeRange"
              type="datetimerange"
              range-separator="至"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
              format="YYYY-MM-DD HH:mm:ss"
              value-format="YYYY-MM-DD HH:mm:ss"
              style="width: 380px;"
            />
          </el-form-item>
          <el-form-item label="日志级别">
            <div class="custom-select" :class="{ 'is-open': isLogLevelDropdownOpen }" @click="toggleLogLevelDropdown">
              <div class="select-input">
                <span class="selected-text">{{ getSelectedLogLevelName() || '请选择日志级别' }}</span>
                <div class="select-arrow">
                  <svg viewBox="0 0 1024 1024" width="14" height="14">
                    <path d="M884 256h-75c-5.1 0-9.9 2.5-12.9 6.6L512 654.2 227.9 262.6c-3-4.1-7.8-6.6-12.9-6.6h-75c-6.5 0-10.3 7.4-6.5 12.7l352.6 486.1c12.8 17.6 39 17.6 51.7 0l352.6-486.1c3.9-5.3 0.1-12.7-6.4-12.7z" fill="currentColor"></path>
                  </svg>
                </div>
              </div>
              <div class="dropdown-menu" v-show="isLogLevelDropdownOpen">
                <div 
                  class="dropdown-item" 
                  :class="{ 'is-selected': !searchForm.log_level }"
                  @click.stop="selectLogLevel('')"
                >
                  全部
                </div>
                <div 
                  class="dropdown-item" 
                  :class="{ 'is-selected': searchForm.log_level === 'INFO' }"
                  @click.stop="selectLogLevel('INFO')"
                >
                  INFO
                </div>
                <div 
                  class="dropdown-item" 
                  :class="{ 'is-selected': searchForm.log_level === 'WARN' }"
                  @click.stop="selectLogLevel('WARN')"
                >
                  WARN
                </div>
                <div 
                  class="dropdown-item" 
                  :class="{ 'is-selected': searchForm.log_level === 'ERROR' }"
                  @click.stop="selectLogLevel('ERROR')"
                >
                  ERROR
                </div>
                <div 
                  class="dropdown-item" 
                  :class="{ 'is-selected': searchForm.log_level === 'DEBUG' }"
                  @click.stop="selectLogLevel('DEBUG')"
                >
                  DEBUG
                </div>
              </div>
            </div>
          </el-form-item>
          <el-form-item label="功能模块">
            <div class="custom-select" :class="{ 'is-open': isModuleDropdownOpen }" @click="toggleModuleDropdown">
              <div class="select-input">
                <span class="selected-text">{{ getSelectedModuleName() || '请选择功能模块' }}</span>
                <div class="select-arrow">
                  <svg viewBox="0 0 1024 1024" width="14" height="14">
                    <path d="M884 256h-75c-5.1 0-9.9 2.5-12.9 6.6L512 654.2 227.9 262.6c-3-4.1-7.8-6.6-12.9-6.6h-75c-6.5 0-10.3 7.4-6.5 12.7l352.6 486.1c12.8 17.6 39 17.6 51.7 0l352.6-486.1c3.9-5.3 0.1-12.7-6.4-12.7z" fill="currentColor"></path>
                  </svg>
                </div>
              </div>
              <div class="dropdown-menu" v-show="isModuleDropdownOpen">
                <div 
                  class="dropdown-item" 
                  :class="{ 'is-selected': !searchForm.module }"
                  @click.stop="selectModule('')"
                >
                  全部
                </div>
                <div 
                  class="dropdown-item" 
                  :class="{ 'is-selected': searchForm.module === 'UserManagement' }"
                  @click.stop="selectModule('UserManagement')"
                >
                  用户管理
                </div>
                <div 
                  class="dropdown-item" 
                  :class="{ 'is-selected': searchForm.module === 'DeviceManagement' }"
                  @click.stop="selectModule('DeviceManagement')"
                >
                  设备管理
                </div>
                <div 
                  class="dropdown-item" 
                  :class="{ 'is-selected': searchForm.module === 'AlgorithmConfig' }"
                  @click.stop="selectModule('AlgorithmConfig')"
                >
                  算法配置
                </div>
                <div 
                  class="dropdown-item" 
                  :class="{ 'is-selected': searchForm.module === 'Detection' }"
                  @click.stop="selectModule('Detection')"
                >
                  实时检测
                </div>
                <div 
                  class="dropdown-item" 
                  :class="{ 'is-selected': searchForm.module === 'EventCenter' }"
                  @click.stop="selectModule('EventCenter')"
                >
                  事件中心
                </div>
                <div 
                  class="dropdown-item" 
                  :class="{ 'is-selected': searchForm.module === 'SystemConfig' }"
                  @click.stop="selectModule('SystemConfig')"
                >
                  系统配置
                </div>
                <div 
                  class="dropdown-item" 
                  :class="{ 'is-selected': searchForm.module === 'RecordingManagement' }"
                  @click.stop="selectModule('RecordingManagement')"
                >
                  录像管理
                </div>
                <div 
                  class="dropdown-item" 
                  :class="{ 'is-selected': searchForm.module === 'StatisticsAnalysis' }"
                  @click.stop="selectModule('StatisticsAnalysis')"
                >
                  统计分析
                </div>
              </div>
            </div>
          </el-form-item>
          <el-form-item label="用户名">
            <el-input 
              v-model="searchForm.username" 
              placeholder="请输入用户名" 
              clearable 
              style="width: 150px;"
            />
          </el-form-item>
          <el-form-item label="操作结果">
            <div class="custom-select" :class="{ 'is-open': isResultDropdownOpen }" @click="toggleResultDropdown">
              <div class="select-input">
                <span class="selected-text">{{ getSelectedResultName() || '请选择操作结果' }}</span>
                <div class="select-arrow">
                  <svg viewBox="0 0 1024 1024" width="14" height="14">
                    <path d="M884 256h-75c-5.1 0-9.9 2.5-12.9 6.6L512 654.2 227.9 262.6c-3-4.1-7.8-6.6-12.9-6.6h-75c-6.5 0-10.3 7.4-6.5 12.7l352.6 486.1c12.8 17.6 39 17.6 51.7 0l352.6-486.1c3.9-5.3 0.1-12.7-6.4-12.7z" fill="currentColor"></path>
                  </svg>
                </div>
              </div>
              <div class="dropdown-menu" v-show="isResultDropdownOpen">
                <div 
                  class="dropdown-item" 
                  :class="{ 'is-selected': !searchForm.result }"
                  @click.stop="selectResult('')"
                >
                  全部
                </div>
                <div 
                  class="dropdown-item" 
                  :class="{ 'is-selected': searchForm.result === '成功' }"
                  @click.stop="selectResult('成功')"
                >
                  成功
                </div>
                <div 
                  class="dropdown-item" 
                  :class="{ 'is-selected': searchForm.result === '失败' }"
                  @click.stop="selectResult('失败')"
                >
                  失败
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
        @row-click="viewLogDetail"
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

    <!-- 日志详情弹窗 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="日志详情"
      width="700px"
    >
      <div class="log-detail-dialog">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="日志ID">{{ selectedLog.id }}</el-descriptions-item>
          <el-descriptions-item label="时间">{{ selectedLog.timestamp }}</el-descriptions-item>
          <el-descriptions-item label="日志级别">
            <el-tag :type="getLevelType(selectedLog.level)" size="small">
              {{ selectedLog.level }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="功能模块">{{ selectedLog.module }}</el-descriptions-item>
          <el-descriptions-item label="操作类型">{{ selectedLog.operation }}</el-descriptions-item>
          <el-descriptions-item label="操作用户">{{ selectedLog.username }}</el-descriptions-item>
          <el-descriptions-item label="用户ID">{{ selectedLog.user_id }}</el-descriptions-item>
          <el-descriptions-item label="IP地址">{{ selectedLog.ip_address }}</el-descriptions-item>
          <el-descriptions-item label="操作结果">
            <el-tag :type="selectedLog.result === '成功' ? 'success' : 'danger'" size="small">
              {{ selectedLog.result }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="浏览器">{{ selectedLog.user_agent || '未知' }}</el-descriptions-item>
          <el-descriptions-item label="详细描述" :span="2">
            <div class="log-details-content">
              {{ selectedLog.details }}
            </div>
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </el-dialog>

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
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { logApi } from '@/api/log'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Download, Refresh } from '@element-plus/icons-vue'

const loading = ref(false)
const detailDialogVisible = ref(false)
const exportDialogVisible = ref(false)
const exportProgress = ref(0)
const exportCompleted = ref(false)
const quickFilter = ref('all')

// 下拉菜单控制
const isLogLevelDropdownOpen = ref(false)
const isModuleDropdownOpen = ref(false)
const isResultDropdownOpen = ref(false)

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

// 选中的日志
const selectedLog = ref({})

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

// 分页大小改变
const handleSizeChange = (val) => {
  pagination.pageSize = val
  pagination.page = 1
  loadLogList()
}

// 当前页改变
const handleCurrentChange = (val) => {
  pagination.page = val
  loadLogList()
}

// 查看日志详情
const viewLogDetail = (log) => {
  selectedLog.value = log
  detailDialogVisible.value = true
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

// 下拉菜单相关方法
const toggleLogLevelDropdown = () => {
  isLogLevelDropdownOpen.value = !isLogLevelDropdownOpen.value
  isModuleDropdownOpen.value = false
  isResultDropdownOpen.value = false
}

const toggleModuleDropdown = () => {
  isModuleDropdownOpen.value = !isModuleDropdownOpen.value
  isLogLevelDropdownOpen.value = false
  isResultDropdownOpen.value = false
}

const toggleResultDropdown = () => {
  isResultDropdownOpen.value = !isResultDropdownOpen.value
  isLogLevelDropdownOpen.value = false
  isModuleDropdownOpen.value = false
}

const selectLogLevel = (level) => {
  searchForm.log_level = level
  isLogLevelDropdownOpen.value = false
}

const selectModule = (module) => {
  searchForm.module = module
  isModuleDropdownOpen.value = false
}

const selectResult = (result) => {
  searchForm.result = result
  isResultDropdownOpen.value = false
}

const getSelectedLogLevelName = () => {
  const levelMap = {
    '': '全部',
    'INFO': 'INFO',
    'WARN': 'WARN',
    'ERROR': 'ERROR',
    'DEBUG': 'DEBUG'
  }
  return levelMap[searchForm.log_level] || '请选择日志级别'
}

const getSelectedModuleName = () => {
  const moduleMap = {
    '': '全部',
    'UserManagement': '用户管理',
    'DeviceManagement': '设备管理',
    'AlgorithmConfig': '算法配置',
    'Detection': '实时检测',
    'EventCenter': '事件中心',
    'SystemConfig': '系统配置',
    'RecordingManagement': '录像管理',
    'StatisticsAnalysis': '统计分析'
  }
  return moduleMap[searchForm.module] || '请选择功能模块'
}

const getSelectedResultName = () => {
  const resultMap = {
    '': '全部',
    '成功': '成功',
    '失败': '失败'
  }
  return resultMap[searchForm.result] || '请选择操作结果'
}

// 点击外部关闭下拉菜单
const handleClickOutside = (event) => {
  const customSelects = event.target.closest('.custom-select')
  if (!customSelects) {
    isLogLevelDropdownOpen.value = false
    isModuleDropdownOpen.value = false
    isResultDropdownOpen.value = false
  }
}

onMounted(() => {
  // 添加点击外部关闭下拉菜单的事件监听
  document.addEventListener('click', handleClickOutside)
  loadLogList()
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.log-center {
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

.card-title {
  font-size: 18px;
  font-weight: bold;
  color: #303133;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.search-bar {
  margin-bottom: 20px;
  padding: 20px;
  background: rgba(20, 30, 50, 0.6) !important;
  border: 1px solid rgba(0, 255, 255, 0.2) !important;
  border-radius: 8px;
  backdrop-filter: blur(5px) !important;
}

.quick-filters {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
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

.pagination-container {
  margin-top: 20px;
  text-align: right;
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

/* 自建下拉菜单样式 */
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
  padding: 8px 12px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  background: transparent;
  transition: color 0.3s ease;
}

.select-arrow {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #0088aa 0%, #005577 50%, #003344 100%);
  border-left: 1px solid rgba(0, 255, 255, 0.2);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.select-arrow::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, transparent, rgba(0, 255, 255, 0.1), transparent);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.select-arrow svg {
  color: rgba(255, 255, 255, 0.8);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  filter: drop-shadow(0 0 2px rgba(0, 255, 255, 0.3));
}

/* 悬停状态 */
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

/* 下拉菜单动画 */
@keyframes dropdownFadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style>