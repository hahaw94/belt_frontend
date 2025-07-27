<template>
  <div class="alarm-display">
    <div class="search-panel">
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

    <div class="content-area">
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

.search-panel {
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
  color: #606266;
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
</style>