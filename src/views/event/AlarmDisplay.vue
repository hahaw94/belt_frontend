<template>
  <div class="alarm-display">
    <div class="search-panel tech-card">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="searchForm.timeRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            :shortcuts="dateShortcuts"
          />
        </el-form-item>
        <el-form-item label="告警类型">
          <el-select v-model="searchForm.alarmType" placeholder="请选择告警类型">
            <el-option label="全部" value="" />
            <el-option label="异常行为" value="behavior" />
            <el-option label="可疑物品" value="object" />
            <el-option label="区域入侵" value="intrusion" />
          </el-select>
        </el-form-item>
        <el-form-item label="点位">
          <el-select v-model="searchForm.location" placeholder="请选择点位">
            <el-option label="全部" value="" />
            <el-option
              v-for="location in locations"
              :key="location.id"
              :label="location.name"
              :value="location.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            查询
          </el-button>
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="content-area tech-card">
      <el-table
        :data="alarmList"
        style="width: 100%"
        @row-click="handleRowClick"
      >
        <el-table-column type="index" width="50" />
        <el-table-column prop="time" label="时间" width="180" />
        <el-table-column prop="type" label="告警类型" width="120" />
        <el-table-column prop="location" label="点位" width="150" />
        <el-table-column prop="description" label="描述" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="操作" width="150">
          <template #default="{ row }">
            <el-button link type="primary" @click.stop="handleView(row)">
              查看
            </el-button>
            <el-button link type="primary" @click.stop="handleProcess(row)">
              处理
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 告警详情对话框 -->
    <el-dialog
      v-model="dialogVisible"
      title="告警详情"
      width="60%"
    >
      <div v-if="selectedAlarm" class="alarm-detail">
        <div class="detail-item">
          <span class="label">时间：</span>
          <span>{{ selectedAlarm.time }}</span>
        </div>
        <div class="detail-item">
          <span class="label">类型：</span>
          <span>{{ selectedAlarm.type }}</span>
        </div>
        <div class="detail-item">
          <span class="label">点位：</span>
          <span>{{ selectedAlarm.location }}</span>
        </div>
        <div class="detail-item">
          <span class="label">描述：</span>
          <span>{{ selectedAlarm.description }}</span>
        </div>
        <div class="detail-item">
          <span class="label">状态：</span>
          <el-tag :type="getStatusType(selectedAlarm.status)">
            {{ selectedAlarm.status }}
          </el-tag>
        </div>
        <div class="detail-images">
          <el-image
            v-for="(image, index) in selectedAlarm.images"
            :key="index"
            :src="image"
            :preview-src-list="selectedAlarm.images"
            fit="cover"
            class="alarm-image"
          />
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">关闭</el-button>
          <el-button type="primary" @click="handleConfirm">
            确认处理
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh } from '@element-plus/icons-vue'

export default {
  name: 'AlarmDisplay',
  components: {
    Search,
    Refresh
  },
  setup() {
    // 搜索表单
    const searchForm = reactive({
      timeRange: [],
      alarmType: '',
      location: ''
    })

    // 分页相关
    const currentPage = ref(1)
    const pageSize = ref(10)
    const total = ref(100)

    // 模拟数据
    const locations = ref([
      { id: 1, name: '前门' },
      { id: 2, name: '后门' },
      { id: 3, name: '停车场' }
    ])

    const alarmList = ref([
      {
        id: 1,
        time: '2024-01-20 10:30:00',
        type: '异常行为',
        location: '前门',
        description: '检测到可疑人员逗留',
        status: '未处理',
        images: [
          'https://example.com/image1.jpg',
          'https://example.com/image2.jpg'
        ]
      },
      {
        id: 2,
        time: '2024-01-20 10:35:00',
        type: '可疑物品',
        location: '停车场',
        description: '检测到可疑包裹',
        status: '已处理',
        images: [
          'https://example.com/image3.jpg'
        ]
      }
    ])

    // 日期快捷选项
    const dateShortcuts = [
      {
        text: '最近一小时',
        value: () => {
          const end = new Date()
          const start = new Date()
          start.setTime(start.getTime() - 3600 * 1000)
          return [start, end]
        }
      },
      {
        text: '今天',
        value: () => {
          const end = new Date()
          const start = new Date()
          start.setHours(0, 0, 0, 0)
          return [start, end]
        }
      }
    ]

    // 对话框相关
    const dialogVisible = ref(false)
    const selectedAlarm = ref(null)

    // 处理搜索
    const handleSearch = () => {
      console.log('搜索条件：', searchForm)
      // 实现搜索逻辑
    }

    // 重置搜索
    const handleReset = () => {
      searchForm.timeRange = []
      searchForm.alarmType = ''
      searchForm.location = ''
    }

    // 获取状态标签类型
    const getStatusType = (status) => {
      return status === '未处理' ? 'danger' : 'success'
    }

    // 查看告警详情
    const handleView = (row) => {
      selectedAlarm.value = row
      dialogVisible.value = true
    }

    // 处理告警
    const handleProcess = (row) => {
      console.log('处理告警：', row)
      ElMessageBox.confirm(
        '确认要处理该告警吗？',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(() => {
        row.status = '已处理'
        ElMessage({
          type: 'success',
          message: '告警已处理'
        })
      }).catch(() => {})
    }

    // 确认处理告警
    const handleConfirm = () => {
      if (selectedAlarm.value) {
        selectedAlarm.value.status = '已处理'
        dialogVisible.value = false
        ElMessage({
          type: 'success',
          message: '告警已处理'
        })
      }
    }

    // 分页处理
    const handleSizeChange = (val) => {
      console.log('每页显示条数：', val)
      pageSize.value = val
      // 重新加载数据
    }

    const handleCurrentChange = (val) => {
      console.log('当前页：', val)
      currentPage.value = val
      // 重新加载数据
    }

    const handleRowClick = (row) => {
      console.log('点击行：', row)
      handleView(row)
    }

    return {
      searchForm,
      locations,
      alarmList,
      currentPage,
      pageSize,
      total,
      dateShortcuts,
      dialogVisible,
      selectedAlarm,
      handleSearch,
      handleReset,
      getStatusType,
      handleView,
      handleProcess,
      handleConfirm,
      handleSizeChange,
      handleCurrentChange,
      handleRowClick
    }
  }
}
</script>

<style scoped>
.alarm-display {
  padding: 20px;
  height: calc(100vh - 120px);
  display: flex;
  flex-direction: column;
  gap: 20px;
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

.search-panel {
  padding: 16px;
}

.content-area {
  flex: 1;
  padding: 16px;
  display: flex;
  flex-direction: column;
}

.content-area .el-table {
  flex: 1;
}

.content-area .el-pagination {
  margin-top: 16px;
}

.alarm-detail {
  padding: 20px;
}

.detail-item {
  margin-bottom: 16px;
  display: flex;
  align-items: center;
}

.detail-item .label {
  width: 80px;
  color: rgba(255, 255, 255, 0.8);
}

.detail-images {
  margin-top: 20px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.alarm-image {
  width: 200px;
  height: 150px;
  border-radius: 4px;
  cursor: pointer;
}

/* Element Plus 组件深色主题样式 */
:deep(.el-form-item__label) {
  color: rgba(255, 255, 255, 0.8) !important;
}

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
  box-shadow: 
    inset 0 0 15px rgba(0, 255, 255, 0.08),
    0 0 8px rgba(0, 255, 255, 0.2) !important;
}

:deep(.el-input__wrapper.is-focus) {
  background: rgba(25, 35, 55, 0.95) !important;
  border-color: #00ffff !important;
  box-shadow: 
    inset 0 0 20px rgba(0, 255, 255, 0.1),
    0 0 0 2px rgba(0, 255, 255, 0.3),
    0 0 15px rgba(0, 255, 255, 0.2) !important;
}

:deep(.el-input__inner) {
  background: transparent !important;
  color: rgba(255, 255, 255, 0.95) !important;
  font-weight: 500 !important;
}

:deep(.el-input__inner::placeholder) {
  color: rgba(255, 255, 255, 0.5) !important;
  font-style: italic !important;
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

:deep(.el-date-editor) {
  background: rgba(20, 30, 50, 0.85) !important;
  border: 1px solid rgba(0, 255, 255, 0.3) !important;
  border-radius: 6px !important;
  box-shadow: 
    inset 0 0 10px rgba(0, 255, 255, 0.05),
    0 2px 4px rgba(0, 0, 0, 0.2) !important;
  backdrop-filter: blur(5px) !important;
}

:deep(.el-date-editor:hover) {
  background: rgba(25, 35, 55, 0.9) !important;
  border-color: rgba(0, 255, 255, 0.5) !important;
  box-shadow: 
    inset 0 0 15px rgba(0, 255, 255, 0.08),
    0 0 8px rgba(0, 255, 255, 0.2) !important;
}

:deep(.el-date-editor.is-active) {
  background: rgba(25, 35, 55, 0.95) !important;
  border-color: #00ffff !important;
  box-shadow: 
    inset 0 0 20px rgba(0, 255, 255, 0.1),
    0 0 0 2px rgba(0, 255, 255, 0.3),
    0 0 15px rgba(0, 255, 255, 0.2) !important;
}

:deep(.el-picker-panel) {
  background: rgba(15, 25, 45, 0.98) !important;
  border: 1px solid rgba(0, 255, 255, 0.3) !important;
  backdrop-filter: blur(15px) !important;
  box-shadow: 
    0 8px 25px rgba(0, 0, 0, 0.4),
    0 0 20px rgba(0, 255, 255, 0.1) !important;
}

:deep(.el-picker-panel__body) {
  background: transparent !important;
  color: rgba(255, 255, 255, 0.9) !important;
}

:deep(.el-date-table) {
  background: transparent !important;
}

:deep(.el-date-table td) {
  background: transparent !important;
  color: rgba(255, 255, 255, 0.8) !important;
}

:deep(.el-date-table td:hover) {
  background: rgba(0, 255, 255, 0.1) !important;
  color: #00ffff !important;
}

:deep(.el-date-table td.current) {
  background: rgba(0, 255, 255, 0.2) !important;
  color: #00ffff !important;
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

:deep(.el-tag) {
  background: rgba(20, 30, 50, 0.6) !important;
  border: 1px solid rgba(0, 255, 255, 0.3) !important;
  color: rgba(255, 255, 255, 0.8) !important;
}

:deep(.el-tag--primary) {
  background: rgba(0, 150, 200, 0.6) !important;
  border-color: rgba(0, 200, 255, 0.5) !important;
  color: #ffffff !important;
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

:deep(.el-tag--info) {
  background: rgba(144, 147, 153, 0.6) !important;
  border-color: rgba(144, 147, 153, 0.5) !important;
  color: #ffffff !important;
}

:deep(.el-pagination) {
  background: transparent !important;
}

:deep(.el-pagination .btn-prev),
:deep(.el-pagination .btn-next),
:deep(.el-pagination .el-pager li) {
  background: rgba(20, 30, 50, 0.6) !important;
  color: rgba(255, 255, 255, 0.8) !important;
  border: 1px solid rgba(0, 255, 255, 0.2) !important;
}

:deep(.el-pagination .btn-prev:hover),
:deep(.el-pagination .btn-next:hover),
:deep(.el-pagination .el-pager li:hover) {
  background: rgba(0, 255, 255, 0.1) !important;
  color: #00ffff !important;
}

:deep(.el-pagination .el-pager li.is-active) {
  background: rgba(0, 255, 255, 0.2) !important;
  color: #00ffff !important;
  border-color: #00ffff !important;
}

:deep(.el-pagination .el-pagination__sizes .el-select .el-input__wrapper) {
  background: rgba(20, 30, 50, 0.8) !important;
  border: 1px solid rgba(0, 255, 255, 0.3) !important;
}

:deep(.el-pagination .el-pagination__jump .el-input__wrapper) {
  background: rgba(20, 30, 50, 0.8) !important;
  border: 1px solid rgba(0, 255, 255, 0.3) !important;
}

:deep(.el-dialog) {
  background: rgba(15, 25, 45, 0.95) !important;
  border: 1px solid rgba(0, 255, 255, 0.2) !important;
  border-radius: 12px !important;
  backdrop-filter: blur(10px) !important;
}

:deep(.el-dialog__header) {
  background: rgba(20, 30, 50, 0.8) !important;
  border-bottom: 1px solid rgba(0, 255, 255, 0.2) !important;
  border-radius: 12px 12px 0 0 !important;
}

:deep(.el-dialog__title) {
  color: #00ffff !important;
}

:deep(.el-dialog__body) {
  background: rgba(15, 25, 45, 0.95) !important;
  color: rgba(255, 255, 255, 0.9) !important;
}
</style>