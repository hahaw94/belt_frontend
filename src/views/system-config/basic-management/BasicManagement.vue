<template>
  <div class="basic-management-container sub-page-content">
    <h2>基础管理</h2>

    <!-- 系统基础配置 -->
    <el-card class="config-card mb-20" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>系统基础配置</span>
          <el-button type="primary" :icon="Setting" size="small" @click="refreshConfig" :loading="configLoading">刷新配置</el-button>
        </div>
      </template>
      <el-form :model="systemConfig" :rules="configRules" ref="configFormRef" label-width="150px" class="config-form" v-loading="configLoading">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="系统名称" prop="system_name">
              <el-input v-model="systemConfig.system_name" placeholder="请输入系统名称"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="平台端口" prop="platform_port">
              <el-input-number v-model="systemConfig.platform_port" :min="1000" :max="65535" controls-position="right"></el-input-number>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="时区设置" prop="timezone">
              <el-select v-model="systemConfig.timezone" placeholder="请选择时区" style="width: 100%">
                <el-option label="Asia/Shanghai" value="Asia/Shanghai"></el-option>
                <el-option label="Asia/Beijing" value="Asia/Beijing"></el-option>
                <el-option label="UTC" value="UTC"></el-option>
                <el-option label="America/New_York" value="America/New_York"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="最大摄像头数">
              <el-input-number v-model="systemConfig.max_camera_count" :min="100" :max="2000" controls-position="right" disabled></el-input-number>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="NTP服务器" prop="ntp_server">
              <el-input v-model="systemConfig.ntp_server" placeholder="请输入NTP服务器地址">
                <template #append>
                  <el-switch v-model="systemConfig.time_sync_enabled" />
                </template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="当前摄像头数">
              <el-tag type="info" size="large">{{ systemConfig.current_camera_count }} 台</el-tag>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item>
          <el-button type="primary" :icon="Check" @click="saveBasicConfig" :loading="saveLoading">保存配置</el-button>
          <el-button :icon="Refresh" @click="resetForm('configFormRef')">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 时间同步管理 -->
    <el-card class="time-sync-card mb-20" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>时间同步管理</span>
          <el-tag :type="timeStatus.type" size="small">{{ timeStatus.text }}</el-tag>
        </div>
      </template>
      <div class="time-sync-content">
        <el-row :gutter="20" align="middle">
          <el-col :span="8">
            <div class="time-info">
              <div class="time-label">当前系统时间：</div>
              <div class="time-value">{{ currentTime }}</div>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="time-info">
              <div class="time-label">NTP服务器：</div>
              <div class="time-value">{{ systemConfig.ntp_server || '未配置' }}</div>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="time-operations">
              <el-button type="primary" :icon="Timer" @click="syncTime" :loading="syncLoading" :disabled="!systemConfig.time_sync_enabled">立即同步时间</el-button>
            </div>
          </el-col>
        </el-row>
        <el-divider></el-divider>
        <el-form :model="timeSyncForm" label-width="120px" :inline="true">
          <el-form-item label="同步设备">
            <el-switch v-model="timeSyncForm.sync_devices" active-text="同步前端设备"></el-switch>
          </el-form-item>
          <el-form-item label="NTP服务器">
            <el-input v-model="timeSyncForm.ntp_server" placeholder="临时指定NTP服务器" style="width: 200px"></el-input>
          </el-form-item>
        </el-form>
      </div>
    </el-card>

    <!-- 平台IP管理 -->
    <el-card class="ip-management-card mb-20" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>平台IP管理</span>
          <el-tag type="warning" size="small">
            <el-icon><Warning /></el-icon>
            修改后将重启服务
          </el-tag>
        </div>
      </template>
      <div class="ip-management-content">
        <el-alert
          title="重要提示"
          type="warning"
          description="修改平台IP地址后系统将自动重启相关服务，请确保在业务空闲时间进行操作，并准备好新地址访问平台。"
          show-icon
          :closable="false"
          class="mb-20">
        </el-alert>
        
        <el-form :model="ipChangeForm" :rules="ipRules" ref="ipFormRef" label-width="120px">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="当前IP地址">
                <el-input v-model="systemConfig.platform_ip" disabled>
                  <template #prepend>当前</template>
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="新IP地址" prop="new_ip">
                <el-input v-model="ipChangeForm.new_ip" placeholder="请输入新的IP地址">
                  <template #prepend>新</template>
                </el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="确认修改">
            <el-checkbox v-model="ipChangeForm.confirm">我确认要修改平台IP地址，并承担相应风险</el-checkbox>
          </el-form-item>
          <el-form-item label="自动重启">
            <el-switch v-model="ipChangeForm.auto_restart" active-text="修改后自动重启服务"></el-switch>
          </el-form-item>
          <el-form-item>
            <el-button type="danger" :icon="Edit" @click="changeIP" :loading="ipChangeLoading" :disabled="!ipChangeForm.confirm">
              一键修改IP
            </el-button>
            <el-button :icon="Refresh" @click="resetForm('ipFormRef')">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>

    <!-- 设备参数统一配置 -->
    <el-card class="device-params-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>设备参数统一配置</span>
          <div>
            <el-button type="primary" :icon="Upload" size="small" @click="handleBatchImport">批量导入参数</el-button>
            <el-button type="success" :icon="Download" size="small" @click="exportDeviceParams">导出参数</el-button>
          </div>
        </div>
      </template>
      <el-form :model="deviceParams" label-width="150px" class="device-params-form">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="设备连接超时(s)">
              <el-input-number v-model="deviceParams.connection_timeout" :min="5" :max="300"></el-input-number>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="心跳间隔(s)">
              <el-input-number v-model="deviceParams.heartbeat_interval" :min="10" :max="300"></el-input-number>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="数据上报频率(s)">
              <el-input-number v-model="deviceParams.upload_frequency" :min="1" :max="60"></el-input-number>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="最大心跳超时(s)">
              <el-input-number v-model="deviceParams.max_heartbeat_timeout" :min="60" :max="600"></el-input-number>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="视频流质量">
              <el-select v-model="deviceParams.video_quality" placeholder="请选择">
                <el-option label="高清(1080P)" value="1080P"></el-option>
                <el-option label="标清(720P)" value="720P"></el-option>
                <el-option label="流畅(480P)" value="480P"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="录像保留天数">
              <el-input-number v-model="deviceParams.recording_retention_days" :min="7" :max="365"></el-input-number>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="日志保留天数">
              <el-input-number v-model="deviceParams.log_retention_days" :min="7" :max="365"></el-input-number>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="支持协议">
              <el-select v-model="deviceParams.supported_protocols" multiple placeholder="请选择支持的协议">
                <el-option label="GB28181" value="GB28181"></el-option>
                <el-option label="RTSP" value="RTSP"></el-option>
                <el-option label="ONVIF" value="ONVIF"></el-option>
                <el-option label="HTTP" value="HTTP"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="默认存储路径">
          <el-input v-model="deviceParams.default_storage_path" placeholder="请输入默认存储路径">
            <template #append>
              <el-button :icon="Folder" @click="selectStoragePath">选择</el-button>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Check" @click="saveDeviceParams" :loading="deviceParamsLoading">保存设备参数</el-button>
          <el-button :icon="Refresh" @click="resetDeviceParams">重置</el-button>
          <el-button type="warning" :icon="Setting" @click="applyToAllDevices" :loading="applyLoading">应用到所有设备</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 批量导入对话框 -->
    <el-dialog v-model="importDialogVisible" title="批量导入设备参数" width="500px">
      <el-upload
        class="upload-demo"
        drag
        :action="uploadUrl"
        :headers="uploadHeaders"
        :on-success="handleImportSuccess"
        :on-error="handleImportError"
        :before-upload="beforeImportUpload"
        accept=".xlsx,.xls,.json"
        :limit="1"
        :auto-upload="false"
        ref="uploadRef">
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="el-upload__text">
          将文件拖拽至此 或 <em>点击选择文件</em>
        </div>
        <template #tip>
          <div class="el-upload__tip">
            支持 Excel(.xlsx, .xls) 或 JSON(.json) 格式文件
        </div>
      </template>
      </el-upload>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="importDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitImport" :loading="importLoading">
            上传导入
          </el-button>
        </span>
          </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Setting, Check, Refresh, Timer, Warning, Edit, Upload, Download, 
  Folder, UploadFilled 
} from '@element-plus/icons-vue'
import { systemApi } from '@/api/system'

// 响应式数据
const configLoading = ref(false)
const saveLoading = ref(false)
const syncLoading = ref(false)
const ipChangeLoading = ref(false)
const deviceParamsLoading = ref(false)
const applyLoading = ref(false)
const importLoading = ref(false)
const importDialogVisible = ref(false)
const currentTime = ref('')
const timeTimer = ref(null)

// 表单引用
const configFormRef = ref()
const ipFormRef = ref()
const uploadRef = ref()

// 系统配置数据
const systemConfig = reactive({
  system_name: '',
  platform_ip: '',
  platform_port: 8080,
  time_sync_enabled: true,
  ntp_server: '',
  timezone: 'Asia/Shanghai',
  max_camera_count: 1000,
  current_camera_count: 0
})

// 时间同步表单
const timeSyncForm = reactive({
  sync_devices: true,
  ntp_server: ''
})

// IP修改表单
const ipChangeForm = reactive({
  new_ip: '',
  confirm: false,
  auto_restart: true
})

// 设备参数配置
const deviceParams = reactive({
  connection_timeout: 30,
  heartbeat_interval: 60,
  upload_frequency: 10,
  max_heartbeat_timeout: 300,
  video_quality: '1080P',
  recording_retention_days: 30,
  log_retention_days: 90,
  supported_protocols: ['GB28181', 'RTSP', 'ONVIF'],
  default_storage_path: '/var/lib/surveillance/recordings'
})

// 计算属性
const timeStatus = computed(() => {
  if (systemConfig.time_sync_enabled) {
    return { type: 'success', text: '同步已启用' }
  } else {
    return { type: 'warning', text: '同步已禁用' }
  }
})

const uploadUrl = computed(() => {
  return '/api/system/config/import-device-params'
})

const uploadHeaders = computed(() => {
  return {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
})

// 表单验证规则
const configRules = {
  system_name: [
    { required: true, message: '请输入系统名称', trigger: 'blur' }
  ],
  platform_port: [
    { required: true, message: '请输入平台端口', trigger: 'blur' },
    { type: 'number', min: 1000, max: 65535, message: '端口范围1000-65535', trigger: 'blur' }
  ],
  timezone: [
    { required: true, message: '请选择时区', trigger: 'change' }
  ],
  ntp_server: [
    { required: true, message: '请输入NTP服务器地址', trigger: 'blur' }
  ]
}

const ipRules = {
  new_ip: [
    { required: true, message: '请输入新的IP地址', trigger: 'blur' },
    { 
      pattern: /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/, 
      message: '请输入正确的IP地址格式', 
      trigger: 'blur' 
    }
  ]
}

// 生命周期
onMounted(() => {
  getBasicConfig()
  updateTime()
  timeTimer.value = setInterval(updateTime, 1000)
})

onUnmounted(() => {
  if (timeTimer.value) {
    clearInterval(timeTimer.value)
  }
})

// 方法
const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

const getBasicConfig = async () => {
  try {
    configLoading.value = true
    const response = await systemApi.getBasicConfig()
    if (response.data.success) {
      Object.assign(systemConfig, response.data.body)
      timeSyncForm.ntp_server = systemConfig.ntp_server
    }
  } catch (error) {
    ElMessage.error('获取系统配置失败：' + error.message)
  } finally {
    configLoading.value = false
  }
}

const refreshConfig = () => {
  getBasicConfig()
}

const saveBasicConfig = async () => {
  try {
    await configFormRef.value.validate()
    saveLoading.value = true
    
    const response = await systemApi.updateBasicConfig(systemConfig)
    if (response.data.success) {
      ElMessage.success('保存系统配置成功')
    }
  } catch (error) {
    if (error !== false) { // 验证失败时error为false
      ElMessage.error('保存系统配置失败：' + error.message)
    }
  } finally {
    saveLoading.value = false
  }
}

const syncTime = async () => {
  try {
    syncLoading.value = true
    const params = {
      sync_devices: timeSyncForm.sync_devices,
      ntp_server: timeSyncForm.ntp_server || systemConfig.ntp_server
    }
    
    const response = await systemApi.syncTime(params)
    if (response.data.success) {
      ElMessage.success('时间同步成功')
      updateTime()
    }
  } catch (error) {
    ElMessage.error('时间同步失败：' + error.message)
  } finally {
    syncLoading.value = false
  }
}

const changeIP = async () => {
  try {
    await ipFormRef.value.validate()
    
    await ElMessageBox.confirm(
      `确认要将平台IP从 ${systemConfig.platform_ip} 修改为 ${ipChangeForm.new_ip} 吗？\n\n修改后系统将在30秒后重启，请准备好通过新地址访问平台：\nhttp://${ipChangeForm.new_ip}:${systemConfig.platform_port}`,
      '确认修改IP地址',
      {
        confirmButtonText: '确认修改',
    cancelButtonText: '取消',
    type: 'warning',
        dangerouslyUseHTMLString: false
      }
    )
    
    ipChangeLoading.value = true
    const response = await systemApi.changeIP(ipChangeForm)
    
    if (response.data.success) {
      const { new_access_url } = response.data.body
      ElMessage.success(`IP修改成功！新访问地址：${new_access_url}`)
      
      // 10秒后跳转到新地址
  setTimeout(() => {
        window.location.href = new_access_url
      }, 10000)
      
      ElMessage.info('10秒后将自动跳转到新地址...')
    }
  } catch (error) {
    if (error !== 'cancel' && error !== false) {
      ElMessage.error('修改IP失败：' + error.message)
    }
  } finally {
    ipChangeLoading.value = false
  }
}

const saveDeviceParams = async () => {
  try {
    deviceParamsLoading.value = true
    const response = await systemApi.updateDeviceParams(deviceParams)
    if (response.data.success) {
      ElMessage.success('保存设备参数成功')
    }
  } catch (error) {
    ElMessage.error('保存设备参数失败：' + error.message)
  } finally {
    deviceParamsLoading.value = false
  }
}

const resetDeviceParams = () => {
  Object.assign(deviceParams, {
    connection_timeout: 30,
    heartbeat_interval: 60,
    upload_frequency: 10,
    max_heartbeat_timeout: 300,
    video_quality: '1080P',
    recording_retention_days: 30,
    log_retention_days: 90,
    supported_protocols: ['GB28181', 'RTSP', 'ONVIF'],
    default_storage_path: '/var/lib/surveillance/recordings'
  })
}

const applyToAllDevices = async () => {
  try {
    await ElMessageBox.confirm(
      '确认要将当前参数配置应用到所有设备吗？此操作将覆盖各设备的个性化配置。',
      '确认应用配置',
      {
        confirmButtonText: '确认应用',
    cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    applyLoading.value = true
    const response = await systemApi.applyDeviceParamsToAll(deviceParams)
    if (response.data.success) {
      ElMessage.success('参数配置已应用到所有设备')
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('应用配置失败：' + error.message)
    }
  } finally {
    applyLoading.value = false
  }
}

const handleBatchImport = () => {
  importDialogVisible.value = true
}

const exportDeviceParams = async () => {
  try {
    const response = await systemApi.exportDeviceParams()
    // 创建下载链接
    const blob = new Blob([response.data], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `设备参数配置_${new Date().toISOString().slice(0, 10)}.xlsx`
    link.click()
    window.URL.revokeObjectURL(url)
    ElMessage.success('设备参数导出成功')
  } catch (error) {
    ElMessage.error('导出设备参数失败：' + error.message)
  }
}

const selectStoragePath = () => {
  ElMessage.info('请在服务器端配置存储路径')
}

const beforeImportUpload = (file) => {
  const isValidFormat = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 
                        'application/vnd.ms-excel',
                        'application/json'].includes(file.type)
  if (!isValidFormat) {
    ElMessage.error('只支持 Excel 或 JSON 格式文件')
    return false
  }
  
  const isLt10M = file.size / 1024 / 1024 < 10
  if (!isLt10M) {
    ElMessage.error('上传文件大小不能超过 10MB')
    return false
  }
  
  return true
}

const submitImport = () => {
  importLoading.value = true
  uploadRef.value.submit()
}

const handleImportSuccess = (response) => {
  importLoading.value = false
  importDialogVisible.value = false
  if (response.success) {
    ElMessage.success('批量导入设备参数成功')
    // 刷新页面数据
    getBasicConfig()
      } else {
    ElMessage.error('导入失败：' + response.message)
  }
}

const handleImportError = (error) => {
  importLoading.value = false
  ElMessage.error('上传文件失败：' + error.message)
}

const resetForm = (formRef) => {
  if (formRef === 'configFormRef') {
    configFormRef.value?.resetFields()
  } else if (formRef === 'ipFormRef') {
    ipFormRef.value?.resetFields()
    ipChangeForm.confirm = false
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

.basic-management-container {
  padding: 0;
  max-width: 100%;
  box-sizing: border-box;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.config-form, .device-params-form {
  max-width: 100%;
}

.time-sync-content {
  padding: 10px 0;
}

.time-info {
  text-align: center;
}

.time-label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 5px;
}

.time-value {
  font-size: 16px;
  font-weight: bold;
  color: #303133;
}

.time-operations {
  text-align: center;
}

.ip-management-content {
  padding: 10px 0;
}

.mb-20 {
  margin-bottom: 20px;
}

.upload-demo {
  width: 100%;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

:deep(.el-card__header) {
  background-color: #f8f9fa;
  border-bottom: 1px solid #ebeef5;
}

:deep(.el-form-item__label) {
  font-weight: 500;
}

:deep(.el-alert) {
  margin-bottom: 20px;
}

:deep(.el-divider) {
  margin: 15px 0;
}
</style>