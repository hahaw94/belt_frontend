<template>
  <div class="algorithm-warehouse-container sub-page-content">
    <h2>算法仓</h2>

    <!-- 算法上传 -->
    <el-card class="upload-card tech-card mb-20" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>算法模型上传</span>
        </div>
      </template>
      <div class="upload-content">
        <el-alert
          title="上传说明"
          type="info"
          description="支持手动上传算法模型文件，也支持训练平台自动下发。算法模型文件支持 .zip、.tar、.gz 等压缩包格式。"
          show-icon
          :closable="false"
          class="mb-20">
        </el-alert>
        
      <el-upload
          class="upload-demo"
          drag
          :action="uploadUrl"
          :headers="uploadHeaders"
          :on-success="handleUploadSuccess"
          :on-error="handleUploadError"
          :before-upload="beforeUpload"
          :data="uploadData"
          multiple
          accept=".zip,.tar,.gz,.py,.sh,.bin"
          :disabled="uploading">
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="el-upload__text">
            将算法文件拖拽至此 或 <em>点击上传</em>
        </div>
        <template #tip>
          <div class="el-upload__tip">
              支持 .zip、.tar、.gz 压缩包或 .py、.sh、.bin 脚本文件，单文件大小不超过 500MB
          </div>
        </template>
      </el-upload>

        <el-form :model="uploadForm" label-width="120px" class="upload-form mt-20">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="算法名称">
                <el-input v-model="uploadForm.algorithm_name" placeholder="请输入算法名称"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="算法版本">
                <el-input v-model="uploadForm.algorithm_version" placeholder="请输入版本号"></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="算法描述">
            <el-input 
              v-model="uploadForm.description" 
              type="textarea" 
              :rows="3" 
              placeholder="请输入算法功能描述">
            </el-input>
          </el-form-item>
        </el-form>
      </div>
    </el-card>

    <!-- 算法列表 -->
    <el-card class="algorithm-list-card tech-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>算法版本列表</span>
          <div>
            <el-button type="primary" :icon="Refresh" size="small" @click="getAlgorithmList" :loading="loading">刷新列表</el-button>
          </div>
        </div>
      </template>

      <!-- 算法表格 -->
      <el-table :data="paginatedAlgorithms" v-loading="loading" border stripe style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" align="center"></el-table-column>
        <el-table-column prop="name" label="算法名称" min-width="180"></el-table-column>
        <el-table-column prop="version" label="版本号" width="120">
          <template #default="{ row }">
            <el-tag type="primary" size="small">{{ row.version }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="type" label="文件类型" width="100" align="center">
          <template #default="{ row }">
            <el-tag size="small">{{ row.type }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="size" label="文件大小" width="120" align="center"></el-table-column>
        <el-table-column prop="upload_time" label="上传时间" width="160" align="center"></el-table-column>
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ getStatusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" align="center">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="deployAlgorithm(row)">
              部署
            </el-button>
            <el-button type="danger" size="small" @click="deleteAlgorithm(row)">
              删除
          </el-button>
        </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-section">
      <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange">
        </el-pagination>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { UploadFilled, Refresh } from '@element-plus/icons-vue'
import { algorithmApi } from '@/api/algorithm'

// 响应式数据
const loading = ref(false)
const uploading = ref(false)

// 上传表单
const uploadForm = reactive({
  algorithm_name: '',
  algorithm_version: '',
  description: ''
})

// 算法列表
const algorithmList = ref([])

// 分页
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 计算属性
const uploadUrl = computed(() => '/api/algorithms/upload')

const uploadHeaders = computed(() => ({
  'Authorization': `Bearer ${localStorage.getItem('token')}`
}))

const uploadData = computed(() => ({
  algorithm_name: uploadForm.algorithm_name,
  algorithm_version: uploadForm.algorithm_version,
  description: uploadForm.description
}))

const paginatedAlgorithms = computed(() => {
  const start = (pagination.currentPage - 1) * pagination.pageSize
  const end = start + pagination.pageSize
  return algorithmList.value.slice(start, end)
})

// 生命周期
onMounted(() => {
  getAlgorithmList()
})

// 方法
const getAlgorithmList = async () => {
  try {
    loading.value = true
    const response = await algorithmApi.getAlgorithmList()
    console.log('算法上传页面API响应:', response)
    if (response.success) {
      algorithmList.value = response.body.algorithms || []
      pagination.total = response.body.total || 0
      console.log('算法上传页面数据:', algorithmList.value)
    } else {
      ElMessage.error(response.message || '获取算法列表失败')
    }
  } catch (error) {
    console.error('算法上传页面API错误:', error)
    ElMessage.error('获取算法列表失败：' + error.message)
  } finally {
    loading.value = false
  }
}

const beforeUpload = (file) => {
  const allowedTypes = ['.zip', '.tar', '.gz', '.py', '.sh', '.bin']
  const fileName = file.name.toLowerCase()
  const isValidType = allowedTypes.some(type => fileName.endsWith(type))
  
  if (!isValidType) {
    ElMessage.error('只支持 .zip、.tar、.gz、.py、.sh、.bin 格式的文件')
    return false
  }
  
  const isLt500M = file.size / 1024 / 1024 < 500
  if (!isLt500M) {
    ElMessage.error('文件大小不能超过 500MB')
    return false
  }
  
  if (!uploadForm.algorithm_name) {
    ElMessage.error('请先填写算法名称')
    return false
  }
  
  uploading.value = true
  return true
}

const handleUploadSuccess = (response) => {
  uploading.value = false
  if (response.success) {
    ElMessage.success('算法上传成功')
    Object.assign(uploadForm, {
      algorithm_name: '',
      algorithm_version: '',
      description: ''
    })
    getAlgorithmList()
  } else {
    ElMessage.error('上传失败：' + response.message)
  }
}

const handleUploadError = (error) => {
  uploading.value = false
  ElMessage.error('上传文件失败：' + error.message)
}

const handleSizeChange = (size) => {
  pagination.pageSize = size
  pagination.currentPage = 1
}

const handleCurrentChange = (page) => {
  pagination.currentPage = page
}

const deployAlgorithm = (algorithm) => {
  ElMessage.info(`准备部署算法: ${algorithm.name} ${algorithm.version}`)
}

const deleteAlgorithm = async (algorithm) => {
  try {
    await ElMessageBox.confirm(
      `确认要删除算法 "${algorithm.name} ${algorithm.version}" 吗？此操作不可撤销。`,
      '确认删除算法',
      {
        confirmButtonText: '确认删除',
    cancelButtonText: '取消',
        type: 'error'
      }
    )
    
    const response = await algorithmApi.deleteAlgorithm(algorithm.id, { 
      confirm: true, 
      reason: '用户手动删除' 
    })
    if (response.data.success) {
      ElMessage.success('算法删除成功')
      getAlgorithmList()
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败：' + error.message)
    }
  }
}

// 辅助函数
const getStatusText = (status) => {
  const statusMap = {
    'published': '已发布',
    'testing': '测试中',
    'disabled': '已禁用'
  }
  return statusMap[status] || status
}

const getStatusType = (status) => {
  const typeMap = {
    'published': 'success',
    'testing': 'warning',
    'disabled': 'danger'
  }
  return typeMap[status] || 'info'
}
</script>

<style scoped>
.sub-page-content {
  min-height: calc(100vh - 140px);
  padding-bottom: 40px;
}

.algorithm-warehouse-container {
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

.upload-content {
  padding: 10px 0;
}

.upload-form {
  border-top: 1px solid #ebeef5;
  padding-top: 20px;
}

.pagination-section {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.mb-20 {
  margin-bottom: 20px;
}

.mt-20 {
  margin-top: 20px;
}

:deep(.el-upload-dragger) {
  width: 100%;
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

:deep(.el-upload) {
  background: transparent !important;
}

:deep(.el-upload-dragger) {
  background: rgba(20, 30, 50, 0.6) !important;
  border: 2px dashed rgba(0, 255, 255, 0.3) !important;
  color: rgba(255, 255, 255, 0.8) !important;
  border-radius: 8px !important;
}

:deep(.el-upload-dragger:hover) {
  border-color: rgba(0, 255, 255, 0.6) !important;
  background: rgba(20, 30, 50, 0.8) !important;
}

:deep(.el-upload__text) {
  color: rgba(255, 255, 255, 0.8) !important;
}

:deep(.el-upload__text em) {
  color: #00ffff !important;
}

:deep(.el-upload__tip) {
  color: rgba(255, 255, 255, 0.6) !important;
}

:deep(.el-icon--upload) {
  color: rgba(0, 255, 255, 0.7) !important;
}

:deep(.el-form-item__label) {
  color: rgba(255, 255, 255, 0.8) !important;
}

:deep(.el-input__wrapper) {
  background: rgba(20, 30, 50, 0.6) !important;
  border: 1px solid rgba(0, 255, 255, 0.2) !important;
  border-radius: 6px !important;
  box-shadow: none !important;
}

:deep(.el-input__wrapper:hover) {
  border-color: rgba(0, 255, 255, 0.4) !important;
}

:deep(.el-input__wrapper.is-focus) {
  border-color: #00ffff !important;
  box-shadow: 0 0 0 2px rgba(0, 255, 255, 0.2) !important;
}

:deep(.el-input__inner) {
  background: transparent !important;
  color: rgba(255, 255, 255, 0.9) !important;
}

:deep(.el-input__inner::placeholder) {
  color: rgba(255, 255, 255, 0.4) !important;
}

:deep(.el-textarea__inner) {
  background: rgba(20, 30, 50, 0.6) !important;
  border: 1px solid rgba(0, 255, 255, 0.2) !important;
  color: rgba(255, 255, 255, 0.9) !important;
  border-radius: 6px !important;
}

:deep(.el-textarea__inner:hover) {
  border-color: rgba(0, 255, 255, 0.4) !important;
}

:deep(.el-textarea__inner:focus) {
  border-color: #00ffff !important;
  box-shadow: 0 0 0 2px rgba(0, 255, 255, 0.2) !important;
}

:deep(.el-textarea__inner::placeholder) {
  color: rgba(255, 255, 255, 0.4) !important;
}

:deep(.el-alert) {
  background: rgba(20, 30, 50, 0.6) !important;
  border: 1px solid rgba(0, 255, 255, 0.2) !important;
  border-radius: 8px !important;
  margin-bottom: 20px;
}

:deep(.el-alert__title) {
  color: #00ffff !important;
}

:deep(.el-alert__description) {
  color: rgba(255, 255, 255, 0.8) !important;
}

:deep(.el-alert__icon) {
  color: rgba(0, 255, 255, 0.7) !important;
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

/* 更强力的表格样式覆盖 */
:deep(.el-table__header-wrapper) {
  background: transparent !important;
}

:deep(.el-table__body-wrapper) {
  background: transparent !important;
}

:deep(.el-table--border) {
  border: 1px solid rgba(0, 255, 255, 0.2) !important;
}

:deep(.el-table--border::after) {
  background-color: rgba(0, 255, 255, 0.2) !important;
}

:deep(.el-table::before) {
  background-color: rgba(0, 255, 255, 0.2) !important;
}

:deep(.el-table th.is-leaf) {
  border-bottom: 1px solid rgba(0, 255, 255, 0.2) !important;
}

:deep(.el-table td) {
  border-bottom: 1px solid rgba(0, 255, 255, 0.1) !important;
}

:deep(.el-table--striped .el-table__body tr:nth-child(2n) td) {
  background: rgba(20, 30, 50, 0.3) !important;
}

/* 分页组件更强力的样式覆盖 */
:deep(.el-pagination__total) {
  color: rgba(255, 255, 255, 0.8) !important;
}

:deep(.el-pagination__sizes) {
  color: rgba(255, 255, 255, 0.8) !important;
}

:deep(.el-pagination__sizes .el-select .el-input__wrapper) {
  background: rgba(20, 30, 50, 0.6) !important;
  border-color: rgba(0, 255, 255, 0.2) !important;
}

:deep(.el-pagination__jump) {
  color: rgba(255, 255, 255, 0.8) !important;
}

:deep(.el-pagination .btn-prev),
:deep(.el-pagination .btn-next) {
  background: rgba(20, 30, 50, 0.6) !important;
  border: 1px solid rgba(0, 255, 255, 0.2) !important;
  color: rgba(255, 255, 255, 0.8) !important;
}

:deep(.el-pagination .btn-prev:disabled),
:deep(.el-pagination .btn-next:disabled) {
  background: rgba(20, 30, 50, 0.3) !important;
  border-color: rgba(0, 255, 255, 0.1) !important;
  color: rgba(255, 255, 255, 0.3) !important;
}

/* 下拉选择器样式 */
:deep(.el-select-dropdown) {
  background: rgba(15, 25, 45, 0.95) !important;
  border: 1px solid rgba(0, 255, 255, 0.2) !important;
  backdrop-filter: blur(10px) !important;
}

:deep(.el-select-dropdown .el-select-dropdown__item) {
  background: transparent !important;
  color: rgba(255, 255, 255, 0.8) !important;
}

:deep(.el-select-dropdown .el-select-dropdown__item:hover) {
  background: rgba(0, 255, 255, 0.1) !important;
  color: #00ffff !important;
}

:deep(.el-select-dropdown .el-select-dropdown__item.selected) {
  background: rgba(0, 255, 255, 0.2) !important;
  color: #00ffff !important;
}

/* 标签组件样式 */
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
</style>