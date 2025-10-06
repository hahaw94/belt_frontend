<template>
  <div class="version-management-container tech-page-container">
    <!-- 科技感背景 -->
    <div class="tech-background">
    </div>
    
    <h2>版本管理</h2>

    <!-- 版本信息显示 -->
    <el-card class="config-card tech-card mb-20" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>当前版本信息</span>
          <el-button type="primary" :icon="Refresh" size="small" class="tech-button-sm" @click="loadVersionInfo" :loading="versionLoading">刷新信息</el-button>
        </div>
      </template>
      <div v-loading="versionLoading">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="应用版本">
            <el-tag type="primary" size="large">{{ versionInfo.version || 'N/A' }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="构建时间">
            {{ formatBuildTime(versionInfo.build_time) || 'N/A' }}
          </el-descriptions-item>
          <el-descriptions-item label="Go版本">
            {{ versionInfo.go_version || 'N/A' }}
          </el-descriptions-item>
          <el-descriptions-item label="操作系统">
            {{ formatOSInfo(versionInfo.os, versionInfo.arch) || 'N/A' }}
          </el-descriptions-item>
          <el-descriptions-item label="MySQL版本">
            {{ versionInfo.mysql || 'N/A' }}
          </el-descriptions-item>
          <el-descriptions-item label="MongoDB版本">
            {{ versionInfo.mongodb || 'N/A' }}
          </el-descriptions-item>
          <el-descriptions-item label="Redis版本">
            {{ versionInfo.redis || 'N/A' }}
          </el-descriptions-item>
          <el-descriptions-item label="MinIO状态">
            {{ versionInfo.minio || 'N/A' }}
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </el-card>

    <!-- 备份功能 -->
    <el-card class="config-card tech-card mb-20" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>系统备份</span>
          <el-button type="primary" :icon="Plus" size="small" class="tech-button-sm" @click="showCreateBackupDialog">创建备份</el-button>
          </div>
      </template>
      <div v-loading="backupLoading">
        <!-- 备份列表 -->
        <div class="backup-list">
          <el-table :data="safeBackupList" class="tech-table" style="width: 100%" v-loading="backupListLoading">
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
            <el-table-column label="操作" width="240">
              <template #default="scope">
                <div class="operation-buttons">
                  <el-button type="primary" size="small" class="tech-button-sm" @click="downloadBackup(scope.row)">下载</el-button>
                  <el-button type="success" size="small" class="tech-button-success tech-button-sm" @click="oneClickRestore(scope.row)">恢复</el-button>
                  <el-button type="danger" size="small" class="tech-button-danger tech-button-sm" @click="deleteBackup(scope.row)">删除</el-button>
                </div>
              </template>
            </el-table-column>
          </el-table>
          </div>
      </div>
    </el-card>

    <!-- 恢复功能 -->
    <el-card class="config-card tech-card mb-20" shadow="hover">
      <template #header>
        <div class="card-header">
          <div class="header-title-with-help">
            <span>系统恢复</span>
            <el-tooltip
              effect="dark"
              placement="right"
              popper-class="version-check-tooltip"
              :show-after="300"
            >
              <template #content>
                <div class="version-check-info">
                  <div class="tooltip-title">备份恢复中的版本检查</div>
                  <div class="tooltip-section">
                    <div class="section-title">1. 备份时记录版本信息</div>
                    <div class="section-content">
                      • 每个备份都会记录创建时的系统版本号<br/>
                      • 版本信息存储在备份的元数据文件中<br/>
                      • 包含系统版本、创建时间、创建者等信息
                    </div>
                  </div>
                  <div class="tooltip-section">
                    <div class="section-title">2. 恢复时的版本兼容性检查</div>
                    <div class="section-content">
                      恢复过程中会进行以下检查：<br/>
                      <strong>检查流程：</strong><br/>
                      • 读取备份文件中的版本信息<br/>
                      • 获取当前系统版本<br/>
                      • 进行版本兼容性分析<br/>
                      • 根据检查结果决定是否允许恢复<br/><br/>
                      <strong>检查规则：</strong><br/>
                      <span style="color: #67C23A;">完全相同版本：直接允许，最安全</span><br/>
                      <span style="color: #E6A23C;">备份版本更高：警告但允许，可能需要后续升级</span><br/>
                      <span style="color: #E6A23C;">同主版本内：警告但允许，通常安全</span><br/>
                      <span style="color: #F56C6C;">跨主版本：错误级别，但可通过强制恢复</span>
                    </div>
                  </div>
                </div>
              </template>
              <el-icon class="help-icon">
                <QuestionFilled />
              </el-icon>
            </el-tooltip>
          </div>
        </div>
      </template>
      <div class="restore-section">
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
          <el-button type="danger" class="tech-button-danger" @click="executeRestore" :loading="restoreLoading" :disabled="!selectedRestoreFile">
            执行恢复
            </el-button>
          <el-button class="tech-button-secondary" @click="clearRestoreFile">清除文件</el-button>
        </div>
      </div>
    </el-card>

    <!-- 一键升级 -->
    <el-card class="config-card tech-card mb-20" shadow="hover">
      <template #header>
        <div class="card-header">
          <div class="header-title-with-help">
            <span>系统升级</span>
            <el-tooltip
              effect="dark"
              placement="right"
              popper-class="version-check-tooltip"
              :show-after="300"
            >
              <template #content>
                <div class="version-check-info">
                  <div class="tooltip-title">版本号管理规则</div>
                  <div class="tooltip-section">
                    <div class="section-title">版本号格式</div>
                    <div class="section-content">
                      系统采用标准的三段式版本号格式：主版本.次版本.补丁版本（如2.0.1），<br/>
                      支持带v前缀的格式但会自动清理。
                    </div>
                  </div>
                  <div class="tooltip-section">
                    <div class="section-title">升级规则</div>
                    <div class="section-content">
                      <strong>绝对禁止：</strong><br/>
                      • 跨主版本升级（如1.x.x到2.x.x）<br/>
                      • 任何形式的降级<br/><br/>
                      <strong>允许的升级：</strong><br/>
                      • 补丁版本升级最安全，可直接进行<br/>
                      • 次版本升级需要谨慎，最多允许跳跃2个版本（如1.2.x到1.4.x）<br/>
                      • 超过2个版本跳跃会被拒绝，需要分步升级
                    </div>
                  </div>
                  <div class="tooltip-section">
                    <div class="section-title">安全机制</div>
                    <div class="section-content">
                      • 升级前会自动检查版本兼容性<br/>
                      • 根据风险等级给出不同的处理建议（信息、警告、错误）<br/>
                      • 默认在升级前创建系统备份<br/>
                      • 支持升级失败时的自动回滚
                    </div>
                  </div>
                </div>
              </template>
              <el-icon class="help-icon">
                <QuestionFilled />
              </el-icon>
            </el-tooltip>
          </div>
        </div>
      </template>
      <div class="upgrade-section">
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
          <el-button type="danger" class="tech-button-danger" @click="executeUpgrade" :loading="upgradeLoading" :disabled="!selectedUpgradeFile">
            执行升级
          </el-button>
          <el-button class="tech-button-secondary" @click="clearUpgradeFile">清除文件</el-button>
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
        <el-form-item label="备份名称" prop="name">
          <el-input 
            v-model="backupForm.name" 
            placeholder="请输入备份名称（最多100个字符）"
            maxlength="100"
            show-word-limit
          />
        </el-form-item>
        
        <el-form-item label="备份描述" prop="description">
          <el-input 
            v-model="backupForm.description" 
            placeholder="请输入备份描述（可选，最多500个字符）"
            type="textarea"
            :rows="3"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="备份类型" prop="type">
          <el-radio-group v-model="backupForm.type">
            <el-radio label="full">全量备份</el-radio>
            <el-radio label="custom">自定义备份</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <!-- 自定义备份选项 -->
        <div v-if="backupForm.type === 'custom'">
          <el-form-item label="备份内容">
            <el-checkbox-group v-model="customBackupOptions">
              <el-checkbox label="config">系统配置</el-checkbox>
              <el-checkbox label="mysql">MySQL数据库</el-checkbox>
              <el-checkbox label="mongodb">MongoDB数据库</el-checkbox>
              <el-checkbox label="minio">MinIO存储</el-checkbox>
            </el-checkbox-group>
          </el-form-item>
        </div>
        
        <!-- 存储桶选择 - 仅在全量备份或包含MinIO的自定义备份时显示 -->
        <el-form-item 
          label="存储桶选择" 
          v-if="backupForm.type === 'full' || (backupForm.type === 'custom' && customBackupOptions.includes('minio'))"
          prop="minio_buckets"
        >
          <div v-loading="minioBucketsLoading" style="width: 100%;">
            <el-alert 
              v-if="minioBuckets.length === 0 && !minioBucketsLoading"
              title="暂无可选择的存储桶" 
              type="warning" 
              :closable="false" 
              show-icon
              style="margin-bottom: 15px;"
            />
            
            <div v-else-if="minioBuckets.length > 0" class="minio-buckets-container" style="max-height: 350px; overflow-y: auto;">
              <!-- 便捷操作按钮 -->
              <div style="margin-bottom: 12px; padding: 8px; background: rgba(0, 20, 40, 0.4); border: 1px solid rgba(0, 255, 255, 0.2); border-radius: 4px;">
                <el-button 
                  size="small" 
                  class="tech-button-sm"
                  @click="selectAllBuckets" 
                  :disabled="backupForm.minio_buckets.length === minioBuckets.length"
                >
                  全选
                </el-button>
                <el-button 
                  size="small" 
                  class="tech-button-secondary tech-button-sm"
                  @click="clearAllBuckets" 
                  :disabled="backupForm.minio_buckets.length === 0"
                >
                  全不选
                </el-button>
                <el-button 
                  size="small" 
                  class="tech-button-info tech-button-sm"
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
                  style="margin-bottom: 15px; padding: 12px; border: 1px solid rgba(0, 255, 255, 0.3); border-radius: 6px; background: rgba(0, 20, 40, 0.3);"
                >
                  <el-checkbox :label="bucket.name" style="width: 100%;">
                    <div style="display: flex; flex-direction: column; margin-left: 8px;">
                      <div style="font-weight: 600; color: #ffffff;">
                        {{ bucket.name }}
                        <el-tag size="small" style="margin-left: 8px;">
                          {{ bucket.file_count }} 个文件, {{ formatFileSize(bucket.total_size) }}
                        </el-tag>
                      </div>
                      <div style="font-size: 12px; color: rgba(255, 255, 255, 0.7); margin-top: 4px;">
                        {{ bucket.description }}
                      </div>
                    </div>
                  </el-checkbox>
                </div>
              </el-checkbox-group>
            </div>
            
            <el-alert 
              v-if="backupForm.type === 'full'"
              title="提示：全量备份建议选择所有相关的存储桶以确保数据完整性"
              type="info" 
              :closable="false" 
              show-icon
              style="margin-top: 15px;"
            />
            <el-alert 
              v-else-if="backupForm.type === 'custom' && customBackupOptions.includes('minio')"
              title="提示：选择相关的存储桶进行自定义备份"
              type="info" 
              :closable="false" 
              show-icon
              style="margin-top: 15px;"
            />
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button class="tech-button-secondary" @click="createBackupDialogVisible = false">取消</el-button>
        <el-button type="primary" class="tech-button" @click="createBackup" :loading="creatingBackup">创建备份</el-button>
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

<!-- MessageBox 简洁青色主题样式 -->
<style>
/* 简洁青色主题 MessageBox 样式 */
.el-message-box {
  background: rgba(15, 25, 45, 0.95) !important;
  border: 1px solid rgba(0, 255, 255, 0.3) !important;
  border-radius: 8px !important;
  backdrop-filter: blur(10px) !important;
}

.el-message-box__header {
  background: transparent !important;
  border-bottom: 1px solid rgba(0, 255, 255, 0.2) !important;
}

.el-message-box__title {
  color: #00ffff !important;
  font-weight: 600 !important;
}

.el-message-box__content {
  background: transparent !important;
  color: rgba(255, 255, 255, 0.95) !important;
}

.el-message-box__message {
  color: rgba(255, 255, 255, 0.95) !important;
  line-height: 1.6 !important;
  white-space: pre-line !important;
  word-break: break-word !important;
}

.el-message-box__btns {
  background: transparent !important;
  border-top: 1px solid rgba(0, 255, 255, 0.1) !important;
}

.el-message-box__btns .el-button--default {
  background: rgba(128, 128, 128, 0.1) !important;
  border: 1px solid rgba(128, 128, 128, 0.4) !important;
  color: rgba(255, 255, 255, 0.8) !important;
}

.el-message-box__btns .el-button--default:hover {
  background: rgba(128, 128, 128, 0.2) !important;
  border-color: rgba(128, 128, 128, 0.6) !important;
  color: #ffffff !important;
}

.el-message-box__btns .el-button--primary {
  background: rgba(0, 255, 255, 0.1) !important;
  border: 1px solid rgba(0, 255, 255, 0.4) !important;
  color: #00ffff !important;
}

.el-message-box__btns .el-button--primary:hover {
  background: rgba(0, 255, 255, 0.2) !important;
  border-color: rgba(0, 255, 255, 0.6) !important;
}

.el-message-box__btns .el-button--danger {
  background: rgba(255, 82, 82, 0.1) !important;
  border: 1px solid rgba(255, 82, 82, 0.4) !important;
  color: #ff5252 !important;
}

.el-message-box__btns .el-button--danger:hover {
  background: rgba(255, 82, 82, 0.2) !important;
  border-color: rgba(255, 82, 82, 0.6) !important;
}
</style>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Refresh, Plus, UploadFilled, QuestionFilled } from '@element-plus/icons-vue'
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
  mongodb: '',        // 后端字段：MongoDB版本
  redis: '',          // 后端字段：Redis版本
  minio: '',          // 后端字段：MinIO版本/状态
  os: '',             // 后端字段：操作系统信息
  arch: ''            // 后端字段：系统架构
})

// 备份相关
const backupList = ref([]) // 初始化为空数组
const createBackupDialogVisible = ref(false)
const backupProgressVisible = ref(false)
const backupProgress = ref(0)
const backupStatus = ref('')
const backupMessage = ref('')

const backupForm = reactive({
  type: 'full',                // 后端字段：备份类型 (required: full/custom)
  name: '',                    // 后端字段：备份名称 (required)
  description: '',             // 后端字段：备份描述 (optional)
  minio_buckets: [],           // 后端字段：选择的存储桶（仅全量备份时使用）
  custom_options: null         // 后端字段：自定义备份选项（仅custom类型时使用）
})

// 存储桶相关
const minioBuckets = ref([])
const minioBucketsLoading = ref(false)

// 自定义备份选项
const customBackupOptions = ref([])

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
    // 如果是恢复任务完成，提示用户重启服务
    if (taskProgressTitle.value.includes('恢复')) {
      ElMessageBox.confirm(
        '系统恢复已完成！为了确保所有更改生效，建议您重启服务。\n\n是否现在重启服务？',
        '恢复完成',
        {
          type: 'success',
          confirmButtonText: '重启服务',
          cancelButtonText: '稍后重启',
          confirmButtonClass: 'el-button--primary',
          cancelButtonClass: 'el-button--default',
          customClass: 'tech-message-box',
          dangerouslyUseHTMLString: false,
          lockScroll: true,
          showClose: true,
          closeOnClickModal: false,
          closeOnPressEscape: true
        }
      ).then(() => {
        // 重启服务
        systemAPI.restartSystemService().then(() => {
          ElMessage.success('服务重启指令已发送')
        }).catch(error => {
          console.error('重启服务失败:', error)
          ElMessage.error('重启服务失败')
        })
      }).catch(() => {
        ElMessage.info('请记得在适当时机重启服务以确保恢复生效')
      })
    }
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

// 监控备份类型变化，自动更新存储桶选择
watch(() => backupForm.type, (newType) => {
  if (newType === 'full') {
    // 全量备份：默认选择推荐的存储桶
    if (minioBuckets.value.length > 0) {
      backupForm.minio_buckets = minioBuckets.value
        .filter(bucket => bucket.selected)
        .map(bucket => bucket.name)
    }
  } else if (newType === 'custom') {
    // 自定义备份：清空存储桶选择，等待用户自定义
    backupForm.minio_buckets = []
    customBackupOptions.value = []
  }
})

// 监控自定义备份选项变化
watch(customBackupOptions, (newOptions) => {
  if (backupForm.type === 'custom') {
    if (!newOptions.includes('minio')) {
      // 如果不包含MinIO，清空存储桶选择
      backupForm.minio_buckets = []
    } else if (minioBuckets.value.length > 0 && backupForm.minio_buckets.length === 0) {
      // 如果包含MinIO但还没选择存储桶，自动选择推荐的
      backupForm.minio_buckets = minioBuckets.value
        .filter(bucket => bucket.selected)
        .map(bucket => bucket.name)
    }
  }
}, { deep: true })

// ===================== 验证规则 =====================

const backupRules = {
  name: [
    { required: true, message: '请输入备份名称', trigger: 'blur' },
    { min: 1, max: 100, message: '备份名称长度在 1 到 100 个字符', trigger: 'blur' }
  ],
  description: [
    { max: 500, message: '备份描述不能超过 500 个字符', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择备份类型', trigger: 'change' }
  ],
  minio_buckets: [
    {
      validator: (rule, value, callback) => {
        // 仅在全量备份或包含MinIO的自定义备份时需要验证
        const needsMinIO = backupForm.type === 'full' || 
                          (backupForm.type === 'custom' && customBackupOptions.value.includes('minio'))
        
        if (needsMinIO) {
          if (!value || value.length === 0) {
            callback(new Error('请至少选择一个存储桶'))
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
  // 重置表单
  backupForm.type = 'full'
  backupForm.name = ''
  backupForm.description = ''
  backupForm.minio_buckets = []
  backupForm.custom_options = null
  customBackupOptions.value = []
  
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
      'full': '全量备份',
      'custom': '自定义备份'
    }
    taskProgressTitle.value = `创建${typeNames[backupForm.type]}`
    
    // 重置进度状态并显示弹窗
    resetProgress()
    showTaskProgressModal.value = true
    
    // 构造请求参数
    const requestData = {
      type: backupForm.type,
      name: backupForm.name,
      description: backupForm.description || undefined
    }
    
    // 根据备份类型添加相应参数
    if (backupForm.type === 'full') {
      requestData.minio_buckets = backupForm.minio_buckets
    } else if (backupForm.type === 'custom') {
      requestData.custom_options = {
        include_config: customBackupOptions.value.includes('config'),
        database_options: {
          include_mysql: customBackupOptions.value.includes('mysql'),
          include_mongodb: customBackupOptions.value.includes('mongodb'),
          include_minio: customBackupOptions.value.includes('minio'),
          minio_buckets: customBackupOptions.value.includes('minio') ? backupForm.minio_buckets : []
        }
      }
    }
    
    console.log('正在创建备份，参数:', requestData)
    
    // 调用新的备份API（返回任务ID）
    const response = await createSystemBackup(requestData)
    
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



// 一键恢复
const oneClickRestore = async (backup) => {
  try {
    await ElMessageBox.confirm(
      `确定要恢复备份 "${backup.file_name}" 吗？\n\n此操作将：\n• 覆盖当前系统配置和数据\n• 在恢复前自动创建当前备份\n• 恢复完成后需要手动重启服务\n\n请确保您了解此操作的影响！`,
      '确认恢复',
      {
        type: 'warning',
        confirmButtonText: '确认恢复',
        cancelButtonText: '取消',
        confirmButtonClass: 'el-button--primary',
        cancelButtonClass: 'el-button--default',
        customClass: 'tech-message-box',
        dangerouslyUseHTMLString: false,
        lockScroll: true,
        showClose: true,
        closeOnClickModal: false,
        closeOnPressEscape: true,
        beforeClose: (action, instance, done) => {
          if (action === 'confirm') {
            instance.confirmButtonLoading = true
            instance.confirmButtonText = '确认中...'
            setTimeout(() => {
              done()
            }, 300)
          } else {
            done()
          }
        }
      }
    )
    
    // 设置进度弹窗
    taskProgressTitle.value = '一键恢复'
    resetProgress()
    showTaskProgressModal.value = true
    
    console.log('正在执行一键恢复，备份文件:', backup.file_name)
    
    const response = await systemAPI.oneClickRestore(backup.file_name, {
      force_restore: false,
      auto_restart: false,
      backup_before_restore: true
    })
    
    console.log('一键恢复任务响应:', response)
    
    if (response.data && response.data.task_id) {
      // 开始轮询任务进度
      await startPolling(response.data.task_id)
    } else {
      throw new Error('未获取到任务ID')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('一键恢复失败:', error)
      ElMessage.error('一键恢复失败：' + error.message)
      showTaskProgressModal.value = false
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
        cancelButtonText: '取消',
        confirmButtonClass: 'el-button--danger',
        cancelButtonClass: 'el-button--default',
        customClass: 'tech-message-box',
        dangerouslyUseHTMLString: false,
        lockScroll: true,
        showClose: true,
        closeOnClickModal: false,
        closeOnPressEscape: true
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
        cancelButtonText: '取消',
        confirmButtonClass: 'el-button--primary',
        cancelButtonClass: 'el-button--default',
        customClass: 'tech-message-box',
        dangerouslyUseHTMLString: false,
        lockScroll: true,
        showClose: true,
        closeOnClickModal: false,
        closeOnPressEscape: true
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
        cancelButtonText: '取消',
        confirmButtonClass: 'el-button--primary',
        cancelButtonClass: 'el-button--default',
        customClass: 'tech-message-box',
        dangerouslyUseHTMLString: false,
        lockScroll: true,
        showClose: true,
        closeOnClickModal: false,
        closeOnPressEscape: true
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

// 格式化构建时间
const formatBuildTime = (buildTime) => {
  if (!buildTime || buildTime === 'unknown') return 'N/A'
  
  // 如果是ISO格式时间戳，进行格式化
  if (buildTime.includes('T') || buildTime.includes('-')) {
    try {
      const date = new Date(buildTime)
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch (e) {
      return buildTime
    }
  }
  
  return buildTime
}

// 格式化操作系统信息
const formatOSInfo = (os, arch) => {
  if (!os && !arch) return 'N/A'
  
  const osNames = {
    'windows': 'Windows',
    'linux': 'Linux',
    'darwin': 'macOS',
    'freebsd': 'FreeBSD'
  }
  
  const archNames = {
    'amd64': 'x64',
    'x86_64': 'x64',
    '386': 'x86',
    'arm64': 'ARM64',
    'arm': 'ARM'
  }
  
  const osName = osNames[os] || os || 'Unknown'
  const archName = archNames[arch] || arch || 'Unknown'
  
  return `${osName} (${archName})`
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

/* 科技感卡片 */
.tech-card {
  position: relative;
  z-index: 10;
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  margin-bottom: 20px;
}

.tech-card :deep(.el-card__header) {
  background: transparent;
  border-bottom: 1px solid rgba(0, 255, 255, 0.2);
  border-radius: 0;
}

.tech-card :deep(.el-card__body) {
  background: transparent;
  padding: 0;
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

/* 科技感表格 - 彻底解决白底问题 */
.tech-table {
  background: rgba(15, 25, 45, 0.95) !important;
  border-radius: 12px !important;
  overflow: hidden !important;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.3),
    0 0 0 1px rgba(0, 255, 255, 0.2) !important;
  backdrop-filter: blur(10px) !important;
  border: none !important;
  position: relative !important;
}

/* 在表格外层添加遮罩来覆盖白边 */
.tech-table::before {
  content: '' !important;
  position: absolute !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  background: rgba(15, 25, 45, 0.95) !important;
  border-radius: 12px !important;
  z-index: -1 !important;
  pointer-events: none !important;
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

.tech-table :deep(.el-table__header-wrapper) {
  background: linear-gradient(135deg, 
    rgba(20, 35, 60, 1) 0%, 
    rgba(25, 40, 65, 1) 100%) !important;
  border-radius: 12px 12px 0 0 !important;
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
  border-right: 1px solid rgba(0, 255, 255, 0.1) !important;
  text-shadow: 0 0 10px rgba(0, 212, 255, 0.6) !important;
  letter-spacing: 0.5px !important;
  position: relative !important;
}

.tech-table :deep(.el-table__header-wrapper .el-table__header th:last-child) {
  border-right: none !important;
}

.tech-table :deep(.el-table__body-wrapper .el-table__body tr) {
  background: rgba(25, 35, 55, 0.6) !important;
  color: rgba(255, 255, 255, 0.95) !important;
  border-bottom: 1px solid rgba(0, 255, 255, 0.08) !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

.tech-table :deep(.el-table__body-wrapper .el-table__body tr:nth-child(even)) {
  background: rgba(20, 30, 50, 0.7) !important;
}

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

.tech-table :deep(.el-table__body-wrapper .el-table__body td) {
  border: none !important;
  border-right: 1px solid rgba(0, 255, 255, 0.06) !important;
  background: transparent !important;
  padding: 14px 12px !important;
  font-size: 13px !important;
  line-height: 1.5 !important;
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

/* 移除所有边框补丁元素 */
.tech-table :deep(.el-table__border-left-patch) {
  display: none !important;
  width: 0 !important;
  height: 0 !important;
}

.tech-table :deep(.el-table__border-right-patch) {
  display: none !important;
  width: 0 !important;
  height: 0 !important;
}

.tech-table :deep(.el-table__border-bottom-patch) {
  display: none !important;
  width: 0 !important;
  height: 0 !important;
}

.tech-table :deep(.el-table__border-top-patch) {
  display: none !important;
  width: 0 !important;
  height: 0 !important;
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
}

.tech-table :deep(th) {
  border: none !important;
}

/* 移除表格容器本身的边框 */
.tech-table,
.tech-table :deep(.el-table),
.tech-table :deep(.el-table__inner-wrapper) {
  border: none !important;
  outline: none !important;
}

/* 彻底解决表格左右白边问题 */
.tech-table :deep(.el-table__inner-wrapper) {
  margin: 0 !important;
  padding: 0 !important;
  border-left: none !important;
  border-right: none !important;
  border-top: none !important;
  border-bottom: none !important;
  box-shadow: none !important;
}

/* 强制移除 Element Plus 表格的所有可能边框 */
.tech-table :deep(.el-table__inner-wrapper),
.tech-table :deep(.el-table__inner-wrapper *) {
  border: none !important;
  border-left: none !important;
  border-right: none !important;
  border-top: none !important;
  border-bottom: none !important;
  outline: none !important;
  box-shadow: none !important;
}

/* 移除表格边框相关的所有CSS类效果 */
.tech-table :deep(.el-table--border),
.tech-table :deep(.el-table--border *) {
  border: none !important;
  border-left: none !important;
  border-right: none !important;
  border-top: none !important;
  border-bottom: none !important;
  box-shadow: none !important;
}

/* 强制覆盖表格的边框样式 */
.tech-table :deep(.el-table) {
  border-collapse: separate !important;
  border-spacing: 0 !important;
  margin: 0 !important;
  padding: 0 !important;
}

/* 移除条纹样式可能产生的边框 */
.tech-table :deep(.el-table--striped .el-table__body tr.el-table__row--striped td) {
  border: none !important;
}

/* 确保表格头部和主体没有边框 */
.tech-table :deep(.el-table__header-wrapper),
.tech-table :deep(.el-table__body-wrapper),
.tech-table :deep(.el-table__footer-wrapper) {
  border: none !important;
  border-left: none !important;
  border-right: none !important;
  border-top: none !important;
  border-bottom: none !important;
  margin: 0 !important;
  padding: 0 !important;
}

/* 彻底移除表格单元格的所有边框 */
.tech-table :deep(.el-table .el-table__cell) {
  border: none !important;
  border-left: none !important;
  border-right: none !important;
  border-top: none !important;
  border-bottom: none !important;
}

.tech-table :deep(.el-table th.el-table__cell) {
  border: none !important;
  border-left: none !important;
  border-right: none !important;
  border-top: none !important;
  border-bottom: none !important;
}

.tech-table :deep(.el-table td.el-table__cell) {
  border: none !important;
  border-left: none !important;
  border-right: none !important;
  border-top: none !important;
  border-bottom: none !important;
}

/* 终极解决方案 - 强制覆盖所有可能的白边 */
.tech-table :deep(.el-table),
.tech-table :deep(.el-table *),
.tech-table :deep(.el-table__inner-wrapper),
.tech-table :deep(.el-table__inner-wrapper *) {
  border: 0 !important;
  border-width: 0 !important;
  border-style: none !important;
  border-color: transparent !important;
  outline: 0 !important;
  outline-width: 0 !important;
  outline-style: none !important;
  outline-color: transparent !important;
  box-shadow: none !important;
}

/* 强制移除 Element Plus 的所有默认样式 */
.tech-table :deep(.el-table--border),
.tech-table :deep(.el-table--group),
.tech-table :deep(.el-table--striped) {
  border: 0 !important;
  border-width: 0 !important;
  border-style: none !important;
  border-color: transparent !important;
}

/* 覆盖所有伪元素的边框 */
.tech-table :deep(.el-table::before),
.tech-table :deep(.el-table::after),
.tech-table :deep(.el-table *::before),
.tech-table :deep(.el-table *::after) {
  border: 0 !important;
  border-width: 0 !important;
  border-style: none !important;
  border-color: transparent !important;
  content: none !important;
  display: none !important;
}

/* 强制设置表格内所有元素的背景色 */
.tech-table :deep(.el-table),
.tech-table :deep(.el-table__inner-wrapper) {
  background-color: rgba(15, 25, 45, 0.95) !important;
  background: rgba(15, 25, 45, 0.95) !important;
}

/* 移除表格的默认边距和内边距 */
.tech-table :deep(.el-table),
.tech-table :deep(.el-table *) {
  margin: 0 !important;
  padding: 0 !important;
}

/* 重新设置单元格的内边距 */
.tech-table :deep(.el-table th),
.tech-table :deep(.el-table td) {
  padding: 14px 12px !important;
}

/* 确保表格宽度100%且没有额外空白 */
.tech-table :deep(.el-table) {
  width: 100% !important;
  table-layout: fixed !important;
  border-collapse: collapse !important;
  border-spacing: 0 !important;
}

/* 强制移除可能的边框阴影效果 */
.tech-table :deep(*) {
  box-shadow: none !important;
  text-shadow: none;
}

/* 重新添加文字阴影给表头 */
.tech-table :deep(.el-table__header-wrapper .el-table__header th) {
  text-shadow: 0 0 10px rgba(0, 212, 255, 0.6) !important;
}

/* 操作按钮横向排布样式 */
.operation-buttons {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
  flex-wrap: nowrap;
}

.operation-buttons .el-button {
  margin: 0 !important;
  flex-shrink: 0;
  min-width: 56px;
  padding: 6px 12px !important;
}

.version-management-container {
  padding: 20px;
}

.config-card {
  margin-bottom: 24px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
  color: #00ffff;
  text-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
}

.version-management-container h2 {
  margin: 24px 0 20px 0;
  color: #00ffff;
  font-size: 24px;
  font-weight: 600;
  text-shadow: 0 0 15px rgba(0, 255, 255, 0.6);
  position: relative;
  z-index: 10;
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

@media (max-width: 768px) {
  .version-management-container {
    padding: 10px;
  }
  
  .version-management-container h2 {
    font-size: 20px;
    margin: 16px 0;
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
  margin-left: 12px;
}

/* 警告框样式调整 */
.el-alert {
  margin: 16px 0;
}

/* ==================== 输入框和表单样式 ==================== */

/* 输入框通用样式 */
:deep(.el-input__wrapper) {
  background: rgba(0, 20, 40, 0.6) !important;
  border: 1px solid rgba(0, 255, 255, 0.3) !important;
  border-radius: 4px !important;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.3) !important;
  transition: all 0.3s ease !important;
}

:deep(.el-input__wrapper:hover) {
  border-color: rgba(0, 255, 255, 0.5) !important;
  box-shadow: 0 0 8px rgba(0, 255, 255, 0.3) !important;
}

:deep(.el-input__wrapper.is-focus) {
  border-color: #00ffff !important;
  box-shadow: 0 0 12px rgba(0, 255, 255, 0.4) !important;
}

:deep(.el-input__inner) {
  color: #ffffff !important;
  background: transparent !important;
  text-shadow: 0 0 3px rgba(255, 255, 255, 0.3) !important;
}

:deep(.el-input__inner::placeholder) {
  color: rgba(255, 255, 255, 0.5) !important;
}

/* 选择器样式 */
:deep(.el-select) {
  width: 100%;
}

:deep(.el-select .el-input__wrapper) {
  background: rgba(0, 20, 40, 0.6) !important;
  border: 1px solid rgba(0, 255, 255, 0.3) !important;
}

:deep(.el-select .el-input__wrapper:hover) {
  border-color: rgba(0, 255, 255, 0.5) !important;
}

/* 下拉面板样式 */
:deep(.el-select-dropdown) {
  background: rgba(0, 20, 40, 0.95) !important;
  border: 1px solid rgba(0, 255, 255, 0.3) !important;
  border-radius: 6px !important;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3) !important;
  backdrop-filter: blur(10px) !important;
}

:deep(.el-select-dropdown .el-select-dropdown__item) {
  color: #ffffff !important;
  background: transparent !important;
}

:deep(.el-select-dropdown .el-select-dropdown__item:hover) {
  background: rgba(0, 255, 255, 0.1) !important;
}

:deep(.el-select-dropdown .el-select-dropdown__item.selected) {
  background: rgba(0, 255, 255, 0.2) !important;
  color: #00ffff !important;
}

/* 表单标签样式 */
:deep(.el-form-item__label) {
  color: #ffffff !important;
  text-shadow: 0 0 3px rgba(255, 255, 255, 0.3) !important;
  font-weight: 500;
}

/* 文本区域样式 */
:deep(.el-textarea__inner) {
  background: rgba(0, 20, 40, 0.6) !important;
  border: 1px solid rgba(0, 255, 255, 0.3) !important;
  color: #ffffff !important;
  border-radius: 4px !important;
}

:deep(.el-textarea__inner:hover) {
  border-color: rgba(0, 255, 255, 0.5) !important;
}

:deep(.el-textarea__inner:focus) {
  border-color: #00ffff !important;
  box-shadow: 0 0 8px rgba(0, 255, 255, 0.3) !important;
}

/* 上传组件样式 */
:deep(.el-upload) {
  border: 1px dashed rgba(0, 255, 255, 0.4) !important;
  background: rgba(15, 25, 45, 0.8) !important;
  border-radius: 8px !important;
  transition: all 0.3s ease !important;
  backdrop-filter: blur(10px) !important;
}

:deep(.el-upload:hover) {
  border-color: rgba(0, 255, 255, 0.6) !important;
  background: rgba(15, 25, 45, 0.9) !important;
  box-shadow: 0 0 15px rgba(0, 255, 255, 0.3) !important;
  transform: translateY(-1px) !important;
}

/* 上传拖拽区域样式 */
:deep(.el-upload-dragger) {
  background: rgba(20, 30, 50, 0.6) !important;
  border: 1px dashed rgba(0, 255, 255, 0.3) !important;
  border-radius: 6px !important;
  transition: all 0.3s ease !important;
  color: rgba(255, 255, 255, 0.8) !important;
  backdrop-filter: blur(5px) !important;
}

:deep(.el-upload-dragger:hover) {
  background: rgba(20, 30, 50, 0.8) !important;
  border-color: rgba(0, 255, 255, 0.5) !important;
  box-shadow: 
    0 4px 20px rgba(0, 255, 255, 0.2),
    inset 0 1px 0 rgba(0, 255, 255, 0.1) !important;
}

/* 上传区域图标样式 */
:deep(.el-upload-dragger .el-icon) {
  color: rgba(0, 255, 255, 0.7) !important;
  text-shadow: 0 0 10px rgba(0, 255, 255, 0.3) !important;
}

:deep(.el-upload-dragger:hover .el-icon) {
  color: #00ffff !important;
  text-shadow: 0 0 15px rgba(0, 255, 255, 0.5) !important;
}

/* 上传区域文字样式 */
:deep(.el-upload-dragger .el-upload__text) {
  color: rgba(255, 255, 255, 0.9) !important;
  font-weight: 500 !important;
}

:deep(.el-upload-dragger .el-upload__text em) {
  color: #00ffff !important;
  text-shadow: 0 0 5px rgba(0, 255, 255, 0.3) !important;
}

/* 上传提示文字样式 */
:deep(.el-upload__tip) {
  color: rgba(255, 255, 255, 0.7) !important;
  font-size: 12px !important;
  margin-top: 10px !important;
}

/* 对话框样式 */
:deep(.el-dialog) {
  background: rgba(0, 20, 40, 0.95) !important;
  border: 1px solid rgba(0, 255, 255, 0.3) !important;
  border-radius: 8px !important;
  backdrop-filter: blur(10px) !important;
}

:deep(.el-dialog__header) {
  background: transparent !important;
  border-bottom: 1px solid rgba(0, 255, 255, 0.2) !important;
}

:deep(.el-dialog__title) {
  color: #00ffff !important;
  text-shadow: 0 0 10px rgba(0, 255, 255, 0.5) !important;
}

:deep(.el-dialog__body) {
  background: transparent !important;
  color: #ffffff !important;
}

/* 进度条样式 */
:deep(.el-progress-bar__outer) {
  background: rgba(0, 20, 40, 0.6) !important;
  border: 1px solid rgba(0, 255, 255, 0.3) !important;
}

:deep(.el-progress-bar__inner) {
  background: linear-gradient(90deg, #00ffff, #0080ff) !important;
}

/* 描述列表样式调整 */
:deep(.el-descriptions) {
  background: transparent !important;
}

:deep(.el-descriptions__body) {
  background: transparent !important;
}

:deep(.el-descriptions__body .el-descriptions__table) {
  background: rgba(15, 25, 45, 0.95) !important;
  border-radius: 8px !important;
  overflow: hidden !important;
  border: 1px solid rgba(0, 255, 255, 0.2) !important;
  box-shadow: 
    0 4px 16px rgba(0, 0, 0, 0.3),
    0 0 0 1px rgba(0, 255, 255, 0.1) !important;
  backdrop-filter: blur(10px) !important;
}

:deep(.el-descriptions__body .el-descriptions__table .el-descriptions__cell) {
  background: rgba(25, 35, 55, 0.6) !important;
  color: #ffffff !important;
  border: 1px solid rgba(0, 255, 255, 0.1) !important;
  padding: 16px 12px !important;
  transition: all 0.3s ease !important;
}

:deep(.el-descriptions__body .el-descriptions__table .el-descriptions__cell:nth-child(even)) {
  background: rgba(20, 30, 50, 0.7) !important;
}

:deep(.el-descriptions__body .el-descriptions__table .el-descriptions__cell:hover) {
  background: rgba(0, 255, 255, 0.08) !important;
  box-shadow: inset 0 1px 0 rgba(0, 255, 255, 0.2) !important;
}

:deep(.el-descriptions__body .el-descriptions__table .el-descriptions__label) {
  color: #00ffff !important;
  font-weight: 600 !important;
  text-shadow: 0 0 5px rgba(0, 255, 255, 0.3) !important;
  background: rgba(20, 35, 60, 0.8) !important;
  border-right: 1px solid rgba(0, 255, 255, 0.2) !important;
}

:deep(.el-descriptions__body .el-descriptions__table .el-descriptions__content) {
  background: rgba(25, 35, 55, 0.6) !important;
  color: rgba(255, 255, 255, 0.95) !important;
  font-weight: 500 !important;
}

/* 确保表格第一行和最后一行的圆角 */
:deep(.el-descriptions__body .el-descriptions__table .el-descriptions__cell:first-child) {
  border-top-left-radius: 8px !important;
}

:deep(.el-descriptions__body .el-descriptions__table .el-descriptions__cell:nth-child(2)) {
  border-top-right-radius: 8px !important;
}

:deep(.el-descriptions__body .el-descriptions__table tr:last-child .el-descriptions__cell:first-child) {
  border-bottom-left-radius: 8px !important;
}

:deep(.el-descriptions__body .el-descriptions__table tr:last-child .el-descriptions__cell:last-child) {
  border-bottom-right-radius: 8px !important;
}

/* 警告框样式更新 - 科技风主题 */
:deep(.el-alert) {
  border-radius: 6px !important;
  backdrop-filter: blur(5px) !important;
}

/* 警告类型 alert */
:deep(.el-alert--warning) {
  background: rgba(255, 165, 0, 0.1) !important;
  border: 1px solid rgba(255, 165, 0, 0.4) !important;
  box-shadow: 0 0 10px rgba(255, 165, 0, 0.2) !important;
}

:deep(.el-alert--warning .el-alert__content) {
  color: #ffaa00 !important;
  text-shadow: 0 0 5px rgba(255, 170, 0, 0.3) !important;
}

:deep(.el-alert--warning .el-alert__icon) {
  color: #ffaa00 !important;
  filter: drop-shadow(0 0 3px rgba(255, 170, 0, 0.4)) !important;
}

/* 信息类型 alert */
:deep(.el-alert--info) {
  background: rgba(0, 255, 255, 0.1) !important;
  border: 1px solid rgba(0, 255, 255, 0.4) !important;
  box-shadow: 0 0 10px rgba(0, 255, 255, 0.2) !important;
}

:deep(.el-alert--info .el-alert__content) {
  color: #00ffff !important;
  text-shadow: 0 0 5px rgba(0, 255, 255, 0.3) !important;
}

:deep(.el-alert--info .el-alert__icon) {
  color: #00ffff !important;
  filter: drop-shadow(0 0 3px rgba(0, 255, 255, 0.4)) !important;
}

/* 其他文本颜色调整 */
.config-form p,
.config-form span,
.config-form div {
  color: #ffffff !important;
}

.backup-list h4,
.restore-actions h4,
.upgrade-actions h4 {
  color: #00ffff !important;
  text-shadow: 0 0 8px rgba(0, 255, 255, 0.4) !important;
}

/* 备份和恢复说明文字 */
.backup-section p,
.restore-section p,
.upgrade-section p {
  color: rgba(255, 255, 255, 0.8) !important;
}

/* ==================== 科技感消息弹窗样式 ==================== */

/* 科技感 MessageBox 样式 - 使用更高的优先级 */
:deep(.el-message-box),
.el-message-box {
  background: rgba(0, 20, 40, 0.98) !important;
  border: 1px solid rgba(0, 255, 255, 0.4) !important;
  border-radius: 12px !important;
  backdrop-filter: blur(20px) !important;
  box-shadow: 
    0 20px 60px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(0, 255, 255, 0.2),
    inset 0 1px 0 rgba(0, 255, 255, 0.1) !important;
  min-width: 420px !important;
  max-width: 600px !important;
}

/* MessageBox 头部样式 */
:deep(.el-message-box__header),
.el-message-box__header {
  background: transparent !important;
  border-bottom: 1px solid rgba(0, 255, 255, 0.2) !important;
  padding: 20px 20px 15px 20px !important;
}

:deep(.el-message-box__title),
.el-message-box__title {
  color: #00ffff !important;
  font-size: 18px !important;
  font-weight: 600 !important;
  text-shadow: 0 0 10px rgba(0, 255, 255, 0.5) !important;
  letter-spacing: 0.5px !important;
}

/* MessageBox 关闭按钮样式 */
:deep(.el-message-box__headerbtn),
.el-message-box__headerbtn {
  color: rgba(255, 255, 255, 0.6) !important;
  background: rgba(0, 255, 255, 0.1) !important;
  border: 1px solid rgba(0, 255, 255, 0.2) !important;
  border-radius: 50% !important;
  width: 32px !important;
  height: 32px !important;
  transition: all 0.3s ease !important;
}

:deep(.el-message-box__headerbtn:hover),
.el-message-box__headerbtn:hover {
  color: #00ffff !important;
  background: rgba(0, 255, 255, 0.2) !important;
  border-color: rgba(0, 255, 255, 0.4) !important;
  box-shadow: 0 0 15px rgba(0, 255, 255, 0.3) !important;
  transform: scale(1.05) !important;
}

:deep(.el-message-box__close) {
  font-size: 16px !important;
}

/* MessageBox 内容区域样式 */
:deep(.el-message-box__content),
.el-message-box__content {
  background: transparent !important;
  padding: 20px !important;
  color: rgba(255, 255, 255, 0.95) !important;
}

:deep(.el-message-box__container) {
  position: relative !important;
}

/* MessageBox 图标样式 */
:deep(.el-message-box__status) {
  font-size: 28px !important;
  margin-right: 16px !important;
  filter: drop-shadow(0 0 8px currentColor) !important;
}

:deep(.el-message-box__status.el-icon-warning) {
  color: #ffaa00 !important;
}

:deep(.el-message-box__status.el-icon-success) {
  color: #67c23a !important;
}

:deep(.el-message-box__status.el-icon-error) {
  color: #ff5252 !important;
}

:deep(.el-message-box__status.el-icon-info) {
  color: #409eff !important;
}

/* MessageBox 消息文本样式 */
:deep(.el-message-box__message),
.el-message-box__message {
  color: rgba(255, 255, 255, 0.95) !important;
  font-size: 15px !important;
  line-height: 1.8 !important;
  margin: 0 !important;
  word-break: break-word !important;
  white-space: pre-line !important;
}

/* MessageBox 按钮区域样式 */
:deep(.el-message-box__btns),
.el-message-box__btns {
  background: transparent !important;
  border-top: 1px solid rgba(0, 255, 255, 0.1) !important;
  padding: 20px !important;
  text-align: right !important;
}

/* MessageBox 按钮样式 */
:deep(.el-message-box__btns .el-button),
.el-message-box__btns .el-button {
  margin-left: 12px !important;
  padding: 10px 20px !important;
  border-radius: 6px !important;
  font-weight: 500 !important;
  letter-spacing: 0.5px !important;
  transition: all 0.3s ease !important;
  min-width: 100px !important;
}

/* 取消按钮样式 */
:deep(.el-message-box__btns .el-button--default),
.el-message-box__btns .el-button--default {
  background: rgba(128, 128, 128, 0.1) !important;
  border: 1px solid rgba(128, 128, 128, 0.4) !important;
  color: rgba(255, 255, 255, 0.8) !important;
  box-shadow: 0 0 8px rgba(128, 128, 128, 0.1) !important;
}

:deep(.el-message-box__btns .el-button--default:hover),
.el-message-box__btns .el-button--default:hover {
  background: rgba(128, 128, 128, 0.2) !important;
  border-color: rgba(128, 128, 128, 0.6) !important;
  color: #ffffff !important;
  box-shadow: 0 0 15px rgba(128, 128, 128, 0.3) !important;
  transform: translateY(-1px) !important;
}

/* 确认按钮样式 */
:deep(.el-message-box__btns .el-button--primary),
.el-message-box__btns .el-button--primary {
  background: rgba(0, 255, 255, 0.1) !important;
  border: 1px solid rgba(0, 255, 255, 0.4) !important;
  color: #00ffff !important;
  box-shadow: 0 0 10px rgba(0, 255, 255, 0.2) !important;
}

:deep(.el-message-box__btns .el-button--primary:hover),
.el-message-box__btns .el-button--primary:hover {
  background: rgba(0, 255, 255, 0.2) !important;
  border-color: rgba(0, 255, 255, 0.6) !important;
  box-shadow: 0 0 20px rgba(0, 255, 255, 0.4) !important;
  transform: translateY(-1px) !important;
}

/* 危险按钮样式（删除等操作） */
:deep(.el-message-box__btns .el-button--danger),
.el-message-box__btns .el-button--danger {
  background: rgba(255, 82, 82, 0.1) !important;
  border: 1px solid rgba(255, 82, 82, 0.4) !important;
  color: #ff5252 !important;
  box-shadow: 0 0 10px rgba(255, 82, 82, 0.2) !important;
}

:deep(.el-message-box__btns .el-button--danger:hover),
.el-message-box__btns .el-button--danger:hover {
  background: rgba(255, 82, 82, 0.2) !important;
  border-color: rgba(255, 82, 82, 0.6) !important;
  box-shadow: 0 0 20px rgba(255, 82, 82, 0.4) !important;
  transform: translateY(-1px) !important;
}

/* 警告类型 MessageBox 特殊效果 */
:deep(.el-message-box--warning) {
  border-color: rgba(255, 165, 0, 0.4) !important;
  box-shadow: 
    0 20px 60px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(255, 165, 0, 0.2),
    inset 0 1px 0 rgba(255, 165, 0, 0.1) !important;
}

:deep(.el-message-box--warning .el-message-box__title) {
  color: #ffaa00 !important;
  text-shadow: 0 0 10px rgba(255, 170, 0, 0.5) !important;
}

/* 成功类型 MessageBox 特殊效果 */
:deep(.el-message-box--success) {
  border-color: rgba(103, 194, 58, 0.4) !important;
  box-shadow: 
    0 20px 60px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(103, 194, 58, 0.2),
    inset 0 1px 0 rgba(103, 194, 58, 0.1) !important;
}

:deep(.el-message-box--success .el-message-box__title) {
  color: #67c23a !important;
  text-shadow: 0 0 10px rgba(103, 194, 58, 0.5) !important;
}

/* MessageBox 遮罩层样式 */
:deep(.el-overlay) {
  background-color: rgba(0, 0, 0, 0.7) !important;
  backdrop-filter: blur(8px) !important;
}

/* 自定义科技感 MessageBox 类 */
:deep(.tech-message-box) {
  position: relative !important;
}

:deep(.tech-message-box::before) {
  content: '' !important;
  position: absolute !important;
  top: -2px !important;
  left: -2px !important;
  right: -2px !important;
  bottom: -2px !important;
  background: linear-gradient(45deg, 
    transparent, 
    rgba(0, 255, 255, 0.3), 
    transparent, 
    rgba(0, 255, 255, 0.3), 
    transparent) !important;
  border-radius: 14px !important;
  z-index: -1 !important;
  animation: borderGlow 3s linear infinite !important;
}

@keyframes borderGlow {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

/* MessageBox 动画增强 */
:deep(.el-message-box) {
  animation: messageBoxFadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

@keyframes messageBoxFadeIn {
  0% {
    opacity: 0;
    transform: scale(0.8) translateY(-20px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  :deep(.el-message-box) {
    min-width: 320px !important;
    max-width: 90vw !important;
    margin: 20px !important;
  }
  
  :deep(.el-message-box__content) {
    padding: 15px !important;
  }
  
  :deep(.el-message-box__btns) {
    padding: 15px !important;
    text-align: center !important;
  }
  
  :deep(.el-message-box__btns .el-button) {
    margin: 5px !important;
    width: 100px !important;
  }
}

/* ==================== 科技感按钮样式扩展 ==================== */

/* 科技感主要按钮 */
.tech-button {
  border: 1px solid rgba(0, 255, 255, 0.4) !important;
  background: rgba(0, 255, 255, 0.1) !important;
  color: #00ffff !important;
  border-radius: 6px !important;
  transition: all 0.3s ease !important;
  box-shadow: 0 0 10px rgba(0, 255, 255, 0.2) !important;
  padding: 8px 16px !important;
  font-weight: 500 !important;
}

.tech-button:hover {
  background: rgba(0, 255, 255, 0.2) !important;
  box-shadow: 0 0 20px rgba(0, 255, 255, 0.4) !important;
  transform: translateY(-1px) !important;
  border-color: rgba(0, 255, 255, 0.6) !important;
}

/* 科技感次要按钮 */
.tech-button-secondary {
  border: 1px solid rgba(128, 128, 128, 0.4) !important;
  background: rgba(64, 64, 64, 0.1) !important;
  color: rgba(255, 255, 255, 0.8) !important;
  border-radius: 6px !important;
  transition: all 0.3s ease !important;
  box-shadow: 0 0 8px rgba(128, 128, 128, 0.1) !important;
  padding: 8px 16px !important;
}

.tech-button-secondary:hover {
  background: rgba(128, 128, 128, 0.2) !important;
  box-shadow: 0 0 15px rgba(128, 128, 128, 0.3) !important;
  transform: translateY(-1px) !important;
  color: #ffffff !important;
  border-color: rgba(128, 128, 128, 0.6) !important;
}

/* 科技感危险按钮 */
.tech-button-danger {
  border: 1px solid rgba(255, 82, 82, 0.4) !important;
  background: rgba(255, 82, 82, 0.1) !important;
  color: #ff5252 !important;
  border-radius: 6px !important;
  transition: all 0.3s ease !important;
  box-shadow: 0 0 10px rgba(255, 82, 82, 0.2) !important;
  padding: 8px 16px !important;
  font-weight: 500 !important;
}

.tech-button-danger:hover {
  background: rgba(255, 82, 82, 0.2) !important;
  box-shadow: 0 0 20px rgba(255, 82, 82, 0.4) !important;
  transform: translateY(-1px) !important;
  border-color: rgba(255, 82, 82, 0.6) !important;
}

/* 科技感信息按钮 */
.tech-button-info {
  border: 1px solid rgba(64, 158, 255, 0.4) !important;
  background: rgba(64, 158, 255, 0.1) !important;
  color: #409eff !important;
  border-radius: 6px !important;
  transition: all 0.3s ease !important;
  box-shadow: 0 0 10px rgba(64, 158, 255, 0.2) !important;
  padding: 8px 16px !important;
  font-weight: 500 !important;
}

.tech-button-info:hover {
  background: rgba(64, 158, 255, 0.2) !important;
  box-shadow: 0 0 20px rgba(64, 158, 255, 0.4) !important;
  transform: translateY(-1px) !important;
  border-color: rgba(64, 158, 255, 0.6) !important;
}

/* 科技感成功按钮 */
.tech-button-success {
  border: 1px solid rgba(103, 194, 58, 0.4) !important;
  background: rgba(103, 194, 58, 0.1) !important;
  color: #67c23a !important;
  border-radius: 6px !important;
  transition: all 0.3s ease !important;
  box-shadow: 0 0 10px rgba(103, 194, 58, 0.2) !important;
  padding: 8px 16px !important;
  font-weight: 500 !important;
}

.tech-button-success:hover {
  background: rgba(103, 194, 58, 0.2) !important;
  box-shadow: 0 0 20px rgba(103, 194, 58, 0.4) !important;
  transform: translateY(-1px) !important;
  border-color: rgba(103, 194, 58, 0.6) !important;
}

/* 便捷操作区域背景优化 */
.backup-section :deep(.el-card__body) > div > div {
  background: rgba(0, 20, 40, 0.3) !important;
  border: 1px solid rgba(0, 255, 255, 0.1) !important;
  border-radius: 6px;
}

/* ==================== 文字和间距优化 ==================== */

/* 增加文字行间距 */
:deep(p), :deep(div), :deep(span) {
  line-height: 1.6 !important;
}

/* 段落间距优化 */
:deep(.el-card__body p) {
  margin-bottom: 16px !important;
}

:deep(.el-card__body p:last-child) {
  margin-bottom: 0 !important;
}

/* 表格行间距优化 */
:deep(.el-table .el-table__row) {
  height: 50px !important;
}

/* 描述列表间距优化 */
:deep(.el-descriptions__body .el-descriptions__table .el-descriptions__cell) {
  padding: 16px 12px !important;
  line-height: 1.6 !important;
}

/* 表单项间距优化 */
.el-form-item {
  margin-bottom: 28px !important;
}

/* 按钮组间距优化 */
.restore-actions .el-button,
.upgrade-actions .el-button {
  margin-right: 16px !important;
}

.restore-actions .el-button:last-child,
.upgrade-actions .el-button:last-child {
  margin-right: 0 !important;
}

/* 便捷操作按钮间距 */
:deep(.backup-section .el-button) {
  margin-right: 12px !important;
  margin-bottom: 8px !important;
}

:deep(.backup-section .el-button:last-child) {
  margin-right: 0 !important;
}

/* MinIO桶选择区域滚动条样式 */
.minio-buckets-container::-webkit-scrollbar {
  width: 8px;
}

.minio-buckets-container::-webkit-scrollbar-track {
  background: rgba(0, 20, 40, 0.3);
  border-radius: 4px;
}

.minio-buckets-container::-webkit-scrollbar-thumb {
  background: rgba(0, 255, 255, 0.4);
  border-radius: 4px;
  transition: all 0.3s ease;
}

.minio-buckets-container::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 255, 255, 0.6);
  box-shadow: 0 0 8px rgba(0, 255, 255, 0.3);
}

.minio-buckets-container::-webkit-scrollbar-thumb:active {
  background: rgba(0, 255, 255, 0.8);
}

/* 版本检查提示框样式 */
:deep(.version-check-tooltip) {
  max-width: 600px !important;
  background: rgba(15, 25, 45, 0.98) !important;
  border: 1px solid rgba(0, 255, 255, 0.3) !important;
  border-radius: 8px !important;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4), 0 0 20px rgba(0, 255, 255, 0.2) !important;
  backdrop-filter: blur(10px) !important;
}

:deep(.version-check-tooltip .el-popper__arrow) {
  border-right-color: rgba(0, 255, 255, 0.3) !important;
}

.version-check-info {
  color: #ffffff;
  font-size: 16px;
  line-height: 1.6;
}

.version-check-info .tooltip-title {
  font-size: 18px;
  font-weight: 600;
  color: #00ffff;
  margin-bottom: 16px;
  text-align: center;
  text-shadow: 0 0 8px rgba(0, 255, 255, 0.4);
  border-bottom: 1px solid rgba(0, 255, 255, 0.2);
  padding-bottom: 8px;
}

.version-check-info .tooltip-section {
  margin-bottom: 16px;
}

.version-check-info .tooltip-section:last-child {
  margin-bottom: 0;
}

.version-check-info .section-title {
  font-size: 17px;
  font-weight: 600;
  color: #00ffff;
  margin-bottom: 8px;
  text-shadow: 0 0 5px rgba(0, 255, 255, 0.3);
}

.version-check-info .section-content {
  color: rgba(255, 255, 255, 0.9);
  margin-left: 12px;
  line-height: 1.8;
  font-size: 15px;
}

.version-check-info .section-content strong {
  color: #ffffff;
  font-weight: 600;
}

/* 标题和帮助图标布局 */
.header-title-with-help {
  display: flex;
  align-items: center;
  gap: 10px;
}

.help-icon {
  font-size: 20px;
  color: #409EFF;
  cursor: help;
  transition: all 0.3s ease;
}

.help-icon:hover {
  color: #00ffff !important;
  transform: scale(1.2);
  text-shadow: 0 0 10px rgba(0, 255, 255, 0.6);
}
</style>