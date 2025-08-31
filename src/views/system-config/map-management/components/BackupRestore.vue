<template>
  <div class="backup-restore tech-page-container">
    <!-- 科技感背景 -->
    <div class="tech-background">
        </div>

    <!-- 头部操作区域 -->
    <div class="header-section mb-20">
          <span>备份文件列表</span>
      <div>
        <el-button type="primary" icon="Plus" size="small" class="tech-button-sm" @click="showCreateBackupDialog">创建备份</el-button>
        <el-button type="warning" icon="Upload" size="small" class="tech-button-sm" @click="showUploadRestoreDialog">从文件恢复</el-button>
        <el-button type="info" icon="Refresh" size="small" class="tech-button-sm" @click="loadBackupList">刷新列表</el-button>
        </div>
    </div>
      
    <!-- 表格区域 -->
    <div class="table-section">
      <el-table
        :data="backupList"
        v-loading="loading"
        stripe
        style="width: 100%"
        class="backup-table"
      >
        <el-table-column prop="file_name" label="备份文件名" min-width="250" />
        <el-table-column label="备份类型" width="120">
          <template #default="scope">
            <el-tag :type="scope.row.type === 'all' ? 'success' : 'warning'">
              {{ scope.row.type === 'all' ? '全量备份' : '选择备份' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="file_size" label="文件大小" width="120">
          <template #default="scope">
            {{ formatFileSize(scope.row.file_size) }}
          </template>
        </el-table-column>
        <el-table-column prop="create_time" label="创建时间" width="180">
          <template #default="scope">
            {{ formatDate(scope.row.create_time) }}
          </template>
        </el-table-column>
                <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <div class="action-buttons-row">
              <el-button type="text" size="small" class="tech-button-text" @click="downloadBackup(scope.row)">
                下载
              </el-button>
              <el-button type="text" size="small" class="tech-button-text tech-button-info" @click="showRestoreDialog(scope.row)">
                恢复
              </el-button>
              <el-button 
                type="text" 
                size="small" 
                class="tech-button-text tech-button-danger"
                @click="deleteBackup(scope.row)"
              >
                删除
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
      
      <el-empty v-if="!loading && backupList.length === 0" description="暂无备份文件" />
        </div>

    <!-- 创建备份对话框 -->
    <el-dialog
      title="创建地图备份"
      v-model="createBackupVisible"
      width="500px"
      @close="resetCreateBackupForm"
    >
      <el-form
        ref="createBackupFormRef"
        :model="createBackupForm"
        :rules="createBackupRules"
        label-width="100px"
      >
        <el-form-item label="备份名称" prop="backup_name">
          <el-input v-model="createBackupForm.backup_name" placeholder="请输入备份名称" />
        </el-form-item>
        <el-form-item label="备份类型" prop="backup_type">
          <el-radio-group v-model="createBackupForm.backup_type" @change="handleBackupTypeChange">
            <el-radio label="all">全量备份（所有图层）</el-radio>
            <el-radio label="selected">选择备份（指定图层）</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item 
          v-if="createBackupForm.backup_type === 'selected'" 
          label="选择图层" 
          prop="layer_ids"
        >
          <el-select
            v-model="createBackupForm.layer_ids"
            multiple
            placeholder="请选择要备份的图层"
            style="width: 100%;"
          >
            <el-option
              v-for="layer in layerList"
              :key="layer.id"
              :label="layer.layer_name"
              :value="layer.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="备份描述" prop="description">
          <el-input
            v-model="createBackupForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入备份描述（可选）"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button class="tech-button-secondary" @click="createBackupVisible = false">取消</el-button>
          <el-button type="primary" class="tech-button" @click="confirmCreateBackup" :loading="creating">
            创建备份
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 恢复确认对话框 -->
    <el-dialog
      title="恢复备份确认"
      v-model="restoreVisible"
      width="500px"
    >
      <div v-if="selectedBackup" class="restore-confirm">
        <el-alert
          title="恢复操作确认"
          type="warning"
          :closable="false"
          show-icon
          style="margin-bottom: 20px;"
        >
          <template #default>
            <p>您即将恢复以下备份文件：</p>
            <p><strong>{{ selectedBackup.file_name }}</strong></p>
            <p>备份类型：{{ selectedBackup.type === 'all' ? '全量备份' : '选择备份' }}</p>
            <p>创建时间：{{ formatDate(selectedBackup.create_time) }}</p>
          </template>
        </el-alert>
        
        <el-form label-width="120px">
          <el-form-item label="强制覆盖：">
            <el-switch
              v-model="restoreForm.force_restore"
              active-text="是"
              inactive-text="否"
            />
            <div style="font-size: 12px; color: #909399; margin-top: 4px;">
              开启后将强制覆盖现有的同名图层配置
            </div>
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button class="tech-button-secondary" @click="restoreVisible = false">取消</el-button>
          <el-button type="warning" class="tech-button-warning" @click="confirmRestore" :loading="restoring">
            确认恢复
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 上传恢复对话框 -->
    <el-dialog
      title="上传备份文件恢复"
      v-model="uploadRestoreVisible"
      width="500px"
      @close="resetUploadForm"
    >
      <el-form label-width="120px">
        <el-form-item label="备份文件：">
          <el-upload
            ref="uploadRef"
            :auto-upload="false"
            :limit="1"
            accept=".tar.gz"
            :before-upload="beforeUpload"
            :on-change="handleFileChange"
            :on-remove="handleFileRemove"
            drag
          >
            <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
            <div class="el-upload__text">
              将地图备份文件拖到此处，或<em>点击上传</em>
            </div>
            <template #tip>
              <div class="el-upload__tip">
                只能上传 .tar.gz 格式的地图备份文件
              </div>
            </template>
          </el-upload>
        </el-form-item>
        <el-form-item label="强制覆盖：">
          <el-switch
            v-model="uploadRestoreForm.force_restore"
            active-text="是"
            inactive-text="否"
          />
          <div style="font-size: 12px; color: #909399; margin-top: 4px;">
            开启后将强制覆盖现有的同名图层配置
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button class="tech-button-secondary" @click="uploadRestoreVisible = false">取消</el-button>
          <el-button 
            type="warning" 
            class="tech-button-warning"
            @click="confirmUploadRestore" 
            :loading="uploading"
            :disabled="!uploadRestoreForm.file"
          >
            开始恢复
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  UploadFilled 
} from '@element-plus/icons-vue'
import { 
  createMapBackup,
  getMapBackupList,
  downloadMapBackup,
  restoreMapBackup,
  deleteMapBackup,
  getLayerList
} from '@/api/map'

export default {
  name: 'BackupRestore',
  components: {
    UploadFilled
  },
  setup() {
    // 响应式数据
    const loading = ref(false)
    const creating = ref(false)
    const restoring = ref(false)
    const uploading = ref(false)
    const backupList = ref([])
    const layerList = ref([])
    const selectedBackup = ref(null)
    
    const createBackupVisible = ref(false)
    const restoreVisible = ref(false)
    const uploadRestoreVisible = ref(false)
    
    const createBackupFormRef = ref(null)
    const uploadRef = ref(null)

    const createBackupForm = reactive({
      backup_name: '',
      backup_type: 'all',
      layer_ids: [],
      description: ''
    })

    const restoreForm = reactive({
      force_restore: false
    })

    const uploadRestoreForm = reactive({
      file: null,
      force_restore: false
    })

    const createBackupRules = {
      backup_name: [
        { required: true, message: '请输入备份名称', trigger: 'blur' },
        { min: 1, max: 100, message: '长度在 1 到 100 个字符', trigger: 'blur' }
      ],
      backup_type: [
        { required: true, message: '请选择备份类型', trigger: 'change' }
      ],
      layer_ids: [
        { 
          validator: (rule, value, callback) => {
            if (createBackupForm.backup_type === 'selected' && (!value || value.length === 0)) {
              callback(new Error('请选择要备份的图层'))
            } else {
              callback()
            }
          }, 
          trigger: 'change' 
        }
      ]
    }

    // 加载备份列表
    const loadBackupList = async () => {
      loading.value = true
      try {
        const response = await getMapBackupList()
        if (response.code === 200) {
          // 确保 backupList 总是一个数组
          backupList.value = Array.isArray(response.data) ? response.data : []
        }
      } catch (error) {
        ElMessage.error('加载备份列表失败: ' + (error.message || '未知错误'))
      } finally {
        loading.value = false
      }
    }

    // 加载图层列表
    const loadLayers = async () => {
      try {
        const response = await getLayerList({ page: 1, size: 100, status: 1 })
        if (response.code === 200) {
          // 确保 layerList 总是一个数组
          layerList.value = Array.isArray(response.data?.list) ? response.data.list : []
        }
      } catch (error) {
        ElMessage.error('加载图层列表失败')
      }
    }

    // 显示创建备份对话框
    const showCreateBackupDialog = async () => {
      await loadLayers()
      createBackupVisible.value = true
    }

    // 备份类型变化处理
    const handleBackupTypeChange = (type) => {
      if (type === 'all') {
        createBackupForm.layer_ids = []
      }
    }

    // 创建备份
    const confirmCreateBackup = async () => {
      try {
        await createBackupFormRef.value.validate()
        creating.value = true

        const data = {
          backup_name: createBackupForm.backup_name,
          backup_type: createBackupForm.backup_type,
          description: createBackupForm.description || null
        }

        if (createBackupForm.backup_type === 'selected') {
          data.layer_ids = createBackupForm.layer_ids
        }

        await createMapBackup(data)
        ElMessage.success('备份创建成功')
        createBackupVisible.value = false
        loadBackupList()
      } catch (error) {
        ElMessage.error('创建备份失败: ' + (error.message || '未知错误'))
      } finally {
        creating.value = false
      }
    }

    // 重置创建备份表单
    const resetCreateBackupForm = () => {
      createBackupForm.backup_name = ''
      createBackupForm.backup_type = 'all'
      createBackupForm.layer_ids = []
      createBackupForm.description = ''
      if (createBackupFormRef.value) {
        createBackupFormRef.value.resetFields()
      }
    }

    // 下载备份
    const downloadBackup = async (backup) => {
      try {
        const response = await downloadMapBackup(backup.file_name)
        
        // 创建下载链接
        const blob = new Blob([response], { type: 'application/gzip' })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = backup.file_name
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
        
        ElMessage.success('下载完成')
      } catch (error) {
        ElMessage.error('下载失败: ' + (error.message || '未知错误'))
      }
    }

    // 显示恢复对话框
    const showRestoreDialog = (backup) => {
      selectedBackup.value = backup
      restoreForm.force_restore = false
      restoreVisible.value = true
    }

    // 确认恢复
    const confirmRestore = async () => {
      if (!selectedBackup.value) return
      
      try {
        restoring.value = true
        
        // 先下载备份文件，然后上传恢复
        const response = await downloadMapBackup(selectedBackup.value.file_name)
        const blob = new Blob([response], { type: 'application/gzip' })
        
        // 创建FormData对象进行恢复
        const formData = new FormData()
        formData.append('file', blob, selectedBackup.value.file_name)
        formData.append('force_restore', restoreForm.force_restore.toString())
        
        await restoreMapBackup(formData)
        
        ElMessage.success('恢复成功')
        restoreVisible.value = false
        loadBackupList()
      } catch (error) {
        ElMessage.error('恢复失败: ' + (error.message || '未知错误'))
      } finally {
        restoring.value = false
      }
    }

    // 删除备份
    const deleteBackup = (backup) => {
      ElMessageBox.confirm(
        `确定要删除备份文件"${backup.file_name}"吗？`,
        '删除确认',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(async () => {
        try {
          await deleteMapBackup(backup.file_name)
          ElMessage.success('删除成功')
          loadBackupList()
        } catch (error) {
          ElMessage.error('删除失败: ' + (error.message || '未知错误'))
        }
      })
    }

    // 显示上传恢复对话框
    const showUploadRestoreDialog = () => {
      uploadRestoreVisible.value = true
    }

    // 文件上传前验证
    const beforeUpload = (file) => {
      const isValidType = file.name.endsWith('.tar.gz')
      const isLt100M = file.size / 1024 / 1024 < 100

      if (!isValidType) {
        ElMessage.error('只能上传 .tar.gz 格式的备份文件!')
        return false
      }
      if (!isLt100M) {
        ElMessage.error('文件大小不能超过 100MB!')
        return false
      }
      return false // 阻止自动上传
    }

    // 文件变化处理
    const handleFileChange = (file) => {
      uploadRestoreForm.file = file.raw
    }

    // 文件移除处理
    const handleFileRemove = () => {
      uploadRestoreForm.file = null
    }

    // 确认上传恢复
    const confirmUploadRestore = async () => {
      if (!uploadRestoreForm.file) {
        ElMessage.warning('请选择备份文件')
        return
      }

      try {
        uploading.value = true
        
        const formData = new FormData()
        formData.append('file', uploadRestoreForm.file)
        formData.append('force_restore', uploadRestoreForm.force_restore.toString())
        
        await restoreMapBackup(formData)
        ElMessage.success('恢复成功')
        uploadRestoreVisible.value = false
        loadBackupList()
      } catch (error) {
        ElMessage.error('恢复失败: ' + (error.message || '未知错误'))
      } finally {
        uploading.value = false
      }
    }

    // 重置上传表单
    const resetUploadForm = () => {
      uploadRestoreForm.file = null
      uploadRestoreForm.force_restore = false
      if (uploadRef.value) {
        uploadRef.value.clearFiles()
      }
    }

    // 格式化文件大小
    const formatFileSize = (bytes) => {
      if (!bytes) return '-'
      const units = ['B', 'KB', 'MB', 'GB']
      let size = bytes
      let unitIndex = 0
      while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024
        unitIndex++
      }
      return `${size.toFixed(1)} ${units[unitIndex]}`
    }

    // 格式化日期
    const formatDate = (dateString) => {
      if (!dateString) return '-'
      return new Date(dateString).toLocaleString('zh-CN')
    }

    onMounted(() => {
      loadBackupList()
    })

    return {
      loading,
      creating,
      restoring,
      uploading,
      backupList,
      layerList,
      selectedBackup,
      createBackupVisible,
      restoreVisible,
      uploadRestoreVisible,
      createBackupFormRef,
      uploadRef,
      createBackupForm,
      restoreForm,
      uploadRestoreForm,
      createBackupRules,
      loadBackupList,
      showCreateBackupDialog,
      handleBackupTypeChange,
      confirmCreateBackup,
      resetCreateBackupForm,
      downloadBackup,
      showRestoreDialog,
      confirmRestore,
      deleteBackup,
      showUploadRestoreDialog,
      beforeUpload,
      handleFileChange,
      handleFileRemove,
      confirmUploadRestore,
      resetUploadForm,
      formatFileSize,
      formatDate
    }
  }
}
</script>

<style scoped>
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

/* 头部区域样式 */
.header-section {
  position: relative;
  z-index: 10;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: transparent;
  padding: 0;
}

.header-section span {
  color: #00ffff !important;
  font-size: 18px !important;
  font-weight: 600 !important;
  text-shadow: 0 0 15px rgba(0, 255, 255, 0.6) !important;
  letter-spacing: 1px !important;
}

.header-section div {
  display: flex;
  gap: 8px;
  align-items: center;
}

/* 表格区域样式 */
.table-section {
  position: relative;
  z-index: 10;
}

/* 备份表格样式 - 完全按照图层管理样式 */
.backup-table {
  margin-bottom: 20px;
}

/* 科技感表格样式 */
:deep(.backup-table.el-table) {
  background: rgba(0, 20, 40, 0.6) !important;
  border: 1px solid rgba(0, 255, 255, 0.3) !important;
  border-radius: 6px !important;
}

/* 强制去除表格的所有白色背景和边框 */
:deep(.backup-table.el-table),
:deep(.backup-table.el-table *) {
  background-color: transparent !important;
  background: transparent !important;
}

:deep(.backup-table.el-table) {
  background: rgba(0, 20, 40, 0.6) !important;
}

/* 去除表格底部和边框的白线 */
:deep(.backup-table.el-table::before),
:deep(.backup-table.el-table::after) {
  display: none !important;
  content: none !important;
  border: none !important;
  background: none !important;
}

:deep(.backup-table .el-table__inner-wrapper) {
  background: transparent !important;
  border: none !important;
}

:deep(.backup-table .el-table__inner-wrapper::before),
:deep(.backup-table .el-table__inner-wrapper::after) {
  display: none !important;
  content: none !important;
  border: none !important;
  background: none !important;
}

:deep(.backup-table .el-table__header-wrapper) {
  background: rgba(0, 30, 60, 0.8) !important;
  border: none !important;
}

:deep(.backup-table .el-table__header-wrapper::before),
:deep(.backup-table .el-table__header-wrapper::after) {
  display: none !important;
  content: none !important;
  border: none !important;
  background: none !important;
}

/* 去除表格左右边框和底部边框 */
:deep(.backup-table .el-table__body),
:deep(.backup-table .el-table__header),
:deep(.backup-table .el-table__body-wrapper),
:deep(.backup-table .el-table__header-wrapper) {
  border-left: none !important;
  border-right: none !important;
  border-bottom: none !important;
  background: transparent !important;
}

/* 强制移除所有可能的边框元素 */
:deep(.backup-table) {
  border: 1px solid rgba(0, 255, 255, 0.3) !important;
  border-left: 1px solid rgba(0, 255, 255, 0.3) !important;
  border-right: 1px solid rgba(0, 255, 255, 0.3) !important;
  box-sizing: border-box !important;
  position: relative !important;
}

/* 去除表格滚动条区域的白色背景 */
:deep(.backup-table .el-scrollbar) {
  background: transparent !important;
}

:deep(.backup-table .el-scrollbar__wrap) {
  background: transparent !important;
}

:deep(.backup-table .el-scrollbar__view) {
  background: transparent !important;
}

:deep(.backup-table .el-table__header th) {
  background: rgba(0, 30, 60, 0.8) !important;
  color: #00ffff !important;
  border-bottom: 1px solid rgba(0, 255, 255, 0.2) !important;
  border-right: 1px solid rgba(0, 255, 255, 0.1) !important;
  font-weight: 500 !important;
  text-shadow: 0 0 5px rgba(0, 255, 255, 0.3) !important;
}

:deep(.backup-table .el-table__header th:last-child) {
  border-right: none !important;
}

:deep(.backup-table .el-table__body-wrapper) {
  background: transparent !important;
}

:deep(.backup-table .el-table__body tr) {
  background: transparent !important;
}

:deep(.backup-table .el-table__body tr:nth-child(even)) {
  background: rgba(0, 255, 255, 0.02) !important;
}

:deep(.backup-table .el-table__body tr:hover) {
  background: rgba(0, 255, 255, 0.1) !important;
}

:deep(.backup-table .el-table__body td) {
  background: transparent !important;
  color: #ffffff !important;
  border-bottom: 1px solid rgba(0, 255, 255, 0.1) !important;
  border-right: 1px solid rgba(0, 255, 255, 0.05) !important;
}

:deep(.backup-table .el-table__body td:last-child) {
  border-right: none !important;
}

/* 表格内的标签样式 */
:deep(.backup-table .el-tag) {
  background: rgba(0, 255, 255, 0.1) !important;
  border: 1px solid rgba(0, 255, 255, 0.3) !important;
  color: #00ffff !important;
}

:deep(.backup-table .el-tag.el-tag--success) {
  background: rgba(103, 194, 58, 0.1) !important;
  border: 1px solid rgba(103, 194, 58, 0.3) !important;
  color: #67c23a !important;
}

:deep(.backup-table .el-tag.el-tag--warning) {
  background: rgba(230, 162, 60, 0.1) !important;
  border: 1px solid rgba(230, 162, 60, 0.3) !important;
  color: #e6a23c !important;
}

/* 操作按钮行布局 */
.action-buttons-row {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  flex-wrap: nowrap;
}

/* 操作按钮样式 */
:deep(.backup-table .tech-button-text) {
  color: #00ffff !important;
  background: transparent !important;
  border: none !important;
  padding: 4px 8px !important;
  margin: 0 !important;
  border-radius: 3px !important;
  transition: all 0.3s ease !important;
  font-size: 12px !important;
  flex-shrink: 0;
  white-space: nowrap;
}

:deep(.backup-table .tech-button-text:hover) {
  background: rgba(0, 255, 255, 0.1) !important;
  box-shadow: 0 0 8px rgba(0, 255, 255, 0.2) !important;
}

:deep(.backup-table .tech-button-text.tech-button-info) {
  color: #409eff !important;
}

:deep(.backup-table .tech-button-text.tech-button-info:hover) {
  background: rgba(64, 158, 255, 0.1) !important;
  box-shadow: 0 0 8px rgba(64, 158, 255, 0.2) !important;
}

:deep(.backup-table .tech-button-text.tech-button-danger) {
  color: #f56c6c !important;
}

:deep(.backup-table .tech-button-text.tech-button-danger:hover) {
  background: rgba(245, 108, 108, 0.1) !important;
  box-shadow: 0 0 8px rgba(245, 108, 108, 0.2) !important;
}

/* 确保操作列有足够的空间 */
:deep(.backup-table .el-table__fixed-right) {
  z-index: 10 !important;
  background: rgba(0, 20, 40, 0.6) !important;
}

:deep(.backup-table .el-table__fixed-right-patch) {
  background: rgba(0, 20, 40, 0.6) !important;
}

:deep(.backup-table .el-table__fixed-right .el-table__fixed-body-wrapper) {
  background: rgba(0, 20, 40, 0.6) !important;
}

:deep(.backup-table .el-table__fixed-right .el-table__fixed-header-wrapper) {
  background: rgba(0, 30, 60, 0.8) !important;
}

/* 确保固定列的边框正确显示 */
:deep(.backup-table .el-table__fixed-right) {
  border-left: 1px solid rgba(0, 255, 255, 0.1) !important;
}

/* 操作列单元格样式 */
:deep(.backup-table .el-table__fixed-right td) {
  background: rgba(0, 20, 40, 0.6) !important;
  padding: 8px 12px !important;
}

:deep(.backup-table .el-table__fixed-right th) {
  background: rgba(0, 30, 60, 0.8) !important;
  padding: 8px 12px !important;
}

/* 空状态样式 */
:deep(.el-empty) {
  background: transparent !important;
}

:deep(.el-empty__description) {
  color: rgba(255, 255, 255, 0.6) !important;
}

:deep(.el-empty__image svg) {
  fill: rgba(0, 255, 255, 0.3) !important;
}

/* 卡片头部样式 */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header span {
  color: #00ffff !important;
  font-size: 18px !important;
  font-weight: 600 !important;
  text-shadow: 0 0 15px rgba(0, 255, 255, 0.6) !important;
  letter-spacing: 1px !important;
}

.card-header div {
  display: flex;
  gap: 8px;
  align-items: center;
}

/* 间距类 */
.mb-20 {
  margin-bottom: 20px;
}

.restore-confirm {
  margin: 0;
}

.dialog-footer {
  text-align: right;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .tech-page-container {
    padding: 15px;
    height: calc(100vh - 100px);
  }
  
  .header-section {
    flex-direction: column;
    gap: 10px;
    align-items: stretch;
  }
  
  .header-section div {
    flex-direction: column;
    gap: 8px;
  }
}
/* ==================== 间距优化 ==================== */

/* 卡片头部按钮间距 */
.card-header .el-button + .el-button {
  margin-left: 16px !important;
}

/* 表格行间距 */
:deep(.el-table .el-table__row) {
  height: 50px !important;
}

/* 表格内按钮间距 */
:deep(.el-table .el-button + .el-button) {
  margin-left: 12px !important;
}

/* 表单项间距 */
:deep(.el-form-item) {
  margin-bottom: 24px !important;
}

/* 对话框按钮间距 */
:deep(.dialog-footer .el-button + .el-button) {
  margin-left: 16px !important;
}

/* 文字行间距优化 */
:deep(p), :deep(div), :deep(span) {
  line-height: 1.6 !important;
}
</style>
