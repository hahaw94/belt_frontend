<template>
  <div class="immediate-command">
    <div class="control-panel">
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

    <div class="content-area">
      <el-tabs v-model="activeTab" class="command-tabs">
        <el-tab-pane label="待处理告警" name="pending">
          <el-table :data="pendingAlarms" style="width: 100%">
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
          <el-table :data="processedAlarms" style="width: 100%">
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
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Refresh } from '@element-plus/icons-vue'

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
      handleRowClick
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

.control-panel {
  background: #fff;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.content-area {
  flex: 1;
  background: #fff;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
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
</style>