<template>
  <div class="immediate-command">
    <div class="control-panel tech-card">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="searchForm.timeRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
          />
        </el-form-item>
        <el-form-item label="处理状态">
          <el-select v-model="searchForm.status" placeholder="请选择处理状态">
            <el-option label="全部" value="" />
            <el-option label="待处理" value="pending" />
            <el-option label="已处理" value="processed" />
            <el-option label="已忽略" value="ignored" />
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
      <el-tabs v-model="activeTab" class="command-tabs" @tab-change="handleTabChange">
        <el-tab-pane label="待处理告警" name="pending">
          <el-table :key="'pending-table'" :data="pendingAlarms" style="width: 100%">
            <el-table-column type="selection" width="55" />
            <el-table-column type="index" width="50" />
            <el-table-column prop="time" label="时间" width="180" />
            <el-table-column prop="type" label="告警类型" width="120" />
            <el-table-column prop="location" label="位置" width="150" />
            <el-table-column prop="description" label="描述" />
            <el-table-column prop="level" label="级别" width="100">
              <template #default="{ row }">
                <el-tag :type="getAlarmLevelType(row.level)">
                  {{ row.level }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column fixed="right" label="操作" width="200">
              <template #default="{ row }">
                <el-button-group>
                  <el-button
                    link
                    type="primary"
                    @click="handleNotify(row)"
                  >
                    通知
                  </el-button>
                  <el-button
                    link
                    type="success"
                    @click="handleProcess(row)"
                  >
                    处理
                  </el-button>
                  <el-button
                    link
                    type="info"
                    @click="handleIgnore(row)"
                  >
                    忽略
                  </el-button>
                </el-button-group>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="已处理告警" name="processed">
          <el-table :key="'processed-table'" :data="processedAlarms" style="width: 100%">
            <el-table-column type="index" width="50" />
            <el-table-column prop="time" label="时间" width="180" />
            <el-table-column prop="type" label="告警类型" width="120" />
            <el-table-column prop="location" label="位置" width="150" />
            <el-table-column prop="description" label="描述" />
            <el-table-column prop="processor" label="处理人" width="120" />
            <el-table-column prop="processTime" label="处理时间" width="180" />
            <el-table-column prop="processMethod" label="处理方式" width="120" />
          </el-table>
        </el-tab-pane>
      </el-tabs>

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

    <!-- 通知方式对话框 -->
    <el-dialog
      v-model="notifyDialogVisible"
      title="选择通知方式"
      width="400px"
    >
      <el-form :model="notifyForm" label-width="80px">
        <el-form-item label="通知方式">
          <el-checkbox-group v-model="notifyForm.methods">
            <el-checkbox label="web">Web页面</el-checkbox>
            <el-checkbox label="email">邮件通知</el-checkbox>
            <el-checkbox label="sms">短信通知</el-checkbox>
            <el-checkbox label="app">APP推送</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="通知对象">
          <el-select
            v-model="notifyForm.receivers"
            multiple
            filterable
            placeholder="请选择通知对象"
          >
            <el-option
              v-for="user in userList"
              :key="user.id"
              :label="user.name"
              :value="user.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="notifyForm.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注信息"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="notifyDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleNotifySubmit">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 处理告警对话框 -->
    <el-dialog
      v-model="processDialogVisible"
      title="处理告警"
      width="500px"
    >
      <el-form :model="processForm" label-width="100px">
        <el-form-item label="处理方式">
          <el-radio-group v-model="processForm.method">
            <el-radio label="verify">确认处理</el-radio>
            <el-radio label="transfer">转交处理</el-radio>
            <el-radio label="delay">延迟处理</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item
          v-if="processForm.method === 'transfer'"
          label="转交对象"
        >
          <el-select v-model="processForm.transferTo" placeholder="请选择转交对象">
            <el-option
              v-for="user in userList"
              :key="user.id"
              :label="user.name"
              :value="user.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          v-if="processForm.method === 'delay'"
          label="延迟时间"
        >
          <el-date-picker
            v-model="processForm.delayTime"
            type="datetime"
            placeholder="请选择延迟处理时间"
          />
        </el-form-item>
        <el-form-item label="处理说明">
          <el-input
            v-model="processForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入处理说明"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="processDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleProcessSubmit">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, nextTick, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Refresh } from '@element-plus/icons-vue'

// 处理 ResizeObserver 错误
const handleResizeObserverError = () => {
  const resizeObserverErrDiv = document.getElementById('webpack-dev-server-client-overlay-div')
  const resizeObserverErr = document.getElementById('webpack-dev-server-client-overlay')
  if (resizeObserverErr) {
    resizeObserverErr.setAttribute('style', 'display: none')
  }
  if (resizeObserverErrDiv) {
    resizeObserverErrDiv.setAttribute('style', 'display: none')
  }
}

export default {
  name: 'ImmediateCommand',
  components: {
    Search,
    Refresh
  },
  setup() {
    // 搜索表单
    const searchForm = reactive({
      timeRange: [],
      status: ''
    })

    // 分页相关
    const currentPage = ref(1)
    const pageSize = ref(10)
    const total = ref(100)

    // 标签页
    const activeTab = ref('pending')

    // 模拟数据
    const pendingAlarms = ref([
      {
        id: 1,
        time: '2024-01-20 10:30:00',
        type: '异常行为',
        location: '前门',
        description: '检测到可疑人员逗留',
        level: '高危'
      },
      {
        id: 2,
        time: '2024-01-20 10:35:00',
        type: '可疑物品',
        location: '停车场',
        description: '检测到可疑包裹',
        level: '中危'
      }
    ])

    const processedAlarms = ref([
      {
        id: 3,
        time: '2024-01-20 09:30:00',
        type: '异常行为',
        location: '后门',
        description: '检测到翻越行为',
        processor: '张三',
        processTime: '2024-01-20 09:35:00',
        processMethod: '现场处理'
      }
    ])

    const userList = ref([
      { id: 1, name: '张三' },
      { id: 2, name: '李四' },
      { id: 3, name: '王五' }
    ])

    // 对话框控制
    const notifyDialogVisible = ref(false)
    const processDialogVisible = ref(false)
    const currentAlarm = ref(null)

    // 通知表单
    const notifyForm = reactive({
      methods: [],
      receivers: [],
      remark: ''
    })

    // 处理表单
    const processForm = reactive({
      method: 'verify',
      transferTo: '',
      delayTime: '',
      description: ''
    })

    // 处理搜索
    const handleSearch = () => {
      console.log('搜索条件：', searchForm)
      // 实现搜索逻辑
    }

    // 重置搜索
    const handleReset = () => {
      searchForm.timeRange = []
      searchForm.status = ''
    }

    // 获取告警级别标签类型
    const getAlarmLevelType = (level) => {
      const levelMap = {
        '高危': 'danger',
        '中危': 'warning',
        '低危': 'info'
      }
      return levelMap[level] || 'info'
    }

    // 通知告警
    const handleNotify = (row) => {
      console.log('通知告警：', row)
      currentAlarm.value = row
      notifyForm.methods = []
      notifyForm.receivers = []
      notifyForm.remark = ''
      notifyDialogVisible.value = true
    }

    // 提交通知
    const handleNotifySubmit = () => {
      if (notifyForm.methods.length === 0) {
        ElMessage.warning('请选择至少一种通知方式')
        return
      }
      if (notifyForm.receivers.length === 0) {
        ElMessage.warning('请选择至少一个通知对象')
        return
      }
      console.log('通知表单：', notifyForm)
      notifyDialogVisible.value = false
      ElMessage.success('通知已发送')
    }

    // 处理告警
    const handleProcess = (row) => {
      console.log('处理告警：', row)
      currentAlarm.value = row
      processForm.method = 'verify'
      processForm.transferTo = ''
      processForm.delayTime = ''
      processForm.description = ''
      processDialogVisible.value = true
    }

    // 提交处理
    const handleProcessSubmit = () => {
      if (processForm.method === 'transfer' && !processForm.transferTo) {
        ElMessage.warning('请选择转交对象')
        return
      }
      if (processForm.method === 'delay' && !processForm.delayTime) {
        ElMessage.warning('请选择延迟处理时间')
        return
      }
      console.log('处理表单：', processForm)
      processDialogVisible.value = false
      ElMessage.success('处理成功')
    }

    // 忽略告警
    const handleIgnore = (row) => {
      console.log('忽略告警：', row)
      ElMessage.success('已忽略该告警')
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
      handleProcess(row)
    }

    // 标签页切换处理
    const handleTabChange = async (tabName) => {
      try {
        console.log('Tab changed to:', tabName)
        // 使用 nextTick 确保 DOM 更新完成
        await nextTick()
        
        // 延迟处理以避免 ResizeObserver 错误
        setTimeout(() => {
          handleResizeObserverError()
        }, 100)
      } catch (error) {
        console.warn('Tab change error:', error)
      }
    }

    // 组件挂载时处理 ResizeObserver 错误
    onMounted(() => {
      // 全局错误处理
      window.addEventListener('error', (e) => {
        if (e.message && e.message.includes('ResizeObserver loop completed')) {
          e.stopImmediatePropagation()
          handleResizeObserverError()
        }
      })

      // 处理未捕获的 Promise 错误
      window.addEventListener('unhandledrejection', (e) => {
        if (e.reason && e.reason.message && e.reason.message.includes('ResizeObserver')) {
          e.preventDefault()
          handleResizeObserverError()
        }
      })
    })

    return {
      searchForm,
      currentPage,
      pageSize,
      total,
      activeTab,
      pendingAlarms,
      processedAlarms,
      userList,
      notifyDialogVisible,
      processDialogVisible,
      notifyForm,
      processForm,
      handleSearch,
      handleReset,
      getAlarmLevelType,
      handleNotify,
      handleNotifySubmit,
      handleProcess,
      handleProcessSubmit,
      handleIgnore,
      handleSizeChange,
      handleCurrentChange,
      handleRowClick,
      handleTabChange
    }
  }
}
</script>

<style scoped>
.immediate-command {
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

.control-panel {
  padding: 16px;
}

.content-area {
  flex: 1;
  padding: 16px;
  display: flex;
  flex-direction: column;
}

.command-tabs {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.command-tabs :deep(.el-tabs__content) {
  flex: 1;
  overflow: auto;
}

.command-tabs :deep(.el-tab-pane) {
  height: 100%;
}

.el-pagination {
  margin-top: 16px;
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

:deep(.el-tabs) {
  background: transparent !important;
}

:deep(.el-tabs__header) {
  background: transparent !important;
  border-bottom: 1px solid rgba(0, 255, 255, 0.2) !important;
}

:deep(.el-tabs__nav-wrap) {
  background: transparent !important;
}

:deep(.el-tabs__nav) {
  background: transparent !important;
}

:deep(.el-tabs__item) {
  background: transparent !important;
  color: rgba(255, 255, 255, 0.7) !important;
  border: none !important;
  transition: all 0.3s ease !important;
}

:deep(.el-tabs__item:hover) {
  color: rgba(0, 255, 255, 0.8) !important;
}

:deep(.el-tabs__item.is-active) {
  color: #00ffff !important;
  font-weight: 600 !important;
  text-shadow: 0 0 8px rgba(0, 255, 255, 0.5) !important;
}

:deep(.el-tabs__active-bar) {
  background: linear-gradient(90deg, #00ffff 0%, rgba(0, 255, 255, 0.6) 100%) !important;
  height: 3px !important;
  border-radius: 2px !important;
}

:deep(.el-tabs__content) {
  background: transparent !important;
  color: rgba(255, 255, 255, 0.9) !important;
}

:deep(.el-tab-pane) {
  background: transparent !important;
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

:deep(.el-checkbox) {
  color: rgba(255, 255, 255, 0.8) !important;
}

:deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
  background: rgba(0, 255, 255, 0.8) !important;
  border-color: #00ffff !important;
}

:deep(.el-checkbox__inner) {
  background: rgba(20, 30, 50, 0.6) !important;
  border: 1px solid rgba(0, 255, 255, 0.3) !important;
}

:deep(.el-checkbox__inner:hover) {
  border-color: rgba(0, 255, 255, 0.6) !important;
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

:deep(.el-button-group) {
  background: transparent !important;
}

:deep(.el-button-group .el-button) {
  background: rgba(20, 30, 50, 0.6) !important;
  border: 1px solid rgba(0, 255, 255, 0.3) !important;
  color: rgba(255, 255, 255, 0.8) !important;
}

:deep(.el-button-group .el-button:hover) {
  background: rgba(0, 255, 255, 0.1) !important;
  border-color: rgba(0, 255, 255, 0.5) !important;
  color: #00ffff !important;
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

:deep(.el-textarea__inner) {
  background: rgba(20, 30, 50, 0.85) !important;
  border: 1px solid rgba(0, 255, 255, 0.3) !important;
  color: rgba(255, 255, 255, 0.95) !important;
  border-radius: 6px !important;
}

:deep(.el-textarea__inner:hover) {
  border-color: rgba(0, 255, 255, 0.5) !important;
}

:deep(.el-textarea__inner:focus) {
  border-color: #00ffff !important;
  box-shadow: 0 0 0 2px rgba(0, 255, 255, 0.2) !important;
}
</style>