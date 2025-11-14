<template>
  <div class="data-collection tech-page-container">
    <!-- 科技感背景 -->
    <div class="tech-background"></div>
    
    <h2>数据样本采集</h2>
    
    <!-- 搜索筛选卡片 -->
    <div class="search-filters-card tech-card mb-20">
      <div class="search-filters-header">
        <span class="filter-title">搜索筛选</span>
      </div>
      <div class="search-filters-content">
        <div class="filter-row">
          <div class="filter-item filter-item-wide">
            <label for="timeRange">时间范围</label>
            <el-date-picker
              v-model="searchForm.timeRange"
              id="timeRange"
              type="datetimerange"
              range-separator="至"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
              :shortcuts="dateShortcuts"
              class="tech-input"
              value-format="YYYY-MM-DD HH:mm:ss"
            />
          </div>
          <div class="filter-item">
            <label for="sampleType">样本类型</label>
            <el-select
              v-model="searchForm.sampleType"
              id="sampleType"
              placeholder="全部"
              class="tech-select"
              clearable
            >
              <el-option label="全部" value="" />
              <el-option label="误报样本" value="false_positive" />
            </el-select>
          </div>
          <div class="filter-item">
            <label for="exportStatus">导出状态</label>
            <el-select
              v-model="searchForm.exportStatus"
              id="exportStatus"
              placeholder="全部"
              class="tech-select"
              clearable
            >
              <el-option label="全部" value="" />
              <el-option label="未导出" :value="false" />
              <el-option label="已导出" :value="true" />
            </el-select>
          </div>
          <div class="filter-actions">
            <el-button type="primary" :icon="Search" class="tech-button-sm" @click="handleSearch">搜索</el-button>
            <el-button :icon="Refresh" class="tech-button-sm" @click="handleReset">重置</el-button>
          </div>
        </div>
      </div>
    </div>
    
    <div class="content-area tech-card">
      <div class="button-group">
        <el-button type="primary" :icon="Download" size="small" class="tech-button-sm" @click="handleExport">
          导出选中样本
        </el-button>
        <el-button type="warning" :icon="Download" size="small" class="tech-button-sm" @click="handleExportAll">
          导出所有误报
        </el-button>
        <el-button type="success" :icon="Upload" size="small" class="tech-button-sm" @click="handleUpload">
          上传至训练平台
        </el-button>
        <el-button type="info" :icon="Upload" size="small" class="tech-button-sm" @click="handlePackageAll">
          打包所有误报
        </el-button>
      </div>

      <div class="tech-table">
        <el-table
          :data="sampleList"
          v-loading="loading"
          style="width: 100%"
          @selection-change="handleSelectionChange"
          :border="false"
        >
        <el-table-column type="selection" width="55" />
        <el-table-column type="index" label="序号" width="80" align="center" header-align="center" />
        <el-table-column prop="time" label="告警时间" width="180" header-align="center" />
        <el-table-column prop="type" label="告警类型" width="120" header-align="center" />
        <el-table-column prop="level" label="级别" width="80" align="center" header-align="center" />
        <el-table-column prop="location" label="位置" width="150" header-align="center" />
        <el-table-column prop="description" label="描述" min-width="200" header-align="center" />
        <el-table-column prop="status" label="导出状态" width="120" align="center" header-align="center">
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
      </div>

      <!-- 增强型分页组件 -->
      <div class="pagination-container tech-pagination">
        <div class="pagination-info">
          <span>共 <span class="total-count">{{ total }}</span> 条记录，每页显示 
            <el-select 
              v-model="pageSize" 
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
            :disabled="currentPage === 1"
            @click="goToPage(1)"
          >
            首页
          </el-button>
          <el-button 
            class="pagination-btn"
            size="small" 
            :disabled="currentPage === 1"
            @click="goToPage(currentPage - 1)"
          >
            上一页
          </el-button>
          <div class="pagination-pages">
            <button 
              v-for="page in visiblePages" 
              :key="page"
              class="page-btn"
              :class="{ active: page === currentPage }"
              @click="goToPage(page)"
            >
              {{ page }}
            </button>
          </div>
          <el-button 
            class="pagination-btn"
            size="small" 
            :disabled="currentPage === totalPages"
            @click="goToPage(currentPage + 1)"
          >
            下一页
          </el-button>
          <el-button 
            class="pagination-btn"
            size="small" 
            :disabled="currentPage === totalPages"
            @click="goToPage(totalPages)"
          >
            末页
          </el-button>
        </div>
      </div>
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
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Download,
  Upload,
  Search,
  Refresh
} from '@element-plus/icons-vue'
import { eventApi } from '@/api/event'

export default {
  name: 'DataCollection',
  setup() {
    // 搜索表单
    const searchForm = ref({
      timeRange: [],
      sampleType: 'false_positive', // 默认显示误报样本
      exportStatus: ''
    })

    // 加载状态
    const loading = ref(false)

    // 分页相关
    const currentPage = ref(1)
    const pageSize = ref(10)
    const total = ref(100)

    // 计算总页数
    const totalPages = computed(() => {
      return Math.ceil(total.value / pageSize.value) || 1
    })

    // 计算可见页码
    const visiblePages = computed(() => {
      const maxVisiblePages = 5
      const totalPagesValue = totalPages.value
      const currentPageValue = currentPage.value
      
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

    // 告警类型映射
    const alarmTypeMap = {
      'person_intrusion': '人员入侵',
      'behavior': '异常行为',
      'object': '可疑物品',
      'intrusion': '区域入侵',
      'smoke_detection': '烟雾检测',
      'fire_detection': '火灾检测'
    }

    // 告警级别映射
    const alarmLevelMap = {
      1: '低',
      2: '中',
      3: '高'
    }

    // 日期快捷选项
    const dateShortcuts = [
      {
        text: '最近一天',
        value: () => {
          const end = new Date()
          const start = new Date()
          start.setTime(start.getTime() - 3600 * 1000 * 24)
          return [start, end]
        }
      },
      {
        text: '最近七天',
        value: () => {
          const end = new Date()
          const start = new Date()
          start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
          return [start, end]
        }
      },
      {
        text: '最近一个月',
        value: () => {
          const end = new Date()
          const start = new Date()
          start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
          return [start, end]
        }
      }
    ]

    // 表格数据（从后端获取）
    const sampleList = ref([])

    // 选中的样本
    const selectedSamples = ref([])

    // 对话框控制
    const previewDialogVisible = ref(false)
    const uploadDialogVisible = ref(false)
    const selectedSample = ref(null)
    const uploadProgress = ref(0)

    // 获取图片URL
    const getImageUrl = (path) => {
      if (!path) return ''
      if (path.startsWith('http://') || path.startsWith('https://')) {
        return path
      }
      return `${import.meta.env.VITE_API_BASE_URL || ''}${path}`
    }

    // 加载误报样本列表
    const loadSampleList = async () => {
      loading.value = true
      try {
        const params = {
          page: currentPage.value,
          page_size: pageSize.value,
          status: 2 // 只查询误报告警 (status=2)
        }

        // 时间范围
        if (searchForm.value.timeRange && searchForm.value.timeRange.length === 2) {
          params.start_time = searchForm.value.timeRange[0]
          params.end_time = searchForm.value.timeRange[1]
        }

        // 导出状态筛选
        if (searchForm.value.exportStatus !== '') {
          params.is_exported = searchForm.value.exportStatus
        }

        const response = await eventApi.getAlarmList(params)
        console.log('API响应:', response)
        
        if (response) {
          const alarmData = response.data || []
          
          if (Array.isArray(alarmData)) {
            sampleList.value = alarmData.map(alarm => ({
              id: alarm.id,
              time: alarm.alarm_time,
              type: alarmTypeMap[alarm.alarm_type] || alarm.alarm_type,
              typeRaw: alarm.alarm_type,
              level: alarmLevelMap[alarm.alarm_level] || alarm.alarm_level,
              location: alarm.location || alarm.camera_name || '-',
              description: `${alarm.location || alarm.camera_name || '未知位置'}检测到${alarmTypeMap[alarm.alarm_type] || alarm.alarm_type}`,
              status: alarm.is_exported ? '已导出' : '未导出',
              isExported: alarm.is_exported,
              alarmCode: alarm.alarm_code,
              snapshotPath: alarm.snapshot_path,
              videoPath: alarm.video_path,
              images: alarm.snapshot_path ? [getImageUrl(alarm.snapshot_path)] : []
            }))
          } else {
            console.error('API返回的data不是数组:', alarmData)
            sampleList.value = []
          }
          
          total.value = response.total || 0
        } else {
          sampleList.value = []
          total.value = 0
        }
      } catch (error) {
        console.error('加载样本列表失败：', error)
        ElMessage.error('加载样本列表失败：' + (error.message || '未知错误'))
        sampleList.value = []
        total.value = 0
      } finally {
        loading.value = false
      }
    }

    // 搜索
    const handleSearch = () => {
      currentPage.value = 1
      loadSampleList()
    }

    // 重置
    const handleReset = () => {
      searchForm.value = {
        timeRange: [],
        sampleType: 'false_positive',
        exportStatus: ''
      }
      currentPage.value = 1
      loadSampleList()
    }

    // 获取状态标签类型
    const getStatusType = (status) => {
      return status === '已导出' ? 'success' : 'info'
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

    // 导出选中样本
    const handleExport = async () => {
      if (selectedSamples.value.length === 0) {
        ElMessage.warning('请选择要导出的样本')
        return
      }

      try {
        const alarmIds = selectedSamples.value.map(item => item.id)
        const response = await eventApi.exportFalsePositives({ alarm_ids: alarmIds })
        
        if (response && response.download_url) {
          // 自动下载
          const link = document.createElement('a')
          link.href = response.download_url
          link.download = response.file_name || 'false_positives.zip'
          link.click()
          
          ElMessage.success(`已导出 ${selectedSamples.value.length} 个样本`)
          
          // 刷新列表
          loadSampleList()
        } else {
          ElMessage.error('导出失败：未返回下载链接')
        }
      } catch (error) {
        console.error('导出样本失败：', error)
        ElMessage.error('导出样本失败：' + (error.message || '未知错误'))
      }
    }

    // 导出所有误报
    const handleExportAll = async () => {
      try {
        await ElMessageBox.confirm(
          '确认要导出所有误报样本吗？',
          '提示',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )

        const response = await eventApi.exportFalsePositives({})
        
        if (response && response.download_url) {
          // 自动下载
          const link = document.createElement('a')
          link.href = response.download_url
          link.download = response.file_name || 'false_positives_all.zip'
          link.click()
          
          ElMessage.success(`已导出所有误报样本，共 ${response.alarm_count || 0} 条`)
          
          // 刷新列表
          loadSampleList()
        } else {
          ElMessage.error('导出失败：未返回下载链接')
        }
      } catch (error) {
        if (error !== 'cancel') {
          console.error('导出所有误报失败：', error)
          ElMessage.error('导出失败：' + (error.message || '未知错误'))
        }
      }
    }

    // 上传选中样本至训练平台
    const handleUpload = async () => {
      if (selectedSamples.value.length === 0) {
        ElMessage.warning('请选择要上传的样本')
        return
      }

      uploadDialogVisible.value = true
      uploadProgress.value = 0

      try {
        // 模拟上传进度
        const progressTimer = setInterval(() => {
          if (uploadProgress.value < 90) {
            uploadProgress.value += 10
          }
        }, 300)

        const alarmIds = selectedSamples.value.map(item => item.id)
        const response = await eventApi.packageFalsePositives({ alarm_ids: alarmIds })
        
        clearInterval(progressTimer)
        uploadProgress.value = 100
        
        if (response) {
          ElMessage.success(`成功上传 ${selectedSamples.value.length} 个样本至训练平台`)
          
          // 延迟关闭对话框
          setTimeout(() => {
            uploadDialogVisible.value = false
            // 刷新列表
            loadSampleList()
          }, 1500)
        } else {
          uploadProgress.value = 0
          ElMessage.error('上传失败')
        }
      } catch (error) {
        uploadProgress.value = 0
        console.error('上传样本失败：', error)
        ElMessage.error('上传失败：' + (error.message || '未知错误'))
      }
    }

    // 打包所有误报至训练平台
    const handlePackageAll = async () => {
      try {
        await ElMessageBox.confirm(
          '确认要打包并上传所有误报样本至训练平台吗？',
          '提示',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )

        uploadDialogVisible.value = true
        uploadProgress.value = 0

        // 模拟上传进度
        const progressTimer = setInterval(() => {
          if (uploadProgress.value < 90) {
            uploadProgress.value += 10
          }
        }, 300)

        const response = await eventApi.packageFalsePositives({})
        
        clearInterval(progressTimer)
        uploadProgress.value = 100
        
        if (response) {
          ElMessage.success(`成功打包上传所有误报样本，共 ${response.alarm_count || 0} 条`)
          
          // 延迟关闭对话框
          setTimeout(() => {
            uploadDialogVisible.value = false
            // 刷新列表
            loadSampleList()
          }, 1500)
        } else {
          uploadProgress.value = 0
          ElMessage.error('打包上传失败')
        }
      } catch (error) {
        if (error !== 'cancel') {
          uploadProgress.value = 0
          console.error('打包上传失败：', error)
          ElMessage.error('打包上传失败：' + (error.message || '未知错误'))
        }
      }
    }

    // 分页处理
    const handleSizeChange = (val) => {
      pageSize.value = val
      currentPage.value = 1
      loadSampleList()
    }

    const handleCurrentChange = (val) => {
      currentPage.value = val
      loadSampleList()
    }

    // 跳转到指定页面
    const goToPage = (page) => {
      if (page < 1 || page > totalPages.value || page === currentPage.value) {
        return
      }
      currentPage.value = page
      loadSampleList()
    }

    // 组件挂载时加载数据
    onMounted(() => {
      loadSampleList()
    })

    return {
      loading,
      searchForm,
      dateShortcuts,
      sampleList,
      currentPage,
      pageSize,
      total,
      totalPages,
      visiblePages,
      selectedSamples,
      previewDialogVisible,
      uploadDialogVisible,
      selectedSample,
      uploadProgress,
      getStatusType,
      handleSelectionChange,
      handlePreview,
      handleExport,
      handleExportAll,
      handleUpload,
      handlePackageAll,
      handleSearch,
      handleReset,
      handleSizeChange,
      handleCurrentChange,
      goToPage,
      Download,
      Upload,
      Search,
      Refresh
    }
  }
}
</script>

<style scoped>
/* ==================== 科技感主题样式 ==================== */

/* 页面容器 */
.tech-page-container {
  position: relative;
  width: 100%;
  min-height: 100vh;
  max-height: 100vh;
  padding: 20px;
  padding-bottom: 40px;
  background: transparent;
  overflow-y: auto;
  overflow-x: hidden;
  box-sizing: border-box;
  height: calc(100vh - 120px);
  display: flex;
  flex-direction: column;
}

/* 标题样式 */
.data-collection h2 {
  margin: 24px 0 20px 0;
  color: #00ffff;
  font-size: 24px;
  font-weight: 600;
  text-shadow: 0 0 15px rgba(0, 255, 255, 0.6);
  position: relative;
  z-index: 10;
}

/* 搜索筛选卡片 */
.search-filters-card {
  position: relative;
  z-index: 10;
  background: rgba(15, 25, 45, 0.95) !important;
  border-radius: 12px !important;
  overflow: hidden !important;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.3),
    0 0 0 1px rgba(0, 255, 255, 0.2) !important;
  backdrop-filter: blur(10px) !important;
  border: none !important;
  margin-bottom: 20px !important;
  padding: 20px !important;
}

.search-filters-header {
  margin-bottom: 15px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(0, 255, 255, 0.2);
}

.filter-title {
  color: #00ffff;
  font-size: 16px;
  font-weight: 600;
  text-shadow: 0 0 8px rgba(0, 255, 255, 0.5);
}

.search-filters-content {
  padding: 0;
}

.filter-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr auto;
  gap: 15px;
  align-items: end;
}

.filter-item-wide {
  grid-column: span 1;
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

.filter-actions {
  display: flex;
  gap: 10px;
}

.mb-20 {
  margin-bottom: 20px;
}

@media (max-width: 1600px) {
  .filter-row {
    grid-template-columns: 2fr 1fr;
  }
  
  .filter-item:nth-child(3) {
    grid-column: 1;
  }
  
  .filter-actions {
    grid-column: 2;
    justify-content: flex-end;
  }
}

@media (max-width: 1200px) {
  .filter-row {
    grid-template-columns: 1fr 1fr;
  }
  
  .filter-item-wide {
    grid-column: span 2;
  }
  
  .filter-actions {
    grid-column: span 2;
  }
}

/* 自定义滚动条样式 - 科技感 */
.tech-page-container::-webkit-scrollbar {
  width: 8px;
  background: rgba(0, 0, 0, 0.1);
}

.tech-page-container::-webkit-scrollbar-track {
  background: rgba(0, 255, 255, 0.05);
  border-radius: 4px;
  border: 1px solid rgba(0, 255, 255, 0.1);
}

.tech-page-container::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, 
    rgba(0, 255, 255, 0.3) 0%, 
    rgba(0, 200, 255, 0.5) 50%, 
    rgba(0, 255, 255, 0.3) 100%);
  border-radius: 4px;
  border: 1px solid rgba(0, 255, 255, 0.2);
  box-shadow: 0 0 10px rgba(0, 255, 255, 0.2);
}

.tech-page-container::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, 
    rgba(0, 255, 255, 0.5) 0%, 
    rgba(0, 200, 255, 0.7) 50%, 
    rgba(0, 255, 255, 0.5) 100%);
  box-shadow: 0 0 15px rgba(0, 255, 255, 0.4);
}

.tech-page-container::-webkit-scrollbar-thumb:active {
  background: linear-gradient(180deg, 
    rgba(0, 255, 255, 0.7) 0%, 
    rgba(0, 200, 255, 0.9) 50%, 
    rgba(0, 255, 255, 0.7) 100%);
  box-shadow: 0 0 20px rgba(0, 255, 255, 0.6);
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

.data-collection {
  padding: 20px;
  height: calc(100vh - 120px);
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 科技感卡片样式 */
.tech-card {
  position: relative;
  z-index: 10;
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  margin-bottom: 20px;
}

.content-area {
  flex: 1;
  padding: 0;
  display: flex;
  flex-direction: column;
  background: transparent !important;
  border: none !important;
}

.button-group {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
  justify-content: flex-end;
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
  color: rgba(255, 255, 255, 0.8);
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
  color: rgba(255, 255, 255, 0.8);
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

/* 表格头部样式 - 参考联动规则管理的头部设计 */
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

/* 表格主体样式 - 参考联动规则管理的行设计 */
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

/* 悬停效果 - 参考联动规则管理的交互效果 */
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

/* 单元格样式 - 参考联动规则管理的单元格设计 */
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

/* 彻底移除所有表格边框 - 最终解决方案 */
.tech-table :deep(.el-table--border) {
  border: none !important;
  border-left: none !important;
  border-right: none !important;
  border-top: none !important;
  border-bottom: none !important;
  outline: none !important;
}

.tech-table :deep(.el-table--border .el-table__inner-wrapper) {
  border: none !important;
  border-left: none !important;
  border-right: none !important;
  border-top: none !important;
  border-bottom: none !important;
  outline: none !important;
}

.tech-table :deep(.el-table--border .el-table__inner-wrapper::after) {
  display: none !important;
  content: none !important;
}

.tech-table :deep(.el-table--border .el-table__inner-wrapper::before) {
  display: none !important;
  content: none !important;
}

/* 单元格边框控制 */
.tech-table :deep(.el-table--border td) {
  border-left: none !important;
  border-right: 1px solid rgba(0, 255, 255, 0.06) !important;
  border-top: none !important;
  border-bottom: none !important;
  outline: none !important;
}

.tech-table :deep(.el-table--border th) {
  border: none !important;
  border-left: none !important;
  border-right: 1px solid rgba(0, 255, 255, 0.1) !important;
  border-top: none !important;
  border-bottom: none !important;
  outline: none !important;
}

/* 移除表格外围的所有可能边框 */
.tech-table :deep(.el-table__body-wrapper) {
  border: none !important;
  outline: none !important;
}

.tech-table :deep(.el-table__header-wrapper) {
  border: none !important;
  outline: none !important;
}

.tech-table :deep(.el-table__footer-wrapper) {
  border: none !important;
  outline: none !important;
}

/* 最强力的边框移除 - 覆盖所有可能的边框样式 */
.tech-table :deep(*) {
  border-left: none !important;
  border-right: none !important;
  border-top: none !important;
  border-bottom: none !important;
}

.tech-table :deep(td) {
  border: none !important;
  border-right: 1px solid rgba(0, 255, 255, 0.06) !important;
}

.tech-table :deep(th) {
  border: none !important;
  border-right: 1px solid rgba(0, 255, 255, 0.1) !important;
}

.tech-table :deep(td:last-child),
.tech-table :deep(th:last-child) {
  border-right: none !important;
}

/* 移除表格容器本身的边框 */
.tech-table,
.tech-table :deep(.el-table),
.tech-table :deep(.el-table__inner-wrapper) {
  border: none !important;
  outline: none !important;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.3),
    0 0 0 1px rgba(0, 255, 255, 0.2) !important;
}

/* 空状态样式 */
.tech-table :deep(.el-table__empty-block) {
  background: transparent !important;
  border: none !important;
}

.tech-table :deep(.el-table__empty-text) {
  color: rgba(255, 255, 255, 0.6) !important;
  text-shadow: 0 0 10px rgba(0, 255, 255, 0.3) !important;
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

:deep(.el-pagination) {
  background: rgba(15, 25, 45, 0.8) !important;
  padding: 12px 16px !important;
  border-radius: 8px !important;
  border: 1px solid rgba(0, 255, 255, 0.2) !important;
  backdrop-filter: blur(10px) !important;
  box-shadow: 
    0 4px 16px rgba(0, 0, 0, 0.3),
    0 0 10px rgba(0, 255, 255, 0.1) !important;
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

/* 增强型分页样式 */
.tech-pagination {
  margin-top: 20px;
  margin-bottom: 20px;
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

:deep(.el-progress) {
  background: transparent !important;
}

:deep(.el-progress-bar) {
  background: rgba(20, 30, 50, 0.6) !important;
  border-radius: 10px !important;
}

:deep(.el-progress-bar__outer) {
  background: rgba(20, 30, 50, 0.6) !important;
  border: 1px solid rgba(0, 255, 255, 0.2) !important;
  border-radius: 10px !important;
}

:deep(.el-progress-bar__inner) {
  background: linear-gradient(90deg, #00ffff 0%, rgba(0, 255, 255, 0.8) 100%) !important;
  border-radius: 10px !important;
}

:deep(.el-image) {
  border: 1px solid rgba(0, 255, 255, 0.2) !important;
  border-radius: 8px !important;
  overflow: hidden !important;
}

:deep(.el-image:hover) {
  border-color: rgba(0, 255, 255, 0.5) !important;
  box-shadow: 0 0 10px rgba(0, 255, 255, 0.3) !important;
}

/* ==================== 超强力移除表格左右白线 ==================== */
/* 这是最终的强制覆盖，确保表格左右没有任何边框 */
.tech-table,
.tech-table :deep(.el-table),
.tech-table :deep(.el-table__inner-wrapper),
.tech-table :deep(.el-table__header-wrapper),
.tech-table :deep(.el-table__body-wrapper),
.tech-table :deep(.el-table__footer-wrapper) {
  border-left: 0 !important;
  border-right: 0 !important;
  border-left-width: 0 !important;
  border-right-width: 0 !important;
  border-left-style: none !important;
  border-right-style: none !important;
  border-left-color: transparent !important;
  border-right-color: transparent !important;
}

/* 移除所有可能的左右边框伪元素 */
.tech-table::before,
.tech-table::after,
.tech-table :deep(.el-table)::before,
.tech-table :deep(.el-table)::after,
.tech-table :deep(.el-table__inner-wrapper)::before,
.tech-table :deep(.el-table__inner-wrapper)::after,
.tech-table :deep(.el-table__header-wrapper)::before,
.tech-table :deep(.el-table__header-wrapper)::after,
.tech-table :deep(.el-table__body-wrapper)::before,
.tech-table :deep(.el-table__body-wrapper)::after {
  display: none !important;
  content: none !important;
  border: 0 !important;
  border-left: 0 !important;
  border-right: 0 !important;
  width: 0 !important;
  height: 0 !important;
}

/* 强制表格容器没有左右边框 */
.tech-table {
  border-left: 0 !important;
  border-right: 0 !important;
  box-sizing: border-box !important;
  overflow: hidden !important;
}

/* 确保表格的第一列和最后一列没有额外边框 */
.tech-table :deep(.el-table th:first-child),
.tech-table :deep(.el-table td:first-child) {
  border-left: 0 !important;
}

.tech-table :deep(.el-table th:last-child),
.tech-table :deep(.el-table td:last-child) {
  border-right: 0 !important;
}

/* 移除所有 border-patch 元素（Element Plus 添加的边框修复元素） */
.tech-table :deep([class*="border-left"]),
.tech-table :deep([class*="border-right"]) {
  display: none !important;
  width: 0 !important;
  height: 0 !important;
  border: 0 !important;
}

/* 最终的全局覆盖 */
.tech-table :deep(*[class*="el-table"]) {
  border-left: 0 !important;
  border-right: 0 !important;
}
</style>