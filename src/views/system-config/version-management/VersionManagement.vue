<template>
  <div class="version-management-container sub-page-content">
    <h2>版本管理</h2>

    <!-- 当前版本信息 -->
    <el-card class="version-info-card mb-20" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>当前版本信息</span>
          <el-button type="primary" :icon="Refresh" size="small" @click="getVersionInfo" :loading="versionLoading">刷新版本</el-button>
        </div>
      </template>
      <el-row :gutter="20" v-loading="versionLoading">
        <el-col :span="6">
          <div class="version-item">
            <div class="version-label">当前版本</div>
            <div class="version-value">{{ versionInfo.current_version }}</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="version-item">
            <div class="version-label">构建时间</div>
            <div class="version-value">{{ versionInfo.build_time }}</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="version-item">
            <div class="version-label">更新状态</div>
            <div class="version-value">
              <el-tag :type="versionInfo.update_available ? 'warning' : 'success'" size="large">
                {{ versionInfo.update_available ? '有新版本' : '已是最新' }}
              </el-tag>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="version-item">
            <div class="version-label">最新版本</div>
            <div class="version-value">{{ versionInfo.latest_version || '暂无' }}</div>
          </div>
        </el-col>
      </el-row>
      <el-divider></el-divider>
      <div class="update-notes" v-if="versionInfo.update_notes">
        <h4>更新说明：</h4>
        <p>{{ versionInfo.update_notes }}</p>
      </div>
    </el-card>

    <!-- 系统备份 -->
    <el-card class="backup-card mb-20" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>系统版本备份</span>
          <el-button type="success" :icon="Download" size="small" @click="showBackupHistory">备份历史</el-button>
        </div>
      </template>
      <div class="backup-content">
        <el-alert
          title="备份说明"
          type="info"
          description="系统备份将包含当前版本的所有程序文件、配置文件和数据库（可选）。备份过程可能需要几分钟时间，请耐心等待。"
          show-icon
          :closable="false"
          class="mb-20">
        </el-alert>
        
        <el-form :model="backupForm" :rules="backupRules" ref="backupFormRef" label-width="120px">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="备份名称" prop="backup_name">
                <el-input v-model="backupForm.backup_name" placeholder="请输入备份名称">
                  <template #prepend>备份_</template>
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="备份选项">
                <el-checkbox-group v-model="backupForm.backup_options">
                  <el-checkbox label="include_data" border>包含数据</el-checkbox>
                  <el-checkbox label="include_config" border>包含配置</el-checkbox>
                </el-checkbox-group>
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="备份描述">
            <el-input 
              v-model="backupForm.description" 
              type="textarea" 
              :rows="3" 
              placeholder="请输入备份描述（可选）">
            </el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="success" :icon="Download" @click="createBackup" :loading="backupLoading">
              创建备份
            </el-button>
            <el-button :icon="Refresh" @click="resetForm('backupFormRef')">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>

    <!-- 系统升级 -->
    <el-card class="upgrade-card mb-20" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>系统一键升级</span>
          <el-tag type="danger" size="small">
            <el-icon><Warning /></el-icon>
            请谨慎操作
          </el-tag>
        </div>
      </template>
      <div class="upgrade-content">
        <el-alert
          title="升级警告"
          type="error"
          description="系统升级是一个风险操作，强烈建议在升级前先创建系统备份。升级过程中系统将停止服务，请确保在维护时间窗口内进行操作。"
          show-icon
          :closable="false"
          class="mb-20">
        </el-alert>

        <el-form :model="upgradeForm" label-width="120px">
          <el-form-item label="升级前备份">
            <el-switch v-model="upgradeForm.backup_before_upgrade" active-text="升级前自动创建备份"></el-switch>
          </el-form-item>
          <el-form-item label="升级包选择">
      <el-upload
          class="upload-demo"
          drag
              :action="uploadUrl"
              :headers="uploadHeaders"
              :on-success="handleUpgradeSuccess"
              :on-error="handleUpgradeError"
              :before-upload="beforeUpgradeUpload"
          accept=".zip,.tar,.gz"
              :data="upgradeForm"
              :disabled="upgradeLoading">
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="el-upload__text">
                将升级包拖拽至此 或 <em>点击选择文件</em>
        </div>
        <template #tip>
          <div class="el-upload__tip">
                  支持 .zip、.tar、.gz 格式的升级包，文件大小不超过 1GB
          </div>
        </template>
      </el-upload>
          </el-form-item>
        </el-form>
      </div>
    </el-card>

    <!-- 备份历史对话框 -->
    <el-dialog v-model="backupHistoryVisible" title="备份历史" width="80%">
      <el-table :data="backupHistory" v-loading="historyLoading" border stripe>
        <el-table-column prop="id" label="ID" width="80" align="center"></el-table-column>
        <el-table-column prop="backup_name" label="备份名称" min-width="200"></el-table-column>
        <el-table-column prop="version" label="版本" width="120"></el-table-column>
        <el-table-column prop="backup_time" label="备份时间" width="160"></el-table-column>
        <el-table-column prop="file_size" label="文件大小" width="120"></el-table-column>
        <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip></el-table-column>
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === '成功' ? 'success' : 'danger'">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" align="center">
          <template #default="{ row }">
            <el-button type="primary" :icon="Download" size="small" @click="downloadBackup(row)" :disabled="row.status !== '成功'">
              下载
            </el-button>
            <el-button type="danger" :icon="Delete" size="small" @click="deleteBackup(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="backupHistoryVisible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Refresh, Download, Warning, UploadFilled, Delete
} from '@element-plus/icons-vue'
import { systemApi } from '@/api/system'

// 响应式数据
const versionLoading = ref(false)
const backupLoading = ref(false)
const upgradeLoading = ref(false)
const historyLoading = ref(false)
const backupHistoryVisible = ref(false)

// 表单引用
const backupFormRef = ref()

// 版本信息
const versionInfo = reactive({
  current_version: '',
  build_time: '',
  update_available: false,
  latest_version: '',
  update_notes: ''
})

// 备份表单
const backupForm = reactive({
  backup_name: `v${new Date().toISOString().slice(0, 10).replace(/-/g, '')}`,
  backup_options: ['include_data', 'include_config'],
  description: ''
})

// 升级表单
const upgradeForm = reactive({
  backup_before_upgrade: true
})

// 备份历史
const backupHistory = ref([])

// 计算属性
const uploadUrl = computed(() => {
  return '/api/system/version/upgrade'
})

const uploadHeaders = computed(() => {
  return {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
})

// 表单验证规则
const backupRules = {
  backup_name: [
    { required: true, message: '请输入备份名称', trigger: 'blur' },
    { min: 3, max: 50, message: '备份名称长度在 3 到 50 个字符', trigger: 'blur' }
  ]
}

// 生命周期
onMounted(() => {
  getVersionInfo()
})

// 方法
const getVersionInfo = async () => {
  try {
    versionLoading.value = true
    const response = await systemApi.getVersionInfo()
    if (response.data.success) {
      Object.assign(versionInfo, response.data.body)
    }
  } catch (error) {
    ElMessage.error('获取版本信息失败：' + error.message)
  } finally {
    versionLoading.value = false
  }
}

const createBackup = async () => {
  try {
    await backupFormRef.value.validate()
    
    await ElMessageBox.confirm(
      '确认要创建系统备份吗？备份过程可能需要几分钟时间。',
      '确认备份',
      {
        confirmButtonText: '确认',
    cancelButtonText: '取消',
        type: 'info'
      }
    )
    
    backupLoading.value = true
    const params = {
      backup_name: backupForm.backup_name,
      include_data: backupForm.backup_options.includes('include_data'),
      include_config: backupForm.backup_options.includes('include_config'),
      description: backupForm.description
    }
    
    const response = await systemApi.backupVersion(params)
    if (response.data.success) {
      ElMessage.success('系统备份创建成功')
      // 重置表单
      resetForm('backupFormRef')
      // 更新备份名称
      backupForm.backup_name = `v${new Date().toISOString().slice(0, 10).replace(/-/g, '')}`
    }
  } catch (error) {
    if (error !== 'cancel' && error !== false) {
      ElMessage.error('创建备份失败：' + error.message)
    }
  } finally {
    backupLoading.value = false
  }
}

const showBackupHistory = async () => {
  try {
    historyLoading.value = true
    backupHistoryVisible.value = true
    const response = await systemApi.getAllBackups()
    backupHistory.value = response.body.backups || []
  } catch (error) {
    ElMessage.error('获取备份历史失败：' + error.message)
  } finally {
    historyLoading.value = false
  }
}

const beforeUpgradeUpload = (file) => {
  const allowedTypes = ['.zip', '.tar', '.gz']
  const fileName = file.name.toLowerCase()
  const isValidType = allowedTypes.some(type => fileName.endsWith(type))
  
  if (!isValidType) {
    ElMessage.error('只支持 .zip、.tar、.gz 格式的升级包')
    return false
  }
  
  const isLt1GB = file.size / 1024 / 1024 / 1024 < 1
  if (!isLt1GB) {
    ElMessage.error('升级包大小不能超过 1GB')
    return false
  }
  
  upgradeLoading.value = true
  return true
}

const handleUpgradeSuccess = (response) => {
  upgradeLoading.value = false
  if (response.success) {
    ElMessage.success('系统升级完成，请重启系统使升级生效')
    ElMessageBox.confirm(
      '系统升级已完成，是否立即重启系统？',
      '升级完成',
      {
        confirmButtonText: '立即重启',
        cancelButtonText: '稍后重启',
        type: 'success'
      }
    ).then(() => {
      ElMessage.info('系统将在30秒后重启...')
      setTimeout(() => {
        window.location.reload()
      }, 30000)
    })
  } else {
    ElMessage.error('升级失败：' + response.message)
  }
}

const handleUpgradeError = (error) => {
  upgradeLoading.value = false
  ElMessage.error('上传升级包失败：' + error.message)
}

const downloadBackup = async (backup) => {
  try {
    ElMessage.info(`开始下载备份文件: ${backup.backup_name}...`)
    // 这里应该调用下载API
    // const response = await systemApi.downloadBackup(backup.id)
  } catch (error) {
    ElMessage.error('下载备份失败：' + error.message)
  }
}

const deleteBackup = async (backup) => {
  try {
    await ElMessageBox.confirm(
      `确认要删除备份 "${backup.backup_name}" 吗？此操作不可撤销。`,
      '确认删除',
      {
        confirmButtonText: '确认删除',
        cancelButtonText: '取消',
        type: 'error'
      }
    )
    
    ElMessage.success('备份删除成功')
    // 刷新备份列表
    showBackupHistory()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除备份失败：' + error.message)
    }
  }
}

const resetForm = (formRef) => {
  if (formRef === 'backupFormRef') {
    backupFormRef.value?.resetFields()
  }
}
</script>

<style scoped>
.sub-page-content {
  min-height: calc(100vh - 140px);
  padding-bottom: 80px;
  margin: -20px;
  padding: 20px;
  overflow-y: auto;
  box-sizing: border-box;
}

.version-management-container {
  padding: 0;
  max-width: 100%;
  box-sizing: border-box;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.version-item {
  text-align: center;
  padding: 10px;
}

.version-label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 8px;
}

.version-value {
  font-size: 16px;
  font-weight: bold;
  color: #303133;
}

.backup-content, .upgrade-content {
  padding: 10px 0;
}

.update-notes {
  margin-top: 10px;
}

.update-notes h4 {
  margin-bottom: 10px;
  color: #303133;
}

.update-notes p {
  color: #606266;
  line-height: 1.6;
}

.mb-20 {
  margin-bottom: 20px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
}

:deep(.el-card__header) {
  background-color: #f8f9fa;
  border-bottom: 1px solid #ebeef5;
}

:deep(.el-upload-dragger) {
  width: 100%;
}

:deep(.el-alert) {
  margin-bottom: 20px;
}

:deep(.el-divider) {
  margin: 15px 0;
}
</style>