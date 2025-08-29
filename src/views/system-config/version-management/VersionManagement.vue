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
            <el-tag type="primary" size="large">{{ versionInfo.version || 'N/A' }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="构建时间">
            {{ versionInfo.build_time || 'N/A' }}
          </el-descriptions-item>
          <el-descriptions-item label="Go版本">
            {{ versionInfo.go_version || 'N/A' }}
          </el-descriptions-item>
          <el-descriptions-item label="MySQL版本">
            {{ versionInfo.mysql || 'N/A' }}
          </el-descriptions-item>
          <el-descriptions-item label="MongoDB版本">
            {{ versionInfo.mongodb || 'N/A' }}
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
          <el-table :data="safeBackupList" style="width: 100%" v-loading="backupListLoading">
            <el-table-column prop="file_name" label="备份文件名" min-width="250"></el-table-column>
            <el-table-column prop="type" label="备份类型" width="120">
              <template #default="scope">
                <el-tag :type="getBackupTypeTag(scope.row.type)">
                  {{ getBackupTypeName(scope.row.type) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="file_size" label="大小" width="120">
              <template #default="scope">
                {{ formatFileSize(scope.row.file_size) }}
              </template>
            </el-table-column>
            <el-table-column prop="create_time" label="创建时间" width="180">
              <template #default="scope">
                {{ formatDateTime(scope.row.create_time) }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="160" fixed="right">
              <template #default="scope">
                <el-button type="primary" size="small" @click="downloadBackup(scope.row)">下载</el-button>
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
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form :model="backupForm" :rules="backupRules" ref="backupFormRef" label-width="120px">
        <el-form-item label="备份类型" prop="type">
          <el-radio-group v-model="backupForm.type">
            <el-radio label="full">全量备份</el-radio>
            <el-radio label="config">配置备份</el-radio>
            <el-radio label="database">数据库备份</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <!-- MinIO桶选择 - 仅在全量备份和数据库备份时显示 -->
        <el-form-item 
          label="MinIO桶选择" 
          v-if="backupForm.type === 'full' || backupForm.type === 'database'"
          prop="minio_buckets"
        >
          <div v-loading="minioBucketsLoading" style="width: 100%;">
            <el-alert 
              v-if="minioBuckets.length === 0 && !minioBucketsLoading"
              title="暂无可选择的MinIO存储桶" 
              type="warning" 
              :closable="false" 
              show-icon
              style="margin-bottom: 15px;"
            />
            
            <div v-else-if="minioBuckets.length > 0" style="max-height: 350px; overflow-y: auto;">
              <!-- 便捷操作按钮 -->
              <div style="margin-bottom: 12px; padding: 8px; background: #f3f4f6; border-radius: 4px;">
                <el-button 
                  size="small" 
                  @click="selectAllBuckets" 
                  :disabled="backupForm.minio_buckets.length === minioBuckets.length"
                >
                  全选
                </el-button>
                <el-button 
                  size="small" 
                  @click="clearAllBuckets" 
                  :disabled="backupForm.minio_buckets.length === 0"
                >
                  全不选
                </el-button>
                <el-button 
                  size="small" 
                  @click="selectRecommendedBuckets"
                  :disabled="areRecommendedBucketsSelected"
                >
                  推荐选择
                </el-button>
                <span style="font-size: 12px; color: #6b7280; margin-left: 12px;">
                  已选择 {{ backupForm.minio_buckets.length }} / {{ minioBuckets.length }} 个存储桶
                </span>
              </div>
              
              <el-checkbox-group v-model="backupForm.minio_buckets">
                <div 
                  v-for="bucket in minioBuckets" 
                  :key="bucket.name"
                  style="margin-bottom: 15px; padding: 12px; border: 1px solid #e5e7eb; border-radius: 6px; background: #f9fafb;"
                >
                  <el-checkbox :label="bucket.name" style="width: 100%;">
                    <div style="display: flex; flex-direction: column; margin-left: 8px;">
                      <div style="font-weight: 600; color: #374151;">
                        {{ bucket.name }}
                        <el-tag size="small" style="margin-left: 8px;">
                          {{ bucket.file_count }} 个文件, {{ formatFileSize(bucket.total_size) }}
                        </el-tag>
                      </div>
                      <div style="font-size: 12px; color: #6b7280; margin-top: 4px;">
                        {{ bucket.description }}
                      </div>
                    </div>
                  </el-checkbox>
                </div>
              </el-checkbox-group>
            </div>
            
            <el-alert 
              v-if="backupForm.type === 'full'"
              title="提示：全量备份建议选择所有相关的存储桶"
              type="info" 
              :closable="false" 
              show-icon
              style="margin-top: 15px;"
            />
            <el-alert 
              v-else-if="backupForm.type === 'database'"
              title="提示：数据库备份通常只需要选择包含数据的存储桶"
              type="info" 
              :closable="false" 
              show-icon
              style="margin-top: 15px;"
            />
          </div>
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

    <!-- 新的任务进度弹窗 (实时轮询) -->
    <ProgressModal
      :visible="showTaskProgressModal"
      :title="taskProgressTitle"
      :progress="taskProgress"
      :message="taskMessage"
      :is-polling="isPolling"
      :is-completed="isCompleted"
      :is-error="isError"
      :error-message="errorMessage"
      :task-data="taskData"
      :show-details="true"
      :allow-cancel="false"
      @close="handleTaskProgressModalClose"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Refresh, Plus, UploadFilled } from '@element-plus/icons-vue'
import { systemAPI } from '@/api/system'
import { useTaskProgress } from '@/composables/useTaskProgress'
import { createSystemBackup } from '@/api/map'
import ProgressModal from '@/components/ProgressModal.vue'

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
  version: '',        // 后端字段：软件版本号
  build_time: '',     // 后端字段：构建时间
  go_version: '',     // 后端字段：Go运行时版本
  mysql: '',          // 后端字段：MySQL版本
  mongodb: ''         // 后端字段：MongoDB版本
})

// 备份相关
const backupType = ref('full')
const backupList = ref([]) // 初始化为空数组
const createBackupDialogVisible = ref(false)
const backupProgressVisible = ref(false)
const backupProgress = ref(0)
const backupStatus = ref('')
const backupMessage = ref('')

const backupForm = reactive({
  type: 'full',                // 后端字段：备份类型 (required)
  minio_buckets: []           // 后端字段：选择的MinIO桶（仅数据备份和全量备份时使用）
})

// MinIO桶相关
const minioBuckets = ref([])
const minioBucketsLoading = ref(false)

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

// 进度轮询Hook
const {
  progress: taskProgress,
  message: taskMessage,
  isPolling,
  isCompleted,
  isError,
  errorMessage,
  taskData,
  startPolling,
  stopPolling,
  reset: resetProgress
} = useTaskProgress({
  interval: 1000, // 1秒轮询一次
  onProgress: (data) => {
    console.log('任务进度更新:', data)
  },
  onComplete: (data) => {
    console.log('任务完成:', data)
    ElMessage.success('任务执行完成！')
    // 刷新备份列表
    loadBackupList()
  },
  onError: (error) => {
    console.error('任务失败:', error)
    ElMessage.error('任务执行失败：' + (error.message || '未知错误'))
  }
})

// 新的进度弹窗状态
const showTaskProgressModal = ref(false)
const taskProgressTitle = ref('')

// 计算属性：确保备份列表数据安全
const safeBackupList = computed(() => {
  return Array.isArray(backupList.value) ? backupList.value : []
})

// 计算属性：检查是否已选择推荐的桶
const areRecommendedBucketsSelected = computed(() => {
  const recommendedBuckets = minioBuckets.value
    .filter(bucket => bucket.selected)
    .map(bucket => bucket.name)
  
  if (recommendedBuckets.length === 0) return true
  
  return recommendedBuckets.every(bucketName => 
    backupForm.minio_buckets.includes(bucketName)
  )
})

// 监控备份列表数据类型
watch(backupList, (newValue) => {
  if (!Array.isArray(newValue)) {
    console.warn('检测到backupList不是数组类型，自动修正为空数组:', newValue)
    backupList.value = []
  }
}, { immediate: true })

// 监控备份类型变化，自动更新MinIO桶选择
watch(() => backupForm.type, (newType) => {
  if (newType === 'config') {
    // 配置备份不需要MinIO桶
    backupForm.minio_buckets = []
  } else if (minioBuckets.value.length > 0) {
    // 其他类型根据后端默认设置选择
    backupForm.minio_buckets = minioBuckets.value
      .filter(bucket => bucket.selected)
      .map(bucket => bucket.name)
  }
})

// ===================== 验证规则 =====================

const backupRules = {
  type: [
    { required: true, message: '请选择备份类型', trigger: 'change' }
  ],
  minio_buckets: [
    {
      validator: (rule, value, callback) => {
        // 仅在全量备份和数据库备份时需要验证
        if (backupForm.type === 'full' || backupForm.type === 'database') {
          if (!value || value.length === 0) {
            callback(new Error('请至少选择一个MinIO存储桶'))
          } else {
            callback()
          }
        } else {
          callback()
        }
      },
      trigger: 'change'
    }
  ]
}

// ===================== 版本信息方法 =====================

// 加载版本信息
const loadVersionInfo = async () => {
  versionLoading.value = true
  try {
    // 检查用户登录状态
    const token = localStorage.getItem('token')
    console.log('当前token:', token ? '存在' : '不存在')
    console.log('正在调用版本信息API: /api/v1/system/version')
    
    const response = await systemAPI.getVersionInfo()
    console.log('版本信息API响应:', response)
    
    if (response.success || response.code === 200) {
      console.log('版本信息数据:', response.data)
      Object.assign(versionInfo, response.data)
      ElMessage.success('版本信息加载成功')
    } else {
      console.warn('版本信息API返回非成功状态:', response)
      ElMessage.warning('版本信息加载失败：' + (response.message || '未知错误'))
    }
  } catch (error) {
    console.error('加载版本信息失败:', error)
    
    // 详细错误信息
    if (error.response) {
      const status = error.response.status
      const data = error.response.data
      console.error('HTTP错误状态:', status)
      console.error('错误响应数据:', data)
      
      if (status === 401) {
        ElMessage.error('未授权访问，请重新登录')
      } else if (status === 403) {
        ElMessage.error('权限不足')
      } else if (status === 404) {
        ElMessage.error('版本信息接口不存在 (404)')
      } else {
        ElMessage.error(`加载版本信息失败 (${status}): ${data?.message || '服务器错误'}`)
      }
    } else if (error.request) {
      console.error('网络请求失败:', error.request)
      if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
        ElMessage.error('无法连接到后端服务器，请确认后端服务正在运行 (http://localhost:8080)')
      } else {
        ElMessage.error('网络连接失败，请检查网络连接')
      }
    } else {
      console.error('请求配置错误:', error.message)
      ElMessage.error('请求配置错误: ' + error.message)
    }
  } finally {
    versionLoading.value = false
  }
}



// ===================== 备份管理方法 =====================

// 加载备份列表
const loadBackupList = async () => {
  backupListLoading.value = true
  try {
    console.log('正在调用备份列表API...')
    const response = await systemAPI.getBackupList()
    console.log('备份列表API响应:', response)
    
    if (response.success || response.code === 200) {
      // 确保数据是数组类型
      const data = response.data
      if (Array.isArray(data)) {
        backupList.value = data
      } else {
        console.warn('备份列表数据不是数组格式:', data)
        backupList.value = []
      }
      console.log('备份列表数据:', backupList.value)
    } else {
      console.warn('备份列表API返回非成功状态:', response)
      backupList.value = [] // 确保是空数组
      ElMessage.warning('备份列表加载失败：' + (response.message || '未知错误'))
    }
  } catch (error) {
    console.error('加载备份列表失败:', error)
    
    // 确保在错误情况下也设置为空数组
    backupList.value = []
    
    // 详细错误信息
    if (error.response) {
      const status = error.response.status
      const data = error.response.data
      console.error('HTTP错误状态:', status)
      console.error('错误响应数据:', data)
      
      if (status === 401) {
        ElMessage.error('未授权访问，请重新登录')
      } else if (status === 403) {
        ElMessage.error('权限不足，需要系统配置权限')
      } else if (status === 404) {
        ElMessage.error('备份列表接口不存在 (404)')
      } else {
        ElMessage.error(`加载备份列表失败 (${status}): ${data?.message || '服务器错误'}`)
      }
    } else {
      ElMessage.error('网络连接失败，请检查网络连接')
    }
  } finally {
    backupListLoading.value = false
  }
}

// 加载MinIO桶信息
const loadMinioBuckets = async () => {
  minioBucketsLoading.value = true
  try {
    console.log('正在加载MinIO桶信息...')
    const response = await systemAPI.getMinioBucketsInfo()
    console.log('MinIO桶信息响应:', response)
    
    if (response.success || response.code === 200) {
      minioBuckets.value = response.data || []
      // 根据后端默认选择设置前端的选中状态
      backupForm.minio_buckets = minioBuckets.value
        .filter(bucket => bucket.selected)
        .map(bucket => bucket.name)
      console.log('MinIO桶信息:', minioBuckets.value)
      console.log('默认选中的桶:', backupForm.minio_buckets)
    } else {
      console.warn('MinIO桶信息API返回非成功状态:', response)
      ElMessage.warning('加载MinIO桶信息失败：' + (response.message || '未知错误'))
      minioBuckets.value = []
    }
  } catch (error) {
    console.error('加载MinIO桶信息失败:', error)
    minioBuckets.value = []
    ElMessage.error('加载MinIO桶信息失败')
  } finally {
    minioBucketsLoading.value = false
  }
}

// MinIO桶选择便捷操作
const selectAllBuckets = () => {
  backupForm.minio_buckets = minioBuckets.value.map(bucket => bucket.name)
}

const clearAllBuckets = () => {
  backupForm.minio_buckets = []
}

const selectRecommendedBuckets = () => {
  backupForm.minio_buckets = minioBuckets.value
    .filter(bucket => bucket.selected)
    .map(bucket => bucket.name)
}

// 显示创建备份对话框
const showCreateBackupDialog = async () => {
  backupForm.type = backupType.value
  backupForm.minio_buckets = []
  
  createBackupDialogVisible.value = true
  
  // 加载MinIO桶信息
  await loadMinioBuckets()
}

// 创建备份
const createBackup = async () => {
  if (!backupFormRef.value) return
  
  try {
    await backupFormRef.value.validate()
    creatingBackup.value = true
    createBackupDialogVisible.value = false
    
    // 设置进度弹窗标题
    const typeNames = {
      'config': '配置备份',
      'database': '数据库备份', 
      'full': '完整备份'
    }
    taskProgressTitle.value = `创建${typeNames[backupForm.type]}`
    
    // 重置进度状态并显示弹窗
    resetProgress()
    showTaskProgressModal.value = true
    
    console.log('正在创建备份，参数:', backupForm)
    
    // 调用新的备份API（返回任务ID）
    const response = await createSystemBackup({
      type: backupForm.type,
      minio_buckets: backupForm.minio_buckets
    })
    
    console.log('备份任务响应:', response)
    
    if (response.data && response.data.task_id) {
      // 开始轮询任务进度
      await startPolling(response.data.task_id)
    } else {
      throw new Error('未获取到任务ID')
    }
  } catch (error) {
    console.error('创建备份失败:', error)
    ElMessage.error('创建备份失败：' + error.message)
    showTaskProgressModal.value = false
  } finally {
    creatingBackup.value = false
  }
}

// 下载备份
const downloadBackup = async (backup) => {
  try {
    console.log('开始下载备份文件:', backup.file_name)
    
    // 显示下载中的提示
    const loadingMessage = ElMessage({
      message: '正在下载备份文件，请稍候...',
      type: 'info',
      duration: 0,
      showClose: true
    })
    
    const response = await systemAPI.downloadBackup(backup.file_name)
    
    // 关闭加载提示
    loadingMessage.close()
    
    console.log('下载响应:', response)
    
    // 检查响应
    if (!response.data) {
      throw new Error('下载响应为空')
    }
    
    // 创建下载链接
    const blob = new Blob([response.data], { 
      type: response.headers['content-type'] || 'application/octet-stream' 
    })
    
    // 检查blob大小
    if (blob.size === 0) {
      throw new Error('下载的文件为空')
    }
    
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = backup.file_name
    
    // 添加到DOM并触发下载
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    // 清理URL
    window.URL.revokeObjectURL(url)
    
    ElMessage.success('备份文件下载成功')
  } catch (error) {
    console.error('下载备份失败:', error)
    
    // 详细错误信息
    let errorMessage = '下载备份失败'
    if (error.response) {
      const status = error.response.status
      if (status === 404) {
        errorMessage = '备份文件不存在'
      } else if (status === 403) {
        errorMessage = '没有权限下载此文件'
      } else if (status === 500) {
        errorMessage = '服务器内部错误'
      } else {
        errorMessage = `下载失败 (${status}): ${error.response.data?.message || '未知错误'}`
      }
    } else if (error.request) {
      errorMessage = '网络连接失败，请检查网络'
    } else {
      errorMessage = error.message || '下载失败'
    }
    
    ElMessage.error(errorMessage)
    
    // 如果blob下载失败，尝试直接链接下载
    console.log('尝试备用下载方法...')
    try {
      const directUrl = `/api/v1/system/backups/${backup.file_name}/download`
      const link = document.createElement('a')
      link.href = directUrl
      link.download = backup.file_name
      link.target = '_blank'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      ElMessage.info('已尝试备用下载方法，请检查浏览器下载')
    } catch (fallbackError) {
      console.error('备用下载方法也失败:', fallbackError)
    }
  }
}



// 删除备份
const deleteBackup = async (backup) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除备份 "${backup.file_name}" 吗？此操作不可恢复！`,
      '确认删除',
      {
        type: 'warning',
        confirmButtonText: '确认删除',
        cancelButtonText: '取消'
      }
    )
    
    const response = await systemAPI.deleteBackup(backup.file_name)
    if (response.success || response.code === 200) {
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
    
    // 设置进度弹窗
    taskProgressTitle.value = '系统恢复'
    resetProgress()
    showTaskProgressModal.value = true
    
    const formData = new FormData()
    formData.append('file', selectedRestoreFile.value)
    
    console.log('正在上传恢复文件...')
    const response = await systemAPI.restoreSystem(formData)
    
    console.log('恢复任务响应:', response)
    
    if (response.data && response.data.task_id) {
      // 开始轮询任务进度
      await startPolling(response.data.task_id)
    } else {
      // 如果没有返回task_id，使用旧的进度显示方式
      restoreProgressVisible.value = true
      restoreProgress.value = 100
      restoreStatus.value = 'success'
      restoreMessage.value = '系统恢复成功'
      showTaskProgressModal.value = false
      startRestoreCountdown()
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('系统恢复失败:', error)
      ElMessage.error('系统恢复失败：' + error.message)
      showTaskProgressModal.value = false
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
    
    // 设置进度弹窗
    taskProgressTitle.value = '系统升级'
    resetProgress()
    showTaskProgressModal.value = true
    
    const formData = new FormData()
    formData.append('file', selectedUpgradeFile.value)
    
    console.log('正在上传升级包...')
    const response = await systemAPI.upgradeSystem(formData)
    
    console.log('升级任务响应:', response)
    
    if (response.data && response.data.task_id) {
      // 开始轮询任务进度
      await startPolling(response.data.task_id)
    } else {
      // 如果没有返回task_id，使用旧的进度显示方式
      upgradeProgressVisible.value = true
      upgradeProgress.value = 100
      upgradeStatus.value = 'success'
      upgradeMessage.value = '系统升级成功'
      showTaskProgressModal.value = false
      startUpgradeCountdown()
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('系统升级失败:', error)
      ElMessage.error('系统升级失败：' + error.message)
      showTaskProgressModal.value = false
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

// 处理任务进度弹窗关闭
const handleTaskProgressModalClose = () => {
  showTaskProgressModal.value = false
  if (isPolling.value) {
    stopPolling()
  }
  resetProgress()
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

// 测试API连通性
const testApiConnection = async () => {
  try {
    // 简单测试，调用不需要权限的接口
    console.log('测试API连通性...')
    const response = await fetch('/api/v1/system/version', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
        'Content-Type': 'application/json'
      }
    })
    
    console.log('API连通性测试响应状态:', response.status)
    const data = await response.text()
    console.log('API连通性测试响应数据:', data)
    
    if (response.status === 404) {
      ElMessage.warning('API接口路径可能不正确，请检查后端路由配置')
    } else if (response.status >= 500) {
      ElMessage.warning('后端服务器内部错误')
    }
  } catch (error) {
    console.error('API连通性测试失败:', error)
    ElMessage.warning('无法连接到后端服务器，请确认后端服务正在运行')
  }
}

onMounted(async () => {
  // 先测试连通性
  await testApiConnection()
  
  // 然后加载数据
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