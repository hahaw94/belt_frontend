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

      <!-- 算法搜索和筛选 -->
      <div class="search-filters-card tech-card mb-20">
        <div class="search-section">
          <div class="search-filters">
            <div class="search-row">
              <div class="search-item">
                <label>算法名称</label>
                <el-input
                  v-model="algorithmFilters.name"
                  placeholder="请输入算法名称"
                  :prefix-icon="Search"
                  clearable
                  class="search-input"
                />
              </div>
              <div class="search-item">
                <label>算法状态</label>
                <div class="custom-select" ref="statusSelectRef">
                  <div class="custom-select-input" @click="toggleStatusDropdown">
                    <span class="custom-select-value">{{ getStatusDisplayText(algorithmFilters.status) }}</span>
                    <el-icon class="custom-select-arrow" :class="{ 'is-reverse': statusDropdownVisible }">
                      <ArrowDown />
                    </el-icon>
                  </div>
                </div>
              </div>
              <div class="search-item">
                <label>版本范围</label>
                <el-input
                  v-model="algorithmFilters.version"
                  placeholder="请输入版本号"
                  clearable
                  class="search-input"
                />
              </div>
            </div>
            <div class="filter-actions">
              <el-button type="primary" :icon="Search" class="tech-button-sm" @click="searchAlgorithms">搜索</el-button>
              <el-button :icon="RefreshRight" class="tech-button-sm" @click="resetAlgorithmFilters">重置</el-button>
            </div>
          </div>
        </div>
      </div>

      <!-- 算法表格 -->
      <el-table :data="paginatedAlgorithms" v-loading="loading" border stripe class="tech-table" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" align="center" header-align="center"></el-table-column>
        <el-table-column prop="name" label="算法名称" min-width="150" header-align="center"></el-table-column>
        <el-table-column prop="version" label="版本号" width="120" align="center" header-align="center">
          <template #default="{ row }">
            <el-tag type="primary" size="small">{{ row.version }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" min-width="200" header-align="center"></el-table-column>
        <el-table-column prop="type" label="文件类型" width="100" align="center" header-align="center">
          <template #default="{ row }">
            <el-tag size="small">{{ row.type || 'ZIP' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="size" label="文件大小" width="120" align="center" header-align="center">
          <template #default="{ row }">
            {{ formatFileSize(row.size) }}
          </template>
        </el-table-column>
        <el-table-column prop="accuracy" label="准确率" width="100" align="center" header-align="center">
          <template #default="{ row }">
            <span v-if="row.accuracy">{{ (row.accuracy * 100).toFixed(1) }}%</span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="upload_time" label="上传时间" width="180" header-align="center"></el-table-column>
        <el-table-column prop="status" label="状态" width="100" align="center" header-align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ getStatusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="300" align="center" header-align="center">
          <template #default="{ row }">
            <el-button type="primary" :icon="View" size="small" class="tech-button-xs" @click="handleViewAlgorithm(row)">查看</el-button>
            <el-button type="warning" :icon="Edit" size="small" class="tech-button-xs" @click="handleEditAlgorithm(row)">编辑</el-button>
            <el-button type="success" :icon="Download" size="small" class="tech-button-xs" @click="handleDownloadAlgorithm(row)">下载</el-button>
            <el-button type="info" :icon="Promotion" size="small" class="tech-button-xs" @click="deployAlgorithm(row)">部署</el-button>
            <el-button type="danger" :icon="Delete" size="small" class="tech-button-xs" @click="deleteAlgorithm(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container tech-pagination">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="filteredAlgorithms.length"
          layout="total, sizes, prev, pager, next, jumper"
          background
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>

  <!-- 状态下拉框 - 使用Teleport渲染到body -->
  <Teleport to="body">
    <div 
      class="custom-select-dropdown-teleport" 
      v-show="statusDropdownVisible"
      :style="dropdownStyle"
    >
      <div 
        class="custom-select-option" 
        :class="{ 'is-selected': algorithmFilters.status === '' }"
        @click.stop="selectStatus('')"
      >
        全部
      </div>
      <div 
        class="custom-select-option" 
        :class="{ 'is-selected': algorithmFilters.status === 'published' }"
        @click.stop="selectStatus('published')"
      >
        已发布
      </div>
      <div 
        class="custom-select-option" 
        :class="{ 'is-selected': algorithmFilters.status === 'testing' }"
        @click.stop="selectStatus('testing')"
      >
        测试中
      </div>
      <div 
        class="custom-select-option" 
        :class="{ 'is-selected': algorithmFilters.status === 'disabled' }"
        @click.stop="selectStatus('disabled')"
      >
        已禁用
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  UploadFilled, Refresh, Search, RefreshRight, View, Edit, 
  Download, Promotion, Delete, ArrowDown 
} from '@element-plus/icons-vue'
import { algorithmApi } from '@/api/algorithm'

// 响应式数据
const loading = ref(false)
const uploading = ref(false)
const statusDropdownVisible = ref(false)
const statusSelectRef = ref()

// 上传表单
const uploadForm = reactive({
  algorithm_name: '',
  algorithm_version: '',
  description: ''
})

// 算法列表
const algorithmList = ref([])

// 算法筛选
const algorithmFilters = reactive({
  name: '',
  status: '',
  version: ''
})

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

// 筛选后的算法列表
const filteredAlgorithms = computed(() => {
  let filtered = algorithmList.value
  
  if (algorithmFilters.name) {
    filtered = filtered.filter(algo => 
      algo.name.toLowerCase().includes(algorithmFilters.name.toLowerCase())
    )
  }
  
  if (algorithmFilters.status) {
    filtered = filtered.filter(algo => algo.status === algorithmFilters.status)
  }
  
  if (algorithmFilters.version) {
    filtered = filtered.filter(algo => 
      algo.version.includes(algorithmFilters.version)
    )
  }
  
  return filtered
})

const paginatedAlgorithms = computed(() => {
  const start = (pagination.currentPage - 1) * pagination.pageSize
  const end = start + pagination.pageSize
  return filteredAlgorithms.value.slice(start, end)
})

// 下拉框位置计算
const dropdownStyle = computed(() => {
  if (!statusDropdownVisible.value || !statusSelectRef.value) {
    return {}
  }
  
  const rect = statusSelectRef.value.getBoundingClientRect()
  return {
    position: 'fixed',
    top: `${rect.bottom + 4}px`,
    left: `${rect.left}px`,
    width: `${rect.width}px`,
    zIndex: 9999
  }
})

// 生命周期
onMounted(() => {
  getAlgorithmList()
  
  // 点击外部关闭下拉框
  document.addEventListener('click', (e) => {
    if (statusSelectRef.value && !statusSelectRef.value.contains(e.target)) {
      statusDropdownVisible.value = false
    }
  })
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

// 搜索相关方法
const searchAlgorithms = () => {
  pagination.currentPage = 1
}

const resetAlgorithmFilters = () => {
  algorithmFilters.name = ''
  algorithmFilters.status = ''
  algorithmFilters.version = ''
  pagination.currentPage = 1
  statusDropdownVisible.value = false
}

// 自定义下拉框方法
const toggleStatusDropdown = () => {
  statusDropdownVisible.value = !statusDropdownVisible.value
  // 强制重新计算位置
  if (statusDropdownVisible.value) {
    setTimeout(() => {
      // 触发位置重新计算
    }, 0)
  }
}

const selectStatus = (value) => {
  algorithmFilters.status = value
  statusDropdownVisible.value = false
  searchAlgorithms()
}

const getStatusDisplayText = (status) => {
  const statusMap = {
    '': '全部',
    'published': '已发布',
    'testing': '测试中',
    'disabled': '已禁用'
  }
  return statusMap[status] || '请选择状态'
}

// 新增操作方法
const handleViewAlgorithm = (row) => {
  ElMessage.info(`查看算法：${row.name} ${row.version}`)
}

const handleEditAlgorithm = (row) => {
  ElMessage.info(`编辑算法：${row.name} ${row.version}`)
}

const handleDownloadAlgorithm = (row) => {
  ElMessage.info(`下载算法：${row.name} ${row.version}`)
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
const formatFileSize = (bytes) => {
  if (!bytes) return '-'
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
}

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

/* 分页器样式 */
.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.tech-pagination :deep(.el-pagination) {
  background: transparent !important;
}

.tech-pagination :deep(.el-pagination .el-pagination__total) {
  color: rgba(255, 255, 255, 0.8) !important;
}

.tech-pagination :deep(.el-pagination .el-pagination__sizes .el-select) {
  background: rgba(20, 30, 50, 0.6) !important;
  border: 1px solid rgba(0, 255, 255, 0.2) !important;
  border-radius: 6px !important;
}

.tech-pagination :deep(.el-pagination .btn-prev),
.tech-pagination :deep(.el-pagination .btn-next) {
  background: rgba(20, 30, 50, 0.6) !important;
  border: 1px solid rgba(0, 255, 255, 0.2) !important;
  color: rgba(255, 255, 255, 0.8) !important;
  border-radius: 6px !important;
}

.tech-pagination :deep(.el-pagination .btn-prev:hover),
.tech-pagination :deep(.el-pagination .btn-next:hover) {
  background: rgba(0, 255, 255, 0.1) !important;
  color: #00ffff !important;
}

.tech-pagination :deep(.el-pagination .el-pager li) {
  background: rgba(20, 30, 50, 0.6) !important;
  border: 1px solid rgba(0, 255, 255, 0.2) !important;
  color: rgba(255, 255, 255, 0.8) !important;
  border-radius: 6px !important;
  margin: 0 2px !important;
}

.tech-pagination :deep(.el-pagination .el-pager li:hover) {
  background: rgba(0, 255, 255, 0.1) !important;
  color: #00ffff !important;
}

.tech-pagination :deep(.el-pagination .el-pager li.is-active) {
  background: rgba(0, 200, 255, 0.8) !important;
  border-color: #00ffff !important;
  color: #ffffff !important;
}

.tech-pagination :deep(.el-pagination .el-pagination__jump) {
  color: rgba(255, 255, 255, 0.8) !important;
}

.tech-pagination :deep(.el-pagination .el-pagination__jump .el-input__wrapper) {
  background: rgba(20, 30, 50, 0.6) !important;
  border: 1px solid rgba(0, 255, 255, 0.2) !important;
  border-radius: 6px !important;
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

/* 搜索筛选区域样式 */
.search-filters-card {
  background: rgba(20, 30, 50, 0.8) !important;
  border: 1px solid rgba(0, 255, 255, 0.15) !important;
  border-radius: 8px !important;
  padding: 16px !important;
  margin-bottom: 16px !important;
  backdrop-filter: blur(5px) !important;
}

.search-section {
  width: 100%;
}

.search-filters {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.search-row {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: flex-end;
}

.search-item {
  flex: 1;
  min-width: 200px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.search-item label {
  font-size: 13px;
  color: rgba(0, 255, 255, 0.8) !important;
  font-weight: 500;
  margin: 0;
}

.search-input {
  min-width: 180px;
}

.search-select {
  min-width: 140px;
}

.filter-actions {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-shrink: 0;
}

/* 自定义下拉选择器样式 */
.custom-select {
  position: relative;
  min-width: 140px;
  width: 100%;
  cursor: pointer;
  overflow: visible !important;
}

/* 确保搜索区域不会裁剪下拉框 */
.search-filters-card,
.search-section,
.search-filters,
.search-row,
.search-item {
  overflow: visible !important;
}

.custom-select-input {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(20, 30, 50, 0.6) !important;
  border: 1px solid rgba(0, 255, 255, 0.2) !important;
  border-radius: 6px !important;
  padding: 8px 12px;
  color: rgba(255, 255, 255, 0.9) !important;
  transition: all 0.3s ease;
  min-height: 32px;
  box-sizing: border-box;
}

.custom-select-input:hover {
  border-color: rgba(0, 255, 255, 0.4) !important;
  box-shadow: 0 0 10px rgba(0, 255, 255, 0.1) !important;
}

.custom-select-value {
  flex: 1;
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
}

.custom-select-arrow {
  color: rgba(0, 255, 255, 0.7) !important;
  transition: all 0.3s ease !important;
  margin-left: 8px;
}

.custom-select-arrow.is-reverse {
  transform: rotate(180deg);
}

.custom-select-dropdown {
  /* 位置由动态style控制 */
  background: rgba(15, 25, 45, 0.95) !important;
  border: 1px solid rgba(0, 255, 255, 0.2) !important;
  border-radius: 8px !important;
  backdrop-filter: blur(10px) !important;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.3),
    0 0 20px rgba(0, 255, 255, 0.1) !important;
  height: auto !important;
  max-height: none !important;
  overflow: visible !important;
  padding: 4px 0 !important;
}

.custom-select-option {
  display: block !important;
  padding: 8px 12px !important;
  color: rgba(255, 255, 255, 0.8) !important;
  cursor: pointer !important;
  transition: all 0.3s ease !important;
  margin: 2px 4px !important;
  border-radius: 4px !important;
  font-size: 14px !important;
  white-space: nowrap !important;
  min-height: 32px !important;
  line-height: 1.2 !important;
  width: auto !important;
  height: auto !important;
  overflow: visible !important;
  visibility: visible !important;
  opacity: 1 !important;
}

.custom-select-option:hover {
  background: rgba(0, 255, 255, 0.15) !important;
  color: #00ffff !important;
  transform: translateX(2px);
  box-shadow: 0 2px 8px rgba(0, 255, 255, 0.2);
}

.custom-select-option.is-selected {
  background: rgba(0, 255, 255, 0.2) !important;
  color: #00ffff !important;
  font-weight: 600;
  box-shadow: inset 2px 0 0 #00ffff;
}

.custom-select-option.is-selected:hover {
  background: rgba(0, 255, 255, 0.25) !important;
}

/* 下拉框滚动条样式 */
.custom-select-dropdown::-webkit-scrollbar {
  width: 6px;
}

.custom-select-dropdown::-webkit-scrollbar-track {
  background: rgba(20, 30, 50, 0.4);
  border-radius: 3px;
}

.custom-select-dropdown::-webkit-scrollbar-thumb {
  background: rgba(0, 255, 255, 0.6);
  border-radius: 3px;
}

.custom-select-dropdown::-webkit-scrollbar-thumb:hover {
  background: #00ffff;
}

/* Teleport下拉框样式 */
.custom-select-dropdown-teleport {
  background: rgba(15, 25, 45, 0.95) !important;
  border: 1px solid rgba(0, 255, 255, 0.2) !important;
  border-radius: 8px !important;
  backdrop-filter: blur(10px) !important;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.3),
    0 0 20px rgba(0, 255, 255, 0.1) !important;
  padding: 4px 0 !important;
  min-width: 140px;
}

.custom-select-dropdown-teleport .custom-select-option {
  display: block !important;
  padding: 8px 12px !important;
  color: rgba(255, 255, 255, 0.8) !important;
  cursor: pointer !important;
  transition: all 0.3s ease !important;
  margin: 2px 4px !important;
  border-radius: 4px !important;
  font-size: 14px !important;
  white-space: nowrap !important;
  min-height: 32px !important;
  line-height: 1.2 !important;
}

.custom-select-dropdown-teleport .custom-select-option:hover {
  background: rgba(0, 255, 255, 0.15) !important;
  color: #00ffff !important;
  transform: translateX(2px);
  box-shadow: 0 2px 8px rgba(0, 255, 255, 0.2);
}

.custom-select-dropdown-teleport .custom-select-option.is-selected {
  background: rgba(0, 255, 255, 0.2) !important;
  color: #00ffff !important;
  font-weight: 600;
  box-shadow: inset 2px 0 0 #00ffff;
}

.custom-select-dropdown-teleport .custom-select-option.is-selected:hover {
  background: rgba(0, 255, 255, 0.25) !important;
}


/* 科技感按钮样式 */
.tech-button-sm {
  font-size: 13px !important;
  padding: 6px 12px !important;
  border: 1px solid rgba(0, 255, 255, 0.3) !important;
  background: rgba(0, 255, 255, 0.1) !important;
  color: #00ffff !important;
  border-radius: 6px !important;
  transition: all 0.3s ease !important;
  margin: 0 4px !important;
}

.tech-button-sm:hover {
  background: rgba(0, 255, 255, 0.2) !important;
  box-shadow: 0 0 20px rgba(0, 255, 255, 0.4) !important;
  transform: translateY(-1px) !important;
}

.tech-button-xs {
  font-size: 12px !important;
  padding: 4px 8px !important;
  border: 1px solid rgba(0, 255, 255, 0.3) !important;
  background: rgba(0, 255, 255, 0.08) !important;
  color: #00ffff !important;
  border-radius: 4px !important;
  transition: all 0.3s ease !important;
  margin: 0 2px !important;
}

.tech-button-xs:hover {
  background: rgba(0, 255, 255, 0.15) !important;
  box-shadow: 0 0 15px rgba(0, 255, 255, 0.3) !important;
  transform: translateY(-1px) !important;
}

/* 科技感表格 - 彻底解决白线问题 */
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

/* 移除所有可能的白色边框和分隔线 */
.tech-table :deep(.el-table__inner-wrapper) {
  border: none !important;
  border-left: none !important;
  border-right: none !important;
  border-top: none !important;
  border-bottom: none !important;
}

.tech-table :deep(.el-table__inner-wrapper::after) {
  display: none !important;
}

.tech-table :deep(.el-table__inner-wrapper::before) {
  display: none !important;
}

/* 移除表格外层的所有边框元素 */
.tech-table :deep(.el-table__border-left-patch) {
  display: none !important;
}

.tech-table :deep(.el-table__border-right-patch) {
display: none !important;
}

.tech-table :deep(.el-table__border-bottom-patch) {
  display: none !important;
}

.tech-table :deep(.el-table__border-top-patch) {
  display: none !important;
}

/* 强制移除Element Plus的默认边框样式 */
.tech-table :deep(.el-table--border) {
  border: none !important;
  border-left: none !important;
  border-right: none !important;
  border-top: none !important;
  border-bottom: none !important;
}

.tech-table :deep(.el-table--border::before) {
  display: none !important;
}

.tech-table :deep(.el-table--border::after) {
  display: none !important;
}

/* 表格头部样式 - 参考图片的头部设计 */
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

/* 表格主体样式 - 参考图片的行设计 */
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

/* 悬停效果 - 参考图片的交互效果 */
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

/* 单元格样式 - 参考图片的单元格设计 */
.tech-table :deep(.el-table__body-wrapper .el-table__body td) {
  background: transparent !important;
  color: rgba(255, 255, 255, 0.9) !important;
  border: none !important;
  border-bottom: none !important;
  border-right: 1px solid rgba(0, 255, 255, 0.05) !important;
  padding: 12px !important;
  font-size: 13px !important;
  line-height: 1.5 !important;
}

.tech-table :deep(.el-table__body-wrapper .el-table__body td:last-child) {
  border-right: none !important;
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

/* 下拉选择器样式 - 完整的主题色方案 */
:deep(.el-select-dropdown) {
  background: rgba(15, 25, 45, 0.95) !important;
  border: 1px solid rgba(0, 255, 255, 0.2) !important;
  backdrop-filter: blur(10px) !important;
  border-radius: 8px !important;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.3),
    0 0 20px rgba(0, 255, 255, 0.1) !important;
}

:deep(.el-select-dropdown .el-select-dropdown__item) {
  background: transparent !important;
  color: rgba(255, 255, 255, 0.8) !important;
  border: none !important;
  padding: 8px 12px !important;
  margin: 2px 4px !important;
  border-radius: 4px !important;
  transition: all 0.3s ease !important;
}

:deep(.el-select-dropdown .el-select-dropdown__item:hover) {
  background: rgba(0, 255, 255, 0.15) !important;
  color: #00ffff !important;
  transform: translateX(2px) !important;
  box-shadow: 0 2px 8px rgba(0, 255, 255, 0.2) !important;
}

:deep(.el-select-dropdown .el-select-dropdown__item.selected) {
  background: rgba(0, 255, 255, 0.2) !important;
  color: #00ffff !important;
  font-weight: 600 !important;
  box-shadow: inset 2px 0 0 #00ffff !important;
}

:deep(.el-select-dropdown .el-select-dropdown__item.is-disabled) {
  background: transparent !important;
  color: rgba(255, 255, 255, 0.3) !important;
}

/* 选择器输入框样式增强 */
:deep(.el-select .el-input__wrapper) {
  background: rgba(20, 30, 50, 0.6) !important;
  border: 1px solid rgba(0, 255, 255, 0.2) !important;
  border-radius: 6px !important;
  transition: all 0.3s ease !important;
}

:deep(.el-select .el-input__wrapper:hover) {
  border-color: rgba(0, 255, 255, 0.4) !important;
  box-shadow: 0 0 10px rgba(0, 255, 255, 0.1) !important;
}

:deep(.el-select .el-input__wrapper.is-focus) {
  border-color: #00ffff !important;
  box-shadow: 0 0 0 2px rgba(0, 255, 255, 0.2) !important;
}

:deep(.el-select .el-input__inner) {
  background: transparent !important;
  color: rgba(255, 255, 255, 0.9) !important;
}

:deep(.el-select .el-input__inner::placeholder) {
  color: rgba(255, 255, 255, 0.4) !important;
}

:deep(.el-select .el-input__suffix) {
  color: rgba(0, 255, 255, 0.7) !important;
}

:deep(.el-select .el-input__suffix .el-icon) {
  color: rgba(0, 255, 255, 0.7) !important;
  transition: all 0.3s ease !important;
}

:deep(.el-select .el-input__suffix .el-icon:hover) {
  color: #00ffff !important;
}

/* 下拉框滚动条样式 */
:deep(.el-select-dropdown .el-scrollbar__wrap) {
  background: transparent !important;
}

:deep(.el-select-dropdown .el-scrollbar__bar) {
  background: rgba(0, 255, 255, 0.3) !important;
  border-radius: 4px !important;
}

:deep(.el-select-dropdown .el-scrollbar__thumb) {
  background: rgba(0, 255, 255, 0.6) !important;
  border-radius: 4px !important;
}

:deep(.el-select-dropdown .el-scrollbar__thumb:hover) {
  background: #00ffff !important;
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