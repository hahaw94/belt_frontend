<template>
  <div class="version-management-container sub-page-content">
    <h2>版本管理</h2>

    <!-- 版本信息显示 -->
    <el-card class="config-card mb-20" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>当前版本信息</span>
          <el-button type="primary" :icon="Refresh" size="small" @click="loadVersionInfo" :loading="versionLoading">刷新信息</el-button>
        </div>
      </template>
      <div v-loading="versionLoading">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="应用版本">
            <el-tag type="primary" size="large">{{ versionInfo.app_version || 'N/A' }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="构建时间">
            {{ versionInfo.build_time || 'N/A' }}
          </el-descriptions-item>
          <el-descriptions-item label="Git提交ID">
            <el-tag type="info">{{ versionInfo.git_commit || 'N/A' }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="Go版本">
            {{ versionInfo.go_version || 'N/A' }}
          </el-descriptions-item>
          <el-descriptions-item label="系统状态">
            <el-tag :type="getStatusType(versionInfo.system_status)" size="large">
              {{ getStatusText(versionInfo.system_status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="运行时间">
            {{ formatUptime(versionInfo.uptime) }}
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </el-card>

    <!-- 备份功能 -->
    <el-card class="config-card mb-20" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>系统备份</span>
          <el-button type="primary" :icon="Plus" size="small" @click="showCreateBackupDialog">创建备份</el-button>
          </div>
      </template>
      <div v-loading="backupLoading">
        <!-- 备份类型选择 -->
        <div class="backup-options mb-20">
          <h4>备份选项</h4>
          <el-radio-group v-model="backupType">
            <el-radio label="full">全量备份（包含配置、数据库、程序文件）</el-radio>
            <el-radio label="config">配置备份（仅备份配置文件）</el-radio>
            <el-radio label="database">数据库备份（仅备份数据库）</el-radio>
          </el-radio-group>
          </div>

        <!-- 备份列表 -->
        <div class="backup-list">
          <h4>备份历史</h4>
          <el-table :data="backupList" style="width: 100%" v-loading="backupListLoading">
            <el-table-column prop="id" label="ID" width="80"></el-table-column>
            <el-table-column prop="name" label="备份名称" min-width="200"></el-table-column>
            <el-table-column prop="type" label="备份类型" width="120">
              <template #default="scope">
                <el-tag :type="getBackupTypeTag(scope.row.type)">
                  {{ getBackupTypeName(scope.row.type) }}
              </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="size" label="大小" width="100">
              <template #default="scope">
                {{ formatFileSize(scope.row.size) }}
              </template>
            </el-table-column>
            <el-table-column prop="created_at" label="创建时间" width="180">
              <template #default="scope">
                {{ formatDateTime(scope.row.created_at) }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="200" fixed="right">
              <template #default="scope">
                <el-button type="primary" size="small" @click="downloadBackup(scope.row)">下载</el-button>
                <el-button type="success" size="small" @click="restoreFromBackup(scope.row)">恢复</el-button>
                <el-button type="danger" size="small" @click="deleteBackup(scope.row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
          </div>
      </div>
    </el-card>

    <!-- 恢复功能 -->
    <el-card class="config-card mb-20" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>系统恢复</span>
        </div>
      </template>
      <div class="restore-section">
        <el-alert
          title="上传备份文件进行系统恢复"
          description="支持上传之前创建的备份文件，系统将根据备份类型执行对应的恢复操作"
          type="info"
          show-icon
          :closable="false"
          class="mb-20"
        />
        <el-upload
          ref="restoreUploadRef"
          :auto-upload="false"
          :show-file-list="true"
          :limit="1"
          accept=".tar.gz,.zip,.sql"
          :before-upload="beforeRestoreUpload"
          :on-change="handleRestoreFileChange"
          drag
        >
          <el-icon class="el-icon--upload"><upload-filled /></el-icon>
          <div class="el-upload__text">
            将备份文件拖拽至此 或 <em>点击选择文件</em>
          </div>
          <template #tip>
            <div class="el-upload__tip">
              支持 .tar.gz、.zip、.sql 格式的备份文件
            </div>
          </template>
        </el-upload>
        <div class="restore-actions" style="margin-top: 20px;">
          <el-button type="danger" @click="executeRestore" :loading="restoreLoading" :disabled="!selectedRestoreFile">
            执行恢复
            </el-button>
          <el-button @click="clearRestoreFile">清除文件</el-button>
        </div>
      </div>
    </el-card>

    <!-- 一键升级 -->
    <el-card class="config-card mb-20" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>系统升级</span>
        </div>
      </template>
      <div class="upgrade-section">
        <el-alert
          title="上传升级包进行系统升级"
          description="请上传官方提供的升级包文件，系统将自动执行升级操作并重启服务"
          type="warning"
          show-icon
          :closable="false"
          class="mb-20"
        />
      <el-upload
          ref="upgradeUploadRef"
          :auto-upload="false"
          :show-file-list="true"
          :limit="1"
          accept=".tar.gz,.zip"
          :before-upload="beforeUpgradeUpload"
          :on-change="handleUpgradeFileChange"
          drag
        >
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="el-upload__text">
                将升级包拖拽至此 或 <em>点击选择文件</em>
        </div>
        <template #tip>
          <div class="el-upload__tip">
              支持 .tar.gz、.zip 格式的升级包文件，文件大小不超过500MB
          </div>
        </template>
      </el-upload>
        <div class="upgrade-actions" style="margin-top: 20px;">
          <el-button type="danger" @click="executeUpgrade" :loading="upgradeLoading" :disabled="!selectedUpgradeFile">
            执行升级
          </el-button>
          <el-button @click="clearUpgradeFile">清除文件</el-button>
        </div>
      </div>
    </el-card>

    <!-- 创建备份对话框 -->
    <el-dialog
      v-model="createBackupDialogVisible"
      title="创建系统备份"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form :model="backupForm" :rules="backupRules" ref="backupFormRef" label-width="100px">
        <el-form-item label="备份名称" prop="name">
          <el-input v-model="backupForm.name" placeholder="请输入备份名称"></el-input>
        </el-form-item>
        <el-form-item label="备份类型" prop="type">
          <el-radio-group v-model="backupForm.type">
            <el-radio label="full">全量备份</el-radio>
            <el-radio label="config">配置备份</el-radio>
            <el-radio label="database">数据库备份</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备份描述">
          <el-input v-model="backupForm.description" type="textarea" :rows="3" placeholder="可选，描述本次备份的目的"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createBackupDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="createBackup" :loading="creatingBackup">创建备份</el-button>
      </template>
    </el-dialog>

    <!-- 备份进度对话框 -->
    <el-dialog
      v-model="backupProgressVisible"
      title="正在创建备份"
      width="400px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="false"
    >
      <div class="progress-content">
        <el-progress :percentage="backupProgress" :status="backupStatus" />
        <p style="margin-top: 15px; text-align: center;">{{ backupMessage }}</p>
      </div>
    </el-dialog>

    <!-- 恢复进度对话框 -->
    <el-dialog
      v-model="restoreProgressVisible"
      title="正在恢复系统"
      width="400px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="false"
    >
      <div class="progress-content">
        <el-progress :percentage="restoreProgress" :status="restoreStatus" />
        <p style="margin-top: 15px; text-align: center;">{{ restoreMessage }}</p>
        <div v-if="restoreProgress === 100" style="text-align: center; margin-top: 20px;">
          <p>系统恢复完成，将在 <strong>{{ restoreCountdown }}</strong> 秒后自动刷新页面</p>
        </div>
      </div>
    </el-dialog>

    <!-- 升级进度对话框 -->
    <el-dialog
      v-model="upgradeProgressVisible"
      title="正在升级系统"
      width="400px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="false"
    >
      <div class="progress-content">
        <el-progress :percentage="upgradeProgress" :status="upgradeStatus" />
        <p style="margin-top: 15px; text-align: center;">{{ upgradeMessage }}</p>
        <div v-if="upgradeProgress === 100" style="text-align: center; margin-top: 20px;">
          <p>系统升级完成，将在 <strong>{{ upgradeCountdown }}</strong> 秒后自动刷新页面</p>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Refresh, Plus, UploadFilled } from '@element-plus/icons-vue'
import { systemAPI } from '@/api/system'

// ===================== 响应式数据 =====================

// 加载状态
const versionLoading = ref(false)
const backupLoading = ref(false)
const backupListLoading = ref(false)
const restoreLoading = ref(false)
const upgradeLoading = ref(false)
const creatingBackup = ref(false)

// 版本信息
const versionInfo = reactive({
  app_version: '',
  build_time: '',
  git_commit: '',
  go_version: '',
  system_status: '',
  uptime: 0
})

// 备份相关
const backupType = ref('full')
const backupList = ref([])
const createBackupDialogVisible = ref(false)
const backupProgressVisible = ref(false)
const backupProgress = ref(0)
const backupStatus = ref('')
const backupMessage = ref('')

const backupForm = reactive({
  name: '',
  type: 'full',
  description: ''
})

// 恢复相关
const restoreUploadRef = ref(null)
const selectedRestoreFile = ref(null)
const restoreProgressVisible = ref(false)
const restoreProgress = ref(0)
const restoreStatus = ref('')
const restoreMessage = ref('')
const restoreCountdown = ref(10)

// 升级相关
const upgradeUploadRef = ref(null)
const selectedUpgradeFile = ref(null)
const upgradeProgressVisible = ref(false)
const upgradeProgress = ref(0)
const upgradeStatus = ref('')
const upgradeMessage = ref('')
const upgradeCountdown = ref(10)

// 表单引用
const backupFormRef = ref(null)

// ===================== 验证规则 =====================

const backupRules = {
  name: [
    { required: true, message: '请输入备份名称', trigger: 'blur' },
    { min: 2, max: 50, message: '备份名称长度为2-50个字符', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择备份类型', trigger: 'change' }
  ]
}

// ===================== 版本信息方法 =====================

// 加载版本信息
const loadVersionInfo = async () => {
  versionLoading.value = true
  try {
    const response = await systemAPI.getVersionInfo()
    if (response.code === 200) {
      Object.assign(versionInfo, response.data)
    }
  } catch (error) {
    console.error('加载版本信息失败:', error)
    ElMessage.error('加载版本信息失败')
  } finally {
    versionLoading.value = false
  }
}

// 获取状态类型
const getStatusType = (status) => {
  switch (status) {
    case 'running': return 'success'
    case 'warning': return 'warning'
    case 'error': return 'danger'
    default: return 'info'
  }
}

// 获取状态文本
const getStatusText = (status) => {
  switch (status) {
    case 'running': return '运行正常'
    case 'warning': return '运行异常'
    case 'error': return '系统错误'
    default: return '未知状态'
  }
}

// 格式化运行时间
const formatUptime = (seconds) => {
  if (!seconds) return 'N/A'
  
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  
  if (days > 0) {
    return `${days}天 ${hours}小时 ${minutes}分钟`
  } else if (hours > 0) {
    return `${hours}小时 ${minutes}分钟`
  } else {
    return `${minutes}分钟`
  }
}

// ===================== 备份管理方法 =====================

// 加载备份列表
const loadBackupList = async () => {
  backupListLoading.value = true
  try {
    const response = await systemAPI.getBackupList()
    if (response.code === 200) {
      backupList.value = response.data || []
    }
  } catch (error) {
    console.error('加载备份列表失败:', error)
    ElMessage.error('加载备份列表失败')
  } finally {
    backupListLoading.value = false
  }
}

// 显示创建备份对话框
const showCreateBackupDialog = () => {
  // 生成默认备份名称
  const now = new Date()
  const dateStr = now.toISOString().slice(0, 19).replace(/[T:]/g, '-')
  backupForm.name = `backup-${dateStr}`
  backupForm.type = backupType.value
  backupForm.description = ''
  
  createBackupDialogVisible.value = true
}

// 创建备份
const createBackup = async () => {
  if (!backupFormRef.value) return
  
  try {
    await backupFormRef.value.validate()
    creatingBackup.value = true
    createBackupDialogVisible.value = false
    
    // 显示进度对话框
    backupProgressVisible.value = true
    backupProgress.value = 0
    backupStatus.value = ''
    backupMessage.value = '正在准备备份...'
    
    // 模拟进度更新
    const progressTimer = setInterval(() => {
      if (backupProgress.value < 90) {
        backupProgress.value += 10
        if (backupProgress.value === 30) {
          backupMessage.value = '正在备份配置文件...'
        } else if (backupProgress.value === 60) {
          backupMessage.value = '正在备份数据库...'
        } else if (backupProgress.value === 90) {
          backupMessage.value = '正在打包备份文件...'
        }
      }
    }, 1000)
    
    const response = await systemAPI.createBackup(backupForm)
    
    clearInterval(progressTimer)
    
    if (response.code === 200) {
      backupProgress.value = 100
      backupStatus.value = 'success'
      backupMessage.value = '备份创建成功'
      
      ElMessage.success('备份创建成功')
      await loadBackupList()
      
      setTimeout(() => {
        backupProgressVisible.value = false
      }, 2000)
    }
  } catch (error) {
    console.error('创建备份失败:', error)
    backupStatus.value = 'exception'
    backupMessage.value = '备份创建失败'
    ElMessage.error('创建备份失败')
  } finally {
    creatingBackup.value = false
  }
}

// 下载备份
const downloadBackup = async (backup) => {
  try {
    const response = await systemAPI.downloadBackup(backup.id)
    
    // 创建下载链接
    const blob = new Blob([response.data])
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = backup.name + '.tar.gz'
    link.click()
    window.URL.revokeObjectURL(url)
    
    ElMessage.success('备份文件下载成功')
  } catch (error) {
    console.error('下载备份失败:', error)
    ElMessage.error('下载备份失败')
  }
}

// 从备份恢复
const restoreFromBackup = async (backup) => {
  try {
    await ElMessageBox.confirm(
      `确定要从备份 "${backup.name}" 恢复系统吗？此操作将覆盖当前系统配置和数据！`,
      '确认恢复',
      {
        type: 'warning',
        confirmButtonText: '确认恢复',
        cancelButtonText: '取消'
      }
    )
    
    executeRestoreFromBackup(backup)
  } catch (error) {
    // 用户取消操作
  }
}

// 执行从备份恢复
const executeRestoreFromBackup = async (backup) => {
  restoreProgressVisible.value = true
  restoreProgress.value = 0
  restoreStatus.value = ''
  restoreMessage.value = '正在恢复系统...'
  
  try {
    // 模拟进度更新
    const progressTimer = setInterval(() => {
      if (restoreProgress.value < 90) {
        restoreProgress.value += 10
      }
    }, 1000)
    
    const response = await systemAPI.restoreBackup(backup.id)
    
    clearInterval(progressTimer)
    
    if (response.code === 200) {
      restoreProgress.value = 100
      restoreStatus.value = 'success'
      restoreMessage.value = '系统恢复成功'
      
      // 开始倒计时刷新
      startRestoreCountdown()
    }
  } catch (error) {
    console.error('系统恢复失败:', error)
    restoreStatus.value = 'exception'
    restoreMessage.value = '系统恢复失败'
    ElMessage.error('系统恢复失败')
  }
}

// 删除备份
const deleteBackup = async (backup) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除备份 "${backup.name}" 吗？此操作不可恢复！`,
      '确认删除',
      {
        type: 'warning',
        confirmButtonText: '确认删除',
        cancelButtonText: '取消'
      }
    )
    
    const response = await systemAPI.deleteBackup(backup.id)
    if (response.code === 200) {
      ElMessage.success('备份删除成功')
      await loadBackupList()
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除备份失败:', error)
      ElMessage.error('删除备份失败')
    }
  }
}

// 获取备份类型标签
const getBackupTypeTag = (type) => {
  switch (type) {
    case 'full': return 'primary'
    case 'config': return 'success'
    case 'database': return 'warning'
    default: return 'info'
  }
}

// 获取备份类型名称
const getBackupTypeName = (type) => {
  switch (type) {
    case 'full': return '全量备份'
    case 'config': return '配置备份'
    case 'database': return '数据库备份'
    default: return '未知类型'
  }
}

// ===================== 恢复功能方法 =====================

// 恢复文件上传前验证
const beforeRestoreUpload = (file) => {
  const validTypes = ['application/gzip', 'application/x-gzip', 'application/zip', 'application/sql']
  const isValidType = validTypes.includes(file.type) || file.name.endsWith('.tar.gz') || file.name.endsWith('.sql')
  
  if (!isValidType) {
    ElMessage.error('只支持 .tar.gz、.zip、.sql 格式的备份文件')
    return false
  }
  
  const isLt1G = file.size / 1024 / 1024 / 1024 < 1
  if (!isLt1G) {
    ElMessage.error('备份文件大小不能超过 1GB')
    return false
  }
  
  return true
}

// 处理恢复文件选择
const handleRestoreFileChange = (file) => {
  selectedRestoreFile.value = file.raw
}

// 执行恢复
const executeRestore = async () => {
  if (!selectedRestoreFile.value) {
    ElMessage.error('请先选择备份文件')
    return
  }
  
  try {
    await ElMessageBox.confirm(
      '确定要执行系统恢复操作吗？此操作将覆盖当前系统配置和数据！',
      '确认恢复',
      {
        type: 'warning',
        confirmButtonText: '确认恢复',
        cancelButtonText: '取消'
      }
    )
    
    restoreLoading.value = true
    restoreProgressVisible.value = true
    restoreProgress.value = 0
    restoreStatus.value = ''
    restoreMessage.value = '正在上传备份文件...'
    
    const formData = new FormData()
    formData.append('backup', selectedRestoreFile.value)
    
    // 模拟进度更新
    const progressTimer = setInterval(() => {
      if (restoreProgress.value < 90) {
        restoreProgress.value += 10
        if (restoreProgress.value === 30) {
          restoreMessage.value = '正在解析备份文件...'
        } else if (restoreProgress.value === 60) {
          restoreMessage.value = '正在恢复数据...'
        } else if (restoreProgress.value === 90) {
          restoreMessage.value = '正在重启服务...'
        }
      }
    }, 1000)
    
    const response = await systemAPI.restoreBackup(formData)
    
    clearInterval(progressTimer)
    
    if (response.code === 200) {
      restoreProgress.value = 100
      restoreStatus.value = 'success'
      restoreMessage.value = '系统恢复成功'
      
      // 开始倒计时刷新
      startRestoreCountdown()
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('系统恢复失败:', error)
      restoreStatus.value = 'exception'
      restoreMessage.value = '系统恢复失败'
      ElMessage.error('系统恢复失败')
    }
  } finally {
    restoreLoading.value = false
  }
}

// 清除恢复文件
const clearRestoreFile = () => {
  selectedRestoreFile.value = null
  if (restoreUploadRef.value) {
    restoreUploadRef.value.clearFiles()
  }
}

// 开始恢复倒计时
const startRestoreCountdown = () => {
  restoreCountdown.value = 10
  const countdownTimer = setInterval(() => {
    restoreCountdown.value--
    if (restoreCountdown.value <= 0) {
      clearInterval(countdownTimer)
      window.location.reload()
    }
  }, 1000)
}

// ===================== 升级功能方法 =====================

// 升级文件上传前验证
const beforeUpgradeUpload = (file) => {
  const validTypes = ['application/gzip', 'application/x-gzip', 'application/zip']
  const isValidType = validTypes.includes(file.type) || file.name.endsWith('.tar.gz')
  
  if (!isValidType) {
    ElMessage.error('只支持 .tar.gz、.zip 格式的升级包文件')
    return false
  }
  
  const isLt500M = file.size / 1024 / 1024 < 500
  if (!isLt500M) {
    ElMessage.error('升级包文件大小不能超过 500MB')
    return false
  }
  
  return true
}

// 处理升级文件选择
const handleUpgradeFileChange = (file) => {
  selectedUpgradeFile.value = file.raw
}

// 执行升级
const executeUpgrade = async () => {
  if (!selectedUpgradeFile.value) {
    ElMessage.error('请先选择升级包文件')
    return
  }
  
  try {
    await ElMessageBox.confirm(
      '确定要执行系统升级操作吗？升级过程中系统将重启，请确保在业务空闲时间进行！',
      '确认升级',
      {
        type: 'warning',
        confirmButtonText: '确认升级',
        cancelButtonText: '取消'
      }
    )
    
    upgradeLoading.value = true
    upgradeProgressVisible.value = true
    upgradeProgress.value = 0
    upgradeStatus.value = ''
    upgradeMessage.value = '正在上传升级包...'
    
    const formData = new FormData()
    formData.append('upgrade', selectedUpgradeFile.value)
    
    // 模拟进度更新
    const progressTimer = setInterval(() => {
      if (upgradeProgress.value < 90) {
        upgradeProgress.value += 10
        if (upgradeProgress.value === 30) {
          upgradeMessage.value = '正在验证升级包...'
        } else if (upgradeProgress.value === 60) {
          upgradeMessage.value = '正在执行升级...'
        } else if (upgradeProgress.value === 90) {
          upgradeMessage.value = '正在重启系统...'
        }
      }
    }, 2000)
    
    const response = await systemAPI.upgradeSystem(formData)
    
    clearInterval(progressTimer)
    
    if (response.code === 200) {
      upgradeProgress.value = 100
      upgradeStatus.value = 'success'
      upgradeMessage.value = '系统升级成功'
      
      // 开始倒计时刷新
      startUpgradeCountdown()
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('系统升级失败:', error)
      upgradeStatus.value = 'exception'
      upgradeMessage.value = '系统升级失败'
      ElMessage.error('系统升级失败')
    }
  } finally {
    upgradeLoading.value = false
  }
}

// 清除升级文件
const clearUpgradeFile = () => {
  selectedUpgradeFile.value = null
  if (upgradeUploadRef.value) {
    upgradeUploadRef.value.clearFiles()
  }
}

// 开始升级倒计时
const startUpgradeCountdown = () => {
  upgradeCountdown.value = 10
  const countdownTimer = setInterval(() => {
    upgradeCountdown.value--
    if (upgradeCountdown.value <= 0) {
      clearInterval(countdownTimer)
      window.location.reload()
    }
  }, 1000)
}

// ===================== 工具方法 =====================

// 格式化文件大小
const formatFileSize = (bytes) => {
  if (!bytes) return 'N/A'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 格式化日期时间
const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A'
  
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

// ===================== 生命周期钩子 =====================

onMounted(async () => {
  await Promise.all([
    loadVersionInfo(),
    loadBackupList()
  ])
})
</script>

<style scoped>
.version-management-container {
  padding: 24px;
}

.config-card {
  margin-bottom: 24px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  font-size: 16px;
  color: #303133;
}

.mb-20 {
  margin-bottom: 20px;
}

.backup-options h4,
.backup-list h4 {
  margin-bottom: 16px;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.restore-section,
.upgrade-section {
  padding: 20px 0;
}

.restore-actions,
.upgrade-actions {
  display: flex;
  gap: 12px;
}

/* 进度对话框样式 */
.progress-content {
  text-align: center;
}

.progress-content p {
  margin: 10px 0;
  color: #606266;
}

/* 上传组件样式 */
:deep(.el-upload-dragger) {
  width: 100%;
}

/* 描述列表样式 */
:deep(.el-descriptions__body .el-descriptions__table .el-descriptions__cell) {
  padding: 12px;
}

/* 表格样式 */
:deep(.el-table) {
  margin-top: 16px;
}

/* 响应式布局 */
@media (max-width: 1200px) {
  .version-management-container {
    padding: 16px;
  }
}

@media (max-width: 768px) {
  .version-management-container {
    padding: 12px;
  }
  
  .card-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
  
  .restore-actions,
  .upgrade-actions {
    flex-direction: column;
  }
  
  :deep(.el-descriptions) {
    font-size: 14px;
  }
  
  :deep(.el-table) {
    font-size: 12px;
  }
}

/* 表单项间距优化 */
.el-form-item {
  margin-bottom: 22px;
}

.el-form-item:last-child {
  margin-bottom: 0;
}

/* 按钮组样式 */
.el-button + .el-button {
  margin-left: 0;
}

/* 警告框样式调整 */
.el-alert {
  margin: 16px 0;
}
</style>