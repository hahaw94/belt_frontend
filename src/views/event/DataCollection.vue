<template>
  <div class="data-collection">
    <div class="control-panel">
      <el-form :inline="true" :model="searchForm">
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
      <div class="button-group">
        <el-button type="primary" @click="handleExport">
          <el-icon><Download /></el-icon>
          导出选中样本
        </el-button>
        <el-button type="success" @click="handleUpload">
          <el-icon><Upload /></el-icon>
          上传至训练平台
        </el-button>
      </div>

      <el-table
        :data="sampleList"
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column type="index" width="50" />
        <el-table-column prop="time" label="时间" width="180" />
        <el-table-column prop="type" label="样本类型" width="120" />
        <el-table-column prop="source" label="来源设备" width="150" />
        <el-table-column prop="description" label="描述" />
        <el-table-column prop="status" label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="操作" width="120">
          <template #default="{ row }">
            <el-button link type="primary" @click="handlePreview(row)">
              预览
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

    <!-- 预览对话框 -->
    <el-dialog
      v-model="previewDialogVisible"
      title="样本预览"
      width="60%"
    >
      <div v-if="selectedSample" class="sample-preview">
        <div class="preview-item">
          <span class="label">时间：</span>
          <span>{{ selectedSample.time }}</span>
        </div>
        <div class="preview-item">
          <span class="label">类型：</span>
          <span>{{ selectedSample.type }}</span>
        </div>
        <div class="preview-item">
          <span class="label">来源：</span>
          <span>{{ selectedSample.source }}</span>
        </div>
        <div class="preview-item">
          <span class="label">描述：</span>
          <span>{{ selectedSample.description }}</span>
        </div>
        <div class="preview-images">
          <el-image
            v-for="(image, index) in selectedSample.images"
            :key="index"
            :src="image"
            :preview-src-list="selectedSample.images"
            fit="cover"
            class="sample-image"
          />
        </div>
      </div>
    </el-dialog>

    <!-- 上传进度对话框 -->
    <el-dialog
      v-model="uploadDialogVisible"
      title="上传进度"
      width="30%"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="false"
    >
      <div class="upload-progress">
        <el-progress
          :percentage="uploadProgress"
          :status="uploadProgress === 100 ? 'success' : ''"
        />
        <div class="progress-text">
          {{ uploadProgress === 100 ? '上传完成' : '正在上传...' }}
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button
            :disabled="uploadProgress !== 100"
            @click="uploadDialogVisible = false"
          >
            关闭
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Search,
  Refresh,
  Download,
  Upload
} from '@element-plus/icons-vue'

export default {
  name: 'DataCollection',
  components: {
    Search,
    Refresh,
    Download,
    Upload
  },
  setup() {
    // 搜索表单
    const searchForm = reactive({
      timeRange: [],
      sampleType: ''
    })

    // 分页相关
    const currentPage = ref(1)
    const pageSize = ref(10)
    const total = ref(100)

    // 表格数据
    const sampleList = ref([
      {
        id: 1,
        time: '2024-01-20 10:30:00',
        type: '误报样本',
        source: '摄像头1',
        description: '误报：正常人员活动',
        status: '未处理',
        images: [
          'https://example.com/image1.jpg',
          'https://example.com/image2.jpg'
        ]
      },
      {
        id: 2,
        time: '2024-01-20 11:20:00',
        type: '漏报样本',
        source: '摄像头2',
        description: '漏报：未检测到异常行为',
        status: '已上传',
        images: [
          'https://example.com/image3.jpg'
        ]
      }
    ])

    // 选中的样本
    const selectedSamples = ref([])

    // 对话框控制
    const previewDialogVisible = ref(false)
    const uploadDialogVisible = ref(false)
    const selectedSample = ref(null)
    const uploadProgress = ref(0)

    // 处理搜索
    const handleSearch = () => {
      console.log('搜索条件：', searchForm)
      // 实现搜索逻辑
    }

    // 重置搜索
    const handleReset = () => {
      searchForm.timeRange = []
      searchForm.sampleType = ''
    }

    // 获取状态标签类型
    const getStatusType = (status) => {
      const statusMap = {
        '未处理': 'info',
        '已上传': 'success',
        '处理中': 'warning'
      }
      return statusMap[status] || 'info'
    }

    // 表格选择变化
    const handleSelectionChange = (selection) => {
      selectedSamples.value = selection
    }

    // 预览样本
    const handlePreview = (row) => {
      selectedSample.value = row
      previewDialogVisible.value = true
    }

    // 导出样本
    const handleExport = () => {
      if (selectedSamples.value.length === 0) {
        ElMessage.warning('请选择要导出的样本')
        return
      }
      // 实现导出逻辑
      ElMessage.success(`已导出 ${selectedSamples.value.length} 个样本`)
    }

    // 上传样本
    const handleUpload = () => {
      if (selectedSamples.value.length === 0) {
        ElMessage.warning('请选择要上传的样本')
        return
      }
      uploadDialogVisible.value = true
      uploadProgress.value = 0
      // 模拟上传进度
      const timer = setInterval(() => {
        if (uploadProgress.value < 100) {
          uploadProgress.value += 10
        } else {
          clearInterval(timer)
          ElMessage.success('样本上传成功')
        }
      }, 300)
    }

    // 分页处理
    const handleSizeChange = (val) => {
      pageSize.value = val
      // 重新加载数据
    }

    const handleCurrentChange = (val) => {
      currentPage.value = val
      // 重新加载数据
    }

    return {
      searchForm,
      sampleList,
      currentPage,
      pageSize,
      total,
      selectedSamples,
      previewDialogVisible,
      uploadDialogVisible,
      selectedSample,
      uploadProgress,
      handleSearch,
      handleReset,
      getStatusType,
      handleSelectionChange,
      handlePreview,
      handleExport,
      handleUpload,
      handleSizeChange,
      handleCurrentChange
    }
  }
}
</script>

<style scoped>
.data-collection {
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
  gap: 16px;
}

.button-group {
  display: flex;
  gap: 10px;
}

.sample-preview {
  padding: 20px;
}

.preview-item {
  margin-bottom: 16px;
  display: flex;
  align-items: center;
}

.preview-item .label {
  width: 80px;
  color: #606266;
}

.preview-images {
  margin-top: 20px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.sample-image {
  width: 200px;
  height: 150px;
  border-radius: 4px;
  cursor: pointer;
}

.upload-progress {
  padding: 20px;
  text-align: center;
}

.progress-text {
  margin-top: 10px;
  color: #606266;
}
</style>